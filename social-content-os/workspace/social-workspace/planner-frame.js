/* Bind the original planner controls to their containing Social Workspace. */
(() => {
  'use strict';
  const workspaceLink = document.getElementById('social-workspace-link');
  function updateLink() {
    if (workspaceLink) workspaceLink.href='social-workspace.html?brand='+encodeURIComponent(activeBrandId)+'#plan';
  }
  updateLink();
  if (!plannerEmbedded) {
    const selectOriginal = selectBrand;
    selectBrand = function(id) { selectOriginal(id);updateLink(); };
    return;
  }

  const host = window.parent.JMLPlanner;
  const fonts=document.createElement('link');fonts.rel='stylesheet';fonts.href='social-workspace/fonts.css';document.head.append(fonts);
  const snapshot = value=>JSON.parse(JSON.stringify(value));
  const equivalent = (a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const el = id=>document.getElementById(id);
  const customThemes=new Map();
  function setPalette(id){
    const style=document.documentElement.style;
    const palette=customThemes.get(id);
    const theme=window.parent.JMLTheme;
    if(theme){
      const t=theme.apply({id,...(palette?{primary:palette[0],accent:palette[1]}:{})},document);
      const aliases={'--jml-purple':t.link,'--jml-lime':t.accent,'--jml-ink':t.ink,'--jml-paper':t.surface,'--jml-mist':t.canvas,'--jml-line':t.line,'--jml-muted':t.muted,'--jml-soft-purple':t.tint,'--jml-soft-lime':t.tint,'--brand-sidebar':t.chrome,'--brand-on-sidebar-muted':t.chromeMuted,'--brand-font-display':'"DM Serif Display",Georgia,serif'};
      for(const [key,value]of Object.entries(aliases))style.setProperty(key,value);return;
    }
    const tokens=['--jml-purple','--jml-lime','--brand-sidebar','--jml-soft-purple','--jml-soft-lime'];
    tokens.forEach(key=>style.removeProperty(key));
    if(!palette)return;
    const [primary,accent]=palette;
    const channel=primary.slice(1).match(/../g).map(v=>{
      const n=parseInt(v,16)/255;return n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4;
    });
    const rail=channel[0]*.2126+channel[1]*.7152+channel[2]*.0722>.18?'#262a31':primary;
    [primary,accent,rail,'color-mix(in srgb, '+primary+' 8%, white)','color-mix(in srgb, '+accent+' 15%, white)'].forEach((value,i)=>style.setProperty(tokens[i],value));
  }
  let baseline, revision, running=false, changed=false, writable=false, failure=false, notes={};
  let submitChain = Promise.resolve();
  let identity=null,sectionList=[],activeSection='calendar',hostRouting=false,draftMemory={};
  const nativeSections={};
  function draftKey(form){return form.id==='settingsForm'?'settingsForm|'+form.elements.kind.value+'|'+form.elements.entity_id.value:form.id||form.dataset.plannerDraftKey;}
  function captureDraft(form){
    const key=draftKey(form);if(!key)return;
    draftMemory[key]=Object.fromEntries([...form.querySelectorAll('input[name],select[name],textarea[name]')].filter(e=>e.type!=='file').map(e=>[e.name,e.type==='checkbox'?e.checked:e.value]));
  }
  function restoreDraft(form){const values=draftMemory[draftKey(form)];if(values)for(const input of form.querySelectorAll('[name]'))if(Object.hasOwn(values,input.name)){if(input.type==='checkbox')input.checked=!!values[input.name];else input.value=values[input.name];}}
  function sectionFor(kind,value){return sectionList.find(s=>s.kind===kind&&(value===undefined||s.value===value));}
  function requestSection(kind,value){const section=sectionFor(kind,value);if(section)submitChain.then(()=>{if(!failure)host.navigateSection(window,section.key);});}
  function applySection(section){
    if(!section||!sectionList.some(s=>s.key===section.key))throw Error('Unknown planner section.');
    if(section.kind==='settings'&&!activePortalRole().canSettings)throw Error('Settings require workspace administrator access.');
    if(section.kind==='report'&&!activePortalRole().reportTabs.includes(section.value))throw Error('This report is not available for the selected person.');
    hostRouting=true;
    try{
      document.body.classList.remove('planner-module-open','planner-artwork-open');
      const module=el('moduleDialog');if(module.open)module.close();
      document.querySelector('.planner-inline-gallery')?.remove();
      activeSection=section.key;
      if(section.kind==='calendar')nativeSections.calendar(section.value);
      else if(section.kind==='dashboard')nativeSections.dashboard();
      else if(section.kind==='settings'){activeSettingsTab=section.value;nativeSections.settings();}
      else if(section.kind==='report'){activeReportTab=section.value;nativeSections.report();}
      else if(section.kind==='module'){
        nativeSections.calendar('all');nativeSections.module(section.value);if(module.open)module.close();
        document.querySelector('.workspace').append(module);document.body.classList.add('planner-module-open');module.show();
      }else if(section.kind==='artwork'){
        nativeSections.calendar('all');document.body.classList.add('planner-artwork-open');
        const gallery=document.createElement('iframe');gallery.className='planner-inline-gallery';gallery.title='Prepared artwork';gallery.src='content-planner-review.html?account='+encodeURIComponent(activeBrandId);
        window.JMLGallery={account:win=>win===gallery.contentWindow?activeBrandId:null,studio:(win,id)=>{if(win===gallery.contentWindow&&posts.some(p=>p.id===id&&p.brand_id===activeBrandId))submitChain.then(()=>host.studio(window,id));},back:win=>{if(win===gallery.contentWindow)requestSection('calendar','all');}};
        document.querySelector('.workspace').append(gallery);
      }
      document.documentElement.dataset.plannerSection=activeSection;document.title=section.label+' · '+brands[activeBrandId].name;
    }finally{hostRouting=false;}
    rememberView();
  }

  function readData() {
    return {rows:posts.map(row=>{
      const {workspaceAssets, ...record}=row;
      return snapshot(record);
    }), settings:snapshot(brandSettings), notifications:snapshot(reviewNotifications),notes:snapshot(notes)};
  }

  function registerBrands(list) {
    for (const b of list) {
      if (/^#[0-9a-f]{6}$/i.test(b.primary)&&/^#[0-9a-f]{6}$/i.test(b.accent)) customThemes.set(b.id,[b.primary,b.accent]);
      if (Object.hasOwn(brands,b.id)) continue;
      if (!/^[\w-]+$/.test(b.id) || Object.hasOwn(Object.prototype,b.id)) throw Error('Unsupported account identifier.');
      const account={name:b.name,shortLabel:b.name,themeName:b.name+' palette',slug:b.id,assetCount:0,
        campaigns:[{name:'Editorial calendar',objective:'',owner:'Content lead',status:'active'}],
        pillars:[{name:'General',purpose:''}], team:[['Content lead','Content owner']],assets:[],quarter:[]};
      brands[b.id]=account; brandLogos[b.id]={src:null,alt:'Jay Marketing Lab workspace'};
      defaultPlatforms[b.id]=['Instagram','LinkedIn','Facebook'];
      defaultBrandSettings[b.id]=buildDefaultSettings(b.id,account);
      brandSettings[b.id]=snapshot(defaultBrandSettings[b.id]);
      for(const id of ['settingsBrandSelect','reportBrandSelect']) el(id).add(new Option(b.name,b.id));
      const button=document.createElement('button');
      button.type='button';button.className='brand-option';button.dataset.brand=b.id;
      const name=document.createElement('b');name.textContent=b.name;
      const code=document.createElement('code');code.textContent=b.id;
      button.append(name,code);
      button.onclick=ev=>{ev.stopPropagation();if(activePortalRole().allAccounts)selectBrand(b.id);};
      el('brandMenu').append(button);
    }
  }

  function applySettings(stored) {
    for (const [id,value] of Object.entries(stored || {})) {
      if (!Object.hasOwn(brands,id)) continue;
      const next={brand_id:id};
      for(const kind of ['campaigns','pillars','team','platforms']) {
        next[kind]=normalizeCollection(id,kind,value[kind],defaultBrandSettings[id][kind]);
      }
      brandSettings[id]=next;
    }
    syncSettingsToBrands();
  }
  function applyCampaigns(accounts) {
    const key=name=>name.trim().toLocaleLowerCase();
    for(const brand of accounts) {
      const entries=brandSettings[brand.id].campaigns;
      for(const campaign of brand.campaigns||[]) {
        const match=entries.find(c=>c.id===campaign.id || key(c.name)===key(campaign.title));
        const fields={name:campaign.title,objective:campaign.objective,owner:campaign.owner};
        if(match)Object.assign(match,fields);
        else entries.push({id:campaign.id,brand_id:brand.id,status:'active',...fields});
      }
    }
    syncSettingsToBrands();
  }

  function rememberView() {
    if(!writable)return;
    host.remember(window,{brandId:activeBrandId,personId:identity?.personId||'',section:activeSection,drafts:snapshot(draftMemory),week:activeWeekStart,view:activeView,status:activeStatus,
      role:activePortalRoleId,search:el('searchInput').value,platform:el('platformFilter').value,campaign:el('campaignFilter').value,
      artwork:el('artworkFilter').value,settings:activeSettingsTab,report:activeReportTab,
      mode:['dashboard','settings','reporting'].find(key=>document.body.classList.contains(key+'-open')) || 'calendar'});
  }

  function stageChange() {
    if(!writable || failure)return;
    changed=true;
    if(running)return;
    running=true;
    submitChain=Promise.resolve().then(async()=>{
      try {
        while(changed) {
          changed=false;
          const next=readData(),previous=new Map(baseline.rows.map(r=>[r.id,r]));
          const rows=next.rows.filter(r=>!equivalent(r,previous.get(r.id))).map(after=>({before:previous.get(after.id)||null,after}));
          const payload={rows,revision};
          for(const key of ['settings','notifications','notes']) if(!equivalent(baseline[key],next[key])) payload[key]=next[key];
          if(rows.length || Object.keys(payload).length>2) revision=await host.write(window,payload);
          baseline=next;
        }
      }catch(err){
        failure=true;
        const issue=el('planner-sync-error');issue.hidden=false;
        issue.querySelector('span').textContent='Calendar changes could not be saved. '+err.message;
        issue.focus();
        document.querySelectorAll('dialog[open]').forEach(d=>d.close());
        for(const item of document.querySelectorAll('#planner-sync-error ~ section,#planner-sync-error ~ .app,#planner-sync-error ~ main'))item.inert=true;
      }finally{running=false;}
    });
  }

  function supportNotes() {
    const original=bindCards;
    bindCards=function() {
      original();
      for(const button of document.querySelectorAll('[data-note]')) {
        const key=activeBrandId+'|'+button.dataset.note;
        button.textContent=notes[key]?'View note':'Add note';
        button.onclick=()=>{
          const d=document.createElement('dialog');d.className='review-dialog';
          const title=document.createElement('h2');title.textContent='Calendar note';
          const label=document.createElement('label');label.textContent=brands[activeBrandId].name+' · '+button.dataset.note;
          const input=document.createElement('textarea');input.value=notes[key]||'';input.maxLength=3000;label.append(input);
          input.name='note';d.dataset.plannerDraftKey='note|'+key;input.value=draftMemory['note|'+key]?.note??input.value;
          input.readOnly=!activePortalRole().canCreate;
          const ok=document.createElement('button');ok.textContent='Save note';ok.hidden=input.readOnly;
          ok.onclick=()=>{const value=input.value.trim();if(value)notes[key]=value;else delete notes[key];delete draftMemory['note|'+key];stageChange();d.close();renderAll();};
          const cancel=document.createElement('button');cancel.textContent='Close';cancel.onclick=()=>d.close();
          d.append(title,label,ok,cancel);d.onclose=()=>d.remove();document.body.append(d);d.showModal();input.focus();
        };
      }
    };
  }
  function openGallery(itemId) {
    if (!['brand_nn','brand_jay'].includes(activeBrandId)) {openModule('assets');return;}
    if (itemId && !posts.some(p=>p.id===itemId && p.brand_id===activeBrandId)) return;
    const dialog=document.createElement('dialog');dialog.className='planner-gallery';
    const back=document.createElement('button');back.textContent='← Back to calendar';back.onclick=()=>dialog.close();
    const gallery=document.createElement('iframe');gallery.title='Prepared artwork gallery';
    gallery.src='content-planner-review.html?account='+encodeURIComponent(activeBrandId)+(itemId?'#'+encodeURIComponent(itemId):'');
    const session={
      account(win){return win===gallery.contentWindow?activeBrandId:null;},
      studio(win,id) {
        if(win!==gallery.contentWindow || !posts.some(p=>p.id===id && p.brand_id===activeBrandId))return;
        submitChain.then(()=>{if(!failure){dialog.close();host.studio(window,id);}});
      },
      back(win){if(win===gallery.contentWindow)dialog.close();}
    };
    window.JMLGallery=session;
    dialog.onclose=()=>{if(window.JMLGallery===session)delete window.JMLGallery;dialog.remove();};
    dialog.append(back,gallery);document.body.append(dialog);dialog.showModal();back.focus();
  }
  function installHooks(){
    Object.assign(nativeSections,{calendar:openCalendar,dashboard:openDashboard,settings:openSettings,report:openReporting,module:openModule});
    openCalendar=function(status='all'){if(hostRouting||!writable)return nativeSections.calendar(status);requestSection('calendar',status);};
    openDashboard=function(){if(hostRouting||!writable)return nativeSections.dashboard();requestSection('dashboard');};
    openSettings=function(){if(hostRouting||!writable)return nativeSections.settings();requestSection('settings',activeSettingsTab);};
    openReporting=function(){if(hostRouting||!writable)return nativeSections.report();requestSection('report',activeReportTab);};
    openModule=function(kind){if(hostRouting||!writable)return nativeSections.module(kind);requestSection('module',kind);};
    const originalReviewUI=syncReviewUI;
    syncReviewUI=function(){originalReviewUI();if(identity){reviewOwner=identity.name;el('ownerPreviewLabel').hidden=true;el('reviewOwner').disabled=true;el('notificationCount').textContent=visibleNotifications().filter(n=>!(n.readBy||[]).includes(reviewPersona())).length;}};
    for(const id of ['newIdeaDialog','settingsDialog']){
      const dialog=el(id),show=dialog.showModal.bind(dialog),form=dialog.querySelector('form');
      dialog.showModal=()=>{restoreDraft(form);show();};
      dialog.addEventListener('close',()=>{delete draftMemory[draftKey(form)];rememberView();});
    }
    const header=document.querySelector('.topbar');
    const heading=document.createElement('div'),actions=document.createElement('div');
    heading.className='planner-heading-row';actions.className='planner-actions-row';
    heading.append(el('mobileMenu'),header.querySelector('.title-block'),header.querySelector('.role-switch'));
    shelfButton.className='planner-artwork-button';
    shelfButton.removeAttribute('style');
    actions.append(header.querySelector('.date-nav'),header.querySelector('.view-switch'),el('exportBtn'),el('quickAdd'),shelfButton);
    header.prepend(heading,actions);
    document.querySelector('.review-disclosure').textContent='Planning decisions and calendar notes for this workspace.';
    const originalTheme=applyBrandTheme;
    applyBrandTheme=function(){originalTheme();setPalette(activeBrandId);};
    const originalDrawerFallback=showToast;
    showToast=function(message){
      if(failure) originalDrawerFallback('The planner has unsaved changes. Reload the calendar to recover.');
      else originalDrawerFallback(message);
    };
    save=stageChange;
    saveSettings=()=>{syncSettingsToBrands();stageChange();};
    persistReviewNotifications=stageChange;
    const originalSelect=selectBrand;
    selectBrand=function(id) {
      if(writable&&id!==activeBrandId){showToast('Choose the account in the workspace header.');return;}
      originalSelect(id);rememberView();
    };
    const originalOpen=openDrawer;
    openDrawer=function(id) {
      originalOpen(id);
      const button=document.createElement('button');button.type='button';button.className='open-studio';button.textContent='Open in Studio';
      button.onclick=()=>submitChain.then(()=>{if(!failure)host.studio(window,id);});
      el('drawerBody').prepend(button);
    };
    for(const name of ['click','input','change'])document.addEventListener(name,event=>{
      if(name==='input'||name==='change'){const form=event.target.closest('#ideaForm,#settingsForm,[data-planner-draft-key]');if(form)captureDraft(form);}
      queueMicrotask(rememberView);
    });
    window.addEventListener('pagehide',rememberView);
    document.addEventListener('click',event=>{
      const a=event.target.closest('a[href]');
      if(!a)return;
      const url=new URL(a.href), gallery=new URL('content-planner-review.html',location.href);
      if(url.origin!==gallery.origin || url.pathname!==gallery.pathname)return;
      event.preventDefault();event.stopImmediatePropagation();
      openGallery(url.hash.slice(1));
    },true);
    shelfButton.onclick=()=>requestSection('artwork');
    supportNotes();
    window.JMLPlannerFrame={navigate:async section=>{await submitChain;if(failure)throw Error('Planner changes have not saved.');applySection(section);},prepareNavigation:async()=>{rememberView();await submitChain;if(failure)throw Error('Planner changes have not saved.');return true;}};
  }
  function showError(err){
    host.reportError?.(window,err.message);
    document.documentElement.classList.remove('planner-booting');
    const box=el('planner-sync-error');box.hidden=false;box.querySelector('span').textContent=err.message;
  }
  async function start() {
    try {
      let stored=[];try{stored=Array.isArray(storedPosts)?storedPosts:[];}catch{}
      // Retain original user edits that the old demo's seeding/filtering
      // would otherwise replace. Rows backed by B4K correction keep its match.
      const merged=new Map(posts.map(r=>[r.id,r]));
      for(const row of stored)if(row?.id && !row.importBatch?.startsWith('b4k-creatives')) {
        merged.set(row.id,{...merged.get(row.id),...row,brand_id:row.brand_id||'brand_b4k'});
      }
      const data=await host.accept(window,{rows:[...merged.values()].map(r=>({...r,brand_id:r.brand_id||'brand_b4k'})),storedIds:stored.map(r=>r.id),settings:snapshot(brandSettings),notifications:snapshot(reviewNotifications)});
      if(!data)return;
      identity=data.identity;sectionList=data.sections||[];
      registerBrands(data.brands);applySettings(data.archive.settings);applyCampaigns(data.brands);
      reviewNotifications=data.archive.notifications;notes=data.archive.notes;
      posts=data.rows;revision=data.revision;
      const view=data.view?.brandId===data.brandId&&data.view?.personId===(data.identity?.personId||'')?data.view:null;
      draftMemory=snapshot(view?.drafts||{});
      document.body.classList.add('authenticated');
      document.body.classList.remove('dashboard-open','reporting-open','settings-open');
      activePortalRoleId=data.identity?(data.identity.canSettings?'platform_admin':data.identity.canEdit?'content_operations_coordinator':'client_viewer'):(portalRoles[view?.role]?view.role:'platform_admin');
      if(data.identity){
        portalRoles[activePortalRoleId]={...portalRoles[activePortalRoleId],name:data.identity.name,canCalendar:true,canCreate:data.identity.canEdit,canSettings:data.identity.canSettings,canApprove:false,allAccounts:false,
          canReporting:!!data.identity.canReport,canPortfolio:!!data.identity.canPortfolio,canInternalReport:!!data.identity.canReport,canClientReport:!!data.identity.canReport,
          reportTabs:data.identity.canReport?(data.identity.canPortfolio?['portfolio','channels','internal','client']:['channels','internal','client']):[],modules:['campaigns','pillars','assets','team','performance','experiments','sources','roles']};
        const lockedRole=activePortalRoleId;switchPortalRole=function(){activePortalRoleId=lockedRole;showToast('Change the person in the workspace header.');};
        for(const id of ['roleSwitcher','loginRole']){el(id).disabled=true;el(id).title='Identity is managed by the Social Workspace';}
        document.querySelector('.role-switch label').textContent='Workspace person';
        const badge=document.querySelector('.role-sim-badge');if(badge)badge.textContent='Shared identity';
        const allowed=new Set(data.brands.map(b=>b.id));document.querySelectorAll('[data-brand]').forEach(b=>{if(!allowed.has(b.dataset.brand))b.hidden=true;});
      }
      activeBrandId=data.brandId;
      const anchor=posts.filter(r=>r.brand_id===activeBrandId && r.date).sort((a,b)=>a.date.localeCompare(b.date))[0]?.date;
      if(view?.week)activeWeekStart=view.week;
      else if(!Object.hasOwn(planAccounts,activeBrandId) && activeBrandId!=='brand_zees' && anchor)activeWeekStart=anchor;
      el('artworkFilter').value=view?.artwork || (posts.some(p=>p.brand_id===activeBrandId && creativeFor(p))?'artwork':'all');
      installHooks();renderAll();applyRoleUI();
      if(view?.search)el('searchInput').value=view.search;
      if(view?.platform)el('platformFilter').value=view.platform;
      if(view?.campaign)el('campaignFilter').value=view.campaign;
      const viewKey=view?.view||'week';
      document.querySelector('[data-view="'+viewKey+'"]')?.click();
      if(view?.settings)activeSettingsTab=view.settings;
      if(view?.report)activeReportTab=view.report;
      applySection(data.section||sectionFor('calendar','all'));
      baseline=readData();writable=true;rememberView();
      document.documentElement.classList.remove('planner-booting');
      const surface=document.querySelector('.app');let resizeScheduled=false;
      const resize=()=>{if(resizeScheduled)return;resizeScheduled=true;requestAnimationFrame(()=>{resizeScheduled=false;host.resize?.(window,Math.ceil(surface.getBoundingClientRect().height+surface.offsetTop));});};
      new ResizeObserver(resize).observe(surface);resize();
    } catch(err){showError(err);}
  }
  start();
})();
