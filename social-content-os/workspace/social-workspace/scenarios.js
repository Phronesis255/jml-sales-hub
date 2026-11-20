/* Optional practice records. Existing client work and edited examples stay intact. */
(function (root) {
  'use strict';
  const common = typeof module === 'object' && module.exports;
  const C = common ? require('./core.js') : root.JMLCore;
  const O = common ? require('./operations.js') : root.JMLOps;
  const D = common ? require('./release-domain.js') : root.JMLReleaseDomain;
  const team = {lead:'Demo account lead', producer:'Demo producer', reviewer:'Demo QA reviewer', client:'Demo client reviewer'};
  const source = 'Fictional practice content prepared for Demo studio.';

  function draft(title, format, day) {
    const post = C.makePost({brandId:'demo',example:true,title:'Demo · '+title,format,date:day,source,
      objective:'Help a visitor plan a first visit to the fictional Fieldwork Studio',audience:'First-time workshop visitors',
      cta:'Save the studio checklist',owner:team.producer,caption:'Before your first workshop, save the materials checklist and bring your sketchbook.'});
    Object.assign(post.brief,{approver:team.client,direction:'Show one action per frame with large, readable captions.',
      slideCopy:'1. Open the workshop door.\n2. Show the materials checklist.\n3. Close on the sketchbook.'});
    return post;
  }

  function production(post, route, instructions, references) {
    O.configureProduction(post,{route,instructions,references,rights:'Fictional studio-owned material for local practice',rightsExpiry:'',
      consent:'No identifiable people in the planned frames',disclosure:'',output:'Vertical MP4 with burned-in captions',
      producer:team.producer,qcReviewer:team.reviewer,backupOwner:team.lead,draftDue:post.date,reviewDue:C.addDays(post.date,1)},team.lead);
    C.approvePlan(post,team.client);
  }

  function reviewExample(stage, day, decision, carousel=false) {
    const post=draft(carousel?'Editorial carousel proof':decision==='approved'?'Approved workshop announcement':'Workshop caption revision',carousel?'Carousel':'Text post',day);
    const assets=carousel?[
      {id:C.id('asset'),name:'Editorial cover.png',type:'image',alt:'Make room for judgment. Cover from the bundled editorial example.',url:'planner-artwork/jay-new-01-layered-paper-large-v3.png'},
      {id:C.id('asset'),name:'Evidence chart.webp',type:'image',alt:'Bundled chart showing writing time and output quality.',url:'planner-artwork/66f80df1131b68781fd0be5a.webp'}
    ]:[];
    if(carousel)Object.assign(post.brief,{objective:'Explain research on writing assistance',audience:'Business owners',cta:'Compare the two outcomes',
      direction:'Review the supplied cover and chart as a two-slide sequence.',slideCopy:'1. Make room for judgment.\n2. Writing time and rated output quality.',
      caption:'Swipe to compare writing time and quality in the study shown. Which outcome would you measure?'});
    C.approvePlan(post,team.client);
    C.addVersion(post,{caption:post.brief.caption,assets,note:'Fictional practice package'},team.producer);
    C.submit(post,team.reviewer,Object.fromEntries(C.qcKeys.map(k=>[k,true])));
    if(decision)C.decide(post,decision,decision==='approved'?'Approved for the local simulation.':'Specify where visitors can get the materials checklist.',team.client);
    stage.posts.push(post);
    return post;
  }

  function prepare(state) {
    const brand=state.brands.find(b=>b.id==='demo');
    if(!brand)throw Error('Open a workspace that contains the Demo studio account.');
    if(brand.demoScenarios?.version>=1)return brand.demoScenarios;
    const day=C.now().slice(0,10);
    const examples=state.posts.filter(p=>p.example && p.brandId===brand.id);
    const example=n=>examples.find(p=>p.id==='example-'+n);
    // Build an illustrative historical log in isolation. Any current release pauses still apply to later user actions.
    const stage={posts:[],brands:[brand]};
    let carousel=example(1);
    if(carousel?.format!=='Carousel' || !C.latest(carousel)?.assets.length)carousel=reviewExample(stage,day,null,true);
    let approved=example(2);
    if(!approved || !C.isApproved(approved) || C.readiness(approved).length || C.permissionGaps(approved,day).length)approved=reviewExample(stage,day,'approved');
    let rejected=example(3);
    if(!rejected || C.status(rejected)!=='changes-requested')rejected=reviewExample(stage,day,'changes-requested');

    const motion=draft('Workshop checklist in motion','Reel',day);
    production(motion,'A','Animate the three checklist frames in 12 seconds. Hold the closing frame for two seconds.','Fieldwork Studio three-frame script in this brief.');
    O.startProduction(motion,team.producer);
    O.finishTask(motion,motion.production.tasks[0].id,team.producer,'Storyboard v1 · opening, materials and closing card.');
    const footage=draft('Workshop tour pickup shot','Reel',day);
    production(footage,'B','Cut from the workshop door to the materials table. Keep each label in focus.','Shot B2 in the workshop tour.');
    const pickup={id:C.id('request'),title:'Reshoot B2 · materials table in focus',owner:team.producer,due:day,state:'requested',
      note:'First take failed the focus check. Supply a sharp replacement clip and its permission reference before editing.'};
    footage.requests.push(pickup);
    C.event(footage,'Source footage failed inspection','Clip B2 was unreadable. Replacement requested from '+team.producer+'.',team.reviewer);
    const existingRequest=example(4)?.requests.find(r=>!['accepted','cancelled'].includes(r.state));
    const newPosts=[...stage.posts,motion,footage];
    stage.posts=[...examples,...newPosts];

    const destination='Fieldwork Studio · demo';
    const placement=D.createPlacement(stage,brand.id,{contentId:approved.id,account:destination,platform:approved.platform,mode:'simulation',
      scopeApproved:true,approver:C.latest(approved).decisions.slice().reverse().find(d=>d.action==='approved').actor,scheduledAt:day+'T12:00:00Z',timezone:'UTC',owner:team.lead,communityOwner:team.producer,
      nativeNotes:'Fictional timeout exercise. Reconcile the original attempt in Publish.'},team.lead);
    D.receiveHandoff(stage,brand.id,placement.id,team.lead);
    D.advance(stage,brand.id,placement.id,'schedule',{checked:true,scenario:'timeout'},team.lead);
    const batch=D.ingest(stage,brand.id,[
      {metric:'Link clicks',definition:'Recorded link clicks across this account in the sample week',unit:'clicks',value:0},
      {metric:'Saves',definition:'Saves were unavailable in the sample export',unit:'saves',value:null}
    ],{name:'Fictional weekly account export',defaults:{account:destination,source:'Demo studio practice export',start:C.addDays(day,-7),end:C.addDays(day,-1),
      collectedAt:day,timezone:'UTC',segment:'organic',aggregation:'period',origin:'fixture'}},team.lead);

    const cases=[
      {title:'Static carousel proof',view:'studio',contentId:carousel.id},
      {title:'Motion storyboard sign-off',view:'studio',contentId:motion.id},
      {title:'Failed footage dependency',view:'studio',contentId:footage.id,requestId:pickup.id,
        ...(existingRequest?{relatedContentId:example(4).id,relatedRequestId:existingRequest.id}:{})},
      {title:'Rejected creative revision',view:'review',contentId:rejected.id},
      {title:'Uncertain simulated publication',view:'publish',contentId:approved.id,placementId:placement.id},
      {title:'Zero clicks and missing saves',view:'learn',batchId:batch.id}
    ];
    state.posts.push(...newPosts);
    const target=(state.releaseLearning ||= D.read(state));
    for(const key of D.groups)target[key].push(...stage.releaseLearning[key]);
    return brand.demoScenarios={version:1,preparedAt:C.now(),cases};
  }

  if(common)module.exports={prepare};else root.JMLScenarios={prepare};
})(typeof window==='undefined'?globalThis:window);
