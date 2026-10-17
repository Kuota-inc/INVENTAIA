package pe.kuota.buyer.ui.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import pe.kuota.buyer.BuildConfig
import pe.kuota.common.KuotaApi
import java.math.BigDecimal
import org.json.JSONObject

data class SaleItemUiState(
    val id: String,
    val amount: BigDecimal,
    val hasProductMatch: Boolean,
    val sourceWallet: String,
    val formattedTime: String
)

data class HomeUiState(
    val buyerName: String = "Kuota",
    val referenceEstimate: BigDecimal = BigDecimal.ZERO,
    val matchedNotificationAmount: BigDecimal = BigDecimal.ZERO,
    val referencePercentage: Int = 70,
    val hasNotificationAccess: Boolean = false,
    val recentSales: List<SaleItemUiState> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null
)

class HomeViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()
    private val api = KuotaApi.get(application, BuildConfig.KUOTA_API_BASE_URL)

    init {
        refreshDashboard()
    }

    fun refreshDashboard() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val participant = api.participant("BUYER")
                val sales = api.sales()
                val records = sales.optJSONArray("sales")
                val recentSales = (0 until (records?.length() ?: 0)).mapNotNull { index ->
                    val item = records?.optJSONObject(index) ?: return@mapNotNull null
                    SaleItemUiState(
                        id = item.optString("id"),
                        amount = item.optString("amount").toBigDecimalOrNull() ?: BigDecimal.ZERO,
                        hasProductMatch = item.optString("status") == "PRODUCT_MATCH" ||
                            item.optString("status") == "COMPROBADA",
                        sourceWallet = item.optString("source_app"),
                        formattedTime = item.optString("detected_at")
                    )
                }
                _uiState.value = HomeUiState(
                    buyerName = participant.optString("display_name", "Kuota"),
                    referenceEstimate = sales.optString(
                        "referenceEstimate",
                        sales.optString("availableCredit", "0")
                    ).toBigDecimalOrNull() ?: BigDecimal.ZERO,
                    matchedNotificationAmount = sales.optString(
                        "matchedNotificationAmount",
                        sales.optString("verifiedSalesBase", "0")
                    ).toBigDecimalOrNull() ?: BigDecimal.ZERO,
                    referencePercentage = sales.optInt("referenceCreditPercentage", 70),
                    hasNotificationAccess = _uiState.value.hasNotificationAccess,
                    recentSales = recentSales,
                    isLoading = false
                )
            } catch (error: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = error.message)
            }
        }
    }

    fun updateNotificationAccess(granted: Boolean) {
        _uiState.value = _uiState.value.copy(hasNotificationAccess = granted)
    }
}
