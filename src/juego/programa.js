// Programa completo y entrenamiento de «Reacción en cadena».
import { me } from '../lib/audio.js';
import { cfg } from '../cfg.js';
import { NS, FRASES_NS } from './normas.js';
import { F, RIVALES, COMPAS } from './frases.js';
import { cortinilla, $, esc, euros, azar, Dt, habla, hud, toast, acciones, grafismo, rodarCreditos, mostrar, cerrarOverlay, hashtag, rotulo } from './core.js';
import * as PR from './pruebas.js';
import { CREDITOS_VOCES } from '../lib/voces.js';

export const PRUEBAS = {
  encadenadas: ['1 · Palabras encadenadas', '6 palabras de un tema: la última letra es la primera de la siguiente · 2.000 €'],
  minicadena: ['2 · La minicadena', 'Adivina las palabras de la letra y la canción · 3.000 € y +5.000 €'],
  centro: ['3 · El centro de la cadena', 'Te dan la primera, la central y la última · 5.000 €'],
  embudo: ['4 · El embudo', 'Hasta 5 pistas: cuantas menos, más dinero · de 15.000 € a 4.000 €'],
  lleva: ['5 · Una lleva a la otra', 'Solo la primera y la última · 12.000 €'],
  complicidad: ['6 · Complicidad ganadora', '60 segundos: tus compañeros forman la pregunta palabra a palabra'],
  ultimacadena: ['7 · La última cadena', '15 eslabones de arriba abajo · fallo = la mitad'],
  ultimapalabra: ['8 · La última palabra', 'Dos primeras letras y la última · eslabón misterioso'],
};
const leerCamp = () => JSON.parse(localStorage.getItem('rec_campeones') || '{"programas":0,"total":0,"aciertos":0,"fallos":0,"racha":0,"mejor":0,"campeon":false}');
const guardarCamp = c => localStorage.setItem('rec_campeones', JSON.stringify(c));
export const campeones = leerCamp;
export const reiniciarCampeones = () => localStorage.removeItem('rec_campeones');

export function nuevoJuego(api) {
  const R = azar(RIVALES); const C = leerCamp();
  const G = {
    api, racha: 0, primerAcierto: false, bote: 0,
    eq: [
      { nombre: cfg.equipo || 'Los Eslabones', humano: true, dinero: 0, miembros: [{ nombre: cfg.nombre || 'Tú', fig: 0 }, { nombre: COMPAS[0], fig: 1 }, { nombre: COMPAS[1], fig: 2 }], campeon: C.campeon },
      { nombre: R.nombre, humano: false, dinero: 0, miembros: R.miembros.map((n, i) => ({ nombre: n, fig: 3 + i })) },
    ],
  };
  PR.enlazar(api); return G;
}
async function anunciarNormas(api) {
  if (!cfg.normas) { NS.limpiar(); $('#btnNormas').classList.add('hidden'); return; }
  NS.sortear(10); $('#btnNormas').classList.remove('hidden'); $('#btnNormas').textContent = '🎲 10 normas';
  api.cam('presentador'); mostrar(NS.html()); await habla(FRASES_NS.intro);
  for (const n of NS.lista()) { await habla(n.n + '.', 1400); }
  await habla(FRASES_NS.fin, 1200); cerrarOverlay();
}
/** Elige las pruebas ocasionales: Palabras encadenadas y El embudo se alternan (como en la tele) */
function ocasionales() {
  const o = cfg.ocasional; if (o === 'encadenadas') return { enc: true, emb: false }; if (o === 'embudo') return { enc: false, emb: true }; if (o === 'ambas') return { enc: true, emb: true };
  const n = +(localStorage.getItem('rec_nprog') || 0); localStorage.setItem('rec_nprog', n + 1); return n % 2 === 0 ? { enc: true, emb: false } : { enc: false, emb: true };
}
export async function jugarPrograma(api) {
  const G = nuevoJuego(api); const P = api.P(); P.reset(); hashtag('#ReacciónEnCadena');
  hud.show(true); hud.set(G);
  if (cfg.cabecera) await api.cabecera();
  await anunciarNormas(api);
  P.banda('REACCIÓN EN CADENA'); api.cam('general'); me.play('aplausos'); await habla(F.hola);
  api.cam('equipos'); await habla(F.equipos);
  G.bote = 150000; rotulo('BOTE', '150.000 €'); await habla(F.bote);
  api.cam('eqA'); rotulo(G.eq[0].nombre, G.eq[0].miembros.map(m => m.nombre).join(' · ')); await habla(G.eq[0].campeon ? F.campeones : F.aspirantes);
  api.cam('eqB'); rotulo(G.eq[1].nombre, G.eq[1].miembros.map(m => m.nombre).join(' · ')); await habla(G.eq[0].campeon ? F.aspirantes : F.campeones);
  if (NS.tiene('p_inicio')) { G.eq[0].dinero += 5000; hud.set(G); toast('🎲 Regalo de bienvenida: 5.000 €'); }
  const { enc, emb } = ocasionales();
  if (enc) await PR.encadenadas(G);
  await PR.minicadena(G); await PR.centro(G);
  if (emb) await PR.embudo(G);
  await PR.lleva(G);
  const gana = await PR.complicidad(G);
  const C = leerCamp();
  if (gana === 1) { C.campeon = false; C.racha = 0; guardarCamp(C); await habla(F.eliminados); return fin(G, api, null); }
  const bote = await PR.ultimaCadena(G);
  const r = await PR.ultimaPalabra(G, { bote });
  C.programas++; C.campeon = true; C.racha++; C.mejor = Math.max(C.mejor, C.racha); C.total += r.premio; if (r.ok) C.aciertos++; else C.fallos++; guardarCamp(C);
  return fin(G, api, r);
}
async function fin(G, api, r) {
  const P = api.P(); grafismo(null); hud.show(false); api.cam('general'); me.play('despedida'); me.sintonia({ loop: false, desde: 0 });
  const C = leerCamp();
  api.marcador(r ? `${r.ok ? '🏆 ¡Bote conseguido!' : '🔗 Sin bote hoy'}<br>${esc(G.eq[0].nombre)} se lleva <b>${euros(r.premio)}</b><br><small>Programas como campeones: ${C.programas} · ganado en total: ${euros(C.total)}</small>` : `👋 ${esc(G.eq[1].nombre)} ganó Complicidad ganadora<br><small>Vuestro equipo se despide con la cabeza bien alta</small>`);
  if (r && r.ok) P.celebrar();
  await habla(F.despedida);
  await cortinilla('09_final_y_creditos');
  rodarCreditos(creditos(), 16000).catch(() => {});
  api.orbita();
  acciones([{ label: 'Otro programa ▶', cls: 'gold', fn: () => api.iniciar('programa') }, { label: 'Menú', fn: () => api.menu('play') }]);
  await new Promise(() => {});
}
export async function entrenamiento(k, api) {
  const G = nuevoJuego(api); const P = api.P(); P.reset(); hud.show(true); hud.set(G); hashtag('#Entrenamiento');
  await anunciarNormas(api);
  await habla(F.entreno, 2000);
  if (k === 'encadenadas') await PR.encadenadas(G);
  else if (k === 'minicadena') await PR.minicadena(G);
  else if (k === 'centro') await PR.centro(G);
  else if (k === 'embudo') await PR.embudo(G, 1);
  else if (k === 'lleva') await PR.lleva(G);
  else if (k === 'complicidad') await PR.complicidad(G);
  else if (k === 'ultimacadena') { G.eq[1].fuera = true; hud.set(G, 0); const b = await PR.ultimaCadena(G, { bote: 100000 }); toast('Te quedan ' + euros(b), 3000); await Dt(2500); }
  else if (k === 'ultimapalabra') { G.eq[1].fuera = true; hud.set(G, 0); await PR.ultimaPalabra(G, { bote: 50000 }); }
  grafismo(null); api.cam('general');
  api.marcador(`🏋️ ${esc(PRUEBAS[k][0])}<br><small>${esc(G.eq[0].nombre)}: ${euros(G.eq[0].dinero)} · ${esc(G.eq[1].nombre)}: ${euros(G.eq[1].dinero)}</small>`);
  acciones([{ label: 'Repetir ▶', cls: 'gold', fn: () => api.iniciar('entreno:' + k) }, { label: 'Entrenamiento', fn: () => api.menu('train') }]);
  await new Promise(() => {});
}
export function creditos() {
  return [['Reacción en cadena · El juego', ['Juego creado por: Iker']], ['Presenta', [cfg.presentador || 'Ion Aramendi']], ['Producción', ['Sony Pictures Television (programa original de Telecinco)']], CREDITOS_VOCES,
    ['Música', ['Sintonía oficial de «Reacción en cadena»', 'enviada por Iker (uso privado)']], ['Grafismo', ['Logo oficial enviado por Iker', 'Eslabones, plató 3D y menús: hechos para este juego']],
    ['Tecnología', ['Three.js · esbuild · Piper TTS']], ['Gracias', ['A todos los que juegan']]];
}
export const AYUDA = `<p><b>Reacción en cadena</b>: dos equipos de tres personas. Tu equipo (tú y tus compañeros virtuales) contra un equipo rival. Las palabras se encadenan: cada una se relaciona con la anterior y con la siguiente.</p>
<p><b>1 · Palabras encadenadas</b> (se alterna con El embudo): seis palabras de un tema; la última letra de cada una es la primera de la siguiente. Pulsador. 2.000 € por acierto.</p>
<p><b>2 · La minicadena</b>: adivina cinco palabras de la letra de una canción a partir de dos que te damos. 3.000 € por palabra y 5.000 € más si aciertas la canción.</p>
<p><b>3 · El centro de la cadena</b>: cadena de siete palabras; te damos la primera, la central y la última. 5.000 € por palabra.</p>
<p><b>4 · El embudo</b> (se alterna con Palabras encadenadas): adivina el personaje, objeto o lugar con hasta cinco pistas. 15.000 €, 10.000 €, 8.000 €, 6.000 € o 4.000 €.</p>
<p><b>5 · Una lleva a la otra</b>: cadena de siete palabras con solo la primera y la última. 12.000 € por palabra (10.000 € en el estreno, en Opciones).</p>
<p><b>6 · Complicidad ganadora</b> (eliminatoria): 60 segundos. Tú tienes el pulsador y tus compañeros forman la pregunta palabra a palabra. Pulsa para parar el reloj y responde. Hasta 3 «Paso». Acierto: +1 y 2.000 €; fallo: −1. El ganador suma 30.000 €. Empate: una pregunta y gana quien acierte antes.</p>
<p><b>7 · La última cadena</b>: el equipo ganador, por turnos. Quince eslabones de arriba abajo; los naranjas están tapados y cada palabra se relaciona con la de arriba y la de abajo. Comodines: una letra más o consultaros. Acierto: mantenéis el dinero. Fallo: perdéis la mitad (redondeo al alza) y pasa el turno.</p>
<p><b>8 · La última palabra</b>: eslabón naranja con las dos primeras letras y la última. Podéis comprar «El eslabón misterioso» pagando la mitad. Si acertáis, os lleváis el premio; si no, nada. Los campeones vuelven al programa siguiente.</p>
<p>En el móvil escribe con el teclado; en el PC también puedes pulsar con la barra espaciadora.</p>`;
// La historia del programa (datos que envió Iker)
export const CAPITULOS = [
  { emoji: '📺', t: 'El estreno', cam: 'general', rows: [['Cadena', 'Telecinco'], ['Emisión', '19-dic-2022 a 12-jul-2025'], ['Formato', 'Chain Reaction (NBC, 1980)']], sub: 'Reacción en cadena llegó a Telecinco el diecinueve de diciembre de dos mil veintidós. Es la adaptación de Chain Reaction, un concurso estadounidense de mil novecientos ochenta, inspirado también en el italiano Reazione a catena.' },
  { emoji: '👥', t: 'Dos equipos de tres', cam: 'equipos', rows: [['Equipos', '2 de 3 personas'], ['Bote diario', 'hasta 150.000 €']], sub: 'Dos equipos de tres personas compiten cada tarde. El bote diario puede llegar a ciento cincuenta mil euros.' },
  { emoji: '🔗', t: 'Las pruebas', cam: 'pantalla', rows: [['Fijas', 'Minicadena, Centro, Una lleva a la otra'], ['Ocasionales', 'Palabras encadenadas y El embudo']], sub: 'Las pruebas fijas son La minicadena, El centro de la cadena y Una lleva a la otra. Palabras encadenadas y El embudo se van alternando.' },
  { emoji: '⏱️', t: 'Complicidad ganadora', cam: 'equipos', rows: [['Tiempo', '60 s por equipo'], ['Premio', '+30.000 €']], sub: 'En Complicidad ganadora uno pulsa y los otros dos forman una pregunta, palabra a palabra. El que gana se lleva treinta mil euros y pasa a la final.' },
  { emoji: '🏆', t: 'La última cadena', cam: 'presentador', rows: [['Eslabones', '15'], ['Fallo', 'pierde la mitad']], sub: 'En La última cadena hay quince eslabones. Cada fallo cuesta la mitad del dinero. Y al final, La última palabra decide si se llevan el bote.' },
  { emoji: '🥇', t: 'Los grandes campeones', cam: 'eqA', rows: [['Mozos de Arousa', '236 programas'], ['Ganado', '1.577.139 €']], sub: 'Los Mozos de Arousa hicieron historia: doscientos treinta y seis programas y más de un millón y medio de euros. También brillaron equipos como Cocolocos, Ubuntu, Fextivaleros o las Profes Granaínas.' },
  { emoji: '📊', t: 'Audiencias', cam: 'general', rows: [['Episodios', '661'], ['Media', '887.000 · 9,5 %']], sub: 'En total, seiscientos sesenta y un episodios, con una media de ochocientos ochenta y siete mil espectadores.' },
];
export const INTRO_H = 'Bienvenidos a la historia de Reacción en cadena. Empecemos por el principio.';
export const FIN_H = 'Y esta ha sido la historia de Reacción en cadena. ¡Gracias por acompañarme!';
void Dt; void $;
