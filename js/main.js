// Theme switcher: sky (light) and night (dark), saved in the browser
const root = document.documentElement;
const toggle = document.getElementById('themeToggle');

const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);

if (toggle) {
  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'sky' ? 'night' : 'sky';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}
// ===== Floating dots background =====
(function () {
  const canvas = document.createElement('canvas');
  canvas.className = 'dots-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FORCE = 0.6;   // positive = dots run away from the mouse, negative = dots come toward it
  const RADIUS = 150;  // how far the mouse effect reaches

  let w, h, dots = [], colors = [];
  const mouse = { x: -9999, y: -9999 };

  function readColors() {
    const s = getComputedStyle(root);
    colors = ['--dot-1', '--dot-2', '--dot-3'].map((v) => s.getPropertyValue(v).trim());
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(220, Math.floor((w * h) / 9000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      bx: (Math.random() - 0.5) * 0.35,  // slow constant drift
      by: (Math.random() - 0.5) * 0.35,
      ex: 0,                             // extra push from the mouse
      ey: 0,
      r: Math.random() * 2 + 1.2,
      c: Math.random() < 0.7 ? (Math.random() < 0.5 ? 0 : 1) : 2  // color 3 is rarer
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      if (!reduceMotion) {
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < RADIUS) {
          const f = (RADIUS - dist) / RADIUS;
          d.ex += (dx / dist) * f * FORCE;
          d.ey += (dy / dist) * f * FORCE;
        }
        d.ex *= 0.93;
        d.ey *= 0.93;
        d.x += d.bx + d.ex;
        d.y += d.by + d.ey;

        if (d.x < -10) d.x = w + 10;
        if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10;
        if (d.y > h + 10) d.y = -10;
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = colors[d.c];
      ctx.globalAlpha = 0.75;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.documentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
  window.addEventListener('resize', resize);

  // update dot colors when the theme changes
  new MutationObserver(readColors).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  readColors();
  resize();
  frame();
})();

// ===== Card tilt and shine =====
if (window.matchMedia('(hover: hover)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      const rotateX = (y / r.height - 0.5) * -10;
      const rotateY = (x / r.width - 0.5) * 10;
      card.style.transform =
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}