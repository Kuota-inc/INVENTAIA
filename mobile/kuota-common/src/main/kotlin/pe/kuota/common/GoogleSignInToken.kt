package pe.kuota.common

import android.app.Activity
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential

internal object GoogleSignInToken {

    private const val PROVIDER_UNAVAILABLE = "no provider dependencies found"

    private const val STALE_PLAY_SERVICES =
        "Este dispositivo tiene una versión antigua de Google Play Services. " +
            "Actualízala desde Play Store y vuelve a intentar."

    suspend fun request(activity: Activity, serverClientId: String): String {
        val option = GetGoogleIdOption.Builder()
            .setServerClientId(serverClientId)
            .setFilterByAuthorizedAccounts(false)
            .setAutoSelectEnabled(false)
            .build()

        val credential = try {
            CredentialManager.create(activity).getCredential(
                context = activity,
                request = GetCredentialRequest.Builder()
                    .addCredentialOption(option)
                    .build()
            ).credential
        } catch (failure: Exception) {
            if (failure.message?.contains(PROVIDER_UNAVAILABLE, ignoreCase = true) == true) {
                error(STALE_PLAY_SERVICES)
            }
            throw failure
        }

        if (credential !is CustomCredential ||
            credential.type != GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
        ) {
            error("Google no devolvió una credencial válida.")
        }
        return GoogleIdTokenCredential.createFrom(credential.data).idToken
    }
}
