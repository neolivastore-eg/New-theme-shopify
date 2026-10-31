'use strict';
/*
 * NEOLIVA HOME-01 v0.8.7 — one image, one scale and one trajectory.
 * The browser's rendered image rectangles are the only geometry sources.
 * The image never changes its own width/height ratio during scroll.
 *
 * Shopify Theme Editor re-renders sections without a page load. A design-mode
 * scrubber and play control let merchants inspect every frame even when the
 * editor inspector forces the preview back to a selected section.
 */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = t => t * t * (3 - 2 * t);
  let cleanup = () => {};

  function init() {
    cleanup();
    cleanup = () => {};
    const banner = document.querySelector('[data-logo-banner][data-logo-dock="true"]');
    const frame = banner?.querySelector('[data-logo-dock-source]');
    const header = document.querySelector('[data-site-header].site-header--sticky');
    const headerLink = header?.querySelector('[data-logo-dock-target]');
    if (!banner || !frame || !header || !headerLink) return;

    const sourceImage = frame.querySelector('.nl-logo-banner__brand-image');
    const headerImage = headerLink.querySelector('.site-header__logo');
    const imageOnly = banner.classList.contains('nl-logo-banner--image-only') && sourceImage && headerImage;
    const source = imageOnly ? sourceImage : frame;
    const destination = imageOnly ? headerImage : headerLink;
    const original = {
      sourceOpacity:frame.style.opacity, opacity:headerLink.style.opacity,
      pointerEvents:headerLink.style.pointerEvents, tabIndex:headerLink.getAttribute('tabindex')
    };
    const startFraction = clamp(Number(banner.dataset.logoDockStart ?? 10) / 100);
    const endFraction = clamp(Number(banner.dataset.logoDockEnd ?? 80) / 100);
    const floating = source.cloneNode(true);
    floating.classList.add('nl-logo-dock-floating');
    if (imageOnly) {
      floating.classList.add('nl-logo-dock-image');
      floating.removeAttribute('srcset');
      floating.removeAttribute('sizes');
      floating.src = source.currentSrc || source.src;
      floating.removeAttribute('srcset');
      floating.style.maxWidth = 'none';
      floating.style.maxHeight = 'none';
      floating.alt = '';
    } else {
      floating.classList.add('nl-logo-dock-card');
      const style = getComputedStyle(frame);
      floating.style.backgroundColor = style.backgroundColor;
      floating.style.color = style.color;
      floating.style.boxShadow = style.boxShadow;
      floating.style.padding = style.padding;
      floating.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    }
    floating.setAttribute('aria-hidden','true');
    floating.hidden = true;
    document.body.appendChild(floating);

    let active = true;
    let frameId = 0;
    let playerId = 0;
    let forcedProgress = null;
    let editor = null;
    let scrub = null;
    let output = null;
    let play = null;
    let reset = null;

    function pageScroll() {
      return Math.max(0, window.scrollY || 0, document.scrollingElement?.scrollTop || 0);
    }

    function calculateRaw() {
      const scroll = pageScroll();
      const rect = banner.getBoundingClientRect();
      const heroTop = rect.top + scroll;
      const start = heroTop + Math.max(1,banner.offsetHeight) * startFraction;
      const finish = Math.max(start+120,heroTop+Math.max(1,banner.offsetHeight)*endFraction);
      return {scroll,start,raw:clamp((scroll-start)/(finish-start))};
    }

    function render() {
      frameId = 0;
      if (!active || !source.isConnected || !destination.isConnected || !banner.isConnected) return;
      const motion = calculateRaw();
      const raw = forcedProgress === null ? motion.raw : forcedProgress;
      const src = source.getBoundingClientRect();
      const dst = destination.getBoundingClientRect();
      if (src.width <= 0 || src.height <= 0 || dst.width <= 0 || dst.height <= 0) return;

      // A real image's painted viewport rectangle is the source of truth.
      // The target is centered inside the header image rectangle with a single
      // uniform scale, never a width/height or object-fit morph.
      const targetScale = Math.min(1, dst.width/src.width, dst.height/src.height);
      const p = smooth(raw);
      const scale = 1 + (targetScale-1)*p;
      const fromX = src.left;
      const fromY = forcedProgress === null
        ? src.top + motion.scroll - motion.start
        : src.top;
      const toX = dst.left + (dst.width-src.width*targetScale)/2;
      const toY = dst.top + (dst.height-src.height*targetScale)/2;
      const x = fromX + (toX-fromX)*p;
      const y = fromY + (toY-fromY)*p;

      floating.style.width = src.width.toFixed(3)+'px';
      floating.style.height = src.height.toFixed(3)+'px';
      floating.style.transform = 'translate3d('+x.toFixed(3)+'px,'+y.toFixed(3)+'px,0) scale('+scale.toFixed(6)+')';

      const begun = raw > .0005;
      const finished = raw >= .9995;
      const handoff = clamp((raw-.96)/.04);
      frame.style.opacity = begun ? '0':'1';
      floating.hidden = !begun || finished || reduced.matches;
      floating.style.opacity = String(1-handoff);
      headerLink.style.opacity = String(reduced.matches ? 1 : handoff);
      headerLink.style.pointerEvents = handoff >= .995 || reduced.matches ? original.pointerEvents : 'none';
      if (handoff >= .995 || reduced.matches) {
        if (original.tabIndex === null) headerLink.removeAttribute('tabindex');
        else headerLink.setAttribute('tabindex',original.tabIndex);
      } else headerLink.setAttribute('tabindex','-1');
      // Read-only DOM diagnostics for browser regression tests.
      banner.dataset.logoDockProgress = raw.toFixed(4);
      floating.dataset.logoDockProgress = raw.toFixed(4);
      if (editor && forcedProgress === null) scrub.value = String(Math.round(raw*100));
      if (output) output.textContent = String(Math.round(raw*100))+'%';
    }

    function schedule() {
      if (active && !frameId) frameId = requestAnimationFrame(render);
    }
    function cancelPlay() {
      if (playerId) cancelAnimationFrame(playerId);
      playerId = 0;
    }
    function onScroll() {
      if (forcedProgress !== null) { forcedProgress=null; cancelPlay(); }
      schedule();
    }

    if (window.Shopify?.designMode === true) {
      // This is part of the Shopify preview only, never the public storefront.
      editor = document.createElement('aside');
      editor.className='nl-logo-dock-editor';
      editor.setAttribute('role','group');
      editor.setAttribute('aria-label','Logo animation preview');
      const caption=document.createElement('label');
      caption.textContent='Logo animation preview';
      scrub=document.createElement('input');
      scrub.type='range'; scrub.min='0'; scrub.max='100'; scrub.step='1';
      scrub.value='0'; scrub.setAttribute('aria-label','Logo dock progress');
      output=document.createElement('output'); output.textContent='0%';
      play=document.createElement('button'); play.type='button'; play.textContent='Play';
      reset=document.createElement('button'); reset.type='button'; reset.textContent='Use scroll';
      editor.append(caption,scrub,output,play,reset);
      document.body.appendChild(editor);
      scrub.addEventListener('input',()=>{cancelPlay();forcedProgress=clamp(Number(scrub.value)/100);schedule();});
      reset.addEventListener('click',()=>{cancelPlay();forcedProgress=null;schedule();});
      play.addEventListener('click',()=>{
        cancelPlay();
        let begunAt=null;
        forcedProgress=0;
        const tick=now=>{
          if (!active || forcedProgress===null) return;
          if (begunAt===null) begunAt=now;
          forcedProgress=clamp((now-begunAt)/1600);
          scrub.value=String(Math.round(forcedProgress*100));
          render();
          if (forcedProgress<1) playerId=requestAnimationFrame(tick);
          else playerId=0;
        };
        playerId=requestAnimationFrame(tick);
      });
    }

    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',schedule,{passive:true});
    document.addEventListener('shopify:section:reorder',schedule);
    document.addEventListener('shopify:section:select',schedule);
    document.addEventListener('shopify:inspector:activate',schedule);
    document.addEventListener('shopify:inspector:deactivate',schedule);
    if (source.tagName==='IMG') source.addEventListener('load',schedule);
    if (destination.tagName==='IMG') destination.addEventListener('load',schedule);
    cleanup=()=>{
      active=false;
      cancelPlay();
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener('scroll',onScroll);
      window.removeEventListener('resize',schedule);
      window.removeEventListener('orientationchange',schedule);
      document.removeEventListener('shopify:section:reorder',schedule);
      document.removeEventListener('shopify:section:select',schedule);
      document.removeEventListener('shopify:inspector:activate',schedule);
      document.removeEventListener('shopify:inspector:deactivate',schedule);
      if (source.tagName==='IMG') source.removeEventListener('load',schedule);
      if (destination.tagName==='IMG') destination.removeEventListener('load',schedule);
      floating.remove();
      editor?.remove();
      frame.style.opacity=original.sourceOpacity;
      headerLink.style.opacity=original.opacity;
      headerLink.style.pointerEvents=original.pointerEvents;
      if (original.tabIndex===null) headerLink.removeAttribute('tabindex');
      else headerLink.setAttribute('tabindex',original.tabIndex);
      delete banner.dataset.logoDockProgress;
    };
    schedule();
  }
  document.addEventListener('shopify:section:load',init);
  document.addEventListener('shopify:section:unload',()=>{
    cleanup(); cleanup=()=>{};
    requestAnimationFrame(init);
  });
  if (reduced.addEventListener) reduced.addEventListener('change',init);
  else reduced.addListener(init);
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
