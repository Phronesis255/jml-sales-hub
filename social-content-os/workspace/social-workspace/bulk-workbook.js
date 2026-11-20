/* Bounded, offline OOXML reader. No formulas, macros, network or embedded files. */
(function(root){
  'use strict';
  const D=root.JMLBulkDomain;
  const elements=(el,tag)=>Array.from(el.getElementsByTagNameNS('*',tag));
  function xmlDoc(str){if(/<!doctype|<!entity/i.test(str))throw Error('Unsupported XML declarations.');const d=new DOMParser().parseFromString(str,'application/xml');if(d.getElementsByTagName('parsererror').length)throw Error('The workbook contains invalid XML.');return d;}
  function crc32(bytes){let c=0xffffffff;for(const byte of bytes){c^=byte;for(let j=0;j<8;j++)c=(c>>>1)^(c&1?0xedb88320:0);}return (c^0xffffffff)>>>0;}
  async function parse(input){
    if(input.byteLength<22||input.byteLength>5000000)throw Error('Use an XLSX workbook smaller than 5 MB.');
    const all=new Uint8Array(input),dv=new DataView(input),dec=new TextDecoder();
    const u=(o,n=4)=>{if(o<0||o+n>all.length)throw Error('Invalid ZIP structure.');return n===4?dv.getUint32(o,true):dv.getUint16(o,true);};
    let end=all.length-22;while(end>=Math.max(0,all.length-65557)&&(u(end)!==0x06054b50||end+22+u(end+20,2)!==all.length))end--;
    if(end<Math.max(0,all.length-65557)||u(end+4,2)||u(end+6,2)||u(end+8,2)!==u(end+10,2))throw Error('Only standard, single-volume XLSX workbooks are supported.');
    const count=u(end+10,2),offset=u(end+16),cdSize=u(end+12);if(count>300||offset+cdSize>end)throw Error('Invalid or oversized XLSX directory.');
    const entries=new Map();let loc=offset,total=0;
    for(let i=0;i<count;i++){
      if(u(loc)!==0x02014b50)throw Error('Invalid workbook entry.');
      const n=u(loc+28,2),x=u(loc+30,2),c=u(loc+32,2),flags=u(loc+8,2),method=u(loc+10,2),size=u(loc+24),compressed=u(loc+20),ptr=u(loc+42),crc=u(loc+16);
      if(loc+46+n+x+c>offset+cdSize||flags&1||![0,8].includes(method))throw Error('Encrypted or unsupported workbook entry.');
      const name=dec.decode(all.slice(loc+46,loc+46+n));loc+=46+n+x+c;total+=size;
      if(size>8000000||total>24000000||compressed>5000000||entries.has(name)||name.includes('..')||name.startsWith('/'))throw Error('The workbook exceeds safe expansion limits or has an invalid path.');
      entries.set(name,{method,size,compressed,ptr,crc});
    }
    if(loc!==offset+cdSize)throw Error('Invalid directory size.');
    if([...entries.keys()].some(k=>/vbaProject|externalLinks|embeddings/i.test(k)))throw Error('Macros, embedded files and external workbook links are unsupported.');
    async function read(name){
      const z=entries.get(name);if(!z)throw Error('Missing workbook part: '+name);
      if(u(z.ptr)!==0x04034b50)throw Error('Invalid workbook data offset.');const from=z.ptr+30+u(z.ptr+26,2)+u(z.ptr+28,2);if(from+z.compressed>offset)throw Error('Invalid workbook data bounds.');
      let out;
      if(z.method===0){if(z.size!==z.compressed)throw Error('Invalid workbook entry size.');out=all.slice(from,from+z.size);}
      else{
        let reader;try{reader=new Blob([all.slice(from,from+z.compressed)]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();}catch{throw Error('This browser cannot read XLSX locally. Open the workspace in current Chrome or Edge.');}
        out=new Uint8Array(z.size);let used=0;while(true){const next=await reader.read();if(next.done)break;if(used+next.value.length>z.size){await reader.cancel();throw Error('Workbook expansion exceeds its declared size.');}out.set(next.value,used);used+=next.value.length;}if(used!==z.size)throw Error('Workbook entry length mismatch.');
      }
      if(crc32(out)!==z.crc)throw Error('Workbook checksum mismatch. The file may be damaged.');return dec.decode(out);
    }
    const w=xmlDoc(await read('xl/workbook.xml')),rel=xmlDoc(await read('xl/_rels/workbook.xml.rels'));
    const rels=new Map(elements(rel,'Relationship').filter(x=>x.getAttribute('TargetMode')!=='External').map(x=>[x.getAttribute('Id'),x.getAttribute('Target')]));
    const strings=entries.has('xl/sharedStrings.xml')?elements(xmlDoc(await read('xl/sharedStrings.xml')),'si').map(el=>elements(el,'t').map(x=>x.textContent).join('')):[];
    const mode1904=elements(w,'workbookPr').some(x=>['1','true'].includes(x.getAttribute('date1904'))),results=[];
    for(const el of elements(w,'sheet')){
      const name=el.getAttribute('name'),kind=Object.keys(D.kinds).find(x=>D.norm(name)===D.norm(x+' Briefs'));if(!kind)continue;
      const relId=el.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||el.getAttribute('r:id');let path=rels.get(relId);if(!path)throw Error('Missing local worksheet mapping.');path=path.startsWith('/')?path.slice(1):'xl/'+path.replace(/^\.\//,'');if(!/^xl\/worksheets\/[A-Za-z0-9_-]+\.xml$/.test(path))throw Error('Unsupported worksheet path.');
      const rows=elements(xmlDoc(await read(path)),'row').map(r=>{
        const cells={};let formula=false;for(const c of elements(r,'c')){const coord=c.getAttribute('r')?.match(/^([A-Z]+)[0-9]+$/)?.[1];if(!coord)continue;if(elements(c,'f').length)formula=true;
          const type=c.getAttribute('t'),v=elements(c,'v')[0]?.textContent;cells[coord]=type==='s'?(strings[Number(v)]??''):type==='inlineStr'?elements(c,'t').map(x=>x.textContent).join(''):(v??'');}
        return {line:Number(r.getAttribute('r')),cells,formula};
      });
      const header=rows.find(r=>Object.values(r.cells).some(c=>D.norm(c)==='contentid'));if(!header)throw Error('Missing Content ID header in '+name+'.');
      const map={};for(const [col,raw] of Object.entries(header.cells)){if(!raw.trim())continue;const known=[...D.required(kind),'Reference URL'].find(k=>D.norm(k)===D.norm(raw));const label=known||raw.replace(/\*+$/,'').trim();if(Object.hasOwn(map,label))throw Error('Duplicate column in '+name+': '+label);map[label]=col;}
      for(const field of D.required(kind))if(!map[field])throw Error(name+' is missing '+field+'.');
      for(const row of rows.filter(r=>r.line>header.line&&Object.values(r.cells).some(v=>String(v).trim()))){
        if(results.length>=500)throw Error('Use at most 500 briefs per workbook.');
        const values=Object.fromEntries(Object.entries(map).map(([label,letter])=>[label,String(row.cells[letter]??'').trim()]));
        for(const field of ['Draft due (PT)','Publish date/time'])if(/^\d{4,6}(?:\.\d+)?$/.test(values[field]??'')){
          const n=new Date((mode1904?Date.UTC(1904,0,1):Date.UTC(1899,11,30))+Math.round(Number(values[field])*86400)*1000);values[field]=n.toISOString().slice(0,field==='Draft due (PT)'?10:16).replace('T',' ');
        }
        results.push({sheet:name,line:row.line,kind,values,formula:row.formula});
      }
    }
    if(!results.length)throw Error('No briefs found. Use worksheets named Video Briefs and/or Graphic Briefs.');return results;
  }
  root.JMLBulkWorkbook={parse,crc32};if(typeof module!=='undefined'&&module.exports)module.exports=root.JMLBulkWorkbook;
})(typeof window!=='undefined'?window:globalThis);
