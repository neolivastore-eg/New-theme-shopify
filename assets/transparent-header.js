'use strict';
/*
 * HOME-01 transparent overlay header. The header section is in the native Shopify
 * header group; its old sticky wrapper was constrained by that group.
 * CSS fixes the header to the viewport, and this controller keeps it below
 * any visible announcement bar while controlling the translucent surface. The existing
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
    const initialTop = host.style.getPropertyValue('--nl-header-top');
    const announcement = document.querySelector('.announcement-bar');
    const initialSurface = header.style.getPropertyValue('--nl-header-surface-opacity');
    const initialScrolled = header.classList.contains('nl-header--scrolled');
    const distance = Math.max(60, Number(header.dataset.homeScrollDistance) || 160);
    const clamp = x => Math.max(0, Math.min(1, x));

    function render() {
      frame = 0;
      if (!active || !header.isConnected || !banner.isConnected) return;
      // The top announcement is allowed to scroll away. Once it is gone,
      // the fixed header remains at the viewport top for the entire page.
      const scroll = Math.max(0, window.scrollY || window.pageYOffset || 0);
      // Computed against the viewport every time, even after resizing, scrolling
      // back upward, or editing the announcement content in Shopify.
      const announcementBottom = announcement?.isConnected ? announcement.getBoundingClientRect().bottom : 0;
      host.style.setProperty('--nl-header-top', Math.max(0, announcementBottom).toFixed(2) + 'px');
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
      if (initialTop) host.style.setProperty('--nl-header-top', initialTop);
      else host.style.removeProperty('--nl-header-top');
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
