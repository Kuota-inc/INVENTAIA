# PRD — Kuota (Financiamiento de Inventarios vía QR)
**Versión:** 1.0 (MVP)
**Fecha:** Octubre 2026
**Autor:** Jean

---

## 1. Resumen Ejecutivo

Kuota es una plataforma de **factoring** que intermedia la compra de inventario entre un proveedor y una empresa compradora (pyme distribuidora). El comprador financia parte de su compra escaneando un QR propio del proveedor; Kuota adelanta la cuota inicial al proveedor y cobra posteriormente al comprador el monto financiado más intereses. Kuota **no custodia fondos de terceros**: solo ejecuta payouts hacia proveedores y payins de las cuotas del préstamo. La contraparte legal de cada operación de factoring es Kuota.

La app tiene dos frontends móviles nativos en **Kotlin**, consumiendo una **arquitectura de microservicios**:
- **App Comprador** (usuario final / pyme distribuidora)
- **App Proveedor**

---

## 2. Objetivo del Producto

Permitir que una pyme distribuidora compre inventario financiando parte del monto mediante un score crediticio basado en su historial de ventas verificado, mientras el proveedor recibe su pago adelantado sin asumir el riesgo de cobranza a plazo.

---

## 3. Alcance de la v1

### Dentro de alcance
- Onboarding de comprador y proveedor
- Verificación automática de ventas vía listener de notificaciones (matching por monto)
- Gestión de catálogo de productos (comprador)
- Flujo de financiamiento de compra vía escaneo de QR propio
- Gestión de cuentas por pagar (comprador) y cuentas por cobrar (proveedor)
- Confirmación de pago de cuota inicial por el proveedor (manual, con timeout)
- Autenticación con PIN/biometría
- Cifrado y aislamiento de microservicios sensibles

### Fuera de alcance (v1 — pendiente para iteraciones futuras)
- Cálculo real del score crediticio (en v1 se usa un **% referencial fijo configurable**, no un modelo de score)
- Mitigación de fraude en la confirmación de pago del proveedor (el proveedor confirma manualmente sin validación cruzada)
- Interoperabilidad con QR Perú / Niubiz (el QR es propio, cerrado al ecosistema Kuota)
- Soporte iOS (el listener de notificaciones depende de capacidades exclusivas de Android; ver sección 9.4)
- Disputas y reversos de transacciones

---

## 4. Actores

| Actor | Descripción |
|---|---|
| **Comprador** | Pyme distribuidora que compra inventario y accede a financiamiento |
| **Proveedor** | Vendedor de inventario que recibe pagos adelantados vía Kuota |
| **Kuota (sistema)** | Contraparte del factoring; ejecuta payouts/payins y calcula montos |

---

## 5. Requerimientos Funcionales — App Comprador

### 5.1 Onboarding
- Captura de DNI o RUC
- Captura de nombre / razón social
- Captura de dirección
- Captura de número telefónico
- Validación de identidad (mínimo: formato de DNI/RUC; validación contra RENIEC/SUNAT queda como mejora futura, no bloqueante para v1)
- Configuración de PIN y/o biometría obligatoria antes de poder operar

### 5.2 Home (estilo Yape)
- Historial de ventas del comprador, mostrando por cada transacción:
  - Monto
  - Estado: **Comprobada** / **No comprobada**
- **Tarjeta de financiamiento disponible**: muestra el monto accesible, calculado como un **% referencial fijo** (configurable por Kuota, ej. 70%) sobre la suma de montos de ventas marcadas como "Comprobada". *(El cálculo real vía score crediticio queda fuera de alcance de v1 — ver sección 3)*
- Botones de navegación:
  - Mis Productos
  - Mis Pagos Pendientes
  - Financiar Compra

### 5.3 Listener de Notificaciones (Verificación de Ventas)
- **Requisito no negociable**: el servicio de escucha de notificaciones debe permanecer activo en todo momento (foreground service) para que la app funcione — sin él, el usuario no puede operar.
- El servicio intercepta notificaciones de apps de pago (ej. Yape, Plin) y extrae el **monto** recibido.
- El sistema cruza el monto extraído contra los precios configurados en "Mis Productos".
  - Si el monto coincide con el precio de algún producto → transacción marcada **Comprobada**.
  - Si no coincide con ningún precio configurado → transacción marcada **No comprobada**.
- **No se extrae ni almacena el nombre del pagador** — el matching es únicamente por monto.
- Solo las transacciones "Comprobadas" alimentan la base de cálculo del monto de financiamiento disponible.

### 5.4 Mis Productos
- CRUD de productos: nombre, precio.
- Estos precios son la referencia usada por el listener de notificaciones para el matching de ventas.

### 5.5 Mis Pagos Pendientes
- Lista de compras financiadas activas, mostrando por cada una:
  - % restante por pagar
  - Monto pendiente

### 5.6 Financiar Compra
1. El usuario presiona "Financiar Compra" → se abre el scanner de QR.
2. Escanea el QR propio del proveedor.
3. Define el **monto de compra** y el **plazo de pago**.
4. Presiona "Aceptar":
   - Se crea una **cuenta por pagar** en el apartado del comprador por el monto financiado (no es un movimiento de fondos inmediato — Kuota cobrará esta cuota posteriormente mediante payin).
   - Se dispara el payout de la cuota inicial hacia el proveedor.
5. Se muestra una **pantalla de carga** con un **timeout de 1 minuto**, a la espera de que el proveedor confirme la recepción del pago (por otra plataforma o efectivo).
   - Si el proveedor confirma dentro del minuto → la transacción se marca exitosa y culmina el flujo.
   - Si se cumple el timeout sin confirmación → *(comportamiento a definir; sugerido: estado "Pendiente de confirmación" visible en Mis Pagos Pendientes, reintentable por el proveedor)*.

> Nota: la validación de fraude en este flujo de confirmación queda explícitamente fuera de alcance de la v1 (ver sección 3).

---

## 6. Requerimientos Funcionales — App Proveedor

### 6.1 Onboarding
- Mismos campos que el comprador: DNI/RUC, nombre/razón social, dirección, teléfono.
- PIN/biometría obligatorios.

### 6.2 Home
- **Tarjeta de monto total a recibir** en el próximo pago (desembolso de Kuota).
- Historial de ventas, mostrando por cada venta:
  - Monto recibido (cuota inicial)
  - Monto pendiente (resto del desembolso de Kuota)
- Botón que abre el **QR propio del proveedor** para que los compradores lo escaneen.

### 6.3 Confirmación de Pago
- Cuando un comprador financia una compra, el proveedor recibe una notificación/pantalla para **confirmar que recibió la cuota inicial** (por otra plataforma o efectivo).
- Esta confirmación dispara el cierre exitoso de la transacción en la app del comprador.

---

## 7. Flujo de Transacción (Estados)

```
[Comprador escanea QR] 
        ↓
[Define monto + plazo] 
        ↓
[Acepta] → crea cuenta por pagar (comprador) + dispara payout cuota inicial (proveedor)
        ↓
[Pantalla de carga — timeout 1 min]
        ↓
   ┌────────────────┬─────────────────────┐
   │ Proveedor confirma   │ Timeout sin confirmación │
   ↓                  ↓
[Transacción exitosa]   [Pendiente de confirmación]
```

---

## 8. Requerimientos No Funcionales

### 8.1 Seguridad
- **Cifrado en reposo y en tránsito** para todos los datos sensibles (DNI/RUC, datos de contacto, montos).
- **Tokenización** de datos sensibles en los microservicios que los procesan.
- **Aislamiento de microservicios**: los servicios que manejan dinero (payouts, payins, cuentas por pagar/cobrar) deben estar separados de los servicios que no tocan dinero (catálogo de productos, perfil, notificaciones), con límites de red y permisos independientes.
- **Autenticación con PIN y/o biometría** obligatoria para acceder a la app y para confirmar operaciones de financiamiento.

### 8.2 Disponibilidad del Listener
- El foreground service de notificaciones debe sobrevivir a reinicios de app y optimizaciones de batería del sistema operativo (requiere excepción de "battery optimization" solicitada explícitamente al usuario en onboarding).
- Permiso `BIND_NOTIFICATION_LISTENER_SERVICE` — exclusivo de Android.

### 8.3 Plataforma
- v1 es **Android-only** (el listener de notificaciones no es viable en iOS).

---

## 9. Arquitectura Técnica (alto nivel)

### 9.1 Stack
- **Lenguaje:** Kotlin (Android nativo para ambos frontends; backend en Kotlin/Spring o Ktor)
- **Arquitectura:** Microservicios

### 9.2 Microservicios propuestos

| Microservicio | Responsabilidad |
|---|---|
| `auth-service` | Onboarding, identidad, PIN/biometría, sesiones |
| `user-service` | Perfil de comprador/proveedor |
| `product-service` | CRUD de productos y precios |
| `sales-verification-service` | Recibe montos extraídos del listener, hace matching contra precios, marca Comprobada/No comprobada |
| `financing-service` | Lógica de financiamiento: monto disponible (% referencial v1), creación de cuentas por pagar, cálculo de cuotas |
| `qr-service` | Generación y validación de QR propio |
| `payout-service` | Desembolsos hacia proveedores (aislado, zona de alta seguridad) |
| `payin-service` | Cobranza de cuotas a compradores (aislado, zona de alta seguridad) |
| `transaction-service` | Orquestación del flujo de financiamiento y estados (incluye timeout de confirmación) |
| `notification-service` | Push notifications internas de la app (confirmaciones, recordatorios) |

### 9.3 Modelo de datos (alto nivel)
- **Usuario** (comprador/proveedor): id, DNI/RUC, nombre, dirección, teléfono, rol
- **Producto**: id, usuario_id (comprador), nombre, precio
- **Venta**: id, usuario_id, monto, estado (comprobada/no_comprobada), timestamp
- **Transacción de financiamiento**: id, comprador_id, proveedor_id, monto, plazo, estado, timestamp_confirmación
- **Cuenta por pagar**: id, comprador_id, transacción_id, monto_total, %_restante
- **Cuenta por cobrar**: id, proveedor_id, transacción_id, monto_recibido, monto_pendiente

### 9.4 Notas de plataforma (iOS)
Apple no permite leer notificaciones de otras apps bajo ninguna modalidad. Cualquier expansión a iOS requerirá un mecanismo alternativo de verificación de ventas (ej. integración directa vía API con la billetera/banco, o reenvío manual del comprobante).

---

## 10. Riesgos y Supuestos Conocidos (explícitamente aceptados para v1)

- **Fraude en confirmación del proveedor:** no mitigado en v1. El proveedor podría confirmar sin haber recibido el pago, o negarse a confirmar un pago real recibido. Pendiente para iteración futura.
- **Score crediticio:** v1 usa un % fijo referencial en vez de una fórmula real de score. La fórmula de score crediticio queda como desarrollo futuro.
- **Matching solo por monto:** sin el nombre del pagador, dos ventas de distintos clientes con el mismo monto configurado para un producto podrían generar falsos positivos de "Comprobada". Riesgo aceptado para v1.

---

## 11. Próximos Pasos
1. Definir comportamiento exacto tras el timeout de 1 minuto sin confirmación del proveedor.
2. Diseñar la fórmula de score crediticio (fuera de alcance de este PRD).
3. Diseñar el mecanismo de mitigación de fraude en la confirmación de pago.
4. Definir estructura de tasas/intereses del factoring (no cubierto en este documento).
