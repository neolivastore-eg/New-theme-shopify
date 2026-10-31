# HOME-01 — Logo Banner implementation

**Reference:** `docs/HOMEPAGE_VIDEO_REFERENCE.md` (00:00–00:12). The source is a mobile screen recording of a demo theme, not an owned image or a working desktop reference.

## Built in v0.8.0
- `sections/logo-banner.liquid`: fully native Shopify OS 2.0 schema, editor preset, merchant fields for overline, tagline, brand logo image, real desktop/mobile editorial photographs, brand and panel colors, height, panel placement, optional collection link, animation toggle.
- `assets/logo-banner.css`: full-bleed editorial layout, central white identity plate, semantic heading, abstract original brand-color fallback (CSS only), art-direction picture element, desktop/mobile breakpoints, focus styling and reduced motion.
- `templates/index.json`: banner placed **first**, above the retained original editorial hero. Previous hero is `disabled:true` rather than removed; after HOME-02 is approved, its replacement typography section takes over the next slot.
- **Store logo availability:** the Shopify preview theme's `config/settings_data.json` currently has no `logo` selection. Therefore the actual preview shows the shop's title `Neoliva` as text in the identity plate. The section will automatically use the global theme logo (`settings.logo`) or a dedicated `logo_image` selected in its editor as soon as the merchant chooses it. Do not claim an approved logo image has been attached yet.
- **Photo availability:** no merchant-approved editorial/lifestyle photograph is assigned to the HOME-01 section. The default uses an original CSS abstract surface with no invented products. Merchants can select genuine, rights-cleared desktop and mobile campaign media at any time.
- **Motion:** entrance transition only on desktop with `prefers-reduced-motion: no-preference`, no third-party JS and zero layout-critical animations.

## Reference-to-implementation
- Big mobile identity area → responsive minimum height and dynamic 680px mobile preset.
- White central “LOGO” card → white frame with actual Neoliva heading / merchant logo object; never copy demo `LOGO` artwork.
- Surrounding illustrated adventure background → merchant-uploaded real campaign photography (preferred), otherwise cream + olive original abstract geometry (not copied from the screenshot).
- Small bottom signature → merchant-editable `footer_label`.
- Separate top announcement and native navigation remain in the existing header group; never duplicate in the banner.
- Does not replicate editor overlays, example shipping/discount promises or placeholder apparel.

## Live QA before section sign-off
- Confirm stored section remains first and old hero is disabled on **unpublished preview**.
- Check 390 × 844 phone and 1440 × 900 desktop screenshot vs reference. Overflow: none; logo readable.
- Confirm native editor exposes image pickers for desktop/mobile, logo, typography and positioning.
- If using background media, compare correct picture sources and alt semantics. Avoid adding product packshots as fictional lifestyle scenes.
- Check keyboard focus and disabled motion, English/Arabic RTL once store-level locale is available.
- Keep preview unpublished. Merchant approval and actual photo assets are required before HOME-01 is a visually finalized brand banner.

## Next section
HOME-02 — inline-icon typographic manifesto, based on 00:12–00:24 footage. Build next, only after owner review of HOME-01 preview.
