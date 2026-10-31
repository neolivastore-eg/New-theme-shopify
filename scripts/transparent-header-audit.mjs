import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const header=read('sections/header.liquid');
const layout=read('layout/theme.liquid');
const css=read('assets/transparent-header.css');
const js=read('assets/transparent-header.js');
const dock=read('assets/logo-dock.js');
const banner=read('sections/logo-banner.liquid');
const schema=JSON.parse(header.match(/{% schema %}\s*([\s\S]*?)\s*{% endschema %}/)[1]);
assert.equal(schema.class,'nl-header-section','Shopify must attach CSS hook to the native wrapper');
const settings=Object.fromEntries(schema.settings.filter(x=>x.id).map(x=>[x.id,x]));
assert.equal(settings.transparent_home.default,true);
assert.equal(settings.sticky.default,true);
assert.equal(settings.transparency_distance.default,160);
assert.match(header,/template.name == 'index' and section.settings.sticky and section.settings.transparent_home/);
assert.match(header,/data-home-scroll-distance/);
assert.match(header,/data-logo-dock-target/);
assert.match(layout,/<body\{% if template.name == 'index' %\}/);
assert.match(layout,/transparent-header.js/);
assert.match(layout,/transparent-header.css/);
assert.match(layout,/document.documentElement.classList.add\('js'\)/);
assert.match(layout,/logo-dock.js/);
assert.match(css,/position:fixed/,'Header wrapper must be viewport-fixed, not bounded sticky');
assert.match(css,/top:var\(--nl-header-top,0px\)/);
assert.ok(!css.includes('margin-bottom:calc(-1 * var(--nl-overlay-header-height'),'Remove bounded sticky layout');
assert.match(css,/body.template-index:has\(\[data-logo-banner\]\)/);
assert.match(css,/backdrop-filter:blur/);
assert.match(css,/\.mobile-navigation__panel/);
assert.match(js,/window.addEventListener\('scroll', schedule, \{ passive: true \}\)/);
assert.match(js,/document.addEventListener\('shopify:section:load', init\)/);
assert.match(js,/prefers-reduced-motion: reduce/);
assert.match(dock,/data-logo-dock-target/);
assert.match(dock,/usesFixedHeader/);
assert.match(dock,/!usesFixedHeader/);
assert.match(banner,/data-logo-dock-source/);

// Deterministic DOM/event-loop harness: validates progressive opacity, reverse,
// mobile overlay measurement and menu-open readability without a browser runtime.
function classes(initial=[]) {
  const c=new Set(initial);
  return {add:x=>c.add(x),remove:x=>c.delete(x),contains:x=>c.has(x),toggle:(x,enabled)=>{if(enabled)c.add(x);else c.delete(x)}};
}
function style(){
  const data=new Map();
  return {setProperty:(k,v)=>data.set(k,String(v)),getPropertyValue:k=>data.get(k)||'',removeProperty:k=>data.delete(k)};
}
let scrollY=0, open=false, announcementHeight=42, reduced=false, rafId=0;
const callbacks=new Map(), winListeners=new Map(), docListeners=new Map(), headerListeners=new Map();
const host={style:style(),classList:classes()};
const headerEl={
 classList:classes(['site-header--home-overlay']),
 style:style(),dataset:{homeScrollDistance:'160'},isConnected:true,
 closest:sel=>sel==='.shopify-section'?host:null,
 querySelector:sel=>sel==='details[open]'&&open?{}:null,
 getBoundingClientRect:()=>({height:64}),
 addEventListener:(type,fn)=>headerListeners.set(type,fn),
 removeEventListener:type=>headerListeners.delete(type)
};
const bannerEl={isConnected:true};
const announcementEl={isConnected:true,getBoundingClientRect:()=>({bottom:announcementHeight-scrollY})};
const windowMock={
 get scrollY(){return scrollY;},get pageYOffset(){return scrollY;},
 matchMedia:()=>({get matches(){return reduced},addEventListener:(_name,fn)=>winListeners.set('change',fn)}),
 addEventListener:(type,fn)=>winListeners.set(type,fn),
 removeEventListener:type=>winListeners.delete(type),
 requestAnimationFrame:fn=>{const id=++rafId;callbacks.set(id,fn);return id},
 cancelAnimationFrame:id=>callbacks.delete(id)
};
const docMock={
 readyState:'complete',
 querySelector:sel=>sel==='[data-logo-banner]'?bannerEl:sel==='[data-site-header].site-header--home-overlay'?headerEl:sel==='.announcement-bar'?announcementEl:null,
 addEventListener:(type,fn)=>docListeners.set(type,fn),
 removeEventListener:type=>docListeners.delete(type)
};
const flush=()=>{for(const [id,fn] of [...callbacks]){callbacks.delete(id);fn()}};
vm.runInNewContext(js,{window:windowMock,document:docMock});
flush();
assert.equal(host.classList.contains('nl-home-overlay-host'),true);
assert.equal(host.style.getPropertyValue('--nl-header-top'),'42.00px','At scroll top header is below announcement');
assert.equal(headerEl.style.getPropertyValue('--nl-header-surface-opacity'),'0.000','Transparent at top');
scrollY=80;winListeners.get('scroll')();flush();
assert.equal(headerEl.style.getPropertyValue('--nl-header-surface-opacity'),'0.500','Half-transparent halfway');
assert.equal(host.style.getPropertyValue('--nl-header-top'),'0.00px','Announcement scrolls away; header is at viewport top');
scrollY=200;winListeners.get('scroll')();flush();
assert.equal(headerEl.style.getPropertyValue('--nl-header-surface-opacity'),'1.000','Solid after threshold');
assert.equal(headerEl.classList.contains('nl-header--scrolled'),true);
scrollY=1700;winListeners.get('scroll')();flush();
assert.equal(host.style.getPropertyValue('--nl-header-top'),'0.00px','Far down the page header stays at viewport top');
assert.equal(host.classList.contains('nl-home-overlay-host'),true,'Fixed header class remains active past hero');
scrollY=0;winListeners.get('scroll')();flush();
assert.equal(headerEl.style.getPropertyValue('--nl-header-surface-opacity'),'0.000','Returns transparent after scrolling up');
assert.equal(host.style.getPropertyValue('--nl-header-top'),'42.00px','Scrolling up restores announcement offset');
open=true;headerListeners.get('toggle')();flush();
assert.equal(headerEl.style.getPropertyValue('--nl-header-surface-opacity'),'1.000','Menu should get opaque readable surface');
open=false;headerListeners.get('toggle')();flush();
assert.equal(headerEl.style.getPropertyValue('--nl-header-surface-opacity'),'0.000');
announcementHeight=60;winListeners.get('resize')();flush();
assert.equal(host.style.getPropertyValue('--nl-header-top'),'60.00px','Responsive announcement offset remeasured');
reduced=true;winListeners.get('change')();flush();
scrollY=1;winListeners.get('scroll')();flush();
assert.equal(headerEl.style.getPropertyValue('--nl-header-surface-opacity'),'0.000','Reduced motion has no fade at top');
scrollY=10;winListeners.get('scroll')();flush();
assert.equal(headerEl.style.getPropertyValue('--nl-header-surface-opacity'),'1.000','Reduced motion jumps to solid');
console.log('HOME-01 viewport-fixed header deep scroll, alpha, announcement offset, reverse, menu and reduced motion passed');
