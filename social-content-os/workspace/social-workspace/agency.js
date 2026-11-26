/* The agency directory, shared account palette and brand resource library. */
window.JMLAgency = (() => {
  'use strict';
  const palettes = {
    brand_jml:['#4c0099','#b1eb1e','#4c0099','#f7f5fa','#f3ecfa','#e5ddec'],
    brand_b4k:['#007cc6','#f7c332','#094ba7','#f5fafd','#eaf6fc','#d7e7ef'],
    brand_nn:['#303133','#fcc23b','#303133','#f8f8f8','#f0f0ef','#e3e1dc'],
    brand_mlb:['#002451','#db121a','#002451','#f6f8fb','#edf3fa','#d8e2ee'],
    brand_jay:['#3b0764','#a81070','#3b0764','#fdfbf7','#f1e6ee','#ded5ca'],
    brand_zees:['#030303','#f8c521','#030303','#f7f7f7','#f1f1f1','#d8d8d8']
  };
  const colorPattern=/^#[0-9a-f]{6}$/i;
  const safeLink=value=>typeof value==='string' && /^https?:\/\//i.test(value);
  function luminance(value){
    const rgb=value.slice(1).match(/../g).map(n=>parseInt(n,16)/255)
      .map(n=>n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4);
    return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
  }
  function palette(brand){
    if(window.JMLTheme){const t=JMLTheme.tokens(brand);return [t.primary,t.accent,t.chrome,t.canvas,t.tint,t.line];}
    if(colorPattern.test(brand.primary)&&colorPattern.test(brand.accent)){
      return [brand.primary,brand.accent,luminance(brand.primary)>0.18?'#262a31':brand.primary,'#f6f7f8','#f0f2f4','#dce0e4'];
    }
    return palettes[brand.id]||palettes.brand_jml;
  }
  function applyTheme(brand){
    if(window.JMLTheme){JMLTheme.apply(brand);return;}
    const root=document.documentElement;
    const [primary,accent,rail,background,tint,line]=palette(brand);
    root.dataset.brandTheme=brand.id;
    const tokens={'--brand-primary':primary,'--brand-accent':accent,'--rail':rail,'--purple':luminance(primary)>0.179?rail:primary,'--lime':accent,'--mist':background,'--soft':tint,'--line':line,
      '--on-accent':luminance(accent)>.179?'#101214':'#ffffff','--paper':brand.id==='brand_jay'?'#fcf9f4':'#ffffff'};
    for(const [key,value] of Object.entries(tokens))root.style.setProperty(key,value);
  }
  function accounts(ctx){
    const {state,e,btn,heading,ui,C}=ctx;
    const cards=state.brands.map(brand=>{
      const [primary,accent]=palette(brand);
      const posts=state.posts.filter(p=>p.brandId===brand.id);
      const review=posts.filter(p=>C.status(p)==='in-review').length;
      return '<article class="client-card" style="--client-primary:'+primary+';--client-accent:'+accent+'"><div class="client-strip"></div><div class="panel-body"><p class="client-meta">'+e(brand.initials)+' · '+e(String(brand.timezone||'').split('/').pop().replace(/_/g,' '))+' time</p><h2>'+e(brand.name)+'</h2><p>Client supervision: Level '+C.supervisionLevel(brand)+' · '+['No client approvals','Calendar only','Calendar and finished posts'][C.supervisionLevel(brand)]+'</p><p>'+e(brand.description||'Client workspace')+'</p><dl><div><dt>Content items</dt><dd>'+posts.length+'</dd></div><div><dt>Awaiting review</dt><dd>'+review+'</dd></div></dl>'+btn(ui.brand===brand.id?'Open active account':'Open account','client-open','small','data-brand="'+e(brand.id)+'"')+'</div></article>';
    });
    return heading('Agency','Client accounts','Choose an account to open its work queue.',btn('Add client','client-new','primary'))+'<div class="client-grid">'+cards.join('')+'</div>';
  }
  function resources(ctx){
    const {state,ui,e,btn,heading}=ctx;
    const tools=[['Creative Brief Studio','creative-brief/'],['Social Media Intelligence','social-content-os/intelligence.html'],['Social marketing playbook','social-content-os/playbook.html'],['Calendar field guide','social-content-os/Content_Calendar__.html'],['Ad Intelligence','../../ad-intelligence/'],['JML Hub','../../'],['Social Content OS overview','../'],['Content Production System','../../playbooks/content-production-system.html'],['Social Media Research & Algorithms Guide','../../social-post-research/']];
    const entries=(state.resources||[]).filter(r=>r.brandId===ui.brand);
    const rows=entries.map(row=>{
      const v=row.versions.at(-1);
      return '<div class="list-row"><div class="row-body"><small>'+e(v.type)+' · V'+row.versions.length+'</small><h3>'+e(v.name)+'</h3><p>'+e(v.notes)+'</p>'+(safeLink(v.url)?'<a class="link-btn" target="_blank" rel="noopener" href="'+e(v.url)+'">Open reference</a>':'')+'</div>'+btn('Edit & history','resource-edit','small','data-id="'+e(row.id)+'"')+'</div>';
    }).join('');
    return heading('Account library','Resources','Keep brand references, prompt templates and usage notes with this account.',btn('Add resource','resource-new','primary'))+
      '<section class="panel"><div class="panel-head"><h2>Account resources</h2><span>'+entries.length+'</span></div>'+(rows||'<p class="panel-body">Add the brand book or an approved reference to get started.</p>')+'</section>'+
      '<section class="panel section-gap"><div class="panel-head"><h2>JML tools and guides</h2></div>'+tools.map(([name,url])=>'<a class="list-row" href="'+url+'" target="_blank" rel="noopener">'+name+' ↗</a>').join('')+'</section>';
  }
  const brandBookField=()=>'<label class="full">Brand book JSON<input type="file" name="brandBookFile" accept=".json,application/json" required data-no-presets><small class="muted">Up to 1 MB. Primary and secondary colors theme this account. Brand voice is saved in Client foundation; logo paths and fonts are kept for reference.</small></label><p class="full"><a class="link-btn" href="social-workspace/examples/brand-book.example.json" download>Download sample JSON</a> · <a class="link-btn" href="social-workspace/examples/brand-book.schema.json" download>Download JSON schema</a> · <a class="link-btn" href="social-workspace/brand-book-format.html" target="_blank" rel="noopener">Format guide</a></p>';
  const handles=a=>['client-new','client-open','brand-book-import','resource-new','resource-edit'].includes(a);
  const isForm=id=>['account-form','brand-book-form','resource-form'].includes(id);
  function action(ctx,a,button){
    const {formModal,input,textArea,selectField,e,state,ui}=ctx;
    if(a==='client-open'){ctx.setBrand(button.dataset.brand);ctx.navigate('#today');return;}
    if(a==='brand-book-import'){formModal('Import brand book','brand-book-form','<div class="form-grid">'+brandBookField()+'</div>','Save brand book');return;}
    if(a==='client-new'){
      const zones=[['America/Los_Angeles','Pacific (Los Angeles)'],['America/Denver','Mountain (Denver)'],['America/Chicago','Central (Chicago)'],['America/New_York','Eastern (New York)'],['America/Toronto','Toronto'],['Europe/London','London'],['Europe/Paris','Paris'],['Europe/Berlin','Berlin'],['Asia/Dubai','Dubai'],['Asia/Tehran','Tehran'],['Asia/Kolkata','India (Kolkata)'],['Asia/Singapore','Singapore'],['Australia/Sydney','Sydney'],['UTC','UTC']];
      formModal('Add a client account','account-form','<div class="form-grid">'+input('Client name','name','','text',true)+input('What they do, in a few words','description','','text',true)+'<label class="full">Time zone <small class="muted">Dates and publishing times for this client use it.</small><select name="timezone" data-no-presets>'+zones.map(([v,l])=>'<option value="'+v+'">'+l+'</option>').join('')+'</select></label>'+'<label class="full">Client Supervision Level<select name="clientSupervisionLevel" data-no-presets><option value="0">0 — No client approvals</option><option value="1" selected>1 — Content calendar only</option><option value="2">2 — Content calendar and finished posts</option></select><small class="muted">Internal quality checks apply at every level. No separate publishing approval is required.</small></label>'+brandBookField()+'</div>','Create account');
      ['name','description'].forEach(n=>{const el=document.querySelector('#account-form [name='+n+']');if(el)el.required=true;});return;
    }
    const record=(state.resources||[]).find(x=>x.id===button.dataset.id&&x.brandId===ui.brand);
    const v=record?.versions.at(-1)||{};
    formModal(record?'Resource versions':'Add resource','resource-form','<div class="form-grid">'+input('Name','name',v.name||'','text',true)+selectField('Resource type','type',['Brand profile','Prompt template','Reference','Rights record','Tool or integration'],v.type||'Reference')+
      input('Reference URL','url',v.url||'','url')+textArea('Instructions, rights or reference notes','notes',v.notes||'')+'</div>'+
      (record?'<details><summary>Previous versions ('+record.versions.length+')</summary>'+record.versions.slice().reverse().map((x,i)=>'<p><b>V'+(record.versions.length-i)+' · '+e(x.name)+'</b><br>'+e(x.notes)+'<br>'+e(x.actor)+' · '+e(x.at)+'</p>').join('')+'</details>':''),'Save version',record?'data-id="'+e(record.id)+'"':'');
  }
  async function submit(ctx,form,data){
    const {C,ui,commit}=ctx;
    if(form.id==='brand-book-form'){
      const file=form.elements.brandBookFile.files[0],book=await JMLBrandBook.read(file);
      await commit(next=>{const brand=next.brands.find(b=>b.id===ui.brand);JMLBrandBook.apply(brand,book,file.name,JMLOps.account(next,ui.brand,true).foundation);},'Brand book saved in Client foundation.');return;
    }
    if(!data.name.trim())throw Error('Enter a name.');
    if(form.id==='account-form'){
      try{Intl.DateTimeFormat('en',{timeZone:data.timezone});}catch{throw Error('Enter a valid time zone, such as America/Los_Angeles.');}
      if(!['0','1','2'].includes(data.clientSupervisionLevel))throw Error('Choose a Client Supervision Level.');
      const file=form.elements.brandBookFile.files[0],book=await JMLBrandBook.read(file);
      const {brandBookFile,...fields}=data;
      const brand={...fields,clientSupervisionLevel:Number(data.clientSupervisionLevel),guidedSetup:true,id:C.id('client'),name:data.name.trim(),initials:data.name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()};
      await commit(next=>{if(next.brands.some(b=>b.name.toLowerCase()===brand.name.toLowerCase()))throw Error('An account with this name already exists.');next.brands.push(brand);JMLBrandBook.apply(brand,book,file.name,JMLOps.account(next,brand.id,true).foundation);},'Client account created. Next: fill in the foundation.');
      ctx.setBrand(brand.id);ctx.navigate('#plan/foundation');return;
    }
    if(data.url&&!safeLink(data.url))throw Error('Use an HTTP or HTTPS reference URL.');
    const version={...data,actor:ui.actor,at:C.now()};
    await commit(next=>{
      next.resources??=[];let r=next.resources.find(x=>x.id===form.dataset.id&&x.brandId===ui.brand);
      if(!r){r={id:C.id('resource'),brandId:ui.brand,versions:[]};next.resources.push(r);}r.versions.push(version);
    },'Resource version saved.');
  }
  function validate(data){
    const brands=new Set(data.brands.map(b=>b.id));
    for(const brand of data.brands)if(brand.brandBook!==undefined)JMLBrandBook.validate(brand.brandBook);
    const demo=data.brands.find(b=>b.id==='demo')?.demoScenarios;
    if(demo!==undefined&&(!Array.isArray(demo?.cases)||demo.cases.some(c=>!c||typeof c.title!=='string'||!['studio','review','publish','learn'].includes(c.view))))throw Error('Invalid demo scenarios in this backup.');
    if(data.resources!==undefined && (!Array.isArray(data.resources)||data.resources.some(r=>!r||!brands.has(r.brandId)||typeof r.id!=='string'||!Array.isArray(r.versions)||!r.versions.length||r.versions.some(v=>!v||!['name','type','notes','url','actor','at'].every(k=>typeof v[k]==='string')||v.url&&!safeLink(v.url)))))throw Error('Invalid account resource in this backup.');
    if(data.workingDrafts!==undefined){
      if(!data.workingDrafts || Array.isArray(data.workingDrafts)||typeof data.workingDrafts!=='object')throw Error('Invalid working drafts.');
      for(const [id,d] of Object.entries(data.workingDrafts)){
        if(!data.posts.some(p=>p.id===id)||!d||!Number.isInteger(d.baseRevision)||!d.fields||Object.values(d.fields).some(v=>typeof v!=='string'))throw Error('Invalid working brief in backup.');
      }
    }
  }
  return {applyTheme,accounts,resources,handles,isForm,action,submit,validate};
})();
