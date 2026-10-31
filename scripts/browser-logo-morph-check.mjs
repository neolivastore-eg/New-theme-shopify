import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch(process.env.CHROME_BIN?
  {headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']}:
  {headless:true,channel:'chrome',args:['--no-sandbox']});
const dir='browser-proof';await mkdir(dir,{recursive:true});
const sizes=[{name:'mobile',width:390,height:844,isMobile:true},{name:'desktop',width:1440,height:900,isMobile:false}];
const fractions=[.01,.10,.22,.38,.55,.72,.88,.97,.995];
try {
 for (const device of sizes) {
  const ctx=await browser.newContext({viewport:{width:device.width,height:device.height},isMobile:device.isMobile,hasTouch:device.isMobile});
  const page=await ctx.newPage();
  await page.goto('https://neoliva.store/?preview_theme_id=166928548069',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('[data-logo-banner].nl-logo-banner--image-only .nl-logo-banner__brand-image',{timeout:18000});
  await page.waitForFunction(()=>document.querySelector('img.nl-logo-dock-floating') && document.querySelector('.nl-home-overlay-host'),null,{timeout:15000});
  const bounds=await page.evaluate(()=>{
   document.documentElement.style.scrollBehavior='auto';
   const el=document.querySelector('[data-logo-banner]');
   const top=el.getBoundingClientRect().top+window.scrollY;
   return {start:top+el.offsetHeight*(Number(el.dataset.logoDockStart)/100),end:top+el.offsetHeight*(Number(el.dataset.logoDockEnd)/100)};
  });
  assert.ok(bounds.end-bounds.start>240,device.name+': needs a real scroll journey');
  let previousWidth=Infinity,previousHeight=Infinity,firstRatio=null;
  for (const f of fractions) {
   const y=bounds.start+(bounds.end-bounds.start)*f;
   await page.evaluate(y=>window.scrollTo(0,y),y);
   await page.waitForTimeout(95);
   const s=await page.evaluate(()=>{
    const source=document.querySelector('[data-logo-banner] .nl-logo-banner__brand-image');
    const original=source.getBoundingClientRect();
    const target=document.querySelector('[data-logo-dock-target] .site-header__logo').getBoundingClientRect();
    const floating=document.querySelector('img.nl-logo-dock-floating');
    const rect=floating.getBoundingClientRect();
    const frame=document.querySelector('[data-logo-dock-source]');
    return {y:window.scrollY,src:{w:original.width,h:original.height},dest:{w:target.width,h:target.height,left:target.left,top:target.top},
      move:{w:rect.width,h:rect.height,left:rect.left,top:rect.top},
      hidden:floating.hidden, opacity:getComputedStyle(floating).opacity,
      sourceOpacity:getComputedStyle(frame).opacity,
      headerOpacity:getComputedStyle(document.querySelector('[data-logo-dock-target]')).opacity,
      transform:getComputedStyle(floating).transform};
   });
   console.log(device.name,'logo-motion',f.toFixed(3),JSON.stringify(s));
   assert.equal(s.hidden,false,device.name+': moving image should remain visible during the transition');
   assert.ok(s.move.w<previousWidth+0.35,device.name+': image width must SHRINK monotonically, no rebound at '+f);
   assert.ok(s.move.h<previousHeight+0.35,device.name+': image height must SHRINK monotonically, no rebound at '+f);
   const ratio=s.move.w/s.move.h;
   if(firstRatio!==null) assert.ok(Math.abs(ratio-firstRatio)<.025,device.name+': distorted aspect ratio during zoom');
   else firstRatio=ratio;
   assert.equal(s.sourceOpacity,'0',device.name+': hidden source cannot double-expose the logo');
   previousWidth=s.move.w;previousHeight=s.move.h;
   if(f===.38 || f===.88) await page.screenshot({path:dir+'/'+device.name+'-morph-'+Math.round(f*100)+'.png'});
   if(f===.995) {
     const endW=Math.min(s.dest.w,s.src.w*s.dest.h/s.src.h);
     const endH=Math.min(s.dest.h,s.src.h*s.dest.w/s.src.w);
     assert.ok(Math.abs(s.move.w-endW)<3.5,device.name+': final image width must match real header image, not its enclosing link');
     assert.ok(Math.abs(s.move.h-endH)<3.5,device.name+': final image height must match real header image');
     assert.ok(Math.abs(s.move.left-s.dest.left)<5,device.name+': image must dock at header image X');
     assert.ok(Math.abs(s.move.top-s.dest.top)<5,device.name+': image must dock at header image Y');
   }
  }
  await page.evaluate(y=>window.scrollTo(0,y),bounds.end+100);
  await page.waitForTimeout(110);
  const docked=await page.evaluate(()=>({hidden:document.querySelector('img.nl-logo-dock-floating')?.hidden,
    headerOpacity:getComputedStyle(document.querySelector('[data-logo-dock-target]')).opacity}));
  assert.equal(docked.hidden,true);
  assert.equal(docked.headerOpacity,'1');
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(150);
  const restored=await page.evaluate(()=>({hidden:document.querySelector('img.nl-logo-dock-floating')?.hidden,
    sourceOpacity:getComputedStyle(document.querySelector('[data-logo-dock-source]')).opacity}));
  assert.equal(restored.hidden,true);
  assert.equal(restored.sourceOpacity,'1');
  await ctx.close();
 }
 console.log('PASS: logo image geometrically uniform and monotonic on mobile/desktop, docked, and reversed');
}finally{await browser.close()}
