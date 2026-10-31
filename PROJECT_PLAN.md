# NEOLIVA ATELIER — implementation stages

## First functional preview
1. Original basic layout, theme settings, RTL and Shopify locale dictionaries.
2. Header/search/navigation/cart link and footer.
3. Editable editorial hero, collection shortcuts, featured products and rich text.
4. Product template, collection template, search results and cart.
5. Validate Theme Check, localized navigation, mobile layout and accessibility.
6. Upload as a new unpublished theme on Neoliva; do not modify published theme.

## Phase 2 — reusable section engines
Hero image/video/promotion, editorial storytelling, flexible grids, product merchandising, testimonials, tabs, motion patterns and shoppable media. Prefer configurable Shopify sections and blocks over duplicated presets.

## Phase 3 — progressive enhancement
Motion for JavaScript or GSAP only in sections that use it; lazy optional 3D (Three.js), fallback media and reduced-motion behavior. Reassess licensing before redistribution.

## Gates
Each feature needs correct source data, merchant settings, mobile/RTL support, empty-state handling, accessibility, performance budget and documented test evidence.

## 31 October 2026 — Homepage merchandising v0.3 (source milestone)
- [x] Source sections: campaign cards, shopping information and image-with-text.
- [x] Editable schema controls, block defaults, RTL-friendly CSS and responsive layout.
- [x] Homepage template wired to campaign cards and shopping information.
- [ ] Confirm CI Theme Check and source validation on this branch.
- [ ] Upload to an UNPUBLISHED theme on Neoliva and verify real collection/product/image rendering.
- [ ] Replace editorial placeholders with merchant-selected real photography and link targets.
- [ ] Run mobile/RTL/accessibility checks and compare with published theme.
No live-theme deployment or checkout validation is authorized by this source milestone.

## 2026-10-31 — v0.5 reusable Atelier System
- [x] Architecture: 6 reusable Theme Blocks in `/blocks` (heading, copy, action, media, stack, product).
- [x] One original nested Section Engine: `atelier-composition` with split/grid/centered layouts and @theme/@app slot.
- [x] Real Shopify collection imagery fallback, no fake testimonials/urgency or placeholder stock art.
- [x] Low-cost CSS native motion with reduced-motion fallback and no heavy React/Three dependencies on commerce routes.
- [x] Homepage demonstration using a nested copy stack plus product photo from existing skin-care collection.
- [x] Automated tests of nested block references / Shopify schemas / source config. 
- [ ] Test actual Shopify Theme Editor compatibility, visual screenshots (desktop/mobile), keyboard/RTL.
- [ ] Reconcile Wonder 98 screenshot index against exact reference files before claiming all 80 are covered.
- [ ] Follow with predictive search, mobile drawer, and beauty-native PDP.
