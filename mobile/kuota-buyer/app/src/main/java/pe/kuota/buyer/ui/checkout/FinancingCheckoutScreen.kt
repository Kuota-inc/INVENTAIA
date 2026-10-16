package pe.kuota.buyer.ui.checkout

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.kuota.buyer.ui.scanner.ScannedSupplierInfo
import pe.kuota.buyer.ui.theme.*
import java.math.BigDecimal
import java.math.RoundingMode
import java.text.DecimalFormat

/**
 * Pantalla de Checkout de Financiamiento (PRD Sección 5.6):
 * Permite al comprador definir el monto total de compra, el plazo de pago (días)
 * e ingresar su PIN de seguridad antes de disparar la transacción y el timeout de 60s.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinancingCheckoutScreen(
    supplier: ScannedSupplierInfo,
    availableCreditLimit: BigDecimal = BigDecimal("7000.00"),
    onConfirmFinancing: (total: BigDecimal, downPayment: BigDecimal, financed: BigDecimal, termDays: Int) -> Unit,
    onNavigateBack: () -> Unit
) {
    var totalAmountInput by remember { mutableStateOf("1500") }
    val availableTerms = listOf(15, 30, 45, 60)
    var selectedTermDays by remember { mutableIntStateOf(30) }
    var pinInput by remember { mutableStateOf("") }
    var showPinError by remember { mutableStateOf(false) }

    val currencyFormatter = DecimalFormat("#,##0.00")

    // Cálculos en vivo: Cuota inicial referencial 20%, Financiado 80%
    val totalAmount = totalAmountInput.toBigDecimalOrNull() ?: BigDecimal.ZERO
    val downPayment = totalAmount.multiply(BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP)
    val financedAmount = totalAmount.subtract(downPayment).max(BigDecimal.ZERO)
    val exceedsCreditLimit = financedAmount > availableCreditLimit

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
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Verificado",
                                tint = KuotaGreenVerified,
                                modifier = Modifier.size(16.dp)
                            )
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

            // 4. Desglose Financiero en Tiempo Real
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Estructura de la Operación",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = KuotaTextPrimary
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Cuota inicial adelantada por Kuota (20%):", fontSize = 13.sp, color = KuotaTextSecondary)
                        Text(
                            text = "S/ ${currencyFormatter.format(downPayment)}",
                            fontWeight = FontWeight.SemiBold,
                            color = KuotaTextPrimary
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Monto financiado (a pagar en $selectedTermDays días):", fontSize = 13.sp, color = KuotaTextSecondary)
                        Text(
                            text = "S/ ${currencyFormatter.format(financedAmount)}",
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
                        Text(text = "Tu línea disponible actual:", fontSize = 12.sp, color = KuotaTextSecondary)
                        Text(
                            text = "S/ ${currencyFormatter.format(availableCreditLimit)}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (exceedsCreditLimit) Color.Red else KuotaGreenVerified
                        )
                    }

                    if (exceedsCreditLimit) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "⚠️ El monto financiado supera tu línea disponible de S/ ${currencyFormatter.format(availableCreditLimit)}.",
                            color = Color.Red,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // 5. Autenticación con PIN obligatorio (PRD 8.1)
            Column {
                Text(
                    text = "PIN de Seguridad (6 dígitos)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = KuotaTextPrimary
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = pinInput,
                    onValueChange = {
                        if (it.length <= 6 && it.all { char -> char.isDigit() }) {
                            pinInput = it
                            showPinError = false
                        }
                    },
                    placeholder = { Text("Ingresa tu PIN para confirmar") },
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    isError = showPinError,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )
                if (showPinError) {
                    Text(
                        text = "El PIN debe tener 6 dígitos",
                        color = Color.Red,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            // 6. Botón de Aceptación (PRD 5.6.4)
            Button(
                onClick = {
                    if (pinInput.length != 6) {
                        showPinError = true
                        return@Button
                    }
                    if (!exceedsCreditLimit && totalAmount > BigDecimal.ZERO) {
                        onConfirmFinancing(totalAmount, downPayment, financedAmount, selectedTermDays)
                    }
                },
                enabled = !exceedsCreditLimit && totalAmount > BigDecimal.ZERO,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = KuotaPurple)
            ) {
                Text(
                    text = "Aceptar y Financiar",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
