// ── Canvas setup ──────────────────────────────────────
const canvas = document.getElementById('dot-canvas');
const ctx    = canvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;

// ── State ─────────────────────────────────────────────
let dotMode     = 'idle'; // 'idle' | 'loading' | 'letter'
let time        = 0;
let hueShift    = 0;
let flowers     = [];
let flowerGrowth = 0;
let twirls      = [];
let sunAngle    = 0;
let sunAlpha    = 0;
let sunHue      = 0;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  if (flowers.length)  buildFlowers();
  if (twirls.length)   buildTwirls();
}

window.addEventListener('resize', () => { resizeCanvas(); initDots(); });
resizeCanvas();


// ── Stipple dots — palette from reference images ───────
// Cobalt, electric blue, teal, orange, coral, gold, hot pink, violet

const DOT_COUNT = 280;
let dots = [];

function dotHue() {
  const r = Math.random();
  if (r < 0.28) return 222 + Math.random() * 18;  // cobalt → electric blue
  if (r < 0.42) return 175 + Math.random() * 18;  // teal / turquoise
  if (r < 0.56) return 18  + Math.random() * 18;  // warm orange
  if (r < 0.68) return 4   + Math.random() * 14;  // coral / red-orange
  if (r < 0.78) return 38  + Math.random() * 14;  // gold / amber
  if (r < 0.88) return 325 + Math.random() * 25;  // hot pink / rose
  return               270 + Math.random() * 22;   // violet
}

function makeDot() {
  const h = dotHue();
  return {
    x:          Math.random() * W,
    y:          Math.random() * H,
    baseSize:   Math.random() * 2.4 + 0.5,
    size:       0,
    hue:        h,
    baseHue:    h,
    hueRange:   12,
    hueDir:     Math.random() > 0.5 ? 1 : -1,
    hueTick:    0,
    alpha:      Math.random() * 0.50 + 0.22,
    vx:         (Math.random() - 0.5) * 0.20,
    vy:         (Math.random() - 0.5) * 0.20,
    pulse:      Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.014 + 0.004,
  };
}

function initDots() {
  dots = Array.from({ length: DOT_COUNT }, makeDot);
}
initDots();

function drawDot(d) {
  const r = Math.max(0.3, d.size);
  if (r <= 0) return;

  // Stipple: solid-ish dot with a soft highlight pop
  ctx.beginPath();
  ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
  ctx.fillStyle = `hsla(${d.hue},85%,58%,${d.alpha})`;
  ctx.fill();

  // Tiny bright centre sparkle
  ctx.beginPath();
  ctx.arc(d.x - r * 0.25, d.y - r * 0.25, r * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = `hsla(${d.hue},60%,90%,${d.alpha * 0.7})`;
  ctx.fill();
}

function updateDot(d) {
  const speed = dotMode === 'loading' ? 2.6
              : dotMode === 'letter'  ? 0.3
              : 1;

  d.x += d.vx * speed;
  d.y += d.vy * speed;

  if (d.x < -10) d.x = W + 10;
  if (d.x > W + 10) d.x = -10;
  if (d.y < -10) d.y = H + 10;
  if (d.y > H + 10) d.y = -10;

  // Collective breathing wave
  const wave   = Math.sin(time * 0.012 + d.x * 0.006 + d.y * 0.004);
  const energy = dotMode === 'loading' ? 2.0 : 0.8;
  d.size = Math.max(0.3, d.baseSize + wave * energy);

  // Gentle hue drift within colour family
  d.hueTick += 0.12 * d.hueDir * (dotMode === 'loading' ? 3 : 1);
  if (Math.abs(d.hueTick) > d.hueRange) d.hueDir *= -1;
  d.hue = d.baseHue + d.hueTick;
}


// ── Color zones — orange blob + violet blob + pink bloom ──

function drawColorZones() {
  // Like the gradient reference images: vivid but on a pale ground
  const base  = dotMode === 'letter' ? 0.055 : 0.10;

  const zones = [
    // Warm orange blob — centre-left (like image 3 left)
    { x: W * 0.28, y: H * 0.55, r: W * 0.55, h: 22,  s: 95, l: 65, a: base * 1.8 },
    // Deep purple blob — right (like image 3 right)
    { x: W * 0.80, y: H * 0.42, r: W * 0.50, h: 268, s: 55, l: 52, a: base * 1.4 },
    // Hot pink / magenta bloom — upper left (image 4 energy)
    { x: W * 0.12, y: H * 0.28, r: W * 0.42, h: 335, s: 80, l: 68, a: base * 1.2 },
    // Coral-red — top right
    { x: W * 0.85, y: H * 0.15, r: W * 0.38, h: 8,   s: 88, l: 68, a: base },
    // Soft teal — bottom left
    { x: W * 0.08, y: H * 0.82, r: W * 0.36, h: 182, s: 60, l: 62, a: base * 0.9 },
    // Blush peach — bottom right
    { x: W * 0.90, y: H * 0.88, r: W * 0.34, h: 15,  s: 70, l: 78, a: base * 0.8 },
  ];

  zones.forEach(z => {
    const h = (z.h + hueShift * 0.15) % 360;
    const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    g.addColorStop(0,    `hsla(${h},${z.s}%,${z.l}%,${z.a * 2.0})`);
    g.addColorStop(0.45, `hsla(${h},${z.s}%,${z.l}%,${z.a})`);
    g.addColorStop(1,    `hsla(${h},${z.s}%,${z.l}%,0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  });
}


// ── Flowers ───────────────────────────────────────────

// ── Twirls ────────────────────────────────────────────

function buildTwirls() {
  twirls = [
    { x: W * 0.06, y: H * 0.14, r: 52, hue: 228, speed:  0.0025, phase: 0.0 },
    { x: W * 0.94, y: H * 0.22, r: 42, hue: 18,  speed: -0.0032, phase: 1.2 },
    { x: W * 0.04, y: H * 0.72, r: 48, hue: 330, speed:  0.0018, phase: 2.4 },
    { x: W * 0.96, y: H * 0.75, r: 38, hue: 175, speed: -0.0022, phase: 3.6 },
    { x: W * 0.50, y: H * 0.04, r: 34, hue: 8,   speed:  0.0038, phase: 4.8 },
    { x: W * 0.22, y: H * 0.92, r: 30, hue: 268, speed: -0.0028, phase: 0.6 },
    { x: W * 0.78, y: H * 0.94, r: 36, hue: 350, speed:  0.0021, phase: 1.8 },
  ];
}
buildTwirls();

function drawTwirls(alpha) {
  if (alpha <= 0) return;
  twirls.forEach(t => {
    const hue   = (t.hue + hueShift * 0.12) % 360;
    const angle = time * t.speed + t.phase;
    const turns = 4;
    const pts   = 260;

    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(angle);

    // Outer spiral
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const θ = (i / pts) * Math.PI * 2 * turns;
      const r = (i / pts) * t.r;
      const x = Math.cos(θ) * r;
      const y = Math.sin(θ) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsla(${hue},72%,58%,${alpha * 0.38})`;
    ctx.lineWidth   = 0.9;
    ctx.stroke();

    // Inner counter-spiral (thinner, offset hue)
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const θ = -(i / pts) * Math.PI * 2 * (turns * 0.6);
      const r = (i / pts) * t.r * 0.55;
      const x = Math.cos(θ) * r;
      const y = Math.sin(θ) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsla(${(hue + 45) % 360},65%,68%,${alpha * 0.22})`;
    ctx.lineWidth   = 0.5;
    ctx.stroke();

    ctx.restore();
  });
}


// Flower palette — coral, orange, electric blue, teal, pink, rose
const FLOWER_HUES = [8, 22, 225, 178, 335, 350, 42, 300];

function buildFlowers() {
  flowers = [];
  const count = Math.max(5, Math.floor(W / 150));
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    flowers.push({
      x:          W * (t * 0.90 + 0.05),
      baseY:      H + 2,
      height:     H * (0.20 + Math.random() * 0.16),
      lean:       (Math.random() - 0.5) * 0.22,
      petalHue:   FLOWER_HUES[i % FLOWER_HUES.length],
      petalCount: 7 + Math.floor(Math.random() * 4),   // 7–10 petals
      petalSize:  9 + Math.random() * 9,
      petalLayers: Math.random() > 0.5 ? 2 : 1,        // some flowers have inner layer
      leafSide:   Math.random() > 0.5 ? 1 : -1,
      phase:      Math.random() * Math.PI * 2,
      speed:      0.006 + Math.random() * 0.003,
      isBud:      Math.random() > 0.7,                  // some stay as buds
    });
  }
}
buildFlowers();

function drawFlower(f, growth) {
  if (growth <= 0) return;

  const stemH = f.height * Math.min(growth * 1.35, 1);
  const tipX  = f.x + Math.sin(f.lean) * stemH;
  const tipY  = f.baseY - stemH;

  // Gentle sway
  const sway = Math.sin(time * f.speed + f.phase) * 4 * growth;
  const cpX  = f.x + f.lean * stemH * 0.45 + sway * 0.5;
  const cpY  = f.baseY - stemH * 0.58;

  // Slender stem
  ctx.beginPath();
  ctx.moveTo(f.x, f.baseY);
  ctx.quadraticCurveTo(cpX, cpY, tipX + sway * 0.5, tipY);
  ctx.strokeStyle = `rgba(140,210,160,${0.38 * growth})`;
  ctx.lineWidth   = 1.1;
  ctx.stroke();

  // Delicate leaf — at 38% growth
  if (growth > 0.38) {
    const la = Math.min((growth - 0.38) / 0.28, 1);
    const lt = 0.5;
    const lx = f.x + (cpX - f.x) * lt;
    const ly = f.baseY + (cpY - f.baseY) * lt;
    const ld = f.leafSide * 18 * la;
    const ph = (f.petalHue + 120) % 360; // green-adjacent tint

    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.quadraticCurveTo(lx + ld, ly - 11 * la, lx + ld * 1.7, ly + 1 * la);
    ctx.quadraticCurveTo(lx + ld * 0.5, ly + 7 * la, lx, ly);
    ctx.fillStyle = `rgba(110,190,130,${0.42 * la * growth})`;
    ctx.fill();
  }

  // Bloom — above 80%
  if (growth > 0.80) {
    const bloom = Math.min((growth - 0.80) / 0.20, 1);
    const px = tipX + sway * 0.5;
    const py = tipY;
    const ps = f.petalSize * bloom;
    const ph = (f.petalHue + hueShift * 0.25) % 360;   // drift slowly with hue

    // Outer petal layer
    for (let p = 0; p < f.petalCount; p++) {
      const angle  = (p / f.petalCount) * Math.PI * 2 + time * 0.003;
      const cx2    = px + Math.cos(angle) * ps * 0.52;
      const cy2    = py + Math.sin(angle) * ps * 0.42;
      const tipPx  = px + Math.cos(angle) * ps;
      const tipPy  = py + Math.sin(angle) * ps * 0.82;

      ctx.beginPath();
      ctx.ellipse(cx2, cy2, ps * 0.42, ps * 0.22, angle, 0, Math.PI * 2);

      const pg = ctx.createRadialGradient(px, py, 0, tipPx, tipPy, ps * 0.9);
      pg.addColorStop(0,   `hsla(${ph},80%,92%,${0.78 * bloom})`);
      pg.addColorStop(0.5, `hsla(${ph},75%,80%,${0.55 * bloom})`);
      pg.addColorStop(1,   `hsla(${(ph + 20) % 360},65%,62%,${0.18 * bloom})`);
      ctx.fillStyle = pg;
      ctx.fill();
    }

    // Inner petal layer (for fuller flowers)
    if (f.petalLayers === 2) {
      const innerCount = Math.floor(f.petalCount * 0.7);
      for (let p = 0; p < innerCount; p++) {
        const angle = (p / innerCount) * Math.PI * 2 + time * 0.003 + Math.PI / innerCount;
        const cx2   = px + Math.cos(angle) * ps * 0.28;
        const cy2   = py + Math.sin(angle) * ps * 0.22;

        ctx.beginPath();
        ctx.ellipse(cx2, cy2, ps * 0.26, ps * 0.14, angle, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${(ph + 15) % 360},85%,88%,${0.6 * bloom})`;
        ctx.fill();
      }
    }

    // Soft glowing centre
    const cg = ctx.createRadialGradient(px, py, 0, px, py, ps * 0.22);
    cg.addColorStop(0,   `hsla(${(ph + 40) % 360},100%,97%,${0.95 * bloom})`);
    cg.addColorStop(0.5, `hsla(${(ph + 25) % 360},90%,82%,${0.6 * bloom})`);
    cg.addColorStop(1,   `hsla(${ph},70%,65%,0)`);
    ctx.beginPath();
    ctx.arc(px, py, ps * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
  }
}


// ── Rotating sun / mandala (loading state) ────────────

function drawSun() {
  if (sunAlpha <= 0.005) return;

  const cx = W / 2;
  const cy = H / 2;

  sunHue   = (sunHue + 0.9) % 360;
  sunAngle += 0.012;

  const rays = 18;

  // Outer spiral arms
  for (let s = 0; s < 3; s++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sunAngle * (s % 2 === 0 ? 1 : -1) + s * Math.PI * 0.66);

    for (let i = 0; i < rays; i++) {
      const a   = (i / rays) * Math.PI * 2;
      const r1  = 50 + s * 35;
      const r2  = 80 + s * 42 + Math.sin(time * 0.04 + i) * 12;
      const hue = (sunHue + i * (360 / rays) + s * 40) % 360;
      const alpha = sunAlpha * (0.25 - s * 0.07);

      const x1 = Math.cos(a) * r1;
      const y1 = Math.sin(a) * r1;
      const x2 = Math.cos(a + 0.18) * r2;
      const y2 = Math.sin(a + 0.18) * r2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${hue},95%,75%,${alpha})`;
      ctx.lineWidth   = 1.5 - s * 0.3;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Inner ring of petals
  const petalRays = 12;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-sunAngle * 0.7);
  for (let i = 0; i < petalRays; i++) {
    const a   = (i / petalRays) * Math.PI * 2;
    const hue = (sunHue + i * 30) % 360;
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(a) * 32, Math.sin(a) * 32,
      18, 8, a,
      0, Math.PI * 2
    );
    ctx.fillStyle = `hsla(${hue},90%,75%,${sunAlpha * 0.3})`;
    ctx.fill();
  }
  ctx.restore();

  // Glowing core
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 42);
  cg.addColorStop(0,   `hsla(${sunHue},100%,98%,${sunAlpha * 0.9})`);
  cg.addColorStop(0.4, `hsla(${(sunHue + 40) % 360},90%,75%,${sunAlpha * 0.4})`);
  cg.addColorStop(1,   `hsla(${(sunHue + 80) % 360},80%,50%,0)`);
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.fillStyle = cg;
  ctx.fill();
}


// ── Main animation loop ───────────────────────────────

function animate() {
  time++;
  hueShift = (hueShift + 0.18) % 360;

  ctx.clearRect(0, 0, W, H);

  drawColorZones();

  // Flowers: grow in on idle/letter, retract on loading
  if (dotMode === 'loading') {
    flowerGrowth = Math.max(0, flowerGrowth - 0.015);
    sunAlpha     = Math.min(1, sunAlpha + 0.025);
  } else {
    flowerGrowth = Math.min(1, flowerGrowth + 0.004);
    sunAlpha     = Math.max(0, sunAlpha - 0.04);
  }

  // Twirls fade out during loading, always visible otherwise
  const twirlAlpha = dotMode === 'loading' ? Math.max(0, 1 - sunAlpha * 2) : flowerGrowth;
  drawTwirls(twirlAlpha);

  flowers.forEach(f => drawFlower(f, flowerGrowth));
  drawSun();

  dots.forEach(d => { updateDot(d); drawDot(d); });

  requestAnimationFrame(animate);
}
animate();


// ── Dates ─────────────────────────────────────────────

const today      = new Date();
const futureDate = new Date(today.getFullYear() + 10, today.getMonth(), today.getDate());

function formatDate(d) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

document.getElementById('today-date').textContent  = formatDate(today);
document.getElementById('letter-date').textContent = formatDate(futureDate);
document.getElementById('sig-name').textContent    = `You, from ${futureDate.getFullYear()}`;


// ── Elements ──────────────────────────────────────────

const writeScreen   = document.getElementById('write-screen');
const loadingScreen = document.getElementById('loading-screen');
const letterScreen  = document.getElementById('letter-screen');
const userMessage   = document.getElementById('user-message');
const sendBtn       = document.getElementById('send-btn');
const letterPaper   = document.getElementById('letter-paper');
const letterBody    = document.getElementById('letter-body');
const letterSig     = document.getElementById('letter-signature');
const letterActions = document.getElementById('letter-actions');
const saveBtn       = document.getElementById('save-btn');
const shareBtn      = document.getElementById('share-btn');
const againBtn      = document.getElementById('again-btn');
const copyConfirm   = document.getElementById('copy-confirm');
const sharedBanner  = document.getElementById('shared-banner');

let currentParagraphs = [];


// ── Screen switching ──────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  dotMode = id === 'loading-screen' ? 'loading'
          : id === 'letter-screen'  ? 'letter'
          : 'idle';
}


// ── Auto-resize textarea ──────────────────────────────

userMessage.addEventListener('input', () => {
  userMessage.style.height = 'auto';
  userMessage.style.height = userMessage.scrollHeight + 'px';
});


// ── Generate letter ───────────────────────────────────

async function generateLetter() {
  const message = userMessage.value.trim();
  if (!message) return;

  sendBtn.disabled = true;
  showScreen('loading-screen');

  try {
    const res  = await fetch('/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message }),
    });
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      showScreen('write-screen');
      sendBtn.disabled = false;
      return;
    }

    if (data.letter) {
      currentParagraphs = data.letter.split('\n').filter(p => p.trim().length > 0);
      renderLetter(currentParagraphs, false);
    }

  } catch (err) {
    console.error(err);
    alert('Something went wrong. Please try again.');
    showScreen('write-screen');
    sendBtn.disabled = false;
  }
}


// ── Render letter ─────────────────────────────────────

function renderLetter(paragraphs, isShared) {
  letterBody.innerHTML = '';
  letterPaper.classList.remove('visible');
  letterSig.classList.remove('revealed');
  letterActions.classList.remove('revealed');

  paragraphs.forEach((para, i) => {
    const p = document.createElement('p');
    p.textContent = para.trim();
    if (i === paragraphs.length - 1) p.classList.add('quiet-truth');
    letterBody.appendChild(p);
  });

  sharedBanner.classList.toggle('show', isShared);
  showScreen('letter-screen');

  requestAnimationFrame(() => {
    setTimeout(() => {
      letterPaper.classList.add('visible');

      letterBody.querySelectorAll('p').forEach((p, i) => {
        setTimeout(() => p.classList.add('revealed'), 400 + i * 300);
      });

      const total = paragraphs.length;
      setTimeout(() => letterSig.classList.add('revealed'),     400 + total * 300 + 150);
      setTimeout(() => letterActions.classList.add('revealed'), 400 + total * 300 + 500);
    }, 80);
  });
}


// ── PDF generation ────────────────────────────────────

function saveAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const margin       = 28;
  const pageWidth    = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = 22;

  // Header rule
  doc.setDrawColor(200, 195, 188);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Title
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(140, 130, 120);
  doc.text('LETTERS FROM YOUR FUTURE SELF', pageWidth / 2, y, { align: 'center' });
  y += 4;

  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Dates
  doc.setFontSize(8);
  doc.setTextColor(160, 150, 140);
  doc.text(`Written on: ${formatDate(today)}`, margin, y);
  doc.text(`From: ${formatDate(futureDate)}`, pageWidth - margin, y, { align: 'right' });
  y += 14;

  // Letter body
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(30, 28, 45);

  currentParagraphs.forEach((para, i) => {
    const isLast = i === currentParagraphs.length - 1;

    if (isLast) {
      y += 6;
      doc.setDrawColor(210, 205, 198);
      doc.line(margin, y - 3, pageWidth - margin, y - 3);
      doc.setFont('times', 'italic');
      doc.setTextColor(100, 96, 120);
    }

    const lines = doc.splitTextToSize(para.trim(), contentWidth);

    if (y + lines.length * 7 > 275) {
      doc.addPage();
      y = 22;
    }

    doc.text(lines, margin, y);
    y += lines.length * 7 + 5;
  });

  // Signature
  y += 8;
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(110, 104, 128);
  doc.text('With love,', margin, y);
  doc.setFont('times', 'bolditalic');
  doc.setTextColor(30, 28, 45);
  doc.text(`You, from ${futureDate.getFullYear()}`, margin, y + 8);

  doc.save(`letter-from-future-self-${today.toISOString().split('T')[0]}.pdf`);
}


// ── Share link ────────────────────────────────────────

function copyShareLink() {
  try {
    const encoded = btoa(encodeURIComponent(JSON.stringify(currentParagraphs)));
    const url     = `${window.location.origin}/#${encoded}`;

    navigator.clipboard.writeText(url).then(() => {
      copyConfirm.classList.add('show');
      setTimeout(() => copyConfirm.classList.remove('show'), 2500);
    });
  } catch (err) {
    console.error('Share failed:', err);
  }
}


// ── Load shared letter from URL hash ──────────────────

function loadFromHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  try {
    const paragraphs = JSON.parse(decodeURIComponent(atob(hash)));
    if (Array.isArray(paragraphs) && paragraphs.length > 0) {
      currentParagraphs = paragraphs;
      renderLetter(paragraphs, true);
    }
  } catch (e) {
    // Invalid hash — show normal page
  }
}


// ── Reset ─────────────────────────────────────────────

function reset() {
  userMessage.value        = '';
  userMessage.style.height = 'auto';
  currentParagraphs        = [];
  sendBtn.disabled         = false;
  window.location.hash     = '';
  showScreen('write-screen');
  setTimeout(() => userMessage.focus(), 100);
}


// ── Event listeners ───────────────────────────────────

sendBtn.addEventListener('click',  generateLetter);
saveBtn.addEventListener('click',  saveAsPDF);
shareBtn.addEventListener('click', copyShareLink);
againBtn.addEventListener('click', reset);

userMessage.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generateLetter();
});


// ── Init ──────────────────────────────────────────────

loadFromHash();
