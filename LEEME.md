# Reacción en cadena 2.0 — com.ikeriano.reaccionencadena.gb (presenta Ion Aramendi, cortinillas oficiales)
Juego web (Three.js + esbuild) empaquetado como app Android (WebView). Todo en español.

- 8 pruebas: Palabras encadenadas, La minicadena, El centro de la cadena, El embudo, Una lleva a la otra, Complicidad ganadora, La última cadena y La última palabra.
- Plató 3D según las referencias, con el logo oficial.
- Música: SOLO la sintonía oficial (audio/sintonia.m4a). Los sonidos oficiales que faltan son huecos en silencio (ver audio/oficiales.json). Nunca se mete música sustituta.
- Presentador inventado (Rubén Lazo) con voz Piper original (davefx transformada, no clonada), pregenerada en voz/.
- Opciones: calidad gráfica (baja/media/alta), 10 normas sorpresa (No por defecto), sonidos, voz, nombres.

## Desarrollo
    npm ci
    npx esbuild src/main.js --bundle --format=iife --minify --outfile=js/app.js
    python3 -m http.server 8771     # http://localhost:8771/
Pruebas: node tools/flujo.mjs entreno:<prueba> /tmp/x 2   ·   node tools/capturas_menu.mjs /tmp/x
Voces: node tools/frases.mjs y luego tools/gen_voces.py.

## APK
tools/apk.sh (ver android/README.md). El keystore NO está en el repo.
