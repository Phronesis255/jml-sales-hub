/* Same-origin bridge to the full Creative Brief Studio, using canonical brief snapshots. */
(function(root){
 'use strict';const C=root.JMLCore;let session=null;
 function studioSnapshot(p,brand){
   const b=p.brief,v=b.creativeBrief?.values||{},old=b.studioBrief;
   return {schema:'jml-creative-brief',version:2,context:old?.context||'social',output:old?.output||(b.creativeBrief?.kind==='Video'?'video':'graphic'),step:old?.step||'strategy',values:{
     ...(old?.values||{}),project:p.title,goal:b.objective,audience:b.audience,cta:b.cta,caption:b.caption,pillar:b.pillar,
     hook:old?.values?.hook||v.Hook||p.title,message:old?.values?.message||v['Key message']||'',channel:p.platform,
     format:old?.values?.format||[p.format,v['Dimensions (px)'],v['Slide count']?v['Slide count']+' slides':''].filter(Boolean).join(' · '),
     body:b.slideCopy,visual:old?.values?.visual??b.direction,brand:old?.values?.brand||brand.name,
     layout:old?.values?.layout||v['Layout / slide map']||'',shots:old?.values?.shots||v['Shot list & timing']||'',duration:old?.values?.duration||v['Runtime (sec)']||'',
     audio:old?.values?.audio||v['Captions / accessibility']||v['Image alt text']||'',sound:old?.values?.sound||v['Audio direction']||'',
     assets:old?.values?.assets||v['Visual assets & rights']||'',delivery:old?.values?.delivery||v['Export package']||'',
     owner:'Delivery: '+b.owner+' · Final approval: '+b.approver,
     schedule:'Proposed release: '+p.date+' '+p.time+' '+p.timezone+(v['Draft due (PT)']?' · Draft due: '+v['Draft due (PT)']:''),
     references:old?.values?.references||[...(p.sources||[]),v['Reference URL']].filter(Boolean).join('\n')
   }};
 }
 function open(ctx,p){
   root.JMLGovernance?.assert(ctx.state,ctx.ui,'edit',p);session={ctx,postId:p.id,brandId:p.brandId,personId:ctx.ui.personId,revision:p.briefRevision,token:C.id('studio')};
   ctx.showModal('Creative Brief Studio · '+ctx.e(p.externalId||p.title),'<div class="studio-connection"><p id="studio-connection-status" role="status">Opening the shared brief…</p><p>Save a workspace revision inside the editor before closing. Assignments and calendar timing stay in the workspace workflow.</p></div><iframe id="canonical-brief-studio" title="Creative Brief Studio for '+ctx.e(p.title)+'" src="creative-brief/index.html?workspace=1"></iframe>');
 }
 function body(snapshot){
   if(!snapshot||snapshot.schema!=='jml-creative-brief'||snapshot.version!==2||!snapshot.values||Object.values(snapshot.values).some(v=>typeof v!=='string'||v.length>40000)||JSON.stringify(snapshot).length>1500000)throw Error('The Studio returned an invalid brief.');
   if(!snapshot.values.project?.trim())throw Error('Give this content a title before saving.');
   const v=snapshot.values;return {title:v.project.trim(),brief:{objective:v.goal||'',audience:v.audience||'',cta:v.cta||'',caption:v.caption||'',pillar:v.pillar||'',direction:(snapshot.output==='video'?v.shots:v.layout)||v.visual||'',slideCopy:v.body||'',studioBrief:C.clone(snapshot)}};
 }
 window.addEventListener('message',async ev=>{
   const frame=document.getElementById('canonical-brief-studio'),s=session;if(!s||!frame||ev.source!==frame.contentWindow||ev.origin!==location.origin)return;
   const ctx=s.ctx,send=data=>frame.contentWindow.postMessage(data,location.origin);
   if(ctx.ui.brand!==s.brandId||ctx.ui.personId!==s.personId){send({type:'jml-studio-error',message:'The selected account or person changed. Reopen the editor.'});return;}
   const p=ctx.state.posts.find(p=>p.id===s.postId&&p.brandId===s.brandId);if(!p)return;
   if(ev.data?.type==='jml-studio-ready'){
     const brand=ctx.state.brands.find(b=>b.id===p.brandId),css=getComputedStyle(document.documentElement);
     send({type:'jml-studio-load',token:s.token,revision:s.revision,contentId:p.externalId||p.id,brand:brand.name,actor:ctx.ui.actor,snapshot:studioSnapshot(p,brand),theme:root.JMLTheme?.css(brand),palette:{purple:css.getPropertyValue('--purple').trim(),lime:css.getPropertyValue('--lime').trim(),ink:css.getPropertyValue('--ink').trim(),paper:css.getPropertyValue('--mist').trim(),line:css.getPropertyValue('--line').trim(),muted:css.getPropertyValue('--muted').trim()}});
     document.getElementById('studio-connection-status').textContent=brand.name+' · '+(p.externalId||p.id)+' · Brief revision '+s.revision;
   }
   if(ev.data?.type==='jml-studio-save'&&ev.data.token===s.token){
     try{root.JMLGovernance?.assert(ctx.state,ctx.ui,'edit',p);const fields=body(ev.data.snapshot);
       await ctx.commit(next=>{const target=next.posts.find(p=>p.id===s.postId&&p.brandId===s.brandId);if(target.briefRevision!==s.revision)throw Error('The brief changed since this editor opened. Keep a Studio JSON copy, then reopen the latest version.');C.saveBrief(target,fields,ctx.ui.actor);},'Creative Brief Studio revision saved.',{render:false});
       s.revision=ctx.state.posts.find(p=>p.id===s.postId).briefRevision;send({type:'jml-studio-saved',revision:s.revision});document.getElementById('studio-connection-status').textContent='Saved · Brief revision '+s.revision;
     }catch(error){send({type:'jml-studio-error',message:error.message});}
   }
 });
 root.JMLBriefStudio={open,studioSnapshot,body};
 document.addEventListener('DOMContentLoaded',()=>document.getElementById('modal')?.addEventListener('close',()=>{if(session){const ctx=session.ctx;session=null;ctx.render();}}));
})(window);
