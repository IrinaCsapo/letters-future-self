// ── Canvas dot animation ──────────────────────────────

const canvas = document.getElementById('dot-canvas');
const ctx    = canvas.getContext('2d');

const COLORS = [
  [67,  97,  238], // cobalt
  [247, 103,  7],  // orange
  [255, 107, 107], // coral
  [112,  72, 232], // violet
  [76,  201, 240], // sky blue
  [255, 190,  11], // gold
];

let dots       = [];
let dotMode    = 'idle'; // 'idle' | 'loading' | 'letter'
let frameId    = null;
let time       = 0;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function makeDot() {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    x:          Math.random() * canvas.width,
    y:          Math.random() * canvas.height,
    baseSize:   Math.random() * 2.8 + 0.8,
    size:       0,
    color,
    alpha:      Math.random() * 0.35 + 0.08,
    vx:         (Math.random() - 0.5) * 0.25,
    vy:         (Math.random() - 0.5) * 0.25,
    pulse:      Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.018 + 0.004,
  };
}

function initDots(n = 180) {
  dots = Array.from({ length: n }, makeDot);
}

function animateDots() {
  time++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const speed = dotMode === 'loading' ? 3.5
              : dotMode === 'letter'  ? 0.25
              : 1;

  dots.forEach(d => {
    // Move
    d.x += d.vx * speed;
    d.y += d.vy * speed;

    // Wrap
    if (d.x < -10) d.x = canvas.width  + 10;
    if (d.x > canvas.width  + 10) d.x = -10;
    if (d.y < -10) d.y = canvas.height + 10;
    if (d.y > canvas.height + 10) d.y = -10;

    // Pulse size
    const pulse  = Math.sin(time * d.pulseSpeed + d.pulse);
    const energy = dotMode === 'loading' ? 1.8 : 0.6;
    d.size = Math.max(0.3, d.baseSize + pulse * energy);

    // Draw
    const [r, g, b] = d.color;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${d.alpha})`;
    ctx.fill();
  });

  frameId = requestAnimationFrame(animateDots);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  initDots();
});

resizeCanvas();
initDots();
animateDots();


// ── Dates ─────────────────────────────────────────────

const today      = new Date();
const futureDate = new Date(today.getFullYear() + 10, today.getMonth(), today.getDate());

function formatDate(d) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

document.getElementById('today-date').textContent  = formatDate(today);
document.getElementById('letter-date').textContent  = formatDate(futureDate);
document.getElementById('sig-name').textContent     = `You, from ${futureDate.getFullYear()}`;


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


// ── Screens ───────────────────────────────────────────

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
      setTimeout(() => letterSig.classList.add('revealed'),    400 + total * 300 + 150);
      setTimeout(() => letterActions.classList.add('revealed'), 400 + total * 300 + 500);
    }, 80);
  });
}


// ── PDF generation ────────────────────────────────────

function saveAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const margin      = 28;
  const pageWidth   = doc.internal.pageSize.getWidth();
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

    // Page overflow guard
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
    // Invalid hash — just show normal page
  }
}


// ── Reset ─────────────────────────────────────────────

function reset() {
  userMessage.value     = '';
  userMessage.style.height = 'auto';
  currentParagraphs     = [];
  sendBtn.disabled      = false;
  window.location.hash  = '';
  showScreen('write-screen');
  setTimeout(() => userMessage.focus(), 100);
}

function startFresh() { reset(); }


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
