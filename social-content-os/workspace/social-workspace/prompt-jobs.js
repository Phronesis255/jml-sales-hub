/* Local prompt preparation and manually attached output references. */
(function(root) {
  'use strict';
  const templateVersions=(s,brand)=> (s.resources||[]).filter(r=>r.brandId===brand)
    .flatMap(r=>r.versions.map((v,i)=>({resource:r,version:v,number:i+1})).reverse())
    .filter(t=>t.version.type==='Prompt template' && t.version.notes.trim());
  function assemble(template,post,notes='') {
    const brief=post.brief, lines=[
      ['Content',post.title],['Platform',post.platform],['Format',post.format],
      ['Objective',brief.objective],['Audience',brief.audience],['Call to action',brief.cta],
      ['Creative direction',brief.direction],['Slide copy',brief.slideCopy],['Caption',brief.caption]
    ];
    const spec=brief.productionSpec;
    if(spec)for(const [label,key] of [['Rights and permissions','rights'],['Rights expiry','rightsExpiry']])lines.push([label,spec[key]]);
    return [template.notes.trim(),lines.filter(([,v])=>v?.trim()).map(([k,v])=>k+' — '+v.trim()).join('\n'),notes.trim()].filter(Boolean).join('\n\n');
  }
  function prepare(s,C,brand,actor,input) {
    const template=templateVersions(s,brand).find(t=>t.resource.id===input.resourceId && t.number===input.version);
    const p=s.posts.find(p=>p.brandId===brand && p.id===input.postId);
    if(!template||!p)throw Error('Choose a saved prompt template and a brief from this account.');
    if(p.briefRevision!==input.revision)throw Error('The brief changed. Reopen this job form to use the current revision.');
    const job={id:C.id('prompt-job'),brandId:brand,resourceId:template.resource.id,templateVersion:template.number,
      templateName:template.version.name,postId:p.id,briefRevision:p.briefRevision,title:p.title,
      prompt:assemble(template.version,p,input.notes),actor,at:C.now(),outputs:[]};
    (s.promptJobs??=[]).push(job);
    C.event(p,'Prompt job prepared',job.templateName+' V'+job.templateVersion+' · brief revision '+job.briefRevision+' · '+job.id,actor);
    return job.id;
  }
  function attach(s,C,brand,actor,id,input) {
    const job=s.promptJobs?.find(j=>j.brandId===brand && j.id===id);
    const p=job&&s.posts.find(p=>p.id===job.postId && p.brandId===brand);
    if(!p)throw Error('The selected job is unavailable.');
    const v=input.versionId?p.versions.find(v=>v.id===input.versionId):null;
    if(input.versionId&&!v)throw Error('Choose a saved version from this content item.');
    const reference=input.reference.trim();
    if(!v&&!reference)throw Error('Choose a content version or enter an output reference.');
    const out={id:C.id('prompt-output'),versionId:v?.id||'',reference,note:input.note.trim(),actor,at:C.now()};
    job.outputs.push(out);
    C.event(p,'Prompt output attached',[job.id,v?'Content version '+v.number:'',reference,out.note].filter(Boolean).join(' · '),actor);
  }
  function validate(s) {
    if(s.promptJobs===undefined)return;
    if(!Array.isArray(s.promptJobs))throw Error('Invalid prompt job ledger.');
    const ids=new Set(),str=(item,keys)=>item && keys.every(k=>typeof item[k]==='string');
    const timestamp=at=>Number.isFinite(Date.parse(at));
    for(const j of s.promptJobs) {
      const tmpl=s.resources?.find(r=>r.id===j?.resourceId && r.brandId===j.brandId);
      const post=s.posts.find(p=>p.id===j?.postId && p.brandId===j.brandId);
      if(!str(j,['id','brandId','postId','resourceId','templateName','title','prompt','actor','at'])||!j.id||ids.has(j.id)||!j.prompt.trim()||!j.actor.trim()||!timestamp(j.at)||
        !post||!Number.isInteger(j.briefRevision)||j.briefRevision<1||j.briefRevision>post.briefRevision||
        !Number.isInteger(j.templateVersion)||tmpl?.versions[j.templateVersion-1]?.type!=='Prompt template'||!Array.isArray(j.outputs))throw Error('Invalid prompt job or template reference.');
      ids.add(j.id);
      for(const out of j.outputs) {
        if(!str(out,['id','versionId','reference','note','actor','at'])||!out.id||ids.has(out.id)||!timestamp(out.at)||!out.actor.trim()||
          (!out.versionId&&!out.reference.trim())||(out.versionId&&!post.versions.some(v=>v.id===out.versionId)))throw Error('Invalid prompt output reference.');
        ids.add(out.id);
      }
    }
  }
  const button=(e,label,action)=>'<button type="button" class="btn small" data-job-action="'+e(action)+'">'+e(label)+'</button>';
  function view(ctx) {
    const {state:s,e,ui}=ctx,brand=ui.brand, posts=s.posts.filter(p=>p.brandId===brand);
    const templates=templateVersions(s,brand), jobs=(s.promptJobs||[]).filter(j=>j.brandId===brand).slice().reverse();
    const options=(rows,value,label)=>rows.map(x=>'<option value="'+e(value(x))+'">'+e(label(x))+'</option>').join('');
    const form=templates.length&&posts.length?'<details class="panel-body"><summary>Prepare a prompt</summary><form data-job-form="prepare"><div class="form-grid">'+
      '<label>Template version<select name="template">'+options(templates,t=>JSON.stringify([t.resource.id,t.number]),t=>t.version.name+' · V'+t.number)+'</select></label>'+
      '<label>Content brief<select name="post">'+options(posts,p=>p.id,p=>p.title+' · revision '+p.briefRevision)+'</select></label>'+
      '<label class="full">Additional instructions<textarea rows="2" name="notes"></textarea></label>'+
      '<label class="full">Assembled prompt<textarea name="prompt" readonly rows="5"></textarea></label></div>'+
      '<div class="actions">'+button(e,'Copy prompt','copy')+button(e,'Download text','download')+'<button type="submit" class="btn primary">Save local job</button></div><p role="status" class="form-error"></p></form></details>':
      '<p class="panel-body">'+(!templates.length?'Add an account resource of type Prompt template and enter its instructions. ':'')+(!posts.length?'Create a content brief to prepare a job.':'')+'</p>';
    const ledger=jobs.map(j=>{
      const post=posts.find(p=>p.id===j.postId);
      const outputs=j.outputs.map(out=>{
        const v=post.versions.find(v=>v.id===out.versionId);
        return '<li>'+e([v?'Content V'+v.number:'',out.reference,out.note].filter(Boolean).join(' · '))+'<br><small>'+e(out.actor+' · '+out.at)+'</small></li>';
      }).join('');
      return '<details class="panel-body" data-job-id="'+e(j.id)+'"><summary><strong>'+e(j.title)+'</strong> · '+e(j.templateName)+' V'+j.templateVersion+' · '+(j.outputs.length?'Manual output attached':'Prepared locally')+'</summary>'+
        '<p><a href="#content/'+encodeURIComponent(j.postId)+'/brief">Open content brief</a> · Revision '+j.briefRevision+' · '+e(j.actor+' · '+j.at)+'</p>'+
        '<label>Saved prompt<textarea readonly name="prompt" rows="4">'+e(j.prompt)+'</textarea></label>'+
        '<div class="actions">'+button(e,'Copy prompt','copy')+button(e,'Download text','download')+'</div>'+
        (outputs?'<h3>Manual outputs</h3><ul>'+outputs+'</ul>':'')+
        '<form data-job-form="attach"><div class="form-grid"><label>Content version<select name="versionId"><option value="">Choose a saved version</option>'+
        options(post.versions.slice().reverse(),v=>v.id,v=>'V'+v.number+' · '+v.state)+'</select></label>'+
        '<label>Output reference<input name="reference" placeholder="File name, document ID or link"></label>'+
        '<label class="full">Output note<textarea name="note" rows="2"></textarea></label></div>'+
        '<button class="btn small" type="submit">Attach manual output</button><p role="status" class="form-error"></p></form></details>';
    }).join('');
    return '<section id="prompt-job-ledger" class="panel section-gap" aria-label="Prompt jobs"><div class="panel-head"><h2>Prompt jobs</h2><span>'+jobs.length+'</span></div>'+form+ledger+'</section>';
  }
  function mount(ctx) {
    const panel=document.getElementById('prompt-job-ledger');
    if(!panel||panel.dataset.bound)return;
    panel.dataset.bound='true';
    const find=(field,name)=>field.elements.namedItem(name);
    const newForm=panel.querySelector('[data-job-form="prepare"]');
    function selection() {
      const [resourceId,version]=JSON.parse(find(newForm,'template').value);
      const postId=find(newForm,'post').value;
      return {resourceId,version,postId,notes:find(newForm,'notes').value,revision:Number(newForm.dataset.revision)};
    }
    function preview() {
      const input=selection(),s=ctx.state;
      const template=templateVersions(s,ctx.ui.brand).find(t=>t.resource.id===input.resourceId&&t.number===input.version);
      const post=s.posts.find(p=>p.id===input.postId&&p.brandId===ctx.ui.brand);
      if(!template||!post)return;
      newForm.dataset.revision=post.briefRevision;
      find(newForm,'prompt').value=assemble(template.version,post,input.notes);
    }
    if(newForm){newForm.addEventListener('input',preview);newForm.addEventListener('change',preview);preview();}
    panel.addEventListener('click',async ev=>{
      const control=ev.target.closest('[data-job-action]');
      if(!control)return;
      ev.stopPropagation();
      const input=control.closest('details').querySelector('textarea[name=prompt]');
      if(control.dataset.jobAction==='copy') {
        try{await navigator.clipboard.writeText(input.value);ctx.toast('Prompt copied.');}
        catch{input.focus();input.select();ctx.toast('Prompt selected. Use your copy shortcut.');}
      }else{
        const a=document.createElement('a'),url=URL.createObjectURL(new Blob([input.value],{type:'text/plain;charset=utf-8'}));
        a.href=url;a.download=(control.closest('[data-job-id]')?.dataset.jobId||'prepared-prompt')+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
      }
    });
    panel.addEventListener('submit',async ev=>{
      const form=ev.target;
      if(!form.dataset.jobForm)return;
      ev.preventDefault();ev.stopPropagation();
      const error=form.querySelector('[role=status]'),button=form.querySelector('[type=submit]');
      error.textContent='';button.disabled=true;
      const isNew=form===newForm,data=isNew?selection():Object.fromEntries(new FormData(form));
      let id=form.closest('[data-job-id]')?.dataset.jobId;
      const brand=ctx.ui.brand,actor=ctx.ui.actor;
      try{
        await ctx.commit(s=>{
          if(isNew)id=prepare(s,ctx.C,brand,actor,data);
          else attach(s,ctx.C,brand,actor,id,data);
        },isNew?'Prompt job saved locally.':'Output attached to the job.');
        const saved=[...document.querySelectorAll('#prompt-job-ledger [data-job-id]')].find(row=>row.dataset.jobId===id);
        if(saved){saved.open=true;saved.querySelector('summary').focus();}
      }catch(err){error.textContent=err.message;button.disabled=false;}
    });
  }
  const api={view,mount,validate,assemble,prepare,attach};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.JMLPromptJobs=api;
})(typeof window==='undefined'?globalThis:window);
