package pe.kuota.api.controller

import jakarta.validation.Valid
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pe.kuota.api.model.Transaction
import pe.kuota.api.service.InitiateTransactionCommand
import pe.kuota.api.service.TransactionResponse
import pe.kuota.api.service.TransactionService
import java.math.BigDecimal
import java.util.UUID

data class InitiateTransactionDto(
    @field:NotNull
    val supplierId: UUID,

    @field:DecimalMin("0.01")
    val totalAmount: BigDecimal,

    @field:DecimalMin("0.00")
    val downPaymentAmount: BigDecimal,

    @field:DecimalMin("0.01")
    val financedAmount: BigDecimal,

    val paymentTermDays: Int = 30
)

data class ConfirmTransactionDto(
    val confirmed: Boolean
)

@RestController
@RequestMapping("/api/v1/transactions")
class TransactionController(
    private val transactionService: TransactionService
) {

    /**
     * Inicia el financiamiento vía QR (PRD Sección 5.6).
     * Dispara el payout de la cuota inicial y arranca el timer de 60 segundos.
     */
    @PostMapping("/initiate")
    fun initiate(
        @RequestHeader("X-Buyer-Id") buyerId: UUID,
        @Valid @RequestBody dto: InitiateTransactionDto
    ): ResponseEntity<TransactionResponse> {
        val response = transactionService.initiateTransaction(
            InitiateTransactionCommand(
                buyerId = buyerId,
                supplierId = dto.supplierId,
                totalAmount = dto.totalAmount,
                downPaymentAmount = dto.downPaymentAmount,
                financedAmount = dto.financedAmount,
                paymentTermDays = dto.paymentTermDays
            )
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    /**
     * El proveedor confirma la recepción de la cuota inicial (PRD Sección 6.3).
     * Desbloquea la transacción del comprador vía Redis y SSE.
     */
    @PostMapping("/{id}/confirm-received")
    fun confirmReceived(
        @PathVariable id: UUID,
        @RequestHeader("X-Supplier-Id") supplierId: UUID,
        @RequestBody dto: ConfirmTransactionDto
    ): ResponseEntity<Transaction> {
        if (!dto.confirmed) {
            return ResponseEntity.badRequest().build()
        }
        val tx = transactionService.confirmTransactionBySupplier(id, supplierId)
        return ResponseEntity.ok(tx)
    }
}
