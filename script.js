/* ====================================================
   WEDDING INVITATION — script.js
   Kloug & Mariam · October 11

   SECTIONS:
   1. Envelope open interaction
   2. Floating petals (envelope background)
   3. Countdown timer
   4. Scroll-reveal animation
==================================================== */


/* ====================================================
   1. ENVELOPE OPEN INTERACTION
   Tap envelope → flap folds open → letter rises → 
   screen fades → invitation revealed
==================================================== */

const envelopeScreen = document.getElementById('envelopeScreen');
const envelopeFlap   = document.getElementById('envelopeFlap');
const envelopeLetter = document.getElementById('envelopeLetter');
const invitation     = document.getElementById('invitation');

let opened = false;

// Tap / click on envelope screen opens it
envelopeScreen.addEventListener('click', openEnvelope);
envelopeScreen.addEventListener('touchend', function(e) {
  e.preventDefault();  // prevent double-fire on mobile
  openEnvelope();
}, { passive: false });

function openEnvelope() {
  if (opened) return;
  opened = true;

  // Stop the floating animation
  envelopeScreen.classList.add('opening');

  // Step 1 — Flap folds open (3D rotation)
  envelopeFlap.classList.add('open');

  // Step 2 — Letter slides up out of envelope (delay 0.5s)
  setTimeout(() => {
    envelopeLetter.classList.add('out');
  }, 500);

  // Step 3 — Whole envelope screen fades out (delay 1.4s)
  setTimeout(() => {
    envelopeScreen.classList.add('opened');
    // Make invitation visible and accessible
    invitation.classList.add('visible');
    invitation.removeAttribute('aria-hidden');
    // Allow page scroll now
    document.body.style.overflow = '';
  }, 1400);
}

// Lock scroll while envelope is showing
document.body.style.overflow = 'hidden';


/* ====================================================
   2. FLOATING PETALS
   Creates small colored ellipses that drift down
   in the envelope background
==================================================== */

const petalField  = document.getElementById('petalField');
// !! Edit petal colors here — these match the rose/sage palette !!
const petalColors = [
  '#f0c8cc', '#e8b4b8', '#d4929a',
  '#ecc8dc', '#dca8b0', '#c8e0c4',
  '#f5e4e0'
];

function createPetal() {
  const petal = document.createElement('div');
  petal.className = 'petal';

  // Random properties for natural variation
  const size   = Math.random() * 14 + 6;   // 6–20px
  const left   = Math.random() * 100;       // 0–100% from left
  const dur    = Math.random() * 10 + 8;    // 8–18s fall duration
  const delay  = Math.random() * 12;        // stagger starts
  const color  = petalColors[Math.floor(Math.random() * petalColors.length)];
  // Random rotation makes different leaf/petal shapes
  const rot    = Math.random() * 60;

  petal.style.cssText = `
    left: ${left}%;
    width: ${size}px;
    height: ${size * 0.6}px;
    background: ${color};
    animation-duration: ${dur}s;
    animation-delay: ${delay}s;
    transform: rotate(${rot}deg);
    opacity: 0;
  `;

  petalField.appendChild(petal);

  // Remove petal after it finishes falling (saves memory)
  setTimeout(() => petal.remove(), (dur + delay) * 1000);
}

// Spawn petals every 600ms while envelope is visible
const petalInterval = setInterval(() => {
  if (opened) {
    clearInterval(petalInterval);
    return;
  }
  createPetal();
}, 600);

// Create some immediately so screen isn't empty at start
for (let i = 0; i < 8; i++) createPetal();


/* ====================================================
   3. COUNTDOWN TIMER

   !! IMPORTANT: Update WEDDING_DATE to the actual date !!
   Format: "Month Day, Year HH:MM:SS"
   Current: October 11, 2025 at 6:00 PM
==================================================== */

// !! EDIT THIS if the date changes !!
// October 11, 2025 at 6:00 PM Egypt time (UTC+2)
const WEDDING_DATE = new Date("October 11, 2025 18:00:00");

const elDays  = document.getElementById('cd-days');
const elHours = document.getElementById('cd-hours');
const elMins  = document.getElementById('cd-mins');
const elSecs  = document.getElementById('cd-secs');

function pad(n) {
  return String(n).padStart(2, '0');
}

function animateTick(el) {
  el.classList.remove('tick');
  void el.offsetWidth; // force reflow
  el.classList.add('tick');
  // Remove class after animation so it can retrigger
  setTimeout(() => el.classList.remove('tick'), 200);
}

function updateCountdown() {
  const now  = Date.now();
  const diff = WEDDING_DATE.getTime() - now;

  if (diff <= 0) {
    // Wedding day has arrived!
    [elDays, elHours, elMins, elSecs].forEach(el => { if (el) el.textContent = '00'; });
    const label = document.querySelector('.countdown-label');
    if (label) label.textContent = '🎉 Today is the day!';
    clearInterval(countdownInterval);
    return;
  }

  const totalSec = Math.floor(diff / 1000);
  const days     = Math.floor(totalSec / 86400);
  const hours    = Math.floor((totalSec % 86400) / 3600);
  const minutes  = Math.floor((totalSec % 3600) / 60);
  const seconds  = totalSec % 60;

  if (elDays)  elDays.textContent  = pad(days);
  if (elHours) elHours.textContent = pad(hours);
  if (elMins)  elMins.textContent  = pad(minutes);

  if (elSecs) {
    const newVal = pad(seconds);
    if (elSecs.textContent !== newVal) {
      elSecs.textContent = newVal;
      animateTick(elSecs);
      // Also tick minutes when they change
      if (seconds === 59 && elMins) animateTick(elMins);
    }
  }
}

// Run immediately then every second
updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);


/* ====================================================
   4. SCROLL-REVEAL
   IntersectionObserver watches elements with
   [data-animate="fade-up"] and .detail-card,
   adds .visible class to trigger CSS transition
==================================================== */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px' }
);

// Watch sections and cards
document.querySelectorAll("[data-animate='fade-up'], .detail-card").forEach(el => {
  revealObserver.observe(el);
});
