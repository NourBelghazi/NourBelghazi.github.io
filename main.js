/* =====================================================
   RETRO PORTFOLIO — main.js  v4  (FNAF aesthetic)
   ===================================================== */

// ── INTRO TYPEWRITER ──────────────────────────────────
(function initIntro() {
  const el = document.getElementById('intro-lines');
  if (!el) return;
  const lines = [
    { html: '<span class="dim">> </span><span class="hi">NOUR BELGHAZI</span>' },
    { html: '<span class="dim">> </span>Software Engineering — Université Laval  <span class="warn">2024–2028</span>' },
    { html: '<span class="dim">> </span><span class="warn">C++</span>  ·  Python  ·  Java  ·  JavaScript  ·  Vue.js  ·  Node.js' },
    { html: '<span class="dim">> </span>TA C++ avancé  ·  Games : <span class="hi">Pac-Man</span>  ·  <span class="hi">Dino</span>  ·  Snake' },
    { html: '<span class="dim">> </span><span class="hi">Click objects</span> to explore — hover to identify' },
  ];
  let li = 0, ci = 0, raw = [];
  function tick() {
    if (li >= lines.length) return;
    const line = lines[li];
    // Extract visible text length for character-by-character reveal
    const tmp = document.createElement('div');
    tmp.innerHTML = line.html;
    const fullText = tmp.textContent;
    if (ci <= fullText.length) {
      // Show HTML but clip to ci visible chars using a span trick
      const ratio = ci / (fullText.length || 1);
      const visibleHtml = line.html;
      raw[li] = visibleHtml; // show full html immediately per char step
      // Rebuild displayed lines
      let html = '';
      for (let i = 0; i < li; i++) html += raw[i] + '\n';
      html += visibleHtml.substring(0, Math.round(visibleHtml.length * ratio));
      el.innerHTML = html;
      ci++;
      setTimeout(tick, 18);
    } else {
      raw[li] = line.html;
      li++; ci = 0;
      let html = '';
      for (let i = 0; i <= li - 1; i++) html += raw[i] + '\n';
      el.innerHTML = html;
      setTimeout(tick, li < lines.length ? 120 : 0);
    }
  }
  setTimeout(tick, 280);
})();

// ── MODAL SYSTEM ─────────────────────────────────────
function openModal(id) {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
  const m = document.getElementById('modal-' + id);
  if (m) m.classList.add('open');
  setModalOpen(true);
}
function closeModal(id) {
  const m = document.getElementById('modal-' + id);
  if (m) m.classList.remove('open');
  setModalOpen(false);
}
document.querySelectorAll('[data-close]').forEach(btn =>
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // empêche le clic de bubbler vers window (évite re-ouverture scène 3D)
    closeModal(btn.dataset.close.replace('modal-', ''));
  })
);
document.querySelectorAll('.modal').forEach(m =>
  m.addEventListener('click', e => {
    e.stopPropagation(); // même protection pour clic sur le fond du modal
    if (e.target === m) closeModal(m.id.replace('modal-', ''));
  })
);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal.open').forEach(m => closeModal(m.id.replace('modal-', '')));
});

// ═══════════════════════════════════════════════════════
// THREE.JS SCENE
// ═══════════════════════════════════════════════════════
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// ACES cinematic tonemapping — key for FNAF photorealism
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.2;
document.getElementById('canvas-wrap').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0b08);
scene.fog = new THREE.Fog(0x0d0b08, 7, 22);

// ── CAMERA — security-cam style, slightly tilted ──────
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 40);
camera.position.set(-0.35, 0.90, 2.4);
camera.lookAt(-0.05, 0.38, -0.8);
camera.rotation.z = 0.018; // subtle security-camera tilt

// ── LIGHTS ────────────────────────────────────────────
// Ambient très fort pour voir toute la scène malgré ACESFilmic et la lampe tournée
const ambient = new THREE.AmbientLight(0x5a3c22, 25.0);
scene.add(ambient);

// Main halogen spot — faisceau concentré, pointe vers le CV et le bureau
const lamp = new THREE.SpotLight(0xffaa28, 340, 20, Math.PI / 5.2, 0.38, 1.2);
lamp.position.set(2.0, 3.6, 0.4);
lamp.target.position.set(1.3, 0.8, -2.8); // Retour à ta position
lamp.castShadow = true;
lamp.shadow.mapSize.set(2048, 2048);
lamp.shadow.bias = -0.001;
scene.add(lamp); scene.add(lamp.target);

// TV CRT — glow bleu froid plus intense, range plus court (concentré)
const tvGlow = new THREE.PointLight(0x3a6ca0, 18, 2.8);
tvGlow.position.set(-1.38, 0.72, 1.1);
scene.add(tvGlow);

// Side fill — barely perceptible cool bounce
const sideFill = new THREE.PointLight(0x0e1620, 4, 12);
sideFill.position.set(-4, 2.5, 0.5);
scene.add(sideFill);

// Illumination douce du mur — couleur moins saturée pour ne pas teinter le CV
const wallKey = new THREE.PointLight(0x6a4020, 6, 12);
wallKey.position.set(2.0, 2.6, -2.0);
scene.add(wallKey);

// Plafonnier principal — lumière chaude modérée
const overheadLight = new THREE.PointLight(0xffd8a0, 280, 22);
overheadLight.position.set(0.0, 5.0, 0.5);
scene.add(overheadLight);
// Deuxième plafonnier côté TV
const overheadTV = new THREE.PointLight(0xffd0a0, 180, 18);
overheadTV.position.set(-1.5, 4.8, 0.8);
scene.add(overheadTV);

// ── FILM GRAIN OVERLAY ───────────────────────────────
const grainCv = document.getElementById('grain-overlay');
grainCv.width = 512; grainCv.height = 288; // 16:9, stretched via CSS
const grainCtx = grainCv.getContext('2d');
function updateGrain() {
  // ImageData réutilisé (alloué une seule fois)
  if (!updateGrain._id) updateGrain._id = grainCtx.createImageData(512, 288);
  const id = updateGrain._id;
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 210 + 22) | 0;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  grainCtx.putImageData(id, 0, 0);
}
updateGrain();

// ── CANVAS TEXTURE HELPERS ───────────────────────────
function makeTex(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  fn(c.getContext('2d'), w, h); return new THREE.CanvasTexture(c);
}
function rnd(a, b) { return a + Math.random() * (b - a); }

// ── PAINTED PLASTER WALL TEXTURE ─────────────────────
const wallTex = makeTex(1024, 1024, (ctx, w, h) => {
  ctx.fillStyle = '#2c2218'; ctx.fillRect(0, 0, w, h);
  // Per-pixel stucco micro-relief via sine turbulence
  const wid = ctx.getImageData(0, 0, w, h); const wd = wid.data;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const t = Math.sin(px * 0.18 + py * 0.07) * 0.22 + Math.sin(px * 0.42 - py * 0.21 + 1.3) * 0.14
        + Math.sin(px * 0.09 + py * 0.31 + 2.7) * 0.18 + Math.sin(px * 0.71 + py * 0.55 + 0.8) * 0.08;
      const v = Math.max(0, Math.min(1, t * 0.5 + 0.5));
      const idx = (py * w + px) * 4;
      wd[idx] = (36 + v * 30) | 0; wd[idx + 1] = (26 + v * 20) | 0; wd[idx + 2] = (14 + v * 10) | 0; wd[idx + 3] = 255;
    }
  }
  ctx.putImageData(wid, 0, 0);
  // Large tonal patches
  for (let i = 0; i < 48; i++) {
    const x = rnd(-80, w + 80), y = rnd(-80, h + 80), r = rnd(70, 380);
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r), br = rnd(0.72, 1.30), a = rnd(0, 0.15);
    grd.addColorStop(0, `rgba(${(52 * br) | 0},${(38 * br) | 0},${(22 * br) | 0},${a})`);
    grd.addColorStop(1, 'transparent'); ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  }
  // Horizontal roller/trowel marks
  for (let i = 0; i < 120; i++) {
    const y0 = rnd(0, h); let cx = 0, cy = y0;
    ctx.beginPath(); ctx.moveTo(0, y0);
    while (cx < w) { cx += rnd(8, 42); cy += rnd(-1.8, 1.8); ctx.lineTo(cx, cy); }
    ctx.strokeStyle = `rgba(${rnd(12, 58) | 0},${rnd(8, 40) | 0},${rnd(4, 22) | 0},${rnd(0.01, 0.052)})`;
    ctx.lineWidth = rnd(0.4, 3.4); ctx.stroke();
  }
  // Macro cracks: shadow + core + highlight
  [
    [[90, 0], [112, 195], [96, 370], [120, 560], [104, 740], [115, 920], [98, 1024]],
    [[490, 0], [505, 210], [478, 440], [500, 680], [488, 1024]],
    [[780, 160], [752, 390], [768, 615], [748, 840]],
  ].forEach(pts => {
    ctx.beginPath(); ctx.moveTo(pts[0][0] + 2, pts[0][1]);
    pts.slice(1).forEach(p => ctx.lineTo(p[0] + rnd(-5, 5) + 2, p[1] + rnd(-4, 4)));
    ctx.strokeStyle = 'rgba(3,1,0,0.52)'; ctx.lineWidth = rnd(3.5, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(p => ctx.lineTo(p[0] + rnd(-4, 4), p[1] + rnd(-3, 3)));
    ctx.strokeStyle = 'rgba(4,2,0,0.85)'; ctx.lineWidth = rnd(1, 2.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pts[0][0] - 1.5, pts[0][1]);
    pts.slice(1).forEach(p => ctx.lineTo(p[0] + rnd(-3, 3) - 1.5, p[1] + rnd(-2, 2)));
    ctx.strokeStyle = 'rgba(82,64,36,0.28)'; ctx.lineWidth = 0.8; ctx.stroke();
  });
  // Hairline cracks
  for (let i = 0; i < 16; i++) {
    const sx = rnd(0, w), sy = rnd(0, h);
    ctx.beginPath(); ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + rnd(-50, 50), sy + rnd(20, 100), sx + rnd(-110, 110), sy + rnd(40, 200));
    ctx.strokeStyle = `rgba(3,1,0,${rnd(0.28, 0.58)})`; ctx.lineWidth = rnd(0.3, 1.1); ctx.stroke();
  }
  // Water stain drips
  for (let i = 0; i < 18; i++) {
    const x = rnd(40, w - 40), y0 = rnd(0, h * 0.55), len = rnd(50, 360);
    const grd = ctx.createLinearGradient(x, y0, x + rnd(-20, 20), y0 + len);
    grd.addColorStop(0, 'transparent'); grd.addColorStop(0.2, `rgba(13,8,2,0.26)`); grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd; ctx.fillRect(x - rnd(5, 16), y0, rnd(10, 32), len);
  }
  // AO edges
  const ao1 = ctx.createLinearGradient(0, h * 0.56, 0, h);
  ao1.addColorStop(0, 'transparent'); ao1.addColorStop(1, 'rgba(2,1,0,0.56)');
  ctx.fillStyle = ao1; ctx.fillRect(0, 0, w, h);
  const ao2 = ctx.createLinearGradient(0, 0, w * 0.13, 0);
  ao2.addColorStop(0, 'rgba(2,1,0,0.40)'); ao2.addColorStop(1, 'transparent');
  ctx.fillStyle = ao2; ctx.fillRect(0, 0, w, h);
});
wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
wallTex.repeat.set(3, 2);

// ── MAHOGANY DESK — per-pixel annual ring grain ───────
const woodTex = makeTex(1024, 512, (ctx, w, h) => {
  ctx.fillStyle = '#1c0904'; ctx.fillRect(0, 0, w, h);
  // Per-pixel annual ring pattern (face-sawn)
  const wid2 = ctx.getImageData(0, 0, w, h); const wd2 = wid2.data;
  const rcx = w * 0.5, rcy = h * 4.2;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const dx = px - rcx, dy = py - rcy, dist = Math.sqrt(dx * dx + dy * dy);
      const ring = Math.sin(dist * 0.074 + Math.sin(px * 0.019) * 2.6) * 0.5 + 0.5;
      const fiber = Math.sin(dist * 0.40 + Math.sin(py * 0.024 + px * 0.011) * 2.0) * 0.28;
      const ray = Math.sin(px * 0.007 + py * 0.002) * 0.10;
      const v = Math.max(0, Math.min(1, ring * 0.62 + fiber * 0.26 + ray * 0.12 + 0.38));
      const idx = (py * w + px) * 4;
      wd2[idx] = (18 + v * 64) | 0; wd2[idx + 1] = (5 + v * 22) | 0; wd2[idx + 2] = (v * 6) | 0; wd2[idx + 3] = 255;
    }
  }
  ctx.putImageData(wid2, 0, 0);
  // Fine grain lines overlay
  for (let i = 0; i < 200; i++) {
    const y0 = rnd(-h * 0.1, h * 1.1), br = rnd(0.82, 1.65);
    ctx.beginPath(); ctx.moveTo(0, y0);
    let cx2 = 0, cy2 = y0;
    while (cx2 < w) { cx2 += rnd(8, 32); cy2 += rnd(-2.5, 2.5); ctx.lineTo(cx2, cy2); }
    ctx.strokeStyle = `rgba(${(58 * br) | 0},${(22 * br) | 0},${(5 * br) | 0},${rnd(0.025, 0.10)})`;
    ctx.lineWidth = rnd(0.2, 1.7); ctx.stroke();
  }
  // Pore pattern
  for (let i = 0; i < 700; i++) {
    ctx.beginPath();
    ctx.ellipse(rnd(0, w), rnd(0, h), rnd(1, 3.8), rnd(0.4, 1.3), 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(7,2,0,${rnd(0.22, 0.52)})`; ctx.fill();
  }
  // Knots with distorted grain
  [[w * 0.22, h * 0.44, 22], [w * 0.67, h * 0.30, 16]].forEach(([kx, ky, kr]) => {
    const kg = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr * 2.8);
    kg.addColorStop(0, 'rgba(4,1,0,0.95)'); kg.addColorStop(0.3, 'rgba(12,4,1,0.72)');
    kg.addColorStop(0.7, 'rgba(24,8,2,0.36)'); kg.addColorStop(1, 'transparent');
    ctx.fillStyle = kg;
    ctx.beginPath(); ctx.ellipse(kx, ky, kr * 1.9, kr * 1.45, rnd(-0.4, 0.4), 0, Math.PI * 2); ctx.fill();
    for (let a = 0; a < Math.PI * 2; a += 0.09) {
      const r = kr * rnd(2.6, 4.2), sx = kx + Math.cos(a) * r, sy = ky + Math.sin(a) * r;
      ctx.beginPath(); ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(kx, ky + rnd(-kr, kr), sx + Math.cos(a + 0.45) * rnd(18, 50), sy + Math.sin(a + 0.45) * rnd(8, 24));
      ctx.strokeStyle = `rgba(9,3,0,${rnd(0.12, 0.30)})`; ctx.lineWidth = rnd(0.2, 1); ctx.stroke();
    }
  });
  // Chatoyance stripe (varnish gloss)
  const cg = ctx.createLinearGradient(w * 0.06, 0, w * 0.54, 0);
  cg.addColorStop(0, 'transparent'); cg.addColorStop(0.35, 'rgba(85,36,8,0.06)');
  cg.addColorStop(0.5, 'rgba(115,50,12,0.13)'); cg.addColorStop(0.65, 'rgba(85,36,8,0.06)');
  cg.addColorStop(1, 'transparent'); ctx.fillStyle = cg; ctx.fillRect(0, 0, w, h);
  // Scratches
  for (let i = 0; i < 48; i++) {
    ctx.beginPath(); ctx.moveTo(rnd(0, w), rnd(0, h)); ctx.lineTo(rnd(0, w), rnd(0, h));
    ctx.strokeStyle = `rgba(${rnd(4, 18) | 0},${rnd(1, 6) | 0},0,${rnd(0.10, 0.30)})`; ctx.lineWidth = rnd(0.15, 0.75); ctx.stroke();
  }
  // Coffee rings
  [[w * 0.34, h * 0.52, 30], [w * 0.71, h * 0.37, 25]].forEach(([rx, ry, rr]) => {
    [1, 0.87, 0.76].forEach((sc, i) => {
      ctx.beginPath(); ctx.arc(rx + rnd(-2, 2), ry + rnd(-2, 2), rr * sc, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(7,2,0,${0.26 - i * 0.07})`; ctx.lineWidth = rnd(0.8, 2.2); ctx.stroke();
    });
  });
  // Edge darkening
  [[0, 0, 20, h], [w - 20, 0, 20, h], [0, 0, w, 15], [0, h - 15, w, 15]].forEach(([ex, ey, ew, eh]) => {
    ctx.fillStyle = 'rgba(3,1,0,0.42)'; ctx.fillRect(ex, ey, ew, eh);
  });
});
woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(3, 1);

// ── ANIMATED TV STATIC ───────────────────────────────
const SW = 480, SH = 360;
const staticCanvas = document.createElement('canvas');
staticCanvas.width = SW; staticCanvas.height = SH;
const sctx = staticCanvas.getContext('2d');
const staticTex = new THREE.CanvasTexture(staticCanvas);

function updateStatic() {
  // ImageData réutilisé (alloué une seule fois)
  if (!updateStatic._id) updateStatic._id = sctx.createImageData(SW, SH);
  const id = updateStatic._id;
  for (let i = 0; i < id.data.length; i += 4) {
    const v = (Math.random() * 200 + 30) | 0;
    id.data[i] = v * 0.72;
    id.data[i + 1] = v * 0.80;
    id.data[i + 2] = v;
    id.data[i + 3] = 255;
  }
  if (Math.random() < 0.08) {
    const row = (Math.random() * (SH - 2) | 0) * SW * 4;
    for (let j = 0; j < SW * 4; j += 4) { id.data[row + j] = 245; id.data[row + j + 1] = 252; id.data[row + j + 2] = 255; }
  }
  sctx.putImageData(id, 0, 0);
  staticTex.needsUpdate = true;
}

// ── POST-IT TEXTURE ──────────────────────────────────
const postitTex = makeTex(512, 512, (ctx, w, h) => {
  // Jaune sombre/saturé qui survive à l'ACES 2.2 sans blanchir
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#a07808'); g.addColorStop(0.5, '#8c6400'); g.addColorStop(1, '#705000');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // Légère texture papier
  for (let i = 0; i < 800; i++) { ctx.fillStyle = `rgba(0,0,0,${rnd(0, 0.018)})`; ctx.fillRect(rnd(0, w), rnd(0, h), rnd(1, 5), rnd(0.5, 2)); }
  // Bande de scotch en haut — plus visible
  ctx.fillStyle = 'rgba(220,210,140,0.55)'; ctx.fillRect(w * 0.28, 0, w * 0.44, 32);
  ctx.strokeStyle = 'rgba(180,165,80,0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(w * 0.28, 32); ctx.lineTo(w * 0.72, 32); ctx.stroke();
  // Texte noir bien lisible, grande police
  ctx.fillStyle = '#120800'; ctx.textAlign = 'center';
  ctx.font = 'bold 58px "Courier New"'; ctx.fillText('RAY-TRACER', w / 2, 130);
  ctx.font = 'bold 52px "Courier New"'; ctx.fillText('PROJECT', w / 2, 210);
  ctx.font = 'bold 56px "Courier New"'; ctx.fillText('IN PROGRESS', w / 2, 290);
  ctx.font = 'bold 36px "Courier New"'; ctx.fillStyle = '#2a1400';
  ctx.fillText('SEE YOU SOON', w / 2, 370);
  // Ombre légère bas et droite (relief)
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect(0, 0, 10, h); ctx.fillRect(w - 10, 0, 10, h); ctx.fillRect(0, h - 10, w, 10);
});

// ── CV TEXTURE ───────────────────────────────────────
const cvTex = makeTex(512, 680, (ctx, w, h) => {
  // Fond transparent — la couleur Phong du matériau donne l'orange du cadre
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 70px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('CV', w / 2, 24);
});




// ── VHS COVER TEXTURES (cinematic, detailed) ─────────
const texLoader = new THREE.TextureLoader();

// Ajoute un fond noir si l'image n'est pas encore chargée
const defaultMatArgs = { color: 0x050403, shininess: 6 };

// PAC-MAN — analog horror
const pacTex = texLoader.load('pacman.png');
pacTex.colorSpace = THREE.SRGBColorSpace;

// DINO ADVENTURE — analog horror
const dinoTex = texLoader.load('dino.png');
dinoTex.colorSpace = THREE.SRGBColorSpace;

// RETRO SNAKE — analog horror
const snakeTex = texLoader.load('snake.png');
snakeTex.colorSpace = THREE.SRGBColorSpace;



// ── MATERIALS ─────────────────────────────────────────
const makePhong = (opts) => new THREE.MeshPhongMaterial({ shininess: 5, ...opts });

const matWall = makePhong({ map: wallTex, color: 0x3a2c1e });
const matWood = makePhong({ map: woodTex, color: 0x2a1608, shininess: 8 });
const matTV = new THREE.MeshBasicMaterial({ color: 0x090806 });
const matScreen = new THREE.MeshBasicMaterial({ map: staticTex });
const matPostit = new THREE.MeshBasicMaterial({ map: postitTex, transparent: false, opacity: 1.0 });
const matFrame = makePhong({ color: 0x4a2c0a, shininess: 12 });
const matFrameR = makePhong({ color: 0x28160a });
const matCV = new THREE.MeshPhongMaterial({ map: cvTex, color: 0x28160a, shininess: 5, transparent: true, side: THREE.FrontSide }); cvTex.needsUpdate = true;
const matGlass = new THREE.MeshPhongMaterial({ color: 0xaac8c0, transparent: true, opacity: 0.15, shininess: 80, side: THREE.DoubleSide });
const matMetal = makePhong({ color: 0x282420, shininess: 30 });
const matLamp = new THREE.MeshBasicMaterial({ color: 0x0e0c0a, side: THREE.DoubleSide });
const matVCR = makePhong({ color: 0x0e0c0a });
const matFloppy = makePhong({ color: 0x18140e });

// ── HELPERS ───────────────────────────────────────────
function box(w, h, d, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
  m.castShadow = m.receiveShadow = true; scene.add(m); return m;
}
function pln(w, h, mat, x, y, z, rx = 0, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.x = rx; m.rotation.y = ry;
  m.receiveShadow = true; scene.add(m); return m;
}

// ── ROOM ─────────────────────────────────────────────
pln(16, 9, matWall, 0, 1.5, -4.5);
pln(12, 9, matWall, -6, 1.5, -0.5, 0, Math.PI / 2);
pln(12, 9, matWall, 6, 1.5, -0.5, 0, -Math.PI / 2);
pln(16, 12, makePhong({ color: 0x0c0a08, shininess: 2 }), 0, 6, -0.5, -Math.PI / 2);
pln(16, 12, makePhong({ map: woodTex, color: 0x1a0c06, shininess: 4 }), 0, -1.5, -0.5, -Math.PI / 2);

// ── DESK ─────────────────────────────────────────────
const DY = 0.08;
// Add very subtle imperfection: tiny Y rotations, slight X tilt
box(5.9, 0.12, 2.1, matWood, 0, DY, 0.5, 0.002, 0, 0.001); // surface
box(5.9, 0.52, 0.09, matWood, 0, DY - 0.31, 1.58, 0, 0, 0.003);
box(0.09, 1.6, 0.12, matMetal, -2.72, DY - 0.86, -0.12);
box(0.09, 1.6, 0.12, matMetal, 2.72, DY - 0.86, -0.12);

// ── TV + VCR GROUP — angled ~14° towards player ──────
const TVX = -1.38, TVY = DY + 0.53, TVZ = 0.70;
const tvGroup = new THREE.Group();
tvGroup.position.set(TVX, TVY, TVZ);
tvGroup.rotation.y = 0.24; // positive = screen turns towards player (right side)
scene.add(tvGroup);

// Local helpers that add to tvGroup instead of scene
function tbox(w, h, d, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
  m.castShadow = m.receiveShadow = true; tvGroup.add(m); return m;
}
function tpln(w, h, mat, x, y, z, rx = 0, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.x = rx; m.rotation.y = ry;
  m.receiveShadow = true; tvGroup.add(m); return m;
}

// Corps principal (positions relatives au centre du groupe)
tbox(1.06, 0.94, 0.96, matTV, 0, 0, 0, 0.008, 0, 0.006);
// Bezel
tbox(0.72, 0.57, 0.025, matTV, 0, 0.07, 0.468, 0, 0, 0.006);
// Chanfreins
tbox(0.014, 0.57, 0.04, matTV, -0.36, 0.07, 0.45, 0, 0, 0.006);
tbox(0.014, 0.57, 0.04, matTV, 0.36, 0.07, 0.45, 0, 0, 0.006);
tbox(0.72, 0.014, 0.04, matTV, 0, 0.36, 0.45);
tbox(0.72, 0.014, 0.04, matTV, 0, -0.22, 0.45);
// Screen
const scr = tpln(0.60, 0.47, matScreen, 0, 0.07, 0.485);
scr.rotation.z = 0.006;
// Knobs
tbox(0.09, 0.09, 0.04, matMetal, -0.3, -0.35, 0.472);
tbox(0.09, 0.09, 0.04, matMetal, -0.18, -0.35, 0.472);
tbox(0.26, 0.06, 0.02, makePhong({ color: 0x060402 }), 0.2, -0.34, 0.475);
// Pieds (Y relatif à TVY: DY+0.025 - TVY = -0.505)
tbox(0.14, 0.05, 0.14, matTV, -0.38, -0.505, -0.12);
tbox(0.14, 0.05, 0.14, matTV, 0.38, -0.505, -0.12);
// Post-it
const po = tpln(0.28, 0.26, matPostit, 0.10, 0.26, 0.52);
po.rotation.z = 0.10;
// Hitbox du post-it
const hitPostit = new THREE.Mesh(
  new THREE.BoxGeometry(0.34, 0.30, 0.06),
  new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
);
hitPostit.position.set(0.10, 0.26, 0.52);
hitPostit.rotation.z = 0.10;
hitPostit.userData.clickId = 'postit';
hitPostit.frustumCulled = false;
tvGroup.add(hitPostit);
// TV glow light — move into group so it rotates with the TV
scene.remove(tvGlow);
tvGlow.position.set(0, 0.11, 0.40);
tvGroup.add(tvGlow);

// ── VCR (Y relatif à TVY: DY+0.073 - TVY = -0.457) ──
tbox(0.92, 0.145, 0.58, matVCR, 0, -0.457, -0.02, 0, 0.005, 0.003);
tbox(0.37, 0.032, 0.02, makePhong({ color: 0x030201 }), -0.12, -0.425, 0.26);
tbox(0.17, 0.042, 0.01, new THREE.MeshBasicMaterial({ color: 0xff2200 }), 0.28, -0.425, 0.26);
[-0.1, -0.02, 0.06].forEach(bx => tbox(0.044, 0.03, 0.01, matMetal, bx, -0.425, 0.26));

// ── LAMP ─────────────────────────────────────────────
const LX = 2.05, LZ = 0.88;
box(0.18, 0.04, 0.18, matMetal, LX, DY + 0.02, LZ);
const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.02, 8), matMetal);
arm1.position.set(LX, DY + 0.55, LZ); arm1.rotation.z = 0.26; scene.add(arm1);
const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.74, 8), matMetal);
arm2.position.set(LX + 0.24, DY + 1.1, LZ); arm2.rotation.z = -0.36; scene.add(arm2);
// Shade plus grand et ouvert — cone visible clair
const matShade = new THREE.MeshPhongMaterial({ color: 0x1c1408, emissive: 0x3a2206, emissiveIntensity: 0.45, side: THREE.DoubleSide });
const shade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.36, 20, 1, true), matShade);
shade.position.set(LX + 0.48, DY + 1.42, LZ); shade.rotation.z = 0.6; scene.add(shade);
// Disque de fermeture du haut du shade
const shadeTop = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), matShade);
shadeTop.position.set(LX + 0.32, DY + 1.58, LZ); shadeTop.rotation.z = 0.6; scene.add(shadeTop);
// Bulbe visible et lumineux
const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfffbe0 });
const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 10), bulbMat);
bulb.position.set(LX + 0.48, DY + 1.32, LZ); scene.add(bulb);
// Point light sous le shade pour simuler la chaleur du bulbe
const bulbGlow = new THREE.PointLight(0xffcc44, 28, 3.2);
bulbGlow.position.set(LX + 0.48, DY + 1.32, LZ); scene.add(bulbGlow);
lamp.position.set(LX + 0.48, DY + 1.32, LZ);

// ── CV FRAME ─────────────────────────────────────────
const FX = 1.48, FY = 2.1, FZ = -4.06;
box(1.56, 1.96, 0.07, matFrame, FX, FY, FZ, 0.01, 0.006, 0);
box(1.33, 1.72, 0.05, matFrameR, FX, FY, FZ + 0.025);
const cvPlane = pln(1.27, 1.63, matCV, FX, FY, FZ + 0.065);

pln(1.36, 1.72, matGlass, FX, FY, FZ + 0.05);
const cvHit = new THREE.Mesh(new THREE.BoxGeometry(1.56, 1.96, 0.35), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
cvHit.position.set(FX, FY, FZ + 0.1); cvHit.userData.clickId = 'cv'; scene.add(cvHit);

// ── VHS TAPES ────────────────────────────────────────
const TW = 0.70, TH = 0.12, TD = 0.50;
const TX = 0.50, TZ = 1.18;
const TAPES = [
  { id: 'pacman', cover: pacTex, bodyCol: 0x16120a, y: DY + 0.46, rot: -0.09, rx: 0.012 },
  { id: 'dino', cover: dinoTex, bodyCol: 0x06100a, y: DY + 0.32, rot: -0.09, rx: -0.008 },
  { id: 'snake', cover: snakeTex, bodyCol: 0x0c0018, y: DY + 0.18, rot: -0.09, rx: 0.005 },
];
const tapeMeshes = [];
TAPES.forEach(t => {
  const grp = new THREE.Group();
  grp.position.set(TX, t.y, TZ); grp.rotation.y = t.rot; grp.rotation.x = t.rx;

  const bodyM = new THREE.Mesh(new THREE.BoxGeometry(TW, TH, TD), makePhong({ color: t.bodyCol }));
  bodyM.castShadow = bodyM.receiveShadow = true; grp.add(bodyM);

  const covMat = new THREE.MeshPhongMaterial({ map: t.cover, shininess: 6 });
  const cov = new THREE.Mesh(new THREE.PlaneGeometry(TW - 0.01, TD - 0.01), covMat);
  cov.rotation.x = -Math.PI / 2; cov.position.y = TH / 2 + 0.001; grp.add(cov);

  const spineTex = t.cover.clone();
  // Recadrer l'image pour qu'elle s'affiche sur la tranche (effet wrap-around de boîte de jeu PC)
  spineTex.repeat.set(1, 0.25);
  spineTex.offset.set(0, 0.35);
  const spinM = new THREE.Mesh(new THREE.PlaneGeometry(TW - 0.01, TH - 0.01), new THREE.MeshPhongMaterial({ map: spineTex, shininess: 4 }));
  spinM.position.z = TD / 2 + 0.001; grp.add(spinM);

  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(TW + 0.02, TH + 0.02, TD + 0.02),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hit.userData.clickId = t.id; grp.add(hit);

  scene.add(grp);
  tapeMeshes.push({ grp, covMat, id: t.id });
});

// ── PROPS ────────────────────────────────────────────
[{ x: -2.38, z: 0.98, r: 0.32 }, { x: -2.15, z: 1.16, r: -0.24 }, { x: -2.0, z: 1.36, r: 0.58 }].forEach(f => {
  box(0.27, 0.018, 0.30, matFloppy, f.x, DY + 0.01, f.z, 0, f.r, rnd(-0.01, 0.01));
  box(0.11, 0.02, 0.12, matMetal, f.x + 0.04, DY + 0.02, f.z + 0.09, 0, f.r);
  box(0.19, 0.019, 0.09, makePhong({ color: 0xd8cead }), f.x, DY + 0.021, f.z - 0.07, 0, f.r);
});
// Clock
box(0.19, 0.25, 0.08, makePhong({ color: 0x1c1610 }), 1.88, DY + 0.13, 1.25, 0, 0.04, 0.01);
pln(0.15, 0.21, makePhong({ color: 0xe8e2c0 }), 1.88, DY + 0.135, 1.285);
// Cables (slightly wavy paths)
[[-1.28, 1.40, 0.72, 0.32], [-0.52, 1.48, 0.48, -0.14], [0.08, 1.46, 0.56, 0.10]].forEach(([cx, cz, cw, cr]) =>
  box(cw, 0.016, 0.022, makePhong({ color: 0x100a06 }), cx, DY + 0.014, cz, 0, cr, rnd(-0.02, 0.02))
);

// ── WALL CABLES — manual GLTF fetch (works on localhost) ────────────────
(async () => {
  const CTYPE = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
  const TSIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  try {
    const [gltfRes, binRes] = await Promise.all([fetch('cables/scene.gltf'), fetch('cables/scene.bin')]);
    const gj = await gltfRes.json();
    const bin = await binRes.arrayBuffer();

    function getAcc(idx) {
      const acc = gj.accessors[idx];
      const bv = gj.bufferViews[acc.bufferView];
      const AT = CTYPE[acc.componentType];
      const off = (bv.byteOffset || 0) + (acc.byteOffset || 0);
      const n = acc.count * TSIZE[acc.type];
      // handle stride: deinterleave if needed
      const stride = bv.byteStride || 0;
      const elSize = AT.BYTES_PER_ELEMENT * TSIZE[acc.type];
      if (stride && stride !== elSize) {
        const out = new AT(n);
        const src2 = new AT(bin, (bv.byteOffset || 0), bv.byteLength / AT.BYTES_PER_ELEMENT);
        const comps = TSIZE[acc.type];
        const elemStride = stride / AT.BYTES_PER_ELEMENT;
        const elemOffset = (acc.byteOffset || 0) / AT.BYTES_PER_ELEMENT;
        for (let i = 0; i < acc.count; i++) {
          for (let c = 0; c < comps; c++) out[i * comps + c] = src2[elemOffset + i * elemStride + c];
        }
        return out;
      }
      return new AT(bin, off, n);
    }

    const prim = gj.meshes[0].primitives[0];
    const pos = getAcc(prim.attributes.POSITION);
    const norm = getAcc(prim.attributes.NORMAL);
    const uv = getAcc(prim.attributes.TEXCOORD_0);
    const idx = getAcc(prim.indices);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(norm), 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
    geo.setIndex(new THREE.BufferAttribute(new Uint32Array(idx), 1));
    geo.computeBoundingBox();
    geo.computeBoundingSphere();

    const tl = new THREE.TextureLoader();
    const baseColor = tl.load('cables/textures/Scene_-_Root_baseColor.png');
    baseColor.colorSpace = THREE.SRGBColorSpace;
    baseColor.flipY = false;
    const metRough = tl.load('cables/textures/Scene_-_Root_metallicRoughness.png');
    const normalTex = tl.load('cables/textures/Scene_-_Root_normal.png');
    const mat = new THREE.MeshStandardMaterial({
      map: baseColor, metalnessMap: metRough, roughnessMap: metRough,
      normalMap: normalTex, metalness: 0.5, roughness: 0.65, side: THREE.DoubleSide
    });

    const matDark = new THREE.MeshStandardMaterial({
      map: baseColor, metalnessMap: metRough, roughnessMap: metRough,
      normalMap: normalTex, metalness: 0.5, roughness: 0.65, side: THREE.DoubleSide,
      color: 0x111111  // multiplicateur très sombre sur la texture → quasi noir
    });

    function place(sc, x, y, z, rx, ry, rz, m = mat) {
      const mesh = new THREE.Mesh(geo, m);
      mesh.scale.setScalar(sc); mesh.position.set(x, y, z); mesh.rotation.set(rx || 0, ry || 0, rz || 0);
      mesh.frustumCulled = false;
      scene.add(mesh);
    }
    const SC = 0.018;
    // Mur du fond — rangée basse
    place(SC, -3.8, 0.72, -4.44, 0, Math.PI, 0);
    place(SC, 0.4, 0.68, -4.44, 0, Math.PI, 0.03, matDark); // milieu = plus foncé
    place(SC, 4.6, 0.65, -4.44, 0, Math.PI, -0.03);
    // Mur du fond — rangée haute
    place(SC, -3.8, 2.30, -4.44, 0, Math.PI, 0);
    place(SC, 0.4, 2.25, -4.44, 0, Math.PI, 0.03, matDark); // milieu = plus foncé
    place(SC, 4.6, 2.22, -4.44, 0, Math.PI, -0.03);
    // Mur gauche (x ≈ -5.86)
    place(SC * 0.9, -5.86, 0.80, -1.6, 0, Math.PI / 2, -0.12);
    place(SC * 0.9, -5.86, 2.30, -1.6, 0, Math.PI / 2, -0.12);
    // Mur droit (x ≈ +5.88) — même SC que mur du fond = ~4.2m de couverture/instance
    // 3 positions Z × 2 rangées Y → couverture complète sans vide
    place(SC, 5.88, 0.70, -3.2, 0, -Math.PI / 2, 0.10);
    place(SC, 5.88, 0.68, -0.5, 0, -Math.PI / 2, 0.13, matDark);
    place(SC, 5.88, 0.72, 1.8, 0, -Math.PI / 2, 0.08);
    place(SC, 5.88, 2.22, -3.2, 0, -Math.PI / 2, 0.10);
    place(SC, 5.88, 2.20, -0.5, 0, -Math.PI / 2, 0.13, matDark);
    place(SC, 5.88, 2.24, 1.8, 0, -Math.PI / 2, 0.08);
    console.log('✅ cables placed');
  } catch (e) { console.error('❌ cable load failed:', e); }
})();

// ── CÂBLES TOMBANTS (cablesTombants) — au plafond ────────────────────────────
(async () => {
  const CTYPE2 = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
  const TSIZE2 = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  try {
    const [gltfRes2, binRes2] = await Promise.all([
      fetch('cablesTombants/scene.gltf'),
      fetch('cablesTombants/scene.bin')
    ]);
    const gj2 = await gltfRes2.json();
    const bin2 = await binRes2.arrayBuffer();

    function getAcc2(idx) {
      const acc = gj2.accessors[idx];
      const bv = gj2.bufferViews[acc.bufferView];
      const AT = CTYPE2[acc.componentType];
      const off = (bv.byteOffset || 0) + (acc.byteOffset || 0);
      const n = acc.count * TSIZE2[acc.type];
      const stride = bv.byteStride || 0;
      const elSize = AT.BYTES_PER_ELEMENT * TSIZE2[acc.type];
      if (stride && stride !== elSize) {
        const out = new AT(n);
        const src3 = new AT(bin2, (bv.byteOffset || 0), bv.byteLength / AT.BYTES_PER_ELEMENT);
        const comps = TSIZE2[acc.type];
        const elemStride = stride / AT.BYTES_PER_ELEMENT;
        const elemOffset = (acc.byteOffset || 0) / AT.BYTES_PER_ELEMENT;
        for (let i = 0; i < acc.count; i++)
          for (let c = 0; c < comps; c++) out[i * comps + c] = src3[elemOffset + i * elemStride + c];
        return out;
      }
      return new AT(bin2, off, n);
    }

    // Charger les textures du modèle
    const tl2 = new THREE.TextureLoader();
    const baseColor2 = tl2.load('cablesTombants/textures/material_0_baseColor.png');
    baseColor2.colorSpace = THREE.SRGBColorSpace;
    const metRough2 = tl2.load('cablesTombants/textures/material_0_metallicRoughness.png');
    const normalTex2 = tl2.load('cablesTombants/textures/material_0_normal.png');

    // Câbles noirs — color très sombre multipliée sur la texture
    const matCT = new THREE.MeshStandardMaterial({
      map: baseColor2, metalnessMap: metRough2, roughnessMap: metRough2,
      normalMap: normalTex2, color: 0x0a0806, metalness: 0.1, roughness: 0.95,
      side: THREE.DoubleSide
    });

    // Construire les géométries pour les 2 meshes du modèle
    const geos = [];
    for (let mi = 0; mi < gj2.meshes.length; mi++) {
      const prim = gj2.meshes[mi].primitives[0];
      const pos2 = getAcc2(prim.attributes.POSITION);
      const nor2 = getAcc2(prim.attributes.NORMAL);
      const uv2 = getAcc2(prim.attributes.TEXCOORD_0);
      const ix2 = getAcc2(prim.indices);
      const geo2 = new THREE.BufferGeometry();
      geo2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos2), 3));
      geo2.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nor2), 3));
      geo2.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv2), 2));
      geo2.setIndex(new THREE.BufferAttribute(new Uint32Array(ix2), 1));
      geo2.computeBoundingBox();
      geo2.computeBoundingSphere();
      geos.push(geo2);
    }

    // ── TRAJECTOIRE : départ GAUCHE, montée vers HAUT-DROITE ─────────────────
    // Le modèle s'étend surtout en -X (14.49 units). Avec ry=PI on le flip :
    // le long bout pointe maintenant vers +X (DROITE).
    // rz négatif incline ce bout vers le HAUT : les câbles montent vers le haut-droite
    // et leur extrémité sort du cadre (l'utilisateur ne voit pas le bout).
    // SC2=0.30 → ~4.35m de portée. Origine à gauche de la scène.

    const SC2 = 0.38;
    const OX = -2.0, OY = 4.3, OZ = -0.5;

    // [dx, dz, ry, rz]
    // Faisceau 1 : origine OX (dx≈0) — à droite
    // Faisceau 2 : décalé de -2.5 en X — à gauche du premier
    const instances = [
      // ── Faisceau 1 (actuel) ──────────────────────────────
      [0.0, 0.3, Math.PI, -0.28],
      [0.0, 0.0, Math.PI, -0.36],
      [0.0, -0.3, Math.PI, -0.46],
      [0.0, -0.6, Math.PI, -0.56],
      [0.1, -0.9, Math.PI, -0.66],
      [0.1, 0.6, Math.PI + 0.18, -0.32],
      [0.0, -1.2, Math.PI, -0.76],
      [0.2, 0.9, Math.PI - 0.22, -0.38],
      // ── Faisceau 2 : 1.3 unités à gauche (plus proche) ───────────────────
      [-1.3, 0.3, Math.PI, -0.30],
      [-1.3, 0.0, Math.PI, -0.38],
      [-1.3, -0.3, Math.PI, -0.48],
      [-1.3, -0.6, Math.PI, -0.58],
      [-1.2, -0.9, Math.PI, -0.68],
      [-1.2, 0.6, Math.PI + 0.15, -0.34],
      [-1.3, -1.2, Math.PI, -0.78],
      [-1.1, 0.9, Math.PI - 0.18, -0.40],
    ];

    instances.forEach(([dx, dz, ry, rz]) => {
      const grp = new THREE.Group();
      grp.position.set(OX + dx, OY, OZ + dz);
      // rx=PI/2 : node-transform Sketchfab. ry=PI : câble pointe droite. rz<0 : monte.
      grp.rotation.set(Math.PI / 2, ry, rz);
      grp.scale.setScalar(SC2);

      geos.forEach(geo2 => {
        const mesh2 = new THREE.Mesh(geo2, matCT);
        mesh2.frustumCulled = false;
        grp.add(mesh2);
      });

      scene.add(grp);
    });

    console.log('✅ cablesTombants: left→upper-right sweep');
  } catch (e) { console.error('❌ cablesTombants load failed:', e); }
})();

// ── CASQUE DE CHANTIER (BatiBloc) — sur le bureau ────────────────────────────
(async () => {
  const CTYPE3 = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
  const TSIZE3 = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  try {
    const [gltfResH, binResH] = await Promise.all([
      fetch('BatiBloc/scene.gltf'),
      fetch('BatiBloc/scene.bin')
    ]);
    const gjH = await gltfResH.json();
    const binH = await binResH.arrayBuffer();

    function getAccH(idx) {
      const acc = gjH.accessors[idx];
      const bv = gjH.bufferViews[acc.bufferView];
      const AT = CTYPE3[acc.componentType];
      const off = (bv.byteOffset || 0) + (acc.byteOffset || 0);
      const n = acc.count * TSIZE3[acc.type];
      const stride = bv.byteStride || 0;
      const elSize = AT.BYTES_PER_ELEMENT * TSIZE3[acc.type];
      if (stride && stride !== elSize) {
        const out = new AT(n);
        const src = new AT(binH, (bv.byteOffset || 0), bv.byteLength / AT.BYTES_PER_ELEMENT);
        const comps = TSIZE3[acc.type];
        const elemStride = stride / AT.BYTES_PER_ELEMENT;
        const elemOffset = (acc.byteOffset || 0) / AT.BYTES_PER_ELEMENT;
        for (let i = 0; i < acc.count; i++)
          for (let c = 0; c < comps; c++) out[i * comps + c] = src[elemOffset + i * elemStride + c];
        return out;
      }
      return new AT(binH, off, n);
    }

    const tlH = new THREE.TextureLoader();
    // Matériau 0 : casque (aiStandardSurface1)
    const baseH1 = tlH.load('BatiBloc/textures/aiStandardSurface1_baseColor.png');
    baseH1.colorSpace = THREE.SRGBColorSpace;
    baseH1.flipY = false;
    const mrH1 = tlH.load('BatiBloc/textures/aiStandardSurface1_metallicRoughness.png');
    const norH1 = tlH.load('BatiBloc/textures/aiStandardSurface1_normal.png');
    const matH1 = new THREE.MeshBasicMaterial({
      map: baseH1,
      // MeshBasicMaterial ignore toutes les lumières
      // color × 0.45 pré-compense l'ACES exposure 2.2 (1/2.2 ≈ 0.45)
      // → texture s'affiche à ses vraies couleurs après tone mapping
      color: new THREE.Color(0.12, 0.12, 0.12),
      side: THREE.FrontSide
    });
    // Matériau 1 : sangle (aiStandardSurface2)
    const baseH2 = tlH.load('BatiBloc/textures/aiStandardSurface2_baseColor.png');
    baseH2.colorSpace = THREE.SRGBColorSpace;
    const mrH2 = tlH.load('BatiBloc/textures/aiStandardSurface2_metallicRoughness.png');
    const norH2 = tlH.load('BatiBloc/textures/aiStandardSurface2_normal.png');
    const matH2 = new THREE.MeshStandardMaterial({
      map: baseH2, metalnessMap: mrH2, roughnessMap: mrH2,
      normalMap: norH2, metalness: 0.1, roughness: 0.8, side: THREE.DoubleSide
    });

    // Mesh 0 : casque uniquement (sangle supprimée)
    const meshDefs = [
      { posIdx: 0, norIdx: 1, uvIdx: 3, idxIdx: 4, mat: matH1 },
    ];

    // Le modèle Sketchfab est en unités ~50 → on réduit à ~0.006
    // Positionné sur le bureau entre TV et cassettes
    const SC_H = 0.0065;
    const grpH = new THREE.Group();
    grpH.position.set(-0.35, DY + 0.24, 1.2);
    grpH.rotation.set(0, Math.PI - 0.5, 0);
    grpH.scale.setScalar(SC_H);

    meshDefs.forEach(({ posIdx, norIdx, uvIdx, idxIdx, mat }) => {
      const pos = getAccH(posIdx);
      const nor = getAccH(norIdx);
      const uv = getAccH(uvIdx);
      const ix = getAccH(idxIdx);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nor), 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
      geo.setIndex(new THREE.BufferAttribute(new Uint32Array(ix), 1));
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      grpH.add(mesh);
    });

    // Calculer la bounding box réelle du casque depuis les données brutes
    const posH = getAccH(0);
    let mnX = Infinity, mxX = -Infinity, mnY = Infinity, mxY = -Infinity, mnZ = Infinity, mxZ = -Infinity;
    for (let i = 0; i < posH.length; i += 3) {
      mnX = Math.min(mnX, posH[i]); mxX = Math.max(mxX, posH[i]);
      mnY = Math.min(mnY, posH[i + 1]); mxY = Math.max(mxY, posH[i + 1]);
      mnZ = Math.min(mnZ, posH[i + 2]); mxZ = Math.max(mxZ, posH[i + 2]);
    }
    const cX = (mnX + mxX) / 2, cY = (mnY + mxY) / 2, cZ = (mnZ + mxZ) / 2;
    const sX = (mxX - mnX) * 1.0, sY = (mxY - mnY) * 0.88, sZ = (mxZ - mnZ) * 1.0; // X/Z exact pour inclure la visière
    const hitCasque = new THREE.Mesh(
      new THREE.BoxGeometry(sX, sY, sZ),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    );
    hitCasque.position.set(cX, cY, cZ);
    hitCasque.userData.clickId = 'casque';
    hitCasque.frustumCulled = false;
    grpH.add(hitCasque);

    scene.add(grpH);
    hitTargets.push(hitCasque);

    console.log('✅ casque de chantier placé sur le bureau');
  } catch (e) { console.error('❌ casque load failed:', e); }
})();

// ── BOOKS — pile de livres, droite du bureau ─────────────────────────────────
(async () => {
  const CTYPEBK = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
  const TSIZEBK = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  try {
    const [gltfBK, binBK] = await Promise.all([
      fetch('books/scene.gltf'),
      fetch('books/scene.bin')
    ]);
    const gjBK = await gltfBK.json();
    const binBK2 = await binBK.arrayBuffer();

    function getAccBK(idx) {
      const acc = gjBK.accessors[idx];
      const bv = gjBK.bufferViews[acc.bufferView];
      const AT = CTYPEBK[acc.componentType];
      const off = (bv.byteOffset || 0) + (acc.byteOffset || 0);
      const n = acc.count * TSIZEBK[acc.type];
      const stride = bv.byteStride || 0;
      const elSize = AT.BYTES_PER_ELEMENT * TSIZEBK[acc.type];
      if (stride && stride !== elSize) {
        const out = new AT(n);
        const src = new AT(binBK2, (bv.byteOffset || 0), bv.byteLength / AT.BYTES_PER_ELEMENT);
        const comps = TSIZEBK[acc.type];
        const elemStride = stride / AT.BYTES_PER_ELEMENT;
        const elemOffset = (acc.byteOffset || 0) / AT.BYTES_PER_ELEMENT;
        for (let i = 0; i < acc.count; i++)
          for (let c = 0; c < comps; c++) out[i * comps + c] = src[elemOffset + i * elemStride + c];
        return out;
      }
      return new AT(binBK2, off, n);
    }

    const tlBK = new THREE.TextureLoader();
    // Matériau paper
    const bkPaperBase = tlBK.load('books/textures/paper_baseColor.jpeg');
    bkPaperBase.colorSpace = THREE.SRGBColorSpace; bkPaperBase.flipY = false;
    const bkPaperMR = tlBK.load('books/textures/paper_metallicRoughness.png');
    const bkPaperNor = tlBK.load('books/textures/paper_normal.png');
    bkPaperNor.flipY = false;
    const matBKPaper = new THREE.MeshBasicMaterial({
      map: bkPaperBase, side: THREE.FrontSide
    });
    // Matériau cover
    const bkCoverBase = tlBK.load('books/textures/cover_baseColor.jpeg');
    bkCoverBase.colorSpace = THREE.SRGBColorSpace; bkCoverBase.flipY = false;
    const bkCoverMR = tlBK.load('books/textures/cover_metallicRoughness.png');
    const bkCoverNor = tlBK.load('books/textures/cover_normal.png');
    bkCoverNor.flipY = false;
    const matBKCover = new THREE.MeshBasicMaterial({
      map: bkCoverBase, side: THREE.FrontSide
    });
    const bkMats = [matBKPaper, matBKCover]; // idx: 0=paper, 1=cover

    // Construire toutes les géométries des 10 meshes
    const bkGeos = gjBK.meshes.map(mesh => {
      const prim = mesh.primitives[0];
      const pos = getAccBK(prim.attributes.POSITION);
      const nor = getAccBK(prim.attributes.NORMAL);
      const uv = getAccBK(prim.attributes.TEXCOORD_0);
      const ix = getAccBK(prim.indices);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nor), 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
      geo.setIndex(new THREE.BufferAttribute(new Uint32Array(ix), 1));
      geo.computeBoundingSphere();
      return { geo, matIdx: prim.material }; // 0=paper, 1=cover
    });

    // Créer une pile de livres à la position donnée
    function placeBooksStack(x, y, z, ry) {
      const grpBK = new THREE.Group();
      grpBK.position.set(x, y, z);
      grpBK.rotation.set(Math.PI, ry, 0); // rx=PI corrige l'orientation Collada Y-up
      grpBK.scale.setScalar(0.20);
      bkGeos.forEach(({ geo, matIdx }) => {
        const mesh = new THREE.Mesh(geo, bkMats[matIdx]);
        mesh.castShadow = mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        mesh.onBeforeRender = () => { renderer.toneMappingExposure = 2.3; };
        mesh.onAfterRender = () => { renderer.toneMappingExposure = 2.2; };
        grpBK.add(mesh);
      });
      scene.add(grpBK);
    }

    // Deux piles + superposition pour former une grande pile, au premier plan à droite
    const BX1 = 1.0, BX2 = 1.5;
    const BZ1 = 1.55, BZ2 = 1.35;
    const BY0 = DY + 0.28;
    const BY1 = DY + 0.53;
    const BY2 = DY + 0.78;
    placeBooksStack(BX1, BY0, BZ1, -0.65);
    placeBooksStack(BX2, BY0, BZ2, -0.65);
    placeBooksStack(BX1, BY1, BZ1, -0.60);
    placeBooksStack(BX2, BY1, BZ2, -0.60);
    placeBooksStack(BX1, BY2, BZ1, -0.65);
    placeBooksStack(BX2, BY2, BZ2, -0.65);

    // Hit box world-space pour toutes les piles de livres
    const hitLivres = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.78, 0.42),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    );
    hitLivres.position.set(1.25, DY + 0.62, 1.45);
    hitLivres.userData.clickId = 'livres';
    hitLivres.frustumCulled = false;
    scene.add(hitLivres);
    hitTargets.push(hitLivres);

    console.log('✅ books placed on desk (right side)');
  } catch (e) { console.error('❌ books load failed:', e); }
})();


// ── CATALOGUE MANAGER — moniteur rétro, PC, clavier, souris ──────────────────
(async () => {
  const CTYPECMG = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
  const TSIZECMG = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  try {
    const [gltfR, binR] = await Promise.all([
      fetch('catalogueManager/scene.gltf'),
      fetch('catalogueManager/scene.bin')
    ]);
    const gjR = await gltfR.json();
    const binR2 = await binR.arrayBuffer();

    function getAccR(idx) {
      const acc = gjR.accessors[idx];
      const bv = gjR.bufferViews[acc.bufferView];
      const AT = CTYPECMG[acc.componentType];
      const off = (bv.byteOffset || 0) + (acc.byteOffset || 0);
      const n = acc.count * TSIZECMG[acc.type];
      const stride = bv.byteStride || 0;
      const elSize = AT.BYTES_PER_ELEMENT * TSIZECMG[acc.type];
      if (stride && stride !== elSize) {
        const out = new AT(n);
        const src = new AT(binR2, (bv.byteOffset || 0), bv.byteLength / AT.BYTES_PER_ELEMENT);
        const comps = TSIZECMG[acc.type];
        const elemStride = stride / AT.BYTES_PER_ELEMENT;
        const elemOffset = (acc.byteOffset || 0) / AT.BYTES_PER_ELEMENT;
        for (let i = 0; i < acc.count; i++)
          for (let c = 0; c < comps; c++) out[i * comps + c] = src[elemOffset + i * elemStride + c];
        return out;
      }
      return new AT(binR2, off, n);
    }

    const tlR = new THREE.TextureLoader();
    const ldr = (uri, srgb = true) => {
      const t = tlR.load('catalogueManager/textures/' + uri);
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.flipY = false;
      return t;
    };

    const cmgMats = [
      new THREE.MeshBasicMaterial({ map: ldr('Ucupaint_Keyboard_Creme_baseColor.jpeg'), side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: ldr('Monitor_Cream_baseColor.jpeg'), side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: ldr('Monitor_Glass_emissive.jpeg'), side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: ldr('Mouse_Cream_baseColor.jpeg'), side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: ldr('PC_Cream_baseColor.jpeg'), side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: ldr('PC_Front_Cream_baseColor.png'), side: THREE.DoubleSide }),
    ];

    // Traversée récursive : accumule les matrices nœud pour chaque mesh
    const meshMatMap = {};
    function traverseR(parentMat, nodeIdx) {
      const node = gjR.nodes[nodeIdx];
      let worldMat = parentMat.clone();
      if (node.matrix) {
        const nm = new THREE.Matrix4();
        nm.fromArray(node.matrix);
        worldMat.multiply(nm);
      }
      if (node.mesh !== undefined) meshMatMap[node.mesh] = worldMat.clone();
      (node.children || []).forEach(ci => traverseR(worldMat, ci));
    }
    traverseR(new THREE.Matrix4(), 0);

    // Construire la liste de primitives à instancier
    const primList = [];
    gjR.meshes.forEach((mesh, mi) => {
      const prim = mesh.primitives[0];
      if (!prim || prim.attributes.POSITION === undefined) return;
      primList.push({ mi, prim });
    });

    // Centre du modèle dans l'espace local (moyenne des nœuds keyboard/monitor/PC)
    const CM_CX = 1.77, CM_CZ = -1.55;  // offset XZ du centre géométrique

    function placeSetup(wx, wy, wz, ry, rx = 0, sc = 1.0) {
      const grp = new THREE.Group();
      grp.position.set(wx, wy, wz);
      grp.rotation.set(rx, ry, 0);
      grp.scale.setScalar(sc);
      primList.forEach(({ mi, prim }) => {
        const pos = getAccR(prim.attributes.POSITION);
        const nor = prim.attributes.NORMAL !== undefined ? getAccR(prim.attributes.NORMAL) : null;
        const uv = prim.attributes.TEXCOORD_0 !== undefined ? getAccR(prim.attributes.TEXCOORD_0) : null;
        const ix = getAccR(prim.indices);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
        if (nor) geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nor), 3));
        if (uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
        geo.setIndex(new THREE.BufferAttribute(new Uint32Array(ix), 1));
        if (meshMatMap[mi]) geo.applyMatrix4(meshMatMap[mi]);
        geo.translate(-CM_CX, 0, -CM_CZ);
        geo.computeBoundingSphere();
        const mat = cmgMats[prim.material] || cmgMats[0];
        const exp = prim.material === 2 ? 3.0 : 0.45;
        const m = new THREE.Mesh(geo, mat);
        m.castShadow = m.receiveShadow = true;
        m.frustumCulled = false;
        m.onBeforeRender = () => { renderer.toneMappingExposure = exp; };
        m.onAfterRender = () => { renderer.toneMappingExposure = 2.2; };
        grp.add(m);
      });
      // Calculer la bounding box combinée de tous les meshes
      const combinedBox = new THREE.Box3();
      grp.children.forEach(child => {
        if (child.geometry) {
          child.geometry.computeBoundingBox();
          const childBox = child.geometry.boundingBox.clone();
          combinedBox.union(childBox);
        }
      });
      const boxSize = new THREE.Vector3();
      const boxCenter = new THREE.Vector3();
      combinedBox.getSize(boxSize);
      combinedBox.getCenter(boxCenter);
      // Hitbox basée sur la bounding box réelle + 10% marge
      const hitOrdi = new THREE.Mesh(
        new THREE.BoxGeometry(boxSize.x * 0.75, boxSize.y * 0.80, boxSize.z * 0.75),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
      );
      hitOrdi.position.copy(boxCenter);
      hitOrdi.userData.clickId = 'ordi';
      hitOrdi.frustumCulled = false;
      grp.add(hitOrdi);
      scene.add(grp);
      return hitOrdi;

    }

    // Ordi — coordonnées world directes du centre du modèle
    const ordiHit = placeSetup(1.35, DY + 0.22, 0.55, Math.PI + 0.60, 0, 1.5);
    hitTargets.push(ordiHit);
    // Ordi 2 — à droite du 1er (group x -0.55 → monde +0.55 car rotation PI)
    // Ordi 2 supprimé sur demande

    console.log('✅ catalogue manager x2 placed behind books');
  } catch (e) { console.error('❌ catalogue manager load failed:', e); }
})();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ── MONSTER CAN — canettes sur le bureau ─────────────────────────────────────
(async () => {
  const CTYPEM = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
  const TSIZEM = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
  try {
    const [gltfM, binM] = await Promise.all([
      fetch('Monster/scene.gltf'),
      fetch('Monster/scene.bin')
    ]);
    const gjM = await gltfM.json();
    const binM2 = await binM.arrayBuffer();

    function getAccM(idx) {
      const acc = gjM.accessors[idx];
      const bv = gjM.bufferViews[acc.bufferView];
      const AT = CTYPEM[acc.componentType];
      const off = (bv.byteOffset || 0) + (acc.byteOffset || 0);
      const n = acc.count * TSIZEM[acc.type];
      const stride = bv.byteStride || 0;
      const elSize = AT.BYTES_PER_ELEMENT * TSIZEM[acc.type];
      if (stride && stride !== elSize) {
        const out = new AT(n);
        const src = new AT(binM2, (bv.byteOffset || 0), bv.byteLength / AT.BYTES_PER_ELEMENT);
        const comps = TSIZEM[acc.type];
        const elemStride = stride / AT.BYTES_PER_ELEMENT;
        const elemOffset = (acc.byteOffset || 0) / AT.BYTES_PER_ELEMENT;
        for (let i = 0; i < acc.count; i++)
          for (let c = 0; c < comps; c++) out[i * comps + c] = src[elemOffset + i * elemStride + c];
        return out;
      }
      return new AT(binM2, off, n);
    }

    const tlM = new THREE.TextureLoader();
    const baseM = tlM.load('Monster/textures/initialShadingGroup_baseColor.png');
    baseM.colorSpace = THREE.SRGBColorSpace;
    baseM.flipY = false;
    const matM = new THREE.MeshBasicMaterial({ map: baseM, side: THREE.FrontSide });

    // Appliquer la matrice Sketchfab Y-up au mesh
    const rootMatM = new THREE.Matrix4();
    rootMatM.fromArray(gjM.nodes[0].matrix);
    const prim = gjM.meshes[0].primitives[0];
    const pos = getAccM(prim.attributes.POSITION);
    const nor = getAccM(prim.attributes.NORMAL);
    const uv = getAccM(prim.attributes.TEXCOORD_0);
    const ix = getAccM(prim.indices);
    const geoM = new THREE.BufferGeometry();
    geoM.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    geoM.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nor), 3));
    geoM.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
    geoM.setIndex(new THREE.BufferAttribute(new Uint32Array(ix), 1));
    geoM.applyMatrix4(rootMatM); // après cette opération, la canette est en Y : -3.9 à -0.01
    geoM.computeBoundingSphere();

    // scale 0.10 → canette ~39cm de haut, repose sur le bureau
    const monsterHits = []; // hit meshes pour le raycaster
    function placeMonster(x, y, z, ry = 0) {
      const grp = new THREE.Group();
      const m = new THREE.Mesh(geoM, matM);
      m.frustumCulled = false;
      m.onBeforeRender = () => { renderer.toneMappingExposure = 0.45; };
      m.onAfterRender = () => { renderer.toneMappingExposure = 2.2; };
      grp.add(m);
      // Hitbox basée sur la bounding box réelle de geoM
      geoM.computeBoundingBox();
      const bb = geoM.boundingBox;
      const canCenterY = (bb.min.y + bb.max.y) / 2;
      const canHalfH = (bb.max.y - bb.min.y) / 2 * 0.90; // serré en hauteur
      const canRadius = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) / 2 * 0.85; // serré en rayon
      const hit = new THREE.Mesh(
        new THREE.CylinderGeometry(canRadius, canRadius, canHalfH * 2, 12),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
      );
      hit.position.set(0, canCenterY, 0);
      hit.userData.clickId = 'monster';
      hit.frustumCulled = false;
      grp.add(hit);
      grp.position.set(x, y, z);
      grp.rotation.y = ry;
      grp.scale.setScalar(0.10);
      scene.add(grp);
      monsterHits.push(hit);
    }

    // Une canette devant l'utilisateur au premier plan
    placeMonster(-1.05, DY + 0.10, 1.50, 0.4);

    // Ajouter les hits de la monster au tableau global
    monsterHits.forEach(h => hitTargets.push(h));

    console.log('✅ Monster placed');
  } catch (e) { console.error('❌ Monster load failed:', e); }
})();

const lblEl = document.getElementById('hover-label');
const LABELS = {
  cv: 'VOIR LE CV',
  pacman: 'PAC-MAN',
  dino: 'DINO ADVENTURE',
  snake: 'RETRO SNAKE',
  monster: 'OPEN',
  casque: 'BATIBLOC PROJECT',
  livres: 'BOOKS',
  ordi: 'PRODUCT CATALOG MANAGER',
  postit: 'RAY-TRACER PROJECT',
};
// Flag caché pour éviter document.querySelector à chaque événement
let _modalOpen = false;
function setModalOpen(v) { _modalOpen = v; }

// hoverID + hitTargets (déclarés ici, utilisés dans mousemove et click)
let hoverID = null;
const hitTargets = [cvHit, ...tapeMeshes.map(t => { const h = t.grp.children.find(c => c.userData.clickId); return h; }).filter(Boolean), hitPostit];
// (monsterHits ajoutés après chargement async — voir loader Monster)

// Couleurs pré-allouées pour les tapes (avoid new THREE.Color() à chaque mousemove)
const _colorOn = new THREE.Color(0x221400);
const _colorOff = new THREE.Color(0x000000);

// Throttle du mousemove via rAF : le raycasting ne tourne qu'une fois par frame max
let _rafMousePending = false;
let _lastMouseX = 0, _lastMouseY = 0;
window.addEventListener('mousemove', e => {
  _lastMouseX = e.clientX; _lastMouseY = e.clientY;
  if (_rafMousePending) return;
  _rafMousePending = true;
  requestAnimationFrame(() => {
    _rafMousePending = false;
    if (_modalOpen) { lblEl.classList.remove('visible'); return; }
    mouse.x = (_lastMouseX / window.innerWidth) * 2 - 1;
    mouse.y = -(_lastMouseY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(hitTargets, true);
    let id = null;
    if (hits.length) { let o = hits[0].object; while (o && !o.userData.clickId) o = o.parent; id = o?.userData?.clickId || null; }
    if (id !== hoverID) { hoverID = id; document.body.style.cursor = id ? 'pointer' : 'crosshair'; }
    if (id) { lblEl.textContent = LABELS[id] || id; lblEl.style.left = _lastMouseX + 'px'; lblEl.style.top = _lastMouseY + 'px'; lblEl.classList.add('visible'); }
    else lblEl.classList.remove('visible');
    tapeMeshes.forEach(t => {
      t.covMat.emissive.set(hoverID === t.id ? 0x221400 : 0x000000);
      t.covMat.emissiveIntensity = hoverID === t.id ? 0.5 : 0;
    });
  });
});

// ── SON PSCHT (ouverture de canette) ───────────────────────────────────────
// Prefetch du WAV sans créer d'AudioContext (évite de court-circuiter buildTVAudio)
let canRawBytes = null;
let canOpenBuffer = null;
fetch('freesound_community-can-opening-fizzy-drink-soda-pop-high-quality-96655.mp3')
  .then(r => r.arrayBuffer()).then(ab => { canRawBytes = ab; }).catch(() => { });

function playPscht() {
  // Si l'audio n'est pas encore inité (pas d'interaction préalable), on le construit maintenant
  if (!tvAudioCtx) buildTVAudio();
  const ac = tvAudioCtx;
  if (!ac) return;
  const doPlay = () => {
    if (!canOpenBuffer && canRawBytes) {
      ac.decodeAudioData(canRawBytes.slice(0)).then(buf => {
        canOpenBuffer = buf;
        _playCan(ac);
      });
      return;
    }
    if (!canOpenBuffer) return;
    _playCan(ac);
  };
  if (ac.state === 'suspended') {
    ac.resume().then(doPlay);
  } else {
    doPlay();
  }
}
function _playCan(ac) {
  const src = ac.createBufferSource();
  src.buffer = canOpenBuffer;
  const gain = ac.createGain(); gain.gain.value = 1.2;
  src.connect(gain); gain.connect(ac.destination);
  src.start(ac.currentTime);
}

window.addEventListener('click', e => {
  if (_modalOpen) return; // cache flag, plus rapide que querySelector
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(hitTargets, true);
  if (!hits.length) return;
  let o = hits[0].object; while (o && !o.userData.clickId) o = o.parent;
  if (!o?.userData?.clickId) return;
  if (o.userData.clickId === 'monster') { playPscht(); return; }
  openModal(o.userData.clickId);
});

// ── ANIMATION LOOP ────────────────────────────────────
let fc = 0;
function animate() {
  requestAnimationFrame(animate); fc++;

  if (!_modalOpen) {
    // Effets coûteux uniquement si l'interface 3D est visible
    if (fc % 4 === 0) updateStatic();  // TV texture : toutes les 4 frames (~15fps)
    if (fc % 4 === 2) updateGrain();   // Grain     : toutes les 4 frames, décalé de 2
    tvGlow.intensity = 16 + Math.sin(fc * 0.25) * 1.2 + (Math.random() < 0.025 ? Math.random() * 6 : 0);
    lamp.intensity = 330 + Math.sin(fc * 0.07) * 18;
    bulbGlow.intensity = 27 + Math.sin(fc * 0.11) * 3;
    // Clignotement doux du plafonnier
    const flicker = Math.random();
    if (flicker < 0.004) {
      // Coupure brève et rare
      overheadLight.intensity = 0;
      overheadTV.intensity = 0;
    } else if (flicker < 0.012) {
      // Légère baisse
      overheadLight.intensity = 280 * (0.6 + Math.random() * 0.3);
      overheadTV.intensity = 180 * (0.6 + Math.random() * 0.3);
    } else {
      // Variation sinusoïdale très douce
      overheadLight.intensity = 280 + Math.sin(fc * 0.14) * 18;
      overheadTV.intensity = 180 + Math.sin(fc * 0.17) * 12;
    }
  }

  renderer.render(scene, camera);
  // Masquer l'écran d'intro — au moins 5s après le premier frame
  if (!window._introHidden) {
    window._introHidden = true;
    setTimeout(() => {
      const intro = document.getElementById('intro-screen');
      if (intro) {
        intro.style.opacity = '0';
        setTimeout(() => {
          intro.remove();
          // ✅ Démarrer le son TV automatiquement dès la fin du loading
          if (soundOn) startTVSound();
        }, 900);
      } else {
        if (soundOn) startTVSound();
      }
    }, 5000);
  }
}
animate();


// ── TV STATIC INTERFERENCE — toggle avec [T] ──────────────────────────────
const tvCanvas = document.getElementById('tv-static');
const tvHint = document.getElementById('tv-hint');
const TVW = 320, TVH = 240; // basse résolution → pixel art exprès
tvCanvas.width = TVW;
tvCanvas.height = TVH;
const tvCtx = tvCanvas.getContext('2d');

let tvActive = false; // visuel OFF par défaut

// Web Audio — bruit blanc TV
let tvAudioCtx = null;
let tvNoiseNode = null;
let tvGainNode = null;
let tvFilterNode = null;

function buildTVAudio() {
  if (tvAudioCtx) return;
  tvAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  tvGainNode = tvAudioCtx.createGain();
  tvGainNode.gain.setValueAtTime(0, tvAudioCtx.currentTime);

  // Filtre passe-bande → character TV analogique (pas de grave ni de très haut)
  tvFilterNode = tvAudioCtx.createBiquadFilter();
  tvFilterNode.type = 'bandpass';
  tvFilterNode.frequency.value = 2800;
  tvFilterNode.Q.value = 0.6;

  // Bruit blanc (ScriptProcessor → worklet would be better but this works)
  const bufSize = 4096;
  tvNoiseNode = tvAudioCtx.createScriptProcessor(bufSize, 0, 1);
  tvNoiseNode.onaudioprocess = e => {
    const out = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < out.length; i++) out[i] = Math.random() * 2 - 1;
  };

  tvNoiseNode.connect(tvFilterNode);
  tvFilterNode.connect(tvGainNode);
  tvGainNode.connect(tvAudioCtx.destination);
}

function startTVSound() {
  buildTVAudio();
  const doStart = () => {
    tvGainNode.gain.cancelScheduledValues(tvAudioCtx.currentTime);
    tvGainNode.gain.setTargetAtTime(0.025, tvAudioCtx.currentTime, 0.12);
  };
  if (tvAudioCtx.state === 'suspended') {
    tvAudioCtx.resume().then(doStart);
  } else {
    doStart();
  }
}

function stopTVSound() {
  if (!tvAudioCtx) return;
  tvGainNode.gain.cancelScheduledValues(tvAudioCtx.currentTime);
  tvGainNode.gain.setTargetAtTime(0, tvAudioCtx.currentTime, 0.10); // fade-out
}


let soundOn = true; // son ON par défaut

function toggleSound() {
  soundOn = !soundOn;
  const btn = document.getElementById('tv-hint');
  if (soundOn) {
    startTVSound();
    btn.textContent = '🔊';
    btn.classList.remove('on');
  } else {
    stopTVSound();
    btn.textContent = '🔇';
    btn.classList.add('on');
  }
}

function toggleTV() {
  tvActive = !tvActive;
  tvCanvas.classList.toggle('active', tvActive);
}

// Préparer l'AudioContext dès la 1ère interaction (obligatoire pour les navigateurs)
// mais NE PAS démarrer le son ici — il démarre automatiquement à la fin du loading
let tvAudioPrimed = false;
function primeAudioCtx() {
  if (tvAudioPrimed) return;
  tvAudioPrimed = true;
  buildTVAudio(); // crée le contexte sans démarrer le son
  if (tvAudioCtx && tvAudioCtx.state === 'suspended') tvAudioCtx.resume();
}
document.addEventListener('click', primeAudioCtx, { once: true });
document.addEventListener('mousemove', primeAudioCtx, { once: true });
document.addEventListener('keydown', primeAudioCtx, { once: true });
document.addEventListener('keydown', e => {
  if (e.key === 't' || e.key === 'T') toggleTV(); // T garde le toggle visuel
  primeAudioCtx(); // prépare l'AudioContext si pas encore fait
});

function drawTVStatic(t) {
  if (!drawTVStatic._id) drawTVStatic._id = tvCtx.createImageData(TVW, TVH);
  const id = drawTVStatic._id;
  const d = id.data;

  // ── Bandes irrégulières VHS (hauteurs variables, densités différentes) ──
  // Génère des bandes de hauteurs inégales
  const bandDefs = [];
  let rowSoFar = 0;
  while (rowSoFar < TVH) {
    const h = 1 + (Math.random() * Math.random() * 28 | 0); // bandes petites et grandes
    const jit = Math.random() < 0.18
      ? (Math.random() - 0.5) * TVW * (0.3 + Math.random() * 0.7) // fort desync
      : (Math.random() - 0.5) * 4;                                  // léger frémissement
    const density = 0.05 + Math.random() * Math.random() * 0.95;   // très variable
    const color = Math.random() < 0.12 ? 'green' : Math.random() < 0.08 ? 'red' : 'white';
    bandDefs.push({ y0: rowSoFar, h, jit: jit | 0, density, color });
    rowSoFar += h;
  }

  // Noise seed (légère corrélation spatiale: plus réaliste qu'un bruit pur)
  const noiseRow = new Float32Array(TVW);

  for (const band of bandDefs) {
    // Génère une ligne de bruit corrélé pour cette bande
    for (let px = 0; px < TVW; px++) {
      noiseRow[px] = noiseRow[px] * 0.55 + (Math.random() * 2 - 1) * 0.45;
    }

    for (let py = band.y0, end = Math.min(band.y0 + band.h, TVH); py < end; py++) {
      const jitter = band.jit;
      for (let px = 0; px < TVW; px++) {
        const srcX = ((px + jitter) % TVW + TVW) % TVW;
        const n = (noiseRow[px] * 0.6 + (Math.random() * 2 - 1) * 0.4); // mix corrélé/pur
        const v = Math.max(0, Math.min(1, (n * 0.5 + 0.5) * band.density));
        let r, g, bl;

        if (band.color === 'green') {
          r = (v * 80) | 0;
          g = (v * 220) | 0;
          bl = (v * 60) | 0;
        } else if (band.color === 'red') {
          r = (v * 240) | 0;
          g = (v * 40) | 0;
          bl = (v * 30) | 0;
        } else {
          // Blanc légèrement bleuté (phosphore TV)
          const lum = (v * 210) | 0;
          r = (lum * 0.88) | 0;
          g = (lum * 0.93) | 0;
          bl = lum;
        }

        // Ligne de glitch blanc pur (très rare, très court)
        if (Math.random() < 0.0008) { r = g = bl = 255; }

        const i = (py * TVW + srcX) * 4;
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = bl;
        d[i + 3] = (110 + v * 140) | 0; // opacité aussi variable
      }
    }
  }

  // Patch "signal retrouvé" — zone lumineuse rectangulaire aléatoire (rare)
  if (Math.random() < 0.04) {
    const rx = (Math.random() * TVW * 0.6) | 0;
    const ry2 = (Math.random() * TVH * 0.6) | 0;
    const rw = (20 + Math.random() * TVW * 0.3) | 0;
    const rh = (3 + Math.random() * 20) | 0;
    for (let py = ry2; py < Math.min(ry2 + rh, TVH); py++)
      for (let px = rx; px < Math.min(rx + rw, TVW); px++) {
        const i = (py * TVW + px) * 4;
        d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = 160;
      }
  }

  tvCtx.putImageData(id, 0, 0);

  // Ondulation phosphore (couleur variable selon frame)
  const scanY = ((t * 1.1) % TVH) | 0;
  const scanHue = (t * 3) % 360;
  tvCtx.fillStyle = `hsla(${scanHue},80%,60%,0.035)`;
  tvCtx.fillRect(0, scanY, TVW, 2 + (Math.random() * 3 | 0));
}

// Boucle d'animation TV (indépendante du render Three.js)
let tvFrame = 0;
function animateTV() {
  requestAnimationFrame(animateTV);
  if (!tvActive) return;
  tvFrame++;
  if (tvFrame % 2 === 0) drawTVStatic(tvFrame); // ~30fps
}
animateTV();

// Toggle clavier
document.addEventListener('keydown', e => {
  if (e.key === 't' || e.key === 'T') toggleTV();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
// ── ✉ CONTACT MODAL ──────────────────────────────────────────────────────────
const OWNER_EMAIL = 'nobel71@ulaval.ca';

function openContact() {
  document.getElementById('contact-subject').value = '';
  document.getElementById('contact-msg').value = '';
  document.getElementById('modal-contact').classList.add('open');
  document.getElementById('contact-subject').focus();
  setModalOpen(true);
}

function closeContact() {
  document.getElementById('modal-contact').classList.remove('open');
  setModalOpen(false);
}

function contactSend() {
  const subject = document.getElementById('contact-subject').value.trim() || 'Hello from your portfolio';
  const body = document.getElementById('contact-msg').value.trim();
  if (!body) {
    document.getElementById('contact-msg').style.borderColor = '#c0392b';
    setTimeout(() => document.getElementById('contact-msg').style.borderColor = '', 1200);
    return;
  }

  const mailtoUrl = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(OWNER_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Afficher un panneau de succès avec liens alternatifs
  const modal = document.getElementById('modal-contact');
  const inner = modal.querySelector('.modal-inner');
  inner.innerHTML = `
    <button class="modal-close" onclick="closeContact()">✕</button>
    <h2 style="font-family:'Courier Prime',monospace;font-size:18px;letter-spacing:2px;margin-bottom:14px;color:#1a0f00;">✉ MESSAGE PRÊT</h2>
    <p style="font-family:'Courier Prime',monospace;font-size:12px;color:#4a3010;margin-bottom:20px;line-height:1.7;">
      Choisis comment envoyer :
    </p>
    <a href="${gmailUrl}" target="_blank" rel="noopener" onclick="closeContact()" style="
      display:block;width:100%;box-sizing:border-box;text-align:center;
      font-family:'Courier Prime',monospace;font-size:13px;letter-spacing:2px;font-weight:700;
      padding:12px;background:#1a3a1a;color:#f2e8cc;border:none;border-radius:2px;
      text-decoration:none;margin-bottom:10px;cursor:pointer;">
      ✉ OUVRIR GMAIL
    </a>
    <a href="${mailtoUrl}" onclick="closeContact()" style="
      display:block;width:100%;box-sizing:border-box;text-align:center;
      font-family:'Courier Prime',monospace;font-size:12px;letter-spacing:1.5px;
      padding:10px;background:rgba(80,45,10,0.08);color:#4a2a08;
      border:1px solid rgba(80,45,10,0.3);border-radius:2px;
      text-decoration:none;margin-bottom:14px;cursor:pointer;">
      Ouvrir client mail (Outlook…)
    </a>
    <p style="font-family:'Courier Prime',monospace;font-size:11px;color:#8a6830;text-align:center;">
      ou écris directement à <strong>${OWNER_EMAIL}</strong>
    </p>
  `;
}

// Close contact modal on backdrop click
document.getElementById('modal-contact').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-contact')) closeContact();
});
