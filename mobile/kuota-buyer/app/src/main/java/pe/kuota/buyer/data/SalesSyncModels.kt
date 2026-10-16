package pe.kuota.buyer.data

import java.math.BigDecimal

data class SalesSyncRequest(
    val amount: BigDecimal,
    val sourceApp: String, // "YAPE" | "PLIN"
    val detectedAt: String, // ISO-8601
    val checksum: String
)

data class SalesSyncResponse(
    val saleId: String,
    val amount: BigDecimal,
    val status: String, // "COMPROBADA" | "NO_COMPROBADA"
    val matchedProductId: String?
)
