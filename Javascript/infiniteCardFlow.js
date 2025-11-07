(() => {
  document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(Draggable); 

    const COVERS = [
      "https://pkmncards.com/wp-content/uploads/en_US-SWSH10-TG012-hoothoot.jpg",
      "https://pkmncards.com/wp-content/uploads/sv1_en_117-1.jpg",
      "https://www.pokemon.com/static-assets/content-assets/cms2/img/cards/web/ME01/ME01_EN_185.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_34-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_38-2x.png",
      "https://www.pokemon.com/static-assets/content-assets/cms2/img/cards/web/ME01/ME01_EN_150.png",
      "https://www.pokemon.com/static-assets/content-assets/cms2/img/cards/web/ME01/ME01_EN_177.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_4.png",
      "https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/mep/5/",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/MEP/MEP_EN_9.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/MEP/MEP_EN_10.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/MEP/MEP_EN_12.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_22.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_14.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_13.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_27.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/XYA/XYA_EN_28a.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_34.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_72-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_207-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_245-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_248-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_247-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_244-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_225-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_220-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_216-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_204-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_201-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_57-2x.png",
      "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_2-2x.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_44.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_54.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_52.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_58.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_69.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_67.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_65.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_74.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_79.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_80.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_81.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_89.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_110.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/XYA/XYA_EN_107a.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_175.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_186.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_188.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_189.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_194.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_196.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_204.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_212.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_210.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_209.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SVP/SVP_EN_213.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/BWP/BWP_EN_BW05.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/BWP/BWP_EN_BW04.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/BWP/BWP_EN_BW24.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/BWP/BWP_EN_BW31.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/BWP/BWP_EN_BW20.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/BWP/BWP_EN_BW21.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/BWP/BWP_EN_BW22.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/ZSV10PT5/ZSV10PT5_EN_137.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/ZSV10PT5/ZSV10PT5_EN_59.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/XYP/XYP_EN_XY25.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SM1/SM1_EN_85.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/BW6/BW6_EN_127.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/BW9/BW9_EN_70.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SWSH12/SWSH12_EN_113.png",
      "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SWSH4/SWSH4_EN_109.png"

    ];

    const MAX_VISIBLE = 11;
    function sampleArray(arr, n) {
      const a = arr.slice(); 
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a.slice(0, n);
    }

    const SELECTED = sampleArray(COVERS, Math.min(MAX_VISIBLE, COVERS.length));

    const wrap = document.querySelector('.infinite-card-flow') || document.body;
    let boxesContainer = wrap.querySelector('.boxes');
    if (!boxesContainer) {
      boxesContainer = document.createElement('div');
      boxesContainer.className = 'boxes';
      wrap.appendChild(boxesContainer);
      const proxy = document.createElement('div');
      proxy.className = 'drag-proxy';
      proxy.setAttribute('aria-hidden', 'true');
      boxesContainer.appendChild(proxy);
    }

    // clear any existing boxes 
    boxesContainer.querySelectorAll('.box').forEach(n => n.remove());

    // populate boxes and set images
    const COUNT = SELECTED.length;
    for (let i = 0; i < COUNT; i++) {
      const box = document.createElement('div');
      box.className = 'box';
      box.style.setProperty('--img', `url("${SELECTED[i]}")`);

      // accessible fallback image 
      const img = document.createElement('img');
      img.src = SELECTED[i];
      img.alt = `Cover ${i + 1}`;
      img.loading = 'lazy';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain'; // ensures fallback image also fits
      img.style.opacity = '0';
      img.style.pointerEvents = 'none';
      box.appendChild(img);

      boxesContainer.appendChild(box);
    }

    // show boxes and initial set
    gsap.set('.infinite-card-flow .box', { yPercent: -50, display: 'block' });

    const STAGGER = 0.1;
    const DURATION = 1;    
    const OFFSET = 0;
    const BOXES = gsap.utils.toArray('.infinite-card-flow .box');

    // build the looping timeline for each box 
    const LOOP = gsap.timeline({ paused: true, repeat: -1, ease: 'none' });
    const SHIFTS = [...BOXES, ...BOXES, ...BOXES];

    SHIFTS.forEach((BOX, index) => {
      const BOX_TL = gsap.timeline()
        .set(BOX, { xPercent: 250, rotateY: -50, opacity: 0, scale: 0.5 })
        .to(BOX, { opacity: 1, scale: 1, duration: 0.1 }, 0)
        .to(BOX, { opacity: 0, scale: 0.5, duration: 0.1 }, 0.9)
        .fromTo(BOX, { xPercent: 250 }, { xPercent: -350, duration: 1, immediateRender: false, ease: 'power1.inOut' }, 0)
        .fromTo(BOX, { rotateY: -50 }, { rotateY: 50, immediateRender: false, duration: 1, ease: 'power4.inOut' }, 0)
        .to(BOX, { z: 100, scale: 1.25, duration: 0.1, repeat: 1, yoyo: true }, 0.4)
        .fromTo(BOX, { zIndex: 1 }, { zIndex: BOXES.length, repeat: 1, yoyo: true, ease: 'none', duration: 0.5 }, 0);

      LOOP.add(BOX_TL, index * STAGGER);
    });

    // cycle math
    const CYCLE_DURATION = STAGGER * BOXES.length;
    const START_TIME = CYCLE_DURATION + DURATION * 0.5 + OFFSET;

    const LOOP_HEAD = gsap.fromTo(
      LOOP,
      { totalTime: START_TIME },
      {
        totalTime: `+=${CYCLE_DURATION}`,
        duration: 1,
        ease: 'none',
        repeat: -1,
        paused: true,
      }
    );

    const PLAYHEAD = { position: START_TIME }; 
    const POSITION_WRAP = gsap.utils.wrap(0, LOOP_HEAD.duration());

    const SCRUB = gsap.to(PLAYHEAD, {
      position: PLAYHEAD.position,
      onUpdate: () => {
        LOOP_HEAD.totalTime(POSITION_WRAP(PLAYHEAD.position));
      },
      paused: true,
      duration: 0.25,
      ease: 'power3',
    });

    const wrappedProgress = () => POSITION_WRAP(PLAYHEAD.position) / LOOP_HEAD.duration();

    // clicking a box snaps to that index
    boxesContainer.addEventListener('click', e => {
      const BOX = e.target.closest('.box');
      if (!BOX) return;
      const TARGET = BOXES.indexOf(BOX);
      const currentIndex = Math.floor(wrappedProgress() * BOXES.length);
      let BUMP = TARGET - currentIndex;
      if (TARGET > currentIndex && TARGET - currentIndex > BOXES.length * 0.5) BUMP = (BOXES.length - BUMP) * -1;
      if (currentIndex > TARGET && currentIndex - TARGET > BOXES.length * 0.5) BUMP = BOXES.length + BUMP;

      const perBox = LOOP_HEAD.duration() / BOXES.length;
      SCRUB.vars.position = PLAYHEAD.position + BUMP * perBox;
      SCRUB.invalidate().restart();
    });

    // draggable for mouse/touch drag
    Draggable.create('.drag-proxy', {
      type: 'x',
      trigger: '.infinite-card-flow',
      onPress() { this.startOffset = PLAYHEAD.position; },
      onDrag() {
        // sensitivity multiplier
        const mul = 0.0028;
        SCRUB.vars.position = this.startOffset + (this.startX - this.x) * mul;
        SCRUB.invalidate().restart();
      },
      onDragEnd() {  },
    });

    const container = document.querySelector('.infinite-card-flow-container');
    if (container) {
      container.addEventListener('wheel', e => {
        if (e.deltaY === 0) return;
        e.preventDefault(); 
        const delta = e.deltaY;
        const wheelMul = 0.004; 
        SCRUB.vars.position = PLAYHEAD.position + delta * wheelMul;
        SCRUB.invalidate().restart();
      }, { passive: false });

      let touchStartX = null;
      let touchStartPos = null;
      container.addEventListener('touchstart', e => {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX; // use X for horizontal-like control
        touchStartPos = PLAYHEAD.position;
      }, { passive: true });

      container.addEventListener('touchmove', e => {
        if (!touchStartX || e.touches.length !== 1) return;
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const dx = touchX - touchStartX;
        const touchMul = 0.015; // sensitivity for touch
        SCRUB.vars.position = touchStartPos - dx * touchMul;
        SCRUB.invalidate().restart();
      }, { passive: false });

      container.addEventListener('touchend', () => {
        touchStartX = null;
        touchStartPos = null;
      });
    }

    // debugging
    window.BOXES = BOXES;
    window._CAROUSEL_PLAYHEAD = PLAYHEAD;
  });
})();
