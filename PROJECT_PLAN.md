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

## 2026-10-31 — Foundation v0.6
- [x] Native deep responsive navigation and accessible search/form fallback.
- [x] Predictive search, cancellation, keyboard behavior, Shopify section rendering endpoint.
- [x] Cart drawer Ajax fetch/add/change, safe DOM rendering, focus handling and native checkout.
- [x] Translation keys for both locales, Theme Check CI and static contract guards.
- [x] Theme ZIP corrected to include /blocks (v0.5 ZIP excluded it).
- [ ] Verify Shopify Preview interactively: three-level menu, predictive response, cart mutations/checkout, mobile/RTL.
- [ ] Complete wider Theme Store baseline: account links, blog/article, password, gift card, PDP app blocks, variant no-JS, selling plans and pickup.
- [ ] Measure Lighthouse/performance, accessibility and merchant QA.
- [ ] Do not make decorative sections until merchant-supplied image reference arrives.

## 2026-10-31 — Foundation v0.7 required routes
- [x] Article, blog, contact, password and gift-card templates.
- [x] Custom Liquid section for merchant/editor integrations.
- [x] Native contact form, account link, accelerated checkout, product structured-data and actual cart discount display.
- [x] Locale translations + source contract test of Shopify required templates.
- [ ] Verify all template routes in actual unpublished theme (some need merchant blog/gift card/password state).
- [ ] Browser exercise for real product add/cart edit, keyboard and mobile filters, Arabic RTL when published.
- [ ] Commercial Theme Store readiness beyond template coverage remains open (performance/a11y, product selling plans, pickup, reviews via app, complete content).
- [ ] Art-directed Wonder sections intentionally deferred until owner sends their exact screenshots.

## HOME-01 design from 31 Oct 2026 user video
- [x] Implement logo banner in pure Liquid/CSS with theme editor settings, native logo/text fallback, responsive real photo inputs and reduced-motion behavior.
- [x] Place first on homepage and disable old hero while preserving its configuration.
- [x] Source QA contract and standalone reference-to-code acceptance document.
- [ ] Set merchant-approved official logo and photos through Shopify theme editor (none selected in v0.7 preview).
- [ ] Real mobile/desktop screenshot + theme editor control QA before visual sign-off.
- [ ] Then build HOME-02 typography based on its own video frames.
