'use strict';
/*
 * HOME-01 transparent overlay header. The header section is in the native Shopify
 * header group; CSS overlays it on the first homepage section. This controller
 * only changes the translucent surface as the document scrolls. The existing
 * logo-dock.js is responsible for the separate scroll-to-header logo motion.
 */
(() => {
  let dispose = () => {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init() {
    dispose();
    dispose = () => {};

    const banner = document.querySelector('[data-logo-banner]');
    const header = document.querySelector('[data-site-header].site-header--home-overlay');
    const host = header?.closest('.shopify-section');
    // Other pages, disabled sticky headers, and pages without HOME-01 stay solid.
    if (!banner || !header || !host) return;

    host.classList.add('nl-home-overlay-host');
    let frame = 0;
    let active = true;
    const initialStyle = host.style.getPropertyValue('--nl-overlay-header-height');
    const initialSurface = header.style.getPropertyValue('--nl-header-surface-opacity');
    const initialScrolled = header.classList.contains('nl-header--scrolled');
    const distance = Math.max(60, Number(header.dataset.homeScrollDistance) || 160);
    const clamp = x => Math.max(0, Math.min(1, x));

    function render() {
      frame = 0;
      if (!active || !header.isConnected || !banner.isConnected) return;
      // The banner can begin below an announcement strip. The header always
      // uses real viewport coordinates for sticky positioning.
      const scroll = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const menuOpen = Boolean(header.querySelector('details[open]'));
      const opacity = menuOpen ? 1 : reducedMotion.matches ? (scroll > 2 ? 1 : 0) : clamp(scroll / distance);
      header.style.setProperty('--nl-header-surface-opacity', opacity.toFixed(3));
      header.classList.toggle('nl-header--scrolled', scroll > 2);
    }

    function schedule() {
      if (!frame && active) frame = window.requestAnimationFrame(render);
    }

    function measure() {
      if (!active) return;
      host.style.setProperty('--nl-overlay-header-height', header.getBoundingClientRect().height + 'px');
      schedule();
    }

    // Keep both header and dropdown backgrounds legible while a menu is open.
    function onToggle() { schedule(); }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('orientationchange', measure, { passive: true });
    header.addEventListener('toggle', onToggle, true);
    header.addEventListener('click', schedule);
    document.addEventListener('shopify:section:reorder', measure);
    measure();
    dispose = () => {
      active = false;
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      header.removeEventListener('toggle', onToggle, true);
      header.removeEventListener('click', schedule);
      document.removeEventListener('shopify:section:reorder', measure);
      if (initialStyle) host.style.setProperty('--nl-overlay-header-height', initialStyle);
      else host.style.removeProperty('--nl-overlay-header-height');
      if (initialSurface) header.style.setProperty('--nl-header-surface-opacity', initialSurface);
      else header.style.removeProperty('--nl-header-surface-opacity');
      header.classList.toggle('nl-header--scrolled', initialScrolled);
      host.classList.remove('nl-home-overlay-host');
    };
  }

  document.addEventListener('shopify:section:load', init);
  document.addEventListener('shopify:section:unload', () => {
    dispose(); dispose = () => {};
    window.requestAnimationFrame(init);
  });
  document.addEventListener('shopify:section:reorder', init);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', init);
  else reducedMotion.addListener(init);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
