import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 720 }); const w = ms => new Promise(r => setTimeout(r, ms));
await p.goto('http://127.0.0.1:8772/index.html?main'); await p.waitForFunction('window.__plato && window.__plato.ok', { timeout: 60000 }); await w(2000);
await p.evaluate(() => { document.querySelector('#menu')?.classList.add('hidden'); __at.show(...__at.CAMS.presentador, true); }); await w(3000); await p.screenshot({ path: 'capturas/04_ion_aramendi_plato.png' });
await p.evaluate(() => { const v=document.querySelector('#cortVid'); v.muted=true; document.querySelector('#cort').classList.remove('hidden'); v.src='cortinillas/01_cabecera_logo.mp4'; v.currentTime=6; }); await w(2500); await p.screenshot({ path: 'capturas/00_cabecera_oficial.png' });
await b.close();
