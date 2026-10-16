package pe.kuota.buyer.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * Foreground Service persistente para garantizar la disponibilidad ininterrumpida
 * del listener de notificaciones según los requisitos del PRD (Secciones 5.3 y 8.2).
 *
 * Se ejecuta con prioridad de foreground (START_STICKY) para evitar que el sistema
 * operativo elimine el proceso por recolección de memoria (OOM Killer).
 */
class KuotaForegroundMonitoringService : Service() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = buildOngoingNotification()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Android 14+ requiere especificar el tipo de foreground service
            val serviceType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            } else {
                0
            }
            startForeground(NOTIFICATION_ID, notification, serviceType)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        Log.i(TAG, "KuotaForegroundMonitoringService iniciado en modo START_STICKY.")
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun buildOngoingNotification(): Notification {
        // Intent para abrir la App al pulsar la notificación
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Kuota — Verificación activa")
            .setContentText("Verificando ventas recibidas para tu financiamiento")
            .setSmallIcon(android.R.drawable.ic_lock_lock) // Usar icono propio en producción
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setContentIntent(pendingIntent)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Kuota Monitoreo de Ventas",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Mantiene activo el servicio de verificación de inventarios y factoring"
                setShowBadge(false)
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_ID = "kuota_foreground_monitoring_channel"
        const val NOTIFICATION_ID = 1001
        private const val TAG = "KuotaForegroundService"

        fun startService(context: Context) {
            val intent = Intent(context, KuotaForegroundMonitoringService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }
}
