// Non-destructive source-contract checks. Not a substitute for browser/checkout QA.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const read = (name) => readFileSync(name, 'utf8');
const product = read('sections/main-product.liquid');
const script = read('assets/theme.js');
const cart = read('sections/main-cart.liquid');
const search = read('sections/main-search.liquid');
const collection = read('sections/main-collection.liquid');
const header = read('sections/header.liquid');

assert.match(product, /product\.options_with_values/, 'Use option-value selections for high-variant products');
assert.doesNotMatch(product, /for\s+\w+\s+in\s+product\.variants/, 'Do not cap product options to a truncated variant list');
assert.match(product, /product\.selected_or_first_available_variant/);
assert.match(product, /current_variant\.available/);
assert.match(product, /name="id"/);
assert.match(product, /name="quantity"/);
assert.match(product, /data-option-value-selector/);
assert.match(script, /option_values/);
assert.match(script, /window\.location\.assign/);
assert.match(cart, /routes\.cart_url/);
assert.match(cart, /name="updates\[\]"/);
assert.match(cart, /name="checkout"/);
assert.match(search, /search\.results/);
assert.match(collection, /collection\.products/);
for (const template of [search, header]) {
  assert.match(template, /name="q"/);
  assert.match(template, /name="type" value="product"/);
  assert.match(template, /name="options\[prefix\]" value="last"/);
}

const flatten = (obj, prefix = '') => Object.entries(obj).flatMap(([key,value]) =>
  value && typeof value === 'object' ? flatten(value, prefix ? prefix + '.' + key : key) : [prefix ? prefix + '.' + key : key]);
const locales = ['en.default','ar'].map((lang) => JSON.parse(read('locales/' + lang + '.json')));
assert.deepEqual(flatten(locales[0]).sort(), flatten(locales[1]).sort(), 'Translation keys must match');
for (const f of readdirSync('templates').filter((s)=>s.endsWith('.json'))) JSON.parse(read(path.join('templates',f)));
for (const f of readdirSync('sections').filter((s)=>s.endsWith('.json'))) JSON.parse(read(path.join('sections',f)));
for (const f of readdirSync('sections').filter((s)=>s.endsWith('.liquid'))) {
  const text = read(path.join('sections',f));
  const schema = text.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
  if (schema) JSON.parse(schema[1]);
}
console.log('Commerce source checks passed (static only; live Shopify QA still required).');
