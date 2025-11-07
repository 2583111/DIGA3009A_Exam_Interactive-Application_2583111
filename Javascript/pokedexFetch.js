const API_BASE = 'https://pokeapi.co/api/v2';
const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
     <rect width="100%" height="100%" fill="#0b0b0b"/>
     <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#D4FCAC" font-family="Arial" font-size="18">No image</text>
   </svg>`
);

const GEN_NAMES = {
  1: 'Kanto', 2: 'Johto', 3: 'Hoenn', 4: 'Sinnoh',
  5: 'Unova', 6: 'Kalos', 7: 'Alola', 8: 'Galar', 9: 'Paldea'
};

function capitalize(s) {
  if (!s) return s;
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const debounce = (fn, wait = 120) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};

/* ---------- Header SVG builder ---------- */
function buildHeaderSVGIfMissing() {
  const wrapper = document.querySelector('.sub-header-wrap');
  if (!wrapper) return null;

  // if an svg already exists, return it
  let svg = wrapper.querySelector('svg.sub-header-svg');
  if (svg) return svg;

  const ns = 'http://www.w3.org/2000/svg';


  const VB_W = 1400;
  const VB_H = 140;

  svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'sub-header-svg');
  svg.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  svg.setAttribute('style', 'color:var(--header-accent);');

  const strokeW = 8;                 
  const circleR = Math.round(VB_H * 0.48); 

  const maskId = `rectCutMask_${Date.now()}`;
  const mask = document.createElementNS(ns, 'mask');
  mask.setAttribute('id', maskId);

  const maskBg = document.createElementNS(ns, 'rect');
  maskBg.setAttribute('x', '0'); maskBg.setAttribute('y', '0');
  maskBg.setAttribute('width', String(VB_W)); maskBg.setAttribute('height', String(VB_H));
  maskBg.setAttribute('fill', 'white');
  mask.appendChild(maskBg);

  const maskCircle = document.createElementNS(ns, 'circle');
  maskCircle.setAttribute('cx', String(VB_W / 2));
  maskCircle.setAttribute('cy', String(VB_H / 2));
  maskCircle.setAttribute('r', String(circleR + (strokeW * 1.25)));
  maskCircle.setAttribute('fill', 'black');
  mask.appendChild(maskCircle);

  svg.appendChild(mask);

  const inset = 6;
  const rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('x', String(inset));
  rect.setAttribute('y', String(inset));
  rect.setAttribute('width', String(VB_W - inset * 2));
  rect.setAttribute('height', String(VB_H - inset * 2));
  rect.setAttribute('rx', String(Math.round(VB_H * 0.06)));
  rect.setAttribute('ry', String(Math.round(VB_H * 0.06)));
  rect.setAttribute('fill', 'none');
  rect.setAttribute('stroke', 'currentColor'); // dynamic color
  rect.setAttribute('stroke-width', String(strokeW));
  rect.setAttribute('vector-effect', 'non-scaling-stroke');
  rect.setAttribute('mask', `url(#${maskId})`); 
  svg.appendChild(rect);

  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', String(VB_W / 2));
  circle.setAttribute('cy', String(VB_H / 2));
  circle.setAttribute('r', String(circleR));
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', 'currentColor'); // dynamic color?
  circle.setAttribute('stroke-width', String(strokeW));
  circle.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.appendChild(circle);

  const centerClear = document.createElementNS(ns, 'circle');
  centerClear.setAttribute('cx', String(VB_W / 2));
  centerClear.setAttribute('cy', String(VB_H / 2));
  centerClear.setAttribute('r', String(Math.round(circleR * 0.78)));
  const pageBg = getComputedStyle(document.documentElement).getPropertyValue('--page-bg')?.trim() || '#0f0f0f';
  centerClear.setAttribute('fill', pageBg);
  centerClear.setAttribute('stroke', 'none');
  svg.appendChild(centerClear);

  // append to wrapper 
  wrapper.insertBefore(svg, wrapper.firstChild);

  // remove any "no-svg" fallback class
  wrapper.classList.remove('no-svg');

  return svg;
}

/* adjust the wrapper height to match svg aspect ratio and viewport constraints */
function fitHeaderWrapperToSvg() {
  const wrapper = document.querySelector('.sub-header-wrap');
  const svg = wrapper?.querySelector('svg.sub-header-svg');
  if (!wrapper || !svg) return;
  const viewW = 1400;
  const viewH = 140;
  const ratio = viewH / viewW;
  const desired = Math.min(window.innerWidth * ratio, window.innerHeight * 0.26);
  const final = Math.max(56, Math.min(Math.round(desired), 220)); // clamp
  wrapper.style.height = `${final}px`;
  document.documentElement.style.setProperty('--sub-header-height', `${final}px`);
}

async function populateHeaderText(gen) {
  const regionNameEl = document.getElementById('regionNameText');
  const genNumEl = document.getElementById('generationNumber');

  if (regionNameEl) regionNameEl.textContent = (GEN_NAMES[gen] || `GENERATION ${gen}`).toUpperCase();
  if (genNumEl) genNumEl.textContent = String(gen);

  try {
    const res = await fetch(`${API_BASE}/generation/${gen}`);
    if (!res.ok) throw new Error('API failed');
    const json = await res.json();
    let region = json?.main_region?.name || GEN_NAMES[gen] || json?.name || `Generation ${gen}`;
    region = region.replace(/-/g, ' ').toUpperCase();
    const id = json?.id || gen;
    if (regionNameEl) regionNameEl.textContent = region;
    if (genNumEl) genNumEl.textContent = String(id);
  } catch (e) {
    console.warn('populateHeaderText:', e);
  }

  if (regionNameEl) regionNameEl.style.color = 'var(--header-accent)';
  if (genNumEl) genNumEl.style.color = 'var(--header-accent)';
}

/* ---------- Loader animation ---------- */
let _loaderEl = null;
let _loaderTl = null;

function createLoaderEl() {
  if (_loaderEl) return _loaderEl;
  const el = document.createElement('img');
  el.id = 'pokeballLoader';
  el.src = '../IMAGES/PokeBallSVG/512px-Poké_Ball_icon.png';
  el.alt = 'Pokéball loading';
  Object.assign(el.style, {
    position: 'fixed', top: '28vh', left: '-120px', width: '64px', height: '64px',
    zIndex: 12000, pointerEvents: 'none', willChange: 'transform', opacity: '0.95', transformOrigin: '50% 50%'
  });
  document.body.appendChild(el);
  _loaderEl = el;
  return el;
}
function startPokeballAnimation() {
  if (!window.gsap) return;
  if (_loaderTl) return;
  const el = createLoaderEl();
  const computeX = () => (window.innerWidth + 240);
  _loaderTl = gsap.timeline({ repeat: -1, defaults: { ease: 'linear' } });
  _loaderTl.to(el, { duration: 1.6, x: () => computeX(), rotation: 720, ease: 'linear' });
  gsap.set(el, { x: 0 });
}
function stopPokeballAnimation() {
  try { if (_loaderTl) { _loaderTl.kill(); _loaderTl = null; } } catch (e) {}
  try {
    if (_loaderEl) {
      if (window.gsap) {
        gsap.to(_loaderEl, { opacity: 0, duration: 0.18, onComplete() { _loaderEl?.remove(); _loaderEl = null; }});
      } else {
        _loaderEl.remove(); _loaderEl = null;
      }
    }
  } catch (e) { _loaderEl = null; }
}

document.addEventListener('DOMContentLoaded', () => {
  buildHeaderSVGIfMissing();
  fitHeaderWrapperToSvg();

  const params = new URLSearchParams(location.search);
  const genParam = parseInt(params.get('gen') || '1', 10);
  const gen = Number.isInteger(genParam) && genParam >= 1 && genParam <= 9 ? genParam : 1;

  populateHeaderText(gen);

  window.addEventListener('resize', debounce(() => fitHeaderWrapperToSvg(), 120));

  /* ------------------ poke grid boot ------------------ */
  const grid = document.getElementById('pokedexGrid');
  if (!grid) return;

  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.gsap) {
    try { if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger); if (window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin); } catch (e) {}
  }

  const controller = new AbortController();
  const { signal } = controller;
  window.addEventListener('beforeunload', () => controller.abort());
  window.addEventListener('pagehide', () => controller.abort());

  (async function loadGeneration() {
    try {
      if (loadingEl) { loadingEl.style.display = ''; loadingEl.textContent = 'Loading Pokémon…'; }
      if (errorEl) errorEl.style.display = 'none';
      grid.innerHTML = '';

      startPokeballAnimation();

      const genResp = await fetch(`${API_BASE}/generation/${gen}`, { signal });
      if (!genResp.ok) throw new Error(`Generation fetch failed: ${genResp.status} ${genResp.statusText}`);
      const genJson = await genResp.json();

      const species = (genJson && genJson.pokemon_species) ? genJson.pokemon_species : [];
      if (!species.length) {
        stopPokeballAnimation();
        showError('No Pokémon species returned for this generation.');
        return;
      }

      const names = species.map(s => s.name);

      const batchSize = 12;
      const results = [];
      for (let i = 0; i < names.length; i += batchSize) {
        if (signal.aborted) break;
        const batch = names.slice(i, i + batchSize);
        const promises = batch.map(name =>
          fetch(`${API_BASE}/pokemon/${encodeURIComponent(name)}`, { signal })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        );
        const batchResults = await Promise.all(promises);
        for (const r of batchResults) if (r) results.push(r);
        await new Promise(res => setTimeout(res, 20));
      }

      if (signal.aborted) { stopPokeballAnimation(); return; }

      if (!results.length) {
        stopPokeballAnimation();
        showError('Failed to fetch Pokémon details for this generation.');
        return;
      }

      results.sort((a, b) => (a.id || 9999) - (b.id || 9999));
      renderPokemonGrid(results, grid, signal);

      if (loadingEl) loadingEl.style.display = 'none';
      stopPokeballAnimation();

      if (typeof initialiseBurgerMenu === 'function') {
        try { initialiseBurgerMenu(); } catch (e) { console.warn(e); }
      }
    } catch (err) {
      stopPokeballAnimation();
      if (err.name === 'AbortError') return;
      console.error(err);
      showError(`Error loading generation: ${err.message}`);
    }
  })();

  function showError(msg) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) { errorEl.textContent = msg; errorEl.style.display = ''; }
  }

  function renderPokemonGrid(results, container, signal) {
    container.innerHTML = '';

    for (const p of results) {
      if (signal && signal.aborted) break;

      const card = document.createElement('a');
      card.className = 'pokedex-card';
      card.href = `pokedexEntryPage.html?name=${encodeURIComponent(p.name)}`;
      card.setAttribute('aria-label', `Open entry for ${p.name}`);
      card.setAttribute('tabindex', '0');

      const img = document.createElement('img');
      img.alt = capitalize(p.name.replace('-', ' '));
      img.loading = 'lazy';

      const shinyCandidates = [
        p?.sprites?.front_shiny,
        p?.sprites?.other?.['official-artwork']?.front_shiny,
        p?.sprites?.other?.home?.front_shiny,
        p?.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_shiny
      ];
      const shinyUrl = shinyCandidates.find(u => !!u) || '';
      // store shiny on the pokemon object for other modules to reuse
      p._shinyUrl = shinyUrl || '';
      // expose on the image element too 
      img.dataset.shiny = shinyUrl || '';

      // prefer official artwork or front_default for visible grid; shiny is preserved in data-shiny for later use
      const official = p.sprites && p.sprites.other && p.sprites.other['official-artwork'] && p.sprites.other['official-artwork'].front_default;
      const front = p.sprites && p.sprites.front_default;
      const chosen = official || front || PLACEHOLDER;
      img.src = chosen;
      // store original on the element for revert
      img.dataset.original = chosen;

      img.className = 'card-art';
      img.addEventListener('error', () => { if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER; });

      const info = document.createElement('div');
      info.className = 'card-info';
      const nameEl = document.createElement('div');
      nameEl.className = 'card-name';
      nameEl.textContent = capitalize(p.name.replace('-', ' '));
      const idEl = document.createElement('div');
      idEl.className = 'card-id';
      idEl.textContent = `#${String(p.id).padStart(3, '0')}`;
      info.appendChild(nameEl);
      info.appendChild(idEl);

      card.appendChild(img);
      card.appendChild(info);

      // hover bounce 
      card.addEventListener('pointerenter', () => {
        if (prefersReduced || !window.gsap) return;
        if (card._hoverTl && card._hoverTl.isActive && card._hoverTl.isActive()) return;
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to(card, { y: -10, duration: 0.48, ease: 'sine.inOut' }, 0);
        tl.to(img, { scale: 1.06, duration: 0.48, ease: 'sine.inOut' }, 0);
        card._hoverTl = tl;
      });

      card.addEventListener('pointerleave', () => {
        if (!window.gsap) return;
        if (card._hoverTl) {
          try { card._hoverTl.kill(); } catch (e) {}
          card._hoverTl = null;
        }
        gsap.to(card, { y: 0, duration: 0.25, ease: 'power2.out' });
        gsap.to(img, { scale: 1, duration: 0.25, ease: 'power2.out' });
      });

      card.addEventListener('focus', () => card.dispatchEvent(new PointerEvent('pointerenter')));
      card.addEventListener('blur', () => card.dispatchEvent(new PointerEvent('pointerleave')));

      container.appendChild(card);

      // scroll parallax
      if (window.gsap && window.ScrollTrigger && !prefersReduced) {
        try {
          gsap.to(img, {
            yPercent: -12,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6
            }
          });
        } catch (e) {}
      }
    }

    // entrance animation
    if (window.gsap && !prefersReduced) {
      const children = Array.from(container.children).filter(n => n.nodeType === 1);
      if (children.length) {
        gsap.from(children, {
          y: 16,
          opacity: 0,
          stagger: 0.03,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    }
  }

  /* ----- shiny toggle handling for grid images ----- */

  document.addEventListener('shinyToggle', (ev) => {
    const on = !!(ev && ev.detail && ev.detail.on);
    const cards = document.querySelectorAll('.pokedex-card .card-art');
    cards.forEach(img => {
      // if turning on and shiny available -> swap to shiny
      if (on && img.dataset.shiny) {
        img.src = img.dataset.shiny;
      } else {
        // revert to original
        if (img.dataset.original) img.src = img.dataset.original;
      }
    });
  });
});

/* Exported helper for entry page */
export async function fetchPokemonDetails(nameOrId, signal) {
  const name = String(nameOrId || '').toLowerCase();
  if (!name) throw new Error('No name or id provided');

  const pokeResp = await fetch(`${API_BASE}/pokemon/${encodeURIComponent(name)}`, { signal });
  if (!pokeResp.ok) throw new Error(`Pokemon fetch failed: ${pokeResp.status} ${pokeResp.statusText}`);
  const poke = await pokeResp.json();

  const shinyCandidates = [
    poke?.sprites?.front_shiny,
    poke?.sprites?.other?.['official-artwork']?.front_shiny,
    poke?.sprites?.other?.home?.front_shiny,
    poke?.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_shiny
  ];
  poke._shinyUrl = shinyCandidates.find(u => !!u) || '';

  let species = null;
  try {
    const spResp = await fetch(`${API_BASE}/pokemon-species/${encodeURIComponent(name)}`, { signal });
    if (spResp.ok) species = await spResp.json();
  } catch (e) {}

  return { poke, species };
}

export { PLACEHOLDER, capitalize };
