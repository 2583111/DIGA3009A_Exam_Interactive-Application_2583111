document.addEventListener('DOMContentLoaded', () => {
  const svgFolder = '../IMAGES/PokeBallSVG/SVG/'; 
  const fallbackFiles = [
    'PokeBall.svg',
    'GreatBall.svg',
    'UltraBall.svg',
    'MasterBall.svg',
    'LuxuryBall.svg',
    'PremiumBall.svg',
    'DuskBall.svg',
    'CherishBall.svg',
    'QuickBall.svg',
    'LoveBall.svg',
    'LevelBall.svg'
  ];

  const stage = document.getElementById('ballStage');
  if (!stage) { console.error('pokeBallSpin: missing #ballStage'); return; }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let wrappers = [];         // injected wrapper elements
  let current = -1;
  let spinTween = null;
  let morphTimer = null;
  let animLock = false;      // prevents spam-clicks while animating

  // tiny helper to fetch text or null
  async function fetchText(url) {
    try {
      const r = await fetch(encodeURI(url));
      return r.ok ? await r.text() : null;
    } catch { return null; }
  }

  async function tryDirectory() {
    const html = await fetchText(svgFolder);
    if (!html) return null;
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const anchors = Array.from(doc.querySelectorAll('a[href$=".svg"], a[href$=".SVG"]'));
      return Array.from(new Set(anchors.map(a => a.getAttribute('href').split('/').pop()).filter(Boolean)));
    } catch {
      return null;
    }
  }

  function injectSVG(name, text, url) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ball-svg';
    wrapper.setAttribute('data-src', name);
    wrapper.style.position = 'absolute';
    wrapper.style.inset = '0';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.opacity = '0';
    wrapper.innerHTML = text;

    const svg = wrapper.querySelector('svg');
    if (svg) {
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-hidden', 'true');
      if (!svg.hasAttribute('viewBox')) {
        const w = svg.getAttribute('width'), h = svg.getAttribute('height');
        if (w && h) svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      }
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.maxWidth = '90%';
      svg.style.maxHeight = '90%';
      svg.style.display = 'block';
      svg.style.transformOrigin = '50% 50%';
    } else {
      console.warn('pokeBallSpin: file had no <svg> root:', name);
    }

    stage.appendChild(wrapper);
    return wrapper;
  }

  async function loadAll() {
    stage.querySelectorAll('.loading').forEach(n => n.remove());
    let list = await tryDirectory();
    if (!list || !list.length) list = fallbackFiles.slice();

    for (const name of list) {
      const text = await fetchText(svgFolder + name);
      if (text) wrappers.push(injectSVG(name, text, svgFolder + name));
    }

    if (!wrappers.length) {
      stage.innerHTML = '<div class="loading">No SVGs found — check folder & filenames.</div>';
      return;
    }

    // pick a random initial index
    const startIndex = Math.floor(Math.random() * wrappers.length);
    wrappers.forEach((w, i) => {
      w.classList.toggle('visible', i === startIndex);
      w.style.zIndex = i === startIndex ? '2' : '1';
      w.style.opacity = i === startIndex ? '1' : '0';
      if (gsap && i !== startIndex) gsap.set(w, { scale: 0.98 });
    });

    startSpinForIndex(startIndex);
    current = startIndex;

    // auto morph on timer
    scheduleNext();

    // container click -> morph
    stage.addEventListener('click', () => {
      if (!animLock) morphNow();
    });
  }

  function startSpinForIndex(index) {
    if (spinTween) {
      try { spinTween.kill(); } catch {}
      spinTween = null;
    }
    current = index;
    const wrapper = wrappers[index];
    if (!wrapper) return;
    const svg = wrapper.querySelector('svg');
    if (!svg || reduced || typeof gsap === 'undefined') return;
    spinTween = gsap.to(svg, { rotation: 360, duration: 6, ease: 'linear', repeat: -1 });
  }

  // crossfade + pop animations
  function showIndex(target) {
    if (animLock) return;
    if (!wrappers.length) return;
    if (target === current) return;
    const from = wrappers[current];
    const to = wrappers[target];
    if (!from || !to) return;

    animLock = true;
    const tl = gsap.timeline({
      onComplete() { animLock = false; }
    });

    // fade & shrink out old
    tl.to(from, { autoAlpha: 0, scale: 0.96, duration: 0.22, ease: 'power2.in' }, 0);

    // incoming pop
    const svgTo = to.querySelector('svg');
    tl.fromTo(to, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.36, ease: 'back.out(1.4)' }, 0.12);
    if (svgTo) {
      tl.fromTo(svgTo, { scale: 0.88, rotation: -6 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1,0.6)' }, 0.12);
    }

    // quick spin burst on the previous spinTween
    if (spinTween) {
      tl.add(() => {
        try { gsap.to(spinTween, { timeScale: 3, duration: 0.12 }); } catch {}
      }, 0);
      tl.add(() => {
        try { gsap.to(spinTween, { timeScale: 1, duration: 0.6 }); } catch {}
      }, '+=0.9');
    }

    from.classList.remove('visible'); from.style.zIndex = '1';
    to.classList.add('visible'); to.style.zIndex = '2';

    // when animation starts, immediately switch spin to new svg
    tl.add(() => startSpinForIndex(target), 0.06);

    current = target;
  }

  function randomOtherIndex() {
    if (wrappers.length < 2) return 0;
    let next;
    do { next = Math.floor(Math.random() * wrappers.length); } while (next === current && wrappers.length > 1);
    return next;
  }

  function scheduleNext() {
    clearTimeout(morphTimer);
    morphTimer = setTimeout(() => {
      showIndex(randomOtherIndex());
      scheduleNext();
    }, Math.floor(Math.random() * (8000 - 2000)) + 2000);
  }

  function morphNow() {
    if (animLock) return;
    showIndex(randomOtherIndex());
  }

  loadAll();

  window.addEventListener('unload', () => {
    clearTimeout(morphTimer);
    if (spinTween && spinTween.kill) spinTween.kill();
  });
});
