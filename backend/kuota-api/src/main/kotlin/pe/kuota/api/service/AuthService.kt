package pe.kuota.api.service

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pe.kuota.api.model.User
import pe.kuota.api.model.UserRole
import pe.kuota.api.model.UserSecurity
import pe.kuota.api.repository.UserRepository
import pe.kuota.api.repository.UserSecurityRepository
import java.time.Duration
import java.time.Instant
import java.util.UUID

data class OnboardingCommand(
    val dniRuc: String,
    val role: UserRole,
    val legalName: String,
    val phone: String,
    val pin: String
)

data class AuthTokenResponse(
    val userId: UUID,
    val role: UserRole,
    val legalName: String,
    val accessToken: String,
    val expiresInSeconds: Long
)

/**
 * Servicio de Autenticación, Onboarding y Cifrado de Credenciales (PRD Secciones 5.1, 6.1 y 8.1).
 * Implementa validación de formato DNI/RUC, hashing con BCrypt (salt rounds = 12)
 * y protección de fuerza bruta con bloqueo tras 3 intentos erróneos.
 */
@Service
class AuthService(
    private val userRepository: UserRepository,
    private val userSecurityRepository: UserSecurityRepository
) {

    private val passwordEncoder = BCryptPasswordEncoder(12)

    @Transactional
    fun onboarding(command: OnboardingCommand): AuthTokenResponse {
        validateIdentityFormat(command.dniRuc)
        validatePinFormat(command.pin)

        if (userRepository.findByDniRuc(command.dniRuc).isPresent) {
            throw IllegalArgumentException("El DNI/RUC ${command.dniRuc} ya se encuentra registrado")
        }

        // 1. Crear Usuario
        val user = User(
            dniRuc = command.dniRuc.trim(),
            role = command.role,
            phone = command.phone.trim(),
            legalName = command.legalName.trim()
        )
        val savedUser = userRepository.save(user)

        // 2. Cifrar y Almacenar PIN de Seguridad
        val hashedPin = passwordEncoder.encode(command.pin)
        val security = UserSecurity(
            userId = savedUser.id,
            pinHash = hashedPin
        )
        userSecurityRepository.save(security)

        return generateTokenResponse(savedUser)
    }

    @Transactional
    fun loginWithPin(dniRuc: String, pin: String): AuthTokenResponse {
        val user = userRepository.findByDniRuc(dniRuc.trim())
            .orElseThrow { IllegalArgumentException("Credenciales inválidas") }

        val security = userSecurityRepository.findByUserId(user.id)
            .orElseThrow { IllegalStateException("Registro de seguridad no encontrado") }

        val now = Instant.now()

        // Verificar si la cuenta está bloqueada por intentos fallidos
        if (security.lockedUntil != null && security.lockedUntil!!.isAfter(now)) {
            val minutesLeft = Duration.between(now, security.lockedUntil).toMinutes() + 1
            throw IllegalStateException("Cuenta temporalmente bloqueada. Intenta nuevamente en $minutesLeft minutos")
        }

        // Validar PIN
        if (!passwordEncoder.matches(pin, security.pinHash)) {
            security.failedAttempts += 1
            if (security.failedAttempts >= 3) {
                security.lockedUntil = now.plus(Duration.ofMinutes(15))
                security.failedAttempts = 0
                userSecurityRepository.save(security)
                throw IllegalStateException("PIN incorrecto. Has superado el límite de 3 intentos. Cuenta bloqueada por 15 minutos")
            }
            userSecurityRepository.save(security)
            throw IllegalArgumentException("PIN incorrecto. Intentos restantes: ${3 - security.failedAttempts}")
        }

        // Login exitoso: restablecer intentos
        security.failedAttempts = 0
        security.lockedUntil = null
        userSecurityRepository.save(security)

        return generateTokenResponse(user)
    }

    private fun validateIdentityFormat(dniRuc: String) {
        val cleaned = dniRuc.trim()
        val isDni = cleaned.length == 8 && cleaned.all { it.isDigit() }
        val isRuc = cleaned.length == 11 && cleaned.all { it.isDigit() } &&
                (cleaned.startsWith("10") || cleaned.startsWith("15") || cleaned.startsWith("17") || cleaned.startsWith("20"))

        if (!isDni && !isRuc) {
            throw IllegalArgumentException("Identificación inválida. Ingrese un DNI de 8 dígitos o un RUC válido de 11 dígitos")
        }
    }

    private fun validatePinFormat(pin: String) {
        if (pin.length != 6 || !pin.all { it.isDigit() }) {
            throw IllegalArgumentException("El PIN de seguridad debe contener exactamente 6 dígitos numéricos")
        }
    }

    private fun generateTokenResponse(user: User): AuthTokenResponse {
        val simulatedJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                java.util.Base64.getUrlEncoder().encodeToString(user.id.toString().toByteArray()) +
                ".signature"
        return AuthTokenResponse(
            userId = user.id,
            role = user.role,
            legalName = user.legalName,
            accessToken = simulatedJwt,
            expiresInSeconds = 86400
        )
    }
}
