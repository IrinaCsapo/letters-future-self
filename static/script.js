// ── Canvas setup ──────────────────────────────────────
const canvas = document.getElementById('dot-canvas');
const ctx    = canvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  buildFlowers();
}

window.addEventListener('resize', () => { resizeCanvas(); initDots(); });
resizeCanvas();


// ── State ─────────────────────────────────────────────
let dotMode = 'idle'; // 'idle' | 'loading' | 'letter'
let time    = 0;
let hueShift = 0;


// ── Holographic dots ──────────────────────────────────

const DOT_COUNT = 200;
let dots = [];

function makeDot() {
  return {
    x:          Math.random() * W,
    y:          Math.random() * H,
    baseSize:   Math.random() * 3 + 0.8,
    size:       0,
    hue:        Math.random() * 360,
    hueSpeed:   (Math.random() - 0.5) * 0.4,
    alpha:      Math.random() * 0.5 + 0.1,
    vx:         (Math.random() - 0.5) * 0.22,
    vy:         (Math.random() - 0.5) * 0.22,
    pulse:      Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.016 + 0.004,
  };
}

function initDots() {
  dots = Array.from({ length: DOT_COUNT }, makeDot);
}
initDots();

function drawDot(d) {
  const r = Math.max(0.3, d.size);
  if (r <= 0) return;

  // Holographic gradient — shimmer across hue spectrum
  const h1 = (d.hue + hueShift) % 360;
  const h2 = (h1 + 80) % 360;
  const h3 = (h1 + 180) % 360;

  const grad = ctx.createRadialGradient(d.x - r * 0.3, d.y - r * 0.3, 0, d.x, d.y, r * 1.6);
  grad.addColorStop(0,   `hsla(${h1},100%,90%,${d.alpha * 1.4})`);
  grad.addColorStop(0.4, `hsla(${h2},90%,65%,${d.alpha})`);
  grad.addColorStop(1,   `hsla(${h3},80%,40%,0)`);

  ctx.beginPath();
  ctx.arc(d.x, d.y, r * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

function updateDot(d) {
  const speed = dotMode === 'loading' ? 2.8
              : dotMode === 'letter'  ? 0.3
              : 1;

  d.x += d.vx * speed;
  d.y += d.vy * speed;

  if (d.x < -10) d.x = W + 10;
  if (d.x > W + 10) d.x = -10;
  if (d.y < -10) d.y = H + 10;
  if (d.y > H + 10) d.y = -10;

  // Collective breathing — spatial wave ripple
  const wave   = Math.sin(time * 0.012 + d.x * 0.006 + d.y * 0.004);
  const energy = dotMode === 'loading' ? 2.2 : 0.9;
  d.size = Math.max(0.3, d.baseSize + wave * energy);

  d.hue = (d.hue + d.hueSpeed + (dotMode === 'loading' ? 1.2 : 0.3)) % 360;
}


// ── Color zones (background atmosphere) ───────────────

function drawColorZones() {
  const alpha = dotMode === 'letter' ? 0.018 : 0.032;

  const zones = [
    { x: W * 0.15, y: H * 0.85, r: W * 0.45, h: 28,  s: 90, l: 60 },  // orange bloom bottom-left
    { x: W * 0.85, y: H * 0.12, r: W * 0.42, h: 235, s: 85, l: 55 },  // cobalt top-right
    { x: W * 0.50, y: H * 0.50, r: W * 0.38, h: 268, s: 70, l: 45 },  // violet center
    { x: W * 0.08, y: H * 0.25, r: W * 0.32, h: 185, s: 75, l: 50 },  // teal top-left
    { x: W * 0.90, y: H * 0.80, r: W * 0.35, h: 320, s: 80, l: 55 },  // rose bottom-right
  ];

  zones.forEach(z => {
    const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    g.addColorStop(0,   `hsla(${(z.h + hueShift * 0.4) % 360},${z.s}%,${z.l}%,${alpha * 2.2})`);
    g.addColorStop(0.5, `hsla(${(z.h + hueShift * 0.4) % 360},${z.s}%,${z.l}%,${alpha})`);
    g.addColorStop(1,   `hsla(${(z.h + hueShift * 0.4) % 360},${z.s}%,${z.l}%,0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  });
}


// ── Flowers ───────────────────────────────────────────

let flowers = [];
let flowerGrowth = 0; // 0..1

function buildFlowers() {
  flowers = [];
  const count = Math.max(4, Math.floor(W / 180));
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    flowers.push({
      x:          W * (t * 0.88 + 0.06),
      baseY:      H,
      height:     H * (0.22 + Math.random() * 0.14),
      lean:       (Math.random() - 0.5) * 0.28,
      petalHue:   Math.random() * 360,
      petalCount: 5 + Math.floor(Math.random() * 4),
      petalSize:  10 + Math.random() * 10,
      leafSide:   Math.random() > 0.5 ? 1 : -1,
      phase:      Math.random() * Math.PI * 2,
      speed:      0.008 + Math.random() * 0.004,
    });
  }
}
buildFlowers();

function drawFlower(f, growth) {
  if (growth <= 0) return;

  const stemH = f.height * Math.min(growth * 1.4, 1);
  const tipX  = f.x + Math.sin(f.lean) * stemH;
  const tipY  = f.baseY - stemH;

  // Subtle sway
  const sway = Math.sin(time * f.speed + f.phase) * 5 * growth;
  const cpX  = f.x + f.lean * stemH * 0.5 + sway;
  const cpY  = f.baseY - stemH * 0.55;

  // Stem
  ctx.beginPath();
  ctx.moveTo(f.x, f.baseY);
  ctx.quadraticCurveTo(cpX, cpY, tipX + sway * 0.6, tipY);
  ctx.strokeStyle = `rgba(120,200,140,${0.45 * growth})`;
  ctx.lineWidth   = 1.8;
  ctx.stroke();

  // Leaf — appears at 40% growth
  if (growth > 0.4) {
    const leafAlpha = Math.min((growth - 0.4) / 0.3, 1);
    const leafT = 0.52;
    const lx = f.x + (cpX - f.x) * leafT;
    const ly = f.baseY + (cpY - f.baseY) * leafT;
    const ld = f.leafSide * 22 * leafAlpha;

    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.quadraticCurveTo(lx + ld, ly - 14 * leafAlpha, lx + ld * 1.8, ly + 2 * leafAlpha);
    ctx.quadraticCurveTo(lx + ld, ly + 8 * leafAlpha, lx, ly);
    ctx.fillStyle = `rgba(100,185,120,${0.5 * leafAlpha * growth})`;
    ctx.fill();
  }

  // Petals — bloom above 85%
  if (growth > 0.85) {
    const bloom = Math.min((growth - 0.85) / 0.15, 1);
    const px = tipX + sway * 0.6;
    const py = tipY;
    const ps = f.petalSize * bloom;
    const ph = (f.petalHue + hueShift * 0.6) % 360;

    for (let p = 0; p < f.petalCount; p++) {
      const angle = (p / f.petalCount) * Math.PI * 2 + time * 0.004;
      const ex = px + Math.cos(angle) * ps;
      const ey = py + Math.sin(angle) * ps * 0.75;

      ctx.beginPath();
      ctx.ellipse(
        px + Math.cos(angle) * ps * 0.5,
        py + Math.sin(angle) * ps * 0.38,
        ps * 0.55, ps * 0.3,
        angle, 0, Math.PI * 2
      );
      const pg = ctx.createRadialGradient(px, py, 0, ex, ey, ps * 0.7);
      pg.addColorStop(0, `hsla(${ph},90%,85%,${0.7 * bloom})`);
      pg.addColorStop(1, `hsla(${(ph + 40) % 360},80%,55%,${0.2 * bloom})`);
      ctx.fillStyle = pg;
      ctx.fill();
    }

    // Flower centre
    const cg = ctx.createRadialGradient(px, py, 0, px, py, ps * 0.28);
    cg.addColorStop(0, `hsla(${(ph + 55) % 360},100%,95%,${0.9 * bloom})`);
    cg.addColorStop(1, `hsla(${(ph + 30) % 360},80%,60%,${0.4 * bloom})`);
    ctx.beginPath();
    ctx.arc(px, py, ps * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
  }
}


// ── Rotating sun / mandala (loading state) ────────────

let sunAngle = 0;
let sunAlpha = 0;  // fades in/out
let sunHue   = 0;

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
