package pe.kuota.api.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import pe.kuota.api.model.Product
import pe.kuota.api.model.Sale
import pe.kuota.api.model.SaleStatus
import pe.kuota.api.repository.AccountPayableRepository
import pe.kuota.api.repository.ProductRepository
import pe.kuota.api.repository.SaleRepository
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

class KuotaBusinessRulesTest {

    private val productRepository = mock(ProductRepository::class.java)
    private val saleRepository = mock(SaleRepository::class.java)
    private val accountPayableRepository = mock(AccountPayableRepository::class.java)

    private val salesService = SalesVerificationService(productRepository, saleRepository)
    private val financingService = FinancingService(saleRepository, accountPayableRepository, 70.0)

    @Test
    fun `matching amount with product price marks sale as COMPROBADA`() {
        val buyerId = UUID.randomUUID()
        val matchingProduct = Product(
            id = UUID.randomUUID(),
            buyerId = buyerId,
            name = "Caja Aceite 12x1L",
            price = BigDecimal("96.00"),
            isActive = true
        )

        `when`(productRepository.findByBuyerIdAndPriceAndIsActiveTrue(buyerId, BigDecimal("96.00")))
            .thenReturn(listOf(matchingProduct))

        `when`(saleRepository.save(any(Sale::class.java))).thenAnswer { invocation ->
            invocation.getArgument(0) as Sale
        }

        val result = salesService.processIncomingSale(
            SyncNotificationCommand(
                buyerId = buyerId,
                amount = BigDecimal("96.00"),
                sourceApp = "YAPE",
                detectedAt = Instant.now(),
                checksum = "hash123"
            )
        )

        assertEquals(SaleStatus.COMPROBADA, result.status)
        assertEquals(matchingProduct.id, result.matchedProductId)
        assertEquals(BigDecimal("96.00"), result.amount)
    }

    @Test
    fun `unmatched amount marks sale as NO_COMPROBADA`() {
        val buyerId = UUID.randomUUID()

        `when`(productRepository.findByBuyerIdAndPriceAndIsActiveTrue(buyerId, BigDecimal("13.40")))
            .thenReturn(emptyList())

        `when`(saleRepository.save(any(Sale::class.java))).thenAnswer { invocation ->
            invocation.getArgument(0) as Sale
        }

        val result = salesService.processIncomingSale(
            SyncNotificationCommand(
                buyerId = buyerId,
                amount = BigDecimal("13.40"),
                sourceApp = "PLIN",
                detectedAt = Instant.now(),
                checksum = "hash456"
            )
        )

        assertEquals(SaleStatus.NO_COMPROBADA, result.status)
        assertNull(result.matchedProductId)
    }

    @Test
    fun `credit line calculates exactly 70 percent of verified sales minus debt`() {
        val buyerId = UUID.randomUUID()
        
        // Ventas comprobadas = 10,000 soles
        `when`(saleRepository.sumVerifiedSalesByBuyerId(buyerId))
            .thenReturn(BigDecimal("10000.00"))

        // Deuda activa actual = 2,500 soles
        `when`(accountPayableRepository.sumActiveDebtByBuyerId(buyerId))
            .thenReturn(BigDecimal("2500.00"))

        val summary = financingService.calculateCreditLine(buyerId)

        // Base: 10,000 -> 70% = 7,000. Disponible = 7,000 - 2,500 = 4,500.
        assertEquals(BigDecimal("10000.00"), summary.verifiedSalesBase)
        assertEquals(BigDecimal("7000.00"), summary.maxCreditLine)
        assertEquals(BigDecimal("2500.00"), summary.usedCredit)
        assertEquals(BigDecimal("4500.00"), summary.availableCredit)
    }
}
