package pe.kuota.buyer.ui.scanner

import android.annotation.SuppressLint
import android.net.Uri
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.atomic.AtomicBoolean
import java.util.UUID

data class ScannedSupplierInfo(
    val supplierId: String,
    val supplierName: String,
    val rawPayload: String
)

/**
 * Analizador de frames de CameraX con Google ML Kit Barcode Scanning.
 * Valida que el QR pertenezca al esquema propio de Kuota (kuota://pay?...)
 * según el PRD (Secciones 3 y 5.6).
 */
class QrCodeScannerAnalyzer(
    private val onSupplierDetected: (ScannedSupplierInfo) -> Unit
) : ImageAnalysis.Analyzer {

    private val isScanning = AtomicBoolean(true)

    private val scannerOptions = BarcodeScannerOptions.Builder()
        .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
        .build()

    private val barcodeScanner = BarcodeScanning.getClient(scannerOptions)

    @SuppressLint("UnsafeOptInUsageError")
    override fun analyze(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image
        if (mediaImage != null && isScanning.get()) {
            val inputImage = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

            barcodeScanner.process(inputImage)
                .addOnSuccessListener { barcodes ->
                    for (barcode in barcodes) {
                        val rawValue = barcode.rawValue ?: continue
                        val supplierInfo = parseKuotaQr(rawValue)
                        if (supplierInfo != null && isScanning.compareAndSet(true, false)) {
                            onSupplierDetected(supplierInfo)
                            break
                        }
                    }
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }

    private fun parseKuotaQr(rawValue: String): ScannedSupplierInfo? {
        return try {
            val uri = Uri.parse(rawValue)
            if (uri.scheme == "kuota" && uri.host == "pay" &&
                uri.getQueryParameter("v") == "1") {
                val supplierId = uri.getQueryParameter("supplierId") ?: return null
                UUID.fromString(supplierId)
                ScannedSupplierInfo(
                    supplierId = supplierId,
                    supplierName = "Proveedor Kuota",
                    rawPayload = rawValue
                )
            } else {
                null
            }
        } catch (_: Exception) {
            null
        }
    }

    fun resumeScanning() {
        isScanning.set(true)
    }
}
