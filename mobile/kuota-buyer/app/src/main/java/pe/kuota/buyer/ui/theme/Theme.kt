package pe.kuota.buyer.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = KuotaPurple,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    secondary = KuotaTurquoise,
    onSecondary = androidx.compose.ui.graphics.Color.White,
    background = KuotaBackground,
    surface = KuotaCardSurface,
    onSurface = KuotaTextPrimary
)

@Composable
fun KuotaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}
