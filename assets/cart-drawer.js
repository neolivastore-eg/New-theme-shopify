'use strict';
/* Optional Shopify Ajax cart drawer. The normal cart form remains usable without JS. */
(() => {
  const root = () => window.Shopify?.routes?.root || '/';
  const api = (path) => root().replace(/\\/$/, '/') + path;
  const drawer = document.querySelector('[data-cart-drawer]');
  if (!drawer) return;
  const panel = drawer.querySelector('.cart-drawer__panel');
  const list = drawer.querySelector('[data-cart-drawer-items]');
  const message = drawer.querySelector('[data-cart-message]');
  const subtotal = drawer.querySelector('[data-cart-subtotal]');
  let returnFocus = null;
  let updating = false;
  let cartCache = null;

  function money(value) {
    const currency = cartCache?.currency || drawer.dataset.currency;
    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en', {
        style: 'currency', currency: currency || 'USD'
      }).format((Number(value) || 0) / 100);
    } catch { return ((Number(value) || 0) / 100).toFixed(2); }
  }
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = String(text);
    return el;
  }
  function announce(text) { message.textContent = String(text || ''); }
  function updateCounts(count) {
    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = String(count); });
  }
  function safeProductURL(url) {
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.origin === window.location.origin ? parsed.pathname + parsed.search : drawer.dataset.cartRoute;
    } catch { return drawer.dataset.cartRoute; }
  }
  function safeImageURL(url) {
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.protocol === 'https:' && (parsed.hostname === window.location.hostname || parsed.hostname.endsWith('.shopify.com')) ? parsed.href : '';
    } catch { return ''; }
  }
  function render(cart) {
    cartCache = cart;
    updateCounts(cart.item_count || 0);
    subtotal.textContent = money(cart.total_price);
    list.replaceChildren();
    if (!Array.isArray(cart.items) || !cart.items.length) {
      list.appendChild(node('p','cart-drawer__empty',drawer.dataset.empty));
      return;
    }
    for (const item of cart.items) {
      const row = node('article','cart-drawer__line');
      const mediaLink = node('a','cart-drawer__media');
      mediaLink.href = safeProductURL(item.url);
      const imageUrl = safeImageURL(item.featured_image?.url || item.image);
      if (imageUrl) {
        const image = node('img','cart-drawer__image');
        image.src = imageUrl;
        image.alt = item.title || '';
        image.loading = 'lazy';
        mediaLink.appendChild(image);
      }
      row.appendChild(mediaLink);
      const info = node('div','cart-drawer__line-info');
      const title = node('a','cart-drawer__line-title',item.product_title || item.title);
      title.href = safeProductURL(item.url);
      info.appendChild(title);
      if (item.variant_title && item.variant_title !== 'Default Title')
        info.appendChild(node('span','cart-drawer__line-meta',item.variant_title));
      info.appendChild(node('strong','cart-drawer__line-price',money(item.final_line_price)));
      const controls = node('div','cart-drawer__line-controls');
      const label = node('label','visually-hidden',(drawer.dataset.quantity || 'Quantity') + ' ' + (item.title || ''));
      const qty = node('input','cart-drawer__quantity');
      qty.type = 'number'; qty.min = '0'; qty.step = '1'; qty.value = String(item.quantity);
      qty.dataset.cartLineKey = item.key;
      const id = 'CartDrawerQty-' + Math.random().toString(36).slice(2,10);
      qty.id = id; label.htmlFor = id;
      controls.append(label,qty);
      const remove = node('button','cart-drawer__remove',drawer.dataset.remove || 'Remove');
      remove.type = 'button'; remove.dataset.cartRemoveKey = item.key;
      controls.appendChild(remove);
      info.appendChild(controls); row.appendChild(info); list.appendChild(row);
    }
  }
  async function cartRequest(path,options = {}) {
    const response = await fetch(api(path), {
      ...options,
      credentials:'same-origin',
      headers: { 'Accept': 'application/json', ...(options.headers || {}) }
    });
    const json = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(json.description || json.message || drawer.dataset.error);
    return json;
  }
  async function refresh() {
    const cart = await cartRequest('cart.js');
    render(cart); return cart;
  }
  function close() {
    drawer.hidden = true;
    document.body.classList.remove('cart-drawer-open');
    announce('');
    returnFocus?.focus?.();
  }
  function open() {
    returnFocus = document.activeElement;
    drawer.hidden = false;
    document.body.classList.add('cart-drawer-open');
    panel.focus();
    announce('');
    refresh().catch(error => announce(error.message || drawer.dataset.error));
  }
  document.querySelectorAll('[data-cart-drawer-open]').forEach(button=>{button.hidden=false;button.addEventListener('click',open);});
  document.querySelectorAll('.cart-link--fallback').forEach(link => {link.hidden = true;});
  drawer.querySelectorAll('[data-cart-drawer-close]').forEach(el => el.addEventListener('click',close));
  drawer.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(drawer.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')).filter(el=>!el.hidden);
    if (!focusable.length) { event.preventDefault(); panel.focus(); return; }
    if (event.shiftKey && document.activeElement===focusable[0]) {event.preventDefault();focusable.at(-1).focus();}
    else if (!event.shiftKey && document.activeElement===focusable.at(-1)) {event.preventDefault();focusable[0].focus();}
  });
  async function change(key,quantity) {
    if (updating || !key || !Number.isInteger(quantity) || quantity<0) return;
    updating = true;
    drawer.querySelectorAll('input,button').forEach(el => { el.disabled = true; });
    try {
      const cart = await cartRequest('cart/change.js', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ id:key, quantity })
      });
      render(cart); announce('');
    } catch(error) {
      announce(error.message || drawer.dataset.error);
      try { await refresh(); } catch { /* Last valid cart remains visible. */ }
    } finally {
      updating = false;
      drawer.querySelectorAll('input,button').forEach(el => { el.disabled = false; });
    }
  }
  drawer.addEventListener('change',event=>{
    const input=event.target.closest?.('[data-cart-line-key]');
    if (input) change(input.dataset.cartLineKey,Number(input.value));
  });
  drawer.addEventListener('click',event=>{
    const btn=event.target.closest?.('[data-cart-remove-key]');
    if (btn) change(btn.dataset.cartRemoveKey,0);
  });
  document.addEventListener('submit', async event => {
    const form=event.target;
    if (!(form instanceof HTMLFormElement) || !form.closest('[data-ajax-product-root]')) return;
    const button=form.querySelector('[data-add-to-cart]');
    if (!button || button.disabled || !form.querySelector('input[name=id]')) return;
    event.preventDefault();
    button.disabled=true;
    const status=form.querySelector('[data-cart-add-status]');
    if (status) status.textContent='';
    try {
      await cartRequest('cart/add.js',{method:'POST',body:new FormData(form)});
      button.disabled=false;
      open();
    } catch(error) {
      button.disabled=false;
      if (status) status.textContent=error.message || drawer.dataset.error;
    }
  });
  document.addEventListener('shopify:section:unload',event=>{
    if (event.target?.contains(drawer) && !drawer.hidden) close();
  });
})();
