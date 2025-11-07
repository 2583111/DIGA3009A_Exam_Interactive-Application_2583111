
import { fetchPokemonDetails, PLACEHOLDER, capitalize } from './pokedexFetch.js';

const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function qs(sel) { return document.querySelector(sel); }
function setText(sel, txt) { const el = qs(sel); if (el) el.textContent = txt; }

function getQueryName() {
  const params = new URLSearchParams(location.search);
  return params.get('name') || params.get('id') || '';
}

async function fetchEvolutionSprites(evoChainUrl, signal) {
  try {
    const res = await fetch(evoChainUrl, { signal });
    if (!res.ok) return [];
    const json = await res.json();

    const names = [];
    let node = json.chain;
    while (node) {
      if (node.species && node.species.name) names.push(node.species.name);
      node = (node.evolves_to && node.evolves_to[0]) ? node.evolves_to[0] : null;
    }

    const results = await Promise.all(names.map(n =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(n)}`, { signal })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    )) ;

    return results.filter(Boolean).map(r => ({ name: r.name, sprite: r.sprites?.front_default }));
  } catch (e) {
    return [];
  }
}

/* ---------- Helpers to update header SVG fills when shiny toggles ---------- */
function updateHeaderSvgForShiny(isOn) {
  const svg = document.querySelector('svg.sub-header-svg');
  if (!svg) return;

  // Update svg color 
  const headerAccent = getComputedStyle(document.documentElement).getPropertyValue('--header-accent')?.trim() || '';
  if (headerAccent) svg.style.color = headerAccent;

  const visibleRect = svg.querySelector('rect[stroke]'); 
  if (visibleRect) {
    // When shiny ON: fill the bar with currentColor so the bar becomes the accent color.
    // When OFF: revert to transparent fill (keep stroke only).
    visibleRect.setAttribute('fill', isOn ? 'currentColor' : 'none');
  }

  const centerClear = svg.querySelector('circle[stroke="none"]');
  if (centerClear) {
    const pageBg = getComputedStyle(document.documentElement).getPropertyValue('--page-bg')?.trim() || '#0f0f0f';
    centerClear.setAttribute('fill', pageBg);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const query = getQueryName();
  if (!query) {
    setText('#flavorText', 'Open this page from the Pokédex list (click a Pokémon).');
    return;
  }

  const artwork = qs('#artwork'); 
  const nameEl = qs('#name');     
  const idEl = qs('#id');

  const infoTypeEl = qs('#infoType');
  const infoAbilitiesEl = qs('#infoAbilities');
  const infoHeightEl = qs('#infoHeight');
  const infoWeightEl = qs('#infoWeight');

  const infoBaseExpEl = qs('#infoBaseExp');
  const infoHPEl = qs('#infoHP');
  const infoAttackEl = qs('#infoAttack');
  const infoDefenseEl = qs('#infoDefense');

  const flavorEl = qs('#flavorText');
  const evoListEl = qs('#evoList');

  const header = qs('.site-header');
  if (header && !qs('.back-btn')) {
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.type = 'button';
    backBtn.textContent = '← Back';
    backBtn.addEventListener('click', () => {
      if (history.length > 1) history.back();
      else window.location.href = 'index.html';
    });
    header.appendChild(backBtn);
  }

  // abort controller for cleanup
  const controller = new AbortController();
  const { signal } = controller;
  window.addEventListener('beforeunload', () => controller.abort());
  window.addEventListener('pagehide', () => controller.abort());

  try {
    setText('#flavorText', 'Loading entry…');

    const { poke, species } = await fetchPokemonDetails(query, signal);

    try {
      const artUrl = poke?.sprites?.other?.['official-artwork']?.front_default || poke?.sprites?.front_default || '';
      const shinyCandidates = [
        poke?.sprites?.front_shiny,
        poke?.sprites?.other?.['official-artwork']?.front_shiny,
        poke?.sprites?.other?.home?.front_shiny,
        poke?.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_shiny
      ];
      const shinyUrl = shinyCandidates.find(u => !!u) || '';

      // attach
      poke._artUrl = artUrl || '';
      poke._shinyUrl = shinyUrl || '';

      window.POKEPORTAL_CURRENT_POKE = poke;

      if (artwork) {
        if (!artwork.dataset.original) artwork.dataset.original = artwork.src || '';
        if (poke._shinyUrl) artwork.dataset.shiny = poke._shinyUrl;
      }
    } catch (e) {
      console.warn('Failed to attach _artUrl/_shinyUrl to poke:', e);
    }

    document.dispatchEvent(new CustomEvent('pokeLoaded', { detail: { poke, species } }));

    // populate dynamic info fields from the fetched "poke" object
    // types
    if (infoTypeEl) {
      const typesArr = Array.isArray(poke.types) ? poke.types.map(t => capitalize(t.type?.name || '')) : [];
      infoTypeEl.textContent = typesArr.length ? typesArr.join(', ') : '—';
    }

    // abilities (mark hidden abilities)
    if (infoAbilitiesEl) {
      const abArr = Array.isArray(poke.abilities)
        ? poke.abilities.map(a => {
            const name = capitalize(a.ability?.name || '');
            return a.is_hidden ? `${name} (Hidden)` : name;
          })
        : [];
      infoAbilitiesEl.textContent = abArr.length ? abArr.join(', ') : '—';
    }

    // height 
    if (infoHeightEl) {
      if (typeof poke.height === 'number') {
        infoHeightEl.textContent = `${(poke.height / 10).toFixed(1)} m`;
      } else infoHeightEl.textContent = '—';
    }

    // weight 
    if (infoWeightEl) {
      if (typeof poke.weight === 'number') {
        infoWeightEl.textContent = `${(poke.weight / 10).toFixed(1)} kg`;
      } else infoWeightEl.textContent = '—';
    }

    // base experience
    if (infoBaseExpEl) infoBaseExpEl.textContent = poke.base_experience ?? '—';

    // stats
    if (infoHPEl) infoHPEl.textContent = poke.stats?.find(s => s.stat?.name === 'hp')?.base_stat ?? '—';
    if (infoAttackEl) infoAttackEl.textContent = poke.stats?.find(s => s.stat?.name === 'attack')?.base_stat ?? '—';
    if (infoDefenseEl) infoDefenseEl.textContent = poke.stats?.find(s => s.stat?.name === 'defense')?.base_stat ?? '—';

    // POKÉDEX ENTRY
    flavorEl.innerHTML = '';
    if (species && Array.isArray(species.flavor_text_entries)) {
      const enEntries = species.flavor_text_entries
        .filter(e => e.language?.name === 'en')
        .map(e => ({ version: e.version?.name || '', text: e.flavor_text.replace(/\f|\n|\r/g, ' ').trim() }));

      const byVersion = new Map();
      for (const e of enEntries) if (!byVersion.has(e.version)) byVersion.set(e.version, e.text);

      const seen = new Set();
      const finalEntries = [];
      for (const [version, text] of byVersion.entries()) {
        if (seen.has(text)) continue;
        seen.add(text);
        finalEntries.push({ version, text });
        if (finalEntries.length >= 6) break;
      }

      if (!finalEntries.length) flavorEl.textContent = 'No Pokédex entry available.';
      else {
        for (const e of finalEntries) {
          const wrap = document.createElement('div');
          wrap.className = 'flavor-entry';
          const ver = document.createElement('div');
          ver.className = 'flavor-version';
          ver.textContent = (e.version || '').replace(/-/g, ' ').toUpperCase();
          const txt = document.createElement('div');
          txt.className = 'flavor-text';
          txt.textContent = e.text;
          wrap.appendChild(ver);
          wrap.appendChild(txt);
          flavorEl.appendChild(wrap);
        }
      }
    } else {
      flavorEl.textContent = 'No Pokédex entry available.';
    }

    // EVOLUTION CHAIN
    evoListEl.textContent = 'Loading evolutions…';
    if (species?.evolution_chain?.url) {
      const evo = await fetchEvolutionSprites(species.evolution_chain.url, signal);
      if (!evo.length) {
        evoListEl.textContent = 'No evolution data found.';
      } else {
        evoListEl.innerHTML = '';

        const currentName = (poke.name || '').toLowerCase();

        evo.forEach(s => {
          const isCurrent = String(s.name || '').toLowerCase() === currentName;

          const el = document.createElement('div');
          el.className = 'evo-item';
          if (isCurrent) el.classList.add('current');

          el.setAttribute('tabindex', '0'); 
          el.innerHTML = `
            <img src="${s.sprite || PLACEHOLDER}" alt="${s.name}" />
            <div class="evo-name">${(s.name || '').toUpperCase()}</div>
          `;

          // click navigates to that pokemon
          el.addEventListener('click', () => {
            if (isCurrent) return;
            window.location.href = `${location.pathname}?name=${encodeURIComponent(s.name)}`;
          });

          el.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              el.click();
            }
          });

          // hover pulse animation 
          if (window.gsap && !prefersReduced) {
            el.addEventListener('pointerenter', () => {
              if (el._hoverTl && el._hoverTl.isActive && el._hoverTl.isActive()) return;
              const tl = gsap.timeline({ repeat: -1, yoyo: true });
              tl.to(el, { scale: 1.06, duration: 0.42, ease: 'sine.inOut' }, 0);
              const img = el.querySelector('img');
              if (img) tl.to(img, { scale: 1.08, duration: 0.42, ease: 'sine.inOut' }, 0);
              el._hoverTl = tl;
            });

            el.addEventListener('pointerleave', () => {
              if (el._hoverTl) {
                try { el._hoverTl.kill(); } catch (e) {}
                el._hoverTl = null;
              }
              gsap.to(el, { scale: 1, duration: 0.18, ease: 'power2.out' });
              const img = el.querySelector('img');
              if (img) gsap.to(img, { scale: 1, duration: 0.18, ease: 'power2.out' });
            });

            el.addEventListener('focus', () => el.dispatchEvent(new PointerEvent('pointerenter')));
            el.addEventListener('blur',  () => el.dispatchEvent(new PointerEvent('pointerleave')));
          }

          evoListEl.appendChild(el);
        });
      }
    } else {
      evoListEl.textContent = 'No evolution chain available.';
    }

    // entrance animation for page blocks
    if (window.gsap && !prefersReduced) {
      try {
        gsap.from('.hero, .blue-card', { y: 14, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' });
      } catch (e) {  }
    }

  } catch (err) {
    console.error(err);
    setText('#flavorText', err.message || 'Failed to load Pokémon.');
  }
});

document.addEventListener('shinyToggle', (ev) => {
  const on = !!(ev && ev.detail && ev.detail.on);

  try {
    updateHeaderSvgForShiny(on);
  } catch (e) {
    console.warn('updateHeaderSvgForShiny failed', e);
  }

  try {
    const art = document.getElementById('artwork');
    if (art) {
      if (on && art.dataset.shiny) {
        art.src = art.dataset.shiny;
      } else if (!on && art.dataset.original) {
        art.src = art.dataset.original;
      }
    }
  } catch (e) {  }
});
