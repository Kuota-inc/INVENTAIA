package pe.kuota.buyer.ui.payments

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.kuota.buyer.ui.theme.*
import java.math.BigDecimal
import java.text.DecimalFormat

data class PendingPaymentItem(
    val id: String,
    val transactionCode: String,
    val supplierName: String,
    val totalFinanced: BigDecimal,
    val remainingBalance: BigDecimal,
    val percentageRemaining: Int, // e.g. 50%
    val status: String // "ACTIVE" | "PENDING_CONFIRMATION"
)

/**
 * Pantalla 'Mis Pagos Pendientes' (PRD Sección 5.5):
 * Lista de compras financiadas activas mostrando el % restante por pagar y el monto adeudado.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PendingPaymentsScreen(
    onNavigateBack: () -> Unit
) {
    val samplePayments = listOf(
        PendingPaymentItem(
            id = "1",
            transactionCode = "KT-884210",
            supplierName = "Distribuidora Mayorista El Sol",
            totalFinanced = BigDecimal("2400.00"),
            remainingBalance = BigDecimal("1200.00"),
            percentageRemaining = 50,
            status = "ACTIVE"
        ),
        PendingPaymentItem(
            id = "2",
            transactionCode = "KT-993102",
            supplierName = "Molitalia Distribución",
            totalFinanced = BigDecimal("1800.00"),
            remainingBalance = BigDecimal("1800.00"),
            percentageRemaining = 100,
            status = "PENDING_CONFIRMATION" // El caso que viene del timeout de 60s
        )
    )

    val currencyFormatter = DecimalFormat("#,##0.00")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mis Pagos Pendientes", fontWeight = FontWeight.Bold, color = KuotaTextPrimary) },
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
            items(samplePayments) { item ->
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
                                text = item.transactionCode,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = KuotaTextSecondary
                            )
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (item.status == "ACTIVE") KuotaPurple.copy(alpha = 0.1f) else KuotaAmberUnverified.copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = if (item.status == "ACTIVE") "${item.percentageRemaining}% pendiente" else "Pendiente confirmación",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (item.status == "ACTIVE") KuotaPurple else KuotaAmberUnverified,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = item.supplierName,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = KuotaTextPrimary
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // Barra de progreso del pago
                        LinearProgressIndicator(
                            progress = { (100 - item.percentageRemaining) / 100f },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp),
                            color = KuotaTurquoise,
                            trackColor = Color(0xFFE2E8F0)
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(text = "Total financiado", fontSize = 11.sp, color = KuotaTextSecondary)
                                Text(text = "S/ ${currencyFormatter.format(item.totalFinanced)}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(text = "Saldo restante", fontSize = 11.sp, color = KuotaTextSecondary)
                                Text(
                                    text = "S/ ${currencyFormatter.format(item.remainingBalance)}",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = KuotaPurple
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
