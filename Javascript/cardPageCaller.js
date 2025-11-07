const API_URL = 'https://api.pokemontcg.io/v2/cards';
const SETS_URL = 'https://api.pokemontcg.io/v2/sets';

const DEFAULT_CONFIG = {
  apiKey: undefined,
  pageSize: 250,
  timeoutMs: 10000,
  maxAttempts: 6,
  initialDelay: 600,
  factor: 1.8,
  jitter: true,
  retryUntilSuccess: true
};

function escapeHtml(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); }
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
async function safeText(resp){ try { return await resp.text(); } catch { return ''; } }

function apiFetchWithRetry(url, fetchOptions = {}, opts = {}, apiKey) {
  const {
    maxAttempts = DEFAULT_CONFIG.maxAttempts,
    initialDelay = DEFAULT_CONFIG.initialDelay,
    factor = DEFAULT_CONFIG.factor,
    jitter = DEFAULT_CONFIG.jitter,
    retryUntilSuccess = DEFAULT_CONFIG.retryUntilSuccess,
    treatEmptyAsRetryable = false
  } = opts || {};

  let attempt = 0;
  let delay = initialDelay;
  const seriesController = new AbortController();
  const signal = seriesController.signal;

  const p = (async () => {
    while (true) {
      attempt++;
      try {
        const mergedHeaders = { ...(fetchOptions.headers || {}), ...(apiKey ? { 'X-Api-Key': apiKey } : {}) };
        const resp = await fetch(url, { ...fetchOptions, headers: mergedHeaders, signal });

        if (treatEmptyAsRetryable && resp && resp.ok) {
          let body = '';
          try { body = await resp.clone().text(); } catch {}
          if (/\"data\"\s*:\s*\[\s*\]/.test(body)) throw new Error('Empty data array (retryable)');
        }

        if (!resp.ok) {
          const body = await safeText(resp);
          throw new Error(`HTTP ${resp.status} ${resp.statusText}: ${body}`);
        }

        return resp;
      } catch (err) {
        if (signal.aborted) throw new Error('Request aborted');

        const doInfinite = retryUntilSuccess;
        const shouldRetry = doInfinite || attempt < maxAttempts;

        if (err && /429|rate limit/i.test(String(err.message))) delay = Math.max(delay, 1500);
        if (!shouldRetry) throw err;

        let wait = delay;
        if (jitter) {
          const jitterAmount = Math.round(Math.random() * Math.min(3000, wait));
          wait = Math.round(wait + jitterAmount * (Math.random() < 0.5 ? -1 : 1));
          if (wait < 200) wait = 200;
        }

        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => { seriesController.signal.removeEventListener('abort', onAbort); resolve(); }, wait);
          function onAbort(){ clearTimeout(timer); seriesController.signal.removeEventListener('abort', onAbort); reject(new Error('Request aborted')); }
          seriesController.signal.addEventListener('abort', onAbort);
        });

        delay = Math.round(delay * factor);
      }
    }
  })();

  p.cancel = () => seriesController.abort();
  return p;
}


const POKEBALL_SRC = '../IMAGES/PokeBallSVG/512px-Poké_Ball_icon.png'; 
let _overlayEl = null;
function showLoadingOverlay(text = 'LOADING CARD SETS....') {
  // if overlay exists already, keep it
  if (_overlayEl) return;

  // create overlay
  const overlay = document.createElement('div');
  overlay.id = 'tcg-loading-overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '99999';
  overlay.style.background = 'rgba(0,0,0,0.35)';

  const box = document.createElement('div');
  box.style.display = 'flex';
  box.style.flexDirection = 'column';
  box.style.alignItems = 'center';
  box.style.gap = '12px';

  const img = document.createElement('img');
  img.src = POKEBALL_SRC;
  img.alt = '';
  img.style.width = '96px';
  img.style.height = '96px';
  img.style.display = 'block';
  img.style.pointerEvents = 'none';
  img.style.userSelect = 'none';

  const label = document.createElement('div');
  label.textContent = text;
  label.style.color = '#ffffff';
  label.style.fontWeight = '700';
  label.style.letterSpacing = '0.06em';

  box.appendChild(img);
  box.appendChild(label);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  _overlayEl = overlay;

  // animate rotation 
  try {
    if (window.gsap && typeof window.gsap.to === 'function') {
      overlay._spinTween = window.gsap.to(img, { rotation: 360, duration: 1.0, ease: 'linear', repeat: -1, transformOrigin: '50% 50%' });
    } else {
      img.style.animation = 'tcg-pokeball-spin 1s linear infinite';
      // inject keyframes once
      if (!document.getElementById('tcg-pokeball-keyframes')) {
        const s = document.createElement('style');
        s.id = 'tcg-pokeball-keyframes';
        s.textContent = `
          @keyframes tcg-pokeball-spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(s);
      }
    }
  } catch (e) {
    console.warn('Loading overlay animation failed', e);
  }
}

function hideLoadingOverlay() {
  if (!_overlayEl) return;
  try {
    if (_overlayEl._spinTween && typeof _overlayEl._spinTween.kill === 'function') {
      _overlayEl._spinTween.kill();
    }
    const img = _overlayEl.querySelector('img');
    if (img) {
      img.style.animation = '';
    }
  } catch (e) {}
  _overlayEl.remove();
  _overlayEl = null;
}

function ensureUI() {
  let setsBar = document.getElementById('setsBar');
  let cardsEl = document.getElementById('cards');
  let setSearch = document.getElementById('setSearch');

  const mainEl = document.querySelector('main') || document.body;

  if (!setsBar || !cardsEl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tcg-widget-wrap';
    wrapper.innerHTML = `
      <div class="tcg-controls" style="margin:0 0 12px 0">
        <input type="search" id="setSearch" placeholder="Filter sets by name..." aria-label="Filter sets" style="display:none" />
      </div>
      <div id="setsBar" role="region" aria-label="Sets list" ></div>
      <div id="cards" aria-live="polite"></div>
    `;

    // center container
    wrapper.style.maxWidth = '1100px';
    wrapper.style.margin = '0 auto 28px';
    wrapper.style.boxSizing = 'border-box';

    mainEl.appendChild(wrapper);

    const subWrap = document.querySelector('.sub-header-wrap');
    if (subWrap) {
      const subRect = subWrap.getBoundingClientRect();
      const mainRect = mainEl.getBoundingClientRect();
      let topOffset = Math.max(12, subRect.bottom - mainRect.top + 12);
      if (!Number.isFinite(topOffset) || topOffset < 12) topOffset = 28;
      wrapper.style.marginTop = topOffset + 'px';
    } else {
      wrapper.style.marginTop = '28px';
    }

    setsBar = document.getElementById('setsBar');
    cardsEl = document.getElementById('cards');
    setSearch = document.getElementById('setSearch');

    if (setsBar) {
      setsBar.style.display = 'grid';
      setsBar.style.gridTemplateColumns = '48% 48%'; 
      setsBar.style.justifyContent = 'center';
      setsBar.style.columnGap = '4%';
      setsBar.style.rowGap = '14px';
      setsBar.style.boxSizing = 'border-box';
    }
  }

  return { setsBar, cardsEl, setSearch };
}

export default function initSetsModule(userCfg = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...userCfg };
  const apiKey = cfg.apiKey;

  const refs = ensureUI();
  const setsBar = refs.setsBar;
  const cardsEl = refs.cardsEl;
  const setSearch = refs.setSearch;

  let setsList = [];
  let currentSetsFetch = null;
  let currentCardsFetch = null;

  function attachHoverBounce(btn) {
    // do nothing if GSAP missing; use CSS fallback bounce via transform on hover instead
    if (!window.gsap || typeof window.gsap.to !== 'function') {
      btn.addEventListener('mouseenter', () => btn.classList.add('tcg-bounce-fallback'));
      btn.addEventListener('mouseleave', () => btn.classList.remove('tcg-bounce-fallback'));
      return;
    }

    btn.addEventListener('mouseenter', () => {
      // avoid creating duplicate tween
      if (btn._hoverTween && typeof btn._hoverTween.kill === 'function') return;
      // continuous small bounce while hovered
      btn._hoverTween = window.gsap.to(btn, { y: -8, duration: 0.25, repeat: -1, yoyo: true, ease: 'power1.inOut' });
    });
    btn.addEventListener('mouseleave', () => {
      try {
        if (btn._hoverTween && typeof btn._hoverTween.kill === 'function') {
          btn._hoverTween.kill();
          btn._hoverTween = null;
        }
        window.gsap.set(btn, { y: 0 });
      } catch (e) {}
    });
  }

  function wireHoverForAll() {
    if (!setsBar) return;
    const buttons = Array.from(setsBar.querySelectorAll('.set-btn'));
    buttons.forEach(btn => {
      if (!btn._hoverBound) {
        attachHoverBounce(btn);
        btn._hoverBound = true;
      }
    });
  }

  function renderSets(list) {
    if (!setsBar) return;
    setsBar.innerHTML = '';
    if (!Array.isArray(list) || list.length === 0) {
      const no = document.createElement('div');
      no.className = 'small';
      no.textContent = 'No sets found.';
      setsBar.appendChild(no);
      return;
    }

    list.forEach((set, i) => {
      const btn = document.createElement('button');
      btn.className = 'set-btn';
      btn.type = 'button';

      if ((i % 2) === 0) btn.classList.add('left-btn'); else btn.classList.add('right-btn');

      const countKnown = (set.printedTotal ?? set.total ?? set.totalCards ?? null);
      const countText = countKnown != null ? String(countKnown) : '—';
      const releaseText = set.releaseDate ? set.releaseDate : '—';

      const nameEl = document.createElement('div');
      nameEl.className = 'set-name';
      nameEl.textContent = set.name || '';

      const metaEl = document.createElement('div');
      metaEl.className = 'set-meta';
      metaEl.textContent = `Cards: ${countText} · ${releaseText}`;

      btn.appendChild(nameEl);
      btn.appendChild(metaEl);

      btn.title = `${set.name} — ${set.series || ''} ${set.releaseDate ? '('+set.releaseDate+')':''}`;
      btn.dataset.setId = set.id;

      btn.addEventListener('click', () => {
        const url = `../Pokemon Card Page/setPage.html?set=${encodeURIComponent(set.id)}&name=${encodeURIComponent(set.name || '')}`;
        window.location.href = url;
      });

      // ensure fills cell and is visually longer
      btn.style.width = '100%';
      btn.style.minHeight = '72px';
      btn.style.boxSizing = 'border-box';

      setsBar.appendChild(btn);
    });

    wireHoverForAll();
  }

  function renderCards(cards = []) {
    if (!cardsEl) return;
    cardsEl.innerHTML = '';
    if (!cards || !cards.length) {
      const no = document.createElement('div');
      no.className = 'small';
      no.style.padding = '14px';
      no.textContent = 'No cards found.';
      cardsEl.appendChild(no);
      return;
    }
    for (const card of cards) {
      const div = document.createElement('div');
      div.className = 'card';
      const img = card.images && (card.images.small || card.images.large) ? card.images.small || card.images.large : '';
      const name = card.name || 'Unknown';
      const supertype = card.supertype || '';
      const sub = card.subtypes ? card.subtypes.join(', ') : '';
      const setName = card.set && card.set.name ? card.set.name : '';
      div.innerHTML = `
        <img src="${escapeHtml(img)}" alt="${escapeHtml(name)}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;320&quot; height=&quot;220&quot;><rect width=&quot;100%25&quot; height=&quot;100%25&quot; fill=&quot;%23f4f4f4&quot;/><text x=&quot;50%25&quot; y=&quot;50%25&quot; dominant-baseline=&quot;middle&quot; text-anchor=&quot;middle&quot; fill=&quot;%23bbb&quot; font-size=&quot;14&quot;>No image</text></svg>'>
        <div class="meta">
          <div><strong>${escapeHtml(name)}</strong></div>
          <div class="small">${escapeHtml(supertype)}${sub ? ' · ' + escapeHtml(sub) : ''}</div>
          <div class="small">Set: ${escapeHtml(setName)}</div>
        </div>
      `;
      cardsEl.appendChild(div);
    }
  }

  async function loadSets() {
    if (currentSetsFetch && typeof currentSetsFetch.cancel === 'function') {
      currentSetsFetch.cancel();
      currentSetsFetch = null;
    }

    // show overlay while fetching sets
    showLoadingOverlay('LOADING CARD SETS....');

    try {
      while (true) {
        currentSetsFetch = apiFetchWithRetry(`${SETS_URL}?orderBy=releaseDate&pageSize=${cfg.pageSize}`, { method: 'GET' }, {
          maxAttempts: 6,
          initialDelay: 800,
          factor: 1.9,
          retryUntilSuccess: false,
          treatEmptyAsRetryable: true
        }, apiKey);

        let resp;
        try {
          resp = await currentSetsFetch;
        } catch (err) {
          if (String(err.message).toLowerCase().includes('aborted')) { currentSetsFetch = null; hideLoadingOverlay(); return; }
          await sleep(1000);
          continue;
        }

        let json;
        try { json = await resp.json(); } catch (err) { await sleep(1000); continue; }

        const items = Array.isArray(json.data) ? json.data : [];
        if (items.length === 0) { await sleep(1200); continue; }

        setsList = items.slice();
        setsList.forEach(s => s._releaseDateObj = s.releaseDate ? new Date(s.releaseDate) : null);
        setsList.sort((a,b) => (b._releaseDateObj || 0) - (a._releaseDateObj || 0) || a.name.localeCompare(b.name));
        renderSets(setsList);
        currentSetsFetch = null;
        break;
      }
    } catch (err) {
      console.error('loadSets error', err);
    } finally {
      hideLoadingOverlay();
    }
  }

  async function getRandomCards(count = 5) {
    try {
      showLoadingOverlay('LOADING CARD SETS....');
      const maxPagesGuess = 300;
      const page = Math.floor(Math.random() * maxPagesGuess) + 1;
      const url = `${API_URL}?page=${page}&pageSize=${count}`;
      currentCardsFetch = apiFetchWithRetry(url, {}, { maxAttempts: 8, initialDelay: 500, factor: 1.6 }, apiKey);
      const resp = await currentCardsFetch;
      const json = await resp.json();
      renderCards(json.data || []);
    } catch (err) {
      console.error('getRandomCards error', err);
    } finally {
      hideLoadingOverlay();
      currentCardsFetch = null;
    }
  }

  async function loadCardsBySet(setId, count = 12) {
    try {
      showLoadingOverlay('LOADING CARD SETS....');
      const q = encodeURIComponent(`set.id:"${setId}"`);
      const url = `${API_URL}?q=${q}&pageSize=${count}`;
      currentCardsFetch = apiFetchWithRetry(url, {}, { maxAttempts: 8, initialDelay: 500, factor: 1.6 }, apiKey);
      const resp = await currentCardsFetch;
      const json = await resp.json();
      renderCards(json.data || []);
    } catch (err) {
      console.error('loadCardsBySet error', err);
    } finally {
      hideLoadingOverlay();
      currentCardsFetch = null;
    }
  }

  (function wireSearchToggle() {
    try {
      const searchBtn = document.getElementById('searchBtn');
      if (!searchBtn) return;
      function toggleSearch() {
        const inp = document.getElementById('setSearch');
        if (!inp) return;
        const isVisible = inp.style.display !== 'none' && inp.style.display !== '';
        if (isVisible) {
          inp.style.display = 'none';
          searchBtn.classList.remove('search-open');
        } else {
          inp.style.display = 'inline-block';
          inp.focus();
          searchBtn.classList.add('search-open');
        }
      }
      searchBtn.addEventListener('click', (e) => { e.preventDefault(); toggleSearch(); });
      const input = document.getElementById('setSearch');
      if (input) input.style.display = 'none';
    } catch (e) {}
  })();

  function attachSearchListener() {
    const input = document.getElementById('setSearch'); if (!input) return;
    input.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = setsList.filter(s => (s.name||'').toLowerCase().includes(q) || ((s.series||'').toLowerCase().includes(q)));
      renderSets(filtered);
    });
  }
  setTimeout(attachSearchListener, 300);
  setTimeout(attachSearchListener, 1000);

  // start loading sets automatically
  loadSets().catch(() => {});

  // expose cancel method
  window.cancelOngoingRequests = () => {
    try { if (currentSetsFetch && typeof currentSetsFetch.cancel === 'function') currentSetsFetch.cancel(); } catch(e){}
    try { if (currentCardsFetch && typeof currentCardsFetch.cancel === 'function') currentCardsFetch.cancel(); } catch(e){}
    hideLoadingOverlay();
  };

  return {
    loadSets,
    getRandomCards,
    loadCardsBySet,
    cancelOngoingRequests: window.cancelOngoingRequests
  };
}
