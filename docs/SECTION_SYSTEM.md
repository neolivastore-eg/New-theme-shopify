# NEOLIVA ATELIER — Visual Engine & Section System

**Status:** v0.5 implementation specification (not a claim that all Wonder references are built).
**Reference basis:** Neoliva's previous competitor study, Wonder section screenshots and the Commercial-Grade Shopify Theme Blueprint. The older discussion recorded 98 reference screenshots and 80 named section examples. Their individual image files are NOT present in this repository: no screenshot-to-section matching is marked completed until originals are indexed and verified.

## Product principles
- Brand-agnostic commercial Shopify theme code. Neoliva is the first actual merchant/preset.
- Premium beauty commerce design: warm cream, olive, charcoal; real product/merchant licensed photography only.
- Use Shopify Online Store 2.0 Liquid and theme-native `/blocks`, not a React SPA. Vanilla CSS/JS first. JS progressive enhancement only where interaction genuinely requires it.
- Reusable **engines** create multiple editorial presets. Not one Liquid file for each variation of a Wonder screenshot.
- Motion is an optional enhancement, not a dependency for purchasing, cart, search, navigation, accessibility, or the Theme Editor.
- Neoliva store only: all releases land on an unpublished theme until explicit merchant publish approval.

## Design tokens / acceptance direction
- **Type:** editorial serif display mixed with highly legible sans-serif commerce UI. Heading line length controlled; mobile headings responsive.
- **Space:** 4px baseline with generous editorial sections and denser commerce cards; breakpoints from actual content.
- **Color:** Warm cream, white, dark charcoal, olive. Ensure focus outlines and readable contrast in each theme mode.
- **Media:** Portrait/square/landscape variants, true alt text, natural crop or contain for packshots; avoid generated brand/product photography.
- **Motion:** Scroll-triggered motion only where beneficial, no parallax that breaks accessibility; prefers-reduced-motion is mandatory. No hydration cost for static composition.
- **RTL:** use logical CSS and actual Arabic localization tests; publishing `ar` on Shopify requires separate merchant approval.
- **CRO:** no fabricated stock claims, fake review numbers, fake discounts, fake countdowns.

## Section engine register
*Status legend: BUILT = source exists in v0.5; BASE = earlier v0.4 basic implementation; NEXT = planned; APP = deliberate integration contract.*

| Family | Engine | Expected editor-driven presets | Priority | Status |
|---|---|---|---|---|
| Composable | Atelier composition | Split, grid, centered, brand introduction, product story | P0 | BUILT |
| Composable | Atelier theme blocks | Heading, copy, action, media, stack, product | P0 | BUILT |
| Hero | Editorial hero | Text left/right, product-led, neutral campaign | P0 | BASE |
| Hero | Video hero | Muted short video + poster and accessible pause | P1 | NEXT |
| Hero | Slideshow | Product, editorial, campaign, static fallback | P1 | NEXT |
| Hero | 3D scene canvas | Optional progressive scene + static poster | P2 | NEXT |
| Marketing | Announcement bar | One/two message, icon, link | P0 | BASE |
| Marketing | Campaign cards | 2/3-column commerce campaigns | P0 | BASE |
| Marketing | Scrolling headline | Static/marquee modes, reduced motion | P1 | NEXT |
| Marketing | Countdown banner | Real explicit date only; no fake scarcity | P1 | NEXT |
| Marketing | Promotion banner | Image, side labels, product collection | P1 | NEXT |
| Discovery | Collection navigator | Categorized tiles and real collection imagery | P0 | BASE |
| Discovery | Collection tabs | Featured edits/brands/routines | P1 | NEXT |
| Discovery | Predictive search | Product, query, category suggestions | P0 | NEXT |
| Discovery | Mega menu | Multi-column accessible navigation | P0 | NEXT |
| Discovery | Collection filters | Native faceted filters, selected chips, mobile drawer | P0 | BASE partial |
| Commerce | Featured collection | Product tile grid with availability | P0 | BASE |
| Commerce | Product rail | Native scroll snap with accessible controls | P1 | NEXT |
| Commerce | Product spotlight | Actual PDP product media/options/CTA | P1 | NEXT |
| Commerce | Shoppable image | Real hotspots with accessible products | P1 | NEXT |
| Commerce | Product comparison | Comparable actual attributes, not fake scores | P1 | NEXT |
| Commerce | Bundle presentation | Exact official bundles or native product bundles | P1 | NEXT |
| Commerce | Complementary products | Native recommendation source | P0 | NEXT |
| Commerce | Recently viewed | Consent-aware/local optional | P2 | NEXT |
| Commerce | Quick add | Availability-aware variants | P1 | NEXT |
| Commerce | Cart drawer | Accessible AJAX updates with canonical cart fallback | P0 | NEXT |
| Story | Image with text | Reversible editorial, product narrative | P0 | BASE |
| Story | Story collage | Responsive art-directed tiles | P1 | NEXT |
| Story | Before/after | Controlled compare with labeled media | P1 | NEXT |
| Story | Lookbook | Gallery + connected product styling | P1 | NEXT |
| Story | Timeline | Process, brand story | P2 | NEXT |
| Story | Scrollytelling | Short chapters with content-first fallback | P2 | NEXT |
| Story | Parallax media | Optional low-motion with fallback | P2 | NEXT |
| Social | Testimonials | Only verified merchant submissions/app | P1 | APP |
| Social | Video reels | Uploaded real licensed videos | P1 | NEXT |
| Social | Social gallery | Merchant media or app block, not scraping | P2 | APP |
| Personalization | Quiz | App block or local non-API decision tree | P2 | APP |
| Editorial | FAQ/accordion | Details/summary keyboard semantics | P0 | NEXT |
| Editorial | Multi-column benefits | Store policies verified in Shopify | P0 | BASE |
| Editorial | Blog highlights | Native Shopify article objects | P1 | NEXT |
| Editorial | Newsletter | Native Shopify customer form | P0 | NEXT |
| Editorial | Contact | Native contact form | P0 | NEXT |
| System | Custom Liquid / app slot | Flexible theme blocks and app blocks | P0 | NEXT |
| System | Search / product / collection templates | Working native templates | P0 | BASE partial |

This is an **engine registry**, not the exact 80-line Wonder inventory. Many Wonder-style named items are presets of these engines. We still need to map the original 98 visual references and the exact section labels one by one.

## Theme Block contracts in v0.5
- `atelier-heading`: semantic h2/h3; optional eyebrow and scalable display.
- `atelier-copy`: rich text.
- `atelier-action`: URL or native Shopify collection route; no dead action in storefront.
- `atelier-media`: real merchant photo, real selected product image or first available collection product; product images take priority over collection artwork.
- `atelier-stack`: nested `@theme` and `@app` children; horizontal/vertical grouping.
- `atelier-product`: native product selector and existing product card.
- `atelier-composition`: renders `content_for 'blocks'`, supports @theme / @app blocks; split/grid/centered; 3 surfaces.

## Release gates (required before production)
1. CI Theme Check + block-schema, nested-template and existing commerce contract tests.
2. Shopify unpublished theme upsert and actual readback. Validate that Shopify persisted block settings after upload.
3. Browser rendering on homepage and collection/product pages. Desktop/mobile screenshots and keyboard traversal.
4. Test No-JS purchase and cart, real product options, filters and predictive search, and Arabic RTL once enabled.
5. Test Lighthouse Core Web Vitals and assistive technology; verify campaign copy, imagery licenses and inventory claims.
6. Merchant visual approval. Only then discuss publication.

## Prioritized execution sequence
1. **v0.5:** composable architecture and first real editorial homepage demonstration. **CURRENT**
2. **v0.6:** mobile navigation, accessible predictive search, cart drawer and product discovery.
3. **v0.7:** beauty-native PDP: shade/concern/ingredient/usage primitives and app blocks; mobile-commerce hardening.
4. **v0.8:** shoppable editorial, lookbook, video stories, comparison, bundles, app integration.
5. **v0.9:** premium motion layer with static fallback, optional lightweight 3D on non-critical editorial areas.
6. **v1.0 candidate:** full Arabic/English, reference visuals, test evidence, docs, merchant review.

**Realistic note:** Shopify's Theme Check green alone does not make the theme production-ready or compliant with the Theme Store.
