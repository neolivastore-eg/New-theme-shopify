'use strict';

document.documentElement.classList.add('js');

function enableOptionSelectors(root = document) {
  root.querySelectorAll('[data-option-value-selector]').forEach((selector) => {
    selector.disabled = false;
  });
}

enableOptionSelectors();

document.addEventListener('shopify:section:load', (event) => {
  if (event.target) enableOptionSelectors(event.target);
});

document.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  if (target.matches('[data-submit-on-change]')) {
    target.form?.requestSubmit();
    return;
  }

  const selector = target.closest('[data-option-value-selector]');
  if (!selector) return;

  const root = selector.closest('[data-product-root]');
  if (!root) return;

  const selectors = Array.from(root.querySelectorAll('[data-option-value-selector]'));
  const ids = selectors.map((entry) => entry.value);
  if (!ids.length || ids.some((value) => !value)) return;

  const selected = selector.selectedOptions[0];
  const productUrl = selected?.dataset.productUrl || root.dataset.productUrl;
  if (!productUrl) return;

  const url = new URL(productUrl, window.location.origin);
  // A variant ID may no longer represent the newly selected option combination.
  url.searchParams.delete('variant');
  url.searchParams.set('option_values', ids.join(','));
  window.location.assign(url.toString());
});
