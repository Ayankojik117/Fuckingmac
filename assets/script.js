// MaC Foundation — shared behaviour (vanilla JS, no dependencies)
(() => {
  'use strict';

  const doc = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (n, a, b) => Math.min(Math.max(n, a), b);

  /* ---------- word wrapping (for text reveals) ---------- */
  function wrapWords(el, wordClass, innerClass) {
    let i = 0;
    const words = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const outer = document.createElement('span');
            outer.className = wordClass;
            let target = outer;
            if (innerClass) {
              target = document.createElement('span');
              target.className = innerClass;
              outer.appendChild(target);
            }
            target.style.setProperty('--i', Math.min(i, 16));
            target.textContent = part;
            i += 1;
            words.push(outer);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
    return words;
  }

  /* ---------- mobile menu ---------- */
  const menuBtn = $('.menu-btn');
  const menu = $('#menu');
  if (menuBtn && menu) {
    const label = $('.mb-t', menuBtn);
    const links = $$('a', menu);
    const setMenu = (open, returnFocus = true) => {
      menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close' : 'Menu';
      if (open && links[0]) links[0].focus({ preventScroll: true });
      if (!open && returnFocus) menuBtn.focus({ preventScroll: true });
    };
    menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    links.forEach((a) => a.addEventListener('click', () => setMenu(false, false)));
    document.addEventListener('keydown', (e) => {
      if (!menu.classList.contains('open')) return;
      if (e.key === 'Escape') { setMenu(false); return; }
      if (e.key === 'Tab') {
        const loop = [menuBtn, ...links];
        const first = loop[0];
        const last = loop[loop.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', (m) => {
      if (m.matches && menu.classList.contains('open')) setMenu(false, false);
    });
  }

  /* ---------- accordions (pillars + skills) ---------- */
  function accordion(root, opts = {}) {
    const items = $$('[data-acc-item]', root);
    const btns = items.map((item) => $('[data-acc-btn]', item));
    const set = (item, open) => {
      item.classList.toggle('open', open);
      $('[data-acc-btn]', item).setAttribute('aria-expanded', String(open));
    };
    items.forEach((item, idx) => {
      const btn = btns[idx];
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        if (isOpen) {
          if (opts.keepOne && opts.keepOne()) return;
          set(item, false);
        } else {
          items.forEach((o) => { if (o !== item) set(o, false); });
          set(item, true);
        }
      });
      btn.addEventListener('keydown', (e) => {
        const keys = { ArrowDown: idx + 1, ArrowUp: idx - 1, Home: 0, End: btns.length - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        btns[(keys[e.key] + btns.length) % btns.length].focus();
      });
    });
    return { items, set };
  }

  const pillarRoot = $('[data-pillars]');
  if (pillarRoot) {
    const desk = window.matchMedia('(min-width: 900px)');
    const acc = accordion(pillarRoot, { keepOne: () => desk.matches });
    const ensureOne = () => {
      if (desk.matches && !acc.items.some((i) => i.classList.contains('open'))) acc.set(acc.items[0], true);
    };
    desk.addEventListener('change', ensureOne);
    ensureOne();
  }
  const skillRoot = $('[data-skills]');
  if (skillRoot) accordion(skillRoot);

  /* ---------- text + image reveals ---------- */
  const animate = !reduce.matches;
  const lit = [];
  if (animate) {
    $$('[data-split]').forEach((el) => wrapWords(el, 'w', 'wi'));
    $$('[data-lit]').forEach((el) => lit.push({ el, words: wrapWords(el, 'lw'), n: -1 }));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -8% 0px' });
    $$('[data-split], .rv, .fig, .hero').forEach((el) => io.observe(el));
  } else {
    $$('[data-split], .rv, .fig, .hero').forEach((el) => el.classList.add('in'));
  }

  /* ---------- scroll-linked details (one rAF loop) ---------- */
  const hdr = $('.hdr');
  const darkSections = $$('[data-theme="dark"]');
  const hero = $('.hero');
  const bar = $('.progress i');
  const parallax = $$('[data-speed]');
  const spinners = $$('[data-spin]');
  let queued = false;

  function updateLit(item, vh) {
    const r = item.el.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
    const n = Math.round(p * item.words.length);
    if (n === item.n) return;
    item.words.forEach((w, i) => w.classList.toggle('on', i < n));
    item.n = n;
  }

  function frame() {
    queued = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (hdr) {
      hdr.classList.toggle('scrolled', y > 24);
      const probe = hdr.offsetHeight / 2;
      const onDark = darkSections.some((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= probe && r.bottom >= probe;
      });
      hdr.classList.toggle('on-dark', onDark);
    }
    if (bar) {
      const max = doc.scrollHeight - vh;
      bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0) + ')';
    }
    if (!animate) return;
    if (hero) hero.style.setProperty('--p', clamp(y / (hero.offsetHeight || vh), 0, 1).toFixed(4));
    lit.forEach((item) => updateLit(item, vh));
    parallax.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh * 0.3 || r.top > vh * 1.3) return;
      const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed || '0');
      el.style.transform = 'translate3d(0,' + (-offset).toFixed(1) + 'px,0)';
    });
    spinners.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      el.style.transform = 'rotate(' + ((r.top / vh) * -200).toFixed(1) + 'deg)';
    });
  }
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  frame();
})();
