// Update this date and the sample event details in index.html to personalize the invitation.
const weddingDate = new Date('2026-11-20T09:15:00+05:30');
const gate = document.getElementById('invitationGate');
const openInvitation = document.getElementById('openInvitation');
openInvitation.addEventListener('click', () => {
  if (gate.classList.contains('is-opening')) return;
  gate.classList.add('is-opening');
  document.body.classList.remove('gate-locked');
  window.setTimeout(() => gate.setAttribute('aria-hidden', 'true'), 850);
});

// Give the invitation sections a soft entrance as guests scroll through the page.
const motionTargets = document.querySelectorAll('.intro-inner, .scratch-section .container, .countdown-section .container, .section-heading, .event-card, .gallery-grid, .closing .container');
motionTargets.forEach(element => element.classList.add('reveal-on-scroll'));
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12 });
  motionTargets.forEach(element => revealObserver.observe(element));
} else motionTargets.forEach(element => element.classList.add('is-visible'));

// A touch-friendly scratch layer reveals the printed date underneath.
const scratchCanvas = document.getElementById('scratchCanvas');
const scratchCard = document.getElementById('scratchCard');
const scratchContext = scratchCanvas.getContext('2d', { willReadFrequently: true });
let scratching = false;
let scratchRevealed = false;
let strokeCount = 0;
function paintScratchLayer() {
  const bounds = scratchCard.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  scratchCanvas.width = Math.round(bounds.width * ratio);
  scratchCanvas.height = Math.round(bounds.height * ratio);
  scratchContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  const gradient = scratchContext.createLinearGradient(0, 0, bounds.width, bounds.height);
  gradient.addColorStop(0, '#d8c391'); gradient.addColorStop(.48, '#c4ad77'); gradient.addColorStop(1, '#e2d1a5');
  scratchContext.globalCompositeOperation = 'source-over';
  scratchContext.fillStyle = gradient; scratchContext.fillRect(0, 0, bounds.width, bounds.height);
  scratchContext.strokeStyle = '#f3e6c675'; scratchContext.lineWidth = 1;
  for (let x = 18; x < bounds.width; x += 27) { scratchContext.beginPath(); scratchContext.moveTo(x, 0); scratchContext.lineTo(x - 55, bounds.height); scratchContext.stroke(); }
  scratchContext.fillStyle = '#594c3440'; scratchContext.font = '9px DM Sans, sans-serif'; scratchContext.textAlign = 'center';
  scratchContext.fillText('✧  SCRATCH TO REVEAL  ✧', bounds.width / 2, bounds.height / 2 + 3);
  scratchContext.globalCompositeOperation = 'destination-out';
}
function scratchAt(event) {
  if (!scratching || scratchRevealed) return;
  const bounds = scratchCanvas.getBoundingClientRect();
  const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
  scratchContext.beginPath(); scratchContext.arc(x, y, 23, 0, Math.PI * 2); scratchContext.fill();
  strokeCount++;
  if (strokeCount % 8 === 0) {
    const pixels = scratchContext.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
    let clear = 0;
    for (let i = 3; i < pixels.length; i += 4 * 16) if (pixels[i] < 80) clear++;
    if (clear / (pixels.length / 64) > .42) revealScratch();
  }
}
function revealScratch() {
  scratchRevealed = true;
  scratchCard.classList.add('is-revealed');
  scratchCanvas.style.opacity = '0';
  scratchCanvas.style.pointerEvents = 'none';
  document.getElementById('revealDate').textContent = 'DATE REVEALED · FRIDAY, NOVEMBER 20';
}
scratchCanvas.addEventListener('pointerdown', event => { if (scratchRevealed) return; scratching = true; scratchCanvas.setPointerCapture(event.pointerId); scratchAt(event); });
scratchCanvas.addEventListener('pointermove', scratchAt);
scratchCanvas.addEventListener('pointerup', () => { scratching = false; });
scratchCanvas.addEventListener('pointercancel', () => { scratching = false; });
document.getElementById('revealDate').addEventListener('click', revealScratch);
paintScratchLayer();
window.addEventListener('resize', () => { if (!scratchRevealed) paintScratchLayer(); });

const countdownFields = {
  days: document.getElementById('days'), hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'), seconds: document.getElementById('seconds')
};
function updateCountdown() {
  let remaining = Math.max(0, weddingDate.getTime() - Date.now());
  const day = 86400000, hour = 3600000, minute = 60000;
  const values = {
    days: Math.floor(remaining / day),
    hours: Math.floor((remaining % day) / hour),
    minutes: Math.floor((remaining % hour) / minute),
    seconds: Math.floor((remaining % minute) / 1000)
  };
  Object.entries(values).forEach(([key, value]) => { countdownFields[key].textContent = String(value).padStart(2, '0'); });
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

// Export a standard .ics event that guests can save in most calendar apps.
const calendarEvents = {
  reception: { title: 'Wedding Reception — Ananya & Arjun', start: '20261119T190000', end: '20261119T220000', description: 'An evening to celebrate with Ananya and Arjun.' },
  muhurtham: { title: 'Wedding Muhurtham — Ananya & Arjun', start: '20261120T091500', end: '20261120T101500', description: 'Join us for the wedding ceremony of Ananya and Arjun.' }
};
function escapeICS(value) { return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n'); }
document.querySelectorAll('.calendar-link').forEach(button => button.addEventListener('click', () => {
  const event = calendarEvents[button.dataset.event];
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding Invitation//EN','BEGIN:VEVENT',`UID:${button.dataset.event}-ananya-arjun@example.com`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;TZID=Asia/Kolkata:${event.start}`,`DTEND;TZID=Asia/Kolkata:${event.end}`,`SUMMARY:${escapeICS(event.title)}`,`DESCRIPTION:${escapeICS(event.description)}`,'LOCATION:Saa Raa Convention Hall, Mysuru','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `${button.dataset.event}-ananya-arjun.ics`; link.click(); URL.revokeObjectURL(url);
}));

// Add a royalty-free MP3 URL to the source element if you want a song button.
const audio = document.getElementById('weddingAudio');
document.getElementById('soundToggle').addEventListener('click', async event => {
  const button = event.currentTarget;
  if (!audio.querySelector('source').getAttribute('src')) { button.title = 'Add your song URL in index.html to enable music'; button.setAttribute('aria-label', button.title); button.classList.add('no-audio'); return; }
  if (audio.paused) { try { await audio.play(); button.textContent = 'Ⅱ'; button.setAttribute('aria-label', 'Pause wedding song'); } catch { button.title = 'Music could not be played'; } }
  else { audio.pause(); button.textContent = '♫'; button.setAttribute('aria-label', 'Play wedding song'); }
});
