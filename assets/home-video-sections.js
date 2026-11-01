'use strict';
/* HOME-06..12 progressive enhancement — accessible tabs, native scroll-snap and authentic hotspots. */
(() => {
  function init(root=document) {
    root.querySelectorAll('[data-nv-rail]').forEach(section => {
      if(section.dataset.nvReady==='true') return;
      section.dataset.nvReady='true';
      const tabs=Array.from(section.querySelectorAll('[data-nv-tab]'));
      const panels=Array.from(section.querySelectorAll('[data-nv-panel]'));
      const activate=index=>{
        tabs.forEach((tab,i)=>{
          const active=i===index;
          tab.setAttribute('aria-selected',String(active));
          tab.tabIndex=active?0:-1;
          tab.classList.toggle('is-active',active);
        });
        panels.forEach((panel,i)=>panel.hidden=i!==index);
      };
      tabs.forEach((tab,index)=>{
        tab.addEventListener('click',()=>activate(index));
        tab.addEventListener('keydown',event=>{
          if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
          event.preventDefault();
          const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:
            (index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
          activate(next);tabs[next]?.focus();
        });
      });
      section.querySelector('[data-nv-prev]')?.addEventListener('click',()=>{
        section.querySelector('[data-nv-panel]:not([hidden]) [data-nv-track]')?.scrollBy({left:-310,behavior:'smooth'});
      });
      section.querySelector('[data-nv-next]')?.addEventListener('click',()=>{
        section.querySelector('[data-nv-panel]:not([hidden]) [data-nv-track]')?.scrollBy({left:310,behavior:'smooth'});
      });
    });
    root.querySelectorAll('[data-nv-hotspots]').forEach(section=>{
      if(section.dataset.nvReady==='true')return;
      section.dataset.nvReady='true';
      const closeAll=()=>{
        section.querySelectorAll('[data-nv-hotspot]').forEach(button=>{
          button.setAttribute('aria-expanded','false');
          const info=document.getElementById(button.getAttribute('aria-controls'));
          if(info)info.hidden=true;
        });
      };
      section.querySelectorAll('[data-nv-hotspot]').forEach(button=>{
        button.addEventListener('click',()=>{
          const willOpen=button.getAttribute('aria-expanded')!=='true';
          closeAll();
          if(!willOpen)return;
          button.setAttribute('aria-expanded','true');
          const info=document.getElementById(button.getAttribute('aria-controls'));
          if(info)info.hidden=false;
        });
      });
      section.addEventListener('keydown',event=>{if(event.key==='Escape'){closeAll();}});
      document.addEventListener('click',event=>{
        if(section.isConnected && !section.contains(event.target))closeAll();
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});
  else init();
  document.addEventListener('shopify:section:load',event=>init(event.target));
})();
