package pe.kuota.api.financial

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.*
import java.math.BigDecimal
import java.time.Instant
import java.util.Optional
import java.util.UUID

class PayoutServiceTest {

    private val payoutRepository = mock(PayoutRepository::class.java)
    private val payoutService = PayoutService(payoutRepository)

    @Test
    fun `execute down payment payout settles amount and generates external bank reference`() {
        val txId = UUID.randomUUID()
        val supplierId = UUID.randomUUID()

        `when`(payoutRepository.findByTransactionId(txId)).thenReturn(Optional.empty())
        `when`(payoutRepository.save(any(PayoutOrder::class.java))).thenAnswer { invocation ->
            invocation.getArgument(0) as PayoutOrder
        }

        val result = payoutService.executeDownPaymentPayout(
            ExecutePayoutCommand(
                transactionId = txId,
                supplierId = supplierId,
                amount = BigDecimal("300.00"),
                rawDestinationAccount = "002-191-123456789012-00"
            )
        )

        assertEquals(PayoutStatus.SETTLED, result.status)
        assertEquals(BigDecimal("300.00"), result.amount)
        assertNotNull(result.externalBankTxId)
        assertTrue(result.externalBankTxId!!.startsWith("BNK-PE-"))
        assertNotNull(result.settledAt)
    }

    @Test
    fun `duplicate payout request for same transactionId is idempotent and prevents double disbursement`() {
        val txId = UUID.randomUUID()
        val supplierId = UUID.randomUUID()

        val existingOrder = PayoutOrder(
            id = UUID.randomUUID(),
            transactionId = txId,
            supplierId = supplierId,
            amount = BigDecimal("300.00"),
            currency = "PEN",
            destinationChannel = "INTERBANK_CCI",
            destinationAccountEncrypted = "ENC_test",
            status = PayoutStatus.SETTLED,
            externalBankTxId = "BNK-PE-ALREADY-SETTLED",
            settledAt = Instant.now()
        )

        `when`(payoutRepository.findByTransactionId(txId)).thenReturn(Optional.of(existingOrder))

        val result = payoutService.executeDownPaymentPayout(
            ExecutePayoutCommand(
                transactionId = txId,
                supplierId = supplierId,
                amount = BigDecimal("300.00"),
                rawDestinationAccount = "002-191-123456789012-00"
            )
        )

        // Verifica que no se guarde una nueva orden y se devuelva la existente
        verify(payoutRepository, never()).save(any())
        assertEquals(existingOrder.id, result.payoutOrderId)
        assertEquals("BNK-PE-ALREADY-SETTLED", result.externalBankTxId)
    }

    @Test
    fun `payout with zero or negative amount throws IllegalArgumentException`() {
        val txId = UUID.randomUUID()
        val supplierId = UUID.randomUUID()

        `when`(payoutRepository.findByTransactionId(txId)).thenReturn(Optional.empty())

        assertThrows<IllegalArgumentException> {
            payoutService.executeDownPaymentPayout(
                ExecutePayoutCommand(
                    transactionId = txId,
                    supplierId = supplierId,
                    amount = BigDecimal("0.00"),
                    rawDestinationAccount = "002-191-000000000000-00"
                )
            )
        }
    }
}
