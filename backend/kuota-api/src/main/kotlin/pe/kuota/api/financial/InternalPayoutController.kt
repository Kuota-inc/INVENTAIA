package pe.kuota.api.financial

import jakarta.validation.Valid
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.util.UUID

data class ExecutePayoutDto(
    @field:NotNull
    val transactionId: UUID,

    @field:NotNull
    val supplierId: UUID,

    @field:DecimalMin("0.01")
    val amount: BigDecimal,

    val currency: String = "PEN",
    val destinationChannel: String = "INTERBANK_CCI",
    val destinationAccount: String = "002-191-000000000000-00"
)

/**
 * Controlador Interno del Enclave Financiero (sin acceso público por Internet).
 * Comunica el transaction-service con el payout-service bajo mTLS interno (PRD 8.1).
 */
@RestController
@RequestMapping("/internal/v1/payouts")
class InternalPayoutController(
    private val payoutService: PayoutService
) {

    @PostMapping("/execute-down-payment")
    fun executeDownPayment(
        @Valid @RequestBody dto: ExecutePayoutDto
    ): ResponseEntity<PayoutResult> {
        val result = payoutService.executeDownPaymentPayout(
            ExecutePayoutCommand(
                transactionId = dto.transactionId,
                supplierId = dto.supplierId,
                amount = dto.amount,
                currency = dto.currency,
                destinationChannel = dto.destinationChannel,
                rawDestinationAccount = dto.destinationAccount
            )
        )
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(result)
    }
}
