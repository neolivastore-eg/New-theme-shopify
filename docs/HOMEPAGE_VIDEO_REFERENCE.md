# NEOLIVA ATELIER — Homepage visual reference map (31 Oct 2026)

## Source and scope

- **Source:** User-provided phone screen recording `131538.mp4`, approx. **151.9 seconds**, **1080 × 2340**, mobile Shopify Theme Editor home-page preview. The video itself is in the conversation, **not versioned in the repository**.
- **Goal:** Treat this recording as a **page-level sequence/layout/motion reference**, not a standalone section, not executable theme source and not a set of licensed production assets.
- **Boundary:** The Shopify editor blue outlines, floating "Work with Sidekick" panel, smartphone status bar and editor labels are **editor chrome**, not elements to recreate in the storefront.
- **Illustrative demo content only:** The source shows a generic `LOGO`, apparel/product illustrations, `LE 19.99` pricing, skincare promotional labels, an unverified "$50" shipping promise, and a "20% off" newsletter teaser. **Do not copy these assets, make these claims or change Neoliva prices/promotions.** Use actual Neoliva imagery, product data, merchant-approved copy and existing Shopify collections.
- **Reference coverage:** The recording is a *mobile view*, not a full desktop or an inspectable interactive demo. Desktop behavior, exact animation easing, font license, tap/hover behavior and complete editor settings require independent review. The time boundaries below are approximate because the video scrolls continuously and briefly enters Theme Editor section settings.

## Page composition map — ordered, top to bottom

| ID | Recording range | Visual signature / behavior to match | Reusable engine, Neoliva implementation contract | Status |
|---|---|---|---|---|
| HOME-01 | 00:00–00:12 | Narrow announcement strip, icon-driven white header, tall illustrated logo banner; banner area visually dominates initial viewport | Native `header` / announcement group + new logo/brand banner engine; real approved brand media only, never demo `LOGO` or false shipping copy | HEADER BASE, BANNER NOT BUILT |
| HOME-02 | 00:12–00:24 | Warm cream editorial manifesto, huge high-contrast serif headline with circular inline icon marks interspersed between words | New typography hero engine: structured rich text, optional uploaded inline icon images, reading order preserved, text wrap fluid at mobile sizes | NOT BUILT |
| HOME-03 | 00:24–00:33 | Product-led colorful promotional cards, short product labels and rounded Shop Now actions, stacked/mobile scroll | Reuse `campaign-grid` foundation and build carousel/card presets. Link only to real collection/product objects; images from real catalogue or merchant upload | BASE PARTIAL |
| HOME-04 | 00:33–00:52 | Centered large text "Where Every Skincare Moment Counts", paragraph, animated/floating product/graphic cards nearby and scroll transition | Storytelling engine / `atelier-composition` enriched with uploaded cards and optional limited motion; no fixed-height text clipping | COMPOSITION BASE |
| HOME-05 | 00:52–01:16 | "Your Daily Routine" title, large vertically cropped shoppable video, video play/pause, floating product card with thumbnail, price and bag affordance | Shoppable-video engine using Shopify-hosted video + real selected product, accessible play/pause and card; graceful static media fallback | NOT BUILT |
| HOME-06 | 01:16–01:24 | Two-across small product cards, horizontal scroller and thin indicator; view-all bestsellers action | Product rail engine using Shopify collections, scroll snap and accessible previous/next, genuine prices and availability | FEATURED GRID BASE, RAIL NOT BUILT |
| HOME-07 | 01:24–01:38 | Alternating blue-tinted product storytelling, headline about skin hydration, image and product highlight tiles | Split/media-and-product storytelling preset; actual product photo, optional copy, careful contrast | NOT BUILT |
| HOME-08 | 01:38–01:43 | "Best Skincare Products", tall video/product scene with controls/indicator and floating product buy-card | Composite product-media feature with video/picture + selected Shopify product. Avoid false stock, fake reviews or simulated price | NOT BUILT |
| HOME-09 | 01:43–01:48 | "Perfect hair with Argan Oil" visual/product highlight leading into collections | Product/ingredient spotlight preset; copy only if supported by real product claims and labels | NOT BUILT |
| HOME-10 | 01:48–01:58 | "Popular Collection", oversized serif list of collection links and subtle inline icon marks on cream/white background | Existing `collection-links` plus typography/list layout preset; selected real collections; accessible tap targets | BASE PARTIAL |
| HOME-11 | 01:58–02:12 | Cream "Love Your Skin" section; large portrait image with multiple white "+" clickable hotspots, view-all products action | Shoppable-image hotspot engine; merchants choose exact product for each hotspot, percent-based coordinates, keyboard/RTL, accessible popover | NOT BUILT |
| HOME-12 | 02:12–02:20 | "New Beauty Products" with large product carousel/cards | Another product rail preset with native Shopify collection or new-arrivals sort, not hard-coded dates | BASE PARTIAL |
| HOME-13 | 02:20–02:27 | Stacked icon+label trust/benefit rows, examples show demo delivery/natural/recyclable statements | Existing `benefits-strip`, merchant-owned proof-based claims only, use Neoliva verified shipping policy | BASE |
| HOME-14 | 02:27–02:29 | Newsletter editorial teaser on pale blue/cream | Native Shopify customer/newsletter form; no "20% off first" unless campaign/discount is truly active | NOT BUILT |
| HOME-15 | 02:29–02:32 | Dark full-width accordion footer with Categories, Customer Service, Information and About Us | Native footer group / expandable mobile columns, actual menu links, policies and contacts | FOOTER BASE |

## Visual grammar identified from the recording

1. **Mobile-first editorial pacing:** wide empty space between large heading moments, then high-density commerce/product interaction. Alternate mostly cream/white backgrounds with occasional mint/blue panels.
2. **Typography:** large serif display headings, secondary sans-serif product/details text; fluid wrap and carefully controlled line lengths, not hard-coded word breaks.
3. **Product imagery:** oversized pack/product imagery, occasionally layered/tilted floating "cards"; source reference is largely generic illustrations — do not transfer them.
4. **Interaction:** native mobile menu, product rails, hotpots, video controls, floating product cards, accordion footer. Every shopping action must lead to real variants/availability and native Shopify cart.
5. **Motion:** scroll-linked appearance and gentle media transforms are suggested by the recording. The video alone does not identify the implementation library/easing. Start with performant CSS progressive enhancement; add GSAP/3D only after specific scene and performance acceptance.
6. **Content compliance:** show Egypt currency from Shopify, available products only in promotional rails where appropriate, no invented ratings, fake urgency, shipping or discounts.
7. **Accessibility/RTL:** mobile tap targets, semantic headings, real image alt, focus states, keyboard hotspot access, reduced-motion behavior; Arabic translation reviewed separately from theme publishing.
8. **Theme Editor:** all sections must have merchant-editable settings, real product/collection references, sensible defaults and Shopify section presets.

## Implementation sequence — **one visual section at a time**

0. Preserve the **v0.7 functional foundation** (navigation/search/real Shopify catalog/cart/checkout templates). No redesign based on the recording should impair these flows.
1. Begin with **HOME-01 Brand Logo Banner**, using actual Neoliva logo/media available to the merchant. Its image artwork is **not** copied from this sample.
2. Continue with **HOME-02 Inline Icon Editorial Typography**, then **HOME-03 Product Promotional Cards**, reviewing each against its screenshot/video frames.
3. Follow the ordered table through **HOME-15**, reusing existing commercial engines whenever possible, rather than duplicating sections.
4. For each item: prepare responsive composition and section schema → commit in GitHub feature PR → run Theme Check/CI → install only to an **unpublished Shopify preview** → readback → inspect in actual storefront/theme editor (mobile+desktop) → merchant review. Next section starts only after the previous one reaches a usable preview.
5. Never publish the theme, Arabic storefront locale, or adjust merchant inventory/prices unless explicitly approved.

### Acceptance criteria for each Section

- Visual reference correctly scoped (the source video frame(s), optional close-up image from merchant); no dependence on Shopify editor UI.
- Mobile implementation matches reference's structure and responsive behavior; desktop design derived responsibly and checked.
- All text, links, real media and featured products can be changed in Shopify Theme Editor without code.
- No copied demo brand art, generic T-shirt assets, fabricated pricing, shipping, newsletter discount, rating or review claims.
- Keyboard access, reduced motion, accessible dialog/media/hotspots, image loading/performance.
- CI Theme Check and actual Shopify preview readback, then human visual acceptance. **Passing source tests is not full browser QA.**

### Existing building blocks

v0.7 already has `header.liquid`, `hero.liquid`, `campaign-grid.liquid`, `collection-links.liquid`, `featured-collection.liquid`, `benefits-strip.liquid`, `footer.liquid`, plus `atelier-composition.liquid` with reusable `/blocks`. These foundations are **not visually equivalent** to the video yet. Reuse core functionality; replace or enhance the art-directed layouts section by section.

## Next actionable design task

**HOME-01 Brand Logo Banner:** establish actual Neoliva logo placement, the visual layer system, mobile hero crop and announcement transition. The video shows a demo image with a placeholder logo; user-specific logo imagery should come from Shopify theme assets/merchant upload. If media is absent, display the shop name as clear text — never import the demo image.
