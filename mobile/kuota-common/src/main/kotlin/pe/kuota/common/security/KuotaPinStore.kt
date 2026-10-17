package pe.kuota.common.security

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.KeyGenerator
import javax.crypto.Mac
import javax.crypto.SecretKey

class KuotaPinStore(context: Context) {
    private val preferences =
        context.applicationContext.getSharedPreferences("kuota_pin", Context.MODE_PRIVATE)
    private val keyAlias = "kuota_pin_hmac_v1"

    val isConfigured: Boolean
        get() = preferences.contains("digest") && preferences.contains("salt")

    fun setPin(pin: String) {
        require(pin.matches(Regex("^\\d{6}$"))) { "El PIN debe tener 6 dígitos." }
        val salt = ByteArray(16).also(SecureRandom()::nextBytes)
        val digest = digest(salt, pin, createKeyIfMissing = true)
        val saved = preferences.edit()
            .putString("salt", Base64.encodeToString(salt, Base64.NO_WRAP))
            .putString("digest", Base64.encodeToString(digest, Base64.NO_WRAP))
            .remove("failed_attempts")
            .remove("locked_until")
            .commit()
        check(saved) { "No se pudo guardar el PIN en este dispositivo." }
    }

    fun verifyPin(pin: String): Boolean {
        if (remainingLockoutSeconds() > 0) return false
        val salt = preferences.getString("salt", null)
            ?: error("No se encontró el PIN de este dispositivo.")
        val expected = preferences.getString("digest", null)
            ?: error("No se encontró el PIN de este dispositivo.")
        val correct = MessageDigest.isEqual(
            Base64.decode(expected, Base64.NO_WRAP),
            digest(Base64.decode(salt, Base64.NO_WRAP), pin, createKeyIfMissing = false)
        )
        if (correct) {
            preferences.edit().remove("failed_attempts").remove("locked_until").apply()
            return true
        }

        val attempts = preferences.getInt("failed_attempts", 0) + 1
        val editor = preferences.edit().putInt("failed_attempts", attempts)
        if (attempts >= 5) {
            val lockSeconds = (30L * (1L shl (attempts - 5).coerceAtMost(3))).coerceAtMost(240L)
            editor.putLong("locked_until", System.currentTimeMillis() + lockSeconds * 1000)
        }
        editor.apply()
        return false
    }

    fun remainingLockoutSeconds(): Long =
        ((preferences.getLong("locked_until", 0L) - System.currentTimeMillis()).coerceAtLeast(0) + 999) / 1000

    private fun digest(salt: ByteArray, pin: String, createKeyIfMissing: Boolean): ByteArray {
        val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val key = (keyStore.getKey(keyAlias, null) as? SecretKey)
            ?: if (createKeyIfMissing) createKey()
            else error("No se puede recuperar el PIN protegido en este dispositivo.")
        return Mac.getInstance("HmacSHA256").run {
            init(key)
            update(salt)
            doFinal(pin.toByteArray(Charsets.UTF_8))
        }
    }

    private fun createKey(): SecretKey {
        val generator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_HMAC_SHA256,
            "AndroidKeyStore"
        )
        generator.init(
            KeyGenParameterSpec.Builder(
                keyAlias,
                KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
            )
                .setDigests(KeyProperties.DIGEST_SHA256)
                .build()
        )
        return generator.generateKey()
    }
}
