(function initialiseBurgerMenu() {
  const menuItems = [
    { name: "HOME", href: "../index.html" },
    { name: "TCG", href: "../Pokemon Card Page/index.html" },
    { name: "POKEDEX", href: "../Pokedex Page/index.html" },
  ];

  const btn = document.getElementById("menuButton");
  const top = document.getElementById("barTop");
  const mid = document.getElementById("barMid");
  const bot = document.getElementById("barBottom");
  if (!btn || !top || !mid || !bot) return;

  const hasGSAP = !!window.gsap;
  const hasMorph = !!window.MorphSVGPlugin;
  try { if (hasGSAP && hasMorph) gsap.registerPlugin(MorphSVGPlugin); } catch(e){}

  // create single overlay
  let overlay = document.querySelector('.menu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="menu-overlay-inner">
        <nav class="overlay-nav" role="navigation" aria-label="Site menu">
          <ul class="overlay-list" role="menu"></ul>
        </nav>
        <div class="overlay-spacer" aria-hidden="true"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const ul = overlay.querySelector('.overlay-list');

  // helper: compare file name of current page to link href
  function getFilenameFromPath(p) {
    try {
      return p.split('/').filter(Boolean).pop() || '';
    } catch (e) { return ''; }
  }
  const currentFile = getFilenameFromPath(location.pathname) || 'index.html';

  // populate links 
  ul.innerHTML = '';
  for (const item of menuItems) {
    const li = document.createElement('li');
    li.setAttribute('role','none');

    const a = document.createElement('a');
    a.className = 'overlay-link';
    a.setAttribute('role','menuitem');
    a.href = item.href;
    a.tabIndex = -1;
    a.textContent = item.name;


    a.style.color = '#5daec8';


    try {
      const resolved = new URL(item.href, location.href);
      const file = getFilenameFromPath(resolved.pathname);
      if (file && file === currentFile) {
        a.classList.add('active');

        a.style.fontFamily = `"Protest Strike", "Oswald", system-ui, sans-serif`;
        a.style.color = '#5daec8'; 
      }
    } catch(e) {

    }

    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      closeMenu();
      // small delay so user sees the overlay fade
      setTimeout(() => { window.location.href = item.href; }, 220);
    });

    li.appendChild(a);
    ul.appendChild(li);
  }

  // burger morph
  const initTop = "M4 6 L20 6";
  const initMid = "M4 12 L20 12";
  const initBot = "M4 18 L20 18";
  const hoverMid = "M8 12 L20 12";
  const crossTop = "M6 6 L18 18";
  const crossMid = "M12 12 L12 12";
  const crossBot = "M6 18 L18 6";

  const DUR_HOVER = 0.22, DUR_CLICK = 0.32;
  let isOpen = false;
  let escHandler = null;

  // helper animate overlay
  function showOverlay(opacity = 0.9) {
    overlay.style.pointerEvents = 'auto';
    overlay.setAttribute('aria-hidden','false');
    if (hasGSAP) {
      try {
        gsap.killTweensOf(overlay);
        gsap.to(overlay, { opacity: opacity, duration: 0.28, ease: 'power1.out' });
        // slide nav in from left a touch
        const nav = overlay.querySelector('.overlay-nav');
        gsap.set(nav, { x: -24, autoAlpha: 0 });
        gsap.to(nav, { x: 0, autoAlpha: 1, duration: 0.44, ease: 'power3.out', delay: 0.06, stagger: 0.04 });
        return;
      } catch(e){}
    }
    overlay.style.opacity = String(opacity);
    const nav = overlay.querySelector('.overlay-nav');
    nav.style.transform = 'translateX(0)';
    nav.style.opacity = '1';
  }

  function hideOverlay() {
    overlay.style.pointerEvents = 'none';
    overlay.setAttribute('aria-hidden','true');
    if (hasGSAP) {
      try {
        gsap.killTweensOf(overlay);
        gsap.to(overlay, { opacity: 0, duration: 0.26, ease: 'power1.in' });
        const nav = overlay.querySelector('.overlay-nav');
        gsap.to(nav, { x: -12, autoAlpha: 0, duration: 0.24, ease: 'power1.in' });
        return;
      } catch(e){}
    }
    overlay.style.opacity = '0';
    overlay.querySelector('.overlay-nav').style.opacity = '0';
  }

  // burger hover
  btn.addEventListener('pointerenter', () => {
    if (isOpen) return;
    if (hasGSAP && hasMorph) {
      try { gsap.to(mid, { duration: DUR_HOVER, morphSVG: hoverMid, ease: 'power2.inOut' }); return; } catch(e){}
    }
    if (hasGSAP) gsap.to(mid, { duration: DUR_HOVER, x: 2, ease: 'power2.inOut' });
  });
  btn.addEventListener('pointerleave', () => {
    if (isOpen) return;
    if (hasGSAP && hasMorph) {
      try { gsap.to(mid, { duration: DUR_HOVER, morphSVG: initMid, ease: 'power2.inOut' }); return; } catch(e){}
    }
    if (hasGSAP) gsap.to(mid, { duration: DUR_HOVER, x: 0, ease: 'power2.inOut' });
  });

  function openMenu() {
    isOpen = true;
    btn.dataset.open = 'true';
    // morph to cross
    if (hasGSAP && hasMorph) {
      try {
        gsap.to(top, { duration: DUR_CLICK, morphSVG: crossTop, ease: 'power2.inOut' });
        gsap.to(mid, { duration: DUR_CLICK, morphSVG: crossMid, ease: 'power2.inOut' });
        gsap.to(bot, { duration: DUR_CLICK, morphSVG: crossBot, ease: 'power2.inOut' });
      } catch(e) {
        if (hasGSAP) gsap.to([top, mid, bot], { rotation: 45, duration: DUR_CLICK });
      }
    } else if (hasGSAP) {
      gsap.to([top, mid, bot], { rotation: 45, duration: DUR_CLICK });
    }
    if (hasGSAP) gsap.to([top, mid, bot], { stroke: "#d33", duration: DUR_CLICK * 0.7 });

    showOverlay(0.9);

    setTimeout(() => {
      const first = overlay.querySelector('.overlay-link');
      if (first) first.focus();
    }, 320);

    escHandler = (e) => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('keydown', escHandler);
  }

  function closeMenu() {
    isOpen = false;
    btn.dataset.open = 'false';
    if (hasGSAP && hasMorph) {
      try {
        gsap.to(top, { duration: DUR_CLICK, morphSVG: initTop, ease: 'power2.inOut' });
        gsap.to(mid, { duration: DUR_CLICK, morphSVG: initMid, ease: 'power2.inOut' });
        gsap.to(bot, { duration: DUR_CLICK, morphSVG: initBot, ease: 'power2.inOut' });
      } catch(e) {
        if (hasGSAP) gsap.to([top, mid, bot], { rotation: 0, duration: DUR_CLICK });
      }
    } else if (hasGSAP) {
      gsap.to([top, mid, bot], { rotation: 0, duration: DUR_CLICK });
    }
    if (hasGSAP) gsap.to([top, mid, bot], { stroke: "#5daec8", duration: DUR_CLICK * 0.7 });

    hideOverlay();

    if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null; }
  }

  btn.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (isOpen) closeMenu(); else openMenu();
  });

  overlay.addEventListener('pointerdown', (ev) => {
    const nav = overlay.querySelector('.overlay-nav');
    if (nav && nav.contains(ev.target)) return;
    closeMenu();
  });

  // set initial appearance
  if (hasGSAP) gsap.set(overlay, { opacity: 0 });
  else overlay.style.opacity = '0';

  //  debugging
  window.__pokeBurger = { openMenu, closeMenu, toggle: () => isOpen ? closeMenu() : openMenu() };

})();
