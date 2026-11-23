/* Shared task hierarchy. Native disclosures preserve access to uncommon options. */
(function(root){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const section=(title,note,fields)=>'<fieldset class="task-section full"><legend>'+esc(title)+'</legend>'+(note?'<p class="task-note">'+esc(note)+'</p>':'')+'<div class="form-grid">'+fields+'</div></fieldset>';
  const optional=(title,fields,open=false)=>'<details class="task-options full"'+(open?' open':'')+'><summary>'+esc(title)+'</summary><div class="form-grid">'+fields+'</div></details>';
  const summary=(title,text)=>'<div class="task-summary full"><strong>'+esc(title)+'</strong><p>'+esc(text)+'</p></div>';
  const lead=(title,text,action='')=>'<section class="task-lead"><div><h2>'+esc(title)+'</h2><p>'+esc(text)+'</p></div>'+action+'</section>';

  /* Plain-language labels for stored keys. Stored values never change; only their display does. */
  const WORDS={
    production:'Production',qa:'Internal QA',client:'Client decision',community:'Community handoff',publish:'Publishing',analysis:'Analysis',planning:'Planning',
    assigned:'Assigned',accepted:'Accepted',blocked:'Blocked',completed:'Completed',superseded:'Replaced by a newer handoff',cancelled:'Cancelled','reassignment-requested':'Reassignment requested',reassign:'Reassignment requested',
    calendar:'Calendar',strategy:'Strategy',content:'Content idea',foundation:'Foundation',brief:'Brief',
    captured:'Captured',reviewed:'Reviewed',synthesized:'Synthesized',rejected:'Rejected',archived:'Archived',merged:'Merged',
    saves:'Saves',views:'Views',clicks:'Clicks',leads:'Leads',reach:'Reach',impressions:'Impressions',likes:'Likes',comments:'Comments',shares:'Shares',followers:'Followers',newfollows:'New follows',netfollowers:'Net followers',qualifiedleads:'Qualified leads',interactions:'Interactions',
    organic:'Organic',paid:'Paid',period:'Period total',daily:'Daily',
    sample:'Sample',manual:'Recorded',imported:'Imported',recorded:'Recorded',fixture:'Sample'
  };
  const clean=v=>String(v??'').replace(/Â·/g,'·').replace(/Â·/g,'·');
  const sentence=v=>{const s=clean(v).trim();return s?s.charAt(0).toUpperCase()+s.slice(1):s;};
  const human=v=>{const k=String(v??'').trim();if(!k)return '';return WORDS[k]??WORDS[k.toLowerCase()]??sentence(k.replace(/[-_]+/g,' '));};
  const plural=(n,one,many=one+'s')=>Number(n).toLocaleString('en-US')+' '+(Number(n)===1?one:many);
  const thisYear=()=>new Date().getFullYear();
  /* "2026-11-24" → "Nov 24" (year only when it is not the current year). */
  function day(value,fallback='No date',zone){
    const raw=String(value??'');
    if(/^\d{4}-\d{2}-\d{2}T/.test(raw)){const t=new Date(raw);if(!Number.isNaN(t.getTime())){try{return t.toLocaleDateString('en-US',{month:'short',day:'numeric',...(t.getFullYear()!==thisYear()?{year:'numeric'}:{}),...(zone?{timeZone:zone}:{})});}catch{}}}
    const s=raw.slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return value?raw:fallback;
    const d=new Date(s+'T12:00:00Z');return d.toLocaleDateString('en-US',{month:'short',day:'numeric',...(d.getUTCFullYear()!==thisYear()?{year:'numeric'}:{}),timeZone:'UTC'});
  }
  /* ISO instant → "Nov 21, 8:06 PM PST" in the account's time zone. */
  function when(value,zone){
    if(!value)return '';const d=new Date(value);if(Number.isNaN(d.getTime()))return String(value);
    const opts={month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short',...(d.getFullYear()!==thisYear()?{year:'numeric'}:{})};
    try{return d.toLocaleString('en-US',{...opts,timeZone:zone||undefined});}catch{return d.toLocaleString('en-US',opts);}
  }
  const initials=name=>String(name||'?').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join('')||'?';
  const avatar=(name,cls='')=>'<span class="ux-avatar '+cls+'" aria-hidden="true">'+esc(initials(name))+'</span>';
  /* A small ordered progress indicator. steps: [{label, state:'done'|'current'|'todo'|'blocked', note?, href?}] */
  function stepper(steps,label='Progress'){
    return '<ol class="ux-stepper" aria-label="'+esc(label)+'">'+steps.map((s,i)=>{const inner='<span class="ux-step-dot" aria-hidden="true">'+(s.state==='done'?'✓':i+1)+'</span><span class="ux-step-text"><b>'+esc(s.label)+'</b>'+(s.note?'<small>'+esc(s.note)+'</small>':'')+'</span>';return '<li class="ux-step '+esc(s.state||'todo')+'"'+(s.state==='current'?' aria-current="step"':'')+'>'+(s.href?'<a href="'+esc(s.href)+'">'+inner+'</a>':inner)+'<span class="hidden"> — '+esc({done:'done',current:'current step',blocked:'blocked',todo:'not started'}[s.state||'todo'])+'</span></li>';}).join('')+'</ol>';
  }
  /* A checklist whose rows say who owns each outstanding item. rows: [{done, text, owner?, action?}] */
  function gaps(rows){
    return '<ul class="ux-gaps">'+rows.map(r=>'<li class="'+(r.done?'done':'open')+'"><span class="ux-gap-mark" aria-hidden="true">'+(r.done?'✓':'')+'</span><span>'+esc(r.text)+(r.owner?'<small>'+(r.done?'':'Waiting on ')+esc(r.owner)+'</small>':'')+'</span>'+(r.action||'')+'<span class="hidden">'+(r.done?' (done)':' (to do)')+'</span></li>').join('')+'</ul>';
  }

  /* Visible required markers and inline validation, replacing the browser's floating bubbles. */
  const CONTROL='input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]),select,textarea';
  function labelFor(control){return control.closest('label')||(control.id&&control.ownerDocument.querySelector('label[for="'+CSS.escape(control.id)+'"]'));}
  function markRequired(scope){
    if(!scope?.querySelectorAll)return;
    scope.querySelectorAll('[required]').forEach(control=>{
      if(control.type==='checkbox'||control.type==='radio'){control.closest('label')?.classList.add('ux-attest');return;}
      if(!control.matches(CONTROL+',input[type=file]'))return;
      const label=labelFor(control);if(!label||label.querySelector('.ux-req'))return;
      const mark=document.createElement('abbr');mark.className='ux-req';mark.title='Required';mark.textContent='*';
      const text=[...label.childNodes].find(n=>n.nodeType===3&&n.textContent.trim())||label.querySelector(':scope > span:not(.hidden), :scope > b, :scope > strong');
      if(text?.nodeType===3){const span=document.createElement('span');span.className='ux-label-text';text.replaceWith(span);span.append(text,' ',mark);}
      else if(text)text.append(' ',mark);
      else label.prepend(mark);
    });
  }
  function messageFor(control){
    if(control.validity.valueMissing)return control.type==='checkbox'?'Tick this box to confirm before continuing.':control.type==='file'?'Choose a file.':control.tagName==='SELECT'?'Choose an option.':'This field is required.';
    if(control.validity.patternMismatch&&control.title)return control.title;
    return control.validationMessage||'Check this value.';
  }
  function showFieldError(control){
    const host=control.type==='checkbox'?control.closest('label')||control.parentElement:labelFor(control)||control.parentElement;if(!host)return;
    let note=host.querySelector(':scope > .ux-field-error');
    if(!note){note=document.createElement('span');note.className='ux-field-error';note.id=(control.id||control.name||'field')+'-'+Math.random().toString(36).slice(2,7)+'-error';host.append(note);}
    note.textContent=messageFor(control);control.setAttribute('aria-invalid','true');
    const described=new Set((control.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));described.add(note.id);control.setAttribute('aria-describedby',[...described].join(' '));
  }
  function clearFieldError(control){
    if(!control?.hasAttribute?.('aria-invalid'))return;control.removeAttribute('aria-invalid');
    const host=control.type==='checkbox'?control.closest('label')||control.parentElement:labelFor(control)||control.parentElement;host?.querySelector(':scope > .ux-field-error')?.remove();
  }
  let installed=false,firstInvalid=null;
  function init(){
    if(installed||typeof document==='undefined')return;installed=true;
    document.addEventListener('invalid',ev=>{
      const control=ev.target;let parent=control.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
      ev.preventDefault();showFieldError(control);
      if(!firstInvalid){firstInvalid=control;queueMicrotask(()=>{const c=firstInvalid;firstInvalid=null;c.scrollIntoView({block:'center',behavior:'smooth'});try{c.focus({preventScroll:true});}catch{}});}
    },true);
    const clear=ev=>{if(ev.target.matches?.('input,select,textarea')&&ev.target.checkValidity?.())clearFieldError(ev.target);};
    document.addEventListener('input',clear,true);document.addEventListener('change',clear,true);
    const observer=new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1)markRequired(n.matches?.('form,dialog,main,section,fieldset')?n:n.parentElement||n);});
    const start=()=>{markRequired(document.body);observer.observe(document.body,{childList:true,subtree:true});};
    if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
  }
  const api={section,optional,summary,lead,init,esc,clean,sentence,human,plural,day,when,initials,avatar,stepper,gaps,markRequired,showFieldError,clearFieldError};
  if(typeof document!=='undefined')init();
  if(typeof module==='object'&&module.exports)module.exports=api;else root.JMLWorkflowUI=api;
})(typeof window==='undefined'?globalThis:window);
