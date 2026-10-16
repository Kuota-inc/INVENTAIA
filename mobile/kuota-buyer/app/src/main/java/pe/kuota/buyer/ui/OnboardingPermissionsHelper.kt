package pe.kuota.buyer.ui

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.core.content.ContextCompat
import pe.kuota.buyer.listener.KuotaNotificationListenerService
import pe.kuota.buyer.service.BatteryOptimizationHelper

/**
 * Validador de permisos requeridos durante el Onboarding del Comprador.
 *
 * Cumplimiento PRD v1.0 (Sección 5.3):
 * "Requisito no negociable: el servicio de escucha de notificaciones debe permanecer
 * activo en todo momento (foreground service) para que la app funcione — sin él, el usuario no puede operar."
 */
object OnboardingPermissionsHelper {

    /**
     * Verifica si el usuario ha habilitado el acceso a notificaciones para Kuota.
     */
    fun isNotificationListenerGranted(context: Context): Boolean {
        val packageName = context.packageName
        val flat = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners") ?: return false
        val names = flat.split(":")
        for (name in names) {
            val component = ComponentName.unflattenFromString(name)
            if (component != null && component.packageName == packageName) {
                return true
            }
        }
        return false
    }

    /**
     * Redirige al usuario a la pantalla de Ajustes del Sistema para otorgar el permiso.
     */
    fun openNotificationListenerSettings(context: Context) {
        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    /**
     * Verifica si la app cuenta con permiso POST_NOTIFICATIONS (Android 13+).
     */
    fun isPostNotificationGranted(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    /**
     * Determina si el Comprador cumple con todos los requisitos obligatorios para operar.
     */
    fun isReadyToOperate(context: Context): Boolean {
        return isNotificationListenerGranted(context) &&
               BatteryOptimizationHelper.isBatteryOptimizationIgnored(context) &&
               isPostNotificationGranted(context)
    }
}
