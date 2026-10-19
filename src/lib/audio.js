// Audio de «Reacción en cadena».
// NORMA DE IKER: solo música y sonidos OFICIALES que manda él. Nunca música sustituta ni «parecida».
//  · Música: únicamente la sintonía oficial (audio/sintonia.m4a). Si falta, silencio.
//  · Sonidos del programa: huecos (audio/<nombre>.mp3|m4a|wav). Mientras Iker no los mande, suena
//    SILENCIO, salvo cinco efectos mínimos de interfaz (clic, ding, error, pulsador y tic de reloj).
//  · Voces: Piper TTS pregeneradas (voz/), presentador inventado.
import { audioCtx, synth } from './media.js';
import { decir, callar, configurarVoces } from './voces.js';
import { cfg } from '../cfg.js';
configurarVoces({ activo: () => cfg.voz, volumen: () => 1, rapida: () => cfg.leeVel === 'rapida', velocidad: () => (window.__VEL || 1) });

/** Huecos para los sonidos oficiales que mandará Iker (archivo esperado → para qué sirve) */
export const HUECOS = [
  ['sintonia', 'Sintonía (cabecera y menú)'], ['cortinilla', 'Entrada de cada prueba'], ['acierto', 'Acierto'], ['fallo', 'Fallo'],
  ['pulsador', 'Pulsador'], ['reloj', 'Reloj / cuenta atrás'], ['bote', 'Bote de La última cadena'], ['ultima_palabra', 'Tensión de La última palabra'],
  ['ganadores', 'Equipo ganador'], ['aplausos', 'Público / aplausos'], ['despedida', 'Despedida'],
];
// audio/oficiales.json = { "sintonia": "sintonia.m4a", … } (solo los archivos oficiales que hay; así no se busca nada a ciegas)
const lista = fetch('audio/oficiales.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
const yaOficial = {}; HUECOS.forEach(([k]) => { yaOficial[k] = lista.then(l => l[k] ? 'audio/' + l[k] : null); });
export const estadoHuecos = () => Promise.all(HUECOS.map(async ([k, t]) => [k, t, !!(await yaOficial[k])]));

const vivos = new Set(); let musica = null; let master = null;
const out = () => { const c = audioCtx(); if (!master) { master = c.createGain(); master.connect(c.destination); } return [c, master]; };
// efectos mínimos de interfaz (no imitan nada del programa)
const UI = {
  tecla: (c, d, t) => synth.tone(c, d, t, 900, 0.04, 'square', 0.04),
  acierto: (c, d, t) => synth.tone(c, d, t, 1046, 0.16, 'sine', 0.16),
  fallo: (c, d, t) => synth.tone(c, d, t, 180, 0.22, 'square', 0.08),
  pulsador: (c, d, t) => synth.tone(c, d, t, 660, 0.12, 'square', 0.08),
  reloj: (c, d, t) => synth.tone(c, d, t, 1500, 0.025, 'square', 0.04),
};

export const me = {
  aplicarNiveles() { if (musica?.a) musica.a.volume = cfg.music ? cfg.musicVol : 0; },
  /** Sonido del programa: el oficial si está en audio/; si no, efecto mínimo de interfaz o silencio */
  async play(k, { volume = 1 } = {}) {
    if (!cfg.sfx) return null; volume *= cfg.sfxVol;
    const url = yaOficial[k] ? await yaOficial[k] : null;
    if (url) { const a = new Audio(url); a.volume = Math.min(1, volume); vivos.add(a); a.onended = () => vivos.delete(a); a.play().catch(() => {}); return a; }
    if (!UI[k]) return null; // hueco en silencio hasta que llegue el sonido oficial
    try { const [c, d0] = out(); const d = c.createGain(); d.gain.value = volume; d.connect(d0); UI[k](c, d, c.currentTime + 0.01); setTimeout(() => d.disconnect(), 3000); } catch (e) { /* sin audio */ }
    return null;
  },
  /** Música: SOLO la sintonía oficial. loop en el menú, una vez en la cabecera */
  async sintonia({ loop = true, desde = 0 } = {}) {
    if (musica && musica.k === 'sintonia' && !musica.a.paused) return musica.a;
    this.stopMusic(); const mia = { k: 'sintonia' }; musica = mia;
    const url = await yaOficial.sintonia; if (musica !== mia || !url) return null;
    const a = new Audio(url); a.loop = loop; a.currentTime = desde; a.volume = cfg.music ? cfg.musicVol : 0; mia.a = a; a.play().catch(() => {}); return a;
  },
  sonando: () => !!(musica && musica.a && !musica.a.paused),
  fundirMusica(ms = 900) { const m = musica; if (!m || !m.a) return; musica = null; const a = m.a; let v = a.volume; const paso = v / (ms / 60); const iv = setInterval(() => { v -= paso; a.volume = Math.max(0, v); if (v <= 0) { a.pause(); clearInterval(iv); } }, 60); },
  stopMusic() { const m = musica; musica = null; if (m && m.a) m.a.pause(); },
  say(texto, voz = 'presentador', o = {}) { if (window.__frasesUsadas) window.__frasesUsadas.add(JSON.stringify({ v: voz, t: String(texto).trim(), q: !!o.pregunta })); return decir(String(texto || '').replace(/<[^>]+>/g, ''), { voz, ...o }); },
  stopVoice() { callar(); },
  stopAll() { vivos.forEach(a => a.pause()); vivos.clear(); this.stopMusic(); this.stopVoice(); },
};
