# Kuota (Financiamiento de Inventarios vía QR) — Guía de Ejecución y Arquitectura

Bienvenido a la implementación completa de **Kuota**, la solución de factoring de inventarios en punto de venta para Pymes basada en el PRD v1.0.

---

## 1. Demostración Interactiva en Vivo (Simulador de Alta Fidelidad)

Para ver y probar todo el flujo en tiempo real (App Comprador + App Proveedor sincronizadas en simultáneo con notificaciones Android 14, escáner láser de QR, cuenta regresiva de 60s y sonido háptico Web Audio):

### Abrir directamente en el navegador:
* **Archivo local:** [kuota_simulator.html](file:///c:/Users/josem/OneDrive/Escritorio/InventaAI/public/kuota_simulator.html)
* **Comando PowerShell para abrir:**
  ```powershell
  Start-Process "c:\Users\josem\OneDrive\Escritorio\InventaAI\public\kuota_simulator.html"
  ```

### Qué puedes probar en el simulador:
1. **Simulación de Notificaciones Yape / Plin:** Presiona los botones en la barra superior para disparar notificaciones push emergentes. Verás cómo el algoritmo de matching detecta montos que coinciden con el catálogo (marcando ventas como `COMPROBADA`) y recalcula en vivo el 70% de línea de crédito disponible.
2. **Escaneo de QR con CameraX:** Presiona el botón *"Escanear QR Proveedor"* en la App Comprador para activar el visor con haz láser animado.
3. **Checkout y Plazos de Financiamiento:** Ajusta el monto de compra (S/ 1,200), selecciona el plazo (15, 30, 45 o 60 días) e ingresa el PIN de seguridad (6 dígitos).
4. **Cuenta Regresiva de 60 Segundos y SSE:** Inicia la transacción. Verás el temporizador circular sincronizado.
5. **Aprobación en App Proveedor:** En el teléfono derecho (Proveedor), aparecerá automáticamente el modal con la cuota inicial adelantada por Kuota y botones de acción. Al confirmar, ambos teléfonos se sincronizan instantáneamente.

---

## 2. Ejecución del Backend con Docker Compose

La arquitectura del backend consta de:
* **PostgreSQL 16:** Con esquemas aislados `kuota_core` y `kuota_financial` (enclave seguro que previene dobles desembolsos y garantiza idempotencia estricta).
* **Redis 7:** Para orquestación Pub/Sub del timeout de 60 segundos y streaming de eventos SSE.
* **Spring Boot 3 + Kotlin API:** Servicios de matching, cálculo de línea al 70%, autenticación con BCrypt(12) y controlador SSE reactivo.

### Para levantar todo el backend con Docker:
```bash
# 1. Asegúrate de tener Docker Desktop iniciado
docker compose up --build -d
```

### Servicios levantados:
* **API Kuota:** `http://localhost:8080/api/v1`
* **PostgreSQL:** `localhost:5432` (Base de datos: `kuota_db`, usuario/contraseña: `postgres`/`postgres`)
* **Redis:** `localhost:6379`

### Endpoints Principales:
* `POST /api/v1/auth/buyer/setup-pin` — Registro de PIN con BCrypt(12)
* `POST /api/v1/auth/buyer/verify-pin` — Verificación con protección de bloqueo tras 3 intentos
* `POST /api/v1/sales/sync-batch` — Recepción de notificaciones parseadas por el Listener Móvil
* `GET /api/v1/financing/credit-line/{buyerId}` — Consulta de línea disponible (70% ventas verificadas - deuda)
* `POST /api/v1/transactions/initiate` — Creación de orden de financiamiento vía QR y timeout de 60s
* `GET /api/v1/transactions/{id}/live-status` — Stream de eventos Server-Sent Events (SSE) para la cuenta regresiva
* `POST /api/v1/transactions/{id}/supplier-confirm` — Confirmación del proveedor y cierre de factoring

---

## 3. Proyectos Android en Android Studio

Ambas aplicaciones están desarrolladas en **Kotlin** con **Jetpack Compose** y **Material Design 3**:

| Proyecto | Ruta | Componentes Clave |
| :--- | :--- | :--- |
| **App Comprador** | `mobile/kuota-buyer` | `NotificationListenerService` (Yape/Plin), `ForegroundService`, CameraX QR Scanner, Checkout, Countdown SSE Screen |
| **App Proveedor** | `mobile/kuota-supplier` | Generador de QR dinámico (ZXing), Dashboard de cuentas por cobrar, Modal de confirmación en tiempo real |
| **Monorepo Móvil** | `mobile/` | Contiene `settings.gradle.kts` unificado que permite abrir ambos módulos en una sola ventana |

### Instrucciones para abrir en Android Studio:
1. Inicia Android Studio.
2. Selecciona **Open** y navega a:
   * Para Comprador: `c:\Users\josem\OneDrive\Escritorio\InventaAI\mobile\kuota-buyer`
   * Para Proveedor: `c:\Users\josem\OneDrive\Escritorio\InventaAI\mobile\kuota-supplier`
   * Para ambos: `c:\Users\josem\OneDrive\Escritorio\InventaAI\mobile`
3. Deja que Gradle sincronice las dependencias (SDK 34, Compose BOM 2024.02.01, CameraX 1.3.2, ML Kit 17.2.0, ZXing 3.5.3).
4. Ejecuta en tu emulador o dispositivo físico Android 8.0+ (API 26+).

En las apps Android se configura un PIN Kuota de 6 dígitos al completar el perfil del negocio. El PIN protege la apertura y vuelve a solicitarse para enviar una solicitud de compra o aceptar una solicitud recibida. Si el dispositivo tiene biometría inscrita, puede usarse en lugar del PIN. El verificador del PIN se guarda localmente con una clave de Android Keystore; después de 5 intentos incorrectos se activa una espera progresiva. El PIN no se envía al servidor. Si se olvida, borra los datos de la app o reinstálala y vuelve a iniciar sesión para configurar otro.

---

## 4. Garantías de Privacidad y Cumplimiento Normativo (PRD 8.2)

1. **Cero PII Almacenada:** Los parsers de notificaciones (`PaymentNotificationParser.kt`) descartan inmediatamente cualquier nombre o número de teléfono del pagador. El backend solo almacena el monto, fecha y checksum SHA-256 para prevenir duplicados.
2. **Sin Custodia de Fondos:** Kuota no capta dinero de terceros; únicamente adelanta la cuota inicial al proveedor y gestiona el cobro diferido al comprador.
3. **Enclave Financiero Aislado:** Todas las órdenes de desembolso (`payout_orders`) residen en el esquema PostgreSQL independiente `kuota_financial`, garantizando idempotencia estricta por `transaction_id`.
