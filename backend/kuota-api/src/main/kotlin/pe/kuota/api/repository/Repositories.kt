package pe.kuota.api.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import pe.kuota.api.model.*
import java.math.BigDecimal
import java.util.Optional
import java.util.UUID

@Repository
interface UserRepository : JpaRepository<User, UUID> {
    fun findByDniRuc(dniRuc: String): Optional<User>
}

@Repository
interface UserSecurityRepository : JpaRepository<UserSecurity, UUID> {
    fun findByUserId(userId: UUID): Optional<UserSecurity>
}

@Repository
interface ProductRepository : JpaRepository<Product, UUID> {
    fun findByBuyerIdAndIsActiveTrue(buyerId: UUID): List<Product>
    fun findByBuyerIdAndPriceAndIsActiveTrue(buyerId: UUID, price: BigDecimal): List<Product>
}

@Repository
interface SaleRepository : JpaRepository<Sale, UUID> {
    fun findByBuyerIdOrderByDetectedAtDesc(buyerId: UUID): List<Sale>
    
    @Query("""
        SELECT COALESCE(SUM(s.amount), 0) 
        FROM Sale s 
        WHERE s.buyerId = :buyerId AND s.status = pe.kuota.api.model.SaleStatus.COMPROBADA
    """)
    fun sumVerifiedSalesByBuyerId(buyerId: UUID): BigDecimal

    @Query("""
        SELECT COALESCE(SUM(s.amount), 0) 
        FROM Sale s 
        WHERE s.buyerId = :buyerId AND s.status = pe.kuota.api.model.SaleStatus.NO_COMPROBADA
    """)
    fun sumUnverifiedSalesByBuyerId(buyerId: UUID): BigDecimal
}

@Repository
interface TransactionRepository : JpaRepository<Transaction, UUID> {
    fun findByBuyerIdOrderByCreatedAtDesc(buyerId: UUID): List<Transaction>
    fun findBySupplierIdOrderByCreatedAtDesc(supplierId: UUID): List<Transaction>
}

@Repository
interface AccountPayableRepository : JpaRepository<AccountPayable, UUID> {
    fun findByBuyerIdAndStatus(buyerId: UUID, status: String): List<AccountPayable>

    @Query("""
        SELECT COALESCE(SUM(ap.remainingBalance), 0) 
        FROM AccountPayable ap 
        WHERE ap.buyerId = :buyerId AND ap.status = 'ACTIVE'
    """)
    fun sumActiveDebtByBuyerId(buyerId: UUID): BigDecimal
}
