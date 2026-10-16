package pe.kuota.api.controller

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pe.kuota.api.model.UserRole
import pe.kuota.api.service.AuthService
import pe.kuota.api.service.AuthTokenResponse
import pe.kuota.api.service.OnboardingCommand

data class OnboardingDto(
    @field:NotBlank
    val dniRuc: String,

    val role: UserRole,

    @field:NotBlank
    val legalName: String,

    @field:NotBlank
    val phone: String,

    @field:Size(min = 6, max = 6)
    val pin: String
)

data class LoginPinDto(
    @field:NotBlank
    val dniRuc: String,

    @field:Size(min = 6, max = 6)
    val pin: String
)

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/onboarding")
    fun onboarding(@Valid @RequestBody dto: OnboardingDto): ResponseEntity<AuthTokenResponse> {
        val response = authService.onboarding(
            OnboardingCommand(
                dniRuc = dto.dniRuc,
                role = dto.role,
                legalName = dto.legalName,
                phone = dto.phone,
                pin = dto.pin
            )
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PostMapping("/login-pin")
    fun loginPin(@Valid @RequestBody dto: LoginPinDto): ResponseEntity<AuthTokenResponse> {
        val response = authService.loginWithPin(
            dniRuc = dto.dniRuc,
            pin = dto.pin
        )
        return ResponseEntity.ok(response)
    }
}
