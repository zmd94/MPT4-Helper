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


// Validate every mark cell in the imported worksheet before activation.
// Blank marks are allowed; only integer marks within the component maximum
// or the uppercase letter T are accepted.
export function validateMarkRows(rows, components) {
  const errors = [];
  let checked = 0;
  for (const row of rows) {
    const rowNumber = Number(row.__row || 0);
    const studentId = String(row['Student ID'] ?? '').trim();
    const studentName = String(row['Student Name'] ?? '').trim();
    const hasAnyMark = components.some(([label]) => String(row[label] ?? '').trim() !== '');
    if (!studentId && !studentName && !hasAnyMark) continue;
    for (const [label, max] of components) {
      const raw = String(row[label] ?? '').trim();
      const result = validateMark(raw, max);
      checked++;
      if (result.status === 'INVALID_FORMAT') {
        errors.push({row: rowNumber, studentId, studentName, component: label, value: raw,
          message: `Hanya nombor bulat 0 hingga ${max} atau huruf besar T dibenarkan.`});
      } else if (result.status === 'OUT_OF_RANGE') {
        errors.push({row: rowNumber, studentId, studentName, component: label, value: raw,
          message: `Markah ${raw} melebihi had atau di luar julat 0 hingga ${max}.`});
      }
    }
  }
  return {ok: errors.length === 0, errors, checked};
}
