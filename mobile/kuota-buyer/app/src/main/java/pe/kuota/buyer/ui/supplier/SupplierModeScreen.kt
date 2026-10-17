package pe.kuota.buyer.ui.supplier

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.QrCode2
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONObject
import pe.kuota.common.KuotaApi
import pe.kuota.supplier.ui.qr.SupplierQrScreen
import pe.kuota.supplier.ui.theme.SupplierBackground
import pe.kuota.supplier.ui.theme.SupplierEmerald
import pe.kuota.supplier.ui.theme.SupplierNavy
import pe.kuota.supplier.ui.theme.SupplierTextPrimary
import pe.kuota.supplier.ui.theme.SupplierTextSecondary
import java.text.DecimalFormat

private const val AWAITING = "AWAITING_SUPPLIER_ACCEPTANCE"
private const val ACCEPTED = "SUPPLIER_ACCEPTED"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SupplierModeScreen(
    api: KuotaApi,
    onSwitchRole: () -> Unit,
    requireAuthentication: (() -> Unit) -> Unit
) {
    var supplierName by remember { mutableStateOf("Mi negocio") }
    var qrPayload by remember { mutableStateOf("") }
    var requests by remember { mutableStateOf<List<JSONObject>>(emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }
    var showQr by rememberSaveable { mutableStateOf(false) }
    var dismissedRequestId by rememberSaveable { mutableStateOf("") }
    var acceptingRequest by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val formatter = remember { DecimalFormat("#,##0.00") }
    val pending = requests.firstOrNull {
        it.optString("status") == AWAITING && it.optString("id") != dismissedRequestId
    }

    LaunchedEffect(api) {
        while (true) {
            try {
                val participant = api.participant("SUPPLIER")
                val rows = api.transactions().optJSONArray("transactions")
                supplierName = participant.optString("display_name").ifBlank { "Mi negocio" }
                qrPayload = participant.optString("qrPayload")
                requests = (0 until (rows?.length() ?: 0)).mapNotNull { rows?.optJSONObject(it) }
                error = null
            } catch (failure: Exception) {
                error = failure.message ?: "No se pudieron actualizar las solicitudes."
            }
            delay(if (error == null) 5_000 else 10_000)
        }
    }

    if (showQr) {
        SupplierQrScreen(
            supplierName = supplierName,
            supplierRuc = "",
            qrPayload = qrPayload,
            onNavigateBack = { showQr = false }
        )
    } else {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Column {
                            Text(supplierName, fontWeight = FontWeight.Bold, color = SupplierTextPrimary)
                            Text("Perfil proveedor", fontSize = 12.sp, color = SupplierTextSecondary)
                        }
                    },
                    actions = {
                        TextButton(onClick = onSwitchRole) {
                            androidx.compose.material3.Icon(
                                Icons.Default.SwapHoriz,
                                contentDescription = null,
                                tint = SupplierNavy
                            )
                            Text("Cambiar perfil", color = SupplierNavy)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = SupplierBackground)
                )
            },
            containerColor = SupplierBackground
        ) { padding ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 18.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                item {
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = SupplierNavy)
                    ) {
                        Column(Modifier.fillMaxWidth().padding(20.dp)) {
                            Text("Tu negocio en Kuota", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                            Text(
                                "Comparte tu QR para recibir solicitudes de compra.",
                                color = Color.White.copy(alpha = 0.82f),
                                modifier = Modifier.padding(top = 6.dp)
                            )
                            Text(
                                "La app registra solicitudes, no pagos ni desembolsos.",
                                color = Color.White.copy(alpha = 0.68f),
                                fontSize = 12.sp,
                                modifier = Modifier.padding(top = 12.dp)
                            )
                        }
                    }
                }
                item {
                    Button(
                        onClick = { showQr = true },
                        enabled = qrPayload.isNotBlank(),
                        modifier = Modifier.fillMaxWidth().height(54.dp),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        androidx.compose.material3.Icon(Icons.Default.QrCode2, contentDescription = null)
                        Text("Mostrar mi código QR", modifier = Modifier.padding(start = 8.dp), fontWeight = FontWeight.SemiBold)
                    }
                }
                item {
                    Text("Solicitudes recibidas", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SupplierTextPrimary)
                }
                if (requests.isEmpty()) {
                    item {
                        Text(
                            error ?: "Aún no tienes solicitudes. Comparte tu QR para empezar.",
                            color = if (error == null) SupplierTextSecondary else MaterialTheme.colorScheme.error
                        )
                    }
                }
                items(requests, key = { it.optString("id") }) { request ->
                    val accepted = request.optString("status") == ACCEPTED
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Solicitud ${request.optString("id").take(8)}", fontWeight = FontWeight.SemiBold)
                                Text(
                                    request.optString("created_at").take(10),
                                    fontSize = 12.sp,
                                    color = SupplierTextSecondary,
                                    modifier = Modifier.padding(top = 3.dp)
                                )
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    "S/ ${formatter.format(request.optString("total_amount").toDoubleOrNull() ?: 0.0)}",
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    if (accepted) "Aceptada · sin pago" else "Pendiente",
                                    color = if (accepted) SupplierEmerald else SupplierTextSecondary,
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }
                item { Spacer(Modifier.height(8.dp)) }
            }
        }

        pending?.let { request ->
            AlertDialog(
                onDismissRequest = { dismissedRequestId = request.optString("id") },
                title = { Text("Nueva solicitud") },
                text = {
                    Text(
                        "El comprador solicita S/ ${formatter.format(request.optString("total_amount").toDoubleOrNull() ?: 0.0)}. " +
                            "Aceptar registra tu respuesta; no confirma el pago ni transfiere fondos."
                    )
                },
                confirmButton = {
                    TextButton(
                        enabled = !acceptingRequest,
                        onClick = {
                            requireAuthentication {
                                scope.launch {
                                    acceptingRequest = true
                                    try {
                                        api.acceptTransaction(request.optString("id"))
                                        requests = requests.map {
                                            if (it.optString("id") == request.optString("id")) {
                                                JSONObject(it.toString()).put("status", ACCEPTED)
                                            } else it
                                        }
                                        dismissedRequestId = request.optString("id")
                                        error = null
                                    } catch (failure: Exception) {
                                        error = failure.message ?: "No se pudo aceptar la solicitud."
                                    } finally {
                                        acceptingRequest = false
                                    }
                                }
                            }
                        }
                    ) { Text(if (acceptingRequest) "Guardando…" else "Aceptar solicitud") }
                },
                dismissButton = {
                    TextButton(onClick = { dismissedRequestId = request.optString("id") }) {
                        Text("Ahora no")
                    }
                }
            )
        }
    }
}
