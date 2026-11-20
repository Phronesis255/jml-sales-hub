/* A portable backup has a fixed header, a JSON manifest, then each referenced media file once. */
window.JMLMemory=(()=>{
  'use strict';
  const magic='JMLPACK2\n', encoder=new TextEncoder(), restored=new WeakMap();
  const maxManifest=200*1024*1024;
  const mediaTypes=/^(image\/(png|jpeg|webp|gif)|video\/(mp4|webm))$/;
  function libraryPaths(state){
    return new Set(state.posts.flatMap(post=>post.versions.flatMap(v=>v.assets.map(a=>a.url))).filter(path=>!path.startsWith('data:')));
  }
  function save(blob,name){
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  async function exportPortable(state,progress){
    const files=[],entries=[],paths=libraryPaths(state);
    for(const path of paths){
      progress(entries.length+1,paths.size);
      if(!JMLCore.safeMedia(path))throw Error('Unsupported library path: '+path);
      const resolved=JMLStorage.mediaURL(path);
      const response=await fetch(resolved,{credentials:'same-origin'});
      if(!response.ok)throw Error('Missing library file: '+path);
      const blob=await response.blob();
      const type=blob.type.split(';')[0];
      if(!mediaTypes.test(type))throw Error('Unexpected media type for '+path);
      entries.push({path,type,length:blob.size,sha256:await JMLStorage.digest(blob)});
      files.push(blob);
    }
    const manifest=encoder.encode(JSON.stringify({format:2,workspace:state,files:entries}));
    if(manifest.length>maxManifest)throw Error('The JSON memory exceeds the portable manifest limit.');
    const length=new Uint8Array(4);new DataView(length.buffer).setUint32(0,manifest.length);
    save(new Blob([magic,length,manifest,...files]),'JML-social-workspace.jmlpack');
  }
  async function readBackup(file){
    if(!file)throw Error('Choose a JSON or portable workspace file.');
    if(await file.slice(0,magic.length).text()!==magic){
      if(file.size>maxManifest)throw Error('The JSON backup exceeds the import limit.');
      return JSON.parse(await file.text());
    }
    const prefix=magic.length+4;
    const n=new DataView(await file.slice(magic.length,prefix).arrayBuffer()).getUint32(0);
    if(n>maxManifest||prefix+n>file.size)throw Error('Invalid backup manifest size.');
    const pack=JSON.parse(await file.slice(prefix,prefix+n).text());
    if(pack.format!==2||!Array.isArray(pack.files))throw Error('Unknown portable backup format.');
    JMLCore.validate(pack.workspace);
    const required=libraryPaths(pack.workspace),found=new Map();let offset=prefix+n;
    for(const entry of pack.files){
      if(!required.has(entry.path)||found.has(entry.path)||!mediaTypes.test(entry.type)||!Number.isSafeInteger(entry.length)||entry.length<0||offset+entry.length>file.size)throw Error('Invalid portable media entry.');
      const blob=file.slice(offset,offset+entry.length,entry.type);offset+=entry.length;
      if(await JMLStorage.digest(blob)!==entry.sha256)throw Error('Media checksum failed: '+entry.path);
      found.set(entry.path,blob);
    }
    if(required.size!==found.size||offset!==file.size)throw Error('Incomplete portable backup.');
    restored.set(pack.workspace,found);return pack.workspace;
  }
  async function checkLibrary(state){
    const packed=restored.get(state);
    if(packed)return {library:packed,missing:[],description:packed.size+' bundled files verified.'};
    const paths=libraryPaths(state);
    const library=await JMLStorage.retainLibrary(paths);
    const check=[...paths].filter(p=>!library.has(p)),missing=[];
    let index=0;
    async function worker(){
      while(index<check.length){
        const path=check[index++];
        try{
          const response=await fetch(path,{method:'HEAD',credentials:'same-origin'});
          if(!response.ok||!mediaTypes.test((response.headers.get('Content-Type')||'').split(';')[0]))missing.push(path);
        }catch{missing.push(path);}
      }
    }
    await Promise.all(Array.from({length:Math.min(6,check.length)},worker));
    const description=missing.length?'Missing library files ('+missing.length+'). '+missing.slice(0,3).join(', ')+(missing.length>3?'…':''):paths.size+' library files available.';
    return {library,missing,description};
  }
  return {exportPortable,readBackup,checkLibrary,restoredFiles:state=>restored.get(state)};
})();
