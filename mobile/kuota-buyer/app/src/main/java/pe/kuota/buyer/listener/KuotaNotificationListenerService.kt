package pe.kuota.buyer.listener

import android.app.Notification
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import pe.kuota.buyer.data.SalesSyncManager
import java.util.concurrent.ConcurrentHashMap

/**
 * Servicio del sistema Android para interceptar notificaciones de pagos entrantes.
 * Requiere el permiso del sistema: android.permission.BIND_NOTIFICATION_LISTENER_SERVICE.
 *
 * Cumplimiento PRD v1.0 (Secciones 5.3 y 8.2):
 * - Permanece activo escuchando únicamente paquetes de pago autorizados (Yape y Plin).
 * - Extrae exclusivamente el monto.
 * - Despacha la venta hacia el módulo de sincronización.
 */
class KuotaNotificationListenerService : NotificationListenerService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    // Cache en memoria para deduplicar eventos repetidos por el SO en ventanas cortas
    private val processedHashes = ConcurrentHashMap<String, Long>()

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i(TAG, "Kuota Notification Listener conectado exitosamente.")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.w(TAG, "Kuota Notification Listener desconectado por el sistema.")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName ?: return
        
        // 1. Filtrar solo apps de pagos soportadas
        if (!KnownPaymentApps.SUPPORTED_PACKAGES.contains(packageName)) {
            return
        }

        val notification = sbn.notification ?: return
        val extras: Bundle = notification.extras ?: return

        // Extraer texto principal y expandido
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()
        val combinedText = listOfNotNull(text, bigText).joinToString(" ")

        val postTime = sbn.postTime

        // 2. Ejecutar análisis sintáctico (Parser)
        val payment = PaymentNotificationParser.parse(
            packageName = packageName,
            title = title,
            text = combinedText,
            postTimestamp = postTime
        ) ?: return

        // 3. Deduplicación por hash
        cleanOldHashes()
        if (processedHashes.containsKey(payment.deduplicationHash)) {
            Log.d(TAG, "Notificación duplicada ignorada [Hash: ${payment.deduplicationHash}]")
            return
        }
        processedHashes[payment.deduplicationHash] = System.currentTimeMillis()

        Log.i(TAG, "Venta detectada con éxito: ${payment.sourceWallet} -> S/ ${payment.amount}")

        // 4. Sincronizar hacia backend/repositorio local
        serviceScope.launch {
            SalesSyncManager.getInstance(applicationContext).recordAndSyncSale(payment)
        }
    }

    private fun cleanOldHashes() {
        val now = System.currentTimeMillis()
        val retentionPeriodMs = 60_000L // 1 minuto
        val iterator = processedHashes.entries.iterator()
        while (iterator.hasNext()) {
            val entry = iterator.next()
            if (now - entry.value > retentionPeriodMs) {
                iterator.remove()
            }
        }
    }

    companion object {
        private const val TAG = "KuotaNotifListener"
    }
}
