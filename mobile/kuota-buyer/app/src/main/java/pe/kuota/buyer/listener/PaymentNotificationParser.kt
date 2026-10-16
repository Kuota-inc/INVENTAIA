package pe.kuota.buyer.listener

import java.math.BigDecimal
import java.math.RoundingMode
import java.security.MessageDigest
import java.time.Instant
import java.util.regex.Pattern

/**
 * Motor de análisis sintáctico para notificaciones de pago entrante en Android.
 *
 * Soporta patrones de:
 * 1. Yape (BCP)
 * 2. Plin (Interbank, BBVA, Scotiabank)
 *
 * Filtra rigurosamente pagos salientes ("Yapeaste", "Enviaste") y extrae únicamente
 * el monto recibido, garantizando la privacidad de acuerdo al PRD v1.0.
 */
object PaymentNotificationParser {

    // Palabras clave que indican una salida de dinero (NO venta recibida)
    private val OUTGOING_KEYWORDS = listOf(
        "yapeaste",
        "enviaste",
        "transferiste",
        "pagaste",
        "compra realizada",
        "cargo a tu cuenta"
    )

    // Palabras clave requeridas para confirmar un pago entrante
    private val INCOMING_KEYWORDS = listOf(
        "te yapearon",
        "yapeó",
        "recibiste",
        "te transfirieron",
        "te enviaron",
        "abono recibido",
        "transferencia recibida"
    )

    // Regex para capturar montos en soles: S/ 150.00, S/. 25.50, S/1,200.00, S/ 90
    private val AMOUNT_PATTERN = Pattern.compile(
        """(?:S\/\.?|Soles|PEN)\s*([0-9]{1,3}(?:[,\.][0-9]{3})*(?:[,\.][0-9]{2})|[0-9]+(?:[,\.][0-9]{2})?)""",
        Pattern.CASE_INSENSITIVE
    )

    /**
     * Analiza el título y texto de una notificación para extraer el pago entrante.
     * Retorna null si no es un pago válido, si es saliente o si no coincide el paquete.
     */
    fun parse(
        packageName: String,
        title: String?,
        text: String?,
        postTimestamp: Long = System.currentTimeMillis()
    ): ParsedPayment? {
        val fullContent = listOfNotNull(title, text).joinToString(" ").trim()
        if (fullContent.isBlank()) return null

        val lowerContent = fullContent.lowercase()

        // 1. Descartar pagos salientes
        if (OUTGOING_KEYWORDS.any { lowerContent.contains(it) }) {
            return null
        }

        // 2. Verificar que sea un pago entrante
        val isIncoming = INCOMING_KEYWORDS.any { lowerContent.contains(it) }
        if (!isIncoming) {
            return null
        }

        // 3. Extraer el monto con Regex
        val matcher = AMOUNT_PATTERN.matcher(fullContent)
        if (!matcher.find()) {
            return null
        }

        val rawAmountString = matcher.group(1) ?: return null
        val cleanedAmount = cleanAmount(rawAmountString) ?: return null

        if (cleanedAmount <= BigDecimal.ZERO) {
            return null
        }

        val sourceWallet = KnownPaymentApps.identifySourceWallet(packageName)
        
        // Ventana de deduplicación de 10 segundos para notificaciones duplicadas del SO
        val timeBucket = postTimestamp / 10000 
        val dedupHash = calculateHash("$sourceWallet:$cleanedAmount:$timeBucket")

        return ParsedPayment(
            amount = cleanedAmount,
            sourceWallet = sourceWallet,
            detectedAt = Instant.ofEpochMilli(postTimestamp),
            deduplicationHash = dedupHash
        )
    }

    /**
     * Normaliza formatos numéricos con separadores de miles y decimales.
     * Ejemplos: "1,250.50" -> 1250.50 | "25.00" -> 25.00 | "80" -> 80.00 | "1.250,50" -> 1250.50
     */
    private fun cleanAmount(rawString: String): BigDecimal? {
        return try {
            var sanitized = rawString.trim()
            
            // Si tiene punto y coma, determinar cuál es el separador decimal
            if (sanitized.contains(",") && sanitized.contains(".")) {
                val lastDot = sanitized.lastIndexOf('.')
                val lastComma = sanitized.lastIndexOf(',')
                sanitized = if (lastComma > lastDot) {
                    // Formato europeo: 1.250,50 -> 1250.50
                    sanitized.replace(".", "").replace(",", ".")
                } else {
                    // Formato estándar: 1,250.50 -> 1250.50
                    sanitized.replace(",", "")
                }
            } else if (sanitized.contains(",")) {
                // Solo coma: "12,50" -> decimal, o "1,250" -> miles
                val parts = sanitized.split(",")
                sanitized = if (parts.size == 2 && parts[1].length == 2) {
                    sanitized.replace(",", ".")
                } else {
                    sanitized.replace(",", "")
                }
            }

            BigDecimal(sanitized).setScale(2, RoundingMode.HALF_UP)
        } catch (_: Exception) {
            null
        }
    }

    private fun calculateHash(input: String): String {
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray(Charsets.UTF_8))
        return bytes.joinToString("") { "%02x".format(it) }
    }
}
