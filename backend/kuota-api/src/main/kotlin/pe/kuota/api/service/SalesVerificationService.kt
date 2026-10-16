package pe.kuota.api.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pe.kuota.api.model.Sale
import pe.kuota.api.model.SaleStatus
import pe.kuota.api.repository.ProductRepository
import pe.kuota.api.repository.SaleRepository
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

data class SyncNotificationCommand(
    val buyerId: UUID,
    val amount: BigDecimal,
    val sourceApp: String,
    val detectedAt: Instant,
    val checksum: String?
)

data class SaleVerificationResult(
    val saleId: UUID,
    val amount: BigDecimal,
    val status: SaleStatus,
    val matchedProductId: UUID?,
    val detectedAt: Instant
)

/**
 * Servicio encargado del matching de ventas según la Sección 5.3 del PRD:
 * Cruza el monto recibido vía Yape/Plin contra el catálogo de "Mis Productos" del comprador.
 * Si coincide con al menos un producto activo -> COMPROBADA.
 * Si no coincide -> NO_COMPROBADA.
 */
@Service
class SalesVerificationService(
    private val productRepository: ProductRepository,
    private val saleRepository: SaleRepository
) {

    @Transactional
    fun processIncomingSale(command: SyncNotificationCommand): SaleVerificationResult {
        // 1. Buscar coincidencias en 'Mis Productos' del comprador
        val matchingProducts = productRepository.findByBuyerIdAndPriceAndIsActiveTrue(
            buyerId = command.buyerId,
            price = command.amount
        )

        val (status, matchedProductId) = if (matchingProducts.isNotEmpty()) {
            SaleStatus.COMPROBADA to matchingProducts.first().id
        } else {
            SaleStatus.NO_COMPROBADA to null
        }

        // 2. Persistir la venta (sin ningún dato del pagador)
        val sale = Sale(
            buyerId = command.buyerId,
            amount = command.amount,
            sourceApp = command.sourceApp,
            status = status,
            matchedProductId = matchedProductId,
            rawChecksum = command.checksum,
            detectedAt = command.detectedAt
        )

        val savedSale = saleRepository.save(sale)

        return SaleVerificationResult(
            saleId = savedSale.id,
            amount = savedSale.amount,
            status = savedSale.status,
            matchedProductId = savedSale.matchedProductId,
            detectedAt = savedSale.detectedAt
        )
    }

    @Transactional(readOnly = true)
    fun getSalesHistory(buyerId: UUID): List<Sale> {
        return saleRepository.findByBuyerIdOrderByDetectedAtDesc(buyerId)
    }
}
