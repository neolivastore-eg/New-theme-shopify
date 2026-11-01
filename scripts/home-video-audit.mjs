import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const home=JSON.parse(read('templates/index.json'));
const version=JSON.parse(read('config/settings_schema.json'))[0].theme_version;
assert.equal(version,'0.9.2');
const order=[
 ['logo_banner','logo-banner'],['editorial_line','home-editorial-line'],['promos','campaign-grid'],
 ['story','home-story-mosaic'],['routine','home-routine-video'],['bestsellers','home-product-rail'],
 ['hydration','home-feature-scene'],['skin_spotlight','home-product-rail'],
 ['hair_spotlight','home-feature-scene'],['type_collections','home-collection-type'],
 ['hotspots','home-shoppable-photo'],['new_beauty','home-product-rail'],
 ['testimonials','home-testimonials'],['beauty_vibes','home-beauty-vibes'],
 ['benefits','benefits-strip'],['newsletter','home-newsletter']
];
for(let i=0;i<order.length;i++){
 const [id,type]=order[i];
 assert.equal(home.order[i],id,'Wrong video sequence at HOME index '+i);
 assert.equal(home.sections[id].type,type,'Wrong section type '+id);
 assert.ok(existsSync('sections/'+type+'.liquid'),'Missing render file '+type);
}
const newTypes=[...new Set(order.map(x=>x[1]))].filter(x=>x.startsWith('home-'));
for(const type of newTypes){
 const code=read('sections/'+type+'.liquid');
 const m=code.match(/{% schema %}\s*([\s\S]*?)\s*{% endschema %}/);
 assert.ok(m,'Missing schema '+type);
 const schema=JSON.parse(m[1]);
 assert.ok(schema.name.length<=25,'Shopify section schema name too long '+type);
 assert.ok(schema.presets?.length,'Missing Theme Editor preset '+type);
 assert.ok(!/example product title|LE 19\.99|Lorem ipsum|placeholder\.png/i.test(code),'Hard-coded dummy merchandising: '+type);
 assert.ok(!/https?:\/\/[^"' ]+\.(jpg|png|webp)/i.test(code),'External image URL '+type);
}
for(const id of ['hero','campaigns','collections','featured','editorial'])
 assert.equal(home.sections[id].disabled,true,'Old sections should be available only as rollback');
assert.ok(home.sections.testimonials.disabled,'No invented testimonials on the public page');
assert.equal(home.sections.logo_banner.settings.dock_on_scroll,true,'Preserve HOME-01 logo motion');
for(const [id,section] of Object.entries(home.sections)){
 if(section.disabled)continue;
 const col=section.settings.collection;
 if(col)assert.ok(['skin-care-1','hair-care-1','makeup'].includes(col),'Unknown product collection '+id);
 for(const item of Object.values(section.blocks||{})){
   const handle=item.settings?.collection;
   if(handle)assert.ok(['skin-care-1','hair-care-1','makeup'].includes(handle),'Unknown block collection '+id);
 }
}
const rail=read('sections/home-product-rail.liquid');
assert.match(rail,/item\.available and item\.featured_image/);
assert.match(rail,/render 'product-card'/);
assert.match(rail,/role="tablist"/);
const story=read('sections/home-story-mosaic.liquid');
assert.match(story,/candidate\.available and candidate\.featured_image/);
const routine=read('sections/home-routine-video.liquid');
assert.match(routine,/video_tag/);
assert.match(routine,/featured\.price \| money/);
const feature=read('sections/home-feature-scene.liquid');
assert.match(feature,/hero_product\.available/);
const hotspots=read('sections/home-shoppable-photo.liquid');
assert.match(hotspots,/hot_product\.available/);
assert.match(hotspots,/aria-expanded/);
assert.equal(home.sections.hotspots.block_order.length,0,'Do not assign invented product hotspot targets');
const vibes=read('sections/home-beauty-vibes.liquid');
assert.match(vibes,/candidate\.available and candidate\.featured_image/);
const newsletter=read('sections/home-newsletter.liquid');
assert.match(newsletter,/form 'customer'/);
assert.match(newsletter,/contact\[email\]/);
assert.match(newsletter,/posted_successfully\?/);
const footer=read('sections/footer.liquid');
assert.match(footer,/section\.settings\.menu\.links/);
assert.match(footer,/settings\.logo/);
const layout=read('layout/theme.liquid');
assert.ok(layout.includes('home-video-sections.css'));
assert.ok(layout.includes('home-video-sections.js'));
assert.ok(layout.includes('logo-dock.js'));
assert.ok(layout.includes('transparent-header.js'));
const js=read('assets/home-video-sections.js');
assert.match(js,/shopify:section:load/);
assert.match(js,/aria-selected/);
assert.match(js,/Escape/);
console.log('HOME-02–15 video sequence, Shopify schemas, live merchandising, accessibility and safety audit passed');
