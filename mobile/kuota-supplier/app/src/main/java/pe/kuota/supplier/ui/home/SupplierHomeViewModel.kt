package pe.kuota.supplier.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.math.BigDecimal

data class SupplierSaleItem(
    val id: String,
    val buyerName: String,
    val totalAmount: BigDecimal,
    val downPaymentReceived: BigDecimal, // Monto recibido (cuota inicial)
    val kuotaPendingDisbursement: BigDecimal, // Monto pendiente (desembolso de Kuota)
    val formattedDate: String
)

data class PendingConfirmationNotification(
    val transactionId: String,
    val buyerName: String,
    val totalPurchaseAmount: BigDecimal,
    val downPaymentAmount: BigDecimal,
    val remainingDisbursement: BigDecimal
)

data class SupplierUiState(
    val supplierName: String = "Distribuidora Mayorista El Sol S.A.",
    val supplierRuc: String = "20100456789",
    val nextDisbursementTotal: BigDecimal = BigDecimal("4850.00"), // PRD 6.2: Tarjeta monto total a recibir
    val salesHistory: List<SupplierSaleItem> = listOf(
        SupplierSaleItem("1", "Distribuidora San Juan S.A.C.", BigDecimal("1500.00"), BigDecimal("300.00"), BigDecimal("1200.00"), "Hoy, 10:45 AM"),
        SupplierSaleItem("2", "Bodega Don Lucho", BigDecimal("850.00"), BigDecimal("170.00"), BigDecimal("680.00"), "Ayer, 04:20 PM"),
        SupplierSaleItem("3", "Comercializadora Santa Rosa", BigDecimal("3700.00"), BigDecimal("740.00"), BigDecimal("2960.00"), "14 Oct, 11:30 AM")
    ),
    val pendingConfirmation: PendingConfirmationNotification? = null,
    val qrPayload: String = "kuota://pay?v=1&supplierId=fa71b12b-31d2-430c-b2da-342f5ca3e956&name=Distribuidora+Mayorista+El+Sol"
)

class SupplierHomeViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(SupplierUiState())
    val uiState: StateFlow<SupplierUiState> = _uiState.asStateFlow()

    fun triggerSimulatedIncomingTransaction() {
        _uiState.value = _uiState.value.copy(
            pendingConfirmation = PendingConfirmationNotification(
                transactionId = "KT-20261015-992",
                buyerName = "Distribuidora San Juan S.A.C.",
                totalPurchaseAmount = BigDecimal("1500.00"),
                downPaymentAmount = BigDecimal("300.00"),
                remainingDisbursement = BigDecimal("1200.00")
            )
        )
    }

    fun confirmDownPayment(transactionId: String) {
        viewModelScope.launch {
            // En producción: POST /api/v1/transactions/{id}/confirm-received
            _uiState.value = _uiState.value.copy(pendingConfirmation = null)
        }
    }

    fun dismissConfirmation() {
        _uiState.value = _uiState.value.copy(pendingConfirmation = null)
    }
}
