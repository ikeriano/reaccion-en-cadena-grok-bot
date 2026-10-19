#!/bin/bash
# Compila el APK firmado: tools/apk.sh [salida.apk]
set -e
cd "$(dirname "$0")/.."
OUT=${1:-/workspace/reaccion/build/ReaccionEnCadena-2.0.apk}
KS=/cursor/stores/store-b6a3ca2b-7c3b-4225-8f28-1a7e8cfa3201/keystores
npx esbuild src/main.js --bundle --format=iife --minify --outfile=js/app.js
W=android/app/src/main/assets/www; rm -rf "$W"; mkdir -p "$W"
cp -r index.html style.css menu.css rec.css manifest.webmanifest sw.js version.json icon-192.png icon-512.png js img audio voz cortinillas "$W"/
mkdir -p android/keystore && cp "$KS/ikeriano-2026.jks" "$KS/keystore.properties" android/keystore/
(cd android && ./gradlew --no-daemon -q assembleRelease)
mkdir -p "$(dirname "$OUT")"; cp android/app/build/outputs/apk/release/app-release.apk "$OUT"
BT=$(ls -d ~/android-sdk/build-tools/* | sort -V | tail -1)
"$BT/apksigner" verify --print-certs "$OUT" | grep -E "SHA-256|DN"
"$BT/aapt2" dump badging "$OUT" | head -1
sha256sum "$OUT"
