package pe.kuota.common

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.security.KeyStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

data class KuotaBusinessProfile(
    val identityDocumentType: String,
    val identityDocumentNumber: String,
    val legalName: String,
    val address: String,
    val phone: String
)

class KuotaApi private constructor(context: Context, baseUrl: String) {
    private val appContext = context.applicationContext
    private val baseUrl = baseUrl.trimEnd('/')
    private val cookies = EncryptedSessionCookieJar(appContext)
    private val preferences = appContext.getSharedPreferences("kuota_session", Context.MODE_PRIVATE)
    private val client = OkHttpClient.Builder().cookieJar(cookies).build()
    private val jsonType = "application/json; charset=utf-8".toMediaType()

    val hasSession: Boolean
        get() = cookies.hasSession

    val activeRole: String
        get() = preferences.getString("active_role", "") ?: ""

    suspend fun signIn(
        activity: android.app.Activity,
        role: String,
        profile: KuotaBusinessProfile
    ) {
        authenticate(activity)
        completeProfile(role, profile)
    }

    suspend fun signIn(activity: android.app.Activity, role: String) {
        authenticate(activity)
        saveActiveRole(role)
    }

    private suspend fun authenticate(activity: android.app.Activity) {
        val clientId = getJson("/api/auth/google/mobile").optString("webClientId")
        if (clientId.isBlank()) error("Google Sign-In no está configurado en el servidor.")

        val idToken = GoogleSignInToken.request(activity, clientId)
        val auth = postJson("/api/auth/google/mobile", JSONObject().put("idToken", idToken))
        if (auth.optBoolean("pendingTwoFactor")) {
            cookies.clear()
            error("Esta cuenta requiere verificación 2FA. El acceso 2FA en la app nativa aún no está habilitado.")
        }
        if (!cookies.hasSession) error("El servidor no creó una sesión para esta cuenta.")
    }

    suspend fun completeProfile(role: String, profile: KuotaBusinessProfile) {
        require(role == "BUYER" || role == "SUPPLIER") { "El perfil seleccionado no es válido." }
        val result = postJson(
            "/api/v1/participants",
            JSONObject()
                .put("role", role)
                .put("identityDocumentType", profile.identityDocumentType)
                .put("identityDocumentNumber", profile.identityDocumentNumber)
                .put("legalName", profile.legalName)
                .put("address", profile.address)
                .put("phone", profile.phone)
        )
        if (!result.optBoolean("onboardingComplete")) {
            error("El servidor aún no confirma el guardado del perfil. Actualiza la API y aplica la migración de Kuota.")
        }
        saveActiveRole(role)
        preferences.edit().putBoolean("profile_complete_$role", true).apply()
    }

    fun hasCompletedProfile(role: String): Boolean =
        preferences.getBoolean("profile_complete_$role", false)

    suspend fun participantOrNull(role: String): JSONObject? {
        val participants = getJson("/api/v1/participants").optJSONArray("participants")
        for (index in 0 until (participants?.length() ?: 0)) {
            val participant = participants?.optJSONObject(index) ?: continue
            if (participant.optString("role") == role) return participant
        }
        return null
    }

    suspend fun participant(role: String): JSONObject =
        participantOrNull(role) ?: error("No se encontró el perfil ${role.lowercase()}.")

    suspend fun sales(): JSONObject = getJson("/api/v1/sales")

    suspend fun products(): JSONObject = getJson("/api/v1/products")

    suspend fun addProduct(name: String, price: String): JSONObject =
        postJson("/api/v1/products", JSONObject().put("name", name).put("price", price))

    suspend fun syncSale(
        amount: String,
        sourceApp: String,
        detectedAt: String,
        checksum: String
    ): JSONObject = postJson(
        "/api/v1/sales/sync-notification",
        JSONObject()
            .put("amount", amount)
            .put("sourceApp", sourceApp)
            .put("detectedAt", detectedAt)
            .put("checksum", checksum)
    )

    suspend fun createTransaction(
        supplierId: String,
        requestId: String,
        amount: String,
        termDays: Int
    ): JSONObject = postJson(
        "/api/v1/transactions",
        JSONObject()
            .put("supplierId", supplierId)
            .put("requestId", requestId)
            .put("amount", amount)
            .put("termDays", termDays)
    )

    suspend fun transactions(): JSONObject = getJson("/api/v1/transactions")

    suspend fun acceptTransaction(id: String): JSONObject =
        postJson("/api/v1/transactions/$id/supplier-accept", JSONObject())

    private fun saveActiveRole(role: String) {
        preferences.edit().putString("active_role", role).apply()
    }

    private suspend fun getJson(path: String): JSONObject = request(path, "GET", null)

    private suspend fun postJson(path: String, body: JSONObject): JSONObject =
        request(path, "POST", body)

    private suspend fun request(path: String, method: String, body: JSONObject?): JSONObject =
        withContext(Dispatchers.IO) {
            val builder = Request.Builder().url("$baseUrl$path")
            when (method) {
                "POST" -> builder.post(
                    (body ?: JSONObject()).toString().toRequestBody(jsonType)
                )
                else -> builder.get()
            }
            client.newCall(builder.build()).execute().use { response ->
                val responseBody = response.body?.string().orEmpty()
                val json = runCatching { JSONObject(responseBody) }.getOrNull()
                if (!response.isSuccessful) {
                    if (response.code == 401) cookies.clear()
                    error(json?.optString("error")?.takeIf { it.isNotBlank() }
                        ?: "Error de Kuota (${response.code}).")
                }
                json ?: error("Respuesta inválida del servidor Kuota.")
            }
        }

    companion object {
        @Volatile private var instance: KuotaApi? = null

        fun get(context: Context, baseUrl: String): KuotaApi =
            instance ?: synchronized(this) {
                instance ?: KuotaApi(context, baseUrl).also { instance = it }
            }
    }
}

private class EncryptedSessionCookieJar(context: Context) : CookieJar {
    private val preferences = context.getSharedPreferences("kuota_session", Context.MODE_PRIVATE)
    private val keyAlias = "kuota_session_cookie_v1"

    val hasSession: Boolean
        get() = storedCookie() != null

    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        val session = cookies.firstOrNull { it.name == "inventa_session" }
        if (session == null) return
        if (session.expiresAt <= System.currentTimeMillis()) {
            clear()
            return
        }
        val serialized = JSONObject()
            .put("name", session.name)
            .put("value", session.value)
            .put("domain", session.domain)
            .put("path", session.path)
            .put("expiresAt", session.expiresAt)
            .put("persistent", session.persistent)
            .put("hostOnly", session.hostOnly)
            .put("secure", session.secure)
            .put("httpOnly", session.httpOnly)
            .toString()
        preferences.edit().putString("cookie", encrypt(serialized)).apply()
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        val cookie = storedCookie() ?: return emptyList()
        if (!cookie.matches(url)) {
            clear()
            return emptyList()
        }
        return listOf(cookie)
    }

    private fun storedCookie(): Cookie? {
        val serialized = decrypt(preferences.getString("cookie", null)) ?: return null
        return try {
            val data = JSONObject(serialized)
            val name = data.getString("name")
            if (name != "inventa_session") {
                clear()
                return null
            }
            val expiresAt = data.getLong("expiresAt")
            if (data.getBoolean("persistent") && expiresAt <= System.currentTimeMillis()) {
                clear()
                return null
            }
            val domain = data.getString("domain")
            val builder = Cookie.Builder()
                .name(name)
                .value(data.getString("value"))
                .path(data.getString("path"))
            if (data.getBoolean("hostOnly")) builder.hostOnlyDomain(domain)
            else builder.domain(domain)
            if (data.getBoolean("persistent")) builder.expiresAt(expiresAt)
            if (data.getBoolean("secure")) builder.secure()
            if (data.getBoolean("httpOnly")) builder.httpOnly()
            builder.build()
        } catch (_: Exception) {
            clear()
            null
        }
    }

    fun clear() {
        preferences.edit().remove("cookie").apply()
    }

    private fun encrypt(value: String): String {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key())
        val encrypted = cipher.doFinal(value.toByteArray(Charsets.UTF_8))
        return Base64.encodeToString(
            cipher.iv + encrypted,
            Base64.NO_WRAP
        )
    }

    private fun decrypt(encoded: String?): String? {
        if (encoded.isNullOrBlank()) return null
        return try {
            val packed = Base64.decode(encoded, Base64.NO_WRAP)
            val iv = packed.copyOfRange(0, 12)
            val encrypted = packed.copyOfRange(12, packed.size)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, iv))
            String(cipher.doFinal(encrypted), Charsets.UTF_8)
        } catch (_: Exception) {
            clear()
            null
        }
    }

    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (store.getKey(keyAlias, null) as? SecretKey)?.let { return it }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(
                keyAlias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .build()
        )
        return generator.generateKey()
    }
}
