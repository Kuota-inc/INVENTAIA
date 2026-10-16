package pe.kuota.api.service

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.*
import pe.kuota.api.model.User
import pe.kuota.api.model.UserRole
import pe.kuota.api.model.UserSecurity
import pe.kuota.api.repository.UserRepository
import pe.kuota.api.repository.UserSecurityRepository
import java.time.Instant
import java.util.Optional
import java.util.UUID

class AuthServiceTest {

    private val userRepository = mock(UserRepository::class.java)
    private val userSecurityRepository = mock(UserSecurityRepository::class.java)
    private val authService = AuthService(userRepository, userSecurityRepository)

    @Test
    fun `onboarding with valid DNI and 6 digit PIN succeeds`() {
        val command = OnboardingCommand(
            dniRuc = "71234567",
            role = UserRole.BUYER,
            legalName = "Distribuidora Lima",
            phone = "+51987654321",
            pin = "123456"
        )

        `when`(userRepository.findByDniRuc("71234567")).thenReturn(Optional.empty())
        `when`(userRepository.save(any(User::class.java))).thenAnswer { it.getArgument(0) as User }
        `when`(userSecurityRepository.save(any(UserSecurity::class.java))).thenAnswer { it.getArgument(0) as UserSecurity }

        val response = authService.onboarding(command)

        assertNotNull(response.accessToken)
        assertEquals(UserRole.BUYER, response.role)
        assertEquals("Distribuidora Lima", response.legalName)
    }

    @Test
    fun `onboarding with invalid DNI format throws IllegalArgumentException`() {
        val command = OnboardingCommand(
            dniRuc = "123", // Inválido: debe tener 8 dígitos
            role = UserRole.BUYER,
            legalName = "Comercial",
            phone = "987654321",
            pin = "123456"
        )

        assertThrows<IllegalArgumentException> {
            authService.onboarding(command)
        }
    }

    @Test
    fun `onboarding with non-6-digit PIN throws IllegalArgumentException`() {
        val command = OnboardingCommand(
            dniRuc = "71234567",
            role = UserRole.BUYER,
            legalName = "Comercial",
            phone = "987654321",
            pin = "1234" // Inválido: debe tener 6 dígitos
        )

        assertThrows<IllegalArgumentException> {
            authService.onboarding(command)
        }
    }

    @Test
    fun `login with 3 failed PIN attempts locks the account for 15 minutes`() {
        val userId = UUID.randomUUID()
        val user = User(
            id = userId,
            dniRuc = "71234567",
            role = UserRole.BUYER,
            phone = "987654321",
            legalName = "Bodega Central"
        )
        // Hash de "123456"
        val security = UserSecurity(
            userId = userId,
            pinHash = org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12).encode("123456"),
            failedAttempts = 2 // Ya falló 2 veces
        )

        `when`(userRepository.findByDniRuc("71234567")).thenReturn(Optional.of(user))
        `when`(userSecurityRepository.findByUserId(userId)).thenReturn(Optional.of(security))

        // Tercer intento fallido
        val exception = assertThrows<IllegalStateException> {
            authService.loginWithPin("71234567", "999999")
        }

        assertTrue(exception.message!!.contains("bloqueada por 15 minutos"))
        assertNotNull(security.lockedUntil)
    }
}
