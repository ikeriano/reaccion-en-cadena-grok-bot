#!/usr/bin/env python3
"""Pregenera la voz del presentador de «Reacción en cadena» con Piper TTS.
Voz ORIGINAL: modelo genérico es_ES-davefx-medium (CC0) transformado (tono -2 semitonos con rubberband,
ritmo 0,95 y entonación propia). No clona ni imita a ninguna persona.
Uso: gen_voces.py frases.json <carpeta_juego> [<carpeta_modelos>]
frases.json = [{"v": "presentador", "t": "texto", "q": false}, ...]  (window.__frases() del juego)
Crea voz/<hash>.mp3 y voz/q/<hash>.mp3 con sus index.json {hash: duración}."""
import json, os, sys, wave, subprocess, tempfile
from piper import PiperVoice, SynthesisConfig
VOCES = {'presentador': ('es_ES-davefx-medium', SynthesisConfig(length_scale=0.95, noise_scale=0.62, noise_w_scale=0.75), 'rubberband=pitch=0.8909,highpass=f=70,acompressor=threshold=-18dB:ratio=2.5,loudnorm=I=-17:TP=-1.5')}
def fnv(s):
    h = 0x811c9dc5
    for b in s.encode('utf-8'):
        h ^= b; h = (h * 0x01000193) & 0xffffffff
    return '%08x' % h
def sintetizar(voz, modelo_dir, texto, out):
    nombre, conf, filtro = VOCES[voz]
    if voz not in cache: cache[voz] = PiperVoice.load(os.path.join(modelo_dir, nombre + '.onnx'))
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp: wav = tmp.name
    with wave.open(wav, 'wb') as w: cache[voz].synthesize_wav(texto, w, syn_config=conf)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-af', filtro, '-ac', '1', '-ar', '22050', '-b:a', '40k', out], check=True); os.unlink(wav)
    d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout.strip()
    return round(float(d), 2)
cache = {}
if __name__ == '__main__':
    frases, juego = json.load(open(sys.argv[1])), sys.argv[2]
    modelos = sys.argv[3] if len(sys.argv) > 3 else '/workspace/tts'
    idx = {}
    for sub in ('', 'q'):
        d = os.path.join(juego, 'voz', sub); os.makedirs(d, exist_ok=True)
        p = os.path.join(d, 'index.json'); idx[sub] = json.load(open(p)) if os.path.exists(p) else {}
    hechas = 0
    for f in frases:
        v, t, q = f['v'], f['t'].strip(), bool(f.get('q'))
        if not t: continue
        sub = 'q' if q else ''; h = fnv(v + '|' + t); out = os.path.join(juego, 'voz', sub, h + '.mp3')
        if h in idx[sub] and os.path.exists(out): continue
        idx[sub][h] = sintetizar(v, modelos, t, out); hechas += 1
        if hechas % 25 == 0: print(hechas, 'frases…', flush=True)
    for sub in ('', 'q'):
        json.dump(idx[sub], open(os.path.join(juego, 'voz', sub, 'index.json'), 'w'))
    print('nuevas', hechas, 'total', len(idx['']), '+', len(idx['q']))
