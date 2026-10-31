import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const required=['404.json','article.json','blog.json','cart.json','collection.json','index.json','list-collections.json','page.json','page.contact.json','password.json','product.json','search.json'];
for(const filename of required){
 const path='templates/'+filename;
 const template=JSON.parse(read(path));
 assert.ok(template.sections,'Missing sections in '+filename);
 assert.ok(template.order?.length,'Missing section order in '+filename);
 for(const id of template.order){
   const name=template.sections[id]?.type;
   assert.ok(name,'Missing section '+id+' in '+filename);
   assert.ok(read('sections/'+name+'.liquid').includes('{% schema %}'),'Missing actual section file: '+name);
 }
}
assert.ok(read('templates/gift_card.liquid').includes('gift_card.balance'));
assert.ok(read('layout/password.liquid').includes('content_for_layout'));
assert.ok(read('sections/main-password.liquid').includes("form 'storefront_password'"));
assert.ok(read('sections/contact-form.liquid').includes("form 'contact'"));
assert.ok(read('sections/custom-liquid.liquid').includes('"type":"liquid"'));
assert.ok(read('sections/main-product.liquid').includes('structured_data'));
assert.ok(read('sections/main-product.liquid').includes('form | payment_button'));
assert.ok(read('sections/main-product.liquid').includes("{% when '@app' %}"));
assert.ok(read('sections/main-cart.liquid').includes('line_level_discount_allocations'));
assert.ok(read('sections/main-cart.liquid').includes('cart_level_discount_applications'));
assert.ok(read('sections/header.liquid').includes('routes.account_url'));
const dicts=['en.default','ar'].map(code=>JSON.parse(read('locales/'+code+'.json')));
for(const dict of dicts)for(const key of ['contact','editorial','password','gift_card'])assert.ok(dict[key], 'Missing locale '+key);
assert.equal(JSON.parse(read('config/settings_schema.json'))[0].theme_version,'0.8.6');
console.log('Required Shopify page templates, commerce and translation contracts passed');
