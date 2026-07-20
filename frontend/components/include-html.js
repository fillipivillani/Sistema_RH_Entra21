// include-html.js - load HTML fragments into elements with data-include
(function(){
  async function include(){
    const els = document.querySelectorAll('[data-include]');
    for(const el of els){
      const path = el.getAttribute('data-include');
      try{
        const res = await fetch(path);
        if(!res.ok) throw new Error('Failed to load: '+path);
        const text = await res.text();
        el.innerHTML = text;
        markActiveLinks(el);
      }catch(e){
        console.error(e);
      }
    }
  }

  function normalizeName(href){
    if(!href) return '';
    try{
      href = href.split('?')[0].split('#')[0];
      const parts = href.split('/').filter(Boolean);
      return parts.length ? parts[parts.length-1] : '';
    }catch(e){ return href; }
  }

  function markActiveLinks(root){
    const anchors = root.querySelectorAll('a.nav-link, a');
    const current = (function(){
      const href = window.location.href.split('?')[0].split('#')[0];
      const parts = href.split('/').filter(Boolean);
      return parts.length ? parts[parts.length-1] : '';
    })();
    anchors.forEach(a=>{
      const ah = normalizeName(a.getAttribute('href'));
      if(ah && ah === current) a.classList.add('active');
      if(current === '' && ah === 'dashboard.html') a.classList.add('active');
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', include); else include();
})();
