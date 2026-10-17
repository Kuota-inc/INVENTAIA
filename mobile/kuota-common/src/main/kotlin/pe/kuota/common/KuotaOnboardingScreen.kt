package pe.kuota.common

import android.app.Activity
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.QrCode2
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

private const val BUYER = "BUYER"
private const val SUPPLIER = "SUPPLIER"
private val KuotaGreen = Color(0xFF145C48)
private val KuotaMint = Color(0xFFEAF5EF)
private val KuotaCanvas = Color(0xFFF7F8F5)
private val KuotaInk = Color(0xFF17231F)
private val KuotaMuted = Color(0xFF65736C)
private val KuotaBorder = Color(0xFFE1E7E2)

@Composable
fun KuotaOnboardingScreen(
    api: KuotaApi,
    hasSession: Boolean,
    onAuthenticated: (String) -> Unit,
    onCancel: (() -> Unit)? = null,
    fixedRole: String? = null
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var selectedRole by rememberSaveable {
        mutableStateOf(
            fixedRole ?: api.activeRole.takeIf { hasSession && (it == BUYER || it == SUPPLIER) } ?: BUYER
        )
    }
    var step by rememberSaveable { mutableIntStateOf(if (fixedRole == null) 0 else 1) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var identityDocumentType by rememberSaveable { mutableStateOf("RUC") }
    var identityDocumentNumber by rememberSaveable { mutableStateOf("") }
    var legalName by rememberSaveable { mutableStateOf("") }
    var address by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    var loadingProfile by remember { mutableStateOf(false) }

    LaunchedEffect(hasSession, selectedRole) {
        if (hasSession) {
            loadingProfile = true
            try {
                val profile = api.participantOrNull(selectedRole)
                identityDocumentType = profile?.optString("identity_document_type")
                    ?.takeIf { it == "DNI" || it == "RUC" } ?: "RUC"
                identityDocumentNumber = profile?.optString("identity_document_number").orEmpty()
                legalName = profile?.optString("legal_name").orEmpty()
                address = profile?.optString("address").orEmpty()
                phone = profile?.optString("phone").orEmpty()
            } catch (failure: Exception) {
                error = failure.message ?: "No se pudo cargar el perfil del negocio."
            } finally {
                loadingProfile = false
            }
        } else {
            identityDocumentNumber = ""
            legalName = ""
            address = ""
            phone = ""
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KuotaCanvas)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(0.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = RoundedCornerShape(13.dp),
                color = KuotaGreen
            ) {
                Text(
                    text = "K",
                    color = Color.White,
                    fontWeight = FontWeight.ExtraBold,
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp)
                )
            }
            Text(
                text = "KUOTA",
                color = KuotaInk,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.ExtraBold,
                modifier = Modifier.padding(start = 10.dp)
            )
            Spacer(Modifier.weight(1f))
            onCancel?.let {
                TextButton(onClick = it, enabled = !loading) {
                    Text("Cerrar", color = KuotaMuted)
                }
            }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 26.dp, bottom = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (step == 0) "TU NEGOCIO EN KUOTA" else "ASÍ FUNCIONA",
                color = KuotaGreen,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "${step + 1} DE 2",
                color = KuotaMuted,
                style = MaterialTheme.typography.labelMedium
            )
        }
        LinearProgressIndicator(
            progress = { if (step == 0) 0.5f else 1f },
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp),
            color = KuotaGreen,
            trackColor = KuotaBorder
        )

        if (step == 0) {
            Text(
                text = "Conecta tu negocio con nuevas oportunidades.",
                color = KuotaInk,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 26.dp)
            )
            Text(
                text = "Kuota reúne a negocios compradores y proveedores para organizar sus solicitudes, productos y ventas.",
                color = KuotaMuted,
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(top = 10.dp, bottom = 20.dp)
            )
            BusinessPreview(selectedRole = selectedRole)
            Text(
                text = "¿Cómo usarás Kuota?",
                color = KuotaInk,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 22.dp, bottom = 10.dp)
            )
            RoleCard(
                title = "Compro para mi negocio",
                description = "Explora proveedores y envía solicitudes de compra.",
                icon = Icons.Default.Inventory2,
                selected = selectedRole == BUYER,
                onClick = {
                    selectedRole = BUYER
                    error = null
                }
            )
            Spacer(Modifier.height(10.dp))
            RoleCard(
                title = "Vendo a otros negocios",
                description = "Comparte tu QR y responde solicitudes recibidas.",
                icon = Icons.Default.Storefront,
                selected = selectedRole == SUPPLIER,
                onClick = {
                    selectedRole = SUPPLIER
                    error = null
                }
            )
            Button(
                onClick = {
                    error = null
                    step = 1
                },
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 20.dp)
                    .height(56.dp)
            ) {
                Text("Continuar", fontWeight = FontWeight.SemiBold)
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    modifier = Modifier.padding(start = 8.dp)
                )
            }
        } else {
            if (fixedRole == null) {
                TextButton(
                    onClick = {
                        error = null
                        step = 0
                    },
                    enabled = !loading,
                    modifier = Modifier.padding(top = 12.dp)
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = KuotaGreen)
                    Text("Cambiar perfil", color = KuotaGreen, modifier = Modifier.padding(start = 6.dp))
                }
            }
            Text(
                text = if (selectedRole == BUYER) {
                    "Compra para tu negocio, con todo más claro."
                } else {
                    "Haz crecer tus ventas entre negocios."
                },
                color = KuotaInk,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 8.dp)
            )
            Text(
                text = if (selectedRole == BUYER) {
                    "Desde encontrar un proveedor hasta seguir tu solicitud, gestiona tus compras en un solo lugar."
                } else {
                    "Muestra lo que ofreces, recibe solicitudes y responde directamente desde Kuota."
                },
                color = KuotaMuted,
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(top = 10.dp, bottom = 18.dp)
            )
            if (selectedRole == BUYER) {
                FeatureRow(
                    icon = Icons.Default.QrCode2,
                    title = "Encuentra proveedores",
                    description = "Escanea su QR para conocer su oferta."
                )
                FeatureRow(
                    icon = Icons.Default.Inventory2,
                    title = "Envía solicitudes",
                    description = "Inicia una solicitud de compra desde la app."
                )
                FeatureRow(
                    icon = Icons.Default.CheckCircle,
                    title = "Sigue tu actividad",
                    description = "Consulta tus productos y solicitudes en Kuota."
                )
            } else {
                FeatureRow(
                    icon = Icons.Default.QrCode2,
                    title = "Comparte tu negocio",
                    description = "Muestra tu QR para que otros negocios te encuentren."
                )
                FeatureRow(
                    icon = Icons.Default.Storefront,
                    title = "Recibe solicitudes",
                    description = "Revisa las solicitudes que te envían."
                )
                FeatureRow(
                    icon = Icons.Default.CheckCircle,
                    title = "Responde desde Kuota",
                    description = "Consulta y gestiona tus solicitudes en la app."
                )
            }
            Text(
                text = "Datos de tu negocio",
                color = KuotaInk,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 22.dp, bottom = 4.dp)
            )
            Text(
                text = "Completa la información legal y de contacto para crear tu perfil ${if (selectedRole == BUYER) "comprador" else "proveedor"}.",
                color = KuotaMuted,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            OutlinedTextField(
                value = legalName,
                onValueChange = { legalName = it.take(255) },
                label = { Text("Razón social o nombre del negocio") },
                singleLine = true,
                enabled = !loadingProfile && !loading,
                modifier = Modifier.fillMaxWidth()
            )
            Text(
                "Documento de identidad",
                color = KuotaInk,
                style = MaterialTheme.typography.labelLarge,
                modifier = Modifier.padding(top = 12.dp, bottom = 2.dp)
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = identityDocumentType == "RUC",
                    onClick = {
                        identityDocumentType = "RUC"
                        identityDocumentNumber = identityDocumentNumber.take(11)
                    },
                    label = { Text("RUC") },
                    enabled = !loadingProfile && !loading
                )
                FilterChip(
                    selected = identityDocumentType == "DNI",
                    onClick = {
                        identityDocumentType = "DNI"
                        identityDocumentNumber = identityDocumentNumber.take(8)
                    },
                    label = { Text("DNI") },
                    enabled = !loadingProfile && !loading
                )
            }
            OutlinedTextField(
                value = identityDocumentNumber,
                onValueChange = {
                    identityDocumentNumber = it.filter { char -> char in '0'..'9' }
                        .take(if (identityDocumentType == "DNI") 8 else 11)
                },
                label = { Text("Número de $identityDocumentType") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                enabled = !loadingProfile && !loading,
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = address,
                onValueChange = { address = it.take(250) },
                label = { Text("Dirección del negocio") },
                enabled = !loadingProfile && !loading,
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
            )
            OutlinedTextField(
                value = phone,
                onValueChange = {
                    val digits = it.filter { char -> char in '0'..'9' }.take(15)
                    phone = (if (it.trimStart().startsWith("+")) "+" else "") + digits
                },
                label = { Text("Teléfono de contacto") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                singleLine = true,
                enabled = !loadingProfile && !loading,
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
            )
            Text(
                "Estos datos identifican y permiten contactar a tu negocio.",
                color = KuotaMuted,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(top = 6.dp)
            )
            Surface(
                color = KuotaMint,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 18.dp)
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = null,
                        tint = KuotaGreen,
                        modifier = Modifier
                            .padding(top = 2.dp)
                            .size(20.dp)
                    )
                    Text(
                        text = "Inicia sesión de forma segura con Google. Kuota organiza solicitudes; no aprueba créditos ni transfiere dinero.",
                        color = KuotaInk,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(start = 10.dp)
                    )
                }
            }
            error?.let {
                Text(
                    text = it,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 14.dp)
                )
            }
            Button(
                onClick = {
                    scope.launch {
                        loading = true
                        error = null
                        try {
                            val profile = KuotaBusinessProfile(
                                identityDocumentType = identityDocumentType,
                                identityDocumentNumber = identityDocumentNumber,
                                legalName = legalName.trim(),
                                address = address.trim(),
                                phone = phone.trim()
                            )
                            if (hasSession) {
                                api.completeProfile(selectedRole, profile)
                            } else {
                                val activity = context as? Activity
                                    ?: error("No se pudo abrir el inicio de sesión.")
                                api.signIn(activity, selectedRole, profile)
                            }
                            onAuthenticated(selectedRole)
                        } catch (failure: Exception) {
                            error = failure.message ?: "No se pudo continuar."
                        } finally {
                            loading = false
                        }
                    }
                },
                enabled = !loading && !loadingProfile &&
                    legalName.isNotBlank() && address.isNotBlank() &&
                    identityDocumentNumber.length == (if (identityDocumentType == "DNI") 8 else 11) &&
                    phone.count { char -> char in '0'..'9' } in 7..15,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 18.dp)
                    .height(56.dp)
            ) {
                if (loading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(22.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        text = if (hasSession) {
                            "Continuar como ${if (selectedRole == BUYER) "comprador" else "proveedor"}"
                        } else {
                            "Continuar con Google"
                        },
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        Text(
            text = "Tus datos de acceso se usan para proteger tu cuenta.",
            color = KuotaMuted,
            style = MaterialTheme.typography.labelSmall,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 18.dp, bottom = 12.dp)
        )
    }
}

@Composable
private fun BusinessPreview(selectedRole: String) {
    Surface(
        color = KuotaMint,
        shape = RoundedCornerShape(24.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                color = KuotaGreen,
                shape = RoundedCornerShape(18.dp)
            ) {
                Icon(
                    imageVector = if (selectedRole == BUYER) Icons.Default.Inventory2 else Icons.Default.Storefront,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.padding(16.dp).size(30.dp)
                )
            }
            Column(modifier = Modifier.padding(start = 16.dp)) {
                Text(
                    text = if (selectedRole == BUYER) "COMPRAS PARA NEGOCIOS" else "VENTAS A NEGOCIOS",
                    color = KuotaGreen,
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = if (selectedRole == BUYER) "Encuentra y solicita" else "Comparte y responde",
                    color = KuotaInk,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 4.dp)
                )
                Text(
                    text = "Todo empieza con una conexión.",
                    color = KuotaMuted,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 3.dp)
                )
            }
        }
    }
}

@Composable
private fun RoleCard(
    title: String,
    description: String,
    icon: ImageVector,
    selected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = if (selected) KuotaMint else Color.White),
        border = BorderStroke(
            width = if (selected) 2.dp else 1.dp,
            color = if (selected) KuotaGreen else KuotaBorder
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = RoundedCornerShape(13.dp),
                color = if (selected) KuotaGreen else KuotaCanvas
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (selected) Color.White else KuotaGreen,
                    modifier = Modifier.padding(12.dp).size(24.dp)
                )
            }
            Column(modifier = Modifier.weight(1f).padding(horizontal = 14.dp)) {
                Text(title, color = KuotaInk, fontWeight = FontWeight.SemiBold)
                Text(
                    description,
                    color = KuotaMuted,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
            if (selected) {
                Icon(Icons.Default.CheckCircle, contentDescription = "Seleccionado", tint = KuotaGreen)
            }
        }
    }
}

@Composable
private fun FeatureRow(
    icon: ImageVector,
    title: String,
    description: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 9.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            color = KuotaMint,
            shape = CircleShape
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = KuotaGreen,
                modifier = Modifier.padding(12.dp).size(22.dp)
            )
        }
        Column(modifier = Modifier.padding(start = 14.dp)) {
            Text(title, color = KuotaInk, fontWeight = FontWeight.SemiBold)
            Text(
                description,
                color = KuotaMuted,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(top = 2.dp)
            )
        }
    }
}
