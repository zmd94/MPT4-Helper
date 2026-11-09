import { parseCSV, rowsToObjects } from './modules/csv.js';
import { readXLSX } from './modules/xlsx-lite.js';
import { PROFILES, headersFor } from './modules/profiles.js';
import { validateMarkRows } from './modules/validation.js';
const $=id=>document.getElementById(id); let imported=null, selectedRows=null;
function status(s){$('status').textContent=s;}

async function downloadSample(path, filename){
 try{
  await chrome.downloads.download({url:chrome.runtime.getURL(path),filename,saveAs:true});
  status('Muat turun template dimulakan: '+filename);
 }catch(err){status('Tidak dapat memuat turun template: '+err.message);}
}
$('downloadXlsx').addEventListener('click',()=>{
 const code=$('subject').value;
 if(!code){status('Pilih mata pelajaran dahulu untuk memuat turun template khusus.');return;}
 downloadSample(`samples/template_${code}.xlsx`,`MPT4-Template-${code}.xlsx`);
});


function updateSubjectUI(){
  $('samplesSection').hidden = !$('subject').value;
  validateReady();
}
$('subject').addEventListener('change',updateSubjectUI);

function googleSheetExportUrl(raw){
  const u=new URL(raw);
  if(u.protocol!=='https:' || u.hostname!=='docs.google.com' || !/^\/spreadsheets\/d\/[^/]+/.test(u.pathname))
    throw new Error('URL Google Sheets tidak sah. Gunakan pautan https://docs.google.com/spreadsheets/d/…');
  const match=u.pathname.match(/^\/spreadsheets\/d\/([^/]+)/);
  if(!match?.[1]) throw new Error('ID spreadsheet tidak ditemui.');
  // Export tanpa gid meminta Google Sheets worksheet pertama secara automatik.
  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
}
async function readGoogleSheet(raw){
  const exportUrl=googleSheetExportUrl(raw);
  status('Sedang membaca worksheet pertama Google Sheets…');
  const result=await chrome.runtime.sendMessage({type:'MPT4_FETCH_SHEET',url:exportUrl});
  if(!result?.ok) throw new Error(result?.error||'Gagal membaca Google Sheets.');
  const rows=parseCSV(result.csv);
  if(!rows.length) throw new Error('Google Sheets tidak mengandungi data.');
  return {fileName:'Google Sheets',sheets:{'Worksheet pertama':rows}};
}
$('sheetUrl').addEventListener('input',()=>{
  if($('sheetUrl').value.trim()){
    $('file').value=''; imported=null; selectedRows=null;
  }
  validateReady();
});
$('file').addEventListener('change',async e=>{
  const file=e.target.files[0]; imported=null; selectedRows=null; if(file) $('sheetUrl').value=''; $('activate').disabled=true;
  if(!file)return;
  try {
    let sheets;
    if(file.name.toLowerCase().endsWith('.csv')) sheets={'CSV':parseCSV(await file.text())};
    else if(file.name.toLowerCase().endsWith('.xlsx')) sheets=(await readXLSX(file)).sheets;
    else throw new Error('Format tidak disokong. Gunakan .xlsx atau .csv.');
    const names=Object.keys(sheets); if(!names.length) throw new Error('Tiada worksheet boleh dibaca.');
    const firstName=names[0];
    imported={fileName:file.name,sheets:{[firstName]:sheets[firstName]}}; validateReady();
  } catch(err){status('Ralat: '+err.message);}
});

function validateAllMarks(rows, code){
  const components = PROFILES[code]?.components || [];
  const result = validateMarkRows(rows, components);
  if(!result.ok){
    const lines = result.errors.slice(0,8).map(e =>
      `Baris ${e.row} · ${e.studentName || e.studentId || 'Murid tidak dikenal'} · ${e.component}: "${e.value}" — ${e.message}`
    );
    const more = result.errors.length > 8 ? `\nDan ${result.errors.length-8} kesalahan lain.` : '';
    throw new Error(`PENGESAHAN MARKAH GAGAL: ${result.errors.length} kesalahan ditemui.\n${lines.join('\n')}${more}\nBetulkan fail sumber sebelum meneruskan. Autofill dikunci.`);
  }
  return result;
}

function validateImportedRows(rawRows, code){
  const headers=(rawRows[0]||[]).map(v=>String(v??'').trim());
  const normalized=headers.map(h=>h.toLowerCase().replace(/\s+/g,' ').trim());
  const required=headersFor(code);
  const missing=required.filter(h=>!normalized.includes(h.toLowerCase()));
  const dup=normalized.filter((h,i)=>h && normalized.indexOf(h)!==i);
  if(dup.length) throw new Error(`Header pendua dikesan: ${[...new Set(dup)].join(', ')}`);
  if(missing.length) throw new Error(`Header belum lengkap: ${missing.join(', ')}`);
  return rowsToObjects(rawRows);
}
function validateReady(){
 const code=$('subject').value;
 const hasSheetUrl=$('sheetUrl').value.trim().length>0;
 const sourceAvailable=hasSheetUrl || !!imported;
 if(!code || !sourceAvailable){$('activate').disabled=true;return;}
 if(hasSheetUrl){
   try{googleSheetExportUrl($('sheetUrl').value.trim());$('activate').disabled=false;status('URL Google Sheets sah. Worksheet pertama akan dibaca apabila AKTIFKAN ditekan.');}
   catch(err){$('activate').disabled=true;status(err.message);}
   return;
 }
 try{
   const name=Object.keys(imported?.sheets||{})[0];
   const rawRows=imported.sheets[name];
   const rows=validateImportedRows(rawRows,code);
   const markCheck=validateAllMarks(rows,code);
   selectedRows=rows;
   $('activate').disabled=false;
   status(`${rows.length} baris dibaca · ${PROFILES[code].name}. Semua markah sah (${markCheck.checked} sel diperiksa).`);
 }catch(err){$('activate').disabled=true;status(err.message);}
}
$('activate').addEventListener('click',async()=>{
 $('activate').disabled=true;
 try{
  const code=$('subject').value;
  if(!code) throw new Error('Pilih mata pelajaran terlebih dahulu.');
  const sheetUrl=$('sheetUrl').value.trim();
  if(sheetUrl){
    imported=await readGoogleSheet(sheetUrl);
    const sheetRows=validateImportedRows(imported.sheets['Worksheet pertama'],code);
    const markCheck=validateAllMarks(sheetRows,code);
  }
  if(!imported) throw new Error('Pilih fail Excel/CSV atau masukkan URL Google Sheets yang sah.');
  const sheetName=Object.keys(imported.sheets)[0];
  const rows=rowsToObjects(imported.sheets[sheetName]);
  validateAllMarks(rows,code);
  const headers=Object.keys(rows[0]||{}).filter(h=>h!=='__row');
  const headerMap=new Map(headers.map(h=>[h.toLowerCase().replace(/\s+/g,' ').trim(),h]));
  const canonicalRows=rows.map(row=>{
    const normalized={__row:row.__row};
    for(const [canonical] of headersFor(code).map(h=>[h])){
      const actual=headerMap.get(canonical.toLowerCase());
      if(actual) normalized[canonical]=row[actual]??'';
    }
    return normalized;
  });
  const session={subjectCode:code,subjectName:PROFILES[code].name,provisional:!!PROFILES[code].provisional,sourceName:imported.fileName,worksheet:sheetName,rows:canonicalRows,createdAt:Date.now()};
  await chrome.storage.session.set({mpt4Session:session});
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab?.id || !tab.url)throw new Error('Tab aktif tidak ditemui.');
  const activeUrl = new URL(tab.url);
  if (activeUrl.origin !== 'https://mpt4-sbppa.moe.gov.my' || activeUrl.pathname !== '/marks/marks-entry') {
    throw new Error('Sila buka halaman pengisian markah SBPPA dan pastikan anda telah log masuk: https://mpt4-sbppa.moe.gov.my/marks/marks-entry');
  }
  await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});
  await chrome.tabs.sendMessage(tab.id,{type:'MPT4_ACTIVATE',session});
  status('MPT4 Helper diaktifkan. Panel terapung telah dibuka. Tetingkap tetapan ditutup secara automatik.');
  window.close();
 }catch(err){
  $('activate').disabled=false;
  status('Tidak dapat mengaktifkan: '+err.message);
 }
});

updateSubjectUI();
