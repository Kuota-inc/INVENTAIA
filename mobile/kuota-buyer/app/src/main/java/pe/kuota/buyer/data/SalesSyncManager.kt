package pe.kuota.buyer.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import pe.kuota.buyer.BuildConfig
import pe.kuota.buyer.listener.ParsedPayment
import pe.kuota.common.KuotaApi
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.atomic.AtomicBoolean

class SalesSyncManager private constructor(context: Context) {
    private val api = KuotaApi.get(context.applicationContext, BuildConfig.KUOTA_API_BASE_URL)
    private val offlineQueue = ConcurrentLinkedQueue<ParsedPayment>()
    private val flushing = AtomicBoolean(false)
    private val _salesEventFlow = MutableSharedFlow<SalesSyncResponse>(extraBufferCapacity = 20)
    val salesEventFlow: SharedFlow<SalesSyncResponse> = _salesEventFlow.asSharedFlow()

    suspend fun recordAndSyncSale(payment: ParsedPayment) {
        try {
            sync(payment)
            flushOfflineQueue()
        } catch (error: Exception) {
            Log.e(TAG, "No se pudo sincronizar la venta; queda pendiente en memoria.", error)
            offlineQueue.add(payment)
        }
    }

    private suspend fun flushOfflineQueue() {
        if (!flushing.compareAndSet(false, true)) return
        try {
            while (true) {
                val pending = offlineQueue.poll() ?: break
                try {
                    sync(pending)
                } catch (error: Exception) {
                    Log.e(TAG, "Falló el reintento de venta; se conserva en memoria.", error)
                    offlineQueue.add(pending)
                    break
                }
            }
        } finally {
            flushing.set(false)
        }
    }

    private suspend fun sync(payment: ParsedPayment) {
        val response = api.syncSale(
            amount = payment.amount.toPlainString(),
            sourceApp = payment.sourceWallet,
            detectedAt = payment.detectedAt.toString(),
            checksum = payment.deduplicationHash
        ).getJSONObject("sale")
        val synced = SalesSyncResponse(
            saleId = response.getString("id"),
            amount = payment.amount,
            status = response.getString("status"),
            matchedProductId = response.optString("matched_product_id").takeIf { it.isNotBlank() }
        )
        Log.i(TAG, "Venta guardada: ${synced.saleId} (${synced.status})")
        _salesEventFlow.emit(synced)
    }

    companion object {
        private const val TAG = "SalesSyncManager"

        @Volatile private var instance: SalesSyncManager? = null

        fun getInstance(context: Context): SalesSyncManager =
            instance ?: synchronized(this) {
                instance ?: SalesSyncManager(context.applicationContext).also { instance = it }
            }
    }
}
