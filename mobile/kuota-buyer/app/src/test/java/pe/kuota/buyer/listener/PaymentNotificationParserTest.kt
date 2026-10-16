package pe.kuota.buyer.listener

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test
import java.math.BigDecimal

class PaymentNotificationParserTest {

    @Test
    fun `parse incoming Yape standard notification extracts amount correctly`() {
        val title = "¡Te yapearon!"
        val text = "¡Te yapearon! S/ 45.50 de Juan Carlos Pérez."
        
        val payment = PaymentNotificationParser.parse(
            packageName = KnownPaymentApps.PACKAGE_YAPE,
            title = title,
            text = text,
            postTimestamp = 1700000000000L
        )

        assertNotNull("El pago debería ser reconocido", payment)
        assertEquals(BigDecimal("45.50"), payment?.amount)
        assertEquals("YAPE", payment?.sourceWallet)
    }

    @Test
    fun `parse incoming Yape with thousands separator extracts amount correctly`() {
        val title = "Yape"
        val text = "Te yapearon S/ 1,850.00 por tu venta mayorista"

        val payment = PaymentNotificationParser.parse(
            packageName = KnownPaymentApps.PACKAGE_YAPE,
            title = title,
            text = text,
            postTimestamp = 1700000000000L
        )

        assertNotNull(payment)
        assertEquals(BigDecimal("1850.00"), payment?.amount)
        assertEquals("YAPE", payment?.sourceWallet)
    }

    @Test
    fun `parse incoming Plin notification extracts amount correctly`() {
        val title = "Plin Interbank"
        val text = "Recibiste S/ 120.00 con Plin de Distribuidora El Sol"

        val payment = PaymentNotificationParser.parse(
            packageName = KnownPaymentApps.PACKAGE_INTERBANK,
            title = title,
            text = text,
            postTimestamp = 1700000000000L
        )

        assertNotNull(payment)
        assertEquals(BigDecimal("120.00"), payment?.amount)
        assertEquals("PLIN", payment?.sourceWallet)
    }

    @Test
    fun `outgoing payments must be rejected to prevent fraud`() {
        // Simular notificación cuando el usuario compra/paga algo (NO venta recibida)
        val outgoingYape = PaymentNotificationParser.parse(
            packageName = KnownPaymentApps.PACKAGE_YAPE,
            title = "Yape exitoso",
            text = "Yapeaste S/ 35.00 a Bodega Central"
        )
        assertNull("Los pagos salientes de Yape deben ser rechazados", outgoingYape)

        val outgoingPlin = PaymentNotificationParser.parse(
            packageName = KnownPaymentApps.PACKAGE_BBVA,
            title = "Plin",
            text = "Transferiste S/ 90.00 a María Gómez"
        )
        assertNull("Las transferencias salientes de Plin deben ser rechazadas", outgoingPlin)
    }

    @Test
    fun `notifications without amount or unrecognized text must return null`() {
        val spamNotif = PaymentNotificationParser.parse(
            packageName = KnownPaymentApps.PACKAGE_YAPE,
            title = "Promoción Yape",
            text = "Aprovecha hoy 20% de descuento en comida rápida"
        )
        assertNull(spamNotif)
    }

    @Test
    fun `deduplication hash matches for notifications inside the same time bucket`() {
        val timestamp1 = 1700000000000L
        val timestamp2 = 1700000002000L // 2 segundos después (mismo bucket de 10s)

        val payment1 = PaymentNotificationParser.parse(
            packageName = KnownPaymentApps.PACKAGE_YAPE,
            title = "¡Te yapearon!",
            text = "S/ 50.00",
            postTimestamp = timestamp1
        )

        val payment2 = PaymentNotificationParser.parse(
            packageName = KnownPaymentApps.PACKAGE_YAPE,
            title = "¡Te yapearon!",
            text = "S/ 50.00",
            postTimestamp = timestamp2
        )

        assertNotNull(payment1)
        assertNotNull(payment2)
        assertEquals(payment1?.deduplicationHash, payment2?.deduplicationHash)
    }
}
