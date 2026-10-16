package pe.kuota.buyer.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import pe.kuota.buyer.service.BatteryOptimizationHelper
import pe.kuota.buyer.service.KuotaForegroundMonitoringService
import pe.kuota.buyer.ui.checkout.FinancingCheckoutScreen
import pe.kuota.buyer.ui.home.HomeScreen
import pe.kuota.buyer.ui.home.HomeViewModel
import pe.kuota.buyer.ui.payments.PendingPaymentsScreen
import pe.kuota.buyer.ui.products.ProductsScreen
import pe.kuota.buyer.ui.scanner.QrScannerScreen
import pe.kuota.buyer.ui.scanner.ScannedSupplierInfo
import pe.kuota.buyer.ui.theme.KuotaBackground
import pe.kuota.buyer.ui.theme.KuotaTheme
import pe.kuota.buyer.ui.transaction.WaitingConfirmationScreen
import java.math.BigDecimal

enum class KuotaDestination {
    HOME,
    QR_SCANNER,
    CHECKOUT,
    WAITING_CONFIRMATION,
    PRODUCTS,
    PENDING_PAYMENTS
}

data class CurrentTransactionDraft(
    val supplierName: String = "Distribuidora Mayorista El Sol S.A.",
    val totalAmount: BigDecimal = BigDecimal("1500.00"),
    val downPaymentAmount: BigDecimal = BigDecimal("300.00"),
    val financedAmount: BigDecimal = BigDecimal("1200.00"),
    val termDays: Int = 30
)

class MainActivity : ComponentActivity() {

    private val homeViewModel: HomeViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Iniciar el Foreground Service para persistencia del listener
        KuotaForegroundMonitoringService.startService(this)

        // 2. Verificar exención de batería
        if (!BatteryOptimizationHelper.isBatteryOptimizationIgnored(this)) {
            BatteryOptimizationHelper.requestIgnoreBatteryOptimization(this)
        }

        setContent {
            KuotaTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = KuotaBackground
                ) {
                    var currentScreen by remember { mutableStateOf(KuotaDestination.HOME) }
                    var scannedSupplier by remember {
                        mutableStateOf(
                            ScannedSupplierInfo(
                                supplierId = "fa71b12b-31d2-430c-b2da-342f5ca3e956",
                                supplierName = "Distribuidora Mayorista El Sol S.A.",
                                rawPayload = ""
                            )
                        )
                    }
                    var transactionDraft by remember { mutableStateOf(CurrentTransactionDraft()) }

                    when (currentScreen) {
                        KuotaDestination.HOME -> {
                            HomeScreen(
                                viewModel = homeViewModel,
                                onNavigateToScanQr = { currentScreen = KuotaDestination.QR_SCANNER },
                                onNavigateToProducts = { currentScreen = KuotaDestination.PRODUCTS },
                                onNavigateToPendingPayments = { currentScreen = KuotaDestination.PENDING_PAYMENTS }
                            )
                        }
                        KuotaDestination.QR_SCANNER -> {
                            QrScannerScreen(
                                onSupplierDetected = { supplier ->
                                    scannedSupplier = supplier
                                    currentScreen = KuotaDestination.CHECKOUT
                                },
                                onNavigateBack = { currentScreen = KuotaDestination.HOME }
                            )
                        }
                        KuotaDestination.CHECKOUT -> {
                            FinancingCheckoutScreen(
                                supplier = scannedSupplier,
                                availableCreditLimit = homeViewModel.uiState.collectAsState().value.availableCredit,
                                onConfirmFinancing = { total, downPayment, financed, termDays ->
                                    transactionDraft = CurrentTransactionDraft(
                                        supplierName = scannedSupplier.supplierName,
                                        totalAmount = total,
                                        downPaymentAmount = downPayment,
                                        financedAmount = financed,
                                        termDays = termDays
                                    )
                                    currentScreen = KuotaDestination.WAITING_CONFIRMATION
                                },
                                onNavigateBack = { currentScreen = KuotaDestination.HOME }
                            )
                        }
                        KuotaDestination.WAITING_CONFIRMATION -> {
                            WaitingConfirmationScreen(
                                transactionId = "KT-TEST-" + System.currentTimeMillis().toString().takeLast(4),
                                supplierName = transactionDraft.supplierName,
                                totalAmount = transactionDraft.totalAmount,
                                downPaymentAmount = transactionDraft.downPaymentAmount,
                                financedAmount = transactionDraft.financedAmount,
                                onFinishSuccess = { currentScreen = KuotaDestination.HOME },
                                onNavigateToPendingPayments = { currentScreen = KuotaDestination.PENDING_PAYMENTS }
                            )
                        }
                        KuotaDestination.PRODUCTS -> {
                            ProductsScreen(
                                onNavigateBack = { currentScreen = KuotaDestination.HOME }
                            )
                        }
                        KuotaDestination.PENDING_PAYMENTS -> {
                            PendingPaymentsScreen(
                                onNavigateBack = { currentScreen = KuotaDestination.HOME }
                            )
                        }
                    }
                }
            }
        }
    }
}
