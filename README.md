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
