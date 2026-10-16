package pe.kuota.api.controller

import org.springframework.data.redis.connection.Message
import org.springframework.data.redis.connection.MessageListener
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.data.redis.listener.RedisMessageListenerContainer
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import pe.kuota.api.model.TransactionStatus
import pe.kuota.api.repository.TransactionRepository
import java.time.Duration
import java.time.Instant
import java.util.UUID
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

data class LiveStatusPayload(
    val status: String,
    val remainingSeconds: Long,
    val isFinal: Boolean
)

/**
 * Controlador de Server-Sent Events (SSE) para la pantalla de carga del Comprador (PRD Sección 5.6).
 * Envía la cuenta regresiva en vivo y notifica de inmediato cuando el proveedor confirma o expira el minuto.
 */
@RestController
@RequestMapping("/api/v1/transactions")
class TransactionSseController(
    private val transactionRepository: TransactionRepository,
    private val redisContainer: RedisMessageListenerContainer
) {

    private val tickerExecutor = Executors.newScheduledThreadPool(4)

    @GetMapping("/{id}/live-status", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun streamLiveStatus(@PathVariable id: UUID): SseEmitter {
        val emitter = SseEmitter(70_000L) // 70 segundos de timeout HTTP
        val tx = transactionRepository.findById(id).orElse(null)

        if (tx == null) {
            emitter.completeWithError(NoSuchElementException("Transacción no existe"))
            return emitter
        }

        // Si ya está culminada, enviar estado y cerrar
        if (tx.status == TransactionStatus.CONFIRMED_SUCCESSFUL ||
            tx.status == TransactionStatus.PENDING_CONFIRMATION_TIMEOUT) {
            emitter.send(SseEmitter.event().data(LiveStatusPayload(tx.status.name, 0, true)))
            emitter.complete()
            return emitter
        }

        val channel = "tx_events:$id"
        var tickerFuture: ScheduledFuture<*>? = null

        // 1. Suscriptor Redis a eventos de confirmación
        val redisListener = MessageListener { message: Message, _: ByteArray? ->
            val status = String(message.body)
            try {
                emitter.send(SseEmitter.event().name("status").data(LiveStatusPayload(status, 0, true)))
                emitter.complete()
            } catch (_: Exception) {}
        }

        val topic = ChannelTopic(channel)
        redisContainer.addMessageListener(redisListener, topic)

        // 2. Emisor de cuenta regresiva (cada 1 segundo)
        tickerFuture = tickerExecutor.scheduleAtFixedRate({
            val remaining = Duration.between(Instant.now(), tx.confirmationTimeoutAt).seconds.coerceAtLeast(0)
            try {
                emitter.send(SseEmitter.event().name("tick").data(LiveStatusPayload(TransactionStatus.AWAITING_SUPPLIER_CONFIRMATION.name, remaining, false)))
                if (remaining <= 0) {
                    emitter.send(SseEmitter.event().name("status").data(LiveStatusPayload(TransactionStatus.PENDING_CONFIRMATION_TIMEOUT.name, 0, true)))
                    emitter.complete()
                }
            } catch (e: Exception) {
                emitter.completeWithError(e)
            }
        }, 0, 1, TimeUnit.SECONDS)

        // Cleanup al desconectar o completar
        val cleanup = Runnable {
            tickerFuture.cancel(true)
            redisContainer.removeMessageListener(redisListener, topic)
        }
        emitter.onCompletion(cleanup)
        emitter.onTimeout(cleanup)
        emitter.onError { cleanup.run() }

        return emitter
    }
}
