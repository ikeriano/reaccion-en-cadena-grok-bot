// Juega de verdad (modo automático ?auto) y guarda capturas: node tools/flujo.mjs <modo> <carpeta> [vel] [extra]
// modo: programa | entreno:<prueba>. Termina cuando aparecen los botones del final.
import puppeteer from 'puppeteer-core'; import fs from 'fs';
const [modo = 'entreno:centro', dir = '/tmp/flujo', vel = '2', extra = ''] = process.argv.slice(2);
fs.mkdirSync(dir, { recursive: true });
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 720 });
let err = 0; p.on('pageerror', e => { console.log('PAGEERROR', e.message); err++; }); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) { console.log('console.error', m.text()); err++; } });
await p.goto(`http://127.0.0.1:8772/index.html?main&auto&novoz&vel=${vel}${extra}`); await p.waitForFunction('window.__plato && window.__plato.ok', { timeout: 60000 });
await p.evaluate(m => { window.__at.cfg.cabecera = false; window.__at.iniciar(m); }, modo);
const t0 = Date.now(); let n = 0, ultimo = '';
while (Date.now() - t0 < 600000) {
  await new Promise(r => setTimeout(r, 1500));
  const est = await p.evaluate(() => ({ fin: [...document.querySelectorAll('#actions button')].map(x => x.textContent).join('|'), banda: document.querySelector('#juego .rc-tit')?.textContent || '', ov: !document.querySelector('#overlay').classList.contains('hidden') }));
  const f = `${dir}/${String(n++).padStart(3, '0')}.png`; await p.screenshot({ path: f });
  if (est.banda !== ultimo) { console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', f, est.banda.slice(0, 60)); ultimo = est.banda; }
  if (/Repetir|Otro programa/.test(est.fin)) { console.log('FIN', est.fin); break; }
}
const res = await p.evaluate(() => document.querySelector('#marcador').innerText); console.log('marcador:', res.replace(/\n/g, ' · '));
console.log('errores', err); await b.close();
