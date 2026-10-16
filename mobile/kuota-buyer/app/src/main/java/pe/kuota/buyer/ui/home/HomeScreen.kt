package pe.kuota.buyer.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.kuota.buyer.ui.theme.*
import java.text.DecimalFormat

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToScanQr: () -> Unit,
    onNavigateToProducts: () -> Unit,
    onNavigateToPendingPayments: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val currencyFormatter = DecimalFormat("#,##0.00")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = state.buyerName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = KuotaTextPrimary
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(if (state.isListenerActive) KuotaGreenVerified else Color.Gray)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (state.isListenerActive) "Verificación de ventas activa" else "Listener inactivo",
                                fontSize = 12.sp,
                                color = KuotaTextSecondary
                            )
                        }
                    }
                },
                actions = {
                    IconButton(onClick = onNavigateToScanQr) {
                        Icon(
                            imageVector = Icons.Default.QrCodeScanner,
                            contentDescription = "Escanear QR",
                            tint = KuotaPurple
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = KuotaBackground)
            )
        },
        containerColor = KuotaBackground
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Tarjeta Hero de Financiamiento Disponible (PRD 5.2)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(KuotaPurple, KuotaPurpleDark)
                                )
                            )
                            .padding(20.dp)
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Financiamiento disponible",
                                    color = Color.White.copy(alpha = 0.85f),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium
                                )
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = Color.White.copy(alpha = 0.2f)
                                ) {
                                    Text(
                                        text = "${state.referencePercentage}% de ventas",
                                        color = Color.White,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = "S/ ${currencyFormatter.format(state.availableCredit)}",
                                color = Color.White,
                                fontSize = 32.sp,
                                fontWeight = FontWeight.ExtraBold
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            Text(
                                text = "Base comprobada acumulada: S/ ${currencyFormatter.format(state.verifiedSalesBase)}",
                                color = Color.White.copy(alpha = 0.7f),
                                fontSize = 12.sp
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            Button(
                                onClick = onNavigateToScanQr,
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = KuotaTurquoise,
                                    contentColor = Color.Black
                                ),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.QrCodeScanner,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Financiar Compra vía QR",
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            // 2. Acciones Rápidas (Mis Productos / Mis Pagos Pendientes)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onNavigateToProducts,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Inventory2,
                            contentDescription = null,
                            tint = KuotaPurple,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Mis Productos", color = KuotaTextPrimary)
                    }

                    OutlinedButton(
                        onClick = onNavigateToPendingPayments,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ReceiptLong,
                            contentDescription = null,
                            tint = KuotaPurple,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Pagos Pendientes", color = KuotaTextPrimary)
                    }
                }
            }

            // 3. Encabezado de Ventas
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Historial de Ventas",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = KuotaTextPrimary
                    )
                    Text(
                        text = "Matching por monto",
                        fontSize = 12.sp,
                        color = KuotaTextSecondary
                    )
                }
            }

            // 4. Feed de Ventas Interceptadas por el Listener
            items(state.recentSales) { sale ->
                SaleItemRow(sale = sale, formatter = currencyFormatter)
            }
        }
    }
}

@Composable
fun SaleItemRow(
    sale: SaleItemUiState,
    formatter: DecimalFormat
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Icono según billetera
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (sale.sourceWallet == "YAPE") Color(0xFF6B1187).copy(alpha = 0.1f) else Color(0xFF0070BA).copy(alpha = 0.1f),
                    modifier = Modifier.size(44.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = if (sale.sourceWallet == "YAPE") "Y" else "P",
                            fontWeight = FontWeight.ExtraBold,
                            color = if (sale.sourceWallet == "YAPE") KuotaPurple else Color(0xFF0070BA),
                            fontSize = 18.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = "+ S/ ${formatter.format(sale.amount)}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = KuotaTextPrimary
                    )
                    Text(
                        text = "${sale.sourceWallet} • ${sale.formattedTime}",
                        fontSize = 12.sp,
                        color = KuotaTextSecondary
                    )
                }
            }

            // Badge de Estado: Comprobada vs No Comprobada (PRD 5.2 y 5.3)
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = if (sale.isVerified) KuotaGreenVerified.copy(alpha = 0.12f) else KuotaAmberUnverified.copy(alpha = 0.12f),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (sale.isVerified) KuotaGreenVerified.copy(alpha = 0.3f) else KuotaAmberUnverified.copy(alpha = 0.3f)
                )
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (sale.isVerified) Icons.Default.CheckCircle else Icons.Default.HelpOutline,
                        contentDescription = null,
                        tint = if (sale.isVerified) KuotaGreenVerified else KuotaAmberUnverified,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (sale.isVerified) "Comprobada" else "No comprobada",
                        color = if (sale.isVerified) KuotaGreenVerified else KuotaAmberUnverified,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}
