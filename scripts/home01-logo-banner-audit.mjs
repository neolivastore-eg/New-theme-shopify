import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path)=>readFileSync(path,'utf8');
const section=read('sections/logo-banner.liquid');
const css=read('assets/logo-banner.css');
const match=section.match(/{% schema %}\s*([\s\S]*?)\s*{% endschema %}/);
assert.ok(match,'Logo banner needs valid Shopify section schema');
const schema=JSON.parse(match[1]);
assert.ok(schema.name.length<=25,'Shopify editor name must fit');
const ids=new Set(schema.settings.filter(x=>x.id).map(x=>x.id));
for(const id of ['logo_image','desktop_image','mobile_image','overline','tagline','footer_label','panel_position','desktop_height','mobile_height','motion','collection','button_link']){
 assert.ok(ids.has(id),'Missing merchant-editable setting: '+id);
}
assert.ok(schema.presets.length,'Section must be insertable in Shopify editor');
assert.ok(section.includes('settings.logo'),'Logo must use native merchant logo before text fallback');
assert.ok(section.includes('shop.name | escape'),'No hard-coded demo brand art');
assert.ok(section.includes('section.settings.mobile_image | image_url'),'Art-directed mobile media required');
assert.ok(section.includes('loading: \'eager\'') && section.includes('fetchpriority: \'high\''),'Optimize primary banner image');
assert.ok(!section.includes('collection.products'),'Do not substitute unrelated product packshot for branded lifestyle media');
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /\.nl-logo-banner__brand-frame/);
assert.match(css, /max-width:749px/);
assert.ok(read('layout/theme.liquid').includes('logo-banner.css'));
const home=JSON.parse(read('templates/index.json'));
assert.equal(home.order[0],'logo_banner');
assert.equal(home.sections.logo_banner.type,'logo-banner');
assert.equal(home.sections.hero.disabled,true,'Keep old hero for rollback, not duplicate visible masthead');
assert.ok(home.order.includes('hero'));
assert.equal(JSON.parse(read('config/settings_schema.json'))[0].theme_version,'0.8.5');
console.log('HOME-01 native image art direction, editorial logo frame and homepage integration passed');

assert.match(read('sections/logo-banner.liquid'),/data-logo-dock-source/);
assert.match(read('sections/header.liquid'),/data-logo-dock-target/);
assert.match(read('layout/theme.liquid'),/logo-dock.js/);

const themeSettings=JSON.parse(read('config/settings_data.json')).current;
assert.equal(themeSettings.logo,'shopify://shop_images/d7d39038-c498-4af5-b3cb-ef08b61e167f_removalai_preview.png',
 'Use the Neoliva alternate transparent logo from the Custom Storefront v1 theme, not white-L04.png');
assert.ok(section.includes('assign brand_logo = settings.logo'),"Logo banner must inherit the theme logo");
assert.ok(read('sections/header.liquid').includes('settings.logo | image_url'),'Header must inherit the same theme logo');

const imageOnlySchema=JSON.parse(read('sections/logo-banner.liquid').match(/{% schema %}\s*([\s\S]*?)\s*{% endschema %}/)[1]);
assert.equal(imageOnlySchema.settings.find(x=>x.id==='show_logo_plate')?.default,false,
 'Identity plate must be OFF by default');
assert.equal(JSON.parse(read('templates/index.json')).sections.logo_banner.settings.show_logo_plate,false);
assert.match(section,/nl-logo-banner--image-only/);
assert.match(css,/\.nl-logo-banner--image-only \.nl-logo-banner__brand-frame/);
assert.match(css,/background:transparent/);
assert.match(css,/box-shadow:none/);
assert.match(css,/min-height:0/);
assert.match(css,/padding:0/);
assert.match(read('assets/logo-dock.js'),/floating\.style\.backgroundColor = computed\.backgroundColor/,
 'The floating scroll-copy must inherit the image-only transparent background');
