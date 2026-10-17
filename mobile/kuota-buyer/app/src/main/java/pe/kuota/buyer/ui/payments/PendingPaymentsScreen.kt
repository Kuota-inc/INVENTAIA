package pe.kuota.buyer.ui.payments

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.kuota.buyer.ui.theme.*
import pe.kuota.buyer.BuildConfig
import pe.kuota.common.KuotaApi
import java.text.DecimalFormat

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PendingPaymentsScreen(
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val api = remember { KuotaApi.get(context, BuildConfig.KUOTA_API_BASE_URL) }
    var transactions by remember { mutableStateOf(emptyList<org.json.JSONObject>()) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        try {
            val rows = api.transactions().optJSONArray("transactions")
            transactions = (0 until (rows?.length() ?: 0))
                .mapNotNull { rows?.optJSONObject(it) }
        } catch (failure: Exception) {
            error = failure.message ?: "No se pudieron cargar las solicitudes."
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mis Solicitudes", fontWeight = FontWeight.Bold, color = KuotaTextPrimary) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Atrás", tint = KuotaTextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = KuotaBackground)
            )
        },
        containerColor = KuotaBackground
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            error?.let {
                item { Text(it, color = MaterialTheme.colorScheme.error) }
            }
            if (transactions.isEmpty() && error == null) {
                item { Text("No tienes solicitudes registradas.", color = KuotaTextSecondary) }
            }
            items(transactions, key = { it.optString("id") }) { item ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = item.optString("id").take(8),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = KuotaTextSecondary
                            )
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (item.optString("status") == "SUPPLIER_ACCEPTED") KuotaPurple.copy(alpha = 0.1f) else KuotaAmberUnverified.copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = if (item.optString("status") == "SUPPLIER_ACCEPTED") "Proveedor aceptó" else "Pendiente de respuesta",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (item.optString("status") == "SUPPLIER_ACCEPTED") KuotaPurple else KuotaAmberUnverified,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "Solicitud: S/ ${DecimalFormat("#,##0.00").format(item.optString("total_amount").toDoubleOrNull() ?: 0.0)}",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = KuotaTextPrimary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Plazo: ${item.optInt("payment_term_days")} días · sin desembolso ni deuda registrada",
                            fontSize = 12.sp,
                            color = KuotaTextSecondary
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(text = "Creada", fontSize = 11.sp, color = KuotaTextSecondary)
                                Text(text = item.optString("created_at").take(10), fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }
        }
    }
}
