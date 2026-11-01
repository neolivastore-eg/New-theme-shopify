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

  await page.waitForSelector('[data-logo-banner].nl-logo-banner--image-only .nl-logo-banner__brand-image',{timeout:15000});
  const logoProof=await page.evaluate(async()=>{
    const img=document.querySelector('[data-logo-banner] .nl-logo-banner__brand-image');
    const frame=img?.closest('[data-logo-dock-source]');
    if (!img || !frame) return {error:'Missing actual logo image or source'};
    try {await img.decode()}catch{}
    const style=getComputedStyle(frame);
    const result={url:img.currentSrc || img.src,loaded:img.complete&&img.naturalWidth>0,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,background:style.backgroundColor,shadow:style.boxShadow,padding:style.padding,alphaFraction:null};
    try {
      const canvas=document.createElement('canvas');
      canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      const context=canvas.getContext('2d',{willReadFrequently:true});
      context.drawImage(img,0,0);
      const imageData=context.getImageData(0,0,canvas.width,canvas.height).data;
      let zero=0;
      for(let i=3;i<imageData.length;i+=4){if(imageData[i]<250)zero++}
      result.alphaFraction=Number((zero/(canvas.width*canvas.height)).toFixed(4));
    }catch(error){result.canvasError=String(error)}
    return result;
  });
  console.log(options.name,'logo-alpha-and-frame',JSON.stringify(logoProof));
  assert.ok(logoProof.loaded,options.name+': real Neoliva logo image must load');
  assert.match(logoProof.url,/d7d39038-c498/,options.name+': correct green logo asset');
  assert.ok(logoProof.background === 'rgba(0, 0, 0, 0)' || logoProof.background === 'transparent',options.name+': logo background card must be transparent');
  assert.equal(logoProof.shadow,'none',options.name+': no surrounding white card shadow');
  assert.equal(logoProof.padding,'0px',options.name+': no blank padded logo plate');

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

  const portrait=await page.evaluate(async()=>{
    const hero=document.querySelector('[data-logo-banner]');
    const image=hero?.querySelector('.nl-logo-banner__background-image');
    if(!image)return {error:'No banner image'};
    try{await image.decode()}catch{}
    const photoStyle=getComputedStyle(image);
    const photoContainer=image.closest('.nl-logo-banner__picture');
    const containerRect=photoContainer?.getBoundingClientRect();
    const heroRect=hero.getBoundingClientRect();
    return{
      hasCampaignClass:hero.classList.contains('nl-logo-banner--campaign-portrait'),
      url:image.currentSrc||image.src,
      ready:image.complete&&image.naturalWidth>=300&&image.naturalHeight>=600,
      naturalSize:[image.naturalWidth,image.naturalHeight],
      objectFit:photoStyle.objectFit,
      objectPosition:photoStyle.objectPosition,
      photoWidth:containerRect?.width,
      heroWidth:heroRect.width,
      heroHeight:heroRect.height,
      overlayDisplay:getComputedStyle(hero.querySelector('.nl-logo-banner__overlay')).display,
      logoTransparent:hero.classList.contains('nl-logo-banner--image-only'),
      logoWidth:hero.querySelector('[data-logo-dock-source]')?.getBoundingClientRect().width,
      logoImageWidth:hero.querySelector('.nl-logo-banner__brand-image')?.getBoundingClientRect().width,
      animated:hero.dataset.logoDock==='true'
    };
  });
  console.log(options.name,'real-neoliva-campaign-photo',JSON.stringify(portrait));
  assert.ok(portrait.hasCampaignClass,options.name+': portrait arrangement must be activated');
  assert.ok(portrait.url.includes('neoliva-home-logo-banner-campaign-2026.jpg'),options.name+': correct uploaded merchant image');
  assert.ok(portrait.ready,options.name+': uploaded merchant campaign image must load');
  assert.equal(portrait.objectFit,'cover',options.name+': portrait media requires cover fit');
  assert.equal(portrait.objectPosition,'50% 100%',options.name+': product-focused photo should align to bottom');
  assert.equal(portrait.overlayDisplay,'none',options.name+': no dark overlay should obscure products');
  assert.equal(portrait.logoTransparent,true,options.name+': logo must remain image-only');
  assert.equal(portrait.animated,true,options.name+': existing scroll logo dock must remain active');
  if(options.name==='mobile'){
    assert.ok(portrait.heroHeight>=675&&portrait.heroHeight<710,options.name+': restored original 680px hero height');
    assert.ok(portrait.logoWidth>315&&portrait.logoWidth<355,options.name+': original v0.9.0 mobile logo width must return');
    assert.ok(portrait.photoWidth>=options.viewport.width-2,options.name+': photo should cover width');
  }else{
    assert.ok(portrait.photoWidth<portrait.heroWidth*.55,options.name+': portrait image must be right-hand composition');
    assert.ok(portrait.photoWidth>=450,options.name+': showcase should be prominent');
    assert.ok(portrait.logoWidth>580&&portrait.logoWidth<=635,options.name+': original v0.9.0 desktop logo width must return');
  }

  await page.screenshot({path:output+'/'+options.name+'-top.png',fullPage:false});

  // Inspect real intermediate desktop/mobile animation frames — the earlier
  // browser test only checked at scroll 0 and 2000px, missing the regression.
  const thresholds=await page.evaluate(()=>{
    const banner=document.querySelector('[data-logo-banner]');
    const top=window.scrollY+banner.getBoundingClientRect().top;
    const h=banner.offsetHeight;
    return {start:top+h*Number(banner.dataset.logoDockStart)/100,
      finish:top+h*Number(banner.dataset.logoDockEnd)/100};
  });
  const mid=[];
  for (const fraction of [.25,.5,.75]) {
    const y=thresholds.start+(thresholds.finish-thresholds.start)*fraction;
    await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);
    await page.waitForTimeout(200);
    const snapshot=await page.evaluate(()=>{
      const banner=document.querySelector('[data-logo-banner]');
      const image=document.querySelector('.nl-logo-dock-image');
      const rect=image?.getBoundingClientRect();
      const headerLogo=document.querySelector('[data-logo-dock-target]');
      return {
        progress:Number(banner.dataset.logoDockProgress),
        hidden:image?.hidden,
        count:document.querySelectorAll('.nl-logo-dock-image').length,
        rect:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height}:null,
        opacity:headerLogo?.style.opacity
      };
    });
    console.log(options.name,'logo-at-'+Math.round(fraction*100)+'pct',JSON.stringify(snapshot));
    assert.ok(Math.abs(snapshot.progress-fraction)<.04,options.name+': scroll motion must track progress');
    assert.equal(snapshot.hidden,false,options.name+': moving image visible during motion');
    assert.equal(snapshot.count,1,options.name+': no duplicate image clones');
    assert.ok(snapshot.rect?.width>4&&snapshot.rect?.height>4,options.name+': image dimensions visible');
    const ratio=snapshot.rect.width/snapshot.rect.height;
    assert.ok(ratio>1.70&&ratio<1.85,options.name+': uniform image ratio, no aspect distortion');
    if(mid.length) assert.ok(snapshot.rect.width<mid[mid.length-1].rect.width,options.name+': size must decrease smoothly');
    mid.push(snapshot);
    if(fraction===.5) await page.screenshot({path:output+'/'+options.name+'-logo-mid.png',fullPage:false});
  }
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),thresholds.finish+15);
  await page.waitForTimeout(200);
  const docked=await page.evaluate(()=>({
    progress:Number(document.querySelector('[data-logo-banner]').dataset.logoDockProgress),
    hidden:document.querySelector('.nl-logo-dock-image')?.hidden,
    headerOpacity:Number(document.querySelector('[data-logo-dock-target]')?.style.opacity)
  }));
  assert.equal(docked.hidden,true,options.name+': clone disappears after docking');
  assert.ok(docked.headerOpacity>.99,options.name+': real header logo visible after docking');
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(200);

  // Shopify auto-scroll and section re-render cannot be reproduced from the
  // unauthenticated public preview. Simulate documented Shopify.designMode and
  // shopify:section:load on the same real storefront to test editor controls.
  await page.evaluate(()=>{
    window.Shopify=window.Shopify||{};
    window.Shopify.designMode=true;
    document.dispatchEvent(new Event('shopify:section:load',{bubbles:true}));
  });
  await page.locator('.nl-logo-dock-editor').waitFor({timeout:6000});
  const editor=page.locator('.nl-logo-dock-editor');
  await editor.locator('input[type=range]').evaluate(el=>{
    el.value='50';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.waitForFunction(()=>document.querySelector('[data-logo-banner]')?.dataset.logoDockProgress==='0.5000');
  const editorMid=await page.evaluate(()=>({
    editorCount:document.querySelectorAll('.nl-logo-dock-editor').length,
    floatingCount:document.querySelectorAll('.nl-logo-dock-image').length,
    progress:Number(document.querySelector('[data-logo-banner]').dataset.logoDockProgress),
    visible:!document.querySelector('.nl-logo-dock-image')?.hidden
  }));
  console.log(options.name,'editor-scrub',JSON.stringify(editorMid));
  assert.equal(editorMid.editorCount,1,'Editor controls must not duplicate');
  assert.equal(editorMid.floatingCount,1,'Editor section reload must dispose old floating logo');
  assert.equal(editorMid.visible,true,'Editor scrubber must animate logo image without scrolling');
  await page.screenshot({path:output+'/'+options.name+'-editor-preview.png',fullPage:false});
  await editor.getByRole('button',{name:'Play'}).click();
  await page.waitForTimeout(350);
  const played=await page.evaluate(()=>Number(document.querySelector('[data-logo-banner]').dataset.logoDockProgress));
  assert.ok(played>.05&&played<.85,options.name+': editor Play drives progressive motion');
  await editor.getByRole('button',{name:'Use scroll'}).click();
  await page.waitForTimeout(100);
  const reset=await page.evaluate(()=>Number(document.querySelector('[data-logo-banner]').dataset.logoDockProgress));
  assert.ok(reset<.04,options.name+': Use scroll returns to natural top progress');

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
