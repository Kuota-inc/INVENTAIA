package pe.kuota.buyer.ui

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import pe.kuota.buyer.R

@Composable
fun KuotaStartupAnimation(onFinished: () -> Unit) {
    val splashAlpha = remember { Animatable(1f) }
    val logoAlpha = remember { Animatable(0f) }
    val scale = remember { Animatable(0.94f) }
    val easing = remember { CubicBezierEasing(0.23f, 1f, 0.32f, 1f) }

    LaunchedEffect(Unit) {
        coroutineScope {
            launch {
                logoAlpha.animateTo(1f, tween(durationMillis = 320, easing = easing))
                delay(80)
                splashAlpha.animateTo(0f, tween(durationMillis = 120, easing = easing))
            }
            launch {
                scale.animateTo(1f, tween(durationMillis = 420, easing = easing))
            }
        }
        onFinished()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .alpha(splashAlpha.value)
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = painterResource(R.drawable.kuota_logo),
            contentDescription = "Kuota",
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .size(220.dp)
                .alpha(logoAlpha.value)
                .graphicsLayer {
                    scaleX = scale.value
                    scaleY = scale.value
                }
        )
    }
}
