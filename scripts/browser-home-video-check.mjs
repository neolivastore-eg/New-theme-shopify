import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({
  headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',
  args:['--no-sandbox']
});
await mkdir('browser-proof',{recursive:true});
const url='https://neoliva.store/?preview_theme_id=166928548069';
const viewports=[{name:'mobile',width:390,height:844},{name:'desktop',width:1440,height:900}];
const results=[];
try {
  for(const size of viewports) {
    const context=await browser.newContext({viewport:{width:size.width,height:size.height},deviceScaleFactor:1});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForSelector('[data-logo-banner]',{timeout:20000});
    await page.waitForSelector('.nv-editorial-line__heading',{timeout:20000});
    await page.waitForTimeout(1100);
    const info=await page.evaluate(()=>{
      const selectors={
        logo:'[data-logo-banner]',
        editorial:'.nv-editorial-line',
        promos:'.campaign-section',
        story:'.nv-story',
        routine:'.nv-routine',
        rail:'.nv-rail',
        feature:'.nv-feature',
        typed:'.nv-type-collections',
        hotspots:'.nv-hotspots',
        vibes:'.nv-vibes',
        benefits:'.benefits-section',
        newsletter:'.nv-newsletter',
        footer:'.nv-footer'
      };
      const counts=Object.fromEntries(Object.entries(selectors).map(([k,v])=>[k,document.querySelectorAll(v).length]));
      const visibleProductCards=document.querySelectorAll('.nv-rail__panel:not([hidden]) .product-card').length;
      const allProductCards=document.querySelectorAll('.nv-rail .product-card').length;
      const media=document.querySelectorAll('.nv-story__image, .nv-routine__cover, .nv-feature__image, .nv-vibes__image, .nv-editorial-line__chip-image').length;
      const style=getComputedStyle(document.querySelector('.nv-editorial-line__heading'));
      const heading=document.querySelector('.nv-editorial-line__heading')?.textContent?.trim();
      const newsletter=document.querySelector('.nv-newsletter form');
      return {counts,visibleProductCards,allProductCards,media,displayFont:style.fontFamily,
        heading,newsletterMethod:newsletter?.method,newsletterEmail:!!document.querySelector('.nv-newsletter input[name="contact[email]"]'),
        horizontalOverflow:document.documentElement.scrollWidth-window.innerWidth,
        totalScrollHeight:document.documentElement.scrollHeight,
        headerPosition:getComputedStyle(document.querySelector('.nl-home-overlay-host')).position,
        logoSource:!!document.querySelector('.nl-logo-dock-image')};
    });
    console.log(size.name,'home-video-audit',JSON.stringify(info));
    const required={logo:1,editorial:1,promos:1,story:1,routine:1,rail:3,feature:2,typed:1,hotspots:1,vibes:1,benefits:1,newsletter:1,footer:1};
    for(const [key,count] of Object.entries(required))
      assert.equal(info.counts[key],count,size.name+' missing video section: '+key);
    assert.equal(info.headerPosition,'fixed',size.name+': keep approved fixed header');
    assert.ok(info.newsletterEmail,size.name+': Shopify customer email capture missing');
    assert.ok(info.totalScrollHeight>size.height*3,size.name+': sections not filling page');
    assert.ok(info.horizontalOverflow<8,size.name+': horizontal overflow');
    assert.ok(info.media>=4,size.name+': real product/lifestyle imagery missing');
    assert.ok(info.allProductCards>0,size.name+': real Shopify product rails empty');
    assert.equal(errors.length,0,size.name+': browser JavaScript errors: '+errors.join(' | '));
    await page.screenshot({path:'browser-proof/home-video-'+size.name+'-full.png',fullPage:true});
    const tabs=page.locator('.nv-rail').first().locator('[data-nv-tab]');
    assert.ok(await tabs.count()>1,size.name+': bestseller tab selectors missing');
    await tabs.nth(1).click({force:true});
    assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true',size.name+': tab did not update');
    const panels=page.locator('.nv-rail').first().locator('[data-nv-panel]');
    assert.equal(await panels.nth(1).getAttribute('hidden'),null,size.name+': second tab panel hidden');
    const activeProductLinks=await panels.nth(1).locator('a.product-card').count();
    console.log(size.name,'active-tab-product-count',activeProductLinks);
    await page.evaluate(()=>window.scrollTo(0,2000));
    await page.waitForTimeout(350);
    const after=await page.evaluate(()=>{
      const h=document.querySelector('.nl-home-overlay-host');
      return {position:h?getComputedStyle(h).position:null,top:h?.getBoundingClientRect().top};
    });
    assert.equal(after.position,'fixed');
    assert.ok(Math.abs(after.top)<3,size.name+': header moved after deep scroll');
    results.push({viewport:size.name,info,activeProductLinks});
    await context.close();
  }
  console.log('PASS: complete HOME-02–15 mobile & desktop browser sections, images, products, tab interaction, newsletter and fixed header');
} finally {await browser.close();}
