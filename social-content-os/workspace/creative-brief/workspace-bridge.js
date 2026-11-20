/* Active only when hosted by the local Social Workspace. Standalone Studio remains available. */
(()=>{
 'use strict';if(window.parent===window||new URLSearchParams(location.search).get('workspace')!=='1')return;
 let connection=null;
 const fonts=document.createElement('link');fonts.rel='stylesheet';fonts.href='../social-workspace/fonts.css';document.head.append(fonts);
 const polish=document.createElement('style');polish.textContent=`
 body{background:var(--mist,var(--paper));color:var(--ink);font-synthesis:none}
 .workspace-connection{background:var(--rail)!important;color:var(--rail-text)!important;font-size:12px}
 .workspace-connection button{font:500 12px "DM Sans",Arial,sans-serif!important;min-height:36px;padding:7px 12px!important;border-radius:5px!important}
 .topbar{background:var(--surface);border-color:var(--line)}.topbrand>span{font-weight:500;color:var(--muted);letter-spacing:1px}
 button,input,select,textarea{border-radius:5px;font-weight:400;min-height:36px}
 button{font-weight:500;border-color:var(--control-border);color:var(--ink)}input,select,textarea{background:var(--surface)!important;border-color:var(--control-border)!important;color:var(--ink)}
 .field label,.eyebrow,b,strong{font-weight:500}.eyebrow{font-family:"JetBrains Mono",monospace;font-size:9px;letter-spacing:.08em}
 .panel,.progresscard,.library,.brief-preview{border-radius:7px;box-shadow:none}.panel{padding:24px}
 .primary{background:var(--brand-accent);color:var(--on-accent);border-color:var(--brand-accent)}.dark{background:var(--brand-primary);color:var(--on-primary);border-color:var(--brand-primary)}
 .brief-preview{background:var(--rail);color:var(--rail-text)}.brief-preview h3{color:var(--rail-text)}.brief-preview .preview-note{color:var(--rail-muted)}.brief-preview .eyebrow{color:var(--rail-accent)}
 .badge,.field .module-tag{background:var(--soft);border-color:var(--line);color:var(--purple);border-radius:4px}.stepbutton[aria-current=step]{background:var(--soft);box-shadow:none}.stepbutton.complete .stepnum{color:var(--on-accent)}
 .workspace-head h1{font-size:32px}.panel h2{font-size:27px}.field small,.stepmeta{color:var(--muted)}.field{margin-bottom:22px}
 :is(button,a,input,textarea,select,summary):focus-visible{outline:2px solid var(--focus);outline-offset:3px}
 @media(max-width:760px){button,input,select,textarea{min-height:44px}.workspace-connection button{min-height:44px}.field input,.field textarea,.field select{font-size:16px}.panel{padding:18px}}
 `;document.head.append(polish);
 const bar=document.createElement('div');bar.className='workspace-connection';bar.style.cssText='position:sticky;top:0;z-index:50;padding:12px 22px;background:var(--purple,#4c0099);color:white;display:flex;align-items:center;gap:16px;flex-wrap:wrap';
 const status=document.createElement('span');status.setAttribute('role','status');status.textContent='Waiting for the shared content record…';
 const save=document.createElement('button');save.type='button';save.textContent='Save workspace revision';save.disabled=true;save.style.cssText='margin-left:auto;background:white;color:#222;border:1px solid #ddd;border-radius:5px;padding:10px 16px;font:600 14px Arial;cursor:pointer';bar.append(status,save);document.body.prepend(bar);
 $('remember').checked=false;$('remember').disabled=true;$('recovery').hidden=true;
 const top=document.querySelector('.toplinks');if(top)top.hidden=true;
 save.addEventListener('click',()=>{if(!connection)return;save.disabled=true;status.textContent='Saving to the shared workspace…';parent.postMessage({type:'jml-studio-save',token:connection.token,snapshot:snapshot()},location.origin);});
 window.addEventListener('message',ev=>{
   if(ev.source!==parent||ev.origin!==location.origin)return;const data=ev.data;
   if(data?.type==='jml-studio-load'){
     try{fill(normalize(data.snapshot));connection={token:data.token,revision:data.revision};dirty=false;$('recovery').hidden=true;
       for(const key of ['channel','owner','schedule']){$(key).readOnly=true;$(key).title='Managed in the workspace calendar and named assignments.';}
       if(/^#[a-f0-9]{6}$/i.test(data.palette?.purple||'')){document.documentElement.style.setProperty('--purple',data.palette.purple);document.documentElement.style.setProperty('--deep',data.palette.purple);}
       if(/^#[a-f0-9]{6}$/i.test(data.palette?.lime||''))document.documentElement.style.setProperty('--lime',data.palette.lime);
       for(const key of ['ink','paper','line','muted'])if(/^#[a-f0-9]{6}$/i.test(data.palette?.[key]||''))document.documentElement.style.setProperty('--'+key,data.palette[key]);
       for(const [key,value]of Object.entries(data.theme||{}))if(/^--[a-z-]+$/.test(key)&&/^#[a-f0-9]{6}$/i.test(value))document.documentElement.style.setProperty(key,value);
       if(data.theme?.['--rail'])document.documentElement.style.setProperty('--deep',data.theme['--rail']);
       status.textContent=data.brand+' · '+data.contentId+' · '+data.actor+' · Brief '+data.revision;save.disabled=false;
     }catch(err){status.textContent=err.message;}
   }
   if(data?.type==='jml-studio-saved'){connection.revision=data.revision;dirty=false;status.textContent='Saved to workspace · Brief revision '+data.revision;save.disabled=false;}
   if(data?.type==='jml-studio-error'){status.textContent=data.message;save.disabled=false;}
 });
 parent.postMessage({type:'jml-studio-ready'},location.origin);
})();
