(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const link = document.getElementById('backToRegions');
    if (!link) return;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    if (!window.gsap) return;

    try {
      if (link._hoverTl) {
        link._hoverTl.kill();
        link._hoverTl = null;
      }

      const tl = gsap.timeline({ paused: true, repeat: -1, yoyo: true });
      tl.to(link, { x: 12, scale: 1.04, duration: 0.6, ease: 'sine.inOut' }, 0);
      tl.to(link, { color: '#D4FCAC', duration: 0.6, ease: 'sine.inOut' }, 0);

      link._hoverTl = tl;

      const playLoop = () => { if (!link._hoverTl.isActive()) link._hoverTl.play(); };
      const stopLoop = () => {
        if (link._hoverTl) link._hoverTl.pause();
        gsap.to(link, { x:0, scale:1, color:'#5daec8', duration:0.18, ease:'power2.out' });
      };

      link.addEventListener('pointerenter', playLoop);
      link.addEventListener('pointerleave', stopLoop);
      link.addEventListener('focus', playLoop);
      link.addEventListener('blur', stopLoop);

      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          gsap.fromTo(link, { scale: 1.06 }, { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' });
        }
      });

      function cleanup() {
        try {
          if (link._hoverTl) { link._hoverTl.kill(); link._hoverTl = null; }
          link.removeEventListener('pointerenter', playLoop);
          link.removeEventListener('pointerleave', stopLoop);
          link.removeEventListener('focus', playLoop);
          link.removeEventListener('blur', stopLoop);
        } catch (e) {}
      }
      window.addEventListener('pagehide', cleanup);
      window.addEventListener('beforeunload', cleanup);
    } catch (err) {
      console.warn('backLink animation failed:', err);
    }
  });
})();
