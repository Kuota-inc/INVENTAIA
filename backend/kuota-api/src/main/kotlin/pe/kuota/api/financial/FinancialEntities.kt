package pe.kuota.api.financial

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

enum class PayoutStatus {
    CREATED,
    QUEUED,
    PROCESSING,
    SETTLED,
    FAILED
}

/**
 * Entidad en el Enclave Financiero Aislado (Esquema: kuota_financial).
 * Cumple con el PRD Sección 8.1 (Aislamiento de servicios que manejan dinero).
 * La restricción de unicidad en `transactionId` garantiza idempotencia estricta,
 * evitando dobles desembolsos bajo cualquier circunstancia.
 */
@Entity
@Table(name = "payout_orders", schema = "kuota_financial")
class PayoutOrder(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false, unique = true)
    val transactionId: UUID,

    @Column(nullable = false)
    val supplierId: UUID,

    @Column(nullable = false, precision = 12, scale = 2)
    val amount: BigDecimal,

    @Column(nullable = false, length = 3)
    val currency: String = "PEN",

    @Column(nullable = false, length = 50)
    val destinationChannel: String, // 'INTERBANK_CCI', 'YAPE_BUSINESS', 'PLIN'

    @Column(nullable = false, columnDefinition = "TEXT")
    val destinationAccountEncrypted: String, // Cuenta bancaria cifrada

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: PayoutStatus = PayoutStatus.CREATED,

    @Column(length = 100)
    var externalBankTxId: String? = null,

    @Column
    var errorMessage: String? = null,

    @Column(nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column
    var settledAt: Instant? = null
)
