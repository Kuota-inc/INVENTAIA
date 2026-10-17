package pe.kuota.supplier.ui

import android.os.Bundle
import android.widget.Toast
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.fragment.app.FragmentActivity
import kotlinx.coroutines.delay
import pe.kuota.common.KuotaApi
import pe.kuota.common.KuotaOnboardingScreen
import pe.kuota.common.security.KuotaBiometricAuth
import pe.kuota.common.security.KuotaPinStore
import pe.kuota.common.security.PinLockScreen
import pe.kuota.supplier.BuildConfig
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

class SupplierMainActivity : FragmentActivity() {
    private val viewModel: SupplierHomeViewModel by viewModels()
    private var lockOnStop: (() -> Unit)? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val api = KuotaApi.get(applicationContext, BuildConfig.KUOTA_API_BASE_URL)
        val pinStore = KuotaPinStore(applicationContext)

        setContent {
            SupplierKuotaTheme {
                Surface(Modifier.fillMaxSize(), color = SupplierBackground) {
                    Box(Modifier.fillMaxSize()) {
                        var currentDestination by remember { mutableStateOf(SupplierDestination.HOME) }
                        var authenticated by rememberSaveable { mutableStateOf(api.hasSession) }
                        var showOnboarding by rememberSaveable {
                            mutableStateOf(api.hasSession && !api.hasCompletedProfile("SUPPLIER"))
                        }
                        var pinConfigured by remember { mutableStateOf(pinStore.isConfigured) }
                        var unlocked by remember { mutableStateOf(!api.hasSession || !pinStore.isConfigured) }
                        var setupPin by rememberSaveable { mutableStateOf("") }
                        var pinError by remember { mutableStateOf<String?>(null) }
                        var pendingSecureAction by remember { mutableStateOf<(() -> Unit)?>(null) }
                        val state by viewModel.uiState.collectAsState()

                        lockOnStop = {
                            if (api.hasSession && pinStore.isConfigured) unlocked = false
                        }

                        if (!authenticated) {
                            KuotaOnboardingScreen(
                                api = api,
                                hasSession = false,
                                fixedRole = "SUPPLIER",
                                onAuthenticated = {
                                    authenticated = true
                                    showOnboarding = false
                                    viewModel.refresh()
                                }
                            )
                        } else if (!pinConfigured) {
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
                        } else {
                            if (unlocked || pendingSecureAction != null) {
                                if (showOnboarding) {
                                    KuotaOnboardingScreen(
                                        api = api,
                                        hasSession = true,
                                        fixedRole = "SUPPLIER",
                                        onAuthenticated = {
                                            showOnboarding = false
                                            viewModel.refresh()
                                        }
                                    )
                                } else {
                                    LaunchedEffect(Unit) {
                                        while (true) {
                                            viewModel.refresh()
                                            delay(5_000)
                                        }
                                    }
                                    when (currentDestination) {
                                        SupplierDestination.HOME -> SupplierHomeScreen(
                                            viewModel = viewModel,
                                            onOpenQrCode = {
                                                currentDestination = SupplierDestination.QR_DISPLAY
                                            }
                                        )
                                        SupplierDestination.QR_DISPLAY -> SupplierQrScreen(
                                            supplierName = state.supplierName,
                                            supplierRuc = state.supplierRuc,
                                            qrPayload = state.qrPayload,
                                            onNavigateBack = {
                                                currentDestination = SupplierDestination.HOME
                                            }
                                        )
                                    }

                                    state.pendingConfirmation?.let { notification ->
                                        ConfirmPaymentBottomSheet(
                                            notification = notification,
                                            onConfirm = { transactionId ->
                                                pendingSecureAction = {
                                                    viewModel.acceptRequest(transactionId)
                                                }
                                                pinError = null
                                                unlocked = false
                                            },
                                            onDismiss = viewModel::dismissConfirmation
                                        )
                                    }
                                }
                            }

                            if (!unlocked) {
                                PinLockScreen(
                                    title = if (pendingSecureAction == null) {
                                        "Desbloquea Kuota"
                                    } else {
                                        "Confirma tu identidad"
                                    },
                                    subtitle = "Ingresa tu PIN o usa biometría para continuar.",
                                    errorMessage = pinError,
                                    showBiometric = KuotaBiometricAuth.isAvailable(this@SupplierMainActivity),
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
                                            this@SupplierMainActivity,
                                            onSuccess = {
                                                unlocked = true
                                                pinError = null
                                                val action = pendingSecureAction
                                                pendingSecureAction = null
                                                action?.invoke()
                                            },
                                            onError = { message ->
                                                Toast.makeText(
                                                    this@SupplierMainActivity,
                                                    message,
                                                    Toast.LENGTH_LONG
                                                ).show()
                                            }
                                        )
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    override fun onStop() {
        lockOnStop?.invoke()
        super.onStop()
    }
}
