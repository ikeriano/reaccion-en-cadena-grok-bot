// Capturas de menú, plató y opciones: node tools/capturas_menu.mjs <carpeta>
import puppeteer from 'puppeteer-core'; import fs from 'fs';
const dir = process.argv[2] || '/tmp/menu'; fs.mkdirSync(dir, { recursive: true });
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 720 });
p.on('pageerror', e => console.log('PAGEERROR', e.message));
const w = ms => new Promise(r => setTimeout(r, ms));
await p.goto('http://127.0.0.1:8772/index.html'); await p.waitForFunction('window.__plato && window.__plato.ok', { timeout: 60000 }); await w(2500);
await p.screenshot({ path: `${dir}/01_portada.png` });
await p.evaluate(() => __at.irMenu('main')); await w(1500); await p.screenshot({ path: `${dir}/02_menu.png` });
await p.evaluate(() => { document.querySelector('#menu').classList.add('hidden'); __at.camara('general', true); }); await w(2500); await p.screenshot({ path: `${dir}/03_plato.png` });
await p.evaluate(() => __at.camara('equipos', true)); await w(2500); await p.screenshot({ path: `${dir}/03b_plato_equipos.png` });
await p.evaluate(() => { document.querySelector('#menu').classList.remove('hidden'); __at.irMenu('options'); }); await w(1500); await p.screenshot({ path: `${dir}/12_opciones.png` });
await p.evaluate(() => __at.Lt('normas')); await w(1000); await p.screenshot({ path: `${dir}/13_normas_sorpresa.png` });
await b.close();
