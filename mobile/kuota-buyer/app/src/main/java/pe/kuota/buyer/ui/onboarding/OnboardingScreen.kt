package pe.kuota.buyer.ui.onboarding

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.kuota.buyer.service.BatteryOptimizationHelper
import pe.kuota.buyer.ui.OnboardingPermissionsHelper
import pe.kuota.buyer.ui.theme.*

/**
 * Pantalla de Onboarding guiado en 3 pasos (PRD Sección 5.1):
 * 1. Datos de Identidad (DNI/RUC, Razón Social, Dirección, Teléfono).
 * 2. Configuración obligatoria de PIN de seguridad de 6 dígitos.
 * 3. Habilitación de permisos obligatorios (NotificationListenerService y Batería).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OnboardingScreen(
    onOnboardingCompleted: () -> Unit
) {
    val context = LocalContext.current
    var currentStep by remember { mutableIntStateOf(1) }

    // Paso 1: Datos
    var dniRuc by remember { mutableStateOf("") }
    var legalName by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var step1Error by remember { mutableStateOf<String?>(null) }

    // Paso 2: PIN
    var pin by remember { mutableStateOf("") }
    var pinConfirm by remember { mutableStateOf("") }
    var pinError by remember { mutableStateOf<String?>(null) }

    // Paso 3: Permisos
    var isListenerGranted by remember { mutableStateOf(OnboardingPermissionsHelper.isNotificationListenerGranted(context)) }
    var isBatteryIgnored by remember { mutableStateOf(BatteryOptimizationHelper.isBatteryOptimizationIgnored(context)) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Registro Kuota — Paso $currentStep de 3",
                        fontWeight = FontWeight.Bold,
                        color = KuotaTextPrimary,
                        fontSize = 17.sp
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = KuotaBackground)
            )
        },
        containerColor = KuotaBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            when (currentStep) {
                1 -> {
                    // PASO 1: Datos de la Pyme
                    Text(
                        text = "Datos de tu Empresa",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = KuotaTextPrimary
                    )
                    Text(
                        text = "Ingresa los datos fiscales para habilitar tu financiamiento de inventario.",
                        fontSize = 13.sp,
                        color = KuotaTextSecondary
                    )

                    OutlinedTextField(
                        value = dniRuc,
                        onValueChange = { dniRuc = it },
                        label = { Text("DNI (8 dígitos) o RUC (11 dígitos)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )

                    OutlinedTextField(
                        value = legalName,
                        onValueChange = { legalName = it },
                        label = { Text("Nombre o Razón Social") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )

                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Dirección del Almacén / Local") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )

                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Número telefónico / WhatsApp") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )

                    step1Error?.let {
                        Text(text = it, color = Color.Red, fontSize = 12.sp)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = {
                            val isDni = dniRuc.length == 8 && dniRuc.all { it.isDigit() }
                            val isRuc = dniRuc.length == 11 && dniRuc.all { it.isDigit() }
                            if (!isDni && !isRuc) {
                                step1Error = "Ingrese un DNI (8 dígitos) o RUC (11 dígitos) válido"
                                return@Button
                            }
                            if (legalName.isBlank() || address.isBlank() || phone.isBlank()) {
                                step1Error = "Todos los campos son obligatorios"
                                return@Button
                            }
                            step1Error = null
                            currentStep = 2
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = KuotaPurple)
                    ) {
                        Text("Continuar a Seguridad", fontWeight = FontWeight.Bold)
                    }
                }

                2 -> {
                    // PASO 2: Configuración de PIN de 6 dígitos
                    Text(
                        text = "Crea tu PIN de Acceso",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = KuotaTextPrimary
                    )
                    Text(
                        text = "El PIN de 6 dígitos será requerido para abrir la app y confirmar operaciones de financiamiento.",
                        fontSize = 13.sp,
                        color = KuotaTextSecondary
                    )

                    OutlinedTextField(
                        value = pin,
                        onValueChange = { if (it.length <= 6 && it.all { c -> c.isDigit() }) pin = it },
                        label = { Text("Nuevo PIN (6 dígitos)") },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )

                    OutlinedTextField(
                        value = pinConfirm,
                        onValueChange = { if (it.length <= 6 && it.all { c -> c.isDigit() }) pinConfirm = it },
                        label = { Text("Confirma tu PIN (6 dígitos)") },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )

                    pinError?.let {
                        Text(text = it, color = Color.Red, fontSize = 12.sp)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = {
                            if (pin.length != 6) {
                                pinError = "El PIN debe tener exactamente 6 dígitos"
                                return@Button
                            }
                            if (pin != pinConfirm) {
                                pinError = "Los números de PIN no coinciden"
                                return@Button
                            }
                            pinError = null
                            currentStep = 3
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = KuotaPurple)
                    ) {
                        Text("Guardar PIN y Configurar Permisos", fontWeight = FontWeight.Bold)
                    }
                }

                3 -> {
                    // PASO 3: Permisos del Sistema (PRD 5.3 & 8.2)
                    Text(
                        text = "Permisos Obligatorios",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = KuotaTextPrimary
                    )
                    Text(
                        text = "Para calcular tu línea de financiamiento, Kuota debe verificar pasivamente los montos recibidos por Yape y Plin las 24 horas.",
                        fontSize = 13.sp,
                        color = KuotaTextSecondary
                    )

                    // Card 1: Acceso a Notificaciones
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = if (isListenerGranted) Icons.Default.CheckCircle else Icons.Default.NotificationsActive,
                                contentDescription = null,
                                tint = if (isListenerGranted) KuotaGreenVerified else KuotaPurple,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = "Escucha de Notificaciones", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(
                                    text = if (isListenerGranted) "Permiso concedido ✅" else "Requerido para detectar pagos Yape/Plin",
                                    fontSize = 12.sp,
                                    color = if (isListenerGranted) KuotaGreenVerified else KuotaTextSecondary
                                )
                            }
                            if (!isListenerGranted) {
                                Button(
                                    onClick = {
                                        OnboardingPermissionsHelper.openNotificationListenerSettings(context)
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = KuotaTurquoise, contentColor = Color.Black)
                                ) {
                                    Text("Activar", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }
                        }
                    }

                    // Card 2: Exención de Batería
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = if (isBatteryIgnored) Icons.Default.CheckCircle else Icons.Default.BatteryChargingFull,
                                contentDescription = null,
                                tint = if (isBatteryIgnored) KuotaGreenVerified else KuotaPurple,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = "Optimización de Batería", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(
                                    text = if (isBatteryIgnored) "Exención activa ✅" else "Evita que Android cierre el servicio",
                                    fontSize = 12.sp,
                                    color = if (isBatteryIgnored) KuotaGreenVerified else KuotaTextSecondary
                                )
                            }
                            if (!isBatteryIgnored) {
                                Button(
                                    onClick = {
                                        if (context is Activity) {
                                            BatteryOptimizationHelper.requestIgnoreBatteryOptimization(context)
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = KuotaTurquoise, contentColor = Color.Black)
                                ) {
                                    Text("Eximir", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }
                        }
                    }

                    // Actualizador de estado de permisos
                    LaunchedEffect(Unit) {
                        while (true) {
                            kotlinx.coroutines.delay(1000)
                            isListenerGranted = OnboardingPermissionsHelper.isNotificationListenerGranted(context)
                            isBatteryIgnored = BatteryOptimizationHelper.isBatteryOptimizationIgnored(context)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    val canFinish = isListenerGranted && isBatteryIgnored

                    Button(
                        onClick = onOnboardingCompleted,
                        enabled = canFinish,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = KuotaPurple)
                    ) {
                        Text(
                            text = if (canFinish) "Comenzar a Operar en Kuota" else "Otorga los permisos para operar",
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
