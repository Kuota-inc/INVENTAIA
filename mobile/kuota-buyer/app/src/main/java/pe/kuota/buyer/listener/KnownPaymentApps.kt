package pe.kuota.buyer.listener

/**
 * Catálogo de paquetes de aplicaciones de billeteras y pagos soportadas en Perú.
 * Cumple con el alcance de la v1 (Yape y Plin).
 */
object KnownPaymentApps {
    const val PACKAGE_YAPE = "com.bcp.innovacxion.yapeapp"
    
    // Plin opera integrado dentro de las apps bancarias de Interbank, BBVA y Scotiabank
    const val PACKAGE_INTERBANK = "pe.com.interbank.mobilebanking"
    const val PACKAGE_BBVA = "com.bbva.pe.app"
    const val PACKAGE_SCOTIABANK = "pe.com.scotiabank.mobile"

    val SUPPORTED_PACKAGES = setOf(
        PACKAGE_YAPE,
        PACKAGE_INTERBANK,
        PACKAGE_BBVA,
        PACKAGE_SCOTIABANK
    )

    fun identifySourceWallet(packageName: String): String {
        return when (packageName) {
            PACKAGE_YAPE -> "YAPE"
            PACKAGE_INTERBANK, PACKAGE_BBVA, PACKAGE_SCOTIABANK -> "PLIN"
            else -> "OTHER"
        }
    }
}
