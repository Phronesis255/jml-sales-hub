/* Reviewed bulk intake. Imports create drafts and never infer approval or identity. */
(function(root){
  'use strict';
  const C=typeof module!=='undefined'&&module.exports?require('./core.js'):root.JMLCore;
  const norm=x=>String(x??'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const fields={externalId:'Content ID',title:'Title / hook',platform:'Channel',publishAt:'Proposed date & time',timezone:'Time zone',format:'Format',owner:'Assignee',caption:'Caption',cta:'CTA',objective:'Objective',direction:'Visual direction',dimensions:'Dimensions',reference:'Reference URL',brand:'Brand'};
  const aliases={externalId:['contentid','externalid','postid','id'],title:['title','workingtitle','topic','headline','hook'],platform:['platform','channel'],publishAt:['publishat','publishdatetime','publishdate','date','targetpublishdate'],timezone:['timezone','tz'],format:['format','contenttype'],owner:['owner','assignee','assignedto'],caption:['caption','copy'],cta:['cta','calltoaction'],objective:['objective','primaryobjective'],direction:['visualdirection','creativedirection'],dimensions:['dimensions','dimensionspx'],reference:['referencelink','referenceurl','sourceurl'],brand:['brand','brandid','brandname']};
  const common=['Content ID','Format','Working title','Suggested owner','Status','Draft due (PT)','Publish date/time','Timezone','Channel','Brand','Objective','Hook','Key message','Caption','CTA'];
  const kinds={Video:['Runtime (sec)','Aspect ratio','Dimensions (px)','Script / VO','Shot list & timing','Audio direction','Captions / accessibility','Cover frame','Export package'],Graphic:['Dimensions (px)','Slide count','Layout / slide map','Copy on artwork','Visual assets & rights','Image alt text','Export package']};
  const required=kind=>[...common,...(kinds[kind]||[])];
  const safeURL=s=>{try{return ['https:','http:'].includes(new URL(s).protocol);}catch{return false;}};
  function parseCSV(text){
    if(typeof text!=='string'||text.length>1000000)throw Error('Use a CSV smaller than 1 MB.');
    text=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');let rows=[],row=[],v='',quoted=false,closed=false;
    for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){v+='"';i++;}else{quoted=false;closed=true;}}else v+=c;}
      else if(c==='"'){if(v||closed)throw Error('Unexpected quote near row '+(rows.length+1)+'.');quoted=true;}
      else if(c===','||c==='\n'){row.push(v);v='';closed=false;if(c==='\n'){if(row.some(x=>x.trim()))rows.push(row);row=[];}}
      else{if(closed)throw Error('Unexpected text after a closing quote near row '+(rows.length+1)+'.');v+=c;}}
    if(quoted)throw Error('A quoted field is not closed.');row.push(v);if(row.some(x=>x.trim()))rows.push(row);
    if(rows.length<2||rows.length>501||rows[0].length>80)throw Error('Use a header and 1–500 content rows, with no more than 80 columns.');
    const headers=rows.shift().map(x=>x.trim());if(headers.some(x=>!x)||new Set(headers.map(norm)).size!==headers.length)throw Error('Give every column a unique, non-empty heading.');
    return {headers,rows};
  }
  const autoMap=headers=>Object.fromEntries(Object.entries(aliases).map(([key,names])=>[key,headers.findIndex(h=>names.includes(norm(h)))]));
  function dateTime(value){
    const m=String(value).trim().match(/^(\d{4}-\d{2}-\d{2})(?:[ T]([01]\d|2[0-3]):([0-5]\d))?$/);
    if(!m)return null;const d=new Date(m[1]+'T00:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==m[1])return null;
    return {date:m[1],time:m[2]?m[2]+':'+m[3]:''};
  }
  const timezoneOK=value=>{try{if(!value)return false;new Intl.DateTimeFormat('en-US',{timeZone:value});return true;}catch{return false;}};
  function people(state,brandId){
    const G=root.JMLGovernance;if(G?.eligiblePeople)return [...new Map([...G.eligiblePeople(state,brandId,'copy'),...G.eligiblePeople(state,brandId,'design')].map(p=>[p.id,p])).values()].filter(p=>p.active!==false);
    const g=state.governance;if(!g)return [];
    return (g.people||[]).filter(p=>p.active!==false&&(g.memberships||[]).some(m=>m.brandId===brandId&&m.personId===p.id&&m.active!==false));
  }
  const personName=p=>p?.name||p?.displayName||'';
  const key=p=>String(p.externalId||p.id).trim().toLowerCase();
  function previewCalendar(state,brandId,table,map,defaultOwner){
    const brand=state.brands.find(b=>b.id===brandId);if(!brand)throw Error('Choose a valid destination account.');
    const members=people(state,brandId),used=new Set(state.posts.filter(p=>p.brandId===brandId).map(key));
    const counts=new Map();for(const row of table.rows){const id=String(row[map.externalId]||'').trim().toLowerCase();counts.set(id,(counts.get(id)||0)+1);}
    const mapped=Object.values(map).filter(n=>n>=0),mappingConflict=new Set(mapped).size!==mapped.length;
    const configured=brand.channels||brand.operations?.foundation?.channels||[];
    const channels=typeof configured==='string'?configured.split(/[,;\n]/).map(c=>c.trim()).filter(Boolean):configured;
    const allowed=Array.isArray(channels)&&channels.length?channels.map(c=>typeof c==='string'?c:c.name):['Instagram','Facebook','LinkedIn','YouTube','TikTok','X','Pinterest','Threads'];
    return table.rows.map((row,index)=>{
      const value=Object.fromEntries(Object.keys(fields).map(f=>[f,String(row[map[f]]??'').trim()]));let errors=[],warnings=[];
      if(mappingConflict)errors.push('Map each source column to one field only.');
      if(row.length!==table.headers.length)errors.push('Column count differs from the header.');
      if(!value.externalId||value.externalId.length>100)errors.push('Content ID is required (100 characters maximum).');
      if(used.has(value.externalId.toLowerCase()))errors.push('Content ID already exists in this account.');
      if(counts.get(value.externalId.toLowerCase())>1)errors.push('Content ID appears more than once in this file.');
      if(!value.title||value.title.length>240)errors.push('A title or hook is required (240 characters maximum).');
      if(value.brand&&![brand.id,brand.name].some(x=>x.toLowerCase()===value.brand.toLowerCase()))errors.push('Row belongs to a different brand.');
      const datetime=dateTime(value.publishAt);if(!datetime)errors.push('Use a real date and optional time: YYYY-MM-DD HH:mm.');
      value.timezone||=brand.timezone;if(!timezoneOK(value.timezone))errors.push('Use a valid IANA time zone.');
      const channel=allowed.find(x=>x.toLowerCase()===value.platform.toLowerCase());if(!channel)errors.push('Channel is not configured for this account.');else value.platform=channel;
      if(!value.format)warnings.push('Format is not supplied; Photo will be proposed.');
      const owner=members.find(p=>map.owner>=0?[p.id,personName(p)].some(x=>x.toLowerCase()===value.owner.toLowerCase()):p.id===defaultOwner);
      if(!owner)errors.push('Select an eligible account assignee or map a matching person.');
      if(value.reference&&!safeURL(value.reference))errors.push('Reference must be an HTTP or HTTPS URL.');
      if(Object.values(value).some(x=>x.length>12000))errors.push('A field exceeds 12,000 characters.');
      return {row:index+2,index,value,datetime,ownerId:owner?.id||'',ownerName:personName(owner),errors,warnings,raw:Object.fromEntries(table.headers.map((h,i)=>[h,row[i]??'']))};
    });
  }
  function checkRevision(state,preview){if(state.revision!==preview.revision)throw Error('The workspace changed after this preview. Preview again before importing.');}
  function importCalendar(state,preview,selected,actor,context){
    checkRevision(state,preview);const rows=previewCalendar(state,preview.brandId,preview.table,preview.map,preview.ownerId),chosen=rows.filter(r=>selected.includes(r.index));
    if(!chosen.length||chosen.some(r=>r.errors.length))throw Error('Select only valid rows for this import.');
    const batch={id:C.id('import'),kind:'calendar',brandId:preview.brandId,fileName:preview.fileName||'Pasted CSV',fileHash:preview.fileHash||'',actor,at:C.now(),map:C.clone(preview.map),rowCount:rows.length,imported:chosen.length,skipped:rows.length-chosen.length,contentIds:[]};
    for(const r of chosen){const v=r.value;const p=C.makePost({brandId:preview.brandId,title:v.title,platform:v.platform,format:v.format||'Photo',date:r.datetime.date,time:r.datetime.time||'09:00',timezone:v.timezone,owner:r.ownerName,caption:v.caption,cta:v.cta,objective:v.objective,source:batch.fileName+' · row '+r.row});
      p.externalId=v.externalId;p.importBatchId=batch.id;p.ownerPersonId=r.ownerId;p.dateNote='Proposed date · imported draft';
      Object.assign(p.brief,{approver:state.brands.find(b=>b.id===preview.brandId)?.operations?.foundation?.finalApprover||'',direction:v.direction,importedPlanning:{values:C.clone(r.raw),dimensions:v.dimensions,reference:v.reference,importBatchId:batch.id}});
      if(v.reference)p.sources.push(v.reference);
      C.event(p,'Calendar draft imported',v.externalId+' · '+batch.fileName+' · row '+r.row,actor);state.posts.push(p);batch.contentIds.push(p.id);
      if(root.JMLGovernance?.assign&&context)root.JMLGovernance.assign(state,context,{brandId:p.brandId,contentId:p.id,kind:'production',personId:r.ownerId,due:p.date,briefRevision:p.briefRevision});
    }
    (state.importBatches??=[]).push(batch);return batch;
  }
  function briefErrors(row){
    const v=row.values,errors=[];if(!kinds[row.kind])return ['Unsupported brief type.'];
    for(const field of required(row.kind))if(!String(v[field]??'').trim())errors.push('Missing '+field+'.');
    if(row.formula)errors.push('Formula cells are unsupported. Export literal values first.');
    if(Object.values(v).some(x=>typeof x!=='string'||x.length>12000))errors.push('Brief fields must be text, at most 12,000 characters each.');
    if(v['Reference URL']&&!safeURL(v['Reference URL']))errors.push('Reference URL must use HTTP or HTTPS.');
    const q=row.kind==='Video'?'Runtime (sec)':'Slide count';if(!/^[1-9]\d{0,3}$/.test(v[q]||''))errors.push(q+' must be a positive whole number.');
    if(row.kind==='Video'&&!/^[1-9]\d*:[1-9]\d*$/.test(v['Aspect ratio']||''))errors.push('Aspect ratio must use width:height.');
    if(!/^[1-9]\d{1,4}\s*[x×]\s*[1-9]\d{1,4}$/i.test(v['Dimensions (px)']||''))errors.push('Dimensions must use width × height.');
    if(!dateTime(v['Draft due (PT)']))errors.push('Draft due date is invalid.');
    if(!dateTime(v['Publish date/time']))errors.push('Proposed publish date/time is invalid.');
    if(!timezoneOK(v.Timezone))errors.push('Time zone is invalid.');return errors;
  }
  function previewBriefs(state,brandId,rows){
    const brand=state.brands.find(b=>b.id===brandId);if(!brand)throw Error('Choose a destination account.');
    const counts=new Map();for(const r of rows){const id=String(r.values['Content ID']||'').toLowerCase();counts.set(id,(counts.get(id)||0)+1);}
    return rows.map((r,index)=>{const v=r.values,id=String(v['Content ID']||'').toLowerCase(),matches=state.posts.filter(p=>p.brandId===brandId&&key(p)===id),p=matches[0],errors=briefErrors(r),warnings=[];
      if(v.Brand?.toLowerCase()!==brand.name.toLowerCase())errors.push('Brand differs from the selected account.');
      if(matches.length!==1)errors.push(matches.length?'More than one matching calendar record.':'No matching calendar Content ID in this account.');
      if(p?.brief.creativeBrief)errors.push('A creative brief is already attached. Edit its saved revision instead.');
      if(p&&v.Channel?.toLowerCase()!==p.platform.toLowerCase())errors.push('Channel differs from the calendar record.');
      if(counts.get(id)>1)errors.push('Content ID appears more than once in this workbook.');
      if(p){const d=dateTime(v['Publish date/time']);if(d&&(d.date!==p.date||(d.time&&d.time!==p.time)||v.Timezone!==p.timezone))errors.push('Date, time or time zone differs from the calendar. Resolve the source before attaching.');
        for(const [field,current] of [['Working title',p.title],['Caption',p.brief.caption],['Format',p.format]])if(v[field]!==current)warnings.push(field+' differs; the workbook value will become the new brief revision.');}
      return {...r,index,contentId:p?.id||'',errors,warnings};});
  }
  function briefFields(kind,values,extra={}){return {title:values['Working title'],format:values.Format,brief:{objective:values.Objective,cta:values.CTA,caption:values.Caption,direction:kind==='Graphic'?values['Layout / slide map']:values['Shot list & timing'],slideCopy:kind==='Graphic'?values['Copy on artwork']:values['Script / VO'],creativeBrief:{kind,values:C.clone(values),...extra}}};}
  function importBriefs(state,preview,selected,actor){
    checkRevision(state,preview);const rows=previewBriefs(state,preview.brandId,preview.rows),chosen=rows.filter(r=>selected.includes(r.index));if(!chosen.length||chosen.some(r=>r.errors.length))throw Error('Select valid, matched briefs only.');
    const batch={id:C.id('import'),kind:'briefs',brandId:preview.brandId,fileName:preview.fileName,fileHash:preview.fileHash||'',actor,at:C.now(),rowCount:rows.length,imported:chosen.length,skipped:rows.length-chosen.length,contentIds:[]};
    for(const row of chosen){const p=state.posts.find(p=>p.id===row.contentId&&p.brandId===preview.brandId);C.saveBrief(p,briefFields(row.kind,row.values,{importBatchId:batch.id,researchCitations:C.clone(p.researchCitations||[])}),actor);C.event(p,'Creative brief attached',row.kind+' · '+batch.fileName+' · '+row.sheet+' row '+row.line+'. Suggested owner and status retained as source metadata.',actor);batch.contentIds.push(p.id);}
    (state.importBatches??=[]).push(batch);return batch;
  }
  function editBrief(p,values,actor){
    const original=p.brief.creativeBrief;if(!original)throw Error('There is no attached creative brief.');
    for(const k of ['Content ID','Brand','Channel','Timezone','Publish date/time'])if(values[k]!==original.values[k])throw Error('Edit planning identity and timing through the calendar.');
    const errors=briefErrors({kind:original.kind,values});if(errors.length)throw Error(errors.join(' '));
    return C.saveBrief(p,briefFields(original.kind,values,{importBatchId:original.importBatchId,researchCitations:C.clone(original.researchCitations||[])}),actor);
  }
  function validate(state){
    const ids=new Set();for(const b of state.importBatches||[]){if(!b.id||ids.has(b.id)||!state.brands.some(x=>x.id===b.brandId)||!['calendar','briefs'].includes(b.kind)||!Array.isArray(b.contentIds)||!Number.isInteger(b.imported))throw Error('Invalid import batch.');ids.add(b.id);}
    const external=new Set();for(const p of state.posts){if(p.externalId){const k=p.brandId+'::'+p.externalId.toLowerCase();if(external.has(k))throw Error('Duplicate external content ID in account.');external.add(k);}const b=p.brief.creativeBrief;if(b&&(!kinds[b.kind]||!b.values||Object.values(b.values).some(v=>typeof v!=='string')))throw Error('Invalid attached creative brief.');}return state;
  }
  const api={norm,fields,aliases,common,kinds,required,safeURL,parseCSV,autoMap,dateTime,timezoneOK,people,personName,previewCalendar,importCalendar,briefErrors,previewBriefs,briefFields,importBriefs,editBrief,validate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;root.JMLBulkDomain=api;
})(typeof window!=='undefined'?window:globalThis);
