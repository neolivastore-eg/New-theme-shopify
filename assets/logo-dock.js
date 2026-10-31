'use strict';
/*
 * HOME-01 natural scroll-to-header morph.
 *
 * When the merchant enables image-only mode, animate the exact SAME <img>
 * rather than scaling a large layout box around the image. Both the start
 * position and end position are measured from the painted images. There is
 * only ONE uniform scale and ONE transform per frame: no width/height tween,
 * object-fit morph, distorted aspect ratio, or sticky-header interference.
 */
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let teardown = () => {};
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = t => t * t * (3 - 2 * t);

  function setup() {
    teardown();
    teardown = () => {};

    const banner = document.querySelector('[data-logo-banner][data-logo-dock="true"]');
    const sourceFrame = banner?.querySelector('[data-logo-dock-source]');
    const header = document.querySelector('[data-site-header].site-header--sticky');
    const targetLink = header?.querySelector('[data-logo-dock-target]');
    if (!banner || !sourceFrame || !header || !targetLink || motion.matches) return;

    const imageOnly = banner.classList.contains('nl-logo-banner--image-only');
    const sourceImage = sourceFrame.querySelector('.nl-logo-banner__brand-image');
    const headerImage = targetLink.querySelector('.site-header__logo');
    const useImage = imageOnly && sourceImage && headerImage;
    // Image-only mode: visual copy is the IMAGE, not its surrounding div/h1.
    // If a merchant later switches back to a card, keep the card fallback.
    const source = useImage ? sourceImage : sourceFrame;
    const destination = useImage ? headerImage : targetLink;
    const floating = source.cloneNode(true);
    floating.classList.add('nl-logo-dock-floating');
    if (useImage) {
      floating.classList.add('nl-logo-dock-image');
      floating.removeAttribute('sizes');
      floating.removeAttribute('srcset');
      floating.setAttribute('alt', '');
      floating.setAttribute('aria-hidden', 'true');
      // Natural logo aspect ratio is preserved. Do not inherit the target's
      // object-fit/max-height constraints while it is in transit.
      floating.style.maxWidth = 'none';
      floating.style.maxHeight = 'none';
    } else {
      floating.classList.add('nl-logo-dock-card');
      const styles = window.getComputedStyle(sourceFrame);
      floating.style.backgroundColor = styles.backgroundColor;
      floating.style.color = styles.color;
      floating.style.boxShadow = styles.boxShadow;
      floating.style.padding = styles.padding;
      floating.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      floating.querySelectorAll('[tabindex]').forEach(node => node.removeAttribute('tabindex'));
    }
    floating.setAttribute('aria-hidden', 'true');
    floating.hidden = true;
    document.body.appendChild(floating);

    const originalTabIndex = targetLink.getAttribute('tabindex');
    const originalPointerEvents = targetLink.style.pointerEvents;
    const originalOpacity = targetLink.style.opacity;
    const originalSourceOpacity = sourceFrame.style.opacity;
    let raf = 0;
    let active = true;
    const startFraction = Math.max(0, Math.min(.7, Number(banner.dataset.logoDockStart || 10) / 100));
    const endFraction = Math.max(startFraction + .1, Math.min(1, Number(banner.dataset.logoDockEnd || 80) / 100));

    function paint() {
      raf = 0;
      if (!active || !banner.isConnected || !source.isConnected || !destination.isConnected) return;
      const scroll = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const top = banner.getBoundingClientRect().top + scroll;
      const height = Math.max(1, banner.offsetHeight);
      const start = top + height * startFraction;
      const finish = top + height * endFraction;
      const raw = clamp((scroll - start) / Math.max(1, finish - start));
      const t = ease(raw);

      // Source remains in normal document flow; its *document* coordinates are
      // stable when scrolling, so snapshot its viewport location at 'start'.
      // Header logo is fixed to the viewport and can move if the announcement
      // bar is still onscreen; read its true coordinates each frame.
      const src = source.getBoundingClientRect();
      const dst = destination.getBoundingClientRect();
      if (!src.width || !src.height || !dst.width || !dst.height) return;

      const sourceX = src.left;
      const sourceY = src.top + scroll - start;
      const targetScale = clamp(Math.min(dst.width / src.width, dst.height / src.height));
      const minScale = Math.max(.04, targetScale);
      // Geometric (log-space) scale: each equal scroll interval shrinks by a
      // similar *percentage*, rather than squeezing most change into the end.
      const scale = Math.exp(Math.log(minScale) * t);
      const targetX = dst.left + (dst.width - src.width * minScale) / 2;
      const targetY = dst.top + (dst.height - src.height * minScale) / 2;
      const x = sourceX + (targetX - sourceX) * t;
      const y = sourceY + (targetY - sourceY) * t;

      floating.style.width = src.width + 'px';
      floating.style.height = src.height + 'px';
      floating.style.transform = 'translate3d(' + x.toFixed(3) + 'px,' + y.toFixed(3) + 'px,0) scale(' + scale.toFixed(6) + ')';

      const started = scroll > start;
      const finished = scroll >= finish;
      sourceFrame.style.opacity = started ? '0' : '1';
      floating.hidden = !started || finished;
      floating.style.opacity = raw > .94 ? String(1 - clamp((raw - .94) / .06)) : '1';
      const headerAlpha = clamp((raw - .94) / .06);
      targetLink.style.opacity = String(headerAlpha);
      targetLink.style.pointerEvents = headerAlpha > .99 ? originalPointerEvents : 'none';
      if (headerAlpha > .99) {
        if (originalTabIndex === null) targetLink.removeAttribute('tabindex');
        else targetLink.setAttribute('tabindex', originalTabIndex);
      } else {
        targetLink.setAttribute('tabindex', '-1');
      }
    }

    function schedule() {
      if (!raf && active) raf = window.requestAnimationFrame(paint);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    document.addEventListener('shopify:section:reorder', schedule);
    if (source.tagName === 'IMG') source.addEventListener('load', schedule);
    if (destination.tagName === 'IMG') destination.addEventListener('load', schedule);

    teardown = () => {
      active = false;
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      document.removeEventListener('shopify:section:reorder', schedule);
      if (source.tagName === 'IMG') source.removeEventListener('load', schedule);
      if (destination.tagName === 'IMG') destination.removeEventListener('load', schedule);
      floating.remove();
      sourceFrame.style.opacity = originalSourceOpacity;
      targetLink.style.opacity = originalOpacity;
      targetLink.style.pointerEvents = originalPointerEvents;
      if (originalTabIndex === null) targetLink.removeAttribute('tabindex');
      else targetLink.setAttribute('tabindex', originalTabIndex);
    };
    schedule();
  }

  document.addEventListener('shopify:section:load', setup);
  document.addEventListener('shopify:section:unload', () => {
    teardown();
    teardown = () => {};
    window.requestAnimationFrame(setup);
  });
  if (motion.addEventListener) motion.addEventListener('change', setup);
  else motion.addListener(setup);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
