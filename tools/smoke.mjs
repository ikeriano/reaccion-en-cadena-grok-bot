import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 720 });
p.on('pageerror', e => console.log('PAGEERROR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('console.error', m.text()); });
await p.goto('http://127.0.0.1:8772/index.html?main&novoz'); await p.waitForFunction('window.__plato && window.__plato.ok', { timeout: 60000 });
await new Promise(r => setTimeout(r, 3000)); await p.screenshot({ path: 'capturas/smoke_main.png' });
await p.evaluate(() => { document.querySelector('#menu').classList.add('hidden'); window.__at.camara('general'); }); await new Promise(r => setTimeout(r, 3500));
await p.screenshot({ path: 'capturas/smoke_general.png' }); await b.close();
