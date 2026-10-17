package pe.kuota.buyer.ui

import android.animation.ValueAnimator
import android.os.Bundle
import android.widget.Toast
import androidx.fragment.app.FragmentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.rememberCoroutineScope
import pe.kuota.buyer.BuildConfig
import pe.kuota.common.KuotaApi
import pe.kuota.common.KuotaOnboardingScreen
import pe.kuota.common.security.KuotaBiometricAuth
import pe.kuota.common.security.KuotaPinStore
import pe.kuota.common.security.PinLockScreen
import pe.kuota.buyer.service.BatteryOptimizationHelper
import pe.kuota.buyer.service.KuotaForegroundMonitoringService
import pe.kuota.buyer.ui.OnboardingPermissionsHelper
import pe.kuota.buyer.ui.checkout.FinancingCheckoutScreen
import pe.kuota.buyer.ui.home.HomeScreen
import pe.kuota.buyer.ui.home.HomeViewModel
import pe.kuota.buyer.ui.payments.PendingPaymentsScreen
import pe.kuota.buyer.ui.products.ProductsScreen
import pe.kuota.buyer.ui.scanner.QrScannerScreen
import pe.kuota.buyer.ui.scanner.ScannedSupplierInfo
import pe.kuota.buyer.ui.supplier.SupplierModeScreen
import pe.kuota.buyer.ui.theme.KuotaBackground
import pe.kuota.buyer.ui.theme.KuotaTheme
import pe.kuota.buyer.ui.transaction.WaitingConfirmationScreen
import java.math.BigDecimal
import java.util.UUID
import kotlinx.coroutines.launch

enum class KuotaDestination {
    HOME,
    QR_SCANNER,
    CHECKOUT,
    WAITING_CONFIRMATION,
    PRODUCTS,
    PENDING_PAYMENTS
}

class MainActivity : FragmentActivity() {

    private val homeViewModel: HomeViewModel by viewModels()
    private lateinit var kuotaApi: KuotaApi
    private lateinit var pinStore: KuotaPinStore
    private var batteryPromptRequested = false
    private var lockOnStop: (() -> Unit)? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        kuotaApi = KuotaApi.get(applicationContext, BuildConfig.KUOTA_API_BASE_URL)
        pinStore = KuotaPinStore(applicationContext)
        appUnlocked.value = !kuotaApi.hasSession || !pinStore.isConfigured
        if (kuotaApi.hasSession && kuotaApi.activeRole == "BUYER") startMonitoring()

        setContent {
            KuotaTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = KuotaBackground
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        var showStartupAnimation by rememberSaveable {
                            mutableStateOf(ValueAnimator.areAnimatorsEnabled())
                        }
                        var authenticated by rememberSaveable { mutableStateOf(kuotaApi.hasSession) }
                        var pinConfigured by remember { mutableStateOf(pinStore.isConfigured) }
                        var unlocked by appUnlocked
                        var setupPin by rememberSaveable { mutableStateOf("") }
                        var pinError by remember { mutableStateOf<String?>(null) }
                        var pendingSecureAction by remember { mutableStateOf<(() -> Unit)?>(null) }
                        var activeRole by rememberSaveable { mutableStateOf(kuotaApi.activeRole) }
                        var showOnboarding by rememberSaveable {
                            mutableStateOf(
                                kuotaApi.hasSession &&
                                    (kuotaApi.activeRole !in setOf("BUYER", "SUPPLIER") ||
                                        !kuotaApi.hasCompletedProfile(kuotaApi.activeRole))
                            )
                        }
                        var currentScreen by rememberSaveable { mutableStateOf(KuotaDestination.HOME) }
                        var scannedSupplier by remember { mutableStateOf<ScannedSupplierInfo?>(null) }
                        var transactionId by rememberSaveable { mutableStateOf("") }
                        var confirmationTimeoutAt by rememberSaveable { mutableStateOf("") }
                        var transactionAmount by rememberSaveable { mutableStateOf("0") }
                        val scope = rememberCoroutineScope()

                        lockOnStop = {
                            if (kuotaApi.hasSession && pinStore.isConfigured) unlocked = false
                        }
                        val requireAuthentication: (() -> Unit) -> Unit = { action ->
                            pendingSecureAction = action
                            pinError = null
                            unlocked = false
                        }

                        if (authenticated && !pinConfigured) {
                            PinLockScreen(
                                title = if (setupPin.isEmpty()) "Crea tu PIN Kuota" else "Confirma tu PIN",
                                subtitle = if (setupPin.isEmpty()) {
                                    "Elige 6 dígitos para proteger el acceso y confirmar solicitudes."
                                } else {
                                    "Ingresa nuevamente el PIN para confirmarlo."
                                },
                                errorMessage = pinError,
                                onPinEntered = { pin ->
                                    if (setupPin.isEmpty()) {
                                        setupPin = pin
                                        pinError = null
                                    } else if (setupPin != pin) {
                                        setupPin = ""
                                        pinError = "Los PIN no coinciden. Crea uno nuevo."
                                    } else {
                                        try {
                                            pinStore.setPin(pin)
                                            pinConfigured = true
                                            setupPin = ""
                                            pinError = null
                                            unlocked = true
                                        } catch (failure: Exception) {
                                            setupPin = ""
                                            pinError = failure.message ?: "No se pudo guardar el PIN."
                                        }
                                    }
                                }
                            )
                        } else if (authenticated && !unlocked && pendingSecureAction == null) {
                            PinLockScreen(
                                title = "Desbloquea Kuota",
                                subtitle = "Ingresa tu PIN de 6 dígitos",
                                errorMessage = pinError,
                                showBiometric = KuotaBiometricAuth.isAvailable(this@MainActivity),
                                onPinEntered = { pin ->
                                    try {
                                        if (pinStore.verifyPin(pin)) {
                                            unlocked = true
                                            pinError = null
                                        } else {
                                            val waitSeconds = pinStore.remainingLockoutSeconds()
                                            pinError = if (waitSeconds > 0) {
                                                "Demasiados intentos. Espera $waitSeconds segundos."
                                            } else {
                                                "PIN incorrecto."
                                            }
                                        }
                                    } catch (failure: Exception) {
                                        pinError = failure.message ?: "No se pudo verificar el PIN."
                                    }
                                },
                                onBiometricClick = {
                                    KuotaBiometricAuth.authenticate(
                                        this@MainActivity,
                                        onSuccess = {
                                            unlocked = true
                                            pinError = null
                                        },
                                        onError = { message ->
                                            Toast.makeText(this@MainActivity, message, Toast.LENGTH_LONG).show()
                                        }
                                    )
                                }
                            )
                        } else if (!authenticated || showOnboarding) {
                            KuotaOnboardingScreen(
                                api = kuotaApi,
                                hasSession = authenticated,
                                onCancel = if (
                                    authenticated && kuotaApi.hasCompletedProfile(activeRole)
                                ) ({ showOnboarding = false }) else null,
                                onAuthenticated = { role ->
                                    authenticated = true
                                    activeRole = role
                                    showOnboarding = false
                                    if (role == "BUYER") {
                                        startMonitoring()
                                        homeViewModel.refreshDashboard()
                                    } else {
                                        stopMonitoring()
                                    }
                                }
                            )
                        } else if (activeRole == "SUPPLIER") {
                            SupplierModeScreen(
                                api = kuotaApi,
                                onSwitchRole = { showOnboarding = true },
                                requireAuthentication = requireAuthentication
                            )
                        } else when (currentScreen) {
                        KuotaDestination.HOME -> {
                            HomeScreen(
                                viewModel = homeViewModel,
                                onNavigateToScanQr = { currentScreen = KuotaDestination.QR_SCANNER },
                                onNavigateToProducts = { currentScreen = KuotaDestination.PRODUCTS },
                                onNavigateToPendingPayments = { currentScreen = KuotaDestination.PENDING_PAYMENTS },
                                onSwitchRole = { showOnboarding = true }
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
                            val supplier = scannedSupplier
                            if (supplier == null) {
                                Text("Escanea el código QR del proveedor para continuar.")
                            } else {
                                FinancingCheckoutScreen(
                                    supplier = supplier,
                                    referenceEstimate = homeViewModel.uiState.collectAsState().value.referenceEstimate,
                                    onConfirmFinancing = { total, termDays ->
                                        requireAuthentication {
                                            scope.launch {
                                                try {
                                                    val result = kuotaApi.createTransaction(
                                                        supplierId = supplier.supplierId,
                                                        requestId = UUID.randomUUID().toString(),
                                                        amount = total.toPlainString(),
                                                        termDays = termDays
                                                    )
                                                    val transaction = result.optJSONObject("transaction")
                                                        ?: error("El servidor no devolvió la solicitud.")
                                                    transactionId = transaction.getString("id")
                                                    confirmationTimeoutAt = transaction.getString("confirmation_timeout_at")
                                                    transactionAmount = total.toPlainString()
                                                    currentScreen = KuotaDestination.WAITING_CONFIRMATION
                                                } catch (error: Exception) {
                                                    Toast.makeText(
                                                        this@MainActivity,
                                                        error.message ?: "No se pudo enviar la solicitud.",
                                                        Toast.LENGTH_LONG
                                                    ).show()
                                                }
                                            }
                                        }
                                    },
                                    onNavigateBack = { currentScreen = KuotaDestination.HOME }
                                )
                            }
                        }
                        KuotaDestination.WAITING_CONFIRMATION -> {
                            if (transactionId.isBlank() || confirmationTimeoutAt.isBlank()) {
                                currentScreen = KuotaDestination.HOME
                            } else {
                                WaitingConfirmationScreen(
                                    transactionId = transactionId,
                                    confirmationTimeoutAt = confirmationTimeoutAt,
                                    supplierName = scannedSupplier?.supplierName ?: "Proveedor Kuota",
                                    totalAmount = transactionAmount.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                                    onFinishSuccess = { currentScreen = KuotaDestination.HOME },
                                    onNavigateToPendingPayments = { currentScreen = KuotaDestination.PENDING_PAYMENTS }
                                )
                            }
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
                        if (authenticated && pinConfigured && !unlocked && pendingSecureAction != null) {
                            PinLockScreen(
                                title = "Confirma tu identidad",
                                subtitle = "Usa tu PIN o biometría para continuar.",
                                errorMessage = pinError,
                                showBiometric = KuotaBiometricAuth.isAvailable(this@MainActivity),
                                onPinEntered = { pin ->
                                    try {
                                        if (pinStore.verifyPin(pin)) {
                                            unlocked = true
                                            pinError = null
                                            val action = pendingSecureAction
                                            pendingSecureAction = null
                                            action?.invoke()
                                        } else {
                                            val waitSeconds = pinStore.remainingLockoutSeconds()
                                            pinError = if (waitSeconds > 0) {
                                                "Demasiados intentos. Espera $waitSeconds segundos."
                                            } else {
                                                "PIN incorrecto."
                                            }
                                        }
                                    } catch (failure: Exception) {
                                        pinError = failure.message ?: "No se pudo verificar el PIN."
                                    }
                                },
                                onBiometricClick = {
                                    KuotaBiometricAuth.authenticate(
                                        this@MainActivity,
                                        onSuccess = {
                                            unlocked = true
                                            pinError = null
                                            val action = pendingSecureAction
                                            pendingSecureAction = null
                                            action?.invoke()
                                        },
                                        onError = { message ->
                                            Toast.makeText(this@MainActivity, message, Toast.LENGTH_LONG).show()
                                        }
                                    )
                                }
                            )
                        }
                        if (showStartupAnimation) {
                            KuotaStartupAnimation(onFinished = { showStartupAnimation = false })
                        }
                    }
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (kuotaApiInitializedAndBuyer()) {
            val hasAccess = OnboardingPermissionsHelper.isNotificationListenerGranted(this)
            homeViewModel.updateNotificationAccess(hasAccess)
            if (
                hasAccess &&
                !BatteryOptimizationHelper.isBatteryOptimizationIgnored(this) &&
                !batteryPromptRequested
            ) {
                batteryPromptRequested = true
                BatteryOptimizationHelper.requestIgnoreBatteryOptimization(this)
            }
        }
    }

    override fun onStop() {
        lockOnStop?.invoke()
        super.onStop()
    }

    private fun startMonitoring() {
        KuotaForegroundMonitoringService.startService(this)
        homeViewModel.updateNotificationAccess(
            OnboardingPermissionsHelper.isNotificationListenerGranted(this)
        )
        if (!OnboardingPermissionsHelper.isNotificationListenerGranted(this)) {
            OnboardingPermissionsHelper.openNotificationListenerSettings(this)
        }
    }

    private fun stopMonitoring() {
        stopService(android.content.Intent(this, KuotaForegroundMonitoringService::class.java))
    }

    private fun kuotaApiInitializedAndBuyer(): Boolean =
        ::kuotaApi.isInitialized && kuotaApi.hasSession && kuotaApi.activeRole == "BUYER"

    companion object {
        private val appUnlocked = mutableStateOf(false)
    }
}
