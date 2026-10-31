'use strict';
/* Shopify predictive search: optional enhancement, form submit remains native. */
(() => {
  const selectors = '[data-predictive-search]';
  const timers = new WeakMap();
  const controllers = new WeakMap();

  function close(form) {
    const results = form.querySelector('[data-predictive-results]');
    const input = form.querySelector('[data-predictive-input]');
    if (results) { results.hidden = true; results.replaceChildren(); }
    if (input) input.setAttribute('aria-expanded', 'false');
  }

  async function search(form, term) {
    controllers.get(form)?.abort();
    const controller = new AbortController();
    controllers.set(form, controller);
    const input = form.querySelector('[data-predictive-input]');
    const results = form.querySelector('[data-predictive-results]');
    const endpoint = form.dataset.predictiveUrl;
    if (!endpoint || !input || !results || !term.trim()) { close(form); return; }
    try {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set('q', term.trim());
      url.searchParams.set('resources[type]', 'product');
      url.searchParams.set('resources[limit]', '6');
      url.searchParams.set('section_id', 'predictive-search');
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { 'Accept': 'text/html' }
      });
      if (!response.ok) throw new Error('Predictive search unavailable');
      const markup = new DOMParser().parseFromString(await response.text(), 'text/html');
      const body = markup.querySelector('[data-predictive-result-body]');
      if (controller.signal.aborted || input.value.trim() !== term.trim()) return;
      results.replaceChildren();
      if (body) {
        results.appendChild(document.importNode(body, true));
        results.hidden = false;
        input.setAttribute('aria-expanded', 'true');
      } else { close(form); }
    } catch (error) {
      if (error.name !== 'AbortError') close(form);
    }
  }

  document.addEventListener('input', (event) => {
    const input = event.target;
    if (!(input instanceof Element) || !input.matches('[data-predictive-input]')) return;
    const form = input.closest(selectors);
    if (!form) return;
    clearTimeout(timers.get(form));
    controllers.get(form)?.abort();
    const term = input.value.trim();
    if (term.length < 2) { close(form); return; }
    timers.set(form, setTimeout(() => search(form, term), 220));
  });

  document.addEventListener('keydown', (event) => {
    const form = event.target instanceof Element ? event.target.closest(selectors) : null;
    if (!form) return;
    const input = form.querySelector('[data-predictive-input]');
    const panel = form.querySelector('[data-predictive-results]');
    if (!input || !panel || panel.hidden) return;
    const links = Array.from(panel.querySelectorAll('a[href]'));
    if (event.key === 'Escape') {
      close(form);
      input.focus();
      event.preventDefault();
    } else if (event.key === 'ArrowDown' && links.length) {
      event.preventDefault();
      const i = links.indexOf(document.activeElement);
      links[(i + 1) % links.length].focus();
    } else if (event.key === 'ArrowUp' && links.length) {
      event.preventDefault();
      const i = links.indexOf(document.activeElement);
      (i <= 0 ? input : links[i - 1]).focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    document.querySelectorAll(selectors).forEach((form) => {
      if (!form.contains(event.target)) close(form);
    });
  });
  document.addEventListener('shopify:section:unload', (event) => {
    event.target?.querySelectorAll(selectors).forEach((form) => {
      clearTimeout(timers.get(form));
      controllers.get(form)?.abort();
    });
  });
})();
