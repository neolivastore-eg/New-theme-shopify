'use strict';
/*
 * HOME-01: scroll-driven FLIP-style logo docking.
 * The source card is semantic HTML in the hero. A visual-only copy is placed
 * above the page and interpolated toward the real header brand target.
 * The header's actual home link becomes visible at the end of the journey.
 * No external runtime, Shopify API calls, forced scrolling, or timers.
 */
(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let teardown = () => {};

  function initialize() {
    teardown();
    teardown = () => {};
    const banner = document.querySelector('[data-logo-banner][data-logo-dock="true"]');
    const source = banner?.querySelector('[data-logo-dock-source]');
    const header = document.querySelector('[data-site-header].site-header--sticky');
    const target = header?.querySelector('[data-logo-dock-target]');
    if (!banner || !source || !header || !target || mq.matches) return;

    // The Shopify header section wrapper, not merely its inner header,
    // must be sticky so the dock stays visible as the page scrolls.
    const stickyHost = header.closest('.shopify-section');
    if (stickyHost) stickyHost.classList.add('nl-logo-dock-sticky-host');

    const floating = source.cloneNode(true);
    floating.classList.add('nl-logo-dock-floating');
    floating.classList.remove('nl-logo-banner__brand-frame');
    floating.setAttribute('aria-hidden', 'true');
    floating.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    floating.querySelectorAll('[tabindex]').forEach(node => node.removeAttribute('tabindex'));
    document.body.appendChild(floating);

    // Do not place a duplicate semantic heading or a second interactive logo
    // in the accessibility tree. The real header link is still the only link.
    const originalTabIndex = target.getAttribute('tabindex');
    let frame = 0;
    let isActive = true;
    const startPercent = Math.max(0, Math.min(70, Number(banner.dataset.logoDockStart) || 0)) / 100;
    const endPercent = Math.max(startPercent + 0.1, Math.min(100, Number(banner.dataset.logoDockEnd) || 80) / 100);
    const clamp = value => Math.min(1, Math.max(0, value));
    // Gentle S easing: still continuously controlled by scroll, fully reversible.
    const ease = t => t * t * (3 - 2 * t);

    function paint() {
      frame = 0;
      if (!isActive || !banner.isConnected || !header.isConnected || !target.isConnected) return;
      if (mq.matches) { teardown(); teardown=()=>{}; return; }

      const currentScroll = window.scrollY || window.pageYOffset || 0;
      const bannerTop = currentScroll + banner.getBoundingClientRect().top;
      const distance = Math.max(banner.offsetHeight, 1);
      const from = bannerTop + distance * startPercent;
      const to = bannerTop + distance * endPercent;
      const raw = clamp((currentScroll - from) / Math.max(1, to - from));
      const p = ease(raw);

      const origin = source.getBoundingClientRect();
      const destination = target.getBoundingClientRect();
      if (!origin.width || !origin.height || !destination.width || !destination.height) return;

      // Capture the source's viewport rectangle at the moment docking starts.
      // Otherwise the moving document would pull the logo off-screen mid-scroll.
      const originX = origin.left;
      const originY = origin.top + Math.max(0, currentScroll - from);
      const scale = Math.min(
        1,
        Math.max(0.08, Math.min(destination.width / origin.width, destination.height / origin.height))
      );
      const targetX = destination.left + (destination.width - origin.width * scale) / 2;
      const targetY = destination.top + (destination.height - origin.height * scale) / 2;
      const x = originX + (targetX - originX) * p;
      const y = originY + (targetY - originY) * p;
      const zoom = 1 + (scale - 1) * p;

      floating.style.width = origin.width + 'px';
      floating.style.height = origin.height + 'px';
      floating.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + zoom.toFixed(4) + ')';
      // First 7%: hand off from the source. Last 14%: hand off to the header.
      const sourceAlpha = 1 - clamp(raw / 0.07);
      const headerAlpha = clamp((raw - 0.86) / 0.14);
      source.style.opacity = String(sourceAlpha);
      floating.style.opacity = String(Math.min(1, (1 - sourceAlpha) * (1 - headerAlpha)));
      floating.hidden = raw <= 0 || raw >= 1;
      target.style.opacity = String(headerAlpha);
      target.style.pointerEvents = headerAlpha > 0.9 ? '' : 'none';
      if (headerAlpha >= 0.9) {
        if (originalTabIndex === null) target.removeAttribute('tabindex');
        else target.setAttribute('tabindex', originalTabIndex);
      } else {
        target.setAttribute('tabindex', '-1');
      }
    }

    function schedule() {
      if (!frame && isActive) frame = window.requestAnimationFrame(paint);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    document.addEventListener('shopify:section:reorder', schedule);

    teardown = () => {
      isActive = false;
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      document.removeEventListener('shopify:section:reorder', schedule);
      floating.remove();
      source.style.opacity = '';
      target.style.opacity = '';
      target.style.pointerEvents = '';
      if (originalTabIndex === null) target.removeAttribute('tabindex');
      else target.setAttribute('tabindex', originalTabIndex);
      stickyHost?.classList.remove('nl-logo-dock-sticky-host');
    };
    schedule();
  }

  document.addEventListener('shopify:section:load', initialize);
  document.addEventListener('shopify:section:unload', () => {
    teardown();
    teardown = () => {};
    window.requestAnimationFrame(initialize);
  });
  if (mq.addEventListener) mq.addEventListener('change', initialize);
  else mq.addListener(initialize);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
