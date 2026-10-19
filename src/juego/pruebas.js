// Las 8 pruebas de «Reacción en cadena», en el orden del programa (historia.md de Iker).
import { me } from '../lib/audio.js';
import { cfg } from '../cfg.js';
import { NS } from './normas.js';
import { F } from './frases.js';
import { ENCADENADAS, CANCIONES, CADENAS7, EMBUDO, COMPLICIDAD, DESEMPATE, ULTIMAS, ULTIMA_PALABRA, SEÑUELOS } from './datos.js';
import { $, esc, euros, baraja, azar, vale, Dt, Zi, alLimpiar, Reloj, banner, elegir, di, habla, hablaC, leer, hud, toast, grafismo, pedir, pulsadorBtn, rotulo, norm , cortinilla } from './core.js';

const R = (a, b) => a + Math.random() * (b - a);
const cl = x => Math.max(0.02, Math.min(0.97, x));
const rv = { p: x => cl(x * (NS.tiene('r_fallones') ? 0.75 : 1) * (NS.tiene('r_fuertes') ? 1.25 : 1)), ms: x => x * (NS.tiene('r_lentos') ? 1.6 : 1) * (NS.tiene('r_fuertes') ? 0.85 : 1) };
const autoResp = c => () => Math.random() < (window.__AUTO_OK ?? 0.75) ? [].concat(c)[0] : 'NOSE';
const esl = (t, cls = 'az', extra = '') => `<div class="esl ${cls}" ${extra}><span>${esc(t)}</span></div>`;
const letras = (w, n) => [...w].slice(0, n).join('');
/** «CU·······S» de La última palabra */
const conHuecos = (w, ini, fin = true) => [...w].map((c, i) => i < ini || (fin && i === w.length - 1) ? c : '·').join(' ');

// ---------- utilidades comunes ----------
let P = null, api = null;
export function enlazar(a) { api = a; P = () => a.P(); }
const cam = (n, x) => api.cam(n, x);
function figsEq(e) { return e === 0 ? [0, 1, 2] : [3, 4, 5]; }
function quien(G, e, k = 0) { const m = G.eq[e].miembros[k % 3]; return { nombre: m.nombre, fig: m.fig }; }

/** Suma dinero a un equipo (con las normas «Primer acierto doble» y «Racha premiada») */
export function premio(G, e, n) {
  if (e === 0 && NS.tiene('s_doble') && !G.primerAcierto) { G.primerAcierto = true; n *= 2; toast('🎲 Primer acierto doble: ' + euros(n)); }
  G.eq[e].dinero += n; me.play('acierto');
  figsEq(e).forEach(i => P().salta(i));
  if (e === 0) { G.racha = (G.racha || 0) + 1; if (NS.tiene('s_racha') && G.racha % 3 === 0) { G.eq[0].dinero += 3000; toast('🎲 Racha premiada: +3.000 €'); } }
  hud.set(G, e);
}
function fallo(G, e) { me.play('fallo'); if (e === 0) G.racha = 0; }
/** Carrera de pulsadores: 0 = tu equipo, 1 = rivales, null = nadie */
async function carrera(G, { ms = 6000, prob = 0.5, min = 1500, max = 5000, sinRival = false, sinYo = false } = {}) {
  const tR = rv.ms(R(min, max)), quiere = !sinRival && Math.random() < prob;
  const pb = sinYo ? null : pulsadorBtn();
  const lista = [Dt(ms).then(() => null)];
  if (pb) lista.push(pb.p.then(v => v ? 0 : new Promise(() => {})));
  if (quiere && tR < ms) lista.push(Dt(tR).then(() => 1));
  if (window.__AUTO && pb && Math.random() < (window.__AUTO_PULSA ?? 0.75)) lista.push(Dt(R(700, Math.min(ms - 300, 4200))).then(() => 0));
  const r = await Zi(Promise.race(lista)); pb && pb.cancelar();
  if (r === 1) { me.play('pulsador'); P().luzEquipo(1, true); } if (r === 0) P().luzEquipo(0, true);
  return r;
}
/** Tu equipo responde con reloj. Devuelve {z:'bien'|'mal'|'tiempo'|<extra>, txt} */
async function responder(G, buenas, { seg = 10, ph = 'Escribe la palabra', extra = [], auto } = {}) {
  hud.set(G, 0); const r = new Reloj(seg, s => hud.timer(s)).start();
  const v = await pedir({ ph, extra, reloj: r, auto: auto ?? autoResp(buenas) });
  r.stop(); hud.sinTimer();
  if (v === 'TIEMPO') { me.play('fallo'); return { z: 'tiempo' }; }
  if (v === 'ABORT') return { z: 'abort' };
  if (v.z === 'ok') return { z: vale(v.txt, buenas) ? 'bien' : 'mal', txt: v.txt };
  return v;
}
/** Los rivales responden: dicen la palabra buena o un señuelo */
async function rivalDice(G, buena, p, k = 0) { await Dt(R(700, 1300)); const ok = Math.random() < rv.p(p); await hablaC(quien(G, 1, k), (ok ? buena : azar(SEÑUELOS.filter(s => s !== buena))) + '.', 1300); return ok; }
const elegirSlot = (sel = '.esl.pick') => Zi(new Promise(res => {
  const els = [...$('#juego').querySelectorAll(sel)]; els.forEach(el => el.onclick = e => { e.stopPropagation(); me.play('tecla'); res(+el.dataset.i); });
  if (window.__AUTO && els.length) setTimeout(() => res(+els[0].dataset.i), 500);
}));
function luces(e) { P().luzEquipo(0, e === 0); P().luzEquipo(1, e === 1); }

// =====================================================================================
// 1 · PALABRAS ENCADENADAS (2.000 € por acierto, pulsador)
// =====================================================================================
export async function encadenadas(G) {
  const S = azar(ENCADENADAS); const val = NS.tiene('p_enc') ? 4000 : 2000;
  P().banda('PALABRAS ENCADENADAS'); cam('presentador'); await cortinilla('02_entrada_la_cadena'); await banner('Palabras encadenadas', 'Tema: ' + S.tema); await habla(F.encadenadas);
  const estado = Array(6).fill(null);
  const pinta = (act, def) => grafismo(`<div class="rc-tit">PALABRAS ENCADENADAS · <b>${esc(S.tema.toUpperCase())}</b> · ${euros(val)}</div>
    <div class="rc-fila n6">${S.p.map(([w], i) => estado[i] != null ? esl(w, estado[i] === -1 ? 'gr' : 'az') : i === act ? esl(w[0] + ' ' + '· '.repeat(w.length - 1), 'na') : esl('', 've')).join('')}</div>
    ${def ? `<div class="rc-pista">${esc(def)}</div>` : ''}`);
  for (let i = 0; i < 6; i++) {
    const [w, def] = S.p[i]; pinta(i, def); cam('pantallaJ'); leer(def); await Dt(900); cam('equipos');
    let t = await carrera(G, { ms: 7500, prob: 0.6, min: 2200, max: 7000 }), ok = false; const fuera = new Set();
    while (t != null && !ok) {
      fuera.add(t);
      if (t === 0) { const r = await responder(G, w, { seg: 8 }); ok = r.z === 'bien'; if (!ok) { fallo(G, 0); await hablaC(quien(G, 0), (r.txt || '…').toUpperCase(), 800); } }
      else ok = await rivalDice(G, w, 0.72, i);
      if (ok) { premio(G, t, val); estado[i] = t; await habla(F.acierto, 1200); break; }
      fallo(G, t); const otro = 1 - t; if (fuera.has(otro)) break;
      await habla(F.rebote, 1200); t = otro;
      if (t === 1 && Math.random() > rv.p(0.6)) { t = null; break; }
    }
    if (!ok) { estado[i] = -1; await habla(F.nadie, 1200); }
    luces(-1); pinta(i + 1, null); await Dt(900);
  }
  await Dt(1200); grafismo(null);
}

// =====================================================================================
// 2 · LA MINICADENA (3.000 € por palabra, canción +5.000 €)
// =====================================================================================
export async function minicadena(G) {
  const C = azar(CANCIONES); const W = C.l.split(' '); const dadas = [C.dar, C.dar + 1];
  const valP = NS.tiene('p_minipal') ? 4000 : 3000, valC = NS.tiene('p_mini') ? 10000 : 5000;
  let intentos = NS.tiene('s_cancion') ? 2 : 1, intentosR = 1, cancion = null;
  const orden = W.map((_, i) => i).filter(i => !dadas.includes(i)).sort((a, b) => Math.min(...dadas.map(d => Math.abs(d - a))) - Math.min(...dadas.map(d => Math.abs(d - b))) || a - b);
  const est = W.map((_, i) => dadas.includes(i) ? 'dada' : null);
  P().banda('LA MINICADENA'); cam('presentador'); await cortinilla('03_entrada_la_minicadena'); await banner('La minicadena', 'Adivina la canción'); await habla(F.minicadena);
  const pinta = (act, n) => grafismo(`<div class="rc-tit">LA MINICADENA · ${euros(valP)} por palabra · canción ${euros(valC)}</div>
    <div class="rc-fila n7 mc">${W.map((w, i) => est[i] === 'dada' || est[i] === 0 || est[i] === 1 || est[i] === -1 ? esl(w, est[i] === -1 ? 'gr' : 'az') : esl('', i === act ? 've act' : 've')).join('')}</div>
    ${act != null ? `<div class="rc-bajo">${esl(letras(W[act], n), 'na big')}</div>` : ''}
    ${cancion ? `<div class="rc-cancion">🎵 «${esc(C.t)}» · ${esc(C.a)}</div>` : ''}`);
  const intentarCancion = async e => {
    if (e === 0) {
      intentos--; await habla(F.cancion, 1200);
      const r = await responder(G, [C.t, ...(C.alias || [])], { seg: 12, ph: 'Título de la canción', auto: () => Math.random() < 0.85 ? C.t : 'NO SE' });
      if (r.z === 'bien') { cancion = 0; premio(G, 0, valC); await habla(F.cancionOk, 1500); return true; }
      fallo(G, 0); await habla(F.cancionMal, 1300); return false;
    }
    intentosR--; const ok = Math.random() < rv.p(0.7); await hablaC(quien(G, 1, 1), ok ? `¡${C.t}!` : '¿«Amor de verano»?', 1500);
    if (ok) { cancion = 1; premio(G, 1, valC); await habla(F.cancionOk, 1500); return true; }
    fallo(G, 1); await habla(F.cancionMal, 1300); return false;
  };
  for (const i of orden) {
    if (cancion != null) break;
    let n = 1, ok = false, fuera = new Set();
    while (n < W[i].length + 1 && !ok) {
      pinta(i, n); cam(n === 1 ? 'pantallaJ' : 'equipos');
      const sinYo = fuera.has(0), sinRival = fuera.has(1);
      if (sinYo && sinRival) break;
      const frac = n / W[i].length;
      const t = await carrera(G, { ms: 2800, prob: 0.12 + frac * 0.55, min: 600, max: 2700, sinYo, sinRival });
      if (t == null) { n++; continue; }
      if (t === 0) { const r = await responder(G, W[i], { seg: 8 }); ok = r.z === 'bien'; }
      else ok = await rivalDice(G, W[i], 0.35 + frac * 0.5, i);
      if (ok) { est[i] = t; premio(G, t, valP); pinta(null); await habla(F.bien, 1000); }
      else { fallo(G, t); fuera.add(t); n++; }
      luces(-1);
      if (ok) {
        const hechas = est.filter(x => x === 0 || x === 1).length;
        if (t === 0 && intentos > 0) {
          const quiere = window.__AUTO ? hechas >= 3 : (await elegir(`<div class="rc-elige"><p>¿Decís ya la canción?</p><button class="abtn gold" data-z="si">🎵 ¡Sabemos la canción!</button><button class="abtn" data-z="no">Seguir con la letra ▶</button></div>`)) === 'si';
          if (quiere) await intentarCancion(0);
        } else if (t === 1 && intentosR > 0 && hechas >= 3 && Math.random() < 0.5) await intentarCancion(1);
      }
    }
    if (!ok && est[i] == null) { est[i] = -1; }
  }
  W.forEach((_, i) => { if (est[i] == null) est[i] = -1; });
  if (cancion == null) { cancion = -1; }
  pinta(null); di(`La canción era «${C.t}», de ${C.a}.`, 4500); await Dt(4200); grafismo(null);
}

// =====================================================================================
// 3 y 5 · EL CENTRO DE LA CADENA (5.000 €) · UNA LLEVA A LA OTRA (12.000 €)
// =====================================================================================
async function cadena7(G, W, dadas, val, titulo, empieza) {
  const len = W.length, rev = W.map((_, i) => dadas.includes(i)), quienRev = W.map(() => null), n = W.map(() => NS.tiene('l_letra') ? 2 : 1), fallos = W.map(() => 0);
  const disp = () => W.map((_, i) => i).filter(i => !rev[i] && (rev[i - 1] || rev[i + 1]));
  const pinta = (act, picks = []) => grafismo(`<div class="rc-tit">${titulo} · ${euros(val)} por palabra</div>
    <div class="rc-col">${W.map((w, i) => rev[i] ? esl(w, quienRev[i] === -1 ? 'gr' : quienRev[i] === 0 ? 'az mio' : 'az', `data-n="${i + 1}"`) : esl(letras(w, n[i]), (i === act ? 'na act' : 'na') + (picks.includes(i) ? ' pick' : ''), `data-i="${i}" data-n="${i + 1}"`)).join('')}</div>
    ${picks.length ? '<div class="rc-ayuda">👆 Toca el eslabón naranja que queréis jugar</div>' : ''}`);
  let turno = empieza, vueltas = 0;
  while (rev.some(x => !x) && vueltas++ < 60) {
    const av = disp(); luces(turno); hud.set(G, turno);
    let i;
    if (turno === 0) { cam('eqA'); pinta(null, av); i = await elegirSlot(); }
    else { cam('eqB'); pinta(null); await Dt(900); i = av.slice().sort((a, b) => n[b] / W[b].length - n[a] / W[a].length)[0]; }
    if (n[i] < W[i].length - 1) n[i]++;
    pinta(i); await Dt(500);
    let ok;
    if (turno === 0) { const r = await responder(G, W[i], { seg: 12, extra: [{ z: 'paso', t: 'Paso' }] }); ok = r.z === 'bien'; if (r.z === 'paso') await hablaC(quien(G, 0), F.paso, 700); }
    else ok = await rivalDice(G, W[i], 0.15 + 0.7 * n[i] / W[i].length, i);
    if (ok) { rev[i] = true; quienRev[i] = turno; premio(G, turno, val); pinta(null); await habla(F.acierto, 900); continue; }
    fallo(G, turno); fallos[i]++;
    if (fallos[i] >= 4 || n[i] >= W[i].length - 1 && fallos[i] >= 2) { rev[i] = true; quienRev[i] = -1; pinta(null); await habla(F.nadie, 1000); }
    turno = 1 - turno;
  }
  luces(-1); pinta(null); await Dt(1800); grafismo(null);
}
export async function centro(G) {
  const W = baraja(CADENAS7.slice(0, 8))[0]; P().banda('EL CENTRO DE LA CADENA'); cam('presentador');
  await cortinilla('04_entrada_cadena2'); await banner('El centro de la cadena', 'Primera, central y última'); await habla(F.centro);
  await cadena7(G, W, [0, 3, 6], NS.tiene('p_centro') ? 6000 : 5000, 'EL CENTRO DE LA CADENA', G.eq[0].dinero <= G.eq[1].dinero ? 0 : 1);
}
export async function lleva(G) {
  const W = baraja(CADENAS7.slice(8))[0]; P().banda('UNA LLEVA A LA OTRA'); cam('presentador');
  const val = NS.tiene('p_lleva') ? 15000 : (+cfg.llevaPremio || 12000);
  await cortinilla('06_entrada_una_lleva_a_la_otra'); await banner('Una lleva a la otra', 'Solo la primera y la última'); await habla(F.lleva);
  await cadena7(G, W, [0, 6], val, 'UNA LLEVA A LA OTRA', G.eq[0].dinero <= G.eq[1].dinero ? 0 : 1);
}

// =====================================================================================
// 4 · EL EMBUDO (15.000 / 10.000 / 8.000 / 6.000 / 4.000 €)
// =====================================================================================
const PREMIOS_EMBUDO = [15000, 10000, 8000, 6000, 4000];
export async function embudo(G, cuantos = 2) {
  P().banda('EL EMBUDO'); cam('presentador'); await cortinilla('05_entrada_el_embudo'); await banner('El embudo', 'Hasta cinco pistas'); await habla(F.embudo);
  for (const X of baraja(EMBUDO).slice(0, cuantos)) {
    const v1 = NS.tiene('p_bote') ? PREMIOS_EMBUDO : PREMIOS_EMBUDO;
    let gano = null; const fuera = new Set();
    const pinta = (k, res) => grafismo(`<div class="rc-tit">EL EMBUDO · ${esc(X.tipo.toUpperCase())}</div>
      <div class="rc-embudo">${v1.map((v, j) => `<div class="emb ${j <= k ? 'on' : ''} ${j === k ? 'act' : ''}" style="--w:${100 - j * 11}%"><b>${euros(v)}</b><span>${j <= k ? esc(X.p[j]) : ''}</span></div>`).join('')}</div>
      ${res ? `<div class="rc-bajo">${esl(X.r, res)}</div>` : ''}`);
    for (let k = 0; k < 5 && gano == null; k++) {
      pinta(k); cam('pantallaJ'); await leer(X.p[k]); cam('equipos');
      while (gano == null) {
        const sinYo = fuera.has(0), sinRival = fuera.has(1) || (k === 0 && NS.tiene('l_embudo'));
        if (sinYo && fuera.has(1)) break;
        const t = await carrera(G, { ms: 6500, prob: [0.1, 0.22, 0.38, 0.6, 0.85][k], min: 1500, max: 6000, sinYo, sinRival });
        if (t == null) break;
        let ok;
        if (t === 0) { const r = await responder(G, X.alias.concat(X.r), { seg: 8, ph: 'Personaje, objeto o lugar' }); ok = r.z === 'bien'; }
        else ok = await rivalDice(G, X.r, 0.45 + 0.11 * k, k);
        if (ok) { gano = t; premio(G, t, v1[k]); pinta(k, 'az'); await habla(F.acierto, 1000); }
        else { fallo(G, t); fuera.add(t); await habla(fuera.size < 2 ? F.rebote : F.nadie, 1000); }
        luces(-1);
      }
    }
    if (gano == null) { pinta(4, 'gr'); await habla(F.nadie, 1200); }
    await Dt(1600);
  }
  grafismo(null);
}

// =====================================================================================
// 6 · COMPLICIDAD GANADORA (eliminatoria: 60 s, 3 «Paso», +2.000 € por acierto, ganador +30.000 €)
// =====================================================================================
function pintaCompli(G, palabras, k, extra = '') {
  grafismo(`<div class="rc-tit">COMPLICIDAD GANADORA · ${esc(G.eq[0].nombre)} ${G.eq[0].puntos ?? 0} – ${G.eq[1].puntos ?? 0} ${esc(G.eq[1].nombre)}</div>
    <div class="rc-frase">${palabras.map((w, i) => `<span class="${i < k ? 'on' : ''}">${i < k ? esc(w) : ''}</span>`).join('')}</div>${extra}`);
}
async function rondaTuya(G, seg) {
  let pasos = NS.tiene('t_paso5') ? 5 : 3; const qs = baraja(COMPLICIDAD); let qi = 0;
  G.eq[0].puntos = 0; hud.set(G, 0); cam('eqA');
  const reloj = new Reloj(seg, s => hud.timer(s, 10)).start(); let termino = false; reloj.fin.then(() => { termino = true; });
  while (!termino) {
    const [q, ans] = qs[qi++ % qs.length]; const W = q.split(' '); let k = 0; const error = Math.random() < 0.04;
    pintaCompli(G, W, 0);
    const accion = await Zi(new Promise(res => {
      const box = $('#resp'); box.innerHTML = `<button class="abtn pulsa" data-z="pulsa">🔴 ¡PULSAR!</button><button class="abtn" data-z="paso" ${pasos <= 0 ? 'disabled' : ''}>Paso (${pasos})</button>`; box.classList.remove('hidden');
      let fin = false; const acabar = v => { if (fin) return; fin = true; clearInterval(iv); removeEventListener('keydown', kk); box.classList.add('hidden'); box.innerHTML = ''; res(v); };
      box.querySelectorAll('[data-z]').forEach(b => b.onclick = e => { e.stopPropagation(); me.play(b.dataset.z === 'pulsa' ? 'pulsador' : 'tecla'); acabar(b.dataset.z); });
      const kk = e => { if (e.code === 'Space') { e.preventDefault(); me.play('pulsador'); acabar('pulsa'); } }; addEventListener('keydown', kk);
      const iv = setInterval(() => {
        if (k < W.length) { k++; pintaCompli(G, W, k); const c = quien(G, 0, 1 + (k % 2)); di(W[k - 1], 700, c.fig, c.nombre); if (error && k === W.length) acabar('error'); }
        if (window.__AUTO && k >= Math.ceil(W.length * 0.8)) acabar('pulsa');
      }, 650 / (window.__VEL || 1));
      reloj.fin.then(() => acabar('tiempo')); alLimpiar(() => acabar('abort'));
    }));
    if (accion === 'tiempo' || termino) break;
    if (accion === 'error') { await habla(F.gramatica, 1200); continue; }
    if (accion === 'paso') { pasos--; await hablaC(quien(G, 0), F.paso, 500); continue; }
    reloj.pause(); pintaCompli(G, W, W.length);
    const r = await pedir({ ph: 'Tu respuesta', auto: autoResp(ans) });
    reloj.start();
    if (r === 'ABORT') break;
    if (vale(r.txt, ans)) { G.eq[0].puntos++; premio(G, 0, 2000); } else { fallo(G, 0); G.eq[0].puntos = Math.max(0, G.eq[0].puntos - 1); hud.set(G, 0); toast('✖ Era: ' + ans[0].toUpperCase(), 1400); }
  }
  reloj.stop(); hud.sinTimer(); await habla(F.tiempo, 1000);
}
async function rondaRival(G, seg) {
  G.eq[1].puntos = 0; cam('eqB'); hud.set(G, 1);
  const meta = Math.max(1, Math.round(R(3, 7.5) + (NS.tiene('r_fuertes') ? 1.5 : 0) - (NS.tiene('r_fallones') ? 1 : 0)));
  const pasos = Math.round(meta * 1.5); let t = seg;
  for (let i = 0; i < pasos && t > 0; i++) {
    const [q] = azar(COMPLICIDAD); pintaCompli(G, q.split(' '), q.split(' ').length, '<div class="rc-ayuda">Los rivales juegan su minuto</div>');
    await Dt(650); t -= seg / pasos; hud.timer(Math.max(0, t), 10);
    if (G.eq[1].puntos < meta && Math.random() < 0.8) { G.eq[1].puntos++; premio(G, 1, 2000); } else { me.play('fallo'); }
  }
  hud.timer(0); await Dt(400); hud.sinTimer(); await habla(F.tiempo, 1000);
}
async function desempate(G) {
  await habla(F.empate); const [q, ans] = azar(DESEMPATE); const W = q.split(' ');
  const tR = rv.ms(R(2600, 9000)); const t0 = performance.now(); let k = 0; cam('equipos');
  const iv = setInterval(() => { if (k < W.length) { k++; pintaCompli(G, W, k); } }, 600 / (window.__VEL || 1)); alLimpiar(() => clearInterval(iv));
  const r = await carrera(G, { ms: 15000, prob: 1, min: tR, max: tR + 1 }); clearInterval(iv); pintaCompli(G, W, W.length);
  if (r === 0) { const x = await pedir({ ph: 'Una palabra', auto: autoResp(ans) }); return vale(x.txt, ans) ? 0 : 1; }
  if (r === 1) { const ok = Math.random() < 0.8; await hablaC(quien(G, 1), ok ? ans[0].toUpperCase() + '.' : 'PERRO.', 1200); return ok ? 1 : 0; }
  void t0; return Math.random() < 0.5 ? 0 : 1;
}
export async function complicidad(G) {
  const seg = NS.tiene('t_compli75') ? 75 : NS.tiene('t_reto') ? 50 : 60;
  P().banda('COMPLICIDAD GANADORA'); cam('presentador'); await cortinilla('07_entrada_complicidad_ganadora'); await banner('Complicidad ganadora', 'Eliminatoria'); await habla(F.complicidad);
  await habla(F.compliRival, 1200); await rondaRival(G, seg);
  await habla(F.compliTuyo, 1200); await rondaTuya(G, seg);
  let gana = G.eq[0].puntos > G.eq[1].puntos ? 0 : G.eq[1].puntos > G.eq[0].puntos ? 1 : await desempate(G);
  const bonus = NS.tiene('p_compli') ? 40000 : 30000; premio(G, gana, bonus); G.eq[1 - gana].fuera = true; hud.set(G, gana);
  grafismo(`<div class="rc-ganador">${esc(G.eq[gana].nombre)}<small>gana Complicidad ganadora · +${euros(bonus)}</small></div>`);
  cam(gana === 0 ? 'eqA' : 'eqB'); P().celebrar(); me.play('ganadores'); await habla(gana === 0 ? F.ganaTu : F.ganaRival); await Dt(800); grafismo(null);
  return gana;
}

// =====================================================================================
// 7 · LA ÚLTIMA CADENA (15 eslabones; fallo = pierde la mitad, redondeo al alza; 2 comodines)
// =====================================================================================
export function pintaUC(G, W, est, act, n, bote, com) {
  grafismo(`<div class="uc">${W.map((w, i) => {
    const cerca = act != null && Math.abs(i - act) <= 1, cls = (cerca ? 'big' : 'sm');
    if (est[i] === 'vis') return esl(w, 'az ' + cls); if (est[i] === 'ok') return esl(w, 've ' + cls); if (est[i] === 'nadie') return esl(w, 'gr ' + cls);
    return i === act ? esl(letras(w, n), 'na big') : `<div class="esl hueco ${cls}"></div>`;
  }).join('')}<div class="uc-bote"><span>${euros(bote)}</span><i class="uc-com">${'<b>C</b>'.repeat(Math.max(0, com))}</i></div></div>`);
}
export async function ultimaCadena(G, { bote: boteIni } = {}) {
  const W = azar(ULTIMAS); const est = W.map((_, i) => i % 2 === 0 ? 'vis' : 'tap');
  const max = NS.tiene('p_bote') ? 200000 : 150000; let bote = Math.min(boteIni ?? G.eq[0].dinero, max);
  let com = NS.tiene('u_comodin3') ? 3 : NS.tiene('u_reto') ? 1 : 2, seguro = NS.tiene('u_seguro'), m = 0;
  G.bote = bote; P().banda('LA ÚLTIMA CADENA'); cam('presentador'); await cortinilla('08_entrada_la_ultima_cadena'); await banner('La última cadena', 'Bote: ' + euros(bote)); me.play('bote');
  pintaUC(G, W, est, null, 0, bote, com); await habla(F.ultimaCadena); await habla(F.ucNormas);
  for (let i = 1; i < 15; i += 2) {
    let n = NS.tiene('u_letra') ? 2 : 1, fallosAqui = 0;
    for (;;) {
      const yo = cfg.turnosUC === 'tu' || m % 3 === 0; const c = quien(G, 0, cfg.turnosUC === 'tu' ? 0 : m);
      pintaUC(G, W, est, i, n, bote, com); cam(yo ? 'eqA' : 'conc', c.fig); hud.ronda(`Eslabón ${(i + 1) / 2} de 7 · responde ${c.nombre}`);
      let ok;
      if (yo) {
        const r = await responder(G, W[i], { seg: 20, extra: [{ z: 'letra', t: `🔤 Una letra más (${com})`, disabled: com <= 0 || n >= W[i].length - 1 }, { z: 'consulta', t: `🤝 Consultaros (${com})`, disabled: com <= 0 }], auto: () => Math.random() < 0.15 && com > 0 && n < W[i].length - 1 ? '§letra' : autoResp(W[i])() });
        if (r.z === 'letra') { com--; n++; me.play('acierto'); await habla(F.comodinLetra, 900); continue; }
        if (r.z === 'consulta') { com--; await habla(F.comodinConsulta, 900); for (const k of [1, 2]) { const s = Math.random() < (NS.tiene('s_compa') ? 0.9 : 0.72); await hablaC(quien(G, 0, k), (s ? W[i] : azar(SEÑUELOS)) + ', creo.', 1300); } continue; }
        ok = r.z === 'bien';
      } else {
        if (com > 0 && n === 1 && Math.random() < 0.3) { com--; n++; pintaUC(G, W, est, i, n, bote, com); await habla(F.comodinLetra, 900); }
        await Dt(R(900, 1600));
        ok = Math.random() < cl(0.32 + 0.5 * n / W[i].length + (NS.tiene('s_compa') ? 0.15 : 0));
        await hablaC(c, (ok ? W[i] : azar(SEÑUELOS.filter(s => s[0] === W[i][0]).concat(SEÑUELOS)) ) + '.', 1300);
      }
      m++;
      if (ok) { est[i] = 'ok'; me.play('acierto'); P().salta(c.fig); pintaUC(G, W, est, null, 0, bote, com); await habla(F.acierto, 800); break; }
      fallo(G, 0); fallosAqui++;
      if (seguro) { seguro = false; toast('🎲 Primer fallo gratis: no se resta nada'); }
      else { const antes = bote; bote = NS.tiene('u_tercio') ? bote - Math.floor(bote / 3) : Math.ceil(bote / 2); toast(`✖ ${euros(antes)} → ${euros(bote)}`, 1800); }
      G.bote = bote; pintaUC(G, W, est, i, n, bote, com); await habla(F.fallo, 900);
      if (n < W[i].length - 1) n++;
      else if (fallosAqui >= 2) { est[i] = 'nadie'; await habla(F.nadie, 900); break; }
    }
  }
  hud.ronda(''); pintaUC(G, W, est, null, 0, bote, com); G.bote = bote; await Dt(1600);
  return bote;
}

// =====================================================================================
// 8 · LA ÚLTIMA PALABRA (2 primeras letras + la última; eslabón misterioso por la mitad)
// =====================================================================================
export async function ultimaPalabra(G, { bote: boteIni } = {}) {
  const X = azar(ULTIMA_PALABRA); let bote = boteIni ?? G.bote ?? 0; const ini = NS.tiene('l_ultima') ? 3 : 2; let misterio = false;
  const pinta = (res) => grafismo(`<div class="rc-tit">LA ÚLTIMA PALABRA</div><div class="rc-col up">
      ${esl(X.arriba, 'az big')}${res ? esl(X.r, res + ' big') : esl(conHuecos(X.r, ini), 'na big')}${esl(X.abajo, 'az big')}${misterio ? esl(X.misterio, 'mist big') : ''}</div>
      <div class="uc-bote solo"><span>${euros(bote)}</span></div>`);
  P().banda('LA ÚLTIMA PALABRA'); cam('presentador'); await banner('La última palabra', euros(bote)); pinta(); await habla(F.ultimaPalabra);
  if (bote > 1) {
    const precio = NS.tiene('l_misterio') ? Math.ceil(bote / 4) : Math.ceil(bote / 2);
    await habla(F.misterio, 1500);
    const z = window.__AUTO ? (window.__AUTO_MISTERIO ? 'si' : 'no') : await elegir(`<div class="rc-elige"><p>¿Compráis el eslabón misterioso?</p><button class="abtn" data-z="si">🔒 Sí, pagamos ${euros(precio)}</button><button class="abtn gold" data-z="no">No, jugamos así</button></div>`);
    if (z === 'si') { bote -= precio; misterio = true; me.play('bote'); pinta(); await habla(F.misterioSi, 1200); }
  }
  cam('eqA'); me.play('ultima_palabra');
  const r = await responder(G, X.r, { seg: NS.tiene('t_ultima') ? 40 : 20, ph: 'La última palabra' });
  const ok = r.z === 'bien';
  pinta(ok ? 've' : 'gr');
  if (ok) { me.play('ganadores'); P().celebrar(); cam('equipos'); await habla(F.ganador); }
  else { fallo(G, 0); await habla(F.perdedor); if (NS.tiene('s_consuelo')) { toast('🎲 Premio de consuelo: 3.000 €'); } }
  await Dt(1500); grafismo(null);
  return { ok, premio: ok ? bote : NS.tiene('s_consuelo') ? 3000 : 0, palabra: X.r };
}
void norm; void rotulo;
