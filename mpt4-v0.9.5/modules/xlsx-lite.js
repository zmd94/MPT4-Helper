// Minimal local XLSX reader: ZIP central directory + DEFLATE + worksheet XML.
// Supports ordinary .xlsx files; legacy .xls is intentionally not supported.
const decoder = new TextDecoder();
async function inflateRaw(bytes) {
  if (!('DecompressionStream' in globalThis)) throw new Error('Pelayar ini tidak menyokong pembacaan XLSX. Gunakan Chrome terkini.');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function unzip(buffer) {
  const data=new Uint8Array(buffer), view=new DataView(buffer), files=new Map();
  let eocd=-1;
  for(let i=data.length-22;i>=Math.max(0,data.length-65558);i--) if(view.getUint32(i,true)===0x06054b50){eocd=i;break;}
  if(eocd<0) throw new Error('Fail XLSX bukan ZIP yang sah.');
  const count=view.getUint16(eocd+10,true), cdOffset=view.getUint32(eocd+16,true); let p=cdOffset;
  for(let n=0;n<count;n++) {
    if(view.getUint32(p,true)!==0x02014b50) throw new Error('Struktur ZIP XLSX tidak sah.');
    const method=view.getUint16(p+10,true), csize=view.getUint32(p+20,true), nlen=view.getUint16(p+28,true), elen=view.getUint16(p+30,true), clen=view.getUint16(p+32,true), lhoff=view.getUint32(p+42,true);
    const name=decoder.decode(data.slice(p+46,p+46+nlen));
    const ln=view.getUint16(lhoff+26,true), le=view.getUint16(lhoff+28,true), start=lhoff+30+ln+le;
    const compressed=data.slice(start,start+csize); let content;
    if(method===0) content=compressed; else if(method===8) content=await inflateRaw(compressed); else throw new Error('Kaedah mampatan XLSX tidak disokong.');
    files.set(name,decoder.decode(content)); p+=46+nlen+elen+clen;
  }
  return files;
}
const xml = s => new DOMParser().parseFromString(s,'application/xml');
const colIndex = ref => {let m=ref.match(/[A-Z]+/i)[0].toUpperCase(),n=0;for(const c of m)n=n*26+c.charCodeAt(0)-64;return n-1;};
export async function readXLSX(file) {
  const files=await unzip(await file.arrayBuffer());
  const wb=xml(files.get('xl/workbook.xml')||'');
  const rel=xml(files.get('xl/_rels/workbook.xml.rels')||'');
  const rels=new Map([...rel.getElementsByTagName('Relationship')].map(x=>[x.getAttribute('Id'),x.getAttribute('Target')]));
  const sheets=[...wb.getElementsByTagName('sheet')].map(s=>({name:s.getAttribute('name'),target:rels.get(s.getAttribute('r:id'))}));
  if(!sheets.length) throw new Error('Tiada worksheet ditemui dalam XLSX.');
  const sharedXml=files.get('xl/sharedStrings.xml');
  const shared=sharedXml?[...xml(sharedXml).getElementsByTagName('si')].map(si=>[...si.getElementsByTagName('t')].map(t=>t.textContent).join('')):[];
  const result={};
  for(const sh of sheets) {
    let target=sh.target.replace(/^\//,''); if(!target.startsWith('xl/')) target='xl/'+target.replace(/^\.\//,'');
    const sx=files.get(target); if(!sx) continue;
    const doc=xml(sx), rows=[];
    for(const r of doc.getElementsByTagName('row')) {
      const cells=[];
      for(const c of r.children) if(c.tagName==='c') {
        const idx=colIndex(c.getAttribute('r')); let v=c.getElementsByTagName('v')[0]?.textContent??'';
        if(c.getAttribute('t')==='s') v=shared[Number(v)]??'';
        else if(c.getAttribute('t')==='inlineStr') v=[...c.getElementsByTagName('t')].map(t=>t.textContent).join('');
        cells[idx]=v;
      }
      rows.push(cells.map(v=>v??''));
    }
    result[sh.name]=rows;
  }
  return {sheetNames:Object.keys(result), sheets:result};
}
