export function parseCSV(text) {
  const rows=[]; let row=[], cell='', quoted=false;
  for(let i=0;i<text.length;i++) { const c=text[i];
    if(quoted) { if(c==='"' && text[i+1]==='"'){cell+='"';i++;} else if(c==='"') quoted=false; else cell+=c; }
    else if(c==='"') quoted=true;
    else if(c===','){row.push(cell);cell='';}
    else if(c==='\n'){row.push(cell.replace(/\r$/,'')); if(row.some(v=>v!=='')) rows.push(row); row=[];cell='';}
    else cell+=c;
  }
  row.push(cell.replace(/\r$/,'')); if(row.some(v=>v!=='')) rows.push(row);
  if(quoted) throw new Error('CSV mempunyai tanda petik yang tidak lengkap.');
  return rows;
}
export function rowsToObjects(rows) {
  if(rows.length<2) throw new Error('Fail perlu mempunyai header dan sekurang-kurangnya satu baris data.');
  const headers=rows[0].map(v=>String(v??'').trim());
  return rows.slice(1).map((r,i)=>({__row:i+2, ...Object.fromEntries(headers.map((h,j)=>[h, String(r[j]??'').trim()]))}));
}
