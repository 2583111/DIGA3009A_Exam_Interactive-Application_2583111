const SVG_PATH = '../IMAGES/Header/shinyB.svg';
const ACCENT_NORMAL = '#5daec8';
const ACCENT_SHINY = '#D4FCAC';
const ICON_OFF = '#000000';
const ICON_ON = '#D4AF37';

function createButtonContainer() {
  if (document.getElementById('shinyToggleBtn')) return document.getElementById('shinyToggleBtn');

  const wrapper = document.querySelector('.sub-header-wrap');
  const btn = document.createElement('button');
  btn.id = 'shinyToggleBtn';
  btn.className = 'shiny-toggle-btn';
  btn.type = 'button';
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('title', 'Toggle shiny');

  Object.assign(btn.style, {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '0',
    padding: '6px',
    cursor: 'pointer',
    margin: '10px auto',
    zIndex: 60,
    background: ACCENT_NORMAL,
    transition: 'transform .12s ease, background .18s ease, box-shadow .18s ease'
  });

  if (wrapper && wrapper.parentNode) wrapper.parentNode.insertBefore(btn, wrapper.nextSibling);
  else document.body.insertBefore(btn, document.body.firstChild);

  return btn;
}

async function inlineSvg(btn) {
  try {
    const res = await fetch(SVG_PATH, { cache: 'no-store' });
    if (!res.ok) throw new Error('SVG fetch failed');
    const text = await res.text();
    btn.innerHTML = text;
    const svg = btn.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '28');
      svg.setAttribute('height', '28');
      // set icon fills 
      const nodes = svg.querySelectorAll('[fill]');
      nodes.forEach(n => {
        const f = n.getAttribute('fill');
        if (f && f !== 'none') n.setAttribute('fill', ICON_OFF);
      });
      const stroked = svg.querySelectorAll('[stroke]');
      stroked.forEach(n => {
        const s = n.getAttribute('stroke');
        if (s && s !== 'none') n.setAttribute('stroke', ICON_OFF);
      });
    } else {
      // fallback glyph
      btn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24"><path fill="${ICON_OFF}" d="M12 2l1.9 4.4L18.7 8l-4 2.9L15 16l-3-2-3 2 0.3-5.1L5.3 8l4.8-1.6L12 2z"/></svg>`;
    }
  } catch (e) {
    btn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24"><path fill="${ICON_OFF}" d="M12 2l1.9 4.4L18.7 8l-4 2.9L15 16l-3-2-3 2 0.3-5.1L5.3 8l4.8-1.6L12 2z"/></svg>`;
  }
}

function setButtonVisual(btn, isOn) {
  btn.style.background = isOn ? ACCENT_SHINY : ACCENT_NORMAL;
  const svg = btn.querySelector('svg');
  if (!svg) return;
  const fillColor = isOn ? ICON_ON : ICON_OFF;
  svg.querySelectorAll('[fill]').forEach(n => {
    const f = n.getAttribute('fill');
    if (f && f !== 'none') n.setAttribute('fill', fillColor);
  });
  svg.querySelectorAll('[stroke]').forEach(n => {
    const s = n.getAttribute('stroke');
    if (s && s !== 'none') n.setAttribute('stroke', fillColor);
  });
}

function updatePageAccent(isOn) {
  const root = document.documentElement;
  if (isOn) {
    root.style.setProperty('--header-accent', ACCENT_SHINY);
    root.style.setProperty('--blue', ACCENT_SHINY);
  } else {
    root.style.setProperty('--header-accent', ACCENT_NORMAL);
    root.style.setProperty('--blue', ACCENT_NORMAL);
  }
}

function dispatchToggle(isOn) {
  const ev = new CustomEvent('shinyToggle', { bubbles: true, detail: { on: !!isOn }});
  document.dispatchEvent(ev);
  const ev2 = new CustomEvent('shinyRequested', { bubbles: true, detail: { activateGold: !!isOn }});
  document.dispatchEvent(ev2);
}

/** Helper: swap the entry-page artwork (#artwork) to shiny (or revert).
 */


function swapEntryArtworkToShiny(isOn) {
  try {
    const artwork = document.getElementById('artwork');
    if (!artwork) return;
    // store original src if not stored
    if (!artwork.dataset.original) artwork.dataset.original = artwork.src || '';
    // prefer the global poke object if present
    const poke = window.POKEPORTAL_CURRENT_POKE || null;
    if (isOn) {
      const shinyCandidate = (poke && poke._shinyUrl) ? poke._shinyUrl : artwork.dataset.shiny || '';
      if (shinyCandidate) {
        artwork.src = shinyCandidate;
      }
    } else {
      // revert to stored original
      if (artwork.dataset.original) artwork.src = artwork.dataset.original;
    }
  } catch (e) {
    // silent fail 
    console.warn('swapEntryArtworkToShiny:', e);
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  const btn = createButtonContainer();
  await inlineSvg(btn);

  let isOn = false;
  setButtonVisual(btn, isOn);
  updatePageAccent(isOn);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    isOn = !isOn;
    btn.setAttribute('aria-pressed', String(isOn));
    setButtonVisual(btn, isOn);
    updatePageAccent(isOn);

    document.body.classList.toggle('theme-shiny', isOn);

    // swap the entry page artwork immediately 
    swapEntryArtworkToShiny(isOn);

    // dispatch event so headerEntry.js will animate pokeball and set header art
    dispatchToggle(isOn);

    btn.style.transform = 'scale(0.96)';
    setTimeout(() => btn.style.transform = '', 120);
  });
});
