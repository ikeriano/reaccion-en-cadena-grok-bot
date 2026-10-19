// Ajustes persistentes (mismas filas que las Opciones de sus otros APK). Las opciones nuevas, apagadas / «la de siempre».
const bajo = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
const DEF = {
  music: true, musicVol: 0.8, sfx: true, sfxVol: 0.8, voz: true, lee: true, leeVel: 'normal',
  cabecera: true, quality: bajo ? 'baja' : 'media', reflejo: false,
  nombre: '', equipo: 'Los Eslabones', presentador: 'Ion Aramendi',
  normas: false, ocasional: 'ambas', llevaPremio: 12000, turnosUC: 'turnos', reloj: true,
};
export const VERSION = '2.0';
export const cfg = Object.assign({}, DEF, JSON.parse(localStorage.getItem('rec_cfg') || '{}'));
if (!cfg.presentador || cfg.presentador === 'Rubén Lazo') cfg.presentador = 'Ion Aramendi';
const subs = new Set();
export function guardarCfg() { localStorage.setItem('rec_cfg', JSON.stringify(cfg)); subs.forEach(f => f(cfg)); }
export const alCambiarCfg = f => subs.add(f);
