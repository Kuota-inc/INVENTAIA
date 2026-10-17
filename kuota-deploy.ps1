#!/usr/bin/env pwsh
# ============================================================================
# kuota-deploy.ps1 — Build & Deploy Kuota en Emulador Android via ADB
# Ejecutar desde la raiz del proyecto:
#   .\kuota-deploy.ps1             → compila e instala ambas apps
#   .\kuota-deploy.ps1 -App buyer  → solo App Comprador
#   .\kuota-deploy.ps1 -App supplier → solo App Proveedor
#   .\kuota-deploy.ps1 -StartEmulator → lanza el emulador primero
#   .\kuota-deploy.ps1 -StartEmulator -App buyer
# ============================================================================
param(
    [ValidateSet("buyer","supplier","both")]
    [string]$App = "both",
    [switch]$StartEmulator,
    [switch]$SkipBuild,
    [string]$Device = ""   # número de serie ADB; si vacío usa el único conectado
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── Variables de entorno ────────────────────────────────────────────────────
$ANDROID_SDK = "$env:LOCALAPPDATA\Android\Sdk"
$ADB         = "$ANDROID_SDK\platform-tools\adb.exe"
$EMULATOR    = "$ANDROID_SDK\emulator\emulator.exe"
$AVD_NAME    = "Medium_Phone_API_37.0"

$BUYER_DIR    = Join-Path $PSScriptRoot "mobile\kuota-buyer"
$SUPPLIER_DIR = Join-Path $PSScriptRoot "mobile\kuota-supplier"
$BUYER_APK    = Join-Path $BUYER_DIR    "app\build\outputs\apk\debug\app-debug.apk"
$SUPPLIER_APK = Join-Path $SUPPLIER_DIR "app\build\outputs\apk\debug\app-debug.apk"

$BUYER_PKG    = "pe.kuota.buyer"
$SUPPLIER_PKG = "pe.kuota.supplier"

# ─── Helper: colores en terminal ─────────────────────────────────────────────
function Write-Step  { param([string]$Msg) Write-Host "`n▶  $Msg" -ForegroundColor Cyan }
function Write-Ok    { param([string]$Msg) Write-Host "✓  $Msg" -ForegroundColor Green }
function Write-Warn  { param([string]$Msg) Write-Host "⚠  $Msg" -ForegroundColor Yellow }
function Write-Fail  { param([string]$Msg) Write-Host "✗  $Msg" -ForegroundColor Red; exit 1 }

# ─── 1. Verificar ADB ────────────────────────────────────────────────────────
Write-Step "Verificando ADB..."
if (-not (Test-Path $ADB)) { Write-Fail "ADB no encontrado en: $ADB" }
$adbVer = & $ADB version | Select-String "Version" | Select-Object -First 1
Write-Ok "ADB listo — $adbVer"

# ─── 2. Lanzar Emulador (opcional) ───────────────────────────────────────────
if ($StartEmulator) {
    Write-Step "Lanzando emulador: $AVD_NAME ..."
    if (-not (Test-Path $EMULATOR)) { Write-Fail "Emulador no encontrado en: $EMULATOR" }
    Start-Process -FilePath $EMULATOR -ArgumentList "-avd `"$AVD_NAME`" -no-snapshot-save" -WindowStyle Normal
    Write-Ok "Emulador iniciando en segundo plano..."
    Write-Warn "Esperando 30 segundos para que el emulador arranque..."
    Start-Sleep -Seconds 30
}

# ─── 3. Esperar dispositivo / obtener número de serie ────────────────────────
Write-Step "Esperando dispositivo conectado..."
$timeout = 60
$elapsed = 0
do {
    $devices = & $ADB devices | Select-String "device$" | Where-Object { $_ -notmatch "List of" }
    if ($devices) { break }
    Start-Sleep -Seconds 3
    $elapsed += 3
    if ($elapsed -ge $timeout) { Write-Fail "Timeout: ningún dispositivo disponible. Asegúrate de tener un emulador corriendo o un dispositivo conectado." }
} while ($true)

if ($Device -eq "") {
    # tomar el primero disponible
    $serial = ($devices | Select-Object -First 1).ToString().Split("`t")[0].Trim()
} else {
    $serial = $Device
}
Write-Ok "Dispositivo objetivo: $serial"
$adbTarget = "$ADB -s $serial"

# ─── 4. Función de build con Gradle Wrapper ──────────────────────────────────
function Build-App {
    param([string]$Dir, [string]$Name)
    Write-Step "Compilando $Name (gradlew assembleDebug)..."

    $gradlewBat = Join-Path $Dir "gradlew.bat"
    $gradlew    = Join-Path $Dir "gradlew"

    # Bajar Gradle Wrapper si no existe
    if (-not (Test-Path $gradlewBat)) {
        Write-Warn "gradlew no encontrado. Descargando Gradle 8.5 wrapper..."
        $wrapperJar = Join-Path $Dir "gradle\wrapper\gradle-wrapper.jar"
        $wrapperJarUrl = "https://raw.githubusercontent.com/gradle/gradle/v8.5.0/gradle/wrapper/gradle-wrapper.jar"

        # Intentar descarga directa del jar
        try {
            Invoke-WebRequest -Uri $wrapperJarUrl -OutFile $wrapperJar -UseBasicParsing
        } catch {
            Write-Warn "No se pudo descargar gradle-wrapper.jar automáticamente."
            Write-Warn "Solución: Abre $Dir en Android Studio y deja que sincronice Gradle."
            Write-Warn "O instala Gradle 8.5 globalmente: https://gradle.org/releases/"
            return $false
        }

        # Generar gradlew.bat
        $batContent = @"
@rem Wrapper script for Gradle
@if "%DEBUG%"=="" @echo off
@rem Add default JVM options here
set JAVA_HOME_RESTORED=
if defined JAVA_HOME goto :java_check
:java_check
set JAVA_EXE=java.exe
set GRADLE_OPTS=-Dfile.encoding=UTF-8 -Duser.home=%USERPROFILE%
"%JAVA_EXE%" -classpath "%~dp0\gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
"@
        $batContent | Out-File -FilePath $gradlewBat -Encoding ASCII
    }

    $prevLocation = Get-Location
    Set-Location $Dir
    try {
        $env:ANDROID_HOME = $ANDROID_SDK
        $env:ANDROID_SDK_ROOT = $ANDROID_SDK
        & cmd /c "gradlew.bat assembleDebug 2>&1"
        if ($LASTEXITCODE -ne 0) {
            Set-Location $prevLocation
            return $false
        }
    } finally {
        Set-Location $prevLocation
    }
    Write-Ok "$Name compilado correctamente."
    return $true
}

# ─── 5. Build ────────────────────────────────────────────────────────────────
if (-not $SkipBuild) {
    if ($App -eq "buyer" -or $App -eq "both") {
        $ok = Build-App -Dir $BUYER_DIR -Name "App Comprador (kuota-buyer)"
        if (-not $ok) { Write-Fail "Build fallido para App Comprador. Revisa los errores arriba." }
    }
    if ($App -eq "supplier" -or $App -eq "both") {
        $ok = Build-App -Dir $SUPPLIER_DIR -Name "App Proveedor (kuota-supplier)"
        if (-not $ok) { Write-Fail "Build fallido para App Proveedor. Revisa los errores arriba." }
    }
}

# ─── 6. Instalar APKs via ADB ────────────────────────────────────────────────
function Install-Apk {
    param([string]$ApkPath, [string]$Package, [string]$Serial)
    Write-Step "Instalando $Package en $Serial..."
    if (-not (Test-Path $ApkPath)) {
        Write-Fail "APK no encontrado: $ApkPath. Asegúrate de compilar primero o usar -SkipBuild si ya compilaste."
    }
    & $ADB -s $Serial install -r -t $ApkPath
    if ($LASTEXITCODE -ne 0) { Write-Fail "Instalación fallida para $Package" }
    Write-Ok "$Package instalado correctamente."
}

if ($App -eq "buyer" -or $App -eq "both") {
    Install-Apk -ApkPath $BUYER_APK -Package $BUYER_PKG -Serial $serial
}
if ($App -eq "supplier" -or $App -eq "both") {
    Install-Apk -ApkPath $SUPPLIER_APK -Package $SUPPLIER_PKG -Serial $serial
}

# ─── 7. Lanzar Apps ──────────────────────────────────────────────────────────
Write-Step "Lanzando aplicaciones..."

if ($App -eq "buyer" -or $App -eq "both") {
    Write-Step "Iniciando App Comprador..."
    & $ADB -s $serial shell am start -n "$BUYER_PKG/.ui.MainActivity"
    Write-Ok "App Comprador lanzada."
}

if ($App -eq "supplier" -or $App -eq "both") {
    Write-Step "Iniciando App Proveedor..."
    & $ADB -s $serial shell am start -n "$SUPPLIER_PKG/.ui.SupplierMainActivity"
    Write-Ok "App Proveedor lanzada."
}

# ─── 8. Resumen final ────────────────────────────────────────────────────────
Write-Host "`n" -NoNewline
Write-Host "══════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  ✅  KUOTA MVP instalado y corriendo en $serial" -ForegroundColor Magenta
Write-Host "══════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Comandos ADB útiles:" -ForegroundColor White
Write-Host "  · Ver logs de la app Comprador:" -ForegroundColor Gray
Write-Host "    $ADB -s $serial logcat -s pe.kuota.buyer" -ForegroundColor DarkGray
Write-Host "  · Ver logs de la app Proveedor:" -ForegroundColor Gray
Write-Host "    $ADB -s $serial logcat -s pe.kuota.supplier" -ForegroundColor DarkGray
Write-Host "  · Captura de pantalla:" -ForegroundColor Gray
Write-Host "    $ADB -s $serial exec-out screencap -p > screen.png" -ForegroundColor DarkGray
Write-Host "  · Desinstalar apps:" -ForegroundColor Gray
Write-Host "    $ADB -s $serial uninstall $BUYER_PKG" -ForegroundColor DarkGray
Write-Host "    $ADB -s $serial uninstall $SUPPLIER_PKG" -ForegroundColor DarkGray
Write-Host ""
