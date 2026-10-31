# NEOLIVA ATELIER — original Shopify theme

**Status:** v0.1 foundation, untested on Shopify. Built independently for Neoliva using the official Shopify Online Store theme architecture and publicly documented APIs. No BCT or competitor theme source is used.

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

## Current limits
- No verified Shopify hosted preview or Theme Check report yet.
- Product page's basic variant selector is for ordinary variant counts, not Shopify high-variant products.
- No predictive search, Ajax cart drawer, 3D, multi-level mega-menu, bundles, or commercial theme-store compliance claim.
- Do not test purchase fulfillment or payments on the real store.

See `PROJECT_PLAN.md`.
