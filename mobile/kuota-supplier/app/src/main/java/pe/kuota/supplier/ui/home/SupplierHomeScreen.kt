package pe.kuota.supplier.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.QrCode2
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.kuota.supplier.ui.theme.*
import java.text.DecimalFormat

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SupplierHomeScreen(
    viewModel: SupplierHomeViewModel,
    onOpenQrCode: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val currencyFormatter = DecimalFormat("#,##0.00")
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = state.supplierName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = SupplierTextPrimary
                        )
                        Text(
                            text = "Solicitudes de compra Kuota",
                            fontSize = 12.sp,
                            color = SupplierTextSecondary
                        )
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
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Desembolsos are not implemented; avoid presenting simulated balances.
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(SupplierNavy, SupplierNavyLight)
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
                                    text = "Desembolsos Kuota",
                                    color = Color.White.copy(alpha = 0.85f),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium
                                )
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = SupplierGold.copy(alpha = 0.25f)
                                ) {
                                    Text(
                                        text = "No habilitados",
                                        color = SupplierGoldLight,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = "No disponibles",
                                color = Color.White,
                                fontSize = 32.sp,
                                fontWeight = FontWeight.ExtraBold
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = "Esta versión registra solicitudes, pero no transfiere fondos.",
                                color = Color.White.copy(alpha = 0.7f),
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }

            // 2. Botón Principal: Abrir mi Código QR Kuota (PRD 6.2)
            item {
                Button(
                    onClick = onOpenQrCode,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = SupplierGold)
                ) {
                    Icon(
                        imageVector = Icons.Default.QrCode2,
                        contentDescription = null,
                        tint = Color.Black,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Mostrar mi Código QR Kuota",
                        color = Color.Black,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }
            }

            // Solicitudes recientes recibidas por la API.
            item {
                Text(
                    text = "Solicitudes recientes",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = SupplierTextPrimary
                )
            }

            if (state.requests.isEmpty()) {
                item {
                    Text(
                        state.error ?: "Las solicitudes nuevas aparecerán aquí.",
                        color = if (state.error != null) MaterialTheme.colorScheme.error else SupplierTextSecondary,
                        fontSize = 13.sp
                    )
                }
            }
            items(state.requests, key = { it.id }) { request ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Solicitud ${request.id.take(8)}", fontWeight = FontWeight.SemiBold)
                            Text(request.createdAt.take(10), fontSize = 12.sp, color = SupplierTextSecondary)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("S/ ${currencyFormatter.format(request.amount)}", fontWeight = FontWeight.Bold)
                            Text(
                                text = when (request.status) {
                                    "AWAITING_SUPPLIER_ACCEPTANCE" -> "Pendiente"
                                    "SUPPLIER_ACCEPTED" -> "Aceptaste"
                                    else -> "Cerrada"
                                },
                                fontSize = 12.sp,
                                color = SupplierTextSecondary
                            )
                        }
                    }
                }
            }
        }
    }
}
