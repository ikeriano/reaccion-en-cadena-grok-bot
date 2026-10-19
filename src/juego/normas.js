// 🎲 Normas sorpresa (como en sus otros juegos). Opciones › «Normas sorpresa», en «No» por defecto:
// sin normas todo es exactamente igual. En «Sí», cada partida sortea 10 normas (hasta 3 por categoría,
// nunca dos que toquen lo mismo) y el presentador las anuncia.
import { cfg } from '../cfg.js';
import { baraja, esc } from './core.js';

export const CATS = { p: '💰 Premios', u: '🔗 La última cadena', l: '🔤 Pistas', t: '⏱️ Reloj', r: '🤝 Rivales', s: '🎁 Sorpresas' };
export const NORMAS = [
  { id: 'p_enc', c: 'p', n: 'Encadenadas de oro', d: 'Cada acierto en Palabras encadenadas vale 4.000 €.' },
  { id: 'p_minipal', c: 'p', n: 'Minicadena generosa', d: 'Cada palabra de La minicadena vale 4.000 €.' },
  { id: 'p_mini', c: 'p', n: 'Canción premiada', d: 'Acertar la canción de La minicadena vale 10.000 €.' },
  { id: 'p_centro', c: 'p', n: 'Centro dorado', d: 'El centro de la cadena paga 6.000 € por palabra.' },
  { id: 'p_lleva', c: 'p', n: 'Una lleva a la otra de lujo', d: 'Una lleva a la otra paga 15.000 € por palabra.' },
  { id: 'p_compli', c: 'p', n: 'Complicidad de oro', d: 'Ganar Complicidad ganadora da 40.000 €.' },
  { id: 'p_inicio', c: 'p', n: 'Regalo de bienvenida', d: 'Vuestro equipo empieza con 5.000 €.' },
  { id: 'p_bote', c: 'p', n: 'Bote gigante', d: 'El bote máximo de hoy sube a 200.000 €.' },
  { id: 'u_comodin3', c: 'u', n: 'Tres comodines', d: 'En La última cadena tenéis tres comodines.', toca: ['comodines'] },
  { id: 'u_reto', c: 'u', n: 'Un solo comodín', d: '¡Reto! En La última cadena solo hay un comodín.', toca: ['comodines'], reto: true },
  { id: 'u_tercio', c: 'u', n: 'Fallo suave', d: 'En La última cadena, fallar resta un tercio y no la mitad.', toca: ['fallo'] },
  { id: 'u_seguro', c: 'u', n: 'Primer fallo gratis', d: 'En La última cadena, el primer fallo no resta dinero.', toca: ['fallo1'] },
  { id: 'u_letra', c: 'u', n: 'Dos letras', d: 'En La última cadena, cada eslabón naranja empieza con dos letras.' },
  { id: 'l_letra', c: 'l', n: 'Letra de regalo', d: 'En El centro de la cadena y Una lleva a la otra, cada palabra empieza con dos letras.' },
  { id: 'l_embudo', c: 'l', n: 'Embudo con ventaja', d: 'En El embudo, los rivales no pueden pulsar con la primera pista.' },
  { id: 'l_ultima', c: 'l', n: 'Tercera letra', d: 'La última palabra enseña también la tercera letra.' },
  { id: 'l_misterio', c: 'l', n: 'Eslabón barato', d: 'El eslabón misterioso cuesta solo una cuarta parte del bote.' },
  { id: 't_compli75', c: 't', n: 'Complicidad larga', d: 'En Complicidad ganadora tenéis setenta y cinco segundos.', toca: ['crono'] },
  { id: 't_reto', c: 't', n: 'Complicidad exprés', d: '¡Reto! En Complicidad ganadora tenéis solo cincuenta segundos.', toca: ['crono'], reto: true },
  { id: 't_paso5', c: 't', n: 'Cinco pasos', d: 'En Complicidad ganadora podéis decir «Paso» hasta cinco veces.' },
  { id: 't_ultima', c: 't', n: 'Pensadlo con calma', d: 'La última palabra se piensa con cuarenta segundos.' },
  { id: 'r_lentos', c: 'r', n: 'Rivales despistados', d: 'Los rivales tardan más en pulsar.', toca: ['lentos'] },
  { id: 'r_fallones', c: 'r', n: 'Rivales nerviosos', d: 'Los rivales fallan un poco más.', toca: ['fallones'] },
  { id: 'r_fuertes', c: 'r', n: 'Rivales en racha', d: '¡Reto! Hoy los rivales aciertan más.', toca: ['lentos', 'fallones'], reto: true },
  { id: 's_racha', c: 's', n: 'Racha premiada', d: 'Cada tres aciertos seguidos de vuestro equipo, 3.000 € extra.' },
  { id: 's_cancion', c: 's', n: 'Segunda oportunidad musical', d: 'En La minicadena podéis intentar la canción dos veces.' },
  { id: 's_consuelo', c: 's', n: 'Premio de consuelo', d: 'Si falláis La última palabra, os lleváis 3.000 €.' },
  { id: 's_doble', c: 's', n: 'Primer acierto doble', d: 'El primer acierto de vuestro equipo vale el doble.' },
  { id: 's_compa', c: 's', n: 'Compañeros sabios', d: 'En La última cadena tus compañeros aciertan más.' },
];
let activas = [];
export const NS = {
  on: () => cfg.normas && activas.length > 0,
  tiene: id => cfg.normas && activas.some(n => n.id === id),
  lista: () => activas.slice(),
  limpiar() { activas = []; },
  /** Sortea 10 normas: hasta 3 por categoría, nunca dos que toquen lo mismo, como mucho 2 retos */
  sortear(n = 10) {
    for (let intento = 0; intento < 200; intento++) {
      const elegidas = [], cats = {}, tocas = new Set(); let retos = 0;
      for (const x of baraja(NORMAS)) {
        if (elegidas.length >= n) break;
        if ((cats[x.c] || 0) >= 3) continue; if ((x.toca || []).some(t => tocas.has(t))) continue; if (x.reto && retos >= 2) continue;
        elegidas.push(x); cats[x.c] = (cats[x.c] || 0) + 1; (x.toca || []).forEach(t => tocas.add(t)); if (x.reto) retos++;
      }
      if (elegidas.length === n) { activas = elegidas.sort((a, b) => Object.keys(CATS).indexOf(a.c) - Object.keys(CATS).indexOf(b.c)); return activas; }
    }
    activas = []; return activas;
  },
  html: () => `<div class="ns-card"><h3>🎲 Las ${activas.length} normas de hoy</h3>${activas.map((x, i) => `<div class="ns-n"><b>${i + 1}. ${esc(x.n)}</b> <small>${CATS[x.c]}</small><span>${esc(x.d)}</span></div>`).join('')}</div>`,
};
export const FRASES_NS = { intro: '¡Hoy juegan las normas sorpresa! Diez normas nuevas para este programa.', fin: '¡Y ya están todas! A jugar.' };
