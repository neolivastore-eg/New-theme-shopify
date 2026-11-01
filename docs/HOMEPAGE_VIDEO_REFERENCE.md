# NEOLIVA Atelier HOME-02—HOME-15 — Video reference implementation

Reference: user-supplied 2:32 phone recording `131538.mp4`, inspected directly. Screen recording shows a template/demo with **illustrative placeholder items and prices**: do not treat those as merchant assets or inventory. This project implements the **structural/interaction direction** against actual Neoliva Shopify collections, no fabricated discounts, packs, claims, UGC, product photos, or reviews.

## Section map (video clock → storefront)
| Slot | Video | Shopify section | Production behavior |
| --- | --- | --- | --- |
| HOME-01 | 00:00–00:12 | `logo-banner` + `header` | Existing transparent sticky header and image-only scroll logo dock; untouched |
| HOME-02 | 00:12–00:24 | `home-editorial-line` | Oversized serif story headline with round photo/word chips from real skincare products |
| HOME-03 | 00:24–00:33 | `campaign-grid` | Three linked collection promo cards using real available product photos |
| HOME-04 | 00:33–00:52 | `home-story-mosaic` | Brand story and staggered real product/editorial mosaic |
| HOME-05 | 00:52–01:16 | `home-routine-video` | Merchant video picker; genuine product image fallback, linked real product and live Shopify price |
| HOME-06 | 01:16–01:24 | `home-product-rail` | Keyboard-operable native tabs and product scroll rail |
| HOME-07 | 01:24–01:38 | `home-feature-scene` | Soft-blue skincare/editorial stage |
| HOME-08 | 01:38–01:43 | `home-product-rail` | Skincare products |
| HOME-09 | 01:43–01:48 | `home-feature-scene` | Olive haircare editorial stage |
| HOME-10 | 01:48–01:58 | `home-collection-type` | Oversized typographic collection navigation |
| HOME-11 | 01:58–02:12 | `home-shoppable-photo` | Real image stage with only merchant-configured real product pins and links |
| HOME-12 | 02:12–02:20 | `home-product-rail` | New beauty products editorial-style rail (not claiming date-based freshness) |
| HOME-13 | 02:20–02:27 | `home-testimonials` + `home-beauty-vibes` + `benefits-strip` | Testimonials editor-ready but *disabled until actual consented reviews are added*. Real-product gallery and existing accurate policy benefits visible |
| HOME-14 | 02:27–02:29 | `home-newsletter` | Native Shopify customer form, actual email capture |
| HOME-15 | 02:29–02:32 | `footer` | True store branding, navigation and opt-in merchant social links |

Old `hero`, `campaigns`, `featured`, `collections`, and `editorial` are preserved in the homepage JSON **disabled** for rollback. This replaces them with video-ordered instances without deleting existing schema or product work. Theme is still UNPUBLISHED. The real merchant media pickers in all relevant sections support future original photo/video uploads.

## Validation
- Existing HOME-01 logo and transparent header regression suites.
- New `scripts/home-video-audit.mjs` validates order, schema, available-product guards, live-price links, disabled empty reviews, real-asset policy, accessibility and JS inclusion.
- Shopify Theme Check on PR and browser screenshot/desktop-mobile traversal after preview sync.
- Merchant visual review and original Lifestyle/UGC/video configuration is required before any claim of exact pixel/video parity.
