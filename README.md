# NEOLIVA ATELIER — original Shopify theme

**Status:** v0.3 source candidate. GitHub source checks are available; hosted Shopify preview remains unverified. Built independently for Neoliva using the official Shopify Online Store theme architecture and publicly documented APIs. No BCT or competitor theme source is used.

## Goals
- Original premium beauty presentation with a broadly reusable merchant core.
- Sections + blocks for a merchant-controlled Shopify Theme Editor.
- Arabic and English, right-to-left layout, mobile-first experience.
- A real product/catalog/search/cart flow on Neoliva product data.
- Phase 2: video, shoppable media, advanced sections, progressive motion and selectively-loaded WebGL.

## Safe development
- Never deploy to a live theme during development.
- Work with an unpublished theme on Neoliva for read-only merchant preview.
- A preview shares production products, prices, and inventory: never submit real checkout/orders in tests.
- Keep credentials outside GitHub.

## Local commands
```sh
npm install -g @shopify/cli@latest
shopify theme check
shopify theme dev --store YOUR-STORE.myshopify.com
```

After successful checking, upload **only to an unpublished theme** with Shopify CLI. The CLI preview is not a live publication. Never use `--live` or `theme publish`.

## Current implementation
- Homepage: original hero, collection navigation, featured products, configurable campaign cards, shopping information strip, optional image-with-text editorial section.
- Templates: product, collection, search, cart, pages, 404, list collections; EN/AR locale dictionaries and RTL layout.
- Product variant selection is based on Shopify option-value IDs and server-validated variant availability.
- Each campaign image is merchant-supplied; no demo product photos, unsupported discounts or delivery claims are baked into the theme.
- Campaign cards, benefits and editorial content can be added, removed or edited in the Shopify Theme Editor.

## Current limits
- No independently verified Shopify-hosted theme preview or real-product browser tests yet.
- CI runs Shopify Theme Check and source contract checks; success is not the same as verified storefront operation.
- No predictive search, Ajax cart drawer, 3D, multi-level mega-menu, bundles, or commercial theme-store compliance claim.
- Do not test purchase fulfillment or payments on the real store.

See `PROJECT_PLAN.md`.

## Home SEO and language readiness (v0.4.1)
- A localized homepage title/description prevents duplicate "Neoliva · Neoliva" and missing home description. Merchant-authored homepage SEO metadata still takes precedence when available.
- Header contains a native Shopify localization form only when multiple languages are available to the visitor.
- Neoliva Arabic locale exists but is **unpublished** at the store level as of 2026-10-31; do not publish Arabic or change live store settings without merchant review of translations.
- The theme's translated locale dictionaries do not translate all product records or campaign content automatically.

## Reusable editorial system (v0.5)
- `sections/atelier-composition.liquid` supports actual reusable nested `/blocks` and `@app` insertion, with split/grid/centered layouts.
- Six design primitives live in `/blocks` and can be assembled in Shopify Theme Editor. No React dependency is loaded for this static editorial content.
- The new homepage story is sourced from a live Shopify skincare collection and has no synthetic product imagery or hard-coded prices.
- Full roadmap, visual acceptance rules, preview gates and Wonder-reference tracking: [docs/SECTION_SYSTEM.md](docs/SECTION_SYSTEM.md).


## v0.6 — commerce foundation before visual sections
- Header: 3-level desktop/mobile Shopify navigation, keyboard-friendly native details, native search/cart fallback without JavaScript.
- Search: Shopify predictive search via routes.predictive_search_url, abort/debounce and keyboard navigation. Standard GET search remains the fallback.
- Cart: Shopify Ajax Cart API with line-item keys, real totals and quantity edits, while retaining native /cart and POST checkout.
- Product forms: native Shopify product form with optional Ajax add; canonical variant URL remains the source of truth.
- /blocks now included in the distributable ZIP; installability still requires real-store validation.
- NOT YET CERTIFIED: end-to-end purchase, RTL, mobile accessibility, performance, app compatibility and Theme Store compliance.

## v0.7 required operating templates
- OS 2.0 pages: blog, article, contact page, password page, gift card, existing product/collection/cart/search and policy.
- Merchant Custom Liquid section; native Shopify contact form; customer account link conditional on shop settings.
- Product accelerated checkout uses the official payment_button filter; product structured_data uses Shopify's native filter, without invented price or stock.
- Cart page shows line item and cart-level discounts from Shopify data.
- These are minimal operational routes, not final branded editorials. Styling waits for merchant section screenshots.
- Shopify Theme Check proves static syntax/config; do not claim real payment/RTL/accessibility QA until executed.
