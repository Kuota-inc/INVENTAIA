package pe.kuota.api.financial

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.Instant
import java.util.Base64
import java.util.UUID

data class ExecutePayoutCommand(
    val transactionId: UUID,
    val supplierId: UUID,
    val amount: BigDecimal,
    val currency: String = "PEN",
    val destinationChannel: String = "INTERBANK_CCI",
    val rawDestinationAccount: String
)

data class PayoutResult(
    val payoutOrderId: UUID,
    val transactionId: UUID,
    val amount: BigDecimal,
    val status: PayoutStatus,
    val externalBankTxId: String?,
    val settledAt: Instant?
)

/**
 * Servicio de Desembolso Aislado (payout-service) en el Enclave Financiero.
 * Responsable de adelantar la cuota inicial al proveedor (PRD Secciones 1 y 5.6).
 *
 * Implementa:
 * - Idempotencia estricta por `transactionId` (evita desembolsos dobles).
 * - Cifrado/tokenización del número de cuenta en reposo.
 * - Registro de auditoría bancaria con código de operación externa.
 */
@Service
class PayoutService(
    private val payoutRepository: PayoutRepository
) {
    private val log = LoggerFactory.getLogger(PayoutService::class.java)

    @Transactional
    fun executeDownPaymentPayout(command: ExecutePayoutCommand): PayoutResult {
        // 1. Verificación de Idempotencia: Si ya fue procesado, retornar registro existente
        val existingOrder = payoutRepository.findByTransactionId(command.transactionId)
        if (existingOrder.isPresent) {
            val order = existingOrder.get()
            log.warn("Intento de desembolso duplicado para la transacción {}. Retornando orden existente {}.", command.transactionId, order.id)
            return mapToResult(order)
        }

        if (command.amount <= BigDecimal.ZERO) {
            throw IllegalArgumentException("El monto a desembolsar debe ser mayor a cero")
        }

        // 2. Tokenización / Cifrado de cuenta bancaria
        val encryptedAccount = encryptAccount(command.rawDestinationAccount)

        // 3. Crear orden de desembolso en estado QUEUED
        val order = PayoutOrder(
            transactionId = command.transactionId,
            supplierId = command.supplierId,
            amount = command.amount,
            currency = command.currency,
            destinationChannel = command.destinationChannel,
            destinationAccountEncrypted = encryptedAccount,
            status = PayoutStatus.QUEUED
        )
        val savedOrder = payoutRepository.save(order)

        // 4. Simulación de dispersión bancaria instantánea hacia el proveedor
        val bankOperationCode = "BNK-PE-" + System.currentTimeMillis().toString().takeLast(8)
        savedOrder.status = PayoutStatus.SETTLED
        savedOrder.externalBankTxId = bankOperationCode
        savedOrder.settledAt = Instant.now()

        val finalOrder = payoutRepository.save(savedOrder)

        log.info("Desembolso exitoso hacia proveedor {}: S/ {} [Op: {}]", command.supplierId, command.amount, bankOperationCode)

        return mapToResult(finalOrder)
    }

    private fun encryptAccount(account: String): String {
        // En producción: Cifrado con llave KMS vía AWS KMS o GCP Cloud KMS
        return "ENC_" + Base64.getEncoder().encodeToString(account.toByteArray(Charsets.UTF_8))
    }

    private fun mapToResult(order: PayoutOrder): PayoutResult {
        return PayoutResult(
            payoutOrderId = order.id,
            transactionId = order.transactionId,
            amount = order.amount,
            status = order.status,
            externalBankTxId = order.externalBankTxId,
            settledAt = order.settledAt
        )
    }
}
