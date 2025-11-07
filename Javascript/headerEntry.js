const POKEBALL_SRC = '../IMAGES/PokeBallSVG/512px-Poké_Ball_icon.png';
const SVG_VB_W = 1400;
const SVG_VB_H = 48;

function ensureHeaderMarkup() {
  let wrapper = document.querySelector('.sub-header-wrap');
  if (wrapper) {
    if (!wrapper.querySelector('.sub-header-inner')) wrapper.appendChild(createInnerNode());
    if (!wrapper.querySelector('.header-center')) {
      const center = document.createElement('span');
      center.className = 'header-center';
      center.setAttribute('aria-hidden', 'true');
      const pwrap = document.createElement('div');
      pwrap.className = 'header-pokemon-wrap';
      center.appendChild(pwrap);
      wrapper.appendChild(center);
    } else {
      // ensure header-pokemon-wrap exists inside .header-center
      const center = wrapper.querySelector('.header-center');
      if (!center.querySelector('.header-pokemon-wrap')) {
        const pwrap = document.createElement('div');
        pwrap.className = 'header-pokemon-wrap';
        center.appendChild(pwrap);
      }
    }
    return wrapper;
  }

  const main = document.querySelector('main') || document.body;
  wrapper = document.createElement('div');
  wrapper.className = 'sub-header-wrap';
  wrapper.setAttribute('aria-hidden', 'false');

  // inner overlay + center container
  wrapper.appendChild(createInnerNode());

  const center = document.createElement('span');
  center.className = 'header-center';
  center.setAttribute('aria-hidden', 'true');
  const pwrap = document.createElement('div');
  pwrap.className = 'header-pokemon-wrap';
  center.appendChild(pwrap);
  wrapper.appendChild(center);

  // insert at top of main so it sits above hero
  if (main.firstElementChild) main.insertBefore(wrapper, main.firstElementChild);
  else main.appendChild(wrapper);

  return wrapper;
}

function createInnerNode() {
  const inner = document.createElement('div');
  inner.className = 'sub-header-inner';
  inner.id = 'entryHeaderInner';
  inner.setAttribute('role', 'banner');
  inner.setAttribute('aria-label', 'Pokémon header');

  const left = document.createElement('span');
  left.className = 'pokemon-name';
  left.id = 'pokemonNameText';
  left.innerHTML = `<span class="text-bg" data-text="—">—</span>`;

  const right = document.createElement('span');
  right.className = 'pokedex-number';
  right.id = 'pokedexNumber';
  right.innerHTML = `<span class="text-bg" data-text="#000">#000</span>`;

  inner.appendChild(left);
  const spacer = document.createElement('span');
  spacer.className = 'header-center-spacer';
  spacer.style.width = 'var(--circle-diameter)';
  inner.appendChild(spacer);
  inner.appendChild(right);

  return inner;
}

function buildHeaderSVGIfMissing() {
  const wrapper = document.querySelector('.sub-header-wrap');
  if (!wrapper) return null;
  if (wrapper.querySelector('svg.sub-header-svg')) return wrapper.querySelector('svg.sub-header-svg');

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'sub-header-svg');
  svg.setAttribute('viewBox', `0 0 ${SVG_VB_W} ${SVG_VB_H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  svg.setAttribute('style', 'color:var(--header-accent);');

  const inset = 0;
  const nsRect = document.createElementNS(ns, 'rect'); 

  const VB_W = SVG_VB_W;
  const VB_H = SVG_VB_H;
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

  const rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('x', String(inset + 6));
  rect.setAttribute('y', String(inset + 6));
  rect.setAttribute('width', String(VB_W - (inset + 6) * 2));
  rect.setAttribute('height', String(VB_H - (inset + 6) * 2));
  rect.setAttribute('rx', String(Math.round(VB_H * 0.06)));
  rect.setAttribute('ry', String(Math.round(VB_H * 0.06)));
  rect.setAttribute('fill', 'none');          
  rect.setAttribute('stroke', 'currentColor');
  rect.setAttribute('stroke-width', String(strokeW));
  rect.setAttribute('vector-effect', 'non-scaling-stroke');
  rect.setAttribute('mask', `url(#${maskId})`);
  svg.appendChild(rect);

  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', String(VB_W / 2));
  circle.setAttribute('cy', String(VB_H / 2));
  circle.setAttribute('r', String(circleR));
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', 'currentColor');
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

  wrapper.insertBefore(svg, wrapper.firstChild);
  wrapper.classList.remove('no-svg');

  return svg;
}

function fitHeaderWrapperToCss() {
  const wrapper = document.querySelector('.sub-header-wrap');
  if (!wrapper) return;
  const comp = getComputedStyle(wrapper);
  const h = parseFloat(comp.height) || 36;
  wrapper.style.height = `${h}px`;
  document.documentElement.style.setProperty('--sub-header-height', `${h}px`);
}

/* ensures pokeball produced for standard reveal is positioned absolutely for reliable transforms */
function createPokeballEl() {
  const wrapper = document.querySelector('.sub-header-wrap');
  if (!wrapper) return null;
  let el = wrapper.querySelector('.header-pokeball');
  if (el) return el;
  el = document.createElement('img');
  el.className = 'header-pokeball';
  el.src = POKEBALL_SRC;
  el.alt = '';
  el.style.position = 'absolute';
  el.style.left = '-160px';
  el.style.top = '50%';
  el.style.transform = 'translateY(-50%)';
  el.style.width = '70px';
  el.style.height = '70px';
  el.style.zIndex = '120';
  wrapper.appendChild(el);
  return el;
}

/* create a temporary pokeball from the right for shiny-on */
function createPokeballElFromRight(shiny = false) {
  const wrapper = document.querySelector('.sub-header-wrap');
  if (!wrapper) return null;
  const el = document.createElement('img');
  el.className = 'header-pokeball header-pokeball--temp';
  el.src = POKEBALL_SRC;
  el.alt = '';
  el.style.position = 'absolute';
  el.style.left = `${window.innerWidth + 120}px`;
  el.style.top = '50%';
  el.style.transform = 'translateY(-50%)';
  el.style.width = '70px';
  el.style.height = '70px';
  el.style.zIndex = '120';
  if (shiny) {
    el.style.filter = 'sepia(0.6) saturate(1.9) hue-rotate(15deg) brightness(1.05)';
  }
  wrapper.appendChild(el);
  return el;
}

function getHeaderImageNode() {
  const wrap = document.querySelector('.header-center .header-pokemon-wrap');
  if (!wrap) return null;
  let img = wrap.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    img.alt = 'Pokémon';
    img.style.opacity = '0';
    img.style.transform = 'scale(0.78)';
    wrap.appendChild(img);
  }
  return img;
}

function centerCoordsOfHeaderCenter() {
  const centerEl = document.querySelector('.header-center');
  if (!centerEl) {
    const wrapper = document.querySelector('.sub-header-wrap');
    if (!wrapper) return { x: window.innerWidth / 2, y: window.innerHeight * 0.12 };
    const rect = wrapper.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  const r = centerEl.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function populateHeaderText(poke) {
  const nameEl = document.getElementById('pokemonNameText');
  const numEl = document.getElementById('pokedexNumber');
  if (!poke) {
    if (nameEl) nameEl.innerHTML = `<span class="text-bg" data-text="—">—</span>`;
    if (numEl) numEl.innerHTML = `<span class="text-bg" data-text="#000">#000</span>`;
    return;
  }
  const rawName = String(poke.name || '').replace(/-/g, ' ').toUpperCase();
  const paddedNum = `#${String(poke.id || '').padStart(3, '0')}`;

  if (nameEl) {
    nameEl.innerHTML = `<span class="text-bg" data-text="${escapeAttr(rawName)}">${rawName}</span>`;
  }
  if (numEl) {
    numEl.innerHTML = `<span class="text-bg" data-text="${escapeAttr(paddedNum)}">${paddedNum}</span>`;
  }
}

function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function revealPokemonThroughAnimation(poke) {
  populateHeaderText(poke);

  const mainArt = document.getElementById('artwork');
  if (mainArt) {
    mainArt.style.visibility = 'hidden';
    mainArt.setAttribute('aria-hidden', 'true');
  }

  const imgNode = getHeaderImageNode();
  const pokeball = createPokeballEl();
  const artUrl = poke?.sprites?.other?.['official-artwork']?.front_default || poke?.sprites?.front_default || '';

  if (!pokeball) return;
  if (!window.gsap) {
    if (imgNode) {
      imgNode.src = artUrl;
      imgNode.style.transform = 'scale(1)';
      imgNode.style.opacity = '1';
    }
    try { pokeball.remove(); } catch (e) {}
    return;
  }

  const center = centerCoordsOfHeaderCenter();
  const pRect = pokeball.getBoundingClientRect();
  const dx = center.x - (pRect.left + pRect.width / 2);
  const dy = center.y - (pRect.top + pRect.height / 2);

  const tl = gsap.timeline();

  tl.to(pokeball, { duration: 0.92, x: dx, y: dy, rotation: 720, ease: 'power2.inOut' })
    .to(pokeball, { duration: 0.38, scale: 1.35, ease: 'back.out(1.6)' }, '-=0.12')
    .call(() => {
      if (imgNode) imgNode.src = artUrl;
    })
    .to(imgNode, { duration: 0.48, opacity: 1, scale: 1, ease: 'back.out(1.4)' }, '-=0.12')
    .to(pokeball, {
      duration: 0.35,
      opacity: 0,
      scale: 0.8,
      ease: 'power2.out',
      onComplete() { try { pokeball.remove(); } catch (e) {} }
    }, '-=0.22');
}

/* animate a pokeball from the RIGHT to the center */
function animatePokeballFromRightThenSetHeader(poke, shinyUrl) {
  const imgNode = (function getHeaderImageNode() {
    const wrap = document.querySelector('.header-center .header-pokemon-wrap');
    if (!wrap) return null;
    return wrap.querySelector('img');
  })();


  const pokeball = createPokeballElFromRight(true);
  if (!pokeball) {
    if (imgNode && shinyUrl) imgNode.src = shinyUrl;
    return;
  }

  if (!window.gsap) {
    if (imgNode && shinyUrl) imgNode.src = shinyUrl;
    try { pokeball.remove(); } catch (e) {}
    return;
  }

  const center = centerCoordsOfHeaderCenter();
  const pRect = pokeball.getBoundingClientRect();
  const dx = center.x - (pRect.left + pRect.width / 2);
  const dy = center.y - (pRect.top + pRect.height / 2);

  const tl = gsap.timeline();
  tl.to(pokeball, { duration: 0.92, x: dx, y: dy, rotation: -720, ease: 'power2.inOut' })
    .to(pokeball, { duration: 0.36, scale: 1.35, ease: 'back.out(1.4)' }, '-=0.12')
    .call(() => {
      if (imgNode && shinyUrl) imgNode.src = shinyUrl;
    })
    .to(imgNode || {}, { duration: 0.36, opacity: 1, scale: 1, ease: 'back.out(1.4)' }, '-=0.12')
    .to(pokeball, {
      duration: 0.32,
      opacity: 0,
      scale: 0.8,
      ease: 'power2.out',
      onComplete() { try { pokeball.remove(); } catch (e) {} }
    }, '-=0.18');
}

function syncHeaderSvgAppearance(isShinyOn) {
  const svg = document.querySelector('svg.sub-header-svg');
  if (!svg) return;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--header-accent')?.trim() || '';
  if (accent) svg.style.color = accent;

  const visibleRect = svg.querySelector('rect[stroke]');
  if (visibleRect) visibleRect.setAttribute('fill', isShinyOn ? 'currentColor' : 'none');

  const centerClear = svg.querySelector('circle[stroke="none"]');
  if (centerClear) {
    const pageBg = getComputedStyle(document.documentElement).getPropertyValue('--page-bg')?.trim() || '#0f0f0f';
    centerClear.setAttribute('fill', pageBg);
  }

  const circle = svg.querySelector('circle[stroke="currentColor"], circle[stroke]');
  if (circle) circle.setAttribute('stroke', 'currentColor');
}

document.addEventListener('DOMContentLoaded', () => {
  ensureHeaderMarkup();
  buildHeaderSVGIfMissing();
  fitHeaderWrapperToCss();

  window.addEventListener('resize', () => fitHeaderWrapperToCss());

  document.addEventListener('pokeLoaded', (ev) => {
    const poke = ev?.detail?.poke;
    if (!poke) return;
    populateHeaderText(poke);
    revealPokemonThroughAnimation(poke);
  });
});

document.addEventListener('shinyToggle', (ev) => {
  const on = !!(ev && ev.detail && ev.detail.on);
  const poke = window.POKEPORTAL_CURRENT_POKE || null;
  const imgNode = (function getHeaderImageNode() {
    const wrap = document.querySelector('.header-center .header-pokemon-wrap');
    if (!wrap) return null;
    return wrap.querySelector('img');
  })();
  if (!imgNode) return;

  try { syncHeaderSvgAppearance(on); } catch (e) { console.warn(e); }

  if (on && poke && poke._shinyUrl) {
    // animate shiny pokeball from right to center, then set the header image to shiny
    animatePokeballFromRightThenSetHeader(poke, poke._shinyUrl);
    document.querySelector('.sub-header-wrap')?.classList.add('header-shiny');
  } else if (!on && poke) {
    // play the standard left->center reveal animation (same as page load) and revert art to normal
    // revealPokemonThroughAnimation will set the header art to the normal art on completion
    revealPokemonThroughAnimation(poke);
    document.querySelector('.sub-header-wrap')?.classList.remove('header-shiny');
  }
});
