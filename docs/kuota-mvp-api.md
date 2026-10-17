# Kuota MVP API

The production Supabase project has the schema from [`db/kuota_mvp_api.sql`](../db/kuota_mvp_api.sql) applied. Its verification query confirmed RLS is enabled on all five Kuota tables and direct `anon`/`authenticated` reads are denied. Apply the script in the SQL Editor for any other Supabase environment before calling these endpoints. Configure `SUPABASE_SERVICE_ROLE_KEY` as a server-only variable; never expose it to the browser or Android apps.

All routes require an authenticated session with access to the active workspace:

| Method | Route | Purpose |
|---|---|---|
| `GET`, `POST` | `/api/v1/participants` | Read or save a `BUYER`/`SUPPLIER` business profile. Supplier responses include the QR payload. |
| `GET`, `POST` | `/api/v1/products` | List or add the buyer's products. |
| `PATCH` | `/api/v1/products/{id}` | Update product name/price or deactivate it. |
| `GET`, `POST` | `/api/v1/sales` | List recent sales/credit reference or submit a notification. |
| `POST` | `/api/v1/sales/sync-notification` | Same notification contract for the Android listener. |
| `GET`, `POST` | `/api/v1/transactions` | List history or create a pending request with `supplierId`, UUID `requestId`, `amount`, and `termDays`. |
| `POST` | `/api/v1/transactions/{id}/supplier-accept` | Supplier accepts the request; it is idempotent. |

Sales are internally matched when a client notification amount exactly matches an active product. The API presents this as `PRODUCT_MATCH` or `NO_PRODUCT_MATCH`; `paymentProviderVerified` is always `false`. This is **not proof that a payment occurred**: Kuota does not query Yape/Plin or authenticate their notifications. `matchedNotificationAmount` is the sum of matched client notifications, and `referenceEstimate` is a percentage-based display estimate only, not available or approved credit. The old `verifiedSalesBase` and `availableCredit` response keys remain temporarily for compatibility with older Android APKs and carry the same non-verified, non-approved values. Supplier acceptance records acknowledgement only. No payout, payin, interest calculation, or money movement is implemented. The native Kotlin apps use the authenticated routes for products, sales, and transaction requests.

The unified Kuota Android app signs in with Google through `/api/auth/google/mobile`, lets each account switch between buyer and supplier profiles, and calls these APIs using an encrypted, app-local session cookie. Set the server's `GOOGLE_CLIENT_ID` to the Web OAuth client ID; register the Android OAuth client for application ID `pe.kuota.buyer` with its signing-certificate SHA-1 fingerprint. The API base defaults to `https://kuota-ia.vercel.app` and can be overridden with the Gradle property `kuotaApiBaseUrl`. Native sign-in does not support accounts requiring 2FA yet. The buyer's optional notification matching also requires Android's notification-access permission.

The production API deployment and database schema are in place. The Android apps do not access Supabase directly and must never receive `SUPABASE_SERVICE_ROLE_KEY`.

`POST /api/v1/participants` requires `role`, `identityDocumentType` (`DNI` or `RUC`), `identityDocumentNumber` (8 or 11 digits respectively), `legalName`, `address`, and `phone` (7–15 digits, optional leading `+`). It creates the role profile or updates an existing one in the active workspace. `GET` returns these fields and `onboardingComplete`; older profiles with no business details remain readable but must complete the onboarding before being used in the Android app. Re-running `db/kuota_mvp_api.sql` adds the fields and consistency constraint without removing existing participant records. Deploy the updated API as well as running the SQL migration; the Android client rejects a successful-looking response from an older API that does not confirm profile completion.
