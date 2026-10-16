package pe.kuota.buyer.service

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.util.Log

/**
 * Gestor de optimizaciones de batería de Android (Doze Mode).
 *
 * Cumplimiento PRD v1.0 (Sección 8.2):
 * "El foreground service de notificaciones debe sobrevivir a reinicios de app y optimizaciones
 * de batería del sistema operativo (requiere excepción de battery optimization solicitada
 * explícitamente al usuario en onboarding)."
 */
object BatteryOptimizationHelper {

    private const val TAG = "BatteryOptHelper"

    /**
     * Verifica si la app ya cuenta con la exención de optimización de batería.
     */
    fun isBatteryOptimizationIgnored(context: Context): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
            return powerManager?.isIgnoringBatteryOptimizations(context.packageName) == true
        }
        return true
    }

    /**
     * Lanza el diálogo del sistema solicitando explícitamente al usuario ignorar
     * las restricciones de batería para Kuota.
     */
    @SuppressLint("BatteryLife")
    fun requestIgnoreBatteryOptimization(activity: Activity, requestCode: Int = 1002) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!isBatteryOptimizationIgnored(activity)) {
                try {
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:${activity.packageName}")
                    }
                    activity.startActivityForResult(intent, requestCode)
                } catch (e: Exception) {
                    Log.e(TAG, "No se pudo abrir el diálogo directo de batería, redirigiendo a ajustes generales", e)
                    // Fallback a los ajustes generales de ahorro de batería
                    val fallbackIntent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                    activity.startActivity(fallbackIntent)
                }
            }
        }
    }
}
