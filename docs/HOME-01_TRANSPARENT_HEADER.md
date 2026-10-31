# HOME-01: Transparent overlay header and scroll-anchored logo (v0.8.3)

**Source:** Homepage video user supplied in the current discussion, with an explicit correction that the header starts transparent and overlays the first section; while the page scrolls, it becomes a fixed/sticky solid surface. The large NEOLIVA card must still shrink and travel into the **actual header logo link**.

## Behavior
- Initial load at top of homepage with HOME-01 enabled: **transparent** header over the identity banner, without adding header height before the hero.
- The native Shopify announcement bar remains in normal flow. The header starts directly after the announcement, then stays sticky at viewport top as content scrolls.
- Within the first 160px of vertical scrolling, a cream backdrop fades in, with lightweight blur. On later sections it remains opaque. Upward scroll reverses it.
- Menu and search popovers keep a solid background, and opening any native `details` forces a solid header regardless of scroll.
- The existing HOME-01 `logo-dock.js` continues to shrink/dock the *same green Neoliva logo* from its hero plate into the existing home link in the header, without introducing a second tabbable logo.
- Only the homepage with HOME-01, with Sticky Header **enabled**, gets the overlay. Other templates stay opaque, and a sticky-disabled header stays in normal flow.
- CSS supports reduced motion and JavaScript errors by retaining a usable solid header fallback. Editor section reload and CSS responsive measurements are handled. No external animation libraries.

## Implementation details
- `sections/header.liquid` adds schema wrapper class `nl-header-section`, and merchant controls: `transparent_home` (default on) and `transparency_distance` (160px, 60–300).
- `layout/theme.liquid` sets `template-index` only on home; `html.js` is set in head to avoid a flash and the two new assets load before existing logo dock.
- `assets/transparent-header.css` uses conditional `:has` CSS for zero-layout-jump overlay from first paint, plus a JS-attached host-class fallback. It controls background via a translucent pseudo-element and never overrides opened dropdowns.
- `assets/transparent-header.js` uses a passive, requestAnimationFrame-throttled scroll handler; measures real header height and keeps the theme editor state/resize working.
- `scripts/transparent-header-audit.mjs` exercises the initial transparent state, midpoint, opaque state, reverse, menu opening, responsive resizing and reduced-motion state.

## Acceptance checklist still requiring **interactive browser** observation
- At 390 × 844 and 1440 × 900: logo card transitions cleanly into actual header without a jump, and the header overlays the hero at top.
- Check sticky header after first section, no horizontal overflow, correct header/menu/search/cart stacking and focus behavior.
- Verify Shopify Theme Editor selection and home vs collection/product routes.
- Do not publish the theme until merchant approves appearance and behavior.

**Safety:** This is written only to the unpublished `New-theme-shopify/shopify-preview`. The MAIN Refresh theme and shop products are unchanged.
