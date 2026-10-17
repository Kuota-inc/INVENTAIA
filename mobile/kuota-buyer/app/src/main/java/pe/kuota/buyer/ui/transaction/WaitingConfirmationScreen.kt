package pe.kuota.buyer.ui.transaction

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import pe.kuota.buyer.BuildConfig
import pe.kuota.buyer.ui.theme.KuotaBackground
import pe.kuota.common.KuotaApi
import java.math.BigDecimal
import java.text.DecimalFormat
import java.time.Instant

private enum class RequestState { AWAITING, SUPPLIER_ACCEPTED, TIMEOUT }

@Composable
fun WaitingConfirmationScreen(
    transactionId: String,
    confirmationTimeoutAt: String,
    supplierName: String,
    totalAmount: BigDecimal,
    onFinishSuccess: () -> Unit,
    onNavigateToPendingPayments: () -> Unit
) {
    val context = LocalContext.current
    val api = remember { KuotaApi.get(context, BuildConfig.KUOTA_API_BASE_URL) }
    val currencyFormatter = remember { DecimalFormat("#,##0.00") }
    var state by remember(transactionId) { mutableStateOf(RequestState.AWAITING) }
    var remainingSeconds by remember(transactionId) { mutableIntStateOf(60) }
    var refreshError by remember(transactionId) { mutableStateOf<String?>(null) }

    LaunchedEffect(transactionId) {
        val timeout = runCatching { Instant.parse(confirmationTimeoutAt).epochSecond }
            .getOrDefault(Instant.now().epochSecond + 60)
        while (state == RequestState.AWAITING && Instant.now().epochSecond < timeout) {
            try {
                val records = api.transactions().optJSONArray("transactions")
                val transaction = (0 until (records?.length() ?: 0))
                    .mapNotNull { records?.optJSONObject(it) }
                    .firstOrNull { it.optString("id") == transactionId }
                if (transaction?.optString("status") == "SUPPLIER_ACCEPTED") {
                    state = RequestState.SUPPLIER_ACCEPTED
                    break
                }
                refreshError = null
            } catch (error: Exception) {
                refreshError = error.message ?: "No se pudo actualizar la solicitud."
            }
            remainingSeconds = (timeout - Instant.now().epochSecond).coerceAtLeast(0).toInt()
            delay(3_000)
        }
        if (state == RequestState.AWAITING) state = RequestState.TIMEOUT
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        when (state) {
            RequestState.AWAITING -> {
                CircularProgressIndicator()
                Spacer(Modifier.height(24.dp))
                Text("Esperando respuesta del proveedor", style = MaterialTheme.typography.headlineSmall)
                Text(
                    "Solicitud para $supplierName · S/ ${currencyFormatter.format(totalAmount)}",
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 12.dp)
                )
                Text("Tiempo de espera: ${remainingSeconds}s", modifier = Modifier.padding(top = 8.dp))
                refreshError?.let {
                    Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 8.dp))
                }
                Text(
                    "Es una solicitud referencial; Kuota no ha transferido dinero ni aprobado crédito.",
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 20.dp)
                )
            }
            RequestState.SUPPLIER_ACCEPTED -> {
                Text("El proveedor aceptó la solicitud", style = MaterialTheme.typography.headlineSmall)
                Text(
                    "La aceptación registra su respuesta, pero no confirma pagos ni realiza transferencias.",
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 12.dp)
                )
                Button(onClick = onFinishSuccess, modifier = Modifier.fillMaxWidth().padding(top = 24.dp)) {
                    Text("Volver al inicio")
                }
            }
            RequestState.TIMEOUT -> {
                Text("Solicitud pendiente", style = MaterialTheme.typography.headlineSmall)
                Text(
                    "El proveedor aún no respondió. La solicitud quedó registrada y puede consultarse en el historial.",
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 12.dp)
                )
                Button(
                    onClick = onNavigateToPendingPayments,
                    modifier = Modifier.fillMaxWidth().padding(top = 24.dp)
                ) {
                    Text("Ver solicitudes")
                }
                TextButton(onClick = onFinishSuccess) { Text("Volver al inicio") }
            }
        }
    }
}
