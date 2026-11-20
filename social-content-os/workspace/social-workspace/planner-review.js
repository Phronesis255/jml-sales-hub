/* Add workspace navigation while retaining the original standalone source gallery. */
(() => {
  'use strict';
  const detail=document.getElementById('detail');
  const selector=document.getElementById('brand');
  const records=new Map(DATA.map(post=>[post.id,post]));
  const accountNames=new Map(DATA.map(post=>[post.brand_id,post.brand]));
  let bridge;
  try {
    if(window.parent!==window && parent.location.origin===location.origin && parent.JMLGallery?.account(window)) bridge=parent.JMLGallery;
  } catch { /* The standalone gallery can also be hosted on its own. */ }
  const account=bridge?.account(window);
  const filterAccount=account || new URLSearchParams(location.search).get('account');
  const headerLink=document.createElement('a');
  headerLink.textContent='Open Social Workspace';
  headerLink.className='gallery-workspace-link';
  const originalLink=document.querySelector('header a');
  originalLink.after(headerLink);
  function route(brand,id) {
    return 'social-workspace.html'+(brand?'?brand='+encodeURIComponent(brand):'')+(id?'#content/'+encodeURIComponent(id)+'/brief':'#plan');
  }
  const updateHeader=()=>{
    const brand=[...accountNames.keys()].find(id=>accountNames.get(id)===selector.value);
    headerLink.href=route(brand);
  };
  if (accountNames.has(filterAccount))selector.value=accountNames.get(filterAccount);
  selector.addEventListener('change',updateHeader);updateHeader();
  if (bridge) {
    document.documentElement.classList.add('gallery-in-planner');
    const style=getComputedStyle(parent.document.documentElement);
    for (const key of ['--jml-purple','--jml-soft-purple','--jml-ink','--brand-sidebar'])document.documentElement.style.setProperty(key,style.getPropertyValue(key));
    selector.disabled=true;
    document.querySelector('header h1').textContent=accountNames.get(account)+' artwork';
    originalLink.textContent='Back to calendar';originalLink.onclick=ev=>{ev.preventDefault();bridge.back(window);};
    headerLink.hidden=true;
    const exported=DATA.filter(p=>p.brand_id===account);
    const exportBtn=document.getElementById('export');exportBtn.textContent='Export '+exported.length+' items';
    exportBtn.onclick=()=>{
      const link=document.createElement('a');
      const url=URL.createObjectURL(new Blob([JSON.stringify(exported,null,2)],{type:'application/json'}));
      link.href=url;link.download=account+'-prepared-artwork.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
    };
    const originalRender=render;
    render=()=>{
      selector.value=accountNames.get(account);originalRender();
      document.getElementById('summary').textContent=document.querySelectorAll('#grid .card').length+' posts shown';
    };
    for (const id of ['platform','search'])document.getElementById(id).addEventListener(id==='search'?'input':'change',render);
  }
  const originalOpen=openPost;
  openPost=id=>{
    const post=records.get(id);
    if(!post || (bridge && post.brand_id!==account)){
      if(detail.open)detail.close();
      return;
    }
    originalOpen(id);
    const action=document.createElement('a');
    action.className='link';action.textContent='Open in Studio';
    action.href=route(post.brand_id,post.id);
    if(bridge)action.onclick=ev=>{ev.preventDefault();bridge.studio(window,post.id);};
    detail.querySelector('.actions').prepend(action);
  };
  render();
  if(location.hash)openPost(location.hash.slice(1));
})();
