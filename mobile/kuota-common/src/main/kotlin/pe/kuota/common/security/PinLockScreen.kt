package pe.kuota.common.security

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Backspace
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
private val KuotaPurple = Color(0xFF6B1187)
private val KuotaTextPrimary = Color(0xFF0F172A)
private val KuotaTextSecondary = Color(0xFF64748B)

@Composable
fun PinLockScreen(
    title: String,
    subtitle: String,
    errorMessage: String? = null,
    showBiometric: Boolean = false,
    onPinEntered: (String) -> Unit,
    onBiometricClick: () -> Unit = {}
) {
    var enteredPin by remember(title) { mutableStateOf("") }

    fun addDigit(digit: String) {
        if (enteredPin.length == 6) return
        enteredPin += digit
        if (enteredPin.length == 6) {
            val pin = enteredPin
            enteredPin = ""
            onPinEntered(pin)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
            .padding(horizontal = 24.dp, vertical = 48.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Surface(
                shape = CircleShape,
                color = KuotaPurple.copy(alpha = 0.1f),
                modifier = Modifier.size(56.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Lock, contentDescription = null, tint = KuotaPurple)
                }
            }
            Spacer(Modifier.height(16.dp))
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = KuotaTextPrimary)
            Text(
                errorMessage ?: subtitle,
                modifier = Modifier.padding(top = 6.dp),
                color = if (errorMessage == null) KuotaTextSecondary else MaterialTheme.colorScheme.error,
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.bodySmall
            )
            Row(
                modifier = Modifier.padding(top = 28.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                repeat(6) { index ->
                    Box(
                        Modifier
                            .size(16.dp)
                            .clip(CircleShape)
                            .background(if (index < enteredPin.length) KuotaPurple else Color(0xFFCBD5E1))
                    )
                }
            }
        }

        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxWidth(0.85f)
        ) {
            listOf(
                listOf("1", "2", "3"),
                listOf("4", "5", "6"),
                listOf("7", "8", "9"),
                listOf("BIO", "0", "DEL")
            ).forEach { row ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    row.forEach { key ->
                        when (key) {
                            "BIO" -> {
                                Box(
                                    Modifier
                                        .size(68.dp)
                                        .clip(CircleShape)
                                        .clickable(enabled = showBiometric, onClick = onBiometricClick),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (showBiometric) {
                                        Icon(
                                            Icons.Default.Fingerprint,
                                            contentDescription = "Desbloquear con biometría",
                                            tint = KuotaPurple,
                                            modifier = Modifier.size(32.dp)
                                        )
                                    }
                                }
                            }
                            "DEL" -> {
                                Box(
                                    Modifier
                                        .size(68.dp)
                                        .clip(CircleShape)
                                        .clickable { enteredPin = enteredPin.dropLast(1) },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.AutoMirrored.Filled.Backspace, contentDescription = "Borrar", tint = KuotaTextSecondary)
                                }
                            }
                            else -> {
                                Box(
                                    Modifier
                                        .size(68.dp)
                                        .background(Color.White, CircleShape)
                                        .clickable { addDigit(key) },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(key, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
