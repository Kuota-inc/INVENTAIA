package pe.kuota.api.controller

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pe.kuota.api.model.AccountPayable
import pe.kuota.api.model.Sale
import pe.kuota.api.service.*
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

data class SyncNotificationDto(
    val amount: BigDecimal,
    val sourceApp: String,
    val detectedAt: Instant,
    val checksum: String?
)

data class SalesHistoryResponse(
    val summary: SalesSummaryDto,
    val sales: List<Sale>
)

data class SalesSummaryDto(
    val totalVerifiedAmount: BigDecimal,
    val totalUnverifiedAmount: BigDecimal
)

@RestController
@RequestMapping("/api/v1/sales")
class SalesController(
    private val salesVerificationService: SalesVerificationService,
    private val saleRepository: pe.kuota.api.repository.SaleRepository
) {

    /**
     * Endpoint consumido por el Foreground Service de la App Comprador.
     * Recibe exclusivamente el monto y origen de la notificación.
     */
    @PostMapping("/sync-notification")
    fun syncNotification(
        @RequestHeader("X-Buyer-Id") buyerId: UUID, // En producción extraído del JWT Bearer
        @RequestBody dto: SyncNotificationDto
    ): ResponseEntity<SaleVerificationResult> {
        val result = salesVerificationService.processIncomingSale(
            SyncNotificationCommand(
                buyerId = buyerId,
                amount = dto.amount,
                sourceApp = dto.sourceApp,
                detectedAt = dto.detectedAt,
                checksum = dto.checksum
            )
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(result)
    }

    /**
     * Historial de ventas para la pantalla Home estilo Yape del Comprador.
     */
    @GetMapping("/history")
    fun getSalesHistory(
        @RequestHeader("X-Buyer-Id") buyerId: UUID
    ): ResponseEntity<SalesHistoryResponse> {
        val sales = salesVerificationService.getSalesHistory(buyerId)
        val verifiedSum = saleRepository.sumVerifiedSalesByBuyerId(buyerId)
        val unverifiedSum = saleRepository.sumUnverifiedSalesByBuyerId(buyerId)

        return ResponseEntity.ok(
            SalesHistoryResponse(
                summary = SalesSummaryDto(
                    totalVerifiedAmount = verifiedSum,
                    totalUnverifiedAmount = unverifiedSum
                ),
                sales = sales
            )
        )
    }
}

@RestController
@RequestMapping("/api/v1/financing")
class FinancingController(
    private val financingService: FinancingService
) {

    /**
     * Retorna la línea de financiamiento disponible para la tarjeta de la Home (PRD 5.2).
     */
    @GetMapping("/credit-line")
    fun getCreditLine(
        @RequestHeader("X-Buyer-Id") buyerId: UUID
    ): ResponseEntity<CreditLineSummary> {
        val summary = financingService.calculateCreditLine(buyerId)
        return ResponseEntity.ok(summary)
    }

    /**
     * Retorna las cuentas por pagar activas ("Mis Pagos Pendientes" - PRD 5.5).
     */
    @GetMapping("/accounts-payable")
    fun getAccountsPayable(
        @RequestHeader("X-Buyer-Id") buyerId: UUID
    ): ResponseEntity<List<AccountPayable>> {
        val list = financingService.getAccountsPayable(buyerId)
        return ResponseEntity.ok(list)
    }
}
