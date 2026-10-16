package pe.kuota.api.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pe.kuota.api.model.AccountPayable
import pe.kuota.api.repository.AccountPayableRepository
import pe.kuota.api.repository.SaleRepository
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.UUID

data class CreditLineSummary(
    val verifiedSalesBase: BigDecimal,
    val referencePercentage: BigDecimal,
    val maxCreditLine: BigDecimal,
    val usedCredit: BigDecimal,
    val availableCredit: BigDecimal
)

/**
 * Servicio de financiamiento según la Sección 5.2 del PRD:
 * Calcula el cupo disponible usando el % referencial fijo (v1: 70%) sobre
 * las ventas comprobadas menos las deudas vigentes.
 */
@Service
class FinancingService(
    private val saleRepository: SaleRepository,
    private val accountPayableRepository: AccountPayableRepository,
    @Value("\${kuota.financing.reference-percentage:70.0}")
    private val referencePercentageValue: Double
) {

    @Transactional(readOnly = true)
    fun calculateCreditLine(buyerId: UUID): CreditLineSummary {
        val referencePercentage = BigDecimal.valueOf(referencePercentageValue)
        
        // 1. Sumar ventas 'Comprobadas'
        val verifiedSales = saleRepository.sumVerifiedSalesByBuyerId(buyerId)

        // 2. Calcular límite máximo: (Ventas Comprobadas * %) / 100
        val maxCreditLine = verifiedSales
            .multiply(referencePercentage)
            .divide(BigDecimal("100"), 2, RoundingMode.HALF_UP)

        // 3. Obtener deuda activa
        val usedCredit = accountPayableRepository.sumActiveDebtByBuyerId(buyerId)

        // 4. Disponible: max(0, maxCreditLine - usedCredit)
        val availableCredit = maxCreditLine.subtract(usedCredit).max(BigDecimal.ZERO)

        return CreditLineSummary(
            verifiedSalesBase = verifiedSales,
            referencePercentage = referencePercentage,
            maxCreditLine = maxCreditLine,
            usedCredit = usedCredit,
            availableCredit = availableCredit
        )
    }

    @Transactional(readOnly = true)
    fun getAccountsPayable(buyerId: UUID): List<AccountPayable> {
        return accountPayableRepository.findByBuyerIdAndStatus(buyerId, "ACTIVE")
    }
}
