import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const source=read('assets/logo-dock.js');
const css=read('assets/logo-banner.css');
const liquid=read('sections/logo-banner.liquid');
const header=read('sections/header.liquid');
const layout=read('layout/theme.liquid');
const homepage=JSON.parse(read('templates/index.json'));

assert.ok(liquid.includes('data-logo-dock-source'));
assert.ok(liquid.includes('data-logo-dock-start'));
assert.ok(liquid.includes('data-logo-dock-end'));
assert.ok(header.includes('data-logo-dock-target'));
assert.ok(layout.includes('logo-dock.js'));
assert.ok(css.includes('.nl-logo-dock-sticky-host'));
assert.ok(css.includes('nl-logo-dock-floating'));
assert.ok(source.includes("window.addEventListener('scroll', schedule, { passive: true })"));
assert.ok(source.includes("window.requestAnimationFrame(paint)"));
assert.ok(source.includes("prefers-reduced-motion: reduce"));
assert.ok(source.includes("shopify:section:load"));
assert.ok(homepage.sections.logo_banner.settings.dock_on_scroll);
assert.equal(homepage.sections.logo_banner.settings.dock_start,10);
assert.equal(homepage.sections.logo_banner.settings.dock_end,80);

const attributes = new Map();
function el(rect, extras={}) {
  const classes = new Set();
  return {
    style:{},hidden:false,
    classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},
    setAttribute:(key,value)=>attributes.set(key,String(value)),
    getAttribute:key=>attributes.has(key)?attributes.get(key):null,
    removeAttribute:key=>attributes.delete(key),
    getBoundingClientRect:()=>rect(),
    querySelector:()=>null,querySelectorAll:()=>[],
    closest:()=>null,cloneNode:()=>el(rect),
    remove(){this.removed=true;},
    isConnected:true,
    ...extras,
  };
}
let scrollY=0, raf=0;
const queue=new Map();
const media={matches:false,addEventListener(){}};
const host=el(()=>({width:400,height:70}));
const frame=el(()=>({left:20,top:340-scrollY,width:340,height:180}),{cloneNode:()=>el(()=>({left:0,top:0,width:340,height:180}))});
const target=el(()=>({left:158,top:19,width:90,height:42}));
const headerElement=el(()=>({left:0,top:0,width:400,height:68}),{querySelector:sel=>sel==='[data-logo-dock-target]'?target:null,closest:()=>host});
const banner=el(()=>({left:0,top:100-scrollY,width:390,height:680}),{
  offsetHeight:680,
  dataset:{logoDockStart:'10',logoDockEnd:'80'},
  querySelector:sel=>sel==='[data-logo-dock-source]'?frame:null
});
const overlays=[];
const listeners={};
const windowMock={
  get scrollY(){return scrollY;},
  get pageYOffset(){return scrollY;},
  matchMedia:()=>media,
  getComputedStyle:()=>({backgroundColor:'rgb(255,255,255)',color:'rgb(30,30,30)',boxShadow:'none',padding:'32px'}),
  addEventListener:(name,fn)=>{listeners[name]=fn;},
  removeEventListener:(name)=>{delete listeners[name];},
  requestAnimationFrame:fn=>{const id=++raf;queue.set(id,fn);return id;},
  cancelAnimationFrame:id=>queue.delete(id)
};
const documentMock={
 readyState:'complete',
 body:{appendChild:el=>{overlays.push(el);}},
 querySelector:sel=>sel.startsWith('[data-logo-banner]')?banner:sel.startsWith('[data-site-header]')?headerElement:null,
 addEventListener:(name,fn)=>{listeners[name]=fn;},
 removeEventListener:(name)=>{delete listeners[name];}
};
const flush=()=>{for(const [id,fn] of [...queue]){queue.delete(id);fn();}};
vm.runInNewContext(source,{window:windowMock,document:documentMock,console});
flush();
assert.equal(overlays.length,1,'Floating visual card should be created exactly once');
assert.equal(frame.style.opacity,'1','Top: full-size semantic card remains visible');
assert.equal(target.style.opacity,'0','Top: header copy remains hidden');
assert.equal(overlays[0].hidden,true);
scrollY=350;listeners.scroll();flush();
assert.equal(overlays[0].hidden,false,'Mid-scroll: floating copy must become visible');
assert.equal(target.style.opacity,'0','Mid-scroll: header should not jump in early');
assert.match(overlays[0].style.transform,/scale\(0\.[0-9]+\)/);
scrollY=760;listeners.scroll();flush();
assert.equal(target.style.opacity,'1','Scrolled down: real header logo visible');
assert.equal(overlays[0].hidden,true,'Scrolled down: temporary card disappears');
assert.equal(frame.style.opacity,'0');
scrollY=0;listeners.scroll();flush();
assert.equal(frame.style.opacity,'1','Scroll up restores full-sized hero card');
assert.equal(target.style.opacity,'0','Scroll up hides header logo again');
assert.equal(overlays[0].hidden,true);
console.log('HOME-01 scroll docking simulation passed at top, mid-scroll, docked and reversed');
