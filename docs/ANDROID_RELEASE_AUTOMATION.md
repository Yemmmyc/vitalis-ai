# Vitalis Care Android Release Automation Guide

This guide documents the automated build, signing, and release pipeline for **Vitalis Care** (`com.vitalis.app`) powered by GitHub Actions.

---

## 1. Pipeline Overview

The release automation consists of two dedicated GitHub Actions workflows:

### A. Continuous Build & Validation (`.github/workflows/android-build.yml`)
- **Triggers**: Every push to `main`, every pull request against `main`, and manual dispatch (`workflow_dispatch`).
- **Actions**:
  1. Sets up Node.js 20 and Java JDK 21 (Temurin).
  2. Installs root and client dependencies (`npm ci` and `npm ci --prefix client`).
  3. Compiles server TypeScript and runs MCP automated unit tests (`npm test`).
  4. Builds the web frontend client (`npm run client:build`).
  5. Synchronizes assets into the Capacitor Android project (`npx cap sync android`).
  6. Compiles the release APK (`assembleRelease`) and release App Bundle (`bundleRelease`).
  7. If signing secrets are configured, signs the artifacts using `r0adkll/sign-android-release@v1` and validates their signature with `apksigner verify`.
  8. If signing secrets are not yet configured, cleanly produces and uploads unsigned verification artifacts without breaking PR checks.
  9. Uploads APK and AAB build artifacts as downloadable workflow artifacts with 14-day retention.
  10. **Safety Guarantee**: Never creates or overwrites GitHub Releases on push to `main`.

### B. Official Version Release Publishing (`.github/workflows/android-release.yml`)
- **Triggers**:
  - Git tags matching `v*` (e.g., `v1.0.2`, `v1.1.0`).
  - Manual trigger via GitHub Actions UI (`workflow_dispatch`) with tag input.
- **Strict Release Guards**:
  - **Duplicate / Overwrite Protection**: Fails immediately if the tag is `v1.0.0` or `v1.0.1` (protecting the existing published submission release).
  - **Semantic Versioning Check**: Strictly validates `vMAJOR.MINOR.PATCH`.
  - **Signing Secrets Enforcement**: Strictly requires all 4 Android release signing secrets; if missing, fails immediately with clear guidance to prevent unauthenticated release publishing.
- **Release Steps**:
  1. Compiles, tests, and syncs web client with Capacitor.
  2. Dynamically applies `APP_VERSION_NAME` and `APP_VERSION_CODE` from the release tag.
  3. Builds release APK and App Bundle (AAB).
  4. Signs artifacts with the production keystore.
  5. Validates APK signature and certificate with `apksigner verify --verbose --print-certs`.
  6. Packages and names files:
     - `Vitalis-Care-<version>.apk`
     - `Vitalis-Care-<version>.aab`
  7. Uploads downloadable workflow artifacts.
  8. Creates an official **GitHub Release** via `softprops/action-gh-release@v2` attaching both signed `.apk` and `.aab` assets.

---

## 2. Required GitHub Repository Secrets

To enable production signing, configure the following secrets in your GitHub repository:
**Repository Settings** &rarr; **Secrets and variables** &rarr; **Actions** &rarr; **New repository secret**:

| Secret Name | Description | Example / Format |
|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded release `.keystore` or `.jks` file | `MIIKPQIBAzCCCgcGCSqGSIb3DQEHAaCCCfgE...` |
| `ANDROID_KEYSTORE_PASSWORD` | Password protecting the keystore file | `YourKeystorePassword` |
| `ANDROID_KEY_ALIAS` | Key alias name inside the keystore | `vitalis-release` |
| `ANDROID_KEY_PASSWORD` | Password for the key alias | `YourKeyPassword` |

> [!NOTE]
> For compatibility, alternative secret names `SIGNING_KEY`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` are also automatically recognized by the workflows.

### How to Generate a Keystore (if needed)

If you need to generate a new production release keystore:
```bash
keytool -genkeypair -v -keystore vitalis-release.keystore -alias vitalis-release -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Vitalis Care, O=Vitalis AI, C=US"
```

### How to Convert Keystore to Base64

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("vitalis-release.keystore")) | Set-Clipboard
```

**On Linux / macOS:**
```bash
base64 -w 0 vitalis-release.keystore | pbcopy # macOS: pbcopy, Linux: xclip / wl-copy
```
Paste the clipboard content into the `ANDROID_KEYSTORE_BASE64` secret in GitHub.

---

## 3. How to Trigger a Release

### Method 1: Git Tag (Recommended)
Tag a new version (greater than v1.0.1) and push to GitHub:
```bash
git tag v1.0.2
git push origin v1.0.2
```
GitHub Actions will automatically run `Android Release Publish`, build, sign, verify, and publish release `v1.0.2`.

### Method 2: GitHub Actions Web UI (Manual Dispatch)
1. Go to repository **Actions** tab: [vitalis-ai/actions](https://github.com/Yemmmyc/vitalis-ai/actions)
2. Select **Android Release Publish** in the left sidebar.
3. Click **Run workflow**.
4. Enter:
   - Release version tag (e.g. `v1.0.2`)
   - Optional custom release title & notes.
5. Click **Run workflow**.

---

## 4. Local Build Verification

To reproduce the release build locally:

1. Ensure **JDK 21** and **Node.js 20+** are active:
   ```powershell
   $env:JAVA_HOME = "C:\Users\yemmm\AppData\Local\Java\jdk-21"
   ```
2. Build client and sync Capacitor:
   ```bash
   npm run cap:build
   ```
3. Assemble release APK and AAB:
   ```powershell
   .\android\gradlew.bat -p android assembleRelease bundleRelease
   ```
4. Build outputs:
   - APK: `android/app/build/outputs/apk/release/app-release-unsigned.apk` (versionCode 2, versionName 1.0.1)
   - AAB: `android/app/build/outputs/bundle/release/app-release.aab` (versionCode 2, versionName 1.0.1)

---

## 5. Signing Migration & Device Installation Impact

> [!WARNING]
> **Important installation notice for existing users & testers:**
> The original `v1.0.1` APK published on GitHub Releases was signed using the default Android debug certificate (`CN=Android Debug`). Android enforces package signature consistency for application updates:
> - If an Android device currently has the debug-signed `v1.0.1` APK installed, trying to install a new production-signed APK (e.g. `v1.0.2`) directly over it will fail with:
>   `INSTALL_FAILED_UPDATE_INCOMPATIBLE: Existing package com.vitalis.app signatures do not match newer version`
> - **Solution**: The user must **uninstall** the existing `v1.0.1` app from their device before installing the new production-signed release.
> - Once the production-signed release is installed, all subsequent production-signed releases (`v1.0.3`, `v1.1.0`, etc.) will update in-place normally without requiring uninstallation.
