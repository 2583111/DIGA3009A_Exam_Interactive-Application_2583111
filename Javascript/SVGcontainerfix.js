(function () {

  function normalize(text) {
    return (text || '').trim().replace(/\s+/g, ' ');
  }

  function runHeaderFix() {
    const header = document.getElementById('regionHeader');
    if (!header) return;

    const raw = normalize(header.textContent || '');
    if (!raw) {
      header.textContent = 'Pokédex';
      // remove any stray regionName inside
      const existing = document.getElementById('regionName');
      if (existing && existing.parentNode === header) existing.remove();
      return;
    }

    const baseKey = 'pokedex';
    const lower = raw.toLowerCase();

    // if 'pokedex' not found, reset to simple 'Pokédex'
    if (!lower.includes(baseKey)) {
      header.textContent = 'Pokédex';
      return;
    }

    const idx = lower.indexOf(baseKey);
    const after = raw.slice(idx + baseKey.length).trim();

    if (!after) {
      header.textContent = 'Pokédex';
      const existing = document.getElementById('regionName');
      if (existing && existing.parentNode === header) existing.remove();
      return;
    }

    // clean common separators and whitespace
    const cleaned = after.replace(/^[:\-\—\–\s]+/, '').trim();
    if (!cleaned) {
      header.textContent = 'Pokédex';
      const existing = document.getElementById('regionName');
      if (existing && existing.parentNode === header) existing.remove();
      return;
    }

    let span = document.getElementById('regionName');
    if (!span) {
      span = document.createElement('span');
      span.id = 'regionName';
      span.className = 'region-name';
      span.setAttribute('aria-hidden', 'true');
      header.textContent = 'Pokédex';
      header.appendChild(document.createTextNode(' ')); // space separator
      header.appendChild(span);
    } else {
      // ensure header has base Pokédex text 
      if (header.firstChild && header.firstChild.nodeType === Node.TEXT_NODE) {
        // replace first text with "Pokédex"
        header.firstChild.textContent = 'Pokédex';
      } else {
        header.insertBefore(document.createTextNode('Pokédex '), header.firstChild || null);
      }
    }

    span.textContent = cleaned.toUpperCase();
  }


  (function observeHeader() {
    const headerEl = document.getElementById('regionHeader');
    if (!headerEl || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => {
      // schedule fix on next frame (debounced enough for a few rapid changes)
      requestAnimationFrame(runHeaderFix);
    });
    observer.observe(headerEl, { characterData: true, childList: true, subtree: true });

    // disconnect after 4s to avoid long-lived observers
    setTimeout(() => {
      try { observer.disconnect(); } catch (e) {}
    }, 4000);
  })();


  const debounce = (fn, wait = 120) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  function alignGenArtworks() {
    const h1 = document.querySelector('header h1');
    const h2 = document.querySelector('header h2');
    if (!h1 || !h2) return;

    const h1Rect = h1.getBoundingClientRect();
    const h2Rect = h2.getBoundingClientRect();
    // tuned centers 
    const h1CenterX = h1Rect.left + h1Rect.width * 2.9;
    const h2CenterX = h2Rect.left + h2Rect.width / 2;

    const genItems = document.querySelectorAll('.gen-item');
    genItems.forEach((item, idx) => {
      const link = item.querySelector('.gen-link');
      const shape = item.querySelector('.gen-shape');
      const content = item.querySelector('.gen-content');
      if (!link || !shape || !content) return;

      // bounding boxes
      const linkRect = link.getBoundingClientRect();
      const shapeRect = shape.getBoundingClientRect();

      // choose header center per odd/even  
      const targetX = ( (idx % 2) === 0 ) ? h1CenterX : h2CenterX;

      // offset in px to apply inside the link's coordinate space
      const offset = targetX - (linkRect.left + shapeRect.width / 2);

      shape.style.transform = `translate(-50%, -50%) translateX(${Math.round(offset)}px)`;
      content.style.transform = `translate(-50%, -50%) translateX(${Math.round(offset)}px)`;
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    // fix header as early as possible
    runHeaderFix();

    setTimeout(alignGenArtworks, 80);

    window.addEventListener('load', () => {
      // run header fix one more time in case something appended after DOMContentLoaded
      runHeaderFix();
      setTimeout(alignGenArtworks, 120);
    });
  });

  // handles resize
  window.addEventListener('resize', debounce(alignGenArtworks, 120));

  window.alignGenArtworks = alignGenArtworks;
})();
