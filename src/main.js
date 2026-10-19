// Reacción en cadena · El juego (fan-made, PRIVADO). Navegación calcada de sus otros APK
// (title → main → play/train/options/help/credits/historia), plató 3D detrás del menú.
import { cortinilla } from './juego/core.js';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { construirPlato } from './plato/plato.js';
import { me, estadoHuecos } from './lib/audio.js';
import { $, esc, euros, nuevoToken, check, Dt, Zi, ABORT, bubble, di, habla, hud, cerrarOverlay, hashtag, limpiarRotulos, toast, acciones, ocultarCreditos, grafismo, cerrarPedir, mostrar } from './juego/core.js';
import { jugarPrograma, entrenamiento, PRUEBAS, AYUDA, creditos, campeones, reiniciarCampeones, CAPITULOS, INTRO_H, FIN_H } from './juego/programa.js';
import { NS, NORMAS, FRASES_NS } from './juego/normas.js';
import { F } from './juego/frases.js';
import { ENCADENADAS, EMBUDO, comprobarDatos } from './juego/datos.js';
import { cfg, guardarCfg, VERSION } from './cfg.js';
import * as M from './lib/menu_kit.js';

const params = new URLSearchParams(location.search);
if (params.get('vel')) window.__VEL = +params.get('vel');
if (params.has('auto')) { window.__AUTO = true; window.__AUTO_ELIGE = +(params.get('elige') || 0); if (params.has('misterio')) window.__AUTO_MISTERIO = true; if (params.get('ok')) window.__AUTO_OK = +params.get('ok'); }
if (params.has('novoz')) cfg.voz = false;
bubble.nombre = cfg.presentador || 'Ion Aramendi';
const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const errDatos = comprobarDatos(); if (errDatos.length) console.error('Datos:', errDatos);

// ---------- render ----------
const renderer = new THREE.WebGLRenderer({ antialias: !touch && cfg.quality !== 'baja', preserveDrawingBuffer: params.has('capture'), powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
$('#app').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 120);
const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.35, 0.3, 0.85); composer.addPass(bloom); composer.addPass(new OutputPass());
let bloomOn = false;
const ctx = { logoPantalla: null };
let P = null;
function crearPlato() { if (P) P.destruir(); P = construirPlato(scene, ctx, { quality: cfg.quality, reflejo: cfg.reflejo }); P.refrescarPantalla(); window.__plato = { ok: true, scene, renderer }; }
crearPlato();
const logoImg = new Image(); logoImg.src = 'img/logo.png'; logoImg.decode().then(() => { ctx.logoPantalla = logoImg; P.refrescarPantalla(); if (['title', 'main'].includes(pantalla) && !$('#menu').classList.contains('hidden')) Lt(pantalla); }).catch(() => {});

// ---------- cámara ----------
const CAMS = {
  general: [[0, 9.5, 15], [0, 1.2, -4]], equipos: [[0, 3.4, 3.2], [0, 1.6, -5.4]], eqA: [[-0.6, 2.5, -0.2], [-4.3, 1.4, -5.6]], eqB: [[0.6, 2.5, -0.2], [4.3, 1.4, -5.6]],
  presentador: [[1.4, 2.3, -4.0], [0, 1.6, -0.6]], pantalla: [[0, 4.2, -9], [0, 4.1, -17.6]], pantallaJ: [[0, 3.6, 2.5], [0, 2.0, -6]], publico: [[2, 3, -2], [11, 1, 3]], cenital: [[0, 16, 2], [0, 0, -2.2]],
};
const cam = { mode: 'menu', pos: new THREE.Vector3(0, 9, 22), look: new THREE.Vector3(0, 2, -3), tPos: new THREE.Vector3(0, 9, 22), tLook: new THREE.Vector3(0, 2, -3), yaw: 0, pitch: 0.3 };
function show(pos, look, inmediato = false) { cam.mode = 'show'; cam.tPos.set(...pos); cam.tLook.set(...look); if (inmediato) { cam.pos.copy(cam.tPos); cam.look.copy(cam.tLook); } }
const camara = n => { const c = CAMS[n] || CAMS.general; show(c[0], c[1]); };
function camConc(i) { const v = P.posFig(i); show([v.x * 0.55, 2.3, v.z + 3.6], [v.x, 1.4, v.z]); }
let drag = null;
renderer.domElement.addEventListener('pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; });
addEventListener('pointermove', e => { if (!drag || drag.id !== e.pointerId) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; cam.yaw -= dx * 0.006; cam.pitch = Math.max(-0.3, Math.min(1.1, cam.pitch + dy * 0.004)); });
addEventListener('pointerup', e => { if (drag && drag.id === e.pointerId) drag = null; });
const keys = {}; addEventListener('keydown', e => { keys[e.code] = true; }); addEventListener('keyup', e => { keys[e.code] = false; });
const joy = { x: 0, y: 0 }; { const J = $('#joy'), K = $('#knob'); let id = null; const mv = e => { const r = J.getBoundingClientRect(); let x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2); const d = Math.hypot(x, y), m = r.width / 2 - 10; if (d > m) { x *= m / d; y *= m / d; } K.style.transform = `translate(${x}px,${y}px)`; joy.x = x / m; joy.y = y / m; };
  J.addEventListener('pointerdown', e => { id = e.pointerId; J.setPointerCapture(id); mv(e); e.stopPropagation(); }); J.addEventListener('pointermove', e => { if (e.pointerId === id) mv(e); });
  const up = e => { if (e.pointerId === id) { id = null; joy.x = joy.y = 0; K.style.transform = ''; } }; J.addEventListener('pointerup', up); J.addEventListener('pointercancel', up); }
function modoPaseo(on) { cam.mode = on ? 'walk' : cam.mode; $('#joy').classList.toggle('hidden', !(on && touch)); if (on) { P.walker.visible = true; cam.yaw = 0; cam.pitch = 0.3; } }
function pistaTxt(t) { const h = $('#hint'); h.textContent = t; h.classList.toggle('hidden', !t); }

// ---------- cabecera 3D con la SINTONÍA OFICIAL ----------
let limpiarSkip = null;
async function cabecera() {
  document.body.classList.add('en-cabecera'); $('#btnSkip').classList.remove('hidden');
  me.stopMusic(); await cortinilla('01_cabecera_logo'); await me.sintonia({ loop: false });
  const logo = $('#cabLogo'); logo.src = 'img/logo.png';
  const tomas = [[[-12, 1.5, 6], [0, 3, -8], [-6, 2.5, 9]], [[0, 15, 4], [0, 0, -3], [0, 11, 9]], [[9, 2, -1], [-4, 1.5, -6], [4, 2.6, 2]], [[-9, 2, -1], [4, 1.5, -6], [-4, 2.6, 2]], [[0, 6, 14], [0, 6.5, -15], [0, 8.5, 6]]];
  let saltar = false; limpiarSkip = () => { saltar = true; };
  try {
    for (const [a, look, b] of tomas) {
      if (saltar) break; $('#fx-flash').style.opacity = 0.7; setTimeout(() => $('#fx-flash').style.opacity = 0, 90);
      show(a, look, true); cam.tPos.set(...b); cam.tLook.set(...look);
      for (let k = 0; k < 18 && !saltar; k++) await Dt(100);
    }
    if (!saltar) { show(...CAMS.general, true); logo.classList.add('on'); for (let k = 0; k < 40 && !saltar; k++) await Dt(100); }
  } finally { logo.classList.remove('on'); limpiarSkip = null; document.body.classList.remove('en-cabecera'); $('#btnSkip').classList.add('hidden'); me.fundirMusica(1200); }
}

// ---------- API para los flujos ----------
let camFija = null;
const api = {
  P: () => P,
  cam: (n, arg) => { if (camFija) return; if (n === 'conc') camConc(arg); else camara(n); },
  cabecera, orbita() { cam.mode = 'menu'; },
  saltable(p) { $('#btnSkip').classList.remove('hidden'); return Zi(Promise.race([p, new Promise(r => { limpiarSkip = () => r('skip'); })])).finally(() => { limpiarSkip = null; $('#btnSkip').classList.add('hidden'); me.stopVoice(); }); },
  marcador(html) { const m = $('#marcador'); if (!html) { m.classList.add('hidden'); return; } m.innerHTML = html; m.classList.remove('hidden'); },
  iniciar: m => iniciar(m), menu: (p = 'main') => irMenu(p),
};

// ---------- MENÚ ----------
let pantalla = 'title';
const VOLVER = { title: null, main: 'title', play: 'main', train: 'play', options: 'main', help: 'main', credits: 'main', concursantes: 'options', normas: 'options', sonidos: 'options' };
M.setSonidoTecla(() => me.play('tecla'));
const guardar = () => { guardarCfg(); me.aplicarNiveles(); };
const siNo = (k, f) => M.siNo(cfg, k, v => { guardar(); f && f(v); });
const opciones = (k, l, f) => M.opciones(cfg, k, l, v => { guardar(); f && f(v); });
const slider = k => M.slider(cfg, k, guardar, () => me.play('tecla'));
let musicaMenu = false;
const LOGO = 'img/logo.png';
function irMenu(p = 'main') {
  nuevoToken(); me.stopVoice(); cerrarOverlay(); cerrarPedir(); grafismo(null); hud.show(false); hud.ronda(''); pistaTxt(''); $('#bubble').classList.add('hidden'); $('#pulsa').classList.add('hidden');
  hist?.cerrar(); hist = null; P.walker.visible = false; P.marca.visible = false; $('#joy').classList.add('hidden'); primeraPersona = false; camFija = null;
  limpiarRotulos(); acciones([]); ocultarCreditos(); hashtag(''); api.marcador(null); $('#topbar').classList.add('hidden'); $('#btnNormas').classList.add('hidden');
  document.body.classList.remove('en-cabecera'); $('#cabLogo').classList.remove('on'); P.reset(); hud.sinTimer();
  cam.mode = 'menu'; if (!musicaMenu || !me.sonando()) { me.sintonia({ loop: true }); musicaMenu = true; }
  Lt(p);
}
function Lt(p) {
  pantalla = p; const m = $('#menu'); const C = campeones();
  if (p === 'title') return M.pantallaTitulo(m, { logo: LOGO, sub: 'El juego', onStart: () => { me.sintonia({ loop: true }); irMenu('main'); } });
  const col = M.pantallaMenu(m, { logo: LOGO, tag: 'EL JUEGO · 3D', version: VERSION, cls: ['options', 'concursantes', 'normas', 'sonidos'].includes(p) ? 'opts' : ['help', 'credits'].includes(p) ? 'text' : '' });
  const mbtn = M.mbtn, volver = d => M.volver(() => Lt(d));
  if (p === 'main') {
    col.append(mbtn('Jugar', 'Programa completo, entrenamiento…', 'gold', () => Lt('play')), mbtn('Opciones', 'Sonido, pruebas, normas sorpresa, calidad gráfica', '', () => Lt('options')),
      mbtn('La historia de Reacción en cadena', `${esc(cfg.presentador)} te cuenta la historia del programa`, '', () => iniciar('historia')), mbtn('Cómo se juega', 'Las 8 pruebas del concurso', '', () => Lt('help')), mbtn('Créditos', '', '', () => Lt('credits')));
  } else if (p === 'play') {
    col.append(mbtn('Programa completo', `Cabecera, pruebas, Complicidad ganadora, La última cadena y La última palabra${C.campeon ? ` · campeones: ${C.programas} ${C.programas === 1 ? 'programa' : 'programas'}` : ''}`, 'gold', () => iniciar('programa')),
      mbtn('Entrenamiento', 'Practica cada prueba por separado', '', () => Lt('train')), mbtn('Explorar el plató', 'Pasea libremente por el plató 3D', '', () => iniciar('explorar')),
      M.bloque('🏆 Vuestro equipo', M.linea(`${esc(cfg.equipo)} · ${C.programas} ${C.programas === 1 ? 'programa' : 'programas'} como campeones · ganado: <b>${euros(C.total)}</b> · La última palabra: ${C.aciertos} aciertos y ${C.fallos} fallos · mejor racha: ${C.mejor}`)), volver('main'));
  } else if (p === 'train') {
    col.append(M.h2('Entrenamiento'));
    Object.entries(PRUEBAS).forEach(([k, [t, s]], i) => col.append(mbtn(t, s, i === 0 ? 'gold' : '', () => iniciar('entreno:' + k))));
    col.append(volver('play'));
  } else if (p === 'options') {
    col.append(M.h2('Opciones'));
    col.append(M.fila('🎵 Sintonía oficial', siNo('music', v => { if (v) me.sintonia({ loop: true }); }), slider('musicVol')), M.nota('La única música del juego es la sintonía oficial que mandó Iker (cabecera, menú y despedida).', 'mtext'));
    col.append(M.fila('🔊 Sonidos', siNo('sfx'), slider('sfxVol')));
    col.append(M.bloque('🎧 Sonidos oficiales', M.linea('Huecos preparados para los sonidos oficiales que faltan'), M.botones([{ t: '📋 Ver los huecos', sel: true, full: true, fn: () => Lt('sonidos') }])));
    col.append(M.fila('🎬 Cabecera con la sintonía', siNo('cabecera')));
    col.append(M.fila('🎤 Voz del presentador', siNo('voz')), M.fila('📖 El presentador lee las pistas', siNo('lee')), M.fila('⏩ Velocidad de lectura', ...opciones('leeVel', [['normal', 'Normal'], ['rapida', 'Rápida']])));
    col.append(M.fila('🎲 Normas sorpresa', ...opciones('normas', [[false, 'No (normas de siempre)'], [true, 'Sí']])), M.nota('🎲 Con «Normas sorpresa», al empezar cada partida se sortean 10 normas nuevas entre ' + NORMAS.length + ' y el presentador te las anuncia.', 'mtext'));
    col.append(M.bloque('', M.botones([{ t: '📜 Ver todas las normas', full: true, fn: () => Lt('normas') }])));
    col.append(M.fila('🔀 Prueba ocasional', ...opciones('ocasional', [['alterna', 'Se alternan (la de siempre)'], ['encadenadas', 'Palabras encadenadas'], ['embudo', 'El embudo'], ['ambas', 'Las dos']])), M.nota('Como en la tele: Palabras encadenadas y El embudo se van alternando de un programa a otro.', 'mtext'));
    col.append(M.fila('💶 Una lleva a la otra', ...opciones('llevaPremio', [[12000, '12.000 € (la de siempre)'], [10000, '10.000 € (estreno)']])));
    col.append(M.fila('🔗 Turnos en La última cadena', ...opciones('turnosUC', [['turnos', 'Por turnos (la de siempre)'], ['tu', 'Respondes tú siempre']])));
    col.append(M.fila('⏱️ Reloj', ...opciones('reloj', [[true, 'Sí (la de siempre)'], [false, 'Sin reloj']])));
    col.append(M.bloque('👥 Concursantes', M.linea(`${cfg.nombre ? 'Tú: ' + esc(cfg.nombre) : 'Tú: sin nombre'} · Equipo: ${esc(cfg.equipo)} · Presenta: ${esc(cfg.presentador)}`), M.botones([{ t: '✏️ Nombres', sel: true, full: true, fn: () => Lt('concursantes') }, { t: '↺ Reiniciar campeones', fn: () => { reiniciarCampeones(); toast('Campeones reiniciados'); Lt('options'); } }])));
    col.append(M.fila('✨ Calidad gráfica', ...opciones('quality', [['baja', 'Baja'], ['media', 'Media'], ['alta', 'Alta']], () => { crearPlato(); aplicarCalidad(); })));
    col.append(M.fila('🪞 Reflejos del suelo', siNo('reflejo', () => { crearPlato(); aplicarCalidad(); })));
    const standalone = matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || location.hostname === 'appassets.androidplatform.net';
    const fs = M.botones([{ t: standalone ? 'Siempre (app)' : document.fullscreenElement ? 'Salir' : 'Activar', sel: !!document.fullscreenElement, disabled: standalone, fn: async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else { await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); try { await screen.orientation.lock('landscape'); } catch (x) { /* */ } } } catch (x) { toast('Tu navegador no permite pantalla completa aquí'); } setTimeout(() => Lt('options'), 300); } }]);
    col.append(M.fila('⛶ Pantalla completa', fs), M.nota(`Rendimiento actual: ${Math.round(fps)} fps. Si va lento en tu móvil, elige calidad «Baja».`, 'mtext'), volver('main'));
  } else if (p === 'sonidos') {
    col.append(M.h2('Sonidos oficiales'));
    const b = M.bloque('🎧 Huecos'); col.append(b);
    estadoHuecos().then(l => l.forEach(([k, t, ok]) => b.append(M.linea(`${ok ? '✅' : '⏳'} <b>${esc(t)}</b> · audio/${k} ${ok ? '(oficial)' : '(pendiente: silencio)'}`))));
    col.append(M.nota('Solo suenan música y sonidos oficiales. Mientras no estén, hay silencio y cinco efectos mínimos de interfaz (clic, acierto, error, pulsador y tic del reloj).', 'mtext'), volver('options'));
  } else if (p === 'normas') {
    col.append(M.h2('Normas sorpresa (' + NORMAS.length + ')'));
    const l = document.createElement('div'); l.className = 'mtext'; l.innerHTML = NORMAS.map(n => `<p><b>${esc(n.n)}</b> · ${esc(n.d)}</p>`).join(''); col.append(l, volver('options'));
  } else if (p === 'concursantes') {
    col.append(M.h2('Nombres'));
    const t = (k, ph, max) => M.texto(cfg, k, ph, max, () => { guardarCfg(); if (k === 'presentador') bubble.nombre = cfg.presentador || 'Ion Aramendi'; });
    col.append(M.fila('🙋 Tu nombre', t('nombre', 'Ej.: Iker', 18)), M.fila('👥 Tu equipo', t('equipo', 'Los Eslabones', 24)), M.fila('🎙️ Presentador', t('presentador', 'Ion Aramendi', 22)));
    col.append(M.nota('Presenta Ion Aramendi, como en Telecinco. Tus compañeros son Paula y Javi; los rivales, Las Lorquitas o Los Campeadores.'), volver('options'));
  } else if (p === 'help') {
    col.append(volver('main'), M.h2('Cómo se juega')); const d = document.createElement('div'); d.className = 'mtext'; d.innerHTML = AYUDA; col.append(d);
  } else if (p === 'credits') {
    col.append(volver('main'), M.h2('Créditos')); const d = document.createElement('div'); d.className = 'mtext creditos';
    d.innerHTML = M.htmlCreditos(creditos()) + `<p class="small">Versión ${VERSION}</p><p class="small">Juego de fans privado y sin ánimo de lucro. «Reacción en cadena» es un formato de televisión de sus respectivos dueños; este juego no está afiliado a ninguna cadena ni productora. Juego privado de Iker: presentador y equipos como en el programa de Telecinco.</p>`;
    col.append(d);
  }
}
// opciones con valores no-texto: arreglar la comparación de M.opciones (usa ===)

// ---------- iniciar modos ----------
async function iniciar(modo) {
  const t = nuevoToken(); pantalla = 'juego'; me.stopAll(); musicaMenu = false; cerrarOverlay(); $('#menu').classList.add('hidden'); $('#topbar').classList.remove('hidden'); acciones([]); api.marcador(null);
  try {
    if (modo === 'historia') { await historia(t); return irMenu('main'); }
    if (modo === 'explorar') return await explorar(t);
    if (modo.startsWith('entreno:')) return await entrenamiento(modo.slice(8), api);
    await jugarPrograma(api);
  } catch (e) { if (e !== ABORT) { console.error(e); toast('Error: ' + e.message, 5000); irMenu('play'); } }
}
async function explorar(t) {
  P.walker.position.set(0, 0.3, 6); modoPaseo(true); hashtag('#ReacciónEnCadena');
  pistaTxt('🕹️ Joystick / WASD para andar · arrastra para mirar · 👁 cambia de cámara'); setTimeout(() => pistaTxt(''), 6000);
  di(F.explora, 4500); me.say(F.explora);
  for (;;) await Dt(1000, t);
}

// ---------- barra superior ----------
let primeraPersona = false; const FIJAS = [null, 'general', 'equipos', 'eqA', 'eqB', 'presentador', 'pantalla', 'publico', 'cenital'];
$('#btnMenu').onclick = e => { e.stopPropagation(); me.play('tecla'); irMenu(pantalla === 'juego' ? 'play' : 'main'); };
$('#btnCam').onclick = e => { e.stopPropagation(); me.play('tecla'); if (cam.mode === 'walk') { primeraPersona = !primeraPersona; toast(primeraPersona ? '👁 Primera persona' : '👁 Tercera persona', 1200); return; } camFija = FIJAS[(FIJAS.indexOf(camFija) + 1) % FIJAS.length]; if (camFija) camara(camFija); toast('👁 Cámara: ' + (camFija || 'automática'), 1200); };
$('#btnSkip').onclick = e => { e.stopPropagation(); if (limpiarSkip) limpiarSkip(); };
$('#btnNormas').onclick = e => { e.stopPropagation(); me.play('tecla'); const o = $('#overlay'); if (!o.classList.contains('hidden') && o.querySelector('.ns-card')) { cerrarOverlay(); return; } if (NS.on()) { mostrar(NS.html()); o.onclick = () => cerrarOverlay(); } };
function atras() { if ($('#menu .modal')) { $('#menu .modal').remove(); return true; } if ($('#menu').classList.contains('hidden')) { $('#btnMenu').click(); return true; } const d = VOLVER[pantalla]; if (d) { me.play('tecla'); Lt(d); return true; } return false; }
window.__back = atras; addEventListener('keydown', e => { if (e.key === 'Escape') atras(); });

// ---------- calidad ----------
function aplicarCalidad() { const q = cfg.quality; renderer.setPixelRatio(q === 'baja' ? Math.min(devicePixelRatio, 0.8) : q === 'media' ? Math.min(devicePixelRatio, touch ? 1 : 1.25) : Math.min(devicePixelRatio, 1.75)); renderer.shadowMap.enabled = q !== 'baja'; bloomOn = q === 'alta'; renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); }

// ---------- la historia (tarjeta 1/N + subtítulo + ◄ ⏭ ►) ----------
let hist = null;
async function historia(t) {
  hashtag('#ReacciónEnCadena'); const N = CAPITULOS.length; hist = M.interfazHistoria({ total: N, presentador: cfg.presentador || 'El presentador' });
  let idx = 0, mover = null;
  hist.on({ prev: () => mover && mover(Math.max(0, idx - 1)), next: () => mover && mover(idx + 1), skip: () => mover && mover('skip'), ir: i => mover && mover(i) });
  const leerH = async texto => {
    hist.subtitulo(texto); let destino = null; const pulsado = new Promise(r => { mover = d => { destino = d; r(); }; });
    const hablar = cfg.voz ? me.say(texto).then(() => Dt(1200, t)) : Dt(Math.max(3500, texto.length * 60), t);
    await Zi(Promise.race([hablar, pulsado])); me.stopVoice(); check(t); return destino;
  };
  camara('presentador'); hist.mostrar(-1, { emoji: '📖', t: 'La historia de Reacción en cadena', rows: [['Capítulos', String(N)]] });
  let d = await leerH(INTRO_H); idx = typeof d === 'number' ? d : 0;
  while (idx < N) { const c = CAPITULOS[idx]; camara(c.cam); P.pantalla('info', { title: c.t.toUpperCase(), rows: c.rows }); hist.mostrar(idx, c); d = await leerH(c.sub); idx = d === 'skip' || d == null ? idx + 1 : d; }
  P.pantalla('logo'); camara('general'); hist.mostrar(N - 1, { emoji: '🔗', t: '¡Fin!', rows: [] }); await leerH(FIN_H); hist.cerrar(); hist = null;
}

// ---------- frases para pregenerar las voces (tools/gen_voces.py) ----------
window.__frases = () => {
  const L = []; const add = (t, q = false) => { if (t && typeof t === 'string') L.push({ v: 'presentador', t: t.trim(), q }); };
  Object.values(F).forEach(t => add(t)); Object.values(FRASES_NS).forEach(t => add(t)); NORMAS.forEach(n => add(n.n + '.'));
  CAPITULOS.forEach(c => add(c.sub)); [INTRO_H, FIN_H].forEach(t => add(t));
  ENCADENADAS.forEach(s => s.p.forEach(([, d]) => add(d, true))); EMBUDO.forEach(x => x.p.forEach(p => add(p, true)));
  return L;
};

// ---------- bucle ----------
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });
const clock = new THREE.Clock(); let el = 0, fps = 60; const tmp = new THREE.Vector3();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05); el += dt; fps = fps * 0.95 + (1 / Math.max(dt, 0.001)) * 0.05;
  const W = P.walker;
  if (cam.mode === 'walk') {
    let x = joy.x, y = joy.y; if (keys.KeyW || keys.ArrowUp) y -= 1; if (keys.KeyS || keys.ArrowDown) y += 1; if (keys.KeyA || keys.ArrowLeft) x -= 1; if (keys.KeyD || keys.ArrowRight) x += 1;
    const m = Math.hypot(x, y);
    if (m > 0.1) {
      const sp = (keys.ShiftLeft ? 6 : 3.6) * Math.min(1, m) * dt; x /= Math.max(1, m); y /= Math.max(1, m);
      const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
      const dx = (fx * -y + rx * x) * sp, dz = (fz * -y + rz * x) * sp; const nx = W.position.x + dx, nz = W.position.z + dz;
      if (!P.bloqueado(nx, nz)) { W.position.x = nx; W.position.z = nz; } else if (!P.bloqueado(nx, W.position.z)) W.position.x = nx; else if (!P.bloqueado(W.position.x, nz)) W.position.z = nz;
      W.rotation.y = Math.atan2(dx, dz); W.children.forEach((c, i) => { if (i >= 5) c.rotation.x = Math.sin(el * 10) * 0.5 * (i % 2 ? 1 : -1); });
    }
    W.position.y = Math.hypot(W.position.x, W.position.z + 2) < 8.7 ? 0.3 : 0;
    if (primeraPersona) { W.visible = false; cam.tPos.set(W.position.x, 1.65 + W.position.y, W.position.z); cam.tLook.set(W.position.x - Math.sin(cam.yaw) * 5, 1.65 - cam.pitch * 3, W.position.z - Math.cos(cam.yaw) * 5); }
    else { W.visible = true; const l = 4.4 * Math.cos(cam.pitch * 0.6); cam.tPos.set(W.position.x + Math.sin(cam.yaw) * l, 1.8 + cam.pitch * 2.6, W.position.z + Math.cos(cam.yaw) * l); cam.tLook.set(W.position.x, 1.4, W.position.z); }
  } else if (cam.mode === 'menu') { const a = Math.sin(el * 0.06) * 0.6; cam.tPos.set(Math.sin(a) * 14, 7 + Math.sin(el * 0.2), Math.cos(a) * 14 + 1); cam.tLook.set(0, 2, -4); }
  const k = cam.mode === 'walk' ? 10 : 2.2; cam.pos.lerp(cam.tPos, Math.min(1, dt * k)); cam.look.lerp(cam.tLook, Math.min(1, dt * k));
  camera.position.copy(cam.pos); camera.lookAt(cam.look);
  P.update(el, dt);
  const b = $('#bubble');
  if (!b.classList.contains('hidden')) {
    if (performance.now() > bubble.hasta) b.classList.add('hidden');
    else { const obj = bubble.quien != null && P.figs[bubble.quien] ? P.figs[bubble.quien] : P.presentador; obj.getWorldPosition(tmp); tmp.y += 2.0; tmp.project(camera); const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1; b.style.left = Math.max(170, Math.min(innerWidth - 170, (tmp.x * 0.5 + 0.5) * innerWidth)) + 'px'; b.style.top = Math.max(70, Math.min(innerHeight * 0.45, vis ? (-tmp.y * 0.5 + 0.5) * innerHeight : 80)) + 'px'; }
  }
  if (bloomOn) composer.render(); else renderer.render(scene, camera);
}
renderer.setAnimationLoop(frame);

// ---------- arranque ----------
aplicarCalidad();
irMenu(params.has('main') ? 'main' : 'title');
document.addEventListener('visibilitychange', () => { if (document.hidden) me.stopMusic(); else if (!$('#menu').classList.contains('hidden')) me.sintonia({ loop: true }); });
addEventListener('pointerdown', function una() { if (!$('#menu').classList.contains('hidden')) me.sintonia({ loop: true }); removeEventListener('pointerdown', una); });
setTimeout(() => $('#loading').classList.add('hidden'), 600);
if (params.get('cam')) { $('#menu').classList.add('hidden'); show(...CAMS[params.get('cam')], true); }
if ('serviceWorker' in navigator && location.protocol === 'https:' && location.hostname !== 'appassets.androidplatform.net') navigator.serviceWorker.register('sw.js').catch(() => {});
window.__at = { get P() { return P; }, api, iniciar, irMenu, Lt, camara, show, CAMS, ctx, cfg, NS };
void habla; void hud;
