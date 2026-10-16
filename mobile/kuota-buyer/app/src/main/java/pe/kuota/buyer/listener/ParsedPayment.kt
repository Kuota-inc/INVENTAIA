package pe.kuota.buyer.listener

import java.math.BigDecimal
import java.time.Instant

/**
 * Modelo de datos de venta extraído de una notificación.
 *
 * CUMPLIMIENTO ESTRICTO PRD v1.0 (Sección 5.3):
 * "No se extrae ni almacena el nombre del pagador — el matching es únicamente por monto."
 * Este modelo garantiza por diseño la exclusión de cualquier dato de carácter personal (PII).
 */
data class ParsedPayment(
    val amount: BigDecimal,
    val sourceWallet: String, // "YAPE" | "PLIN"
    val detectedAt: Instant = Instant.now(),
    val deduplicationHash: String
)
