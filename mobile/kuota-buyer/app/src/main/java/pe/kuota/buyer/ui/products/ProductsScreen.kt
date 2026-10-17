package pe.kuota.buyer.ui.products

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pe.kuota.buyer.ui.theme.*
import pe.kuota.buyer.BuildConfig
import pe.kuota.common.KuotaApi
import kotlinx.coroutines.launch
import java.math.BigDecimal
import java.text.DecimalFormat

data class ProductItem(
    val id: String,
    val name: String,
    val price: BigDecimal
)

/**
 * Pantalla 'Mis Productos' (PRD Sección 5.4):
 * Permite gestionar el catálogo de productos y precios de referencia
 * utilizados por el listener de notificaciones para el matching de ventas.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductsScreen(
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val api = remember { KuotaApi.get(context, BuildConfig.KUOTA_API_BASE_URL) }
    val scope = rememberCoroutineScope()
    var products by remember { mutableStateOf(emptyList<ProductItem>()) }
    var error by remember { mutableStateOf<String?>(null) }
    var saving by remember { mutableStateOf(false) }

    var showAddDialog by remember { mutableStateOf(false) }
    var newProductName by remember { mutableStateOf("") }
    var newProductPrice by remember { mutableStateOf("") }
    val currencyFormatter = DecimalFormat("#,##0.00")

    LaunchedEffect(Unit) {
        try {
            val rows = api.products().optJSONArray("products")
            products = (0 until (rows?.length() ?: 0)).mapNotNull { index ->
                val row = rows?.optJSONObject(index) ?: return@mapNotNull null
                ProductItem(
                    id = row.optString("id"),
                    name = row.optString("name"),
                    price = row.optString("price").toBigDecimalOrNull() ?: BigDecimal.ZERO
                )
            }
        } catch (failure: Exception) {
            error = failure.message ?: "No se pudieron cargar los productos."
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mis Productos", fontWeight = FontWeight.Bold, color = KuotaTextPrimary) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Atrás", tint = KuotaTextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = KuotaBackground)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = KuotaPurple,
                contentColor = Color.White
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Agregar producto")
            }
        },
        containerColor = KuotaBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
        ) {
            // Nota informativa del funcionamiento del matching
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = KuotaPurple.copy(alpha = 0.08f),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Text(
                    text = "El servidor compara los montos de notificaciones con estos precios. Esto no confirma que el pago ocurrió.",
                    fontSize = 12.sp,
                    color = KuotaPurpleDark,
                    modifier = Modifier.padding(12.dp),
                    lineHeight = 18.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(products) { product ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
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
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = Color(0xFFF1F5F9),
                                    modifier = Modifier.size(40.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Icon(
                                            imageVector = Icons.Default.Inventory2,
                                            contentDescription = null,
                                            tint = KuotaPurple,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = product.name,
                                    fontWeight = FontWeight.SemiBold,
                                    color = KuotaTextPrimary,
                                    fontSize = 15.sp
                                )
                            }

                            Text(
                                text = "S/ ${currencyFormatter.format(product.price)}",
                                fontWeight = FontWeight.Bold,
                                color = KuotaPurple,
                                fontSize = 16.sp
                            )
                        }
                    }
                }
            }
        }

        error?.let {
            Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(vertical = 8.dp))
        }

        // Diálogo para crear nuevo producto
        if (showAddDialog) {
            AlertDialog(
                onDismissRequest = { showAddDialog = false },
                title = { Text("Nuevo Producto", fontWeight = FontWeight.Bold) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        OutlinedTextField(
                            value = newProductName,
                            onValueChange = { newProductName = it },
                            label = { Text("Nombre del producto") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = newProductPrice,
                            onValueChange = { newProductPrice = it },
                            label = { Text("Precio en soles (ej. 96.00)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val priceVal = newProductPrice.toBigDecimalOrNull()
                            if (!saving && newProductName.isNotBlank() && priceVal != null && priceVal > BigDecimal.ZERO) {
                                scope.launch {
                                    saving = true
                                    error = null
                                    try {
                                        val created = api.addProduct(newProductName.trim(), priceVal.toPlainString())
                                            .getJSONObject("product")
                                        products = products + ProductItem(
                                            id = created.getString("id"),
                                            name = created.getString("name"),
                                            price = created.getString("price").toBigDecimal()
                                        )
                                        newProductName = ""
                                        newProductPrice = ""
                                        showAddDialog = false
                                    } catch (failure: Exception) {
                                        error = failure.message ?: "No se pudo guardar el producto."
                                    } finally {
                                        saving = false
                                    }
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = KuotaPurple)
                    ) {
                        Text(if (saving) "Guardando…" else "Guardar")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showAddDialog = false }) {
                        Text("Cancelar")
                    }
                }
            )
        }
    }
}
