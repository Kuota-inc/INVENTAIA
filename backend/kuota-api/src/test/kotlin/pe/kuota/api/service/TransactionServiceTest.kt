package pe.kuota.api.service

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.*
import org.springframework.data.redis.core.StringRedisTemplate
import pe.kuota.api.financial.PayoutResult
import pe.kuota.api.financial.PayoutService
import pe.kuota.api.financial.PayoutStatus
import pe.kuota.api.model.AccountPayable
import pe.kuota.api.model.Transaction
import pe.kuota.api.model.TransactionStatus
import pe.kuota.api.repository.AccountPayableRepository
import pe.kuota.api.repository.TransactionRepository
import java.math.BigDecimal
import java.time.Instant
import java.util.Optional
import java.util.UUID

class TransactionServiceTest {

    private val transactionRepository = mock(TransactionRepository::class.java)
    private val accountPayableRepository = mock(AccountPayableRepository::class.java)
    private val financingService = mock(FinancingService::class.java)
    private val payoutService = mock(PayoutService::class.java)
    private val redisTemplate = mock(StringRedisTemplate::class.java)

    private val transactionService = TransactionService(
        transactionRepository,
        accountPayableRepository,
        financingService,
        payoutService,
        redisTemplate,
        60L
    )

    @Test
    fun `initiate transaction triggers down payment payout and sets 60s timeout`() {
        val buyerId = UUID.randomUUID()
        val supplierId = UUID.randomUUID()

        // Cupo disponible de S/ 7,000.00
        `when`(financingService.calculateCreditLine(buyerId)).thenReturn(
            CreditLineSummary(
                verifiedSalesBase = BigDecimal("10000.00"),
                referencePercentage = BigDecimal("70.0"),
                maxCreditLine = BigDecimal("7000.00"),
                usedCredit = BigDecimal.ZERO,
                availableCredit = BigDecimal("7000.00")
            )
        )

        `when`(transactionRepository.save(any(Transaction::class.java))).thenAnswer { invocation ->
            invocation.getArgument(0) as Transaction
        }

        `when`(payoutService.executeDownPaymentPayout(any())).thenReturn(
            PayoutResult(
                payoutOrderId = UUID.randomUUID(),
                transactionId = UUID.randomUUID(),
                amount = BigDecimal("300.00"),
                status = PayoutStatus.SETTLED,
                externalBankTxId = "BNK-PE-12345678",
                settledAt = Instant.now()
            )
        )

        val command = InitiateTransactionCommand(
            buyerId = buyerId,
            supplierId = supplierId,
            totalAmount = BigDecimal("1500.00"),
            downPaymentAmount = BigDecimal("300.00"),
            financedAmount = BigDecimal("1200.00"),
            paymentTermDays = 30
        )

        val response = transactionService.initiateTransaction(command)

        assertEquals(TransactionStatus.AWAITING_SUPPLIER_CONFIRMATION, response.status)
        assertEquals(60L, response.remainingSeconds)
        assertTrue(response.transactionCode.startsWith("KT-"))

        // Verifica que se haya ejecutado el payout de la cuota inicial (PRD 5.6)
        verify(payoutService, times(1)).executeDownPaymentPayout(any())
    }

    @Test
    fun `initiate transaction exceeding available credit line throws IllegalArgumentException`() {
        val buyerId = UUID.randomUUID()
        val supplierId = UUID.randomUUID()

        // Cupo disponible de solo S/ 500.00
        `when`(financingService.calculateCreditLine(buyerId)).thenReturn(
            CreditLineSummary(
                verifiedSalesBase = BigDecimal("1000.00"),
                referencePercentage = BigDecimal("70.0"),
                maxCreditLine = BigDecimal("7000.00"),
                usedCredit = BigDecimal("6500.00"),
                availableCredit = BigDecimal("500.00")
            )
        )

        val command = InitiateTransactionCommand(
            buyerId = buyerId,
            supplierId = supplierId,
            totalAmount = BigDecimal("1500.00"),
            downPaymentAmount = BigDecimal("300.00"),
            financedAmount = BigDecimal("1200.00"), // Excede los S/ 500.00
            paymentTermDays = 30
        )

        assertThrows<IllegalArgumentException> {
            transactionService.initiateTransaction(command)
        }

        // Verifica que nunca se intente guardar ni desembolsar
        verify(transactionRepository, never()).save(any())
        verify(payoutService, never()).executeDownPaymentPayout(any())
    }

    @Test
    fun `supplier confirmation marks transaction as CONFIRMED_SUCCESSFUL and creates account payable`() {
        val txId = UUID.randomUUID()
        val buyerId = UUID.randomUUID()
        val supplierId = UUID.randomUUID()

        val existingTx = Transaction(
            id = txId,
            transactionCode = "KT-884210",
            buyerId = buyerId,
            supplierId = supplierId,
            totalAmount = BigDecimal("1500.00"),
            downPaymentAmount = BigDecimal("300.00"),
            financedAmount = BigDecimal("1200.00"),
            paymentTermDays = 30,
            status = TransactionStatus.AWAITING_SUPPLIER_CONFIRMATION,
            confirmationTimeoutAt = Instant.now().plusSeconds(60)
        )

        `when`(transactionRepository.findById(txId)).thenReturn(Optional.of(existingTx))
        `when`(transactionRepository.save(any(Transaction::class.java))).thenAnswer { it.getArgument(0) as Transaction }
        `when`(accountPayableRepository.save(any(AccountPayable::class.java))).thenAnswer { it.getArgument(0) as AccountPayable }

        val confirmedTx = transactionService.confirmTransactionBySupplier(txId, supplierId)

        assertEquals(TransactionStatus.CONFIRMED_SUCCESSFUL, confirmedTx.status)
        assertNotNull(confirmedTx.confirmedAt)

        // Verifica que se cree la Cuenta por Pagar para el comprador por el monto financiado (PRD 5.6)
        verify(accountPayableRepository, times(1)).save(argThat { ap ->
            ap.buyerId == buyerId && ap.totalFinanced == BigDecimal("1200.00") && ap.remainingBalance == BigDecimal("1200.00")
        })

        // Verifica que se publique el evento en Redis para el SSE de la app móvil
        verify(redisTemplate, times(1)).convertAndSend("tx_events:$txId", "CONFIRMED_SUCCESSFUL")
    }
}
