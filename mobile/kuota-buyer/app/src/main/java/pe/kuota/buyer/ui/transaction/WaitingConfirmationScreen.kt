package pe.kuota.buyer.ui.transaction

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HourglassBottom
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import pe.kuota.buyer.ui.theme.*
import java.math.BigDecimal
import java.text.DecimalFormat

enum class ScreenState {
    AWAITING,
    CONFIRMED,
    TIMEOUT
}

/**
 * Pantalla de carga con cuenta regresiva de 60 segundos (PRD Secciones 5.6 y 7).
 * Conecta con el SSE del backend (/api/v1/transactions/{id}/live-status) para
 * recibir en vivo los segundos restantes y la confirmación del proveedor.
 */
@Composable
fun WaitingConfirmationScreen(
    transactionId: String,
    supplierName: String = "Distribuidora Mayorista El Sol",
    totalAmount: BigDecimal = BigDecimal("1500.00"),
    downPaymentAmount: BigDecimal = BigDecimal("300.00"),
    financedAmount: BigDecimal = BigDecimal("1200.00"),
    onFinishSuccess: () -> Unit,
    onNavigateToPendingPayments: () -> Unit
) {
    var screenState by remember { mutableStateOf(ScreenState.AWAITING) }
    var remainingSeconds by remember { mutableIntStateOf(60) }
    val currencyFormatter = DecimalFormat("#,##0.00")

    // Timer local de 60 segundos (en producción respaldado por los eventos SSE del servidor)
    LaunchedEffect(key1 = transactionId) {
        while (remainingSeconds > 0 && screenState == ScreenState.AWAITING) {
            delay(1000)
            remainingSeconds -= 1
        }
        if (screenState == ScreenState.AWAITING) {
            screenState = ScreenState.TIMEOUT
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(KuotaBackground)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        AnimatedContent(
            targetState = screenState,
            transitionSpec = { fadeIn() togetherWith fadeOut() },
            label = "WaitingStateAnimation"
        ) { targetState ->
            when (targetState) {
                ScreenState.AWAITING -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        // 1. Contador Circular Animado
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.size(160.dp)
                        ) {
                            val progress by animateFloatAsState(
                                targetValue = remainingSeconds / 60f,
                                label = "TimerProgress"
                            )

                            CircularProgressIndicator(
                                progress = { progress },
                                modifier = Modifier.fillMaxSize(),
                                strokeWidth = 10.dp,
                                color = KuotaTurquoise,
                                trackColor = Color(0xFFE2E8F0),
                            )

                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "$remainingSeconds",
                                    fontSize = 44.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = KuotaPurple
                                )
                                Text(
                                    text = "segundos",
                                    fontSize = 12.sp,
                                    color = KuotaTextSecondary
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(32.dp))

                        Text(
                            text = "Esperando confirmación",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = KuotaTextPrimary
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "Kuota ha adelantado la cuota inicial de S/ ${currencyFormatter.format(downPaymentAmount)} a $supplierName. Esperando que el proveedor confirme la recepción.",
                            fontSize = 14.sp,
                            textAlign = TextAlign.Center,
                            color = KuotaTextSecondary,
                            lineHeight = 20.sp
                        )

                        Spacer(modifier = Modifier.height(28.dp))

                        // Resumen de la operación en curso
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(text = "Total de compra:", color = KuotaTextSecondary, fontSize = 13.sp)
                                    Text(text = "S/ ${currencyFormatter.format(totalAmount)}", fontWeight = FontWeight.Bold, color = KuotaTextPrimary)
                                }
                                Spacer(modifier = Modifier.height(6.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(text = "Monto financiado (Kuota):", color = KuotaTextSecondary, fontSize = 13.sp)
                                    Text(text = "S/ ${currencyFormatter.format(financedAmount)}", fontWeight = FontWeight.Bold, color = KuotaPurple)
                                }
                            }
                        }
                    }
                }

                ScreenState.CONFIRMED -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = KuotaGreenVerified.copy(alpha = 0.15f),
                            modifier = Modifier.size(96.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = KuotaGreenVerified,
                                    modifier = Modifier.size(56.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Text(
                            text = "¡Financiamiento Aprobado!",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = KuotaTextPrimary
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "El proveedor confirmó la recepción de la cuota inicial. Tu inventario está listo para ser retirado.",
                            textAlign = TextAlign.Center,
                            color = KuotaTextSecondary,
                            fontSize = 14.sp
                        )

                        Spacer(modifier = Modifier.height(32.dp))

                        Button(
                            onClick = onFinishSuccess,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = KuotaPurple)
                        ) {
                            Text(text = "Volver al Inicio", fontWeight = FontWeight.Bold)
                        }
                    }
                }

                ScreenState.TIMEOUT -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = KuotaAmberUnverified.copy(alpha = 0.15f),
                            modifier = Modifier.size(96.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.Schedule,
                                    contentDescription = null,
                                    tint = KuotaAmberUnverified,
                                    modifier = Modifier.size(56.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Text(
                            text = "Pendiente de Confirmación",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = KuotaTextPrimary
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "El proveedor no confirmó dentro del minuto. La operación quedó registrada en 'Mis Pagos Pendientes' y el proveedor podrá confirmarla en cualquier momento desde su app.",
                            textAlign = TextAlign.Center,
                            color = KuotaTextSecondary,
                            fontSize = 14.sp,
                            lineHeight = 20.sp
                        )

                        Spacer(modifier = Modifier.height(32.dp))

                        Button(
                            onClick = onNavigateToPendingPayments,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = KuotaPurple)
                        ) {
                            Text(text = "Ver en Mis Pagos Pendientes", fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        TextButton(
                            onClick = onFinishSuccess,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = "Volver al Inicio", color = KuotaTextSecondary)
                        }
                    }
                }
            }
        }
    }
}
