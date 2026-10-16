package pe.kuota.supplier.ui.qr

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.kuota.supplier.ui.theme.*

/**
 * Pantalla de visualización del QR Propio del Proveedor (PRD Sección 6.2).
 * Presenta el QR criptográfico que los compradores escanean para financiar compras.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SupplierQrScreen(
    supplierName: String,
    supplierRuc: String,
    qrPayload: String,
    onNavigateBack: () -> Unit
) {
    val qrBitmap = remember(qrPayload) {
        QrCodeGenerator.generateQrBitmap(qrPayload, sizePx = 640)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mi Código QR Kuota", fontWeight = FontWeight.Bold, color = SupplierTextPrimary) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Atrás", tint = SupplierTextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SupplierBackground)
            )
        },
        containerColor = SupplierBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = supplierName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        textAlign = TextAlign.Center,
                        color = SupplierTextPrimary
                    )

                    Text(
                        text = "RUC: $supplierRuc",
                        fontSize = 13.sp,
                        color = SupplierTextSecondary,
                        modifier = Modifier.padding(top = 4.dp)
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Imagen del Código QR
                    Box(
                        modifier = Modifier
                            .size(260.dp)
                            .background(Color.White, RoundedCornerShape(16.dp))
                            .padding(8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        if (qrBitmap != null) {
                            Image(
                                bitmap = qrBitmap.asImageBitmap(),
                                contentDescription = "QR Kuota Propio",
                                modifier = Modifier.fillMaxSize()
                            )
                        } else {
                            CircularProgressIndicator(color = SupplierNavy)
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = SupplierNavy.copy(alpha = 0.05f)
                    ) {
                        Text(
                            text = "Pide a tu comprador que abra la App Kuota y escanee este código para financiar su compra de inventario.",
                            fontSize = 12.sp,
                            textAlign = TextAlign.Center,
                            color = SupplierTextSecondary,
                            lineHeight = 18.sp,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }
            }
        }
    }
}
