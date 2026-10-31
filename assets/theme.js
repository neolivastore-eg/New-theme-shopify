document.documentElement.classList.add('js');
document.addEventListener('change', (event) => {
  const selector = event.target.closest('[data-variant-selector]');
  if (!selector) return;
  const container = selector.closest('[data-product-form-root]');
  if (!container) return;
  const selected = selector.options[selector.selectedIndex];
  const price = container.querySelector('[data-product-price]');
  if (price && selected.dataset.price) price.textContent = selected.dataset.price;
  const button = container.querySelector('[data-add-to-cart]');
  if (button) button.disabled = selected.disabled;
});
