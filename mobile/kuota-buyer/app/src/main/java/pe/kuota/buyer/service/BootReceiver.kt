package pe.kuota.buyer.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Receptor de eventos de arranque del sistema y actualización de la aplicación.
 * Garantiza que el servicio foreground y el listener se reactiven inmediatamente
 * tras reiniciar el dispositivo móvil (PRD Sección 8.2).
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        val action = intent.action
        if (action == Intent.ACTION_BOOT_COMPLETED || 
            action == Intent.ACTION_MY_PACKAGE_REPLACED ||
            action == "android.intent.action.QUICKBOOT_POWERON") {
            
            Log.i(TAG, "Reinicio detectado ($action). Reiniciando KuotaForegroundMonitoringService...")
            KuotaForegroundMonitoringService.startService(context)
        }
    }

    companion object {
        private const val TAG = "KuotaBootReceiver"
    }
}
