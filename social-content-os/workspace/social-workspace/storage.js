/* Workspace records, uploaded binaries and restored library files share one IDB transaction. */
window.JMLStorage = (() => {
  'use strict';
  let db;
  const archivedURLs=new Map();
  const fileIndex=new Map();
  const uploadPrefix='jml-upload:';
  const readRequest=req=>new Promise((resolve,reject)=>{
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
  function open(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open('jml-published-workspace:jml-social-workspace-v1',2);
      req.onupgradeneeded=()=>{
        for(const name of ['documents','uploads','library']){
          if(!req.result.objectStoreNames.contains(name))req.result.createObjectStore(name);
        }
      };
      req.onsuccess=()=>{db=req.result;db.onversionchange=()=>db.close();resolve();};
      req.onblocked=()=>reject(Error('Close other tabs with the old workspace open, then reload.'));
      req.onerror=()=>reject(Error('Browser storage is unavailable. Open a regular browser window with local storage enabled.'));
    });
  }
  function dataURL(blob){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(Error('Could not read saved media.'));reader.readAsDataURL(blob);
    });
  }
  function fileSlots(doc){
    return (doc?.posts||[]).flatMap(post=>post.versions.flatMap(version=>version.assets));
  }
  function setLibrary(blobs){
    for(const value of archivedURLs.values())URL.revokeObjectURL(value);
    archivedURLs.clear();
    for(const [path,blob] of blobs)archivedURLs.set(path,URL.createObjectURL(blob));
  }
  async function read(){
    const tx=db.transaction(['documents','library','uploads'],'readonly');
    const store=tx.objectStore('library');
    const uploadStore=tx.objectStore('uploads');
    const [doc,paths,files,uploadKeys,uploadFiles]=await Promise.all([readRequest(tx.objectStore('documents').get('workspace')),readRequest(store.getAllKeys()),readRequest(store.getAll()),readRequest(uploadStore.getAllKeys()),readRequest(uploadStore.getAll())]);
    setLibrary(paths.map((key,i)=>[key,files[i]]));
    fileIndex.clear();
    if(!doc)return null;
    const uploads=new Map(uploadKeys.map((key,i)=>[key,uploadFiles[i]]));
    const refs=new Set(fileSlots(doc).filter(a=>a.url?.startsWith(uploadPrefix)).map(a=>a.url));
    const resolved=new Map();
    await Promise.all([...refs].map(async key=>{
      const blob=uploads.get(key);
      if(!blob)throw Error('A saved upload is missing. Restore a workspace backup to recover it.');
      const url=await dataURL(blob);resolved.set(key,url);fileIndex.set(url,key);
    }));
    for(const asset of fileSlots(doc))if(resolved.has(asset.url))asset.url=resolved.get(asset.url);
    return doc;
  }
  async function digest(blob){
    const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
    return [...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');
  }
  async function write(data,expected,library){
    const doc=structuredClone(data),newFiles=new Map(),used=new Map();
    for(const asset of fileSlots(doc)){
      if(!asset.url.startsWith('data:'))continue;
      const url=asset.url;
      let key=used.get(url)||fileIndex.get(url);
      if(!key){
        const blob=await (await fetch(url)).blob();
        key=uploadPrefix+await digest(blob);newFiles.set(key,blob);
      }
      used.set(url,key);asset.url=key;
    }
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(['documents','uploads','library'],'readwrite');
      const docs=tx.objectStore('documents'), uploads=tx.objectStore('uploads');
      const req=docs.get('workspace');let conflict=false;
      req.onsuccess=()=>{
        if((expected===null&&req.result)||(expected!==null&&req.result?.revision!==expected)){conflict=true;tx.abort();return;}
        docs.put(doc,'workspace');
        for(const [key,blob] of newFiles)uploads.put(blob,key);
        const retained=new Set(used.values());
        const cursor=uploads.openKeyCursor();
        cursor.onsuccess=()=>{const k=cursor.result;if(k){if(!retained.has(k.key))uploads.delete(k.key);k.continue();}};
        if(library){const store=tx.objectStore('library');store.clear();for(const [path,blob] of library)store.put(blob,path);}
      };
      tx.oncomplete=resolve;
      tx.onabort=()=>reject(Error(conflict?'Another tab saved this workspace. Reload to use its changes. Your working brief is available on this tab.':'Save failed. Check available browser storage. The previous workspace is intact.'));
      tx.onerror=()=>{};
    });
    fileIndex.clear();for(const [url,key] of used)fileIndex.set(url,key);
    if(library)setLibrary(library);
  }
  async function retainLibrary(paths){
    const store=db.transaction('library').objectStore('library');
    const matches=[...paths].filter(path=>archivedURLs.has(path));
    return new Map(await Promise.all(matches.map(async path=>[path,await readRequest(store.get(path))])));
  }
  async function preserveBeforeMigration(document){
    if(document.governance)return;
    const snapshot=structuredClone(document);
    await new Promise((resolve,reject)=>{
      const tx=db.transaction('documents','readwrite'),store=tx.objectStore('documents'),request=store.get('pre-governance-v1');
      request.onsuccess=()=>{if(!request.result)store.put({savedAt:new Date().toISOString(),document:snapshot},'pre-governance-v1');};
      tx.oncomplete=resolve;tx.onabort=()=>reject(Error('Could not preserve the original workspace before migration. No migration was applied.'));tx.onerror=()=>{};
    });
  }
  async function migrationBackup(){return (await readRequest(db.transaction('documents').objectStore('documents').get('pre-governance-v1')))?.document||null;}
  return {open,read,write,digest,retainLibrary,preserveBeforeMigration,migrationBackup,mediaURL:path=>archivedURLs.get(path)||path};
})();
