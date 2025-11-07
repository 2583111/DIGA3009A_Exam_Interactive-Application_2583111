const API_URL = 'https://api.pokemontcg.io/v2/cards';
const SETS_URL = 'https://api.pokemontcg.io/v2/sets';
const API_KEY = '65255000-09cc-42e5-8e89-977917a77ed7';

// ---------- small helpers ----------
function qs(name) { return new URLSearchParams(location.search).get(name); }
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function buildHeaders(){ const h = { 'Accept':'application/json' }; if (API_KEY) h['X-Api-Key'] = API_KEY; return h; }
function escapeHtml(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); }

const cardsGrid = document.getElementById('cardsGrid');
const setTitleEl = document.getElementById('setTitle') || document.getElementById('setSquare');
const statusEl = document.getElementById('status'); 
if (!cardsGrid) throw new Error('cardsGrid not found in DOM');

(function dedupeSubheader() {
  const subs = Array.from(document.querySelectorAll('.subheader-container'));
  if (subs.length > 1) {
    for (let i = 1; i < subs.length; i++) subs[i].remove();
  }
})();

const setId = qs('set');
const setName = qs('name') ? decodeURIComponent(qs('name')) : '';
if (!setId) {
  if (statusEl) statusEl.textContent = 'No set specified.';
  throw new Error('No set id in query string (set=...)');
}
if (setTitleEl) setTitleEl.textContent = setName || setId;

(function ensureBackLink() {
  if (document.getElementById('backToRegions')) return;

  // prefer placing the back-link after the main content area
  const mainArea = document.querySelector('main') || document.querySelector('.wrap') || document.body;

  const container = document.createElement('div');
  container.style.marginTop = '20px';
  container.style.textAlign = 'center';

  const a = document.createElement('a');
  a.id = 'backToRegions';
  a.href = 'index.html';               // points to the Sets index in the same folder as setPage.html
  a.className = 'back-link region-back';
  a.setAttribute('aria-label', 'Back to sets');
  a.innerHTML = '&lt;&lt;&lt; SETS';

  container.appendChild(a);

  // If there's a .wrap element, insert the link immediately after it (matches page structure).
  const wrapEl = document.querySelector('.wrap');
  if (wrapEl && wrapEl.parentNode) {
    if (wrapEl.nextSibling) wrapEl.parentNode.insertBefore(container, wrapEl.nextSibling);
    else wrapEl.parentNode.appendChild(container);
    return;
  }

  // Otherwise append inside <main> if present, otherwise fallback to body
  if (mainArea && mainArea !== document.body) {
    mainArea.appendChild(container);
  } else {
    document.body.appendChild(container);
  }
})();

// ---------- Pokéball loader overlay ----------
const POKEBALL_SRC = '../IMAGES/PokeBallSVG/512px-Poké_Ball_icon.png'; 
const POKEBALL_ID = 'pokeballLoader';
let pokeballEl = document.getElementById(POKEBALL_ID);
if (!pokeballEl) {
  pokeballEl = document.createElement('div');
  pokeballEl.id = POKEBALL_ID;
  pokeballEl.setAttribute('aria-hidden','true');
  pokeballEl.style.position = 'fixed';
  pokeballEl.style.left = '50%';
  pokeballEl.style.top = '28vh';
  pokeballEl.style.transform = 'translateX(-50%)';
  pokeballEl.style.zIndex = '13000';
  pokeballEl.style.display = 'flex';
  pokeballEl.style.flexDirection = 'column';
  pokeballEl.style.alignItems = 'center';
  pokeballEl.style.justifyContent = 'center';
  pokeballEl.style.gap = '10px';
  pokeballEl.style.pointerEvents = 'none';
  pokeballEl.style.opacity = '0.98';

  const img = document.createElement('img');
  img.alt = 'Loading';
  img.src = POKEBALL_SRC;
  img.style.width = '68px';
  img.style.height = '68px';
  img.style.display = 'block';
  img.style.userSelect = 'none';
  img.style.pointerEvents = 'none';
  img.id = POKEBALL_ID + '-img';

  const text = document.createElement('div');
  text.textContent = 'LOADING CARDS. MAYBE TAKE A WHILE....';
  text.style.fontFamily = '"Oswald", system-ui, sans-serif';
  text.style.color = '#e6f9fb';
  text.style.fontSize = '13px';
  text.style.letterSpacing = '0.06em';
  text.style.pointerEvents = 'none';
  text.id = POKEBALL_ID + '-text';

  pokeballEl.appendChild(img);
  pokeballEl.appendChild(text);
  document.body.appendChild(pokeballEl);
}

let pokeballTween = null;
function startPokeballSpin() {
  const img = document.getElementById(POKEBALL_ID + '-img');
  if (!window.gsap || !img) return;
  if (pokeballTween) pokeballTween.kill();
  pokeballTween = gsap.to(img, { rotation: 360, duration: 1.2, ease: 'linear', repeat: -1, transformOrigin: '50% 50%' });
  pokeballEl.style.display = 'flex';
  gsap.to(pokeballEl, { autoAlpha: 1, duration: 0.25 });
}
function stopPokeballSpinAndHide() {
  if (!window.gsap) {
    pokeballEl.style.display = 'none';
    return;
  }
  if (pokeballTween) { pokeballTween.kill(); pokeballTween = null; }
  gsap.to(pokeballEl, { autoAlpha: 0, duration: 0.45, onComplete: () => { pokeballEl.style.display = 'none'; } });
}

// start spinning immediately
startPokeballSpin();

const PLACEHOLDER_SRC = '../IMAGES/Pokemon_Cardback.png';

// ---------- loading / rendering logic ----------
async function fetchSetInfo(id) {
  try {
    const resp = await fetch(`${SETS_URL}/${encodeURIComponent(id)}`, { headers: buildHeaders() });
    if (!resp.ok) return null;
    return await resp.json();
  } catch (err) {
    console.warn('fetchSetInfo failed', err);
    return null;
  }
}

function addPlaceholders(n) {
  const created = [];
  for (let i=0;i<n;i++){
    const cardEl = document.createElement('div');
    cardEl.className = 'card bounce';
    cardEl.tabIndex = 0;
    cardEl.innerHTML = `
      <div class="imgwrap"><img class="placeholder-back" src="${PLACEHOLDER_SRC}" alt="placeholder"></div>
      <div class="meta" style="display:none"></div>
    `;
    cardsGrid.appendChild(cardEl);
    created.push(cardEl);
  }
  // stop pokeball once placeholders are visible 
  stopPokeballSpinAndHide();
  return created;
}

// simple fetch page with retry
async function fetchCardsPage(id, page=1, pageSize=50) {
  const url = `${API_URL}?q=${encodeURIComponent(`set.id:"${id}"`)}&page=${page}&pageSize=${pageSize}`;
  try {
    const resp = await fetch(url, { headers: buildHeaders() });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (err) {
    // simple backoff + retry once
    await sleep(700);
    return await fetchCardsPage(id, page, pageSize);
  }
}

// animate bounce for a set of elements and return a function to stop it
function startBounceOnElements(elems) {
  if (!window.gsap) return () => {};
  const tweens = [];
  elems.forEach(el => {
    const t = gsap.to(el, { scale: 1.03, y: -6, duration: 0.45, yoyo: true, repeat: -1, ease: "power1.inOut" });
    el._loadingTween = t;
    tweens.push(t);
  });
  return function stopAll() {
    tweens.forEach(t => t.kill && t.kill());
    elems.forEach(el => { if (el._loadingTween) { delete el._loadingTween; } });
  };
}

// ---------- Overlay focus behavior  ----------
let activeOverlay = null;
let activeDraggable = null;

function openCardOverlay(imgSrc) {
  // avoid multiple overlays
  if (document.getElementById('cardOverlay')) return;

  // create full-screen translucent backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'cardOverlay';
  backdrop.style.position = 'fixed';
  backdrop.style.left = '0';
  backdrop.style.top = '0';
  backdrop.style.width = '100vw';
  backdrop.style.height = '100vh';
  backdrop.style.display = 'flex';
  backdrop.style.alignItems = 'center';
  backdrop.style.justifyContent = 'center';
  backdrop.style.background = 'rgba(6,8,10,0.72)';
  backdrop.style.zIndex = '14000';
  backdrop.style.cursor = 'auto';
  backdrop.setAttribute('role','dialog');
  backdrop.setAttribute('aria-modal','true');

  // content container for the centered card
  const content = document.createElement('div');
  content.className = 'overlay-card';
  content.style.position = 'relative';
  content.style.width = 'min(90vw, 680px)';
  content.style.maxHeight = '90vh';
  content.style.borderRadius = '12px';
  content.style.overflow = 'hidden';
  content.style.boxShadow = '0 30px 120px rgba(0,0,0,0.7)';
  content.style.background = '#fff';
  content.style.touchAction = 'none';
  content.style.display = 'flex';
  content.style.alignItems = 'center';
  content.style.justifyContent = 'center';
  content.style.padding = '0';
  content.style.transform = 'translateZ(0)';

  // image inside content
  const img = document.createElement('img');
  img.src = imgSrc || PLACEHOLDER_SRC;
  img.alt = 'Card';
  img.style.width = '90%';
  img.style.height = 'auto';
  img.style.display = 'block';
  img.style.objectFit = 'contain';
  img.style.userSelect = 'none';
  img.style.pointerEvents = 'none';

  content.appendChild(img);
  backdrop.appendChild(content);
  document.body.appendChild(backdrop);
  activeOverlay = backdrop;

  // entrance animation 
  if (window.gsap) {
    gsap.fromTo(content, { scale: 0.86, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.36, ease: 'power3.out' });
  }

  // makes the content draggable 
  try {
    if (window.Draggable && typeof window.Draggable.create === 'function') {
      if (activeDraggable) { try { activeDraggable.kill(); } catch(e){} activeDraggable = null; }
      activeDraggable = Draggable.create(content, {
        type: 'x,y',
        bounds: document.body,
        edgeResistance: 0.9,
        inertia: true,
        onPress() { backdrop.style.cursor = 'grabbing'; },
        onRelease() { backdrop.style.cursor = 'auto'; }
      })[0];
    } else {
      // simple pointer fallback drag 
      let down = false, sx=0, sy=0, ox=0, oy=0;
      content.addEventListener('pointerdown', (ev) => {
        down = true;
        sx = ev.clientX; sy = ev.clientY;
        const r = content.getBoundingClientRect();
        ox = r.left; oy = r.top;
        content.setPointerCapture(ev.pointerId);
        backdrop.style.cursor = 'grabbing';
      });
      window.addEventListener('pointermove', function pm(ev){
        if (!down) return;
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        content.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      window.addEventListener('pointerup', function pu(){
        if (!down) return;
        down = false;
        backdrop.style.cursor = 'auto';
      });
    }
  } catch (e) {
    console.warn('Draggable/init failed', e);
  }

  function closeOverlay() {
    try {
      if (activeDraggable) { try { activeDraggable.kill(); } catch(e){} activeDraggable = null; }
      if (window.gsap) {
        gsap.to(content, { scale: 0.92, opacity: 0, duration: 0.22, ease: 'power2.in', onComplete() { try { backdrop.remove(); } catch(e){} activeOverlay = null; } });
      } else {
        backdrop.remove();
        activeOverlay = null;
      }
    } catch (e) { try { backdrop.remove(); } catch(e){} activeOverlay = null; }
    window.removeEventListener('keydown', onKey);
  }

  backdrop.addEventListener('pointerdown', (ev) => {
    // if click is outside content then close
    if (ev.target === backdrop) closeOverlay();
  });
  backdrop.addEventListener('dblclick', (ev) => {
    if (ev.target === backdrop) closeOverlay();
  });
  function onKey(e) { if (e.key === 'Escape') closeOverlay(); }
  window.addEventListener('keydown', onKey);
}

// ---------- main loader: incremental paged load with placeholders ----------
async function loadSetCards(id) {
  // clear grid
  cardsGrid.innerHTML = '';

  // try to fetch set metadata for total
  let total = null;
  try {
    const meta = await fetchSetInfo(id);
    if (meta && meta.data) {
      total = (meta.data.printedTotal ?? meta.data.total ?? meta.data.totalCards) || null;
      if (typeof total === 'string') total = Number(total);
    }
  } catch (err) { }

  // initial placeholders count
  const initialPlaceCount = (total && Number.isFinite(total)) ? Math.min(total, 500) : 12;
  let placeholders = addPlaceholders(initialPlaceCount);


  // keep pokeball visible at least 600ms so user sees it
  await sleep(600);
  const stopBounceAll = startBounceOnElements(placeholders);

  // fetch pages sequentially and fill placeholders in order
  let assignedCount = 0;
  const pageSize = 50;
  let page = 1;
  let keepGoing = true;


  let firstPageArrived = false;

  while (keepGoing) {
    let json;
    try {
      json = await fetchCardsPage(id, page, pageSize);
    } catch (err) {
      console.warn('cards page fetch failed, retrying', err);
      await sleep(800);
      continue;
    }

    const data = Array.isArray(json.data) ? json.data : [];
    if (!firstPageArrived && data.length > 0) {
      firstPageArrived = true;
      // fade out pokeball and hide it
      stopPokeballSpinAndHide();
    }

    if (!data.length) {
      // no more cards; exit
      keepGoing = false;
      break;
    }

    // ensure placeholders length >= assignedCount + data.length
    if (placeholders.length < assignedCount + data.length) {
      const need = (assignedCount + data.length) - placeholders.length;
      const newPlace = addPlaceholders(need);
      newPlace.forEach(p => {
        placeholders.push(p);
      });
      // start bounce on new ones
      startBounceOnElements(newPlace);
    }

    // fill placeholders sequentially with real images 
    for (let i=0;i<data.length;i++) {
      const card = data[i];
      const placeholderIndex = assignedCount + i;
      const placeholderNode = placeholders[placeholderIndex];
      if (!placeholderNode) continue;

      // load image
      const imgUrl = card.images && (card.images.large || card.images.small) ? (card.images.large || card.images.small) : null;
      const imgEl = document.createElement('img');
      imgEl.className = 'card-img';
      imgEl.alt = card.name || 'Card';
      // keep placeholder visible until load finishes
      imgEl.src = imgUrl || PLACEHOLDER_SRC;

      // when loaded, swap content
      imgEl.onload = () => {
        const imgwrap = placeholderNode.querySelector('.imgwrap');
        if (imgwrap) {
          imgwrap.innerHTML = '';
          imgwrap.appendChild(imgEl);
        }
        // stop bounce 
        try { if (placeholderNode._loadingTween) { placeholderNode._loadingTween.kill(); delete placeholderNode._loadingTween; } } catch(e){}
        if (window.gsap) gsap.to(placeholderNode, { scale: 1, y: 0, duration: 0.18, ease: 'power1.out' });

        // attach click handler to open overlay 
        placeholderNode.addEventListener('click', (ev) => {
          ev.preventDefault();
          openCardOverlay(imgEl.src || PLACEHOLDER_SRC);
        }, { once: false });

        placeholderNode.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            openCardOverlay(imgEl.src || PLACEHOLDER_SRC);
          }
        });
      };

      imgEl.onerror = () => {
        const imgwrap = placeholderNode.querySelector('.imgwrap');
        if (imgwrap) imgwrap.innerHTML = `<img class="placeholder-back" src="${PLACEHOLDER_SRC}" alt="no image">`;
        try { if (placeholderNode._loadingTween) { placeholderNode._loadingTween.kill(); delete placeholderNode._loadingTween; } } catch(e){}
      };

    }

    assignedCount += data.length;

    // done if fewer than pageSize
    if (data.length < pageSize) keepGoing = false;
    else page++;

    // short pause so UI can update (makes the entrance nicer)
    await sleep(120);
  } 

  // stop any remaining bounce tweens
  placeholders.forEach(p => {
    try { if (p._loadingTween) { p._loadingTween.kill(); delete p._loadingTween; } } catch(e){}
    if (window.gsap) gsap.set(p, { scale: 1, y: 0 });
  });

  // remove pokeball if still visible
  stopPokeballSpinAndHide();

  // stagger-in with ScrollTrigger
  await ensureScrollTriggerThenAnimate();

  if (statusEl) statusEl.textContent = `Loaded ${assignedCount} cards.`;
}

// ---------- ScrollTrigger dynamic loader + animate ----------
async function ensureScrollTriggerThenAnimate() {
  if (!window.gsap) return;
  if (!gsap.utils || !gsap.registerPlugin) return;
  if (!window.ScrollTrigger) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    }).catch(() => {});
  }

  try {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  } catch(e){ }

  // animate cards with a small stagger when they come into view
  try {
    gsap.from('.card', {
      y: 30,
      opacity: 0,
      stagger: 0.06,
      duration: 0.56,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.cards-grid',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  } catch(e) { console.warn('ScrollTrigger animation failed', e); }
}

loadSetCards(setId).catch(err => {
  console.error('loadSetCards error', err);
  if (statusEl) statusEl.textContent = 'Error loading set: ' + (err.message || err);
});
