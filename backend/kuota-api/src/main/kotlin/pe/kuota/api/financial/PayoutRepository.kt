package pe.kuota.api.financial

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface PayoutRepository : JpaRepository<PayoutOrder, UUID> {
    fun findByTransactionId(transactionId: UUID): Optional<PayoutOrder>
    fun findBySupplierIdOrderByCreatedAtDesc(supplierId: UUID): List<PayoutOrder>
}
