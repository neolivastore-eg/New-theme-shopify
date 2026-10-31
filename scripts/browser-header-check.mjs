import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {mkdir} from 'node:fs/promises';

const target='https://neoliva.store/?preview_theme_id=166928548069';
const executable=process.env.CHROME_BIN;
const browser=await chromium.launch(executable?{headless:true,executablePath:executable,args:['--no-sandbox']}:{headless:true,channel:'chrome',args:['--no-sandbox']});
const output='browser-proof';await mkdir(output,{recursive:true});
const points=[
  {name:'mobile',viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true},
  {name:'desktop',viewport:{width:1440,height:900},deviceScaleFactor:1}
];
try {
for(const options of points){
  const context=await browser.newContext({viewport:options.viewport,deviceScaleFactor:options.deviceScaleFactor,isMobile:options.isMobile||false,hasTouch:options.hasTouch||false});
  const page=await context.newPage();
  await page.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('[data-logo-banner]',{timeout:18000});
  await page.waitForFunction(()=>!!document.querySelector('.nl-home-overlay-host'),null,{timeout:15000});
  const inspect=async()=>page.evaluate(()=>{
    const header=document.querySelector('[data-site-header].site-header--home-overlay');
    const wrapper=header?.closest('.shopify-section');
    const rect=wrapper?.getBoundingClientRect();
    const logo=header?.querySelector('[data-logo-dock-target]');
    const announcement=document.querySelector('.announcement-bar');
    return {
      scrollY:window.scrollY,
      position:wrapper?getComputedStyle(wrapper).position:null,
      top:rect?.top,
      width:rect?.width,
      viewportWidth:window.innerWidth,
      surface:header?Number(getComputedStyle(header,'::before').opacity):null,
      logoOpacity:logo?getComputedStyle(logo).opacity:null,
      announcementBottom:announcement?.getBoundingClientRect().bottom,
      heroFound:!!document.querySelector('[data-logo-banner]'),
      heroH1:document.querySelector('[data-logo-banner] h1')?.textContent?.trim()
    };
  });
  const top=await inspect();
  console.log(options.name,'top',JSON.stringify(top));
  assert.equal(top.position,'fixed',options.name+': header wrapper must not be sticky in short group');
  assert.ok(top.top>=-2 && top.top<120,options.name+': header should begin near announcement');
  assert.ok(top.width>=options.viewport.width-2,options.name+': header must cover viewport');
  assert.ok(top.surface<0.08,options.name+': header should start visually transparent');
  await page.screenshot({path:output+'/'+options.name+'-top.png',fullPage:false});
  await page.evaluate(()=>window.scrollTo(0,Math.max(2000,window.innerHeight*2)));
  await page.waitForTimeout(550);
  const down=await inspect();
  console.log(options.name,'deep-scroll',JSON.stringify(down));
  assert.ok(down.scrollY>=1600,options.name+': actually scroll deep into the page');
  assert.equal(down.position,'fixed',options.name+': fixed position persists');
  assert.ok(Math.abs(down.top)<3,options.name+': header remains at viewport top far beyond hero');
  assert.ok(down.surface>0.98,options.name+': header surface becomes cream/opaque');
  await page.screenshot({path:output+'/'+options.name+'-scrolled.png',fullPage:false});
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(550);
  const returned=await inspect();
  console.log(options.name,'reversed',JSON.stringify(returned));
  assert.ok(returned.scrollY<3);
  assert.ok(returned.surface<0.08,options.name+': scroll-up should restore transparency');
  await context.close();
}
console.log('PASS: real Chrome mobile and desktop fixed-header deep-scroll and reversal');
} finally {await browser.close();}
