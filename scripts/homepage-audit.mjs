import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=(path)=>readFileSync(path,'utf8');
const homepage=JSON.parse(read('templates/index.json'));
const handles=new Set(['skin-care-1','hair-care-1','makeup']);
assert.equal(JSON.parse(read('config/settings_schema.json'))[0].theme_version,'0.4.0');
for(const key of ['hero','campaigns','collections','featured','benefits'])
  assert.ok(homepage.order.includes(key),`Homepage missing ${key}`);
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
