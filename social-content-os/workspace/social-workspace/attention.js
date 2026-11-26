/* Due items are derived from their source records each time Today opens. */
window.JMLAttention=(()=>{
  'use strict';
  const D=window.JMLReleaseDomain;
  function collect(ctx){
    const {state,ui}=ctx,db=D.read(state),account=state.brands.find(b=>b.id===ui.brand);
    const G=window.JMLGovernance,can=(cap,record)=>!G||G.can(state,ui,cap,record),owned=(id,name)=>id?id===ui.personId:name===ui.actor;
    const date=new Intl.DateTimeFormat('sv-SE',{timeZone:account.timezone||'UTC',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const rows=[];
    for(const p of db.placements.filter(x=>x.brandId===ui.brand)){
      if(p.state==='verified'&&!p.communityReceipt&&owned(p.communityOwnerPersonId,p.communityOwner))rows.push({id:p.id,title:'Accept community handoff',detail:p.platform+' · '+p.account,status:'Published — watch first comments',tone:'active',owner:p.communityOwner,date:p.verification.actualAt.slice(0,10),cmd:'placement',type:'Community handoff'});
      if(!can('coordinate',p)&&!owned(p.ownerPersonId,p.owner))continue;
      if(['verified','cancelled'].includes(p.state))continue;
      const due=p.scheduledAt<=new Date().toISOString();
      const issues=D.preflight(state,p);
      const urgent=['failed','uncertain','cancel-pending'].includes(p.state);
      const needsVerification=['scheduled','handed-off'].includes(p.state);
      if(!due&&!urgent&&!needsVerification&&!issues.length&&(!p.handoff||p.receipt))continue;
      let cause=issues.join(' · ')||(due?'Release time reached':'');
      if(p.handoff&&!p.receipt)cause='Approved package awaiting publisher acceptance';
      if(urgent)cause=({failed:'Release attempt failed',uncertain:'Delivery needs reconciliation','cancel-pending':'Cancellation needs confirmation'})[p.state];
      if(needsVerification)cause=D.sentPackageValid(state,p)?(p.state==='scheduled'?'Schedule confirmed':'Handoff recorded')+' — verify publication':'Saved release package needs recovery before verification';
      const title=state.posts.find(v=>v.id===p.contentId)?.title||p.contentId;
      rows.push({id:p.id,title,detail:p.platform+' · '+p.account,status:cause,tone:urgent||issues.length?'wait':'active',owner:p.owner,date:p.scheduledAt.slice(0,10),cmd:'placement',type:'Release'});
    }
    for(const w of db.work.filter(x=>x.brandId===ui.brand&&x.status!=='Reviewed'&&x.due<=date)){
      if(!can('coordinate',w)&&!can('analyze',w)&&!can('strategy',w)&&!owned(w.ownerPersonId,w.owner))continue;
      rows.push({id:w.id,title:w.title,detail:w.kind,status:w.status,tone:'',owner:w.owner,date:w.due,cmd:'work-item',type:'Growth & follow-up'});
    }
    for(const r of db.reports.filter(x=>x.brandId===ui.brand&&x.status==='Draft')){
      if(!can('coordinate',r)&&!can('analyze',r)&&!owned(r.reviewerPersonId,r.reviewer))continue;
      rows.push({id:r.id,title:r.title,detail:'Report V'+r.version,status:'Awaiting internal review',tone:'wait',owner:r.reviewer,date:r.end,cmd:'report-item',type:'Report'});
    }
    return rows.sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
  }
  function view(ctx){
    const {e}=ctx,rows=collect(ctx);
    if(!rows.length)return '';
    return '<section class="panel section-gap"><div class="panel-head"><h2>Release and reporting follow-up</h2><span class="count-note">'+rows.length+' OPEN</span></div>'+
      rows.map(x=>{const U=window.JMLWorkflowUI,today=new Date().toISOString().slice(0,10),late=x.date&&x.date<today;return '<div class="list-row followup-row"><div class="row-body"><small class="followup-type">'+e(x.type)+'</small><strong>'+e(U.clean(x.title))+'</strong><p><span class="ux-chip '+(x.tone||'')+'">'+e(U.sentence(x.status||''))+'</span> '+(late?'<span class="ux-chip wait">Overdue</span> ':'')+e(U.clean(x.detail))+'</p><p class="followup-owner">'+U.avatar(x.owner,'small')+e(x.owner)+' · '+(late?'was due ':'due ')+e(U.day(x.date))+'</p></div><button class="btn small" type="button" data-rl="'+x.cmd+'" data-key="'+e(x.id)+'">Open</button></div>';}).join('')+'</section>';
  }
  return {view};
})();
