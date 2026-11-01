import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=(path)=>readFileSync(path,'utf8');
const homepage=JSON.parse(read('templates/index.json'));
const handles=new Set(['skin-care-1','hair-care-1','makeup']);
assert.equal(JSON.parse(read('config/settings_schema.json'))[0].theme_version,'0.8.7');
for(const key of ['logo_banner','hero','campaigns','collections','featured','editorial','benefits'])
  assert.ok(homepage.order.includes(key),`Homepage missing ${key}`);
assert.equal(homepage.order[0],'logo_banner');
assert.equal(homepage.sections.logo_banner.type,'logo-banner');
assert.equal(homepage.sections.hero.disabled,true,'Old hero must stay disabled while HOME-02 is built');
for(const key of ['hero','featured'])
  assert.ok(handles.has(homepage.sections[key].settings.collection));
for(const key of ['campaigns','collections']){
  const section=homepage.sections[key];
  for(const id of section.block_order)
    assert.ok(handles.has(section.blocks[id].settings.collection),`Bad collection handle ${key}/${id}`);
}
for(const path of ['sections/hero.liquid','sections/campaign-grid.liquid','sections/collection-links.liquid']){
  const file=read(path);
  assert.ok(file.includes('candidate.featured_image'),`No real product image fallback in ${path}`);
  assert.ok(file.includes('candidate.available'),`Availability guard missing in ${path}`);
  assert.ok(!file.includes('collection.image'),`Unverified collection cover used in ${path}`);
  const match=file.match(/{% schema %}\s*([\s\S]*?)\s*{% endschema %}/);
  assert.ok(match);
  const schema=JSON.parse(match[1]);
  assert.ok(schema.name.length <= 25);
}
assert.ok(read('sections/featured-collection.liquid').includes('item.available'));
assert.ok(read('snippets/product-card.liquid').includes('products.sold_out'));
assert.ok(JSON.parse(read('locales/en.default.json')).products.from_price);
assert.ok(JSON.parse(read('locales/ar.json')).products.from_price);
console.log('Home merchandising contract checks passed');

assert.ok(read('layout/theme.liquid').includes("seo.home_title"),'Localizable home title missing');
assert.ok(read('layout/theme.liquid').includes("seo.home_description"),'Localizable home description missing');
assert.ok(read('sections/header.liquid').includes("form 'localization'"),'Shopify native localization form missing');
for(const lang of ['en.default','ar']){
  const content=JSON.parse(read(`locales/${lang}.json`));
  assert.ok(content.general.language,'Missing locale picker label');
  assert.ok(content.seo.home_title && content.seo.home_description,'Missing SEO language keys');
}
