import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(x)=>readFileSync(x,'utf8');
const names=['heading','copy','action','media','stack','product'];
const schemas=new Map();
for(const name of names){
 const path='blocks/atelier-'+name+'.liquid';
 const source=read(path);
 const match=source.match(/{% schema %}\s*([\s\S]*?)\s*{% endschema %}/);
 assert.ok(match,'Missing block schema: '+path);
 const schema=JSON.parse(match[1]);
 assert.ok(schema.name.length<=25,'Name too long: '+path);
 assert.ok(schema.presets?.length,'Block must be in editor picker: '+path);
 schemas.set('atelier-'+name,schema);
}
const composition=read('sections/atelier-composition.liquid');
const sm=composition.match(/{% schema %}\s*([\s\S]*?)\s*{% endschema %}/);
const ss=JSON.parse(sm[1]);
assert.ok(ss.blocks.some(b=>b.type==='@theme'),'Composition must be composable');
assert.ok(ss.blocks.some(b=>b.type==='@app'),'App integration slot must exist');
assert.ok(composition.includes("content_for 'blocks'"));
assert.ok(read('blocks/atelier-stack.liquid').includes("content_for 'blocks'"));
assert.ok(schemas.get('atelier-stack').blocks.some(x=>x.type==='@theme'));
const homepage=JSON.parse(read('templates/index.json'));
const editorial=homepage.sections.editorial;
assert.ok(editorial&&editorial.type==='atelier-composition');
assert.ok(homepage.order.includes('editorial'));
function verifyBlocks(node,depth=0){
 assert.ok(depth<=7,'Nested block depth too deep');
 for(const id of node.block_order||[]){
  const block=node.blocks?.[id];
  assert.ok(block,'Missing declared block '+id);
  assert.ok(schemas.has(block.type),'Unknown theme block '+block.type);
  if(block.type==='atelier-media'&&block.settings.image===undefined){
   assert.ok(['skin-care-1','hair-care-1','makeup'].includes(block.settings.collection),'Unverified real product media source');
  }
  if(block.blocks)verifyBlocks(block,depth+1);
 }
}
verifyBlocks(editorial);
assert.ok(read('assets/atelier-system.css').includes('prefers-reduced-motion:reduce'));
assert.ok(read('layout/theme.liquid').includes('atelier-system.css'));
console.log('Atelier theme blocks and nested composition pass source contract checks');
