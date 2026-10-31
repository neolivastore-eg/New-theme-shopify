'use strict';
document.documentElement.classList.add('js');
document.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  if (target.matches('[data-submit-on-change]')) {
    target.form?.requestSubmit();
    return;
  }

  const selector = target.closest('[data-variant-selector]');
  if (!selector) return;
  const container = selector.closest('[data-product-form-root]');
  if (!container) return;
  const selected = selector.options[selector.selectedIndex];
  if (!selected) return;

  const price = container.querySelector('[data-product-price]');
  if (price && selected.dataset.price) price.textContent = selected.dataset.price;
  const button = container.querySelector('[data-add-to-cart]');
  if (button) button.disabled = selected.disabled;

  if (selected.value) {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', selected.value);
    window.history.replaceState({}, '', url.toString());
  }
});
