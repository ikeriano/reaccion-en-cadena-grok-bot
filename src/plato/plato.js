// Plató 3D de «Reacción en cadena», hecho a partir de las fotos que mandó Iker (plato_general.jpg y
// plato_retando_a_los_mozos.jpg): suelo azul brillante con tarima redonda azul clara y aro de luz,
// disco central de cristal, dos atriles blancos de equipo con pantalla azul al fondo, atril del presentador
// en el centro, paredes LED azules con líneas de luz blancas cruzadas y marcos blancos, monitores negros
// al pie de la pared y la pantalla curva de arriba con el rótulo «REACCIÓN EN CADENA · · ·».
// Pensado para gama baja (Redmi A2): pocos polígonos, texturas de canvas pequeñas, sin sombras en «Baja».
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { mat, glow, figure } from '../lib/helpers.js';

function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { c, g }; return t; }
const rndSeed = seed => { let s = seed * 77 + 3; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };

/** Pared LED: fondo azul con remolinos claros y líneas de luz blancas cruzadas (como en las fotos) */
function pintaLED(g, w, h, seed = 1) {
  const rnd = rndSeed(seed);
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a2a8a'); gr.addColorStop(0.5, '#1a52d8'); gr.addColorStop(1, '#0a2a8a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) { const x = rnd() * w, y = rnd() * h, r = h * (0.25 + rnd() * 0.45); const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(190,230,255,0.85)'); rg.addColorStop(0.35, 'rgba(90,170,255,0.45)'); rg.addColorStop(1, 'rgba(20,60,200,0)'); g.fillStyle = rg; g.beginPath(); g.ellipse(x, y, r * 1.6, r * 0.55, rnd() * 3, 0, 7); g.fill(); }
  g.lineCap = 'round';
  for (let i = 0; i < 22; i++) { const x0 = rnd() * w, y0 = rnd() < 0.5 ? 0 : h, x1 = x0 + (rnd() - 0.5) * w * 0.5, y1 = h - y0; g.strokeStyle = 'rgba(255,255,255,0.9)'; g.shadowColor = '#bfe6ff'; g.shadowBlur = 10; g.lineWidth = 2 + rnd() * 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
  g.shadowBlur = 0;
}
function pintaRemolino(g, w, h, rosa = false) {
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, rosa ? '#3a2aa8' : '#0a2aa8'); gr.addColorStop(1, '#2a7bff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  [[0.3, 0.5, '#ffffff'], [0.75, 0.4, rosa ? '#ff9ad8' : '#cfe8ff'], [0.55, 0.85, '#6ad0ff']].forEach(([x, y, c]) => { const rg = g.createRadialGradient(x * w, y * h, 0, x * w, y * h, h * 0.7); rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,80,0)'); g.globalAlpha = 0.7; g.fillStyle = rg; g.fillRect(0, 0, w, h); });
  g.globalAlpha = 1; g.fillStyle = 'rgba(10,30,140,0.9)'; [[0.42, 0.35, 0.18], [0.7, 0.7, 0.14]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x * w, y * h, r * w, r * h * 1.4, 0.5, 0, 7); g.fill(); });
}
function texTarima(S, logo) {
  return canvasTex(S, S, (g, w, h) => {
    const rg = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); rg.addColorStop(0, '#cfe4ff'); rg.addColorStop(0.42, '#6aa8ff'); rg.addColorStop(0.44, '#e8f4ff'); rg.addColorStop(0.47, '#4a8aff'); rg.addColorStop(0.85, '#2a62e0'); rg.addColorStop(1, '#a8d0ff');
    g.fillStyle = rg; g.fillRect(0, 0, w, h);
    g.save(); g.translate(w / 2, h / 2); g.globalAlpha = 0.25; for (let i = 0; i < 18; i++) { g.rotate(Math.PI / 9); g.fillStyle = i % 2 ? '#ffffff' : '#1a4ad0'; g.beginPath(); g.ellipse(w * 0.3, 0, w * 0.16, w * 0.03, 0.6, 0, 7); g.fill(); } g.restore();
    g.globalAlpha = 1; g.strokeStyle = '#ffffff'; g.lineWidth = w * 0.006; g.beginPath(); g.arc(w / 2, h / 2, w * 0.43, 0, 7); g.stroke();
    if (logo) { g.save(); g.globalAlpha = 0.28; g.translate(w / 2, h / 2); g.scale(-1, 1); const s = (w * 0.5) / logo.naturalWidth; g.drawImage(logo, -logo.naturalWidth * s / 2, -logo.naturalHeight * s / 2, logo.naturalWidth * s, logo.naturalHeight * s); g.restore(); }
  });
}

export function construirPlato(scene, ctx, opciones = {}) {
  const Q = opciones.quality || 'media', T = Q === 'baja' ? 512 : 1024;
  const root = new THREE.Group(); scene.add(root);
  scene.background = new THREE.Color(0x020818); scene.fog = new THREE.Fog(0x020818, 30, 70);
  // ---------- luces (pocas: gama baja) ----------
  root.add(new THREE.HemisphereLight(0xcfe0ff, 0x0a1a5a, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(2, 14, 10); key.castShadow = Q !== 'baja'; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 }); root.add(key);
  const azulA = new THREE.PointLight(0x3a8bff, 30, 26, 1.6); azulA.position.set(-7, 6, -6); root.add(azulA);
  const azulB = new THREE.PointLight(0x5fc8ff, 30, 26, 1.6); azulB.position.set(7, 6, -6); root.add(azulB);

  // ---------- suelo azul brillante ----------
  const sueloTex = canvasTex(T, T, (g, w, h) => { const rg = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); rg.addColorStop(0, '#1a4ad0'); rg.addColorStop(0.6, '#0e2a8a'); rg.addColorStop(1, '#061440'); g.fillStyle = rg; g.fillRect(0, 0, w, h); const rnd = rndSeed(5); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(160,210,255,${0.05 + rnd() * 0.12})`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 6 + rnd() * 40, 2 + rnd() * 8, rnd() * 3, 0, 7); g.fill(); } });
  const suelo = new THREE.Mesh(new THREE.CircleGeometry(26, 48), new THREE.MeshStandardMaterial({ map: sueloTex, roughness: 0.22, metalness: 0.35, transparent: true, opacity: 1 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; root.add(suelo);
  let refl = null;
  if (opciones.reflejo && Q !== 'baja') { refl = new Reflector(new THREE.CircleGeometry(26, 48), { textureWidth: 512, textureHeight: 512, color: 0x6a80b0 }); refl.rotation.x = -Math.PI / 2; refl.position.y = -0.01; root.add(refl); suelo.material.opacity = 0.75; }

  // ---------- tarima redonda (azul clara) con aro de luz y disco central de cristal ----------
  const tarTex = texTarima(T, null);
  const tarima = new THREE.Mesh(new THREE.CylinderGeometry(8.6, 8.8, 0.3, 64), [mat(0xeaf4ff, { emissive: 0xbfe0ff, emissiveIntensity: 1.6 }), new THREE.MeshStandardMaterial({ map: tarTex, roughness: 0.15, metalness: 0.2, emissive: 0x2a5ad0, emissiveIntensity: 0.25 }), mat(0x0a1030)]);
  tarima.position.set(0, 0.15, -2); tarima.receiveShadow = true; root.add(tarima);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(8.75, 0.06, 6, 96), glow(0xe8f6ff, 3)); aro.rotation.x = Math.PI / 2; aro.position.set(0, 0.31, -2); root.add(aro);
  const discoTex = texTarima(T / 2, null);
  const disco = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.06, 48), new THREE.MeshStandardMaterial({ map: discoTex, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.85, emissive: 0x4a8aff, emissiveIntensity: 0.35 }));
  disco.position.set(0, 0.33, -2.6); root.add(disco);
  const aroDisco = new THREE.Mesh(new THREE.TorusGeometry(3.62, 0.04, 6, 64), glow(0xffffff, 2.4)); aroDisco.rotation.x = Math.PI / 2; aroDisco.position.set(0, 0.36, -2.6); root.add(aroDisco);
  function logoEnSuelo() { const img = ctx.logoPantalla; if (!img || !img.naturalWidth) return; const nt = texTarima(T / 2, img); disco.material.map = nt; disco.material.needsUpdate = true; }

  // ---------- paredes LED curvas ----------
  const leds = [];
  const ledTex = canvasTex(T * 2, T / 2, (g, w, h) => pintaLED(g, w, h, 1)); ledTex.wrapS = THREE.RepeatWrapping; ledTex.repeat.x = 2;
  const pared = new THREE.Mesh(new THREE.CylinderGeometry(17, 17, 7.4, 48, 1, true, Math.PI * 0.38, Math.PI * 1.24), new THREE.MeshBasicMaterial({ map: ledTex, side: THREE.BackSide, toneMapped: false, color: 0xd8e4ff }));
  pared.position.set(0, 3.7, -1); root.add(pared); leds.push(ledTex);
  // marcos blancos verticales y diagonales delante de la pared
  const mMarco = mat(0xf4f8ff, { emissive: 0xcfe4ff, emissiveIntensity: 0.6 });
  const nMarcos = Q === 'baja' ? 12 : 18;
  for (let i = 0; i <= nMarcos; i++) {
    const a = Math.PI * 0.4 + (Math.PI * 1.2) * i / nMarcos; const x = Math.sin(a) * 16.4, z = Math.cos(a) * 16.4 - 1;
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.16, 7.2, 0.16), mMarco); col.position.set(x, 3.6, z); root.add(col);
    if (i < nMarcos) { const a2 = a + (Math.PI * 1.2) / nMarcos; const x2 = Math.sin(a2) * 16.4, z2 = Math.cos(a2) * 16.4 - 1; const L = Math.hypot(x2 - x, z2 - z, 6);
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.08, L, 0.08), glow(0xffffff, 1.6)); d.position.set((x + x2) / 2, 3.6, (z + z2) / 2); d.lookAt(x2, 6.6, z2); d.rotateX(Math.PI / 2); if (i % 2) d.rotateZ(0); root.add(d); }
    // monitor negro al pie de la pared
    if (i % 2 === 0) { const mon = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 0.2), mat(0x05070c, { roughness: 0.3 })); mon.position.set(Math.sin(a) * 15.6, 1.0, Math.cos(a) * 15.6 - 1); mon.lookAt(0, 1.0, -1); root.add(mon); }
  }

  // ---------- pantalla curva superior con rótulo ----------
  const bandaTex = canvasTex(T * 4, 128, () => {}); bandaTex.wrapS = THREE.RepeatWrapping; bandaTex.repeat.x = -1;
  const banda = new THREE.Mesh(new THREE.CylinderGeometry(15.4, 15.4, 1.5, 64, 1, true, Math.PI * 0.42, Math.PI * 1.16), new THREE.MeshBasicMaterial({ map: bandaTex, side: THREE.BackSide, toneMapped: false }));
  banda.position.set(0, 8.4, -1); root.add(banda);
  const bordeBanda = new THREE.Mesh(new THREE.CylinderGeometry(15.5, 15.5, 1.62, 64, 1, true, Math.PI * 0.42, Math.PI * 1.16), mat(0x0a0e1a)); bordeBanda.position.copy(banda.position); root.add(bordeBanda);
  let bandaTxt = 'REACCIÓN EN CADENA';
  function pintaBanda() {
    const { g } = bandaTex.userData, w = bandaTex.userData.c.width, h = 128; g.fillStyle = '#061238'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(80,120,220,0.35)'; for (let x = 4; x < w; x += 8) for (let y = 4; y < h; y += 8) g.fillRect(x, y, 3, 3);
    g.font = '900 64px "Arial Black", Arial'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.shadowColor = '#9fd0ff'; g.shadowBlur = 8;
    const bloque = g.measureText(bandaTxt).width + g.measureText('   •  •  •   ').width; const n = Math.max(1, Math.floor(w / bloque)); const paso = w / n;
    for (let i = 0; i < n; i++) { const x0 = i * paso + (paso - bloque) / 2; g.textAlign = 'left'; g.fillText(bandaTxt + '   •  •  •', x0, h / 2 + 3); }
    g.shadowBlur = 0; bandaTex.needsUpdate = true;
  }
  pintaBanda();

  // ---------- panel LED central (logo / prueba) ----------
  const PW = 7.2, PH = 4.05;
  const pc = document.createElement('canvas'); pc.width = Q === 'baja' ? 640 : 1024; pc.height = pc.width * PH / PW | 0; const pg = pc.getContext('2d');
  const pantTex = new THREE.CanvasTexture(pc); pantTex.colorSpace = THREE.SRGBColorSpace;
  const pantMesh = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: pantTex, toneMapped: false })); pantMesh.position.set(0, 4.1, -17.6); root.add(pantMesh);
  const pant = { modo: 'logo', datos: {}, sucio: true };
  const fondoPant = (() => { const c = document.createElement('canvas'); c.width = pc.width; c.height = pc.height; pintaRemolino(c.getContext('2d'), c.width, c.height); return c; })();
  function pintarPantalla() {
    const g = pg, w = pc.width, h = pc.height, d = pant.datos; g.drawImage(fondoPant, 0, 0);
    if (pant.modo === 'info' && d.title) {
      g.fillStyle = 'rgba(6,16,70,0.8)'; g.fillRect(w * 0.06, h * 0.08, w * 0.88, h * 0.84);
      g.fillStyle = '#ffd23a'; g.font = `900 ${w * 0.05 | 0}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(d.title), w / 2, h * 0.2, w * 0.8);
      g.font = `bold ${w * 0.034 | 0}px Arial`; (d.rows || []).slice(0, 5).forEach(([k, v], i) => { g.textAlign = 'right'; g.fillStyle = '#9fd8ff'; g.fillText(k, w * 0.47, h * 0.36 + i * h * 0.12); g.textAlign = 'left'; g.fillStyle = '#fff'; g.fillText(v, w * 0.51, h * 0.36 + i * h * 0.12, w * 0.42); });
    } else if (pant.modo === 'texto') {
      g.fillStyle = '#fff'; g.font = `900 ${w * 0.08 | 0}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(d.texto || ''), w / 2, h / 2, w * 0.9);
    } else if (ctx.logoPantalla && ctx.logoPantalla.naturalWidth) { const i = ctx.logoPantalla, s = Math.min((w * 0.8) / i.naturalWidth, (h * 0.7) / i.naturalHeight); g.drawImage(i, (w - i.naturalWidth * s) / 2, (h - i.naturalHeight * s) / 2, i.naturalWidth * s, i.naturalHeight * s); }
    pantTex.needsUpdate = true;
  }

  // ---------- atriles de los equipos ----------
  const figs = [], atriles = [];
  const atrilTexA = canvasTex(512, 192, (g, w, h) => pintaRemolino(g, w, h)), atrilTexB = canvasTex(512, 192, (g, w, h) => pintaRemolino(g, w, h, true));
  const mBlanco = mat(0xf6f8fc, { roughness: 0.25 });
  const ROPA = [[0x1a1a24, 0xe8e8f0, 0xd8a0a0], [0x7a7a6a, 0x3a6ad0, 0xf2f2f2]];
  function crearAtril(x, z, ry, e) {
    const g = new THREE.Group(); g.position.set(x, 0.3, z); g.rotation.y = ry; root.add(g);
    const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.92, 0.7), [mBlanco, mBlanco, mBlanco, mBlanco, new THREE.MeshBasicMaterial({ map: e === 0 ? atrilTexA : atrilTexB, toneMapped: false }), mBlanco]);
    cuerpo.position.y = 0.46; g.add(cuerpo);
    const tapa = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.08, 0.95), mat(0xffffff, { roughness: 0.1 })); tapa.position.set(0, 0.96, -0.08); g.add(tapa);
    const lado = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.97, 0.95), mBlanco); lado.position.set(e === 0 ? 1.6 : -1.6, 0.48, -0.08); g.add(lado);
    const tira = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.05, 0.05), glow(e === 0 ? 0x3a8bff : 0xff8a1a, 2.5)); tira.position.set(0, 0.04, 0.37); g.add(tira);
    for (let k = 0; k < 3; k++) { const f = figure({ body: ROPA[e][k], legs: 0x1a2030, skin: [0xd9b08c, 0xc8a07a, 0xe0b898][(k + e) % 3], hair: [0x2a1a10, 0x6a4a20, 0x101010][k] }); f.position.set(-1.0 + k * 1.0, 0, -0.75); g.add(f); figs.push(f); }
    g.traverse(o => { if (o.isMesh) { o.castShadow = Q !== 'baja'; o.receiveShadow = Q !== 'baja'; } });
    atriles.push({ g, tira });
  }
  crearAtril(-4.3, -5.3, 0.42, 0); crearAtril(4.3, -5.3, -0.42, 1); atriles.forEach(a => a.g.scale.setScalar(1.15));

  // ---------- atril del presentador (centro) y presentador ----------
  const pres = new THREE.Group(); pres.position.set(0, 0.36, -1.2); root.add(pres);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.6), mat(0xdfe6f2, { metalness: 0.5, roughness: 0.3 })); base.position.y = 0.03; pres.add(base);
  const pie = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.0, 10), mat(0xe8eef8, { metalness: 0.6, roughness: 0.25 })); pie.position.y = 0.55; pres.add(pie);
  const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.035, 0.4), glow(0x6ad0ff, 1.4)); tablet.position.y = 1.08; tablet.rotation.x = 0.35; pres.add(tablet);
  const presentador = new THREE.Group(); presentador.position.set(0, 0.36, -0.6); presentador.rotation.y = Math.PI; root.add(presentador);
  { const tl = new THREE.TextureLoader(); const tx = tl.load('img/ion.jpg'); tx.colorSpace = THREE.SRGBColorSpace; const am = canvasTex(64, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.45, w * 0.45, w / 2, h * 0.5, w * 0.9); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const foto = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.6), new THREE.MeshBasicMaterial({ map: tx, alphaMap: am, transparent: true, side: THREE.DoubleSide })); foto.position.y = 1.3; foto.rotation.y = Math.PI; presentador.add(foto); }

  // ---------- público (sofás blancos a la derecha, como en «Retando a los Mozos») ----------
  const publico = new THREE.Group(); publico.userData.publico = true; root.add(publico);
  const nFilas = Q === 'baja' ? 1 : 2, porFila = Q === 'baja' ? 6 : 8;
  for (let f = 0; f < nFilas; f++) {
    const sofa = new THREE.Group(); sofa.position.set(10.5 + f * 1.6, 0.2 + f * 0.4, 3 - f * 0.6); sofa.rotation.y = -1.05; publico.add(sofa);
    const asiento = new THREE.Mesh(new THREE.BoxGeometry(porFila * 0.75, 0.45, 0.8), mBlanco); asiento.position.y = 0.22; sofa.add(asiento);
    const resp = new THREE.Mesh(new THREE.BoxGeometry(porFila * 0.75, 0.7, 0.2), mBlanco); resp.position.set(0, 0.6, -0.35); sofa.add(resp);
    for (let k = 0; k < porFila; k++) { const p = figure({ body: [0x5a9aff, 0xff5a7a, 0x9affc8, 0xffffff, 0xffd34d][(k + f) % 5], seated: true, scale: 0.9 }); p.position.set(-porFila * 0.375 + 0.375 + k * 0.75, 0.42, 0); sofa.add(p); }
  }

  // ---------- paseo ----------
  const walker = figure({ body: 0xff7a1a, legs: 0x223355 }); walker.visible = false; root.add(walker);
  const marca = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 28), glow(0x33ff88, 3)); marca.rotation.x = Math.PI / 2; marca.visible = false; root.add(marca);
  function bloqueado(x, z) { if (Math.hypot(x, z + 1) > 15) return true; if (Math.hypot(x, z + 1.2) < 0.45) return true; for (const a of atriles) { const p = new THREE.Vector3(x, 0, z); a.g.worldToLocal(p); if (Math.abs(p.x) < 1.8 && p.z > -0.5 && p.z < 0.6) return true; } return false; }

  // ---------- confeti ----------
  let confeti = null;
  function celebrar() {
    if (confeti) root.remove(confeti);
    const n = Q === 'baja' ? 160 : 360, geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 3), vel = [];
    const cs = [new THREE.Color(0xff3f8a), new THREE.Color(0xff9a1a), new THREE.Color(0x5fd8ff), new THREE.Color(0xffffff)];
    for (let i = 0; i < n; i++) { pos.set([(Math.random() - 0.5) * 18, 9 + Math.random() * 5, (Math.random() - 0.5) * 12 - 3], i * 3); const c = cs[i % 4]; col.set([c.r, c.g, c.b], i * 3); vel.push(1 + Math.random() * 2); }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    confeti = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.14, vertexColors: true })); confeti.userData = { vel, t: 0 }; root.add(confeti);
  }
  const saltos = new Map(); let pantT = 0;
  function update(t, dt) {
    pantT += dt; if (pant.sucio || pantT > 0.5) { pintarPantalla(); pant.sucio = false; pantT = 0; }
    leds.forEach((l, i) => { l.offset.x = (t * 0.006 * (i % 2 ? 1 : -1)) % 1; });
    bandaTex.offset.x = (t * 0.012) % 1;
    presentador.rotation.y = Math.PI + Math.sin(t * 0.5) * 0.3;
    for (const [i, s] of saltos) { s.t += dt; const f = figs[i]; f.position.y = Math.abs(Math.sin(s.t * 9)) * 0.22; if (s.t > 1.1) { f.position.y = 0; saltos.delete(i); } }
    if (confeti) { const p = confeti.geometry.attributes.position; confeti.userData.t += dt; for (let i = 0; i < p.count; i++) { p.setX(i, p.getX(i) + Math.sin(t * 3 + i) * dt * 0.5); p.setY(i, p.getY(i) - confeti.userData.vel[i] * dt); } p.needsUpdate = true; if (confeti.userData.t > 8) { root.remove(confeti); confeti = null; } }
  }
  const posFig = i => { const v = new THREE.Vector3(); figs[i].getWorldPosition(v); return v; };
  return {
    root, update, celebrar, presentador, figs, walker, marca, posFig, bloqueado,
    pantalla(modo, datos = {}) { pant.modo = modo; pant.datos = datos; pant.sucio = true; },
    banda(txt) { bandaTxt = txt || 'REACCIÓN EN CADENA'; pintaBanda(); },
    refrescarPantalla() { pant.sucio = true; logoEnSuelo(); },
    luzEquipo(e, on) { const a = atriles[e]; if (a) a.tira.material.emissiveIntensity = on ? 7 : 2.5; },
    salta(i) { if (figs[i] && !saltos.has(i)) saltos.set(i, { t: 0 }); },
    ocultarFig(i, v) { if (figs[i]) figs[i].visible = !v; },
    reset() { figs.forEach(f => { f.visible = true; f.position.y = 0; }); saltos.clear(); pant.modo = 'logo'; pant.sucio = true; bandaTxt = 'REACCIÓN EN CADENA'; pintaBanda(); atriles.forEach(a => a.tira.material.emissiveIntensity = 2.5); },
    destruir() { scene.remove(root); root.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); }); if (refl) refl.dispose?.(); },
  };
}
