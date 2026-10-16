package pe.kuota.supplier.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val SupplierNavy = Color(0xFF0F172A)
val SupplierNavyLight = Color(0xFF1E293B)
val SupplierGold = Color(0xFFF59E0B) // Acento dorado para liquidaciones y desembolsos
val SupplierGoldLight = Color(0xFFFDE68A)
val SupplierEmerald = Color(0xFF10B981) // Montos recibidos
val SupplierBackground = Color(0xFFF8FAFC)
val SupplierCard = Color(0xFFFFFFFF)
val SupplierTextPrimary = Color(0xFF0F172A)
val SupplierTextSecondary = Color(0xFF64748B)

private val LightColorScheme = lightColorScheme(
    primary = SupplierNavy,
    onPrimary = Color.White,
    secondary = SupplierGold,
    onSecondary = Color.Black,
    background = SupplierBackground,
    surface = SupplierCard,
    onSurface = SupplierTextPrimary
)

@Composable
fun SupplierKuotaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}
