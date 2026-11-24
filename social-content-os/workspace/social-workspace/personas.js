/* Explicit client-facing projections of the local workspace. */
(function (root) {
  'use strict';
  const common = typeof module === 'object' && module.exports;
  const C = common ? require('./core.js') : root.JMLCore;
  const O = common ? require('./operations.js') : root.JMLOps;
  const R = common ? require('./release-domain.js') : root.JMLReleaseDomain;
  const G = common ? require('./governance.js') : root.JMLGovernance;
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const roleAllowed = role => role === 'client' || role === 'viewer';
  const planLabels = {foundation:'Client foundation',strategy:'Strategy & KPIs',calendar:'Calendar plan'};
  const statusLabels = {'in-review':'Awaiting review',approved:'Approved','changes-requested':'Changes requested',requested:'Input requested',received:'Response received',accepted:'Accepted'};
  const sameName = (a,b) => !!a?.trim() && a.trim() === b?.trim();
  const fail = message => { throw Error(message); };

  function shared(state,ui) {
    const brand = state.brands.find(b=>b.id===ui.brand);
    if(!brand || !roleAllowed(ui.role) || !ui.actor?.trim()) return {inputs:[],creatives:[],plans:[],reports:[]};
    const member=state.governance?G.membership(state,ui):null;
    if(state.governance&&!member)return {inputs:[],creatives:[],plans:[],reports:[]};
    const sharedReading=!!member?.shareClientMaterial;
    const ops = O.account(state,brand.id);
    const inputs=[],creatives=[],plans=[];
    for(const p of state.posts.filter(p=>p.brandId===brand.id)) {
      for(const request of p.requests) {
        if(sameName(request.owner,ui.actor) && ['requested','received','accepted'].includes(request.state)) {
          inputs.push({kind:'input',id:request.id,parent:p.id,title:request.title,postTitle:p.title,state:request.state,due:request.due,
            instructions:request.state==='accepted'?'':request.note});
        }
      }
      const v=C.latest(p);
      if(!v || (!sharedReading&&!sameName(p.brief.approver,ui.actor)) || v.briefRevision!==p.briefRevision || !['in-review','approved','changes-requested'].includes(v.state) || !C.qcKeys.every(k=>v.qc?.[k]===true))continue;
      creatives.push({kind:'creative',canAct:state.governance?G.can(state,ui,'approve',p):sameName(p.brief.approver,ui.actor),id:v.id,parent:p.id,title:p.title,version:v.number,state:v.state,caption:v.caption,platform:p.platform,format:p.format,date:p.date,
        assets:v.assets.filter(a=>C.safeMedia(a.url)).map(a=>({type:a.type,url:a.url,alt:a.alt})),
        decisions:v.decisions.map(d=>({state:d.action,actor:d.actor,at:d.at,note:d.comment}))});
    }
    if(sharedReading||sameName(ops.foundation.finalApprover,ui.actor)) {
      // The foundation is internal to the team; the client signs off the strategy and KPIs, then the calendar.
      for(const [kind,key] of [['strategy','strategies'],['calendar','calendars']]) {
        const v=ops[key]?.at(-1);
        if(!v)continue;
        const d=ops.decisions.find(d=>d.kind===kind && d.targetId===v.id);
        const body={};
        if(kind==='foundation') {for(const [field] of foundationFields)body[field]=v.body[field]||'';} else if(kind==='strategy') {
          for(const [field] of strategyFields)body[field]=v.body[field]||'';
          body.offer=v.foundation?.business||ops.foundation?.business||'';body.scope=v.foundation?.scope||ops.foundation?.scope||'';
        } else {
          body.start=v.body.start;body.end=v.body.end;
          body.entries=(v.body.entries||[]).map(x=>({title:x.title,date:x.date,time:x.time,timezone:x.timezone,platform:x.platform,format:x.format||'',objective:x.objective||'',angle:(ops.angles||[]).find(a=>a.id===x.angleId)?.title||'',kpi:(ops.kpis||[]).find(k=>k.id===x.measurementDefinitionId)?.title||x.measurementDefinitionId||''}));
          body.slots=(v.body.slots||[]).map(x=>({title:x.title,date:x.date}));
          const prev=ops[key].at(-2),prevDecision=prev&&ops.decisions.find(d=>d.targetId===prev.id);
          body.previous=prev?{number:prev.number,note:prevDecision?.decision==='changes-requested'?prevDecision.note||'':'',changes:(O.calendarChanges?.(prev.body.entries,v.body.entries)||[]).map(c=>O.changeText(c))}:null;
        }
        plans.push({kind,canAct:sameName(ops.foundation.finalApprover,ui.actor)&&(!state.governance||G.can(state,ui,'approve',{brandId:brand.id,id:brand.id})),id:v.id,title:planLabels[kind],version:v.number,state:d?.decision||'in-review',body,
          decisions:d?[{state:d.decision,at:d.at,actor:d.actor,note:d.note}]:[]});
      }
    }
    const reports=(state.releaseLearning?.reports||[]).filter(r=>r.brandId===brand.id && r.status==='Client ready').slice().reverse().map(r=>({
      kind:'report',id:r.id,title:r.title,version:r.version,start:r.start,end:r.end,origin:r.origin,summary:r.summary,gaps:r.gaps,ask:r.ask,
      calculations:(r.calculations||[]).map(c=>({title:c.definition.title,version:c.definition.version,unit:c.definition.unit,value:c.result,unavailable:c.unavailable,baseline:c.baselineValue,delta:c.delta,comparable:c.baselineComparable,comparisonNote:c.comparisonNote,source:c.source,baselineSource:c.baseline?.source,start:c.start,end:c.end})),
      observations:r.observations.map(o=>({metric:o.metric,value:o.value,unit:o.unit,definition:o.definition,start:o.start,end:o.end,account:o.account})),
      deliveries:r.deliveries.map(d=>({title:d.title,platform:d.platform,account:d.account,at:d.actualAt})),
      findings:r.findings.map(f=>({title:f.title,detail:f.detail})),
      feedback:r.feedback.filter(f=>sameName(f.actor,ui.actor)).map(f=>({at:f.at,note:f.note}))}));
    inputs.sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));
    return {inputs,creatives,plans,reports};
  }

  const foundationFields=[['business','What the business offers'],['audience','Who we’re trying to reach'],['priorities','What social content should achieve'],['scope','What’s included and out of scope'],['brandBook','Brand guide or references'],['media','Available media and permissions'],['access','Account access or missing inputs'],['communityOwner','Community owner'],['weeklyCapacity','Posts per week'],['responseDue','Next input review'],['finalApprover','Client approver']];
  const strategyFields=[['objective','Business objective'],['audience','Audience and value proposition'],['channelRoles','Channel roles and cadence'],['pillars','Content themes'],['growth','Growth tests'],['kpi','Main measure'],['definition','How it’s calculated'],['baseline','Starting point (baseline)'],['target','Target'],['window','Measurement window'],['cadence','How often we report results']];
  function findItem(data,kind,id,parent='') {
    const collection={input:data.inputs,creative:data.creatives,foundation:data.plans,strategy:data.plans,calendar:data.plans,report:data.reports}[kind]||[];
    return collection.find(x=>x.kind===kind && x.id===id && (x.parent||'')===parent) || fail('This item is no longer shared with this profile.');
  }
  function perform(state,ui,command) {
    if(ui.role!=='client' || command.brand!==ui.brand || command.actor!==ui.actor)fail('This profile cannot change the shared item.');
    const {kind,id,parent='',outcome}=command, actor=ui.actor.trim(), note=String(command.note??'').trim();
    if(note.length>5000)fail('Use 5,000 characters or fewer.');
    const item=findItem(shared(state,ui),kind,id,parent);
    if(['creative','foundation','strategy','calendar'].includes(kind)&&item.canAct===false)fail('This decision belongs to the named approver. You can read the shared material.');
    if(state.governance&&['creative','foundation','strategy','calendar'].includes(kind))G.assert(state,ui,'approve',kind==='creative'?state.posts.find(p=>p.id===parent):{brandId:ui.brand,id:ui.brand});
    if(kind==='report') {
      if(outcome!=='feedback' || !note)fail('Enter the feedback you want to share.');
      const report=state.releaseLearning.reports.find(r=>r.id===id && r.brandId===ui.brand);
      R.reportDecision(state,ui.brand,id,{action:'feedback',title:'Follow up on '+report.title,note,owner:report.reviewer,due:C.addDays(C.now().slice(0,10),7),propose:false},actor);
      return;
    }
    if(kind==='input') {
      const file=command.attachment;
      if(item.state!=='requested' || outcome!=='respond' || (!note&&!file))fail('Add a short response or attach the requested file.');
      const p=state.posts.find(p=>p.id===parent && p.brandId===ui.brand), r=p.requests.find(r=>r.id===id);
      r.state='received';
      if(file)(r.clientFiles||=[]).push({id:C.id('client-file'),name:String(file.name).slice(0,200),type:file.type,size:file.size,url:file.url,at:C.now(),actor});
      const response=actor+' · '+C.now().slice(0,10)+'\n'+(note||'Attached '+file.name);
      r.note=[r.note,response].filter(Boolean).join('\n\n');
      C.event(p,'Client input received',r.title+'\n'+(note||'')+(file?'\nFile: '+file.name:''),actor);
      return;
    }
    if(item.state!=='in-review')fail('This version already has a decision.');
    if(kind==='creative') {
      const p=state.posts.find(p=>p.id===parent && p.brandId===ui.brand);
      C.decide(p,outcome,note,actor);
    } else {
      const ops=O.account(state,ui.brand);
      if(kind==='calendar' && outcome==='approved'){
        const v=ops.calendars.at(-1);
        if(JSON.stringify(O.calendarPackage(state,ui.brand,v.body))!==JSON.stringify(v.body))fail('The calendar changed after this version was shared. Ask the team for a fresh version.');
      }
      O.decision(ops,kind,id,outcome,actor,note);
    }
  }

  const openButton=(item,label) => '<button type="button" class="btn small" data-persona-open="'+escape(item.kind)+'" data-id="'+escape(item.id)+'" data-parent="'+escape(item.parent||'')+'">'+label+'</button>';
  const UX=()=>root.JMLWorkflowUI||{day:x=>String(x||'').slice(0,10),clean:x=>x};
  const dateText = value => value ? UX().day(String(value).slice(0,10)) : '';
  function row(item,role) {
    const U=UX(),meta={input:[U.clean(item.postTitle),item.due?'Due '+U.day(item.due):''],creative:[item.platform,item.format,'V'+item.version],foundation:['V'+item.version],strategy:['V'+item.version],calendar:[item.body?U.day(item.body.start)+' – '+U.day(item.body.end):'',item.body?.entries?item.body.entries.length+' items':'','V'+item.version],report:[U.day(item.start)+' – '+U.day(item.end),'V'+item.version,item.origin==='fixture'?'Sample data':'Recorded data']}[item.kind];
    const action=role==='client' && item.kind==='input' && item.state==='requested'?'Respond':role==='client' && item.state==='in-review'?'Review':'View';
    const art=item.kind==='creative'&&item.assets?.[0]&&item.assets[0].type!=='video'?'<img class="rl-thumb" src="'+escape(root.JMLStorage?.mediaURL(item.assets[0].url)||item.assets[0].url)+'" alt="" loading="lazy">':'';
    const waiting=role==='client'&&(item.state==='in-review'||(item.kind==='input'&&item.state==='requested'));
    return '<article class="rl-row'+(waiting?' rl-waiting':'')+'">'+art+'<div><h3>'+escape(U.clean(item.title))+'</h3><p class="rl-meta">'+meta.filter(Boolean).map(escape).join(' · ')+'</p></div><div class="rl-controls">'+(item.state?'<span class="rl-badge">'+escape(statusLabels[item.state])+'</span>':'')+openButton(item,action).replace('class="btn small"',waiting?'class="btn small primary"':'class="btn small"')+'</div></article>';
  }
  function panel(title,items,role,empty) {
    return '<section class="rl-panel"><header><h2>'+title+'</h2><span class="count-note">'+items.length+'</span></header>'+(items.length?items.map(i=>row(i,role)).join(''):'<p class="muted">'+empty+'</p>')+'</section>';
  }
  function view(ctx) {
    const {ui}=ctx, data=shared(ctx.state,ui), brand=ctx.state.brands.find(b=>b.id===ui.brand);
    const role=ui.role, read=role==='viewer',route=ui.route;
    const reviewSection=['planning','inputs'].includes(ui.section)?ui.section:'client';
    const reviewTitles={client:'Creative approvals',planning:'Plan approvals',inputs:'Requested inputs'};
    const reviewDescriptions={client:'Inspect the exact creative versions shared with '+ui.actor+'.',planning:'Review the onboarding, strategy and calendar versions shared with '+ui.actor+'.',inputs:'Track the information and files requested from '+ui.actor+'.'};
    const title=route==='review'?reviewTitles[reviewSection]:{learn:'Shared reports',today:'Today'}[route]||'Today';
    const description=route==='review'?reviewDescriptions[reviewSection]:{learn:'Read the reports the team has released for '+(brand?.name||'this account')+'.',today:'Inputs, decisions and reports for '+ui.actor+'.'}[route]||'';
    let body='';
    if(route==='learn')body=panel('Client-ready reports',data.reports,role,'Reviewed reports will appear here.');
    else if(route==='review'){
      if(reviewSection==='planning')body=panel('Plan approvals',data.plans,role,'No current plan is shared with this person.');
      else if(reviewSection==='inputs')body=panel('Requested inputs',data.inputs.filter(x=>x.state!=='accepted'),role,'You have no outstanding input requests.');
      else body=panel('Creative versions',[...data.creatives].sort((a,b)=>(b.state==='in-review')-(a.state==='in-review')),role,'No submitted creative is shared with this person.');
    }
    else {
      const waiting=[...data.plans,...data.creatives].filter(x=>x.state==='in-review');
      const activeInputs=data.inputs.filter(x=>x.state!=='accepted');
      body=panel(read?'Pending approvals':'Awaiting your review',waiting,role,'Nothing is waiting for your decision.')+(activeInputs.length?panel('Requested inputs',activeInputs,role,''):'');
      if(data.reports.length)body+=panel('Latest report',data.reports.slice(0,1),role,'');
    }
    return '<div class="persona-workspace">'+ctx.heading(read?'Read-only viewer · local preview':'Client view',title,escape(description))+body+'</div>';
  }

  const fact=(label,value)=>value===undefined || value===null || value===''?'':'<div><dt>'+escape(label)+'</dt><dd>'+escape(value)+'</dd></div>';
  const para=(title,text)=>text?'<section class="persona-copy"><h3>'+escape(title)+'</h3><p>'+escape(text)+'</p></section>':'';
  function outcomeCards(calculations){
    const value=v=>Number(v).toLocaleString(undefined,{minimumFractionDigits:1,maximumFractionDigits:1});
    return calculations.length?'<section class="persona-copy"><h3>Measured outcomes</h3>'+calculations.map(c=>'<article class="persona-copy"><h4>'+escape(c.title)+'</h4><p><strong>'+(c.value===null?'Unavailable':escape(value(c.value)+' '+c.unit))+'</strong></p><dl class="persona-facts">'+fact('Baseline',c.baseline==null?'Not established':value(c.baseline)+' '+c.unit)+fact('Change from baseline',c.comparable&&c.delta!=null?(c.delta>=0?'+':'')+value(c.delta)+' '+c.unit:'Not comparable')+fact('Measurement period',c.start+' – '+c.end)+fact('Source',c.source)+fact('Baseline source',c.baselineSource)+fact('Definition version','V'+c.version)+'</dl>'+para('Comparison and limitations',[c.unavailable,c.comparisonNote].filter(Boolean).join(' '))+'</article>').join('')+'</section>':'';
  }
  function details(item) {
    if(item.kind==='input')return '<dl class="persona-facts">'+fact('Requested for',item.postTitle)+fact('Due',item.due?UX().day(item.due):'')+fact('Status',statusLabels[item.state])+'</dl>'+para('Request details',item.instructions);
    if(item.kind==='report') {
      const metrics=item.observations.map(o=>'<tr><th scope="row">'+escape(o.metric)+(o.definition?'<small>'+escape(o.definition)+'</small>':'')+'</th><td>'+(o.value===null?'Missing':escape(o.value)+' '+escape(o.unit))+'</td><td>'+escape(o.account)+'</td><td>'+escape(o.start)+' – '+escape(o.end)+'</td></tr>').join('');
      return '<p>'+escape(item.start)+' – '+escape(item.end)+' · V'+item.version+' · '+(item.origin==='fixture'?'Sample data':'Recorded data')+'</p>'+
        outcomeCards(item.calculations||[])+para('Findings',item.summary)+para('Limitations',item.gaps)+para('Decision requested',item.ask)+
        (metrics?'<div class="persona-table"><table><caption>Reported measurements</caption><thead><tr><th>Metric</th><th>Value</th><th>Account</th><th>Period</th></tr></thead><tbody>'+metrics+'</tbody></table></div>':'')+
        (item.deliveries.length?'<section class="persona-copy"><h3>Verified placements</h3><ul>'+item.deliveries.map(d=>'<li>'+escape([d.title,d.platform,d.account,dateText(d.at)].filter(Boolean).join(' · '))+'</li>').join('')+'</ul></section>':'')+
        item.findings.map(f=>para(f.title,f.detail)).join('')+
        item.feedback.map(f=>para('Your feedback · '+dateText(f.at),f.note)).join('');
    }
    let main='';
    if(item.kind==='creative') {
      main='<p>'+escape([item.platform,item.format,'V'+item.version,item.date?UX().day(item.date):''].filter(Boolean).join(' · '))+'</p>'+
        (item.assets.length?'<div class="persona-media'+(item.assets.length>1?' multi':'')+'">'+item.assets.map((a,i)=>{
          const url=escape(root.JMLStorage?.mediaURL(a.url)||a.url),alt=escape(a.alt||'Creative '+(i+1));
          // No lazy loading: inside the scrolling dialog it can leave later slides blank.
          const media=a.type==='video'?'<video controls preload="metadata" src="'+url+'" aria-label="'+alt+'"></video>':'<img src="'+url+'" alt="'+alt+'">';
          return '<figure>'+media+(item.assets.length>1?'<figcaption>'+(item.format==='Carousel'?'Slide ':'File ')+(i+1)+' of '+item.assets.length+'</figcaption>':'')+'</figure>';
        }).join('')+'</div>':'')+para('Submitted caption',item.caption);
    } else if(item.kind==='foundation') {main='<dl class="persona-facts">'+foundationFields.map(([k,l])=>fact(l,item.body[k])).join('')+'</dl>';
    } else if(item.kind==='strategy') {
      const b=item.body;
      main='<section class="kpi-focus"><span class="eyebrow">How success will be measured</span><h3>'+escape(b.kpi||'Main measure')+'</h3><dl class="persona-facts">'+[['How it’s calculated',b.definition],['Measurement window',b.window],['Starting point (baseline)',b.baseline],['Target',b.target||'Not set yet'],['How often we report results',b.cadence]].map(([l,v])=>fact(l,v)).join('')+'</dl></section>'+
        '<details class="persona-context"><summary>The plan behind these KPIs</summary><dl class="persona-facts">'+[['What the business offers',b.offer],['Business objective',b.objective],['Audience and value proposition',b.audience],['Channel roles and cadence',b.channelRoles],['Content themes',b.pillars],['What’s included and out of scope',b.scope],['Growth tests',b.growth]].map(([l,v])=>fact(l,v)).join('')+'</dl></details>';
    } else {
      const b=item.body;
      const U=UX(),counts=b.entries.reduce((m,x)=>(m[x.platform]=(m[x.platform]||0)+1,m),{});
      const p=b.previous;
      main=(p?'<div class="task-summary"><strong>'+(p.changes.length?'Changed since V'+p.number:'No changes since V'+p.number)+'</strong>'+(p.note?'<p>You asked: “'+escape(p.note)+'”</p>':'')+(p.changes.length?'<ul class="change-list">'+p.changes.map(c=>'<li>'+escape(c)+'</li>').join('')+'</ul>':'')+'</div>':'')+'<div class="task-summary"><strong>'+b.entries.length+' planned item'+(b.entries.length===1?'':'s')+(b.slots.length?' and '+b.slots.length+' reserved slot'+(b.slots.length===1?'':'s'):'')+' · '+escape(U.day(b.start))+' – '+escape(U.day(b.end))+'</strong><p>'+escape(Object.entries(counts).map(([k,n])=>k+' '+n).join(' · '))+'</p></div><div class="persona-table"><table><caption>Planned content and reserved slots</caption><thead><tr><th>Content</th><th>Channel / format</th><th>Purpose / KPI</th><th>Planned date</th></tr></thead><tbody>'+
        [...b.entries,...b.slots.map(s=>({...s,platform:'Reserved slot'}))].sort((a,b)=>a.date.localeCompare(b.date)).map(s=>'<tr><th scope="row">'+escape(s.title)+'</th><td>'+escape(s.platform)+(s.format?'<small>'+escape(s.format)+'</small>':'')+'</td><td>'+escape(s.objective||'Not linked to the strategy')+(s.kpi?'<small>Measured by '+escape(s.kpi)+'</small>':'')+'</td><td>'+escape(UX().day(s.date))+(s.time?'<small>'+escape(s.time)+'</small>':'')+'</td></tr>').join('')+'</tbody></table></div>';
    }
    return main+item.decisions.map(d=>para(statusLabels[d.state]+' · '+d.actor+' · '+dateText(d.at),d.note||'Decision recorded.')).join('');
  }

  function actionForm(item,ui) {
    if(ui.role!=='client'||item.canAct===false)return '';
    const decision=item.state==='in-review',input=item.kind==='input' && item.state==='requested',report=item.kind==='report';
    if(!decision && !input && !report)return '';
    const prompt=decision?'Feedback (needed if you request changes)':input?'Your response':'Feedback for the team';
    const what={calendar:'calendar V'+item.version,strategy:'KPIs',foundation:'foundation V'+item.version,creative:'V'+item.version}[item.kind]||'V'+item.version;
    const summary=!decision?'':item.kind==='calendar'?'You’re approving '+(item.body?.entries?.length||0)+' planned items from '+UX().day(item.body?.start)+' to '+UX().day(item.body?.end)+'. The team can then start production; you’ll still approve each finished creative.':item.kind==='creative'?'You’re approving version '+item.version+' exactly as shown — these files and this caption.':item.kind==='strategy'?'You’re approving how success is measured and reported. The team plans the calendar against these KPIs; you’ll approve the calendar and each finished post separately.':'You’re approving this '+item.kind+' version as written.';
    const buttons=decision?'<button type="submit" class="btn primary" name="outcome" value="approved">Approve '+escape(what)+'</button><button type="submit" class="btn" name="outcome" value="changes-requested">Request changes</button>':
      '<button type="submit" class="btn primary" name="outcome" value="'+(input?'respond':'feedback')+'">'+(input?'Send response':'Send feedback')+'</button>';
    return '<form data-persona-form="'+escape(item.kind)+'" data-id="'+escape(item.id)+'" data-parent="'+escape(item.parent||'')+'" data-brand="'+escape(ui.brand)+'" data-actor="'+escape(ui.actor)+'" class="persona-form">'+
      (summary?'<p class="persona-approve-summary">'+escape(summary)+'</p>':'')+
      '<label>'+prompt+'<textarea name="note" maxlength="5000" rows="3" '+(decision||input?'':'required')+'></textarea></label>'+
      (input?'<label>Attach the requested file (optional)<input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,application/pdf"><small class="muted">Images, video or PDF · up to 30 MB</small></label>':'')+
      '<p class="form-error" role="alert"></p><div class="actions">'+buttons+'</div></form>';
  }

  let current,installed=false;
  function mount(ctx) {
    current=ctx;
    if(installed)return;
    installed=true;
    document.addEventListener('click',ev=>{
      const b=ev.target.closest('[data-persona-open]');
      if(!b || !roleAllowed(current.ui.role))return;
      try {
        const item=findItem(shared(current.state,current.ui),b.dataset.personaOpen,b.dataset.id,b.dataset.parent||'');
        const wide=['calendar','creative','report'].includes(item.kind);
        if(item.kind==='creative'){const html=details(item),split=html.indexOf('<section class="persona-copy"><h3>Submitted caption</h3>');current.showModal(escape(UX().clean(item.title)),'<div class="modal-body persona-detail persona-review-grid"><div class="persona-review-media">'+(split>=0?html.slice(0,split):html)+'</div><aside class="persona-review-side">'+(split>=0?html.slice(split):'')+actionForm(item,current.ui)+'</aside></div>');}
        else current.showModal(escape(UX().clean(item.title)),'<div class="modal-body persona-detail">'+details(item)+actionForm(item,current.ui)+'</div>');
        document.getElementById('modal')?.classList.toggle('wide',wide);
      } catch(err){current.toast(err.message);}
    });
    document.addEventListener('submit',async ev=>{
      const f=ev.target.closest('form[data-persona-form]');
      if(!f)return;
      ev.preventDefault();ev.stopImmediatePropagation();
      const ctx=current;
      const command={kind:f.dataset.personaForm,id:f.dataset.id,parent:f.dataset.parent,actor:f.dataset.actor,brand:f.dataset.brand,note:f.elements.note.value,outcome:ev.submitter?.value};
      if(!command.outcome)return;
      const buttons=[...f.querySelectorAll('button')],note=f.elements.note;
      if(command.outcome==='changes-requested'&&!command.note.trim()){const el=f.querySelector('[role="alert"]');el.textContent='Explain what needs to change so the team can fix it.';note.setAttribute('aria-invalid','true');note.focus();return;}
      buttons.forEach(b=>b.disabled=true);
      try {
        const file=f.elements.file?.files?.[0];
        if(file){if(file.size>30*1024*1024)throw Error(file.name+' is larger than 30 MB.');command.attachment={name:file.name,type:file.type,size:file.size,url:await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Could not read '+file.name));reader.readAsDataURL(file);})};}
        const what={calendar:'Calendar',strategy:'KPIs',foundation:'Foundation',creative:'Creative'}[command.kind]||'Response';
        const planKey={foundation:'foundationVersions',strategy:'strategies',calendar:'calendars'}[command.kind];
        const sender=(planKey&&O?.account?.(ctx.state,command.brand)?.[planKey]?.find(v=>v.id===command.id)?.actor)||'The team';
        const next={foundation:sender+' can now set the strategy with you.',strategy:sender+' will plan the calendar against them next.',calendar:sender+' will hand these posts to production. You’ll still approve each finished post.',creative:'The team will schedule it for publishing.'}[command.kind]||'';
        const message=command.kind==='input'?'Response sent to the team.':command.kind==='report'?'Feedback sent to the team.':command.outcome==='approved'?what+' approved. '+next:sender+' has your note and will send a new version.';
        await ctx.commit(next=>perform(next,ctx.ui,command),message);
      }
      catch(err){const el=f.querySelector('[role="alert"]');el.textContent=err.message;el.tabIndex=-1;el.focus();}
      finally {buttons.forEach(b=>b.disabled=false);}
    },true);
  }
  const api={view,mount,shared,perform,outcomeCards};
  if(common)module.exports=api;else root.JMLPersonas=api;
})(typeof window!=='undefined'?window:globalThis);
