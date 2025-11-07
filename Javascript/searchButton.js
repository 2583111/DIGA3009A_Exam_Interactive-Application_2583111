(function () {
  const GAP_PX = 80;         
  const RIGHT_FALLBACK = 18; 
  const VIEWPORT_PADDING = 12;

  const search = document.getElementById('searchBtn');

  // nothing to do without a search button
  if (!search) return;

  // always keep fixed-right value from CSS
  search.style.right = RIGHT_FALLBACK + 'px';
  search.style.left = 'auto';
  search.style.position = 'fixed';
  // ensure search can receive clicks
  search.style.pointerEvents = 'auto';

  // requestAnimationFrame debounce
  let raf = null;
  function scheduleUpdate() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      placeSearchUnderBurger();
      raf = null;
    });
  }

  function placeSearchUnderBurger() {
    const burger = document.getElementById('menuButton');

    if (!burger) {

      if (search.hasAttribute('data-js-top')) {
        search.style.top = '';
        search.removeAttribute('data-js-top');
      }
      return;
    }

    try {
      if (!burger.style.zIndex) burger.style.zIndex = '2000';
      if (!search.style.zIndex) search.style.zIndex = '1000';
    } catch (e) {  }

    const bRect = burger.getBoundingClientRect();

    if ((bRect.width === 0 && bRect.height === 0) || Number.isNaN(bRect.bottom)) {
      if (search.hasAttribute('data-js-top')) {
        search.style.top = '';
        search.removeAttribute('data-js-top');
      }
      return;
    }

    const desiredTop = Math.round(bRect.bottom + GAP_PX);

    const searchHeight = (search.offsetHeight && Number.isFinite(search.offsetHeight)) ? search.offsetHeight : 44;

    const maxTop = Math.max(VIEWPORT_PADDING, window.innerHeight - searchHeight - VIEWPORT_PADDING);
    let finalTop = Math.min(desiredTop, maxTop);

    if (finalTop <= (bRect.bottom - 4)) {
      finalTop = Math.min(bRect.bottom + GAP_PX + 8, maxTop);
    }

    search.style.top = finalTop + 'px';
    search.setAttribute('data-js-top', '1');
  }

  window.addEventListener('DOMContentLoaded', () => {
    placeSearchUnderBurger();
    setTimeout(placeSearchUnderBurger, 120);
  });

  window.addEventListener('load', placeSearchUnderBurger);
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });

  window.placeSearchUnderBurger = placeSearchUnderBurger;
})();