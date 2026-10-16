package pe.kuota.buyer.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.math.BigDecimal

data class SaleItemUiState(
    val id: String,
    val amount: BigDecimal,
    val isVerified: Boolean,
    val sourceWallet: String,
    val formattedTime: String
)

data class HomeUiState(
    val buyerName: String = "Distribuidora San Juan",
    val availableCredit: BigDecimal = BigDecimal("7000.00"),
    val verifiedSalesBase: BigDecimal = BigDecimal("10000.00"),
    val referencePercentage: Int = 70,
    val isListenerActive: Boolean = true,
    val recentSales: List<SaleItemUiState> = listOf(
        SaleItemUiState("1", BigDecimal("96.00"), true, "YAPE", "Hoy, 10:45 AM"),
        SaleItemUiState("2", BigDecimal("165.00"), true, "PLIN", "Hoy, 09:20 AM"),
        SaleItemUiState("3", BigDecimal("14.50"), false, "YAPE", "Ayer, 06:12 PM"),
        SaleItemUiState("4", BigDecimal("250.00"), true, "YAPE", "Ayer, 03:30 PM")
    ),
    val isLoading: Boolean = false
)

class HomeViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    fun refreshDashboard() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            // En producción: Invoca a FinancingService y SalesVerificationService vía API
            _uiState.value = _uiState.value.copy(isLoading = false)
        }
    }
}
