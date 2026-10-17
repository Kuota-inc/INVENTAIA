package pe.kuota.supplier.ui.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import pe.kuota.common.KuotaApi
import pe.kuota.supplier.BuildConfig
import java.math.BigDecimal
import org.json.JSONObject

data class PendingConfirmationNotification(
    val transactionId: String,
    val buyerName: String,
    val totalPurchaseAmount: BigDecimal
)

data class SupplierRequestItem(
    val id: String,
    val amount: BigDecimal,
    val status: String,
    val createdAt: String
)

data class SupplierUiState(
    val supplierName: String = "Kuota Proveedor",
    val supplierRuc: String = "",
    val requests: List<SupplierRequestItem> = emptyList(),
    val pendingConfirmation: PendingConfirmationNotification? = null,
    val qrPayload: String = "",
    val error: String? = null
)

class SupplierHomeViewModel(application: Application) : AndroidViewModel(application) {
    private val api = KuotaApi.get(application, BuildConfig.KUOTA_API_BASE_URL)
    private val _uiState = MutableStateFlow(SupplierUiState())
    val uiState: StateFlow<SupplierUiState> = _uiState.asStateFlow()
    private val dismissedRequests = mutableSetOf<String>()

    init {
        refresh()
    }

    fun refresh() {
        if (!api.hasSession) return
        viewModelScope.launch {
            try {
                val participant = api.participant("SUPPLIER")
                val rows = api.transactions().optJSONArray("transactions")
                val transactions = (0 until (rows?.length() ?: 0))
                    .mapNotNull { rows?.optJSONObject(it) }
                val pending = transactions.firstOrNull {
                        it.optString("status") == "AWAITING_SUPPLIER_ACCEPTANCE" &&
                            it.optString("id") !in dismissedRequests
                    }
                _uiState.value = SupplierUiState(
                    supplierName = participant.optString("display_name", "Proveedor Kuota"),
                    qrPayload = participant.optString("qrPayload"),
                    requests = transactions.map {
                        SupplierRequestItem(
                            id = it.optString("id"),
                            amount = it.optString("total_amount").toBigDecimalOrNull() ?: BigDecimal.ZERO,
                            status = it.optString("status"),
                            createdAt = it.optString("created_at")
                        )
                    },
                    pendingConfirmation = pending?.let(::toPendingRequest)
                )
            } catch (error: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "No se pudieron cargar las solicitudes."
                )
            }
        }
    }

    fun acceptRequest(transactionId: String) {
        viewModelScope.launch {
            try {
                api.acceptTransaction(transactionId)
                dismissedRequests.remove(transactionId)
                _uiState.value = _uiState.value.copy(pendingConfirmation = null, error = null)
                refresh()
            } catch (error: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "No se pudo aceptar la solicitud."
                )
            }
        }
    }

    fun dismissConfirmation() {
        _uiState.value.pendingConfirmation?.transactionId?.let(dismissedRequests::add)
        _uiState.value = _uiState.value.copy(pendingConfirmation = null)
    }

    private fun toPendingRequest(row: JSONObject) = PendingConfirmationNotification(
        transactionId = row.optString("id"),
        buyerName = "Comprador ${row.optString("buyer_id").take(8)}",
        totalPurchaseAmount = row.optString("total_amount").toBigDecimalOrNull() ?: BigDecimal.ZERO
    )
}
