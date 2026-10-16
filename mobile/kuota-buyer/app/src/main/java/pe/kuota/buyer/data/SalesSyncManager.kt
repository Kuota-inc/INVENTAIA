package pe.kuota.buyer.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import pe.kuota.buyer.listener.ParsedPayment
import java.util.concurrent.ConcurrentLinkedQueue

/**
 * Gestor de sincronización de ventas interceptadas.
 * Despacha los eventos al endpoint del backend (/api/v1/sales/sync-notification)
 * y mantiene una cola en memoria/disco en caso de desconexión temporal.
 */
class SalesSyncManager private constructor(private val context: Context) {

    private val offlineQueue = ConcurrentLinkedQueue<ParsedPayment>()
    
    // Flujo reactivo para notificar al Home y actualizar la tarjeta de financiamiento
    private val _salesEventFlow = MutableSharedFlow<SalesSyncResponse>(extraBufferCapacity = 20)
    val salesEventFlow: SharedFlow<SalesSyncResponse> = _salesEventFlow.asSharedFlow()

    /**
     * Registra el pago detectado y realiza el envío al backend.
     */
    suspend fun recordAndSyncSale(payment: ParsedPayment) {
        val request = SalesSyncRequest(
            amount = payment.amount,
            sourceApp = payment.sourceWallet,
            detectedAt = payment.detectedAt.toString(),
            checksum = payment.deduplicationHash
        )

        try {
            // Nota: Aquí se invoca el cliente HTTP (Retrofit/Ktor Client)
            // Simulación del contrato con el backend:
            val simulatedResponse = executeApiCall(request)
            
            Log.i(TAG, "Venta sincronizada exitosamente: ID ${simulatedResponse.saleId} | Estado: ${simulatedResponse.status}")
            _salesEventFlow.tryEmit(simulatedResponse)

            // Procesar pendientes si recuperó conexión
            flushOfflineQueue()
        } catch (e: Exception) {
            Log.e(TAG, "Error de red al sincronizar venta. Encolando para reintento...", e)
            offlineQueue.add(payment)
        }
    }

    private suspend fun flushOfflineQueue() {
        while (offlineQueue.isNotEmpty()) {
            val pendingPayment = offlineQueue.poll() ?: break
            recordAndSyncSale(pendingPayment)
        }
    }

    private fun executeApiCall(request: SalesSyncRequest): SalesSyncResponse {
        // En implementación real: KuotaApiClient.salesApi.syncNotification(request)
        return SalesSyncResponse(
            saleId = java.util.UUID.randomUUID().toString(),
            amount = request.amount,
            status = "COMPROBADA", // Calculado por el backend contra 'Mis Productos'
            matchedProductId = null
        )
    }

    companion object {
        private const val TAG = "SalesSyncManager"

        @Volatile
        private var INSTANCE: SalesSyncManager? = null

        fun getInstance(context: Context): SalesSyncManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: SalesSyncManager(context.applicationContext).also { INSTANCE = it }
            }
        }
    }
}
