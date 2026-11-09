(() => {
  if (window.__MPT4_HELPER_LOADED__) return;
  window.__MPT4_HELPER_LOADED__ = true;
  chrome.runtime.onMessage.addListener(message => { if(message?.type==='MPT4_ACTIVATE') activate(message.session); });
  async function activate(s){
    if(!s){alert('MPT4 Helper: Data sesi tidak diterima. Sila import semula fail dan aktifkan semula.');return;}
    if(document.getElementById('mpt4-helper-host')) return;
    const host=document.createElement('div');host.id='mpt4-helper-host';host.style.cssText='all:initial;position:fixed;z-index:2147483647;right:18px;top:80px;';document.documentElement.appendChild(host);
    const root=host.attachShadow({mode:'open'});
    root.innerHTML=`<style>
      @font-face{font-family:Inter;src:url("${chrome.runtime.getURL('assets/fonts/Inter-Regular.otf')}") format("opentype");font-style:normal;font-weight:400;font-display:swap}
      @font-face{font-family:Inter;src:url("${chrome.runtime.getURL('assets/fonts/Inter-Medium.otf')}") format("opentype");font-style:normal;font-weight:500;font-display:swap}
      @font-face{font-family:Inter;src:url("${chrome.runtime.getURL('assets/fonts/Inter-SemiBold.otf')}") format("opentype");font-style:normal;font-weight:600;font-display:swap}
      @font-face{font-family:Inter;src:url("${chrome.runtime.getURL('assets/fonts/Inter-Bold.otf')}") format("opentype");font-style:normal;font-weight:700 900;font-display:swap}
      *{box-sizing:border-box} .panel{width:min(540px,calc(100vw - 36px));max-height:80vh;overflow:auto;background:#fff;color:#172033;border:1px solid #cbd5e1;border-radius:14px;box-shadow:0 14px 48px #0f172a40;font:13px/1.45 Inter,system-ui,sans-serif}
      .head{display:flex;align-items:center;gap:9px;padding:12px 14px;background:#174ea6;color:white;cursor:move;position:sticky;top:0}.logo{font-weight:800;background:#ffffff25;border-radius:7px;padding:6px}.head strong{font-size:15px}.head small{display:block;opacity:.85}.spacer{flex:1}.head button{background:#ffffff20;color:white;border:0;border-radius:6px;padding:5px 9px;cursor:pointer}
      .body{padding:13px}.pill{display:inline-block;border-radius:99px;padding:3px 8px;background:#eaf2ff;color:#174ea6;font-weight:700;font-size:11px}.warning{background:#fff7e6;border:1px solid #f5d48a;padding:10px;border-radius:8px;margin:10px 0;color:#754c00}.info{background:#f1f5f9;padding:9px;border-radius:8px;margin:8px 0;color:#475569}
      .stats{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.stat{background:#f1f5f9;padding:7px 9px;border-radius:8px}.stat b{display:block;font-size:16px}.tablewrap{overflow:auto;max-height:250px;border:1px solid #e2e8f0;border-radius:8px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{padding:7px;border-bottom:1px solid #e2e8f0;text-align:left;white-space:nowrap}th{background:#f8fafc;position:sticky;top:0}.actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}button.action{border:0;border-radius:8px;padding:9px 12px;background:#174ea6;color:white;font-weight:700;cursor:pointer}button.secondary{background:#e2e8f0;color:#172033}button:disabled{opacity:.45;cursor:not-allowed}.log{white-space:pre-wrap;background:#0f172a;color:#dbeafe;border-radius:8px;padding:9px;max-height:100px;overflow:auto;font:11px/1.4 monospace}.collapsed .body{display:none}
    </style><section class="panel"><div class="head"><span class="logo">M4</span><div><strong>MPT4 Helper</strong><small>Pembantu Pengisian Markah</small></div><span class="spacer"></span><button id="min">—</button><button id="close">×</button></div><div class="body">
    <div><span class="pill" id="subject"></span> <span class="pill">DATA SETEMPAT</span></div>
    <div class="warning" id="warning"></div><div class="stats" id="stats"></div>
    <h3>Pratonton data sumber</h3><div class="tablewrap"><table id="preview"></table></div>
    <h3>Pengimbas automatik halaman SBPPA</h3>
    <div class="info" id="detection">Menganalisis struktur halaman…</div>
    <div class="tablewrap" style="max-height:220px"><table id="scanResults"></table></div>
    <div class="info" id="scanSummary">Imbasan hanya membaca struktur halaman. Tiada nilai markah diubah.</div>
    <div class="actions"><button class="action" id="refresh">IMBAS HALAMAN</button><button class="action" id="start" disabled>AUTOFILL SEMUA MURID</button><button class="action secondary" id="cancelFill" disabled>BATAL</button><button class="action secondary" id="clear">Kosongkan sesi</button></div>
    <div class="info" id="sessionStatus">Autofill memproses semua murid dalam fail sumber yang mempunyai padanan IC unik dan komponen disahkan. Hanya medan kosong diisi; markah sedia ada dikekalkan. Tiada SIMPAN automatik.</div>
    <h3>Log aktiviti</h3><div class="log" id="log">Sesi dimulakan. Tiada markah diubah.</div>
    <div class="info">Extension tidak akan menyimpan atau menghantar markah. Semak semua nilai dan tekan SIMPAN secara manual pada laman peperiksaan.</div>
    </div></section>`;
    const $=id=>root.getElementById(id); const profile=({ '041':'Bahasa Melayu','043':'Bahasa Inggeris','045':'Matematik','048':'Sains'})[s.subjectCode];
    $('subject').textContent=`${s.subjectCode} · ${profile}`;
    $('warning').textContent='Pengimbas menggunakan satu TR bagi setiap murid, No. IC sebagai kunci padanan dan bilangan TEXTBOX mengikut profil mata pelajaran. Mod ini masih diagnostik; tiada markah akan diisi.';
    const ids=s.rows.map(r=>String(r['Student ID']??'').trim()).filter(Boolean); const duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i);
    $('stats').innerHTML=`<div class="stat"><b>${s.rows.length}</b>Baris sumber</div><div class="stat"><b>${new Set(ids).size}</b>ID unik</div><div class="stat"><b>${duplicates.length}</b>ID pendua</div>`;
    const headers=Object.keys(s.rows[0]||{}).filter(h=>h!=='__row');
    $('preview').innerHTML='<thead><tr>'+headers.map(h=>`<th>${esc(h)}</th>`).join('')+'</tr></thead><tbody>'+s.rows.slice(0,30).map(r=>'<tr>'+headers.map(h=>`<td>${esc(r[h]??'')}</td>`).join('')+'</tr>').join('')+'</tbody>';
    const log=(msg)=>{$('log').textContent+=`\n${new Date().toLocaleTimeString()} · ${msg}`;$('log').scrollTop=$('log').scrollHeight;};
    let fillCancelled=false, fillRunning=false;
    const normalize = value => String(value || '').toLowerCase().replace(/\s+/g,' ').replace(/\s*-\s*/g,'-').replace(/[：:]/g,'').trim();
    const componentNames = {
      '041':['bahagian a','bahagian b','bahagian c','bahagian d'],
      '043':['part 1','part 2','part 3','part 4','part 5','part 6'],
      '045':['bahagian a (soalan 1-6)','bahagian a (soalan 7)','bahagian a (soalan 8-12)','bahagian a (soalan 13)','bahagian b (soalan 14-15)'],
      '048':['bahagian a','bahagian b','bahagian c']
    };
    function inspect(){
      const expected = componentNames[s.subjectCode] || [];
      const expectedCount = expected.length;
      // Verify the selected SBPPA subject from its dedicated MUI Autocomplete field.
      // Fail closed unless exactly one subject selector is present and its code matches the imported profile.
      const subjectInputs = [...document.querySelectorAll(
        'input[role="combobox"][placeholder="Sila Pilih Mata Pelajaran"]'
      )];
      const selectedSubjectValue = subjectInputs.length === 1
        ? String(subjectInputs[0].value || '').trim()
        : '';
      const selectedSubjectCode = selectedSubjectValue.match(/^(\d{3})\s*-\s*/)?.[1] || '';
      const subjectEvidence = subjectInputs.length === 1 &&
        selectedSubjectCode === String(s.subjectCode || '').trim();
      const tableRows = [...document.querySelectorAll('table tbody tr, table tr')];
      const seen = new Set();
      const studentRecords = [];
      let ignoredRows = 0;
      let duplicatePortalIC = 0;

      const normalizeIC = value => String(value || '').replace(/\D/g, '');
      const sourceIds = new Set(s.rows.map(r => normalizeIC(r['Student ID'] ?? '')).filter(Boolean));
      const portalIds = new Set();

      for (const tr of tableRows) {
        if (seen.has(tr)) continue;
        seen.add(tr);

        // SBPPA DOM: each student is one TR; identity is in a TD with h6 + span.
        const identitySpan = tr.querySelector('td span.MuiTypography-caption, td span');
        const identityCell = identitySpan?.closest('td');
        const ic = normalizeIC(identitySpan?.textContent);
        const name = (identityCell?.querySelector('h6')?.textContent || '').trim();
        const inputs = [...tr.querySelectorAll('input[type="text"]')]
          .filter(el => !el.disabled && !el.readOnly);

        if (!ic || !identityCell || !inputs.length) {
          if (inputs.length) ignoredRows++;
          continue;
        }
        if (portalIds.has(ic)) duplicatePortalIC++;
        portalIds.add(ic);

        // All editable text inputs in this student's TR, excluding identity TD.
        const markInputs = inputs.filter(el => !identityCell.contains(el));

        const countMatches = markInputs.length === expectedCount;
        const sourceMatch = sourceIds.has(ic);
        studentRecords.push({
          ic, name, inputCount: markInputs.length, countMatches, sourceMatch,
          components: markInputs.map((input, index) => {
            const wrapper = input.closest('.MuiFormControl-root');
            const componentBox = wrapper?.parentElement;
            const label = normalize(componentBox?.querySelector('p')?.textContent || '');
            const maxText = wrapper?.querySelector('.MuiInputAdornment-root')?.textContent || '';
            const maxMatch = maxText.match(/\/\s*(\d+)/);
            const detectedMax = maxMatch ? Number(maxMatch[1]) : null;
            const expectedMax = (s.subjectCode === '041' ? [10,10,10,20] :
              s.subjectCode === '043' ? [6,7,7,7,8,15] :
              s.subjectCode === '045' ? [11,2,11,2,24] :
              s.subjectCode === '048' ? [21,9,20] : [])[index] ?? null;
            return { studentIC: ic, name: expected[index] || `Input ${index+1}`, detectedLabel: label,
              detectedMax, labelMatches: label === normalize(expected[index] || ''),
              maxMatches: detectedMax === expectedMax, currentValue: String(input.value ?? '').trim(), input };
          })
        });
      }

      const validRows = studentRecords.filter(r => r.countMatches && r.sourceMatch);
      const countMismatch = studentRecords.filter(r => !r.countMatches).length;
      const componentVerifiedRows = studentRecords.filter(r => r.countMatches &&
        r.components.every(c => c.labelMatches && c.maxMatches));
      const unmatched = studentRecords.filter(r => !r.sourceMatch).length;
      const duplicateSource = [...sourceIds].filter(id =>
        s.rows.filter(r => normalizeIC(r['Student ID'] ?? '') === id).length > 1
      ).length;

      $('detection').textContent =
        `Struktur SBPPA: ${studentRecords.length} rekod murid (TR) dikenal pasti. ` +
        `Setiap rekod dipadankan menggunakan No. IC. ` +
        `Subjek ${subjectEvidence ? 'dikesan' : 'belum dapat disahkan'}.`;

      $('scanResults').innerHTML =
        '<thead><tr><th>No. IC</th><th>Nama</th><th>Input</th><th>Padanan sumber</th><th>Status</th></tr></thead><tbody>' +
        studentRecords.slice(0, 100).map(r =>
          `<tr><td>${esc(r.ic)}</td><td>${esc(r.name)}</td><td>${r.inputCount}/${expectedCount}</td>` +
          `<td>${r.sourceMatch ? 'Dijumpai' : 'Tiada'}</td>` +
          `<td>${r.countMatches && r.sourceMatch && r.components.every(c => c.labelMatches && c.maxMatches) ? 'LABEL + HAD OK' : 'SEMAK'}</td></tr>`
        ).join('') + '</tbody>';

      const allRowsValid = studentRecords.length > 0 &&
        studentRecords.every(r => r.countMatches && r.sourceMatch) &&
        duplicatePortalIC === 0 && duplicateSource === 0 &&
        subjectEvidence && studentRecords.length === s.rows.filter(r => normalizeIC(r['Student ID'] ?? '')).length;

      $('scanSummary').textContent =
        `Rekod murid (TR): ${studentRecords.length}. ` +
        `Rekod sepadan No. IC + bilangan input: ${validRows.length}. ` +
        `No. IC portal tidak ditemui dalam sumber: ${unmatched}. ` +
        `Bilangan input tidak sepadan profil (${expectedCount}): ${countMismatch}. ` +
        `No. IC pendua di portal: ${duplicatePortalIC}. ` +
        `No. IC pendua dalam fail: ${duplicateSource}. ` +
        `Baris berinput tetapi tiada identiti yang dikenal pasti: ${ignoredRows}. ` + `Label + had komponen disahkan: ${componentVerifiedRows.length}.`;

      // Store the live DOM scan for a single-student, user-confirmed fill.
      window.__MPT4_SCAN__ = { studentRecords, duplicatePortalIC, duplicateSource, subjectEvidence, expectedCount };
      const sourceCount = s.rows.filter(r => normalizeIC(r['Student ID'] ?? '')).length;
      const safeScan = subjectEvidence && duplicatePortalIC === 0 && duplicateSource === 0 &&
        studentRecords.length > 0 && componentVerifiedRows.length === studentRecords.length &&
        validRows.length === sourceCount && sourceCount > 0;
      $('start').disabled = !safeScan || fillRunning;
      const blankSourceIC = s.rows.filter(r => !String(r['Student ID']??'').trim()).length;
      log(`Imbasan selesai: ${validRows.length}/${sourceCount} padanan No. IC bagi rekod sumber ber-IC; ${componentVerifiedRows.length}/${studentRecords.length} rekod LABEL + HAD OK. ${blankSourceIC} baris sumber tanpa IC dilangkau. ${safeScan ? 'Autofill sedia untuk rekod sumber ber-IC.' : 'Autofill dikunci: syarat imbasan keselamatan belum lengkap.'}`);
    }
    $('refresh').onclick=()=>{inspect();$('refresh').textContent='IMBAS SEMULA';};
    $('start').onclick=async()=>{
      if(fillRunning) return;
      const scan=window.__MPT4_SCAN__;
      if(!scan || !scan.subjectEvidence || scan.duplicatePortalIC || scan.duplicateSource || scan.studentRecords.length===0){
        log('Autofill dibatalkan: imbas semula dan pastikan semua syarat struktur halaman dipenuhi.'); return;
      }
      const normalizeIC=value=>String(value??'').replace(/\D/g,'');
      const normalizeName=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
      const sourceRows=s.rows.filter(r=>normalizeIC(r['Student ID']));
      const invalidIdRows=s.rows.filter(r=>{
        const raw=String(r['Student ID']??'').trim();
        return raw!=='' && !normalizeIC(raw);
      });
      if(!sourceRows.length){
        log('Autofill dibatalkan: tiada rekod sumber dengan No. IC yang sah. Tiada nilai diubah.');return;
      }
      if(invalidIdRows.length){
        log(`Autofill dibatalkan: ${invalidIdRows.length} rekod mempunyai No. IC tidak sah (bukan kosong). Semak data sumber. Tiada nilai diubah.`);return;
      }
      const expected=componentNames[s.subjectCode]||[];
      const maxima=s.subjectCode==='041'?[10,10,10,20]:s.subjectCode==='043'?[6,7,7,7,8,15]:s.subjectCode==='045'?[11,2,11,2,24]:[21,9,20];
      const sourceIds=sourceRows.map(r=>normalizeIC(r['Student ID']));
      if(new Set(sourceIds).size!==sourceIds.length){
        log('Autofill dibatalkan: No. IC pendua ditemui dalam fail sumber. Tiada nilai diubah.');return;
      }
      const allItems=[];
      const studentNames=[];
      let skippedCount=0, blankSourceCount=0;
      // Preflight every source student before changing any portal field.
      for(const source of sourceRows){
        const ic=normalizeIC(source['Student ID']);
        const matches=scan.studentRecords.filter(r=>r.ic===ic);
        if(matches.length!==1){
          log(`Autofill dibatalkan: No. IC ${ic} mempunyai ${matches.length} padanan portal; setiap murid mesti mempunyai satu padanan unik. Tiada nilai diubah.`);return;
        }
        const student=matches[0];
        if(normalizeName(student.name)!==normalizeName(source['Student Name'])){
          log(`Autofill dibatalkan: nama tidak sepadan untuk No. IC ${ic}. Semak rekod sumber dan portal. Tiada nilai diubah.`);return;
        }
        if(student.inputCount!==expected.length || student.components.length!==expected.length ||
           !student.components.every((c,i)=>c.labelMatches && c.maxMatches && c.detectedMax===maxima[i])){
          log(`Autofill dibatalkan: label, susunan atau had markah komponen tidak disahkan bagi ${student.name} (${ic}). Tiada nilai diubah.`);return;
        }
        const sourceHeaderMap=new Map(Object.keys(source).map(key=>[normalize(key),key]));
        const studentPlan=[];
        for(let i=0;i<expected.length;i++){
          const sourceKey=sourceHeaderMap.get(normalize(expected[i]));
          if(!sourceKey){
            log(`Autofill dibatalkan: header sumber bagi ${expected[i]} tidak ditemui. Tiada nilai diubah.`);return;
          }
          const value=String(source[sourceKey]??'').trim();
          if(value===''){blankSourceCount++;continue;}
          if(value!=='T' && (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value)<0 || Number(value)>maxima[i])){
            log(`Autofill dibatalkan: markah sumber tidak sah bagi ${student.name}, komponen ${expected[i]}; mesti integer 0-${maxima[i]} atau T. Tiada nilai diubah.`);return;
          }
          const input=student.components[i].input;
          const original=String(input.value??'').trim();
          if(original!==''){skippedCount++;continue;}
          studentPlan.push({studentName:student.name,ic,component:expected[i],input,value:value==='T'?'T':String(Number(value)),original});
        }
        if(studentPlan.length) studentNames.push(student.name);
        allItems.push(...studentPlan);
      }
      if(!allItems.length){
        log(`Tiada medan kosong untuk diisi bagi ${sourceRows.length} murid sumber. ${skippedCount} medan portal sedia ada dikekalkan; ${blankSourceCount} sel sumber kosong dilangkau.`);return;
      }
      const perStudent=new Map();
      for(const item of allItems) perStudent.set(item.ic,(perStudent.get(item.ic)||0)+1);
      const summary=[...perStudent.entries()].map(([ic,count])=>{
        const item=allItems.find(x=>x.ic===ic);return `${item.studentName}: ${count} medan`;
      }).join('\n');
      if(!confirm(`AUTOFILL SEMUA MURID — SEMAKAN TERKAWAL\n\nMurid sumber ber-IC: ${sourceRows.length}\nBaris sumber tanpa IC dilangkau: ${s.rows.length-sourceRows.length}\nMurid yang mempunyai medan untuk diisi: ${perStudent.size}\nJumlah medan kosong akan diisi: ${allItems.length}\nMedan sedia ada dikekalkan: ${skippedCount}\nSel markah sumber kosong dilangkau: ${blankSourceCount}\n\n${summary}\n\nSemua rekod dan markah telah disemak sebelum proses bermula. Hanya medan kosong akan diisi. Jika berlaku ralat atau BATAL, perubahan dalam sesi ini akan dipulihkan setakat yang boleh disahkan. Tiada SIMPAN automatik. Teruskan?`)) return;
      fillRunning=true; fillCancelled=false; $('start').disabled=true; $('cancelFill').disabled=false; $('clear').disabled=true; $('refresh').disabled=true;
      const nativeSetter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;
      const waitRender=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const dispatch=input=>{input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));};
      const changed=[]; let failure='';
      try{
        if(!nativeSetter) throw new Error('Native setter React tidak tersedia.');
        for(let index=0;index<allItems.length;index++){
          const item=allItems[index];
          if(fillCancelled) throw new Error('Dibatalkan oleh pengguna.');
          if(!item.input.isConnected || item.input.disabled || item.input.readOnly || String(item.input.value??'').trim()!=='')
            throw new Error(`Medan ${item.component} bagi ${item.studentName} berubah atau tidak lagi kosong. Proses dihentikan.`);
          nativeSetter.call(item.input,item.value);
          changed.push(item);
          dispatch(item.input);
          await waitRender();
          if(fillCancelled) throw new Error('Dibatalkan oleh pengguna.');
          if(!item.input.isConnected || String(item.input.value??'').trim()!==item.value)
            throw new Error(`React/MUI tidak mengesahkan ${item.component} bagi ${item.studentName}.`);
          if((index+1)%10===0 || index===allItems.length-1){
            $('sessionStatus').textContent=`Sedang mengisi dan mengesahkan medan ${index+1}/${allItems.length}. Jangan tutup halaman atau tekan SIMPAN.`;
          }
        }
      }catch(error){failure=error?.message||String(error);}
      if(failure){
        let rollbackOK=true;
        for(const item of [...changed].reverse()){
          try{if(item.input.isConnected){nativeSetter.call(item.input,item.original);dispatch(item.input);await waitRender();if(String(item.input.value??'').trim()!==item.original)rollbackOK=false;}else rollbackOK=false;}catch{rollbackOK=false;}
        }
        log(`AUTOFILL ${fillCancelled?'DIBATALKAN':'DIHENTIKAN'}: ${failure} ${rollbackOK?'Semua perubahan dalam sesi ini dipulihkan.':'AMARAN: pemulihan tidak dapat disahkan; jangan SIMPAN dan semak semua medan secara manual.'}`);
        $('sessionStatus').textContent=rollbackOK?'Proses dihentikan dan perubahan sementara dipulihkan.':'AMARAN: pemulihan tidak dapat disahkan. Jangan tekan SIMPAN.';
        if(!rollbackOK) alert('AMARAN: Pemulihan tidak dapat disahkan. Jangan tekan SIMPAN. Periksa markah yang diisi pada halaman secara manual.');
      }else{
        log(`AUTOFILL SEMUA MURID BERJAYA: ${perStudent.size} murid diproses; ${changed.length} medan kosong diisi dan disahkan; ${skippedCount} medan sedia ada dikekalkan; ${blankSourceCount} sel sumber kosong dilangkau. Tiada SIMPAN dilakukan.`);
        $('sessionStatus').textContent=`SELESAI: ${perStudent.size} murid diproses · ${changed.length} medan diisi dan disahkan · ${skippedCount} medan sedia ada dikekalkan · ${blankSourceCount} sel sumber kosong dilangkau. Semak semua markah pada portal sebelum SIMPAN secara manual.`;
      }
      fillRunning=false; $('cancelFill').disabled=true; $('clear').disabled=false; $('refresh').disabled=false; $('start').disabled=true;
    };
    $('cancelFill').onclick=()=>{if(fillRunning){fillCancelled=true;$('cancelFill').disabled=true;log('Permintaan BATAL diterima; proses akan berhenti dan perubahan sementara dipulihkan.');}};
    $('clear').onclick=async()=>{
      if(fillRunning){log('KOSONGKAN SESI tidak dibenarkan semasa Autofill berjalan. Tekan BATAL dahulu dan tunggu pemulihan selesai.');return;}
      const button=$('clear'); button.disabled=true;
      $('sessionStatus').textContent='Mengosongkan sesi dan membuka semula tetapan awal…';
      try{
        const result=await chrome.runtime.sendMessage({type:'MPT4_CLEAR_AND_OPEN_SETTINGS'});
        if(result?.ok && result.opened){
          host.remove(); window.__MPT4_HELPER_LOADED__=false;
        }else{
          button.disabled=false;
          $('sessionStatus').textContent='Sesi telah dikosongkan. Chrome tidak dapat membuka popup secara automatik; klik ikon MPT4 Helper pada bar alat untuk memaparkan tetapan awal.';
          log('Sesi dikosongkan. Sila klik ikon extension untuk membuka tetapan awal.');
        }
      }catch(error){
        button.disabled=false;
        $('sessionStatus').textContent='Tidak dapat membuka tetapan awal secara automatik. Klik ikon MPT4 Helper pada bar alat. '+(error?.message||String(error));
        log('Sesi mungkin telah dikosongkan. Buka tetapan awal melalui ikon extension.');
      }
    };
    $('min').onclick=()=>host.classList.toggle('collapsed');$('close').onclick=()=>host.remove();
    // Drag by header only; keep within viewport.
    const head=$('min').parentElement; let drag=null;
    head.addEventListener('pointerdown',e=>{if(e.target.tagName==='BUTTON')return;drag={x:e.clientX- host.getBoundingClientRect().left,y:e.clientY-host.getBoundingClientRect().top};head.setPointerCapture(e.pointerId);});
    head.addEventListener('pointermove',e=>{if(!drag)return;host.style.left=Math.max(0,Math.min(innerWidth-80,e.clientX-drag.x))+'px';host.style.top=Math.max(0,Math.min(innerHeight-60,e.clientY-drag.y))+'px';host.style.right='auto';});
    head.addEventListener('pointerup',()=>drag=null);
    inspect();
  }
  function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
})();
