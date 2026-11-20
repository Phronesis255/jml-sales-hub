/* Offline, uncompressed ZIP archives. The manifest binds each ordered export to its bytes. */
(function(root){
  'use strict';
  const encoder=new TextEncoder();
  const table=Array.from({length:256},(_,i)=>{for(let n=0;n<8;n++)i=(i&1)?0xedb88320^(i>>>1):i>>>1;return i>>>0;});
  function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
  function join(chunks){const bytes=new Uint8Array(chunks.reduce((n,c)=>n+c.length,0));let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}return bytes;}
  function header(size,values){const bytes=new Uint8Array(size),v=new DataView(bytes.buffer);for(const [offset,value,width] of values)width===2?v.setUint16(offset,value,true):v.setUint32(offset,value,true);return bytes;}
  function zip(files){
    const local=[],central=[];let offset=0;
    if(files.length>65535)throw Error('Too many release files.');
    for(const f of files){
      if(!f.name||f.name.startsWith('/')||f.name.includes('..')||f.name.includes('\\'))throw Error('Invalid archive filename.');
      const name=encoder.encode(f.name),bytes=f.bytes instanceof Uint8Array?f.bytes:encoder.encode(f.bytes),crc=crc32(bytes);
      const h=header(30,[[0,0x04034b50],[4,20,2],[6,0x800,2],[8,0,2],[12,33,2],[14,crc],[18,bytes.length],[22,bytes.length],[26,name.length,2]]);
      local.push(h,name,bytes);
      central.push(header(46,[[0,0x02014b50],[4,20,2],[6,20,2],[8,0x800,2],[14,33,2],[16,crc],[20,bytes.length],[24,bytes.length],[28,name.length,2],[42,offset]]),name);
      offset+=h.length+name.length+bytes.length;
      if(offset>0xffffffff)throw Error('Release package is too large for a local ZIP.');
    }
    const directory=join(central),end=header(22,[[0,0x06054b50],[8,files.length,2],[10,files.length,2],[12,directory.length],[16,offset]]);
    return new Blob([...local,directory,end],{type:'application/zip'});
  }
  async function sha256(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');}
  function filename(asset,index){return 'assets/'+String(index+1).padStart(3,'0')+'-'+String(asset.name||'asset').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/\.{2,}/g,'_').slice(0,160);}
  async function prepare(handoff,resolveAsset=url=>url,fetchAsset=fetch){
    if(!handoff?.assets||!handoff.decisionId)throw Error('Prepare an approved handoff first.');
    const files=[],entries=[];
    for(let index=0;index<handoff.assets.length;index++){
      const a=handoff.assets[index],url=resolveAsset(a.url);
      if(!url)throw Error('Restore the missing approved file '+a.name+'.');
      const response=await fetchAsset(url);if(!response.ok)throw Error('Cannot read approved file '+a.name+'. Restore it before exporting.');
      const bytes=new Uint8Array(await response.arrayBuffer()),name=filename(a,index);
      files.push({index,name,bytes:bytes.length,sha256:await sha256(bytes),type:a.type,alt:a.alt||''});entries.push({name,bytes});
    }
    return {files,entries,handoffId:handoff.id};
  }
  function bundle(manifest,prepared){
    if(manifest.handoff?.id!==prepared.handoffId)throw Error('The prepared files belong to another handoff.');
    const publicManifest=JSON.parse(JSON.stringify(manifest));
    // The archive already contains the assets; omit duplicate data URLs from its index.
    for(const source of [publicManifest.handoff,publicManifest.placement?.handoff,publicManifest.version])if(source?.assets)source.assets=source.assets.map((a,i)=>({...a,url:prepared.files[i]?.name||''}));
    return zip([...prepared.entries,{name:'caption.txt',bytes:manifest.handoff.caption},{name:'manifest.json',bytes:JSON.stringify(publicManifest,null,2)},
      {name:'README.txt',bytes:'Approved release package\nUse assets in their numbered order and the exact caption.txt text.\nmanifest.json records the creative decision, destination, schedule, receipt and SHA-256 file digests.\nAny caption or asset edit needs a new creative version and approval.\nThis local export does not publish to a social network.\n'}]);
  }
  const api={crc32,zip,sha256,prepare,bundle};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.JMLReleaseFiles=api;
})(typeof window==='undefined'?globalThis:window);
