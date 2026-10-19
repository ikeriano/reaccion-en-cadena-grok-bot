// Núcleo del flujo (misma organización que sus otros APK): token de cancelación, esperas cancelables,
// overlay, bocadillo del presentador, marcador de los dos equipos, avisos y panel de respuesta.
import { me } from '../lib/audio.js';
import { cfg } from '../cfg.js';

export const $ = s => document.querySelector(s);
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const VEL = () => window.__VEL || 1;
export const miles = n => { const v = Math.round(Number(n) || 0); return (v < 0 ? '-' : '') + String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
export const euros = n => miles(n) + ' €';
export const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ ]/g, '').replace(/\s+/g, ' ').trim();
export const baraja = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const azar = a => a[Math.floor(Math.random() * a.length)];
function lev(a, b) { const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
/** ¿La respuesta vale? (sin tildes, admite una errata en palabras de 6 letras o más) */
export function vale(resp, buenas) { const r = norm(resp); if (!r) return false; return [].concat(buenas).some(b => { const x = norm(b); return r === x || r.replace(/^(el|la|los|las|un|una) /, '') === x || (x.length >= 6 && lev(r, x) <= 1); }); }

// ---------- cancelación (☰ vuelve al menú desde cualquier punto) ----------
export const ABORT = { abort: true };
let token = 0; let limpiezas = new Set();
export function nuevoToken() { token++; const l = [...limpiezas]; limpiezas = new Set(); l.forEach(f => f()); return token; }
export function check(t) { if (t !== token) throw ABORT; }
export const Dt = (ms, t = token) => new Promise((res, rej) => { const f = () => { clearTimeout(id); rej(ABORT); }; const id = setTimeout(() => { limpiezas.delete(f); t === token ? res() : rej(ABORT); }, ms / VEL()); limpiezas.add(f); });
export const Zi = p => new Promise((res, rej) => { const f = () => rej(ABORT); limpiezas.add(f); p.then(v => { limpiezas.delete(f); res(v); }, e => { limpiezas.delete(f); rej(e); }); });
export const alLimpiar = f => limpiezas.add(f);
addEventListener('unhandledrejection', e => { if (e.reason === ABORT) e.preventDefault(); });

/** Cronómetro. fin: promesa que se resuelve con 'TIEMPO' al agotarse */
export class Reloj {
  constructor(seg, onTick) {
    this.ilimitado = !seg || seg === Infinity || !cfg.reloj; this.total = seg; this.rest = this.ilimitado ? Infinity : seg; this.onTick = onTick; this.corriendo = false; this.terminado = false;
    this.fin = new Promise(r => (this._res = r)); let ult = Math.ceil(this.rest);
    this._iv = setInterval(() => {
      if (!this.corriendo || this.terminado || this.ilimitado) return;
      this.rest = Math.max(0, this.rest - 0.1 * VEL()); this.onTick && this.onTick(this.rest);
      if (Math.ceil(this.rest) !== ult) { ult = Math.ceil(this.rest); if (ult <= 5) me.play('reloj'); }
      if (this.rest <= 0) { this.terminado = true; clearInterval(this._iv); this._res('TIEMPO'); }
    }, 100);
    this._l = () => this.stop(); limpiezas.add(this._l);
    onTick && onTick(this.rest);
  }
  start() { this.corriendo = true; return this; }
  pause() { this.corriendo = false; }
  stop() { limpiezas.delete(this._l); if (this.terminado) return; this.terminado = true; clearInterval(this._iv); this._res('STOP'); }
}
export const fmtT = s => s === Infinity ? '∞' : String(Math.ceil(s));

// ---------- overlay ----------
const ov = () => $('#overlay');
export function cerrarOverlay() { ov().classList.add('hidden'); ov().innerHTML = ''; }
export function mostrar(html) { ov().innerHTML = html; ov().classList.remove('hidden'); ov().onclick = null; }
/** Rótulo de prueba: dos píldoras rosa-naranja como el logo */
export async function banner(titulo, sub = '', ms = 2600) {
  me.play('cortinilla');
  mostrar(`<div class="rc-banner"><div class="rc-pill">${esc(titulo)}</div>${sub ? `<div class="rc-sub">${esc(sub)}</div>` : ''}</div>`);
  await Dt(ms); cerrarOverlay();
}
/** Elección en overlay: resuelve con data-z del botón pulsado */
export function elegir(html, sel = '[data-z]') {
  mostrar(html);
  return Zi(new Promise(res => { const bs = ov().querySelectorAll(sel); bs.forEach(b => b.onclick = e => { e.stopPropagation(); me.play('tecla'); res(b.dataset.z); }); if (window.__AUTO && bs.length) setTimeout(() => res(bs[Math.min(bs.length - 1, window.__AUTO_ELIGE || 0)].dataset.z), 400 / VEL()); })).finally(cerrarOverlay);
}
export async function textoGrande(t, sub = '', ms = 2600) { mostrar(`<div class="txt">${t}</div>${sub ? `<div class="sub">${sub}</div>` : ''}`); await Dt(ms); cerrarOverlay(); }

// ---------- bocadillo y voces ----------
export function cortinilla(n, maxMs = 40000) {
  return new Promise(res => { const c = document.querySelector('#cort'), v = document.querySelector('#cortVid'); if (!c) return res();
    let hecho = false; const fin = () => { if (hecho) return; hecho = true; clearTimeout(t); v.pause(); v.removeAttribute('src'); v.load(); c.classList.add('hidden'); c.onclick = null; res(); };
    const t = setTimeout(fin, maxMs); c.onclick = fin; v.onended = fin; v.onerror = fin; v.src = 'cortinillas/' + n + '.mp4'; c.classList.remove('hidden');
    v.play().catch(() => { v.muted = true; v.play().catch(fin); }); });
}
export const bubble = { hasta: 0, nombre: 'Presentador', quien: null };
export function di(texto, ms = 3500, quien = null, nombre = null) { const b = $('#bubble'); b.innerHTML = `<b>${esc(nombre || bubble.nombre)}:</b> ${esc(texto)}`; b.classList.toggle('conc', quien != null); b.classList.remove('hidden'); bubble.hasta = performance.now() + ms / VEL(); bubble.quien = quien; }
const espera = t => Dt(Math.max(1400, String(t).length * 55));
/** El presentador dice una frase (bocadillo + voz Piper pregenerada) y espera a que termine */
export async function habla(texto, ms = 3800) {
  di(texto, ms + 1500);
  if (!cfg.voz) return espera(texto);
  await Zi(me.say(texto, 'presentador'));
}
/** Un concursante dice algo (bocadillo; sin voz propia todavía) */
export async function hablaC(c, texto, ms = 1500) { di(texto, ms + 900, c.fig ?? null, c.nombre); await Dt(ms); }
/** El presentador lee una pista (voz de pistas pregenerada) */
export function leer(texto) { if (cfg.lee && cfg.voz) return me.say(texto, 'presentador', { pregunta: true }); return Promise.resolve(); }

// ---------- marcador de los dos equipos ----------
export const hud = {
  show(v) { $('#hud').classList.toggle('hidden', !v); },
  set(G, activo = -1) {
    if (!G) return;
    const eq = (e, i) => `<div class="rc-eq e${i} ${i === activo ? 'act' : ''} ${e.fuera ? 'fuera' : ''}"><div class="n">${esc(e.nombre)}${e.humano ? ' <i>TÚ</i>' : ''}</div><div class="d">${euros(e.dinero)}</div>${e.puntos != null ? `<div class="p">${e.puntos} ${e.puntos === 1 ? 'acierto' : 'aciertos'}</div>` : ''}</div>`;
    $('#hudA').innerHTML = eq(G.eq[0], 0); $('#hudB').innerHTML = eq(G.eq[1], 1);
  },
  timer(s, low = 5) { const t = $('#timer'); t.textContent = fmtT(s); t.classList.toggle('low', s !== Infinity && s <= low); },
  sinTimer() { $('#timer').textContent = ''; $('#timer').classList.remove('low'); },
  ronda(txt) { $('#roundTxt').textContent = txt || ''; },
};

// ---------- piezas del HUD: hashtag, rótulos, avisos, botones, créditos ----------
export function hashtag(t) { const h = $('#hashtag'); h.textContent = t || ''; h.classList.toggle('on', !!t); }
export async function rotulo(titulo, sub = '', ms = 3200) {
  const l = $('#lower3'); const d = document.createElement('div'); d.className = 'l3'; d.innerHTML = `<b>${esc(titulo)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}`;
  l.appendChild(d); l.classList.remove('hidden'); await Dt(ms); d.classList.add('out'); setTimeout(() => { d.remove(); if (!l.children.length) l.classList.add('hidden'); }, 400);
}
export function limpiarRotulos() { $('#lower3').innerHTML = ''; $('#lower3').classList.add('hidden'); }
export function toast(t, ms = 2500) { const e = $('#toast'); e.textContent = t; e.classList.remove('hidden'); clearTimeout(toast._t); toast._t = setTimeout(() => e.classList.add('hidden'), ms); }
export function acciones(lista) { const a = $('#actions'); a.innerHTML = ''; (lista || []).forEach(x => { const b = document.createElement('button'); b.className = 'abtn ' + (x.cls || ''); b.textContent = x.label; b.onclick = e => { e.stopPropagation(); me.play('tecla'); a.innerHTML = ''; x.fn(); }; a.appendChild(b); }); }
export async function rodarCreditos(bloques, ms = 14000) {
  const c = $('#credits'), r = $('#creditsRoll'); r.innerHTML = bloques.map(([t, l]) => `<h4>${esc(t)}</h4>${l.map(esc).join('<br>')}`).join('');
  c.classList.remove('hidden'); r.style.transition = 'none'; r.style.transform = 'translateY(0)'; r.offsetHeight;
  const dur = ms / VEL(); r.style.transition = `transform ${dur}ms linear`; r.style.transform = `translateY(calc(-100% - ${c.clientHeight}px))`;
  try { await Dt(ms); } finally { c.classList.add('hidden'); }
}
export function ocultarCreditos() { $('#credits').classList.add('hidden'); }

// ---------- panel de grafismos (#juego) ----------
export function grafismo(html) { const j = $('#juego'); if (html == null) { j.classList.add('hidden'); j.innerHTML = ''; return j; } j.innerHTML = html; j.classList.remove('hidden'); return j; }

/**
 * Panel de respuesta abajo: campo de texto + botones.
 * extra = [{z, t, cls, disabled}] botones adicionales (Paso, Comodín…). Resuelve {z:'ok', txt} | {z} | 'TIEMPO'.
 * auto = respuesta que da el modo automático de pruebas (?auto).
 */
export function pedir({ ph = 'Escribe tu respuesta', extra = [], auto = null, reloj = null, autoMs = 900 } = {}) {
  const box = $('#resp'); box.innerHTML = `<input id="respIn" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${esc(ph)}"><button class="abtn gold" data-z="ok">Responder ✔</button>${extra.map(x => `<button class="abtn ${x.cls || ''}" data-z="${x.z}" ${x.disabled ? 'disabled' : ''}>${esc(x.t)}</button>`).join('')}`;
  box.classList.remove('hidden'); const inp = box.querySelector('#respIn');
  setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) { /* */ } }, 50);
  const p = new Promise(res => {
    let hecho = false; const fin = v => { if (hecho) return; hecho = true; box.classList.add('hidden'); box.innerHTML = ''; try { inp.blur(); } catch (e) { /* */ } res(v); };
    box.querySelectorAll('[data-z]').forEach(b => b.onclick = e => { e.stopPropagation(); me.play('tecla'); fin(b.dataset.z === 'ok' ? { z: 'ok', txt: inp.value } : { z: b.dataset.z }); });
    inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') fin({ z: 'ok', txt: inp.value }); };
    inp.onpointerdown = e => e.stopPropagation();
    if (reloj) reloj.fin.then(v => { if (v === 'TIEMPO') fin('TIEMPO'); });
    alLimpiar(() => fin('ABORT'));
    if (window.__AUTO && auto != null) setTimeout(() => { inp.value = typeof auto === 'function' ? auto() : auto; setTimeout(() => fin(inp.value.startsWith('§') ? { z: inp.value.slice(1) } : { z: 'ok', txt: inp.value }), 350 / VEL()); }, autoMs / VEL());
  });
  return Zi(p);
}
export function cerrarPedir() { const b = $('#resp'); b.classList.add('hidden'); b.innerHTML = ''; }
/** Botón grande de pulsador (también Espacio). Resuelve true al pulsar. */
export function pulsadorBtn(txt = '¡PULSAR!') {
  const b = $('#pulsa'); b.textContent = txt; b.classList.remove('hidden');
  let fin; const p = new Promise(r => { fin = v => { b.classList.add('hidden'); removeEventListener('keydown', k); r(v); }; });
  const k = e => { if (e.code === 'Space' && !document.activeElement?.matches('input')) { e.preventDefault(); me.play('pulsador'); fin(true); } };
  b.onclick = e => { e.stopPropagation(); me.play('pulsador'); fin(true); }; addEventListener('keydown', k); alLimpiar(() => fin(false));
  return { p, cancelar: () => fin(false) };
}
