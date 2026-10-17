package pe.kuota.buyer.ui.checkout

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.kuota.buyer.ui.scanner.ScannedSupplierInfo
import pe.kuota.buyer.ui.theme.*
import java.math.BigDecimal
import java.text.DecimalFormat

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinancingCheckoutScreen(
    supplier: ScannedSupplierInfo,
    referenceEstimate: BigDecimal = BigDecimal.ZERO,
    onConfirmFinancing: (total: BigDecimal, termDays: Int) -> Unit,
    onNavigateBack: () -> Unit
) {
    var totalAmountInput by remember { mutableStateOf("1500") }
    val availableTerms = listOf(15, 30, 45, 60)
    var selectedTermDays by remember { mutableIntStateOf(30) }

    val currencyFormatter = DecimalFormat("#,##0.00")
    val totalAmount = totalAmountInput.toBigDecimalOrNull() ?: BigDecimal.ZERO
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Definir Financiamiento", fontWeight = FontWeight.Bold, color = KuotaTextPrimary) },
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // 1. Tarjeta de Proveedor Escaneado
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = KuotaPurple.copy(alpha = 0.1f),
                        modifier = Modifier.size(48.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(imageVector = Icons.Default.Store, contentDescription = null, tint = KuotaPurple)
                        }
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = supplier.supplierName,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = KuotaTextPrimary
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                        }
                        Text(
                            text = "Código Proveedor: ${supplier.supplierId.take(8)}...",
                            fontSize = 12.sp,
                            color = KuotaTextSecondary
                        )
                    }
                }
            }

            // 2. Definición del Monto de Compra (PRD 5.6.3)
            Column {
                Text(
                    text = "Monto Total de Compra",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = KuotaTextPrimary
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = totalAmountInput,
                    onValueChange = { totalAmountInput = it },
                    prefix = { Text("S/ ", fontWeight = FontWeight.Bold, color = KuotaPurple) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )
            }

            // 3. Selección del Plazo de Pago (PRD 5.6.3)
            Column {
                Text(
                    text = "Plazo de Pago",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = KuotaTextPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    availableTerms.forEach { days ->
                        FilterChip(
                            selected = selectedTermDays == days,
                            onClick = { selectedTermDays = days },
                            label = { Text("$days días", fontWeight = FontWeight.Bold) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = KuotaPurple,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }
            }

            // The amount and available credit are references, not a financing decision.
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Solicitud referencial",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = KuotaTextPrimary
                    )

                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Monto solicitado:", fontSize = 13.sp, color = KuotaTextSecondary)
                        Text(
                            text = "S/ ${currencyFormatter.format(totalAmount)}",
                            fontWeight = FontWeight.ExtraBold,
                            color = KuotaPurple,
                            fontSize = 15.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    HorizontalDivider(color = KuotaBorder)
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Estimación referencial (no es crédito aprobado):",
                            fontSize = 12.sp,
                            color = KuotaTextSecondary
                        )
                        Text(
                            text = "S/ ${currencyFormatter.format(referenceEstimate)}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = KuotaTextPrimary
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Enviar esta solicitud no aprueba crédito ni transfiere dinero.",
                        fontSize = 12.sp,
                        color = KuotaTextSecondary
                    )
                }
            }

            Button(
                onClick = {
                    if (totalAmount > BigDecimal.ZERO) {
                        onConfirmFinancing(totalAmount, selectedTermDays)
                    }
                },
                enabled = totalAmount > BigDecimal.ZERO,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = KuotaPurple)
            ) {
                Text(
                    text = "Enviar solicitud",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
