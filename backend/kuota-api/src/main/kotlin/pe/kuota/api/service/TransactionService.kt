package pe.kuota.api.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pe.kuota.api.financial.ExecutePayoutCommand
import pe.kuota.api.financial.PayoutService
import pe.kuota.api.model.AccountPayable
import pe.kuota.api.model.Transaction
import pe.kuota.api.model.TransactionStatus
import pe.kuota.api.repository.AccountPayableRepository
import pe.kuota.api.repository.TransactionRepository
import java.math.BigDecimal
import java.time.Duration
import java.time.Instant
import java.util.UUID
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

data class InitiateTransactionCommand(
    val buyerId: UUID,
    val supplierId: UUID,
    val totalAmount: BigDecimal,
    val downPaymentAmount: BigDecimal,
    val financedAmount: BigDecimal,
    val paymentTermDays: Int
)

data class TransactionResponse(
    val transactionId: UUID,
    val transactionCode: String,
    val status: TransactionStatus,
    val timeoutExpiresAt: Instant,
    val remainingSeconds: Long
)

/**
 * Orquestador del flujo transaccional de factoring (PRD Secciones 5.6 y 7):
 * Maneja el estado de la compra financiada, la cuenta regresiva de 60 segundos
 * y la confirmación manual del proveedor.
 */
@Service
class TransactionService(
    private val transactionRepository: TransactionRepository,
    private val accountPayableRepository: AccountPayableRepository,
    private val financingService: FinancingService,
    private val payoutService: PayoutService,
    private val redisTemplate: StringRedisTemplate,
    @Value("\${kuota.transaction.confirmation-timeout-seconds:60}")
    private val timeoutSeconds: Long
) {

    private val timeoutScheduler = Executors.newScheduledThreadPool(2)

    @Transactional
    fun initiateTransaction(command: InitiateTransactionCommand): TransactionResponse {
        // 1. Validar cupo disponible del comprador
        val creditSummary = financingService.calculateCreditLine(command.buyerId)
        if (command.financedAmount > creditSummary.availableCredit) {
            throw IllegalArgumentException("El monto a financiar (S/ ${command.financedAmount}) excede el cupo disponible (S/ ${creditSummary.availableCredit})")
        }

        val now = Instant.now()
        val timeoutAt = now.plusSeconds(timeoutSeconds)
        val txCode = "KT-" + System.currentTimeMillis().toString().takeLast(8)

        // 2. Crear transacción en espera de confirmación
        val tx = Transaction(
            transactionCode = txCode,
            buyerId = command.buyerId,
            supplierId = command.supplierId,
            totalAmount = command.totalAmount,
            downPaymentAmount = command.downPaymentAmount,
            financedAmount = command.financedAmount,
            paymentTermDays = command.paymentTermDays,
            status = TransactionStatus.AWAITING_SUPPLIER_CONFIRMATION,
            confirmationTimeoutAt = timeoutAt
        )
        val savedTx = transactionRepository.save(tx)

        // 3. Disparar el payout de la cuota inicial hacia el proveedor (PRD 5.6)
        if (command.downPaymentAmount > BigDecimal.ZERO) {
            payoutService.executeDownPaymentPayout(
                ExecutePayoutCommand(
                    transactionId = savedTx.id,
                    supplierId = command.supplierId,
                    amount = command.downPaymentAmount,
                    rawDestinationAccount = "002-191-000000000000-00"
                )
            )
        }

        // 4. Programar verificación de timeout en Redis / Scheduler
        scheduleTimeoutCheck(savedTx.id, timeoutSeconds)

        return TransactionResponse(
            transactionId = savedTx.id,
            transactionCode = savedTx.transactionCode,
            status = savedTx.status,
            timeoutExpiresAt = timeoutAt,
            remainingSeconds = timeoutSeconds
        )
    }

    @Transactional
    fun confirmTransactionBySupplier(transactionId: UUID, supplierId: UUID): Transaction {
        val tx = transactionRepository.findById(transactionId)
            .orElseThrow { NoSuchElementException("Transacción no encontrada") }

        if (tx.supplierId != supplierId) {
            throw IllegalAccessException("No autorizado para confirmar esta transacción")
        }

        if (tx.status != TransactionStatus.AWAITING_SUPPLIER_CONFIRMATION && 
            tx.status != TransactionStatus.PENDING_CONFIRMATION_TIMEOUT) {
            return tx // Ya procesada
        }

        // Marcar como exitosa
        tx.status = TransactionStatus.CONFIRMED_SUCCESSFUL
        tx.confirmedAt = Instant.now()
        val updatedTx = transactionRepository.save(tx)

        // Crear Cuenta por Pagar para el comprador
        val accountPayable = AccountPayable(
            transactionId = updatedTx.id,
            buyerId = updatedTx.buyerId,
            totalFinanced = updatedTx.financedAmount,
            remainingBalance = updatedTx.financedAmount,
            status = "ACTIVE"
        )
        accountPayableRepository.save(accountPayable)

        // Publicar evento en Redis para el SSE de la app móvil
        publishStatusEvent(transactionId, TransactionStatus.CONFIRMED_SUCCESSFUL)

        return updatedTx
    }

    @Transactional
    fun handleTimeoutExpired(transactionId: UUID) {
        val tx = transactionRepository.findById(transactionId).orElse(null) ?: return
        if (tx.status == TransactionStatus.AWAITING_SUPPLIER_CONFIRMATION) {
            tx.status = TransactionStatus.PENDING_CONFIRMATION_TIMEOUT
            transactionRepository.save(tx)
            
            publishStatusEvent(transactionId, TransactionStatus.PENDING_CONFIRMATION_TIMEOUT)
        }
    }

    private fun scheduleTimeoutCheck(transactionId: UUID, delaySeconds: Long) {
        timeoutScheduler.schedule({
            handleTimeoutExpired(transactionId)
        }, delaySeconds, TimeUnit.SECONDS)
    }

    private fun publishStatusEvent(transactionId: UUID, status: TransactionStatus) {
        val channel = "tx_events:$transactionId"
        redisTemplate.convertAndSend(channel, status.name)
    }
}
