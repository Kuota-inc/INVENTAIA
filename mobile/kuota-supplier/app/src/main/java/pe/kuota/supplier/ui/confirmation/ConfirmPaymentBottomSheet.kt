package pe.kuota.supplier.ui.confirmation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.kuota.supplier.ui.home.PendingConfirmationNotification
import pe.kuota.supplier.ui.theme.*
import java.text.DecimalFormat

/**
 * Aceptación de una solicitud registrada. Esto no confirma un pago ni inicia
 * una transferencia de fondos.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConfirmPaymentBottomSheet(
    notification: PendingConfirmationNotification,
    onConfirm: (transactionId: String) -> Unit,
    onDismiss: () -> Unit
) {
    val currencyFormatter = DecimalFormat("#,##0.00")

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Color.White,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = SupplierGold.copy(alpha = 0.15f),
                modifier = Modifier.size(54.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = SupplierGold,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Aceptar solicitud",
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = SupplierTextPrimary
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "El comprador envió una solicitud de compra referencial.",
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                color = SupplierTextSecondary
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Detalle de la Operación
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Comprador: ${notification.buyerName}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = SupplierTextPrimary
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Monto solicitado:", fontSize = 13.sp, color = SupplierTextSecondary)
                        Text(text = "S/ ${currencyFormatter.format(notification.totalPurchaseAmount)}", fontWeight = FontWeight.SemiBold)
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Aceptar solo registra tu respuesta. No se efectúa pago ni desembolso.",
                        fontSize = 12.sp,
                        color = SupplierTextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { onConfirm(notification.transactionId) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SupplierEmerald)
            ) {
                Text(text = "Aceptar solicitud", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }

            Spacer(modifier = Modifier.height(8.dp))

            TextButton(
                onClick = onDismiss,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = "Cerrar", color = SupplierTextSecondary)
            }
        }
    }
}
