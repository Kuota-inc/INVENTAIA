package pe.kuota.api.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

enum class UserRole {
    BUYER,
    SUPPLIER,
    ADMIN
}

enum class SaleStatus {
    COMPROBADA,
    NO_COMPROBADA
}

enum class TransactionStatus {
    INITIATED,
    AWAITING_SUPPLIER_CONFIRMATION,
    CONFIRMED_SUCCESSFUL,
    PENDING_CONFIRMATION_TIMEOUT,
    CANCELLED
}

@Entity
@Table(name = "users", schema = "kuota_core")
class User(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false, unique = true, length = 20)
    var dniRuc: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var role: UserRole,

    @Column(nullable = false, unique = true, length = 20)
    var phone: String,

    @Column(nullable = false)
    var legalName: String,

    @Column(nullable = false)
    var createdAt: Instant = Instant.now()
)

@Entity
@Table(name = "user_security", schema = "kuota_core")
class UserSecurity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false, unique = true)
    val userId: UUID,

    @Column(nullable = false)
    var pinHash: String,

    @Column(nullable = false)
    var failedAttempts: Int = 0,

    @Column
    var lockedUntil: Instant? = null,

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
)

@Entity
@Table(name = "products", schema = "kuota_core")
class Product(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    val buyerId: UUID,

    @Column(nullable = false, length = 150)
    var name: String,

    @Column(nullable = false, precision = 12, scale = 2)
    var price: BigDecimal,

    @Column(nullable = false)
    var isActive: Boolean = true,

    @Column(nullable = false)
    val createdAt: Instant = Instant.now()
)

@Entity
@Table(name = "sales", schema = "kuota_core")
class Sale(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    val buyerId: UUID,

    @Column(nullable = false, precision = 12, scale = 2)
    val amount: BigDecimal,

    @Column(nullable = false, length = 50)
    val sourceApp: String, // "YAPE" | "PLIN"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: SaleStatus,

    @Column
    var matchedProductId: UUID? = null,

    @Column(length = 64)
    val rawChecksum: String? = null,

    @Column(nullable = false)
    val detectedAt: Instant,

    @Column(nullable = false)
    val createdAt: Instant = Instant.now()
)

@Entity
@Table(name = "transactions", schema = "kuota_core")
class Transaction(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false, unique = true, length = 32)
    val transactionCode: String,

    @Column(nullable = false)
    val buyerId: UUID,

    @Column(nullable = false)
    val supplierId: UUID,

    @Column(nullable = false, precision = 12, scale = 2)
    val totalAmount: BigDecimal,

    @Column(nullable = false, precision = 12, scale = 2)
    val downPaymentAmount: BigDecimal,

    @Column(nullable = false, precision = 12, scale = 2)
    val financedAmount: BigDecimal,

    @Column(nullable = false)
    val paymentTermDays: Int,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: TransactionStatus = TransactionStatus.AWAITING_SUPPLIER_CONFIRMATION,

    @Column(nullable = false)
    val confirmationTimeoutAt: Instant,

    @Column
    var confirmedAt: Instant? = null,

    @Column(nullable = false)
    val createdAt: Instant = Instant.now()
)

@Entity
@Table(name = "accounts_payable", schema = "kuota_core")
class AccountPayable(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false, unique = true)
    val transactionId: UUID,

    @Column(nullable = false)
    val buyerId: UUID,

    @Column(nullable = false, precision = 12, scale = 2)
    val totalFinanced: BigDecimal,

    @Column(nullable = false, precision = 12, scale = 2)
    var remainingBalance: BigDecimal,

    @Column(nullable = false, length = 30)
    var status: String = "ACTIVE", // ACTIVE, PAID

    @Column(nullable = false)
    val createdAt: Instant = Instant.now()
)
