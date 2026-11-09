export function validateMark(value,max) {
  const raw=String(value??'').trim();
  if(raw==='') return {status:'EMPTY',value:null};
  if(raw==='T') return {status:'VALID',value:'T'};
  if(!/^\d+$/.test(raw)) return {status:'INVALID_FORMAT',reason:'Gunakan integer atau huruf besar T.'};
  const n=Number(raw); if(!Number.isSafeInteger(n)||n<0||n>max) return {status:'OUT_OF_RANGE',reason:`Markah mesti antara 0 hingga ${max}.`};
  return {status:'VALID',value:String(n)};
}
export function validateHeaders(headers,required) {
  const normalized=headers.map(h=>String(h??'').trim().toLowerCase());
  const missing=required.filter(h=>!normalized.includes(h.toLowerCase()));
  const duplicates=[...new Set(normalized.filter((h,i)=>normalized.indexOf(h)!==i && h))];
  const empty=headers.map((h,i)=>!String(h??'').trim()?i+1:null).filter(Boolean);
  return {ok:missing.length===0&&duplicates.length===0&&empty.length===0,missing,duplicates,empty,unexpected:headers.filter(h=>!required.some(r=>r.toLowerCase()===String(h).trim().toLowerCase()))};
}
export function findDuplicateIds(rows) {
  const seen=new Set(),dupes=new Set(); for(const row of rows){const id=String(row['Student ID']??'').trim();if(!id)continue;if(seen.has(id))dupes.add(id);seen.add(id);}return [...dupes];
}
