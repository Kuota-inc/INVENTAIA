package pe.kuota.supplier.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import pe.kuota.supplier.ui.confirmation.ConfirmPaymentBottomSheet
import pe.kuota.supplier.ui.home.SupplierHomeScreen
import pe.kuota.supplier.ui.home.SupplierHomeViewModel
import pe.kuota.supplier.ui.qr.SupplierQrScreen
import pe.kuota.supplier.ui.theme.SupplierBackground
import pe.kuota.supplier.ui.theme.SupplierKuotaTheme

enum class SupplierDestination {
    HOME,
    QR_DISPLAY
}

class SupplierMainActivity : ComponentActivity() {

    private val viewModel: SupplierHomeViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            SupplierKuotaTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = SupplierBackground
                ) {
                    var currentDestination by remember { mutableStateOf(SupplierDestination.HOME) }
                    val state by viewModel.uiState.collectAsState()

                    when (currentDestination) {
                        SupplierDestination.HOME -> {
                            SupplierHomeScreen(
                                viewModel = viewModel,
                                onOpenQrCode = { currentDestination = SupplierDestination.QR_DISPLAY }
                            )
                        }
                        SupplierDestination.QR_DISPLAY -> {
                            SupplierQrScreen(
                                supplierName = state.supplierName,
                                supplierRuc = state.supplierRuc,
                                qrPayload = state.qrPayload,
                                onNavigateBack = { currentDestination = SupplierDestination.HOME }
                            )
                        }
                    }

                    // Modal de confirmación en tiempo real cuando llega una compra de comprador (PRD 6.3)
                    state.pendingConfirmation?.let { notification ->
                        ConfirmPaymentBottomSheet(
                            notification = notification,
                            onConfirm = { txId ->
                                viewModel.confirmDownPayment(txId)
                            },
                            onDismiss = {
                                viewModel.dismissConfirmation()
                            }
                        )
                    }
                }
            }
        }
    }
}
