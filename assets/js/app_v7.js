/**
 * OathFlix - Main Frontend Application Controller
 * Handles Automated & Manual Search Modes, Modal Popups, and Full OathNet Report Rendering
 */

document.addEventListener('DOMContentLoaded', () => {

  // DOM Elements
  const profileOverlay = document.getElementById('profileOverlay');
  const profileCards = document.querySelectorAll('.profile-card');
  const activeProfileAvatar = document.getElementById('activeProfileAvatar');
  const activeProfileName = document.getElementById('activeProfileName');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  const resultsSection = document.getElementById('resultsSection');
  const loadingBox = document.getElementById('loadingBox');
  const resultsGrid = document.getElementById('resultsGrid');
  const resultsQueryText = document.getElementById('resultsQueryText');

  const detailModal = document.getElementById('detailModal');
  const modalClose = document.getElementById('closeModalBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalContent');

  // Mode Switching (Automated vs Manual)
  let currentMode = 'automated'; // 'automated' or 'manual'
  let activeSubCategory = 'stealer'; // default manual target
  let currentSearchId = ''; // Holds active search session to bypass quota on file lookups

  const modeAutomated = document.getElementById('modeAutomated');
  const modeManual = document.getElementById('modeManual');
  const modeMasterProfiler = document.getElementById('modeMasterProfiler');
  const modeCCSikici = document.getElementById('modeCCSikici');
  const modeCCFormatter = document.getElementById('modeCCFormatter');
  const modeCCDumper = document.getElementById('modeCCDumper');
  const manualCategories = document.getElementById('manualCategories');
  const catPills = document.querySelectorAll('.cat-pill');
  const subPills = document.querySelectorAll('.sub-pill');

  // Handle Entrance Profile Cards
  window.dismissProfileOverlay = function() {
    sessionStorage.setItem('oathflix_entered', 'true');
    document.documentElement.classList.add('already-entered');
    const overlay = document.getElementById('profileOverlay');
    if (overlay) overlay.classList.add('hidden');
  };

  profileCards.forEach(card => {
    card.addEventListener('click', window.dismissProfileOverlay);
  });

  const searchFormMain = document.getElementById('searchFormMain');
  const ccFormatterPanel = document.getElementById('ccFormatterPanel');

  function showSearchForm() {
    if (searchFormMain) searchFormMain.style.display = 'flex';
    if (ccFormatterPanel) ccFormatterPanel.style.display = 'none';
  }

  function showCCFormatterPanel() {
    if (searchFormMain) searchFormMain.style.display = 'none';
    if (ccFormatterPanel) ccFormatterPanel.style.display = 'block';
  }

  const modePhonebook = document.getElementById('modePhonebook');

  // Mode Selector Handlers
  if (modeAutomated) {
    modeAutomated.addEventListener('click', () => {
      currentMode = 'automated';
      showSearchForm();
      modeAutomated.classList.add('active');
      if (modePhonebook) modePhonebook.classList.remove('active');
      if (modeCCSikici) modeCCSikici.classList.remove('active');
      if (modeCCFormatter) modeCCFormatter.classList.remove('active');
      if (modeMasterProfiler) modeMasterProfiler.classList.remove('active');
      if (modeCCDumper) modeCCDumper.classList.remove('active');
      searchInput.placeholder = 'Search stolen data... (email, IP, domain, username...)';
    });

    if (modePhonebook) {
      modePhonebook.addEventListener('click', () => {
        currentMode = 'phonebook';
        showSearchForm();
        modePhonebook.classList.add('active');
        modeAutomated.classList.remove('active');
        if (modeCCSikici) modeCCSikici.classList.remove('active');
        if (modeCCFormatter) modeCCFormatter.classList.remove('active');
        if (modeMasterProfiler) modeMasterProfiler.classList.remove('active');
        if (modeCCDumper) modeCCDumper.classList.remove('active');
        searchInput.placeholder = 'Hedef Domain Girin... (Örn: cheatglobal.com, epin.com.tr) — [PHONEBOOK & SUBDOMAINS: 1 KREDİ]';
      });
    }

    if (modeCCSikici) {
      modeCCSikici.addEventListener('click', () => {
        currentMode = 'cc_sikici';
        showSearchForm();
        modeCCSikici.classList.add('active');
        modeAutomated.classList.remove('active');
        if (modePhonebook) modePhonebook.classList.remove('active');
        if (modeCCFormatter) modeCCFormatter.classList.remove('active');
        if (modeMasterProfiler) modeMasterProfiler.classList.remove('active');
        if (modeCCDumper) modeCCDumper.classList.remove('active');
        searchInput.placeholder = 'Hedef Siteyi Girin... (Örn: cheatglobal.com) — [CC SİKİCİ: 1 KREDİ]';
      });
    }

    if (modeCCFormatter) {
      modeCCFormatter.addEventListener('click', () => {
        currentMode = 'cc_formatter';
        showCCFormatterPanel();
        modeCCFormatter.classList.add('active');
        modeAutomated.classList.remove('active');
        if (modePhonebook) modePhonebook.classList.remove('active');
        if (modeCCSikici) modeCCSikici.classList.remove('active');
        if (modeMasterProfiler) modeMasterProfiler.classList.remove('active');
        if (modeCCDumper) modeCCDumper.classList.remove('active');
      });
    }
    
    if (modeMasterProfiler) {
      modeMasterProfiler.addEventListener('click', () => {
        currentMode = 'master_profiler';
        showSearchForm();
        modeMasterProfiler.classList.add('active');
        modeAutomated.classList.remove('active');
        if (modePhonebook) modePhonebook.classList.remove('active');
        if (modeCCDumper) modeCCDumper.classList.remove('active');
        searchInput.placeholder = 'Enter target (username or ID) to build a full profile (COST: 1 CREDIT)';
      });
    }

    if (modeCCDumper) {
      modeCCDumper.addEventListener('click', () => {
        currentMode = 'cc_dumper';
        showSearchForm();
        modeCCDumper.classList.add('active');
        modeAutomated.classList.remove('active');
        if (modePhonebook) modePhonebook.classList.remove('active');
        if (modeMasterProfiler) modeMasterProfiler.classList.remove('active');
        searchInput.placeholder = 'Enter Target Website (e.g. amazon.com) to extract CCs (COST: 1 CREDIT)';
        document.querySelectorAll('.cc-single-scan').forEach(el => el.style.display = 'flex');
      });
    }

    // Dedicated Credit Card Formatter Panel Logic
    const ccFileInput = document.getElementById('ccFileInput');
    const ccRawInputText = document.getElementById('ccRawInputText');
    const ccFormatterOutputText = document.getElementById('ccFormatterOutputText');
    const ccFormatterCountBadge = document.getElementById('ccFormatterCountBadge');
    const btnFormatUploadedText = document.getElementById('btnFormatUploadedText');
    const btnClearFormatterInput = document.getElementById('btnClearFormatterInput');
    const btnCopyFormattedCc = document.getElementById('btnCopyFormattedCc');
    const btnDownloadFormattedCc = document.getElementById('btnDownloadFormattedCc');
    const ccDropZone = document.getElementById('ccDropZone');

    function runDedicatedFormatting() {
      if (!ccRawInputText || !ccFormatterOutputText) return;
      const rawVal = ccRawInputText.value;
      if (!rawVal.trim()) {
        ccFormatterOutputText.value = '';
        if (ccFormatterCountBadge) ccFormatterCountBadge.textContent = '0 Kart Bulundu';
        return;
      }
      const cleanOutput = formatCreditCardsText(rawVal);
      ccFormatterOutputText.value = cleanOutput;

      const count = cleanOutput ? cleanOutput.split('\n').filter(l => l.trim()).length : 0;
      if (ccFormatterCountBadge) ccFormatterCountBadge.textContent = `${count} Kart Bulundu`;
    }

    if (btnFormatUploadedText) {
      btnFormatUploadedText.onclick = runDedicatedFormatting;
    }

    if (btnClearFormatterInput) {
      btnClearFormatterInput.onclick = () => {
        if (ccRawInputText) ccRawInputText.value = '';
        if (ccFormatterOutputText) ccFormatterOutputText.value = '';
        if (ccFileInput) ccFileInput.value = '';
        if (ccFormatterCountBadge) ccFormatterCountBadge.textContent = '0 Kart Bulundu';
        const dropTitle = document.getElementById('ccDropZoneTitle');
        if (dropTitle) dropTitle.textContent = '.TXT Dosyası Sürükleyip Bırakın veya Seçin';
      };
    }

    if (btnCopyFormattedCc) {
      btnCopyFormattedCc.onclick = () => {
        if (!ccFormatterOutputText.value) return;
        navigator.clipboard.writeText(ccFormatterOutputText.value);
        btnCopyFormattedCc.innerHTML = '<i class="fa-solid fa-check"></i> Kopyalandı!';
        setTimeout(() => btnCopyFormattedCc.innerHTML = '<i class="fa-solid fa-copy"></i> Tümünü Kopyala', 2000);
      };
    }

    if (btnDownloadFormattedCc) {
      btnDownloadFormattedCc.onclick = () => {
        if (!ccFormatterOutputText.value) return;
        const blob = new Blob([ccFormatterOutputText.value], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Clean_Cards_List_${Date.now()}.txt`;
        a.click();
      };
    }

    if (ccFileInput) {
      ccFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const dropTitle = document.getElementById('ccDropZoneTitle');
        if (dropTitle) dropTitle.textContent = `Yüklendi: ${file.name} (${(file.size/1024).toFixed(1)} KB)`;
        
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (ccRawInputText) ccRawInputText.value = evt.target.result;
          runDedicatedFormatting();
        };
        reader.readAsText(file);
      };
    }

    if (ccDropZone) {
      ccDropZone.ondragover = (e) => {
        e.preventDefault();
        ccDropZone.style.borderColor = '#00e5ff';
        ccDropZone.style.background = 'rgba(0,229,255,0.1)';
      };
      ccDropZone.ondragleave = (e) => {
        e.preventDefault();
        ccDropZone.style.borderColor = 'rgba(0, 229, 255, 0.4)';
        ccDropZone.style.background = 'rgba(0,229,255,0.03)';
      };
      ccDropZone.ondrop = (e) => {
        e.preventDefault();
        ccDropZone.style.borderColor = 'rgba(0, 229, 255, 0.4)';
        ccDropZone.style.background = 'rgba(0,229,255,0.03)';
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          const file = files[0];
          const dropTitle = document.getElementById('ccDropZoneTitle');
          if (dropTitle) dropTitle.textContent = `Yüklendi: ${file.name} (${(file.size/1024).toFixed(1)} KB)`;

          const reader = new FileReader();
          reader.onload = (evt) => {
            if (ccRawInputText) ccRawInputText.value = evt.target.result;
            runDedicatedFormatting();
          };
          reader.readAsText(file);
        }
      };
    }

    // Hide cc-single-scan for all other modes
    [modeAutomated, modeManual, modeMasterProfiler].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.cc-single-scan').forEach(el => el.style.display = 'none');
        });
      }
    });
  }

  // Main Category Pill Switcher
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-cat');

      document.querySelectorAll('.sub-cat-group').forEach(g => g.classList.add('hidden'));

      if (cat === 'data_leaks') document.getElementById('subGroupDataLeaks').classList.remove('hidden');
      else if (cat === 'social_gaming') document.getElementById('subGroupSocial').classList.remove('hidden');
      else if (cat === 'email_intel') document.getElementById('subGroupEmail').classList.remove('hidden');
      else if (cat === 'network_intel') document.getElementById('subGroupNetwork').classList.remove('hidden');
    });
  });

  // Sub-Category Target Selector
  subPills.forEach(pill => {
    pill.addEventListener('click', () => {
      subPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeSubCategory = pill.getAttribute('data-type');
      searchInput.placeholder = `Search target for [${activeSubCategory.toUpperCase()}]...`;
    });
  });

  // Bulk Search & Scanners Action Buttons
  document.getElementById('btnBulkSearch')?.addEventListener('click', () => {
    openDetailModal({
      info: "Bulk Search API Engine",
      endpoint: "POST /service/v2/bulk-search/create",
      description: "Batch query across hundreds of target emails, IPs, or domains asynchronously.",
      usage: "Pass an array of search queries to OathNet API to create an async bulk-search job."
    }, "BULK SEARCH ENGINE");
  });

  document.getElementById('btnScanners')?.addEventListener('click', async () => {
    try {
      const formData = new FormData();
      formData.append('action', 'list_scanners');
      const res = await fetch('api_handler.php', { method: 'POST', body: formData });
      const data = await res.json();
      openDetailModal(data, "AUTOMATED SCANNERS");
    } catch(e) {
      openDetailModal({ message: "Could not fetch scanner status" }, "AUTOMATED SCANNERS");
    }
  });

  // Search Button & Keyboard Event Listeners
  if (searchBtn) searchBtn.addEventListener('click', performSearch);
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  // Perform Search Logic
  async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    resultsSection.classList.add('active');
    loadingBox.style.display = 'block';
    resultsGrid.style.display = 'none';
    resultsQueryText.textContent = `"${query}" [MODE: ${currentMode.toUpperCase()}]`;

    resultsSection.scrollIntoView({ behavior: 'smooth' });

    try {
      let searchData = null;
      const formData = new FormData();
      formData.append('query', query);

      const limitSelect = document.getElementById('resultLimitSelect');
      const limitVal = limitSelect ? limitSelect.value : '2000';
      formData.append('limit', limitVal);

      async function postApi(bodyData) {
        try {
          const res = await fetch('/api/handler', { method: 'POST', body: bodyData });
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch(e) {
            return { success: false, message: 'Invalid response from server: ' + text };
          }
        } catch(e) {
          return { success: false, message: e.message };
        }
      }

      if (currentMode === 'cc_dumper') {
        await executeCCDumper(query);
        return;
      } else if (currentMode === 'phonebook') {
        formData.append('action', 'phonebook_search');
        formData.append('domain', query);
        searchData = await postApi(formData);
        if (searchData && searchData.search_id) {
          currentSearchId = searchData.search_id;
        }
        renderPhonebookResults(searchData, query);
        return;
      } else {
        formData.append('action', 'automated_search');
        searchData = await postApi(formData);
      }

      if (searchData && searchData.search_id) {
        currentSearchId = searchData.search_id;
      }

      renderSearchResults(searchData, query);
    } catch (err) {
      console.error(err);
      loadingBox.style.display = 'none';
      resultsGrid.style.display = 'block';
      resultsGrid.innerHTML = `
        <div style="text-align: center; color: var(--nf-red); padding: 40px; background: rgba(24,24,24,0.85); border-radius: 12px; border: 1px solid var(--nf-border);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
          <h3>Error Fetching OSINT Intelligence</h3>
          <p style="color: var(--nf-gray-muted); margin-top: 8px;">${err.message || 'Check your API connection or credentials.'}</p>
        </div>
      `;
    }
  }

  // Professional Automatic Credit Card Formatter Utility (Pure Clean List, No Headers)
  function formatCreditCardsText(rawText) {
    if (!rawText) return '';

    // Split text into blocks by delimiter or victim log headers
    const blocks = rawText.split(/(?:={10,}|VICTIM LOG:)/);
    const results = [];

    for (const block of blocks) {
      if (!block.trim()) continue;

      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);

      // Filter out header noise lines & ASCII art
      const cleanLines = lines.filter(l => {
        if (l.startsWith('===') || l.startsWith('FILE:') || l.startsWith('VICTIM LOG:')) return false;
        if (l.includes('DARKSIDE_BRAND') || l.includes('Join: https') || l.includes('|____') || l.includes('$$$') || l.includes('\\___')) return false;
        return true;
      });

      if (cleanLines.length === 0) continue;

      const blockStr = cleanLines.join('\n');
      const cardMatches = Array.from(blockStr.matchAll(/\b(?:\d[ -]*?){13,19}\b/g));
      if (cardMatches.length === 0) continue;

      for (const m of cardMatches) {
        const rawCc = m[0];
        const cleanCc = rawCc.replace(/[^\d]/g, '');
        if (cleanCc.length < 13 || cleanCc.length > 19) continue;

        let lineIdx = cleanLines.findIndex(l => l.includes(rawCc) || l.includes(cleanCc));
        let context = blockStr;
        if (lineIdx !== -1) {
          const start = Math.max(0, lineIdx - 1);
          const end = Math.min(cleanLines.length, lineIdx + 2);
          context = cleanLines.slice(start, end).join('\n');
        }

        // Expiration
        const expMatch = context.match(/\b(0?[1-9]|1[0-2])\s*[\/\-]\s*(20\d{2}|\d{2})\b/);
        let expStr = '';
        if (expMatch) {
          const month = parseInt(expMatch[1], 10).toString();
          let year = expMatch[2];
          if (year.length === 2) year = '20' + year;
          expStr = `${month}/${year}`;
        }

        // CVV
        const cvvMatch = context.match(/(?:CVV|CVC|Code|CVV2)\s*[:=\|\-]?\s*\b(\d{3,4})\b/i);
        let cvvStr = '';
        if (cvvMatch && !cleanCc.includes(cvvMatch[1])) {
          cvvStr = cvvMatch[1];
        } else {
          const tokens = context.split(/[\s\|\:\,\/]+/);
          for (const tok of tokens) {
            const cTok = tok.replace(/[^\d]/g, '');
            if ((cTok.length === 3 || cTok.length === 4) && !cleanCc.includes(cTok)) {
              if (!expMatch || !expMatch[0].includes(cTok)) {
                cvvStr = cTok;
                break;
              }
            }
          }
        }

        // Holder Name
        let holderName = '';
        const nameMatch = context.match(/(?:NAME|Name|Card Holder|Holder|Owner)\s*[:=\|]?\s*([a-zA-Z\s\.]{2,40})/i);
        if (nameMatch) {
          const cand = nameMatch[1].trim();
          if (!['visa', 'mastercard', 'amex', 'discover', 'credit', 'card', 'default', 'profile', 'txt', 'target', 'origin', 'number', 'cn'].includes(cand.toLowerCase())) {
            holderName = cand.toLowerCase();
          }
        }

        if (!holderName) {
          const linesInCtx = context.split('\n');
          for (const l of linesInCtx) {
            const parts = l.split(/[|:\t]/);
            for (const p of parts) {
              const cleanP = p.trim();
              if (cleanP && !/\d/.test(cleanP) && cleanP.length >= 2 && cleanP.length <= 40) {
                const low = cleanP.toLowerCase();
                if (!['visa', 'mastercard', 'amex', 'discover', 'credit', 'card', 'default', 'profile', 'txt', 'file', 'victim', 'target', 'origin', 'number', 'cn', 'date', 'cvv', 'cvc', 'google', 'chrome', 'edge', 'opera', 'brave'].some(k => low.includes(k))) {
                  holderName = low;
                  break;
                }
              }
            }
          }
        }

        const formattedLine = holderName ? `${holderName} | ${cleanCc} | ${expStr} | ${cvvStr}` : ` | ${cleanCc} | ${expStr} | ${cvvStr}`;
        results.push(formattedLine);
      }
    }

    // Deduplicate output while keeping order
    const seen = new Set();
    const uniqueResults = [];
    results.forEach(r => {
      if (!seen.has(r)) {
        seen.add(r);
        uniqueResults.push(r);
      }
    });

    return uniqueResults.join('\n');
  }

  // Automatic High-Speed Credit Card Harvester Worker
  async function startAutomaticCardHarvesting(logs) {
    const harvestBox = document.getElementById('ccDumpHarvestBox');
    const textArea = document.getElementById('ccHarvestTextArea');
    const countBadge = document.getElementById('ccHarvestCountBadge');
    const statusText = document.getElementById('ccHarvestStatusText');
    const btnFormat = document.getElementById('btnFormatAllCc');
    const btnCopy = document.getElementById('btnCopyAllCc');
    const btnDownload = document.getElementById('btnDownloadAllCc');

    if (!harvestBox || !textArea) return;

    if (btnFormat) {
      btnFormat.onclick = () => {
        if (!textArea.value) return;
        textArea.value = formatCreditCardsText(textArea.value);
        btnFormat.innerHTML = '<i class="fa-solid fa-check"></i> Formatted!';
        setTimeout(() => btnFormat.innerHTML = '<i class="fa-solid fa-wand-magic"></i> Auto-Format (| Format)', 2000);
      };
    }

    if (btnCopy) {
      btnCopy.onclick = () => {
        if (!textArea.value) return;
        navigator.clipboard.writeText(textArea.value);
        btnCopy.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => btnCopy.innerHTML = '<i class="fa-solid fa-copy"></i> Copy All Cards (.txt)', 2000);
      };
    }

    if (btnDownload) {
      btnDownload.onclick = () => {
        if (!textArea.value) return;
        const blob = new Blob([textArea.value], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `CC_Sikici_Harvest_${Date.now()}.txt`;
        a.click();
      };
    }

    const liveLogBox = document.getElementById('ccLiveLogBox');
    function logActivity(msg, type = 'info') {
      if (!liveLogBox) return;
      const time = new Date().toLocaleTimeString();
      let color = '#00ff88';
      let icon = '⚡';
      if (type === 'warn') { color = '#ff9800'; icon = '⚠️'; }
      else if (type === 'error') { color = '#ff3333'; icon = '❌'; }
      else if (type === 'success') { color = '#00ffff'; icon = '💳'; }
      else if (type === 'system') { color = '#aaaaaa'; icon = '⚙️'; }

      const line = document.createElement('div');
      line.style.color = color;
      line.style.marginBottom = '4px';
      line.style.wordBreak = 'break-all';
      line.innerHTML = `<span style="color:#666;">[${time}]</span> ${icon} ${msg}`;
      liveLogBox.appendChild(line);
      liveLogBox.scrollTop = liveLogBox.scrollHeight;
    }

    if (liveLogBox) liveLogBox.innerHTML = '';
    logActivity(`[START] Otonom CC Harvester başlatıldı. Toplam ${logs.length} kurban logu taranacak.`, 'system');

    let fullTextOutput = '';
    const allExtractedCards = [];
    let totalLogsScanned = 0;
    let totalCardFilesFound = 0;

    const manifestCache = window.manifestCache || (window.manifestCache = new Map());

    const batchSize = 30; // 30 parallel workers
    for (let i = 0; i < logs.length; i += batchSize) {
      const chunk = logs.slice(i, i + batchSize);
      logActivity(`[BATCH] ${i + 1} - ${Math.min(i + batchSize, logs.length)} arası log grubu işleniyor...`, 'system');

      await Promise.all(chunk.map(async (log) => {
        const logId = log.log_id || log.id || '';
        if (!logId) return;

        try {
          let tree = manifestCache.get(logId);

          if (!tree) {
            logActivity(`Log #${logId.substring(0,8)}... dosya ağacı (manifest) çekiliyor...`, 'info');

            const mFd = new FormData();
            mFd.append('action', 'get_victim_manifest');
            mFd.append('log_id', logId);
            mFd.append('search_id', currentSearchId);

            const mRes = await fetch('/api/handler', { method: 'POST', body: mFd });
            const mJson = await mRes.json();
            tree = mJson.victim_tree;
            if (tree) manifestCache.set(logId, tree);
          } else {
            logActivity(`Log #${logId.substring(0,8)}... önbellekten (cache) alındı!`, 'system');
          }

          if (!tree) {
            logActivity(`Log #${logId.substring(0,8)}... dosya ağacı boş veya alınamadı.`, 'warn');
            return;
          }

          // Recursively scan tree STRICTLY for files inside CreditCards directory or named creditcards (NO AUTOFILLS!)
          const targetFiles = [];
          function scanTreeForCards(node, parentDirNames = []) {
            if (!node) return;
            const name = (node.name || '').trim();
            const nameLower = name.toLowerCase();
            const isDir = node.type === 'directory' || (node.children && node.children.length > 0);

            const currentDirStack = [...parentDirNames];
            if (isDir && name && name !== '/') {
              currentDirStack.push(nameLower);
            }

            if (!isDir) {
              const fileId = node.id || node.relative_path || node.path || node.file_id || (parentDirNames.join('/') + '/' + name);
              
              // STRICT CREDITCARDS MATCHING (DO NOT MATCH AUTOFILL)
              const isInsideCardDir = currentDirStack.some(d => 
                d.includes('creditcard') || d.includes('credit_card') || d.includes('credit card') || d === 'creditcards' || d === 'credit cards'
              );
              const isCardFileName = nameLower.includes('creditcard') || nameLower.includes('credit_card') || nameLower.includes('credit cards');

              if (fileId && (isInsideCardDir || isCardFileName) && !nameLower.includes('autofill') && !currentDirStack.some(d => d.includes('autofill'))) {
                targetFiles.push({
                  id: fileId,
                  name: name,
                  path: node.relative_path || node.path || (parentDirNames.join('/') + '/' + name)
                });
              }
            }

            if (node.children && Array.isArray(node.children)) {
              node.children.forEach(c => scanTreeForCards(c, currentDirStack));
            }
          }
          scanTreeForCards(tree);

          if (targetFiles.length === 0) {
            logActivity(`Log #${logId.substring(0,8)}... taranacak CreditCards dosyası yok.`, 'system');
          } else {
            logActivity(`Log #${logId.substring(0,8)}... -> ${targetFiles.length} CreditCards dosyası bulundu: (${targetFiles.map(tf => tf.name).join(', ')})`, 'success');
          }

          // Extract text for each card file (0 extra credits!) with 6-second timeout to prevent stalls!
          for (const f of targetFiles) {
            logActivity(`Dosya okunuyor: Log #${logId.substring(0,8)} -> [${f.path || f.name}]...`, 'info');

            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s max timeout per file!

              const cFd = new FormData();
              cFd.append('action', 'get_file_content');
              cFd.append('log_id', logId);
              cFd.append('file_id', f.id);
              cFd.append('search_id', currentSearchId);

              const cRes = await fetch('/api/handler', { method: 'POST', body: cFd, signal: controller.signal });
              clearTimeout(timeoutId);
              
              const cRaw = await cRes.text();
              let cJson = null;
              try { cJson = JSON.parse(cRaw); } catch(e) {}
              const textContent = cJson?.data?.content || cJson?.content || (cRaw && !cRaw.startsWith('<') ? cRaw : '');

              if (textContent) {
                totalCardFilesFound++;
                logActivity(`BAŞARILI: Log #${logId.substring(0,8)} -> [${f.name}] okundu! (${textContent.length} karakter)`, 'success');

                const formattedContent = formatCreditCardsText(textContent);
                const header = `========================================================\nVICTIM LOG: ${logId}\nFILE: ${f.path || f.name}\n========================================================\n`;
                fullTextOutput += header + formattedContent + "\n\n";

                const matches = textContent.match(/\b(?:\d[ -]*?){13,16}\b/g) || [];
                if (matches.length > 0) {
                  logActivity(`KART BULUNDU! Log #${logId.substring(0,8)} içerisinden ${matches.length} kart numarası ayrıştırıldı!`, 'success');
                }
                matches.forEach(m => {
                  const clean = m.replace(/[^\d]/g, '');
                  if (clean.length >= 13 && clean.length <= 16) {
                    allExtractedCards.push(clean);
                  }
                });

                textArea.value = fullTextOutput;
                textArea.scrollTop = textArea.scrollHeight;
              } else {
                logActivity(`UYARI: Log #${logId.substring(0,8)} -> [${f.name}] boş veya okunamadı.`, 'warn');
              }
            } catch (err) {
              if (err.name === 'AbortError') {
                logActivity(`ZAMAN AŞIMI (6s): Log #${logId.substring(0,8)} -> [${f.name}] yavaş yanıt verdiği için atlandı.`, 'warn');
              } else {
                logActivity(`HATA: Log #${logId.substring(0,8)} -> [${f.name}] okunamadı: ${err.message}`, 'error');
              }
            }
          }
        } catch (e) {
          logActivity(`HATA: Log #${logId.substring(0,8)} işlenirken istisna oluştu: ${e.message}`, 'error');
        } finally {
          totalLogsScanned++;
          if (statusText) {
            statusText.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Scanned ${totalLogsScanned} / ${logs.length} logs &bull; ${totalCardFilesFound} card files extracted...`;
          }
          if (countBadge) {
            countBadge.textContent = `${allExtractedCards.length} Cards Found`;
          }
        }
      }));
    }

    logActivity(`[TAMAMLANDI] Toplam ${logs.length} log tarandı. ${totalCardFilesFound} dosya okundu. ${allExtractedCards.length} kart bulundu.`, 'success');
    if (statusText) {
      statusText.innerHTML = `<i class="fa-solid fa-check-circle" style="color:#00ff88;"></i> HARVEST COMPLETE! Scanned ${logs.length} logs &bull; Extracted ${totalCardFilesFound} card files &bull; Found ${allExtractedCards.length} credit card numbers.`;
    }
    if (!fullTextOutput && textArea) {
      textArea.value = '[+] Scan complete. No CreditCards/*.txt files found in these logs.';
    }
  }

  // Dedicated Phonebook & Subdomain Haritası Renderer
  function renderPhonebookResults(data, query) {
    loadingBox.style.display = 'none';
    resultsGrid.style.display = 'block';

    if (!data || data.success === false) {
      resultsGrid.innerHTML = `
        <div style="text-align: center; color: var(--nf-red); padding: 40px; background: rgba(24,24,24,0.85); border-radius: 12px; border: 1px solid var(--nf-border);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
          <h3>Phonebook & Subdomain Bilgisi Alınamadı</h3>
          <p style="color: var(--nf-gray-muted); margin-top: 8px;">${data?.message || 'Bu domain için kayıt bulunamadı.'}</p>
        </div>
      `;
      return;
    }

    const payload = data.data || data;
    const targetDomain = payload.domain || query;
    const phonebook = payload.phonebook || {};
    const subdomainsData = payload.subdomains || {};

    // Collect subdomains array
    let subdomains = [];
    if (Array.isArray(subdomainsData.subdomains)) {
      subdomains = subdomainsData.subdomains;
    } else if (Array.isArray(phonebook.subdomains)) {
      subdomains = phonebook.subdomains;
    } else if (Array.isArray(phonebook.subdomain_results)) {
      subdomains = phonebook.subdomain_results.map(s => typeof s === 'string' ? s : (s.subdomain || s.host || ''));
    }

    // Collect emails array
    let emails = [];
    if (Array.isArray(phonebook.emails)) {
      emails = phonebook.emails;
    }

    const totalSubdomains = subdomains.length;
    const totalEmails = emails.length;

    let html = `
      <!-- Phonebook Header Card -->
      <div style="background: rgba(24,24,24,0.85); border: 1px solid #ff9800; border-radius: 12px; padding: 22px; margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
          <div>
            <h2 style="font-size: 1.5rem; color: #fff; display: flex; align-items: center; gap: 10px; margin:0;">
              <i class="fa-solid fa-globe" style="color: #ff9800;"></i> Phonebook & Subdomain Haritası
            </h2>
            <p style="color: var(--nf-gray-muted); font-size: 0.88rem; margin-top: 6px;">
              Hedef Domain: <span style="color: #ff9800; font-weight: bold; font-family: monospace; font-size: 1rem;">${targetDomain}</span>
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="action-btn" style="background:#ff9800; color:#000; font-weight:bold; cursor:pointer;" onclick="copySubdomainsList()"><i class="fa-solid fa-copy"></i> Subdomainleri Kopyala (${totalSubdomains})</button>
            <button class="action-btn" style="background:rgba(255,152,0,0.2); color:#ff9800; border:1px solid #ff9800; cursor:pointer;" onclick="copyEmailsList()"><i class="fa-solid fa-envelope"></i> E-Postaları Kopyala (${totalEmails})</button>
            <button class="action-btn" style="cursor:pointer;" onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(payload).replace(/"/g, '&quot;')}))"><i class="fa-solid fa-code"></i> JSON</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
          <div style="background: rgba(0,0,0,0.5); border: 1px solid var(--nf-border); border-radius: 10px; padding: 16px;">
            <div style="color: var(--nf-gray-muted); font-size: 0.78rem; font-weight: bold; text-transform: uppercase;">KEŞFEDİLEN SUBDOMAINLER</div>
            <div style="font-size: 1.8rem; font-weight: 700; color: #ff9800; margin-top: 4px;">${totalSubdomains}</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); border: 1px solid var(--nf-border); border-radius: 10px; padding: 16px;">
            <div style="color: var(--nf-gray-muted); font-size: 0.78rem; font-weight: bold; text-transform: uppercase;">SIZMIŞ KURUMSAL E-POSTALAR</div>
            <div style="font-size: 1.8rem; font-weight: 700; color: #00e5ff; margin-top: 4px;">${totalEmails}</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); border: 1px solid var(--nf-border); border-radius: 10px; padding: 16px;">
            <div style="color: var(--nf-gray-muted); font-size: 0.78rem; font-weight: bold; text-transform: uppercase;">SORGULAMA MALİYETİ</div>
            <div style="font-size: 1.8rem; font-weight: 700; color: #00ff88; margin-top: 4px;">1 KREDİ</div>
          </div>
        </div>
      </div>

      <!-- Main Content 2-Column Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;" class="phonebook-layout-grid">
        
        <!-- COLUMN 1: SUBDOMAINS LIST -->
        <div style="background: rgba(24,24,24,0.85); border: 1px solid rgba(255,152,0,0.4); border-radius: 12px; padding: 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="font-size:1.1rem; color:#ff9800; font-weight:bold; display:flex; align-items:center; gap:8px; margin:0;">
              <i class="fa-solid fa-network-wired"></i> Alt Alan Adları (Subdomains)
              <span style="background:rgba(255,152,0,0.2); color:#ff9800; font-size:0.75rem; padding:2px 8px; border-radius:10px;">${totalSubdomains}</span>
            </h3>
            <input type="text" id="subdomainFilterInput" placeholder="Subdomain filtrele..." style="background:#000; border:1px solid #333; color:#fff; border-radius:6px; padding:4px 10px; font-size:0.8rem; outline:none;" onkeyup="filterSubdomainsUI(this.value)">
          </div>

          <div id="subdomainsListContainer" style="display:flex; flex-direction:column; gap:8px; max-height: 500px; overflow-y:auto; padding-right:5px;">
            ${subdomains.length === 0 ? '<div style="color:var(--nf-gray-muted); padding:20px; text-align:center;">Bu domain için alt alan adı kaydı bulunamadı.</div>' : ''}
            ${subdomains.map(sub => {
              const fullUrl = sub.startsWith('http') ? sub : `https://${sub}`;
              return `
                <div class="subdomain-item-row" data-sub="${sub.toLowerCase()}" style="background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 14px; display:flex; justify-content:space-between; align-items:center; transition: all 0.2s;" onmouseover="this.style.borderColor='rgba(255,152,0,0.5)';" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)';">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span style="width:8px; height:8px; border-radius:50%; background:#00ff88; display:inline-block;"></span>
                    <a href="${fullUrl}" target="_blank" style="color: #fff; font-family: monospace; font-size: 0.88rem; text-decoration:none; font-weight:600;" onmouseover="this.style.color='#ff9800';" onmouseout="this.style.color='#fff';">
                      ${sub} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem; color:var(--nf-gray-muted); margin-left:4px;"></i>
                    </a>
                  </div>
                  <button class="action-btn" style="padding: 2px 8px; font-size: 0.72rem; background:rgba(255,255,255,0.1); cursor:pointer;" onclick="navigator.clipboard.writeText('${sub}'); this.innerHTML='<i class=\\'fa-solid fa-check\\'></i>'; setTimeout(() => this.innerHTML='<i class=\\'fa-solid fa-copy\\'></i>', 1500);"><i class="fa-solid fa-copy"></i></button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- COLUMN 2: PHONEBOOK EMAILS & EMPLOYEES -->
        <div style="background: rgba(24,24,24,0.85); border: 1px solid rgba(0,229,255,0.4); border-radius: 12px; padding: 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="font-size:1.1rem; color:#00e5ff; font-weight:bold; display:flex; align-items:center; gap:8px; margin:0;">
              <i class="fa-solid fa-envelope-open-text"></i> Sızmış E-Posta Listesi (Phonebook)
              <span style="background:rgba(0,229,255,0.2); color:#00e5ff; font-size:0.75rem; padding:2px 8px; border-radius:10px;">${totalEmails}</span>
            </h3>
            <input type="text" id="emailFilterInput" placeholder="E-posta filtrele..." style="background:#000; border:1px solid #333; color:#fff; border-radius:6px; padding:4px 10px; font-size:0.8rem; outline:none;" onkeyup="filterEmailsUI(this.value)">
          </div>

          <div id="emailsListContainer" style="display:flex; flex-direction:column; gap:8px; max-height: 500px; overflow-y:auto; padding-right:5px;">
            ${emails.length === 0 ? '<div style="color:var(--nf-gray-muted); padding:20px; text-align:center;">Bu domain için sızmış e-posta adresi kaydı bulunamadı.</div>' : ''}
            ${emails.map(em => {
              const emailStr = typeof em === 'string' ? em : (em.email || em.address || JSON.stringify(em));
              return `
                <div class="email-item-row" data-email="${emailStr.toLowerCase()}" style="background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 14px; display:flex; justify-content:space-between; align-items:center; transition: all 0.2s;" onmouseover="this.style.borderColor='rgba(0,229,255,0.5)';" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)';">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-at" style="color:#00e5ff; font-size:0.85rem;"></i>
                    <span style="color: #fff; font-family: monospace; font-size: 0.88rem; font-weight:600;">${emailStr}</span>
                  </div>
                  <button class="action-btn" style="padding: 2px 8px; font-size: 0.72rem; background:rgba(255,255,255,0.1); cursor:pointer;" onclick="navigator.clipboard.writeText('${emailStr}'); this.innerHTML='<i class=\\'fa-solid fa-check\\'></i>'; setTimeout(() => this.innerHTML='<i class=\\'fa-solid fa-copy\\'></i>', 1500);"><i class="fa-solid fa-copy"></i></button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;

    resultsGrid.innerHTML = html;

    // Attach global helper functions
    window.copySubdomainsList = () => {
      if (subdomains.length === 0) return;
      navigator.clipboard.writeText(subdomains.join('\n'));
      alert(`✅ ${subdomains.length} adet subdomain panoya kopyalandı!`);
    };

    window.copyEmailsList = () => {
      if (emails.length === 0) return;
      const emList = emails.map(em => typeof em === 'string' ? em : (em.email || em.address || ''));
      navigator.clipboard.writeText(emList.join('\n'));
      alert(`✅ ${emList.length} adet e-posta panoya kopyalandı!`);
    };

    window.filterSubdomainsUI = (query) => {
      const q = query.toLowerCase().trim();
      document.querySelectorAll('.subdomain-item-row').forEach(el => {
        const sub = el.getAttribute('data-sub') || '';
        el.style.display = sub.includes(q) ? 'flex' : 'none';
      });
    };

    window.filterEmailsUI = (query) => {
      const q = query.toLowerCase().trim();
      document.querySelectorAll('.email-item-row').forEach(el => {
        const em = el.getAttribute('data-email') || '';
        el.style.display = em.includes(q) ? 'flex' : 'none';
      });
    };
  }

  // Render Full OathNet Dashboard Search Report (Matching Photos 2 & 3 - 100% Live API Data)
  function renderSearchResults(data, query) {
    loadingBox.style.display = 'none';
    resultsGrid.style.display = 'block';

    if (!data || data.success === false) {
      resultsGrid.innerHTML = `
        <div style="text-align: center; color: var(--nf-red); padding: 40px; background: rgba(24,24,24,0.85); border-radius: 12px; border: 1px solid var(--nf-border);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
          <h3>No Intelligence Found or API Error</h3>
          <p style="color: var(--nf-gray-muted); margin-top: 8px;">${data?.message || 'No records matched your target query.'}</p>
        </div>
      `;
      return;
    }

    const payload = data.data || data;
    const stealerLogs = payload.stealer_logs || payload.stealer || payload.results || (Array.isArray(payload) ? payload : []);
    const breaches = payload.breaches || [];
    const ips = payload.ips || [];
    const discordInfo = payload.discord || null;
    const steamInfo = payload.steam || null;
    const xboxInfo = payload.xbox || null;
    const robloxInfo = payload.roblox || null;

    const totalFound = stealerLogs.length + breaches.length + (discordInfo ? 1 : 0) + (steamInfo ? 1 : 0) + (xboxInfo ? 1 : 0) + (robloxInfo ? 1 : 0);

    if (totalFound === 0) {
      resultsGrid.innerHTML = `
        <div style="text-align: center; color: var(--nf-gray-muted); padding: 50px; background: rgba(24,24,24,0.85); border-radius: 12px; border: 1px solid var(--nf-border);">
          <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 15px; color: var(--nf-gray-muted);"></i>
          <h3 style="color: #fff;">No Records Found for "${query}"</h3>
          <p style="color: var(--nf-gray-muted); margin-top: 8px;">No stolen credentials or breach records indexed for this target.</p>
        </div>
      `;
      return;
    }

    let html = `
      <!-- Search Report Header -->
      <div class="report-header-bar" style="background: rgba(24,24,24,0.85); border: 1px solid var(--nf-border); border-radius: 12px; padding: 22px; margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <div>
            <h2 style="font-size: 1.5rem; color: #fff; display: flex; align-items: center; gap: 10px;">
              <i class="fa-solid fa-file-contract" style="color: var(--nf-red);"></i> Search Report
            </h2>
            <p style="color: var(--nf-gray-muted); font-size: 0.88rem; margin-top: 4px;">Information found for "${query}"</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="action-btn" onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(payload).replace(/"/g, '&quot;')}))"><i class="fa-solid fa-copy"></i> Copy Raw JSON</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
          <div style="background: rgba(0,0,0,0.5); border: 1px solid var(--nf-border); border-radius: 10px; padding: 18px;">
            <div style="color: var(--nf-gray-muted); font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">TOTAL FOUND</div>
            <div style="font-size: 2rem; font-weight: 700; color: #fff; margin-top: 5px;">${totalFound}</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); border: 1px solid var(--nf-border); border-radius: 10px; padding: 18px;">
            <div style="color: var(--nf-gray-muted); font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">SECURITY BREACHES</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--nf-red); margin-top: 5px;">${breaches.length}</div>
          </div>
          <div style="background: rgba(0,0,0,0.5); border: 1px solid var(--nf-border); border-radius: 10px; padding: 18px;">
            <div style="color: var(--nf-gray-muted); font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">STOLEN INFORMATION</div>
            <div style="font-size: 2rem; font-weight: 700; color: #ff9800; margin-top: 5px;">${stealerLogs.length}</div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Layout: Left Sidebar + Right Center Content -->
      <div style="display: grid; grid-template-columns: 360px 1fr; gap: 25px;" class="report-layout-grid">
        
        <!-- LEFT SIDEBAR: Live Activity Log Console + OSINT Widgets -->
        <div class="report-sidebar" style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- CANLI AKTİVİTE & İŞLEM LOGLARI WIDGET (LEFT SIDEBAR) -->
          <div style="background: rgba(24,24,24,0.85); border: 1px solid #00ff88; border-radius: 12px; padding: 20px; ${currentMode === 'cc_sikici' || currentMode === 'cc_formatter' || currentMode === 'cc_dumper' ? '' : 'display:none;'}" id="leftLiveLogWidget">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h3 style="font-size:1.05rem; color:#00ff88; font-weight:bold; display:flex; align-items:center; gap:8px; margin:0;">
                <i class="fa-solid fa-terminal"></i> Canlı İşlem Logları
              </h3>
              <span style="background:rgba(0,255,136,0.15); color:#00ff88; padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:bold;">CANLI STREAM</span>
            </div>
            <div id="ccLiveLogBox" style="width:100%; height:340px; background:#050505; color:#00ff88; border:1px solid rgba(0,255,136,0.3); border-radius:8px; padding:12px; font-family:monospace; font-size:0.78rem; overflow-y:auto; line-height:1.6;">
              <div style="color:#888;">[SYSTEM] Otonom CC Sikici Harvester hazır. Log araması bekleniyor...</div>
            </div>
          </div>

          <!-- IP Intelligence Widget -->
          ${ips.length > 0 ? `
            <div style="background: rgba(24,24,24,0.85); border: 1px solid var(--nf-border); border-radius: 12px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="font-size: 1.05rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <i class="fa-solid fa-globe" style="color: #2196F3;"></i> IP Intelligence
                </h3>
                <span style="background: #333; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">${ips.length} IPs</span>
              </div>

              ${ips.map(ip => `
                <div style="background: rgba(0,0,0,0.6); border: 1px solid var(--nf-border); border-radius: 10px; padding: 14px; margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: 700; color: #2196F3; font-size: 0.95rem;"><i class="fa-solid fa-wifi"></i> ${ip.ip || ip}</div>
                    <button class="action-btn" style="padding: 2px 8px; font-size: 0.75rem;"><i class="fa-solid fa-map-pin"></i> Map</button>
                  </div>
                  ${ip.country ? `<div style="color: #fff; font-size: 0.85rem; font-weight: 600; margin-top: 8px;">📍 ${ip.city ? ip.city + ', ' : ''}${ip.country}</div>` : ''}
                  ${ip.isp ? `<div style="color: var(--nf-gray-muted); font-size: 0.8rem; margin-top: 2px;">🌐 ISP: ${ip.isp}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Discord Profiles Widget -->
          ${discordInfo ? `
            <div style="background: rgba(24,24,24,0.85); border: 1px solid var(--nf-border); border-radius: 12px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="font-size: 1.05rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <i class="fa-brands fa-discord" style="color: #5865F2;"></i> Discord Profiles
                </h3>
                <span style="background: #333; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">1 profile</span>
              </div>

              <div style="background: rgba(0,0,0,0.6); border: 1px solid var(--nf-border); border-radius: 10px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
                  <img src="${discordInfo.avatar ? `https://cdn.discordapp.com/avatars/${discordInfo.id}/${discordInfo.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}" style="width: 48px; height: 48px; border-radius: 50%;" alt="Avatar">
                  <div>
                    <div style="font-weight: 700; color: #fff; font-size: 1rem;">${discordInfo.global_name || discordInfo.username || 'User'}</div>
                    <div style="color: var(--nf-gray-muted); font-size: 0.8rem;">@${discordInfo.username || 'user'}</div>
                  </div>
                </div>
                <div style="color: var(--nf-gray-muted); font-size: 0.8rem; margin-bottom: 8px;">
                  # ${discordInfo.id || query} ${discordInfo.created_at ? '&bull; ' + discordInfo.created_at : ''}
                </div>
                <a href="https://discord.com/users/${discordInfo.id || query}" target="_blank" class="action-btn" style="display: inline-block; width: 100%; text-align: center; text-decoration: none; font-size: 0.82rem;">
                  <i class="fa-solid fa-up-right-from-square"></i> View Discord Profile
                </a>
              </div>
            </div>
          ` : ''}

          <!-- Steam Profiles Widget -->
          ${steamInfo ? `
            <div style="background: rgba(24,24,24,0.85); border: 1px solid var(--nf-border); border-radius: 12px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="font-size: 1.05rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <i class="fa-brands fa-steam" style="color: #c7d5e0;"></i> Steam Profile
                </h3>
              </div>
              <div style="background: rgba(0,0,0,0.6); border: 1px solid var(--nf-border); border-radius: 10px; padding: 16px;">
                <div style="font-weight: 700; color: #fff; font-size: 1rem; margin-bottom: 8px;">${steamInfo.personaname || 'Unknown'}</div>
                <div style="color: var(--nf-gray-muted); font-size: 0.8rem; margin-bottom: 12px;">SteamID: ${steamInfo.steamid || query}</div>
                <a href="${steamInfo.profileurl || 'https://steamcommunity.com/profiles/' + (steamInfo.steamid || query)}" target="_blank" class="action-btn" style="display: inline-block; width: 100%; text-align: center; text-decoration: none; font-size: 0.82rem;">
                  <i class="fa-solid fa-up-right-from-square"></i> View Steam Profile
                </a>
              </div>
            </div>
          ` : ''}

          <!-- Xbox Profiles Widget -->
          ${xboxInfo ? `
            <div style="background: rgba(24,24,24,0.85); border: 1px solid var(--nf-border); border-radius: 12px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="font-size: 1.05rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <i class="fa-brands fa-xbox" style="color: #107C10;"></i> Xbox Profile
                </h3>
              </div>
              <div style="background: rgba(0,0,0,0.6); border: 1px solid var(--nf-border); border-radius: 10px; padding: 16px;">
                <div style="font-weight: 700; color: #fff; font-size: 1rem; margin-bottom: 8px;">${xboxInfo.gamertag || 'Unknown'}</div>
                <div style="color: var(--nf-gray-muted); font-size: 0.8rem; margin-bottom: 12px;">XUID: ${xboxInfo.xuid || query}</div>
              </div>
            </div>
          ` : ''}

          <!-- Roblox Profiles Widget -->
          ${robloxInfo ? `
            <div style="background: rgba(24,24,24,0.85); border: 1px solid var(--nf-border); border-radius: 12px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="font-size: 1.05rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <i class="fa-solid fa-cube" style="color: #E2231A;"></i> Roblox Profile
                </h3>
              </div>
              <div style="background: rgba(0,0,0,0.6); border: 1px solid var(--nf-border); border-radius: 10px; padding: 16px;">
                <div style="font-weight: 700; color: #fff; font-size: 1rem; margin-bottom: 8px;">${robloxInfo.name || 'Unknown'}</div>
                <div style="color: var(--nf-gray-muted); font-size: 0.8rem; margin-bottom: 12px;">ID: ${robloxInfo.id || query}</div>
                <a href="https://www.roblox.com/users/${robloxInfo.id || query}/profile" target="_blank" class="action-btn" style="display: inline-block; width: 100%; text-align: center; text-decoration: none; font-size: 0.82rem;">
                  <i class="fa-solid fa-up-right-from-square"></i> View Roblox Profile
                </a>
              </div>
            </div>
          ` : ''}

        </div>

        <!-- RIGHT CENTER CONTENT: Stolen Information & Data Breaches -->
        <div class="report-content" style="display: flex; flex-direction: column; gap: 25px;">
          
          <!-- STOLEN INFORMATION SECTION -->
            <div style="background: rgba(24,24,24,0.85); border: 1px solid var(--nf-border); border-radius: 12px; padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap:wrap; gap:15px;">
                <h3 style="font-size: 1.2rem; color: #fff; display: flex; align-items: center; gap: 10px;">
                  <i class="fa-solid fa-triangle-exclamation" style="color: #ff9800;"></i> Stolen Information (${stealerLogs.length})
                </h3>
                <div style="display: flex; gap: 10px; align-items:center;">
                  <input type="text" id="massFileSearchInput" placeholder="Mass Search Files (e.g. credit)" style="padding: 8px 14px; border-radius: 6px; border: 1px solid var(--nf-border); background: rgba(0,0,0,0.8); color: #fff; font-size: 0.85rem; width: 240px; outline:none; font-family:monospace;">
                  <button id="massFileSearchBtn" class="action-btn" style="background:#ff9800; color:#000; font-weight:bold; border:none;"><i class="fa-solid fa-search"></i> Search All Logs</button>
                  <button class="action-btn"><i class="fa-solid fa-download"></i> Bulk Export</button>
                  <button class="action-btn"><i class="fa-solid fa-bell"></i> Make Scanner</button>
                </div>
              </div>
              
              <!-- Mass Search Progress -->
              <div id="massSearchProgress" style="display:none; background: rgba(0,0,0,0.6); padding:15px; border-radius:8px; margin-bottom:20px; color:#fff; font-size:0.85rem; border:1px solid rgba(255,152,0,0.4);">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                  <span id="massSearchStatusText"><i class="fa-solid fa-circle-notch fa-spin"></i> Scanning ${stealerLogs.length} logs for matching files...</span>
                  <span id="massSearchCount" style="font-family:monospace; font-weight:bold; color:var(--nf-red);">0 / ${stealerLogs.length}</span>
                </div>
                <div style="width:100%; background:rgba(255,255,255,0.1); height:6px; border-radius:3px; overflow:hidden;">
                  <div id="massSearchProgressBar" style="width:0%; height:100%; background:#ff9800; transition:width 0.2s;"></div>
                </div>
              </div>

              <!-- AUTOMATED CC SİKİCİ HARVESTER BOX -->
              <div id="ccDumpHarvestBox" style="background: rgba(0, 255, 136, 0.06); border: 1px solid #00ff88; border-radius: 12px; padding: 20px; margin-bottom: 25px; ${currentMode === 'cc_sikici' || currentMode === 'cc_formatter' || currentMode === 'cc_dumper' ? '' : 'display:none;'}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
                  <h4 style="color:#00ff88; font-size:1.1rem; font-weight:bold; display:flex; align-items:center; gap:10px; margin:0;">
                    <i class="fa-brands fa-cc-visa" style="font-size:1.4rem;"></i> CC SİKİCİ AUTOMATED HARVESTER
                    <span id="ccHarvestCountBadge" style="background:#00ff88; color:#000; padding:2px 10px; border-radius:12px; font-size:0.78rem; font-weight:bold;">0 Cards Found</span>
                  </h4>
                  <div style="display:flex; gap:10px;">
                    <button id="btnFormatAllCc" class="action-btn" style="background:#00e5ff; color:#000; font-weight:bold; border:none; font-size:0.82rem; padding:6px 14px; cursor:pointer;">
                      <i class="fa-solid fa-wand-magic"></i> Auto-Format (| Format)
                    </button>
                    <button id="btnCopyAllCc" class="action-btn" style="background:#00ff88; color:#000; font-weight:bold; border:none; font-size:0.82rem; padding:6px 14px; cursor:pointer;">
                      <i class="fa-solid fa-copy"></i> Copy All Cards (.txt)
                    </button>
                    <button id="btnDownloadAllCc" class="action-btn" style="background:rgba(255,255,255,0.15); color:#fff; font-size:0.82rem; padding:6px 14px; cursor:pointer;">
                      <i class="fa-solid fa-download"></i> Download (.txt)
                    </button>
                  </div>
                </div>
                <div style="color:var(--nf-gray-muted); font-size:0.82rem; margin-bottom:10px;" id="ccHarvestStatusText">
                  <i class="fa-solid fa-circle-notch fa-spin"></i> Auto-scanning all ${stealerLogs.length} logs & extracting CreditCards/*.txt files (0 Extra Credits)...
                </div>
                
                <!-- EXTRACTED CREDIT CARDS RESULT TEXTAREA (FULL WIDTH) -->
                <textarea id="ccHarvestTextArea" readonly style="width:100%; height:260px; background:#0a0a0a; color:#00ff88; border:1px solid #333; border-radius:8px; padding:14px; font-family:monospace; font-size:0.85rem; outline:none; resize:vertical;" placeholder="Collecting credit card details from all victim CreditCards/*.txt files..."></textarea>
              </div>

            <!-- Stealer Log Card -->
            ${stealerLogs.length > 0 ? stealerLogs.map(log => {
              const logId = log.log_id || log.id || '';
              // Check if indexed within last 7 days → show NEW DATA badge
              const isNew = log.indexed_at && ((Date.now() - new Date(log.indexed_at).getTime()) < 7 * 24 * 60 * 60 * 1000);
              const pwDate = log.pwned_at ? log.pwned_at.substring(0,10) : '';
              const idxDate = log.indexed_at ? log.indexed_at.substring(0,10) : '';
              return `
              <div id="log-card-${logId}" class="stealer-log-card" style="background: rgba(0,0,0,0.6); border: 1px solid ${isNew ? 'rgba(255,152,0,0.4)' : 'var(--nf-border)'}; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: var(--nf-red); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: bold;">
                      🔥 STEALER LOG
                    </span>
                    <span style="color: var(--nf-gray-muted); font-size: 0.82rem;">Credential matched search</span>
                    ${isNew ? `<span style="background: linear-gradient(135deg, #ff9800, #ff5722); color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: bold; letter-spacing: 0.03em;">⚡ NEW DATA</span>` : ''}
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                    ${pwDate ? `<span style="color: var(--nf-red); font-size: 0.78rem; font-weight: 600;">📅 ${pwDate}</span>` : ''}
                    ${idxDate ? `<span style="color: var(--nf-gray-muted); font-size: 0.75rem;">🗃 ${idxDate}</span>` : ''}
                  </div>
                </div>

                <div style="color: #fff; font-weight: 700; font-size: 1.05rem; margin-bottom: 14px; word-break: break-all;">
                  ${log.url ? `
                    <a href="${log.url}" target="_blank" style="color: #fff; text-decoration: none;">
                      ${log.url} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8rem; color: var(--nf-gray-muted);"></i>
                    </a>
                  ` : 'URL N/A'}
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
                  <div style="background: rgba(20,20,20,0.9); padding: 14px; border-radius: 8px; border: 1px solid #333;">
                    <div style="color: var(--nf-gray-muted); font-size: 0.78rem; font-weight: bold;">USERNAME</div>
                    <div style="color: #fff; font-weight: 600; font-size: 1rem; margin-top: 4px; word-break: break-all;">${log.username || log.email || 'N/A'}</div>
                  </div>
                  <div style="background: rgba(20,20,20,0.9); padding: 14px; border-radius: 8px; border: 1px solid #333;">
                    <div style="color: var(--nf-gray-muted); font-size: 0.78rem; font-weight: bold;">PASSWORD</div>
                    <div style="color: var(--nf-red); font-weight: 700; font-size: 1rem; margin-top: 4px; word-break: break-all;">${log.password || 'N/A'}</div>
                  </div>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 15px;">
                  <button class="action-btn btn-source-files" data-logid="${logId}" style="padding: 8px 16px; font-size: 0.85rem;">
                    <i class="fa-solid fa-folder-open"></i> Source Files
                  </button>
                  <a href="api_handler.php?action=download_victim_archive&log_id=${logId}&search_id=${currentSearchId}" class="action-btn" style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-download"></i> Download (.zip)
                  </a>
                  <button class="action-btn btn-open-victim" data-logid="${logId}" style="padding: 8px 16px; font-size: 0.85rem;">
                    <i class="fa-solid fa-user-ninja"></i> Open Victim
                  </button>
                </div>

                <!-- Manifest container: starts empty, filled on click -->
                <div class="file-manifest-container hidden" id="manifest-${logId}" style="margin-top: 15px; background: rgba(0,0,0,0.8); border: 1px solid var(--nf-border); border-radius: 8px; padding: 16px;"></div>
              </div>
            `;
            }).join('') : `
              <div style="color: var(--nf-gray-muted); text-align: center; padding: 25px;">No stolen credentials found for this target.</div>
            `}
          </div>

          <!-- DATA BREACHES SECTION -->
          <div style="background: rgba(24,24,24,0.85); border: 1px solid var(--nf-border); border-radius: 12px; padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 style="font-size: 1.2rem; color: #fff; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-shield-virus" style="color: var(--nf-red);"></i> Data Breaches (${breaches.length})
              </h3>
            </div>

            <!-- Breach Cards -->
            ${breaches.length > 0 ? breaches.map(b => `
              <div style="background: rgba(0,0,0,0.6); border: 1px solid var(--nf-border); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: var(--nf-red); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: bold;">
                      🛡️ BREACH
                    </span>
                    <span style="color: var(--nf-gray-muted); font-size: 0.82rem;">${b.import_id || b.id || ''}</span>
                  </div>
                  <div style="display: flex; gap: 10px;">
                    <button class="action-btn" onclick="navigator.clipboard.writeText('${b.username || ''} | ${query}')"><i class="fa-solid fa-copy"></i> Copy All</button>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                  <div style="background: rgba(20,20,20,0.9); padding: 14px; border-radius: 8px; border: 1px solid #333;">
                    <div style="color: var(--nf-gray-muted); font-size: 0.78rem; font-weight: bold;">USERNAME</div>
                    <div style="color: #fff; font-weight: 600; font-size: 1rem; margin-top: 4px;">${b.username || 'N/A'}</div>
                  </div>
                  <div style="background: rgba(20,20,20,0.9); padding: 14px; border-radius: 8px; border: 1px solid #333;">
                    <div style="color: var(--nf-gray-muted); font-size: 0.78rem; font-weight: bold;">DISCORDID</div>
                    <div style="color: #fff; font-weight: 600; font-size: 1rem; margin-top: 4px;">${b.discordid || query}</div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                  <div style="background: rgba(20,20,20,0.9); padding: 14px; border-radius: 8px; border: 1px solid #333;">
                    <div style="color: var(--nf-gray-muted); font-size: 0.78rem; font-weight: bold;">DBNAME</div>
                    <div style="color: var(--nf-gray-light); font-size: 0.95rem; margin-top: 4px;">${b.dbname || 'N/A'}</div>
                  </div>
                  <div style="background: rgba(20,20,20,0.9); padding: 14px; border-radius: 8px; border: 1px solid #333;">
                    <div style="color: var(--nf-gray-muted); font-size: 0.78rem; font-weight: bold;">IMPORT ID</div>
                    <div style="color: var(--nf-gray-light); font-size: 0.95rem; margin-top: 4px;">${b.import_id || b.id || 'N/A'}</div>
                  </div>
                </div>

                ${b.indexed_at ? `
                  <div style="color: var(--nf-gray-muted); font-size: 0.8rem; margin-top: 14px;">
                    INDEXED AT: ${b.indexed_at}
                  </div>
                ` : ''}
              </div>
            `) : `
              <div style="color: var(--nf-gray-muted); text-align: center; padding: 25px;">No breach records found for this target.</div>
            `}
          </div>

        </div>
      </div>
    `;

    resultsGrid.innerHTML = html;

    // Attach click handlers for Source Files toggle - LIVE API
    document.querySelectorAll('.btn-source-files').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const logId = btn.getAttribute('data-logid');
        const container = document.getElementById(`manifest-${logId}`);
        if (!container) return;
        if (!container.classList.contains('hidden')) {
          container.classList.add('hidden');
          return;
        }
        container.classList.remove('hidden');
        // If already loaded (has real tree), don't reload
        if (container.getAttribute('data-loaded') === '1') return;
        // Show spinner immediately while fetching
        container.innerHTML = `<div style="color:var(--nf-gray-muted); font-size:0.82rem; text-align:center; padding:20px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading file manifest from OathNet...</div>`;
        try {
          const manifestCache = window.manifestCache || (window.manifestCache = new Map());
          let tree = manifestCache.get(logId);

          if (!tree) {
            const fd = new FormData();
            fd.append('action', 'get_victim_manifest');
            fd.append('log_id', logId);
            fd.append('search_id', currentSearchId);
            const res = await fetch('api_handler.php', { method: 'POST', body: fd });
            const json = await res.json();
            tree = json.victim_tree;
            if (tree) manifestCache.set(logId, tree);
          }
          if (!tree) throw new Error('No file tree returned');
          container.setAttribute('data-loaded', '1');
          // Count total files recursively
          function countNodes(node) {
            if (node.type === 'file') return 1;
            return (node.children || []).reduce((s, c) => s + countNodes(c), 0);
          }
          const totalFiles = countNodes(tree);
          function fmtBytes(b) {
            if (!b) return '';
            if (b < 1024) return b + 'B';
            if (b < 1048576) return (b/1024).toFixed(1) + 'KB';
            return (b/1048576).toFixed(2) + 'MB';
          }
          function renderTreeHtml(node, depth) {
            const indent = depth * 18;
            const isDir = node.type === 'directory';
            const icon = isDir ? '📁' : '📄';
            const color = isDir ? '#fff' : ((node.name || '').toLowerCase().includes('password') ? 'var(--nf-red)' : 'var(--nf-gray-light)');
            const size = !isDir && node.size_bytes ? `<span style="float:right; color:var(--nf-gray-muted); font-size:0.75rem;">${fmtBytes(node.size_bytes)}</span>` : '';
            const childCount = isDir ? `<span style="color:var(--nf-gray-muted); font-size:0.8rem;"> (${(node.children||[]).length})</span>` : '';
            const fileId = node.id || node.relative_path || node.path || node.name || '';
            const fileOnClick = !isDir ? `data-logid="${logId}" data-fileid="${encodeURIComponent(fileId)}" data-filename="${encodeURIComponent(node.name || '')}" onclick="window.handleTreeFileClick(this)" style="cursor:pointer;" class="tree-file-item"` : '';
            const hoverStyle = !isDir ? `onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'"` : '';
            let html = `<div ${fileOnClick} ${hoverStyle} style="padding-left:${indent}px; color:${color}; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.03); padding-top:4px; padding-bottom:4px; border-radius:4px; transition: background 0.2s;" data-name="${(node.name || '').toLowerCase()}" class="tree-node-item">
              <span>${icon} ${node.name || 'Unknown'}${childCount}</span>${size}
            </div>`;
            if (isDir && node.children) {
              html += node.children.map(c => renderTreeHtml(c, depth + 1)).join('');
            }
            return html;
          }
          container.innerHTML = `
            <div style="font-weight:bold; color:var(--nf-gray-muted); font-size:0.82rem; margin-bottom:10px;">
              <i class="fa-solid fa-folder-tree"></i> STEALER VICTIM FILE MANIFEST — ${totalFiles} files
            </div>
            <div style="font-family:monospace; font-size:0.83rem; line-height:1.7; max-height:350px; overflow-y:auto;" class="tree-container">
              ${renderTreeHtml(tree, 0)}
            </div>
          `;
        } catch(err) {
          container.innerHTML = `<div style="color:var(--nf-red); padding:10px;">Error loading manifest: ${err.message}</div>`;
        }
      });
    });

    // Attach click handlers for Open Victim Modal - LIVE API
    document.querySelectorAll('.btn-open-victim').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const logId = btn.getAttribute('data-logid');
        await openVictimModal(logId);
      });
    });

    // Trigger CC SİKİCİ auto-harvesting instantly for all stealer logs!
    if (stealerLogs.length > 0) {
      startAutomaticCardHarvesting(stealerLogs);
    }

    // Auto-load all Source Files in fast parallel batches
    setTimeout(() => {
      document.querySelectorAll('.btn-source-files').forEach((btn, idx) => {
        // Process 30 manifest trees every 100ms for max speed
        setTimeout(() => {
           const manifestElem = document.getElementById(`manifest-${btn.getAttribute('data-logid')}`);
           if (manifestElem && manifestElem.classList.contains('hidden')) {
              btn.click();
           }
        }, Math.floor(idx / 30) * 100); 
      });
    }, 100);

    // --- GLOBAL MASS FILE SEARCH LOGIC (REAL-TIME DOM FILTER) ---
    const massSearchBtn = document.getElementById('massFileSearchBtn');
    const massSearchInput = document.getElementById('massFileSearchInput');
    const massSearchProgress = document.getElementById('massSearchProgress');
    
    if (massSearchInput) {
      // Hide the old progress bar since we do this instantly in DOM now
      if(massSearchProgress) massSearchProgress.style.display = 'none';

      massSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        document.querySelectorAll('.stealer-log-card').forEach(card => {
          if (!query) {
             card.style.display = 'block';
             card.querySelectorAll('.tree-node-item').forEach(item => item.style.display = 'flex');
             return;
          }
          
          let cardHasMatch = false;
          card.querySelectorAll('.tree-node-item').forEach(item => {
             const fileName = item.getAttribute('data-name') || '';
             if (fileName.includes(query)) {
                item.style.display = 'flex';
                cardHasMatch = true;
             } else {
                item.style.display = 'none';
             }
          });
          
          if (cardHasMatch) {
             card.style.display = 'block';
          } else {
             card.style.display = 'none';
          }
        });
      });
    }
  }

  // Open Victim Full Modal Viewer - 100% Live OathNet victim_tree + summary data
  async function openVictimModal(logId) {
    if (!detailModal) return;
    modalTitle.textContent = `VICTIM LOG: ${logId.substring(0, 24)}...`;
    modalBody.innerHTML = `<div style="text-align:center; padding:60px; color:var(--nf-gray-muted);"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem;"></i><p style="margin-top:15px;">Fetching live victim data from OathNet...</p></div>`;
    detailModal.classList.add('active');
    try {
      // Fetch both manifest (victim_tree) and summary in parallel
      const [mRes, sRes] = await Promise.all([
        fetch('api_handler.php', { method: 'POST', body: (() => { const f = new FormData(); f.append('action','get_victim_manifest'); f.append('log_id',logId); f.append('search_id', currentSearchId); return f; })() }),
        fetch('api_handler.php', { method: 'POST', body: (() => { const f = new FormData(); f.append('action','get_victim_summary'); f.append('log_id',logId); f.append('search_id', currentSearchId); return f; })() })
      ]);
      const mJson = await mRes.json();
      const sJson = await sRes.json();
      const tree = mJson.victim_tree;
      const s = sJson.data || sJson;
      // Count total files in tree
      function countFiles(node) {
        if (node.type === 'file') return 1;
        return (node.children || []).reduce((sum, c) => sum + countFiles(c), 0);
      }
      function fmtBytes(b) {
        if (!b) return '';
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
        return (b/1048576).toFixed(2) + ' MB';
      }
      function renderTreeHtml(node, depth) {
        const indent = depth * 16;
        const isDir = node.type === 'directory';
        const isPwFile = (node.name || '').toLowerCase().includes('password') || (node.name || '').toLowerCase().includes('token');
        const color = isDir ? '#e0e0e0' : (isPwFile ? 'var(--nf-red)' : 'var(--nf-gray-light)');
        const icon = isDir ? '📁' : '📄';
        const size = !isDir && node.size_bytes ? `<span style="font-size:0.72rem; color:#666; margin-left:8px;">${fmtBytes(node.size_bytes)}</span>` : '';
        const childCount = isDir && node.children?.length ? `<span style="color:var(--nf-gray-muted); font-size:0.75rem;"> (${node.children.length})</span>` : '';
        let html = `<div style="padding-left:${indent}px; padding:4px ${indent}px; color:${color}; display:flex; align-items:center; border-bottom:1px solid rgba(255,255,255,0.04); cursor:${isDir?'pointer':'default'};" title="${node.id || ''}">${icon} <span style="margin-left:6px;">${node.name || 'Unknown'}${childCount}</span>${size}</div>`;
        if (isDir && node.children) {
          html += node.children.map(c => renderTreeHtml(c, depth + 1)).join('');
        }
        return html;
      }
      const totalFiles = tree ? countFiles(tree) : 0;
      const treeHtml = tree ? renderTreeHtml(tree, 0) : '<div style="color:var(--nf-gray-muted);">No file tree available</div>';
      // Summary data
      const cookieTotal = s.cookies?.total ?? 0;
      const cookieDomains = s.domains?.unique ?? 0;
      const cookieSession = s.cookies?.session ?? 0;
      const topDomains = s.domains?.top ?? [];
      const cardFields = s.cards?.fields ?? 0;
      const arts = s.artifacts ?? {};
      modalBody.innerHTML = `
        <div style="background:rgba(10,10,10,0.98); border-radius:12px; padding:24px; color:#fff;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--nf-border); padding-bottom:14px; margin-bottom:18px;">
            <div>
              <div style="font-size:1rem; font-weight:bold; color:var(--nf-red); font-family:monospace; word-break:break-all; font-size:0.88rem;">${logId}</div>
              <div style="color:var(--nf-gray-muted); font-size:0.8rem; margin-top:4px;">Malware Theft Manifest &bull; ${totalFiles} files</div>
            </div>
            <a href="api_handler.php?action=download_victim_archive&log_id=${logId}&search_id=${currentSearchId}" class="action-btn" style="text-decoration:none; flex-shrink:0; font-size:0.82rem; padding:8px 14px;">
              <i class="fa-solid fa-download"></i> Download Archive
            </a>
          </div>
          <!-- Tabs -->
          <div style="display:flex; gap:18px; border-bottom:1px solid var(--nf-border); padding-bottom:10px; margin-bottom:18px; overflow-x:auto;">
            <span style="color:#fff; font-weight:bold; font-size:0.88rem; border-bottom:2px solid var(--nf-red); padding-bottom:8px; white-space:nowrap;">Files (${totalFiles})</span>
            <span style="color:var(--nf-gray-muted); font-size:0.88rem; white-space:nowrap;">Cookies (${cookieTotal.toLocaleString()})</span>
            <span style="color:var(--nf-gray-muted); font-size:0.88rem; white-space:nowrap;">Domains (${cookieDomains})</span>
            ${cardFields > 0 ? `<span style="color:var(--nf-gray-muted); font-size:0.88rem; white-space:nowrap;">Cards (${cardFields})</span>` : ''}
            ${arts.discord ? `<span style="color:#5865F2; font-size:0.88rem; white-space:nowrap; font-weight:bold;">Discord ✓</span>` : ''}
            ${arts.steam ? `<span style="color:#c7d5e0; background:#1b2838; border-radius:4px; padding:0 8px; font-size:0.88rem; white-space:nowrap;">Steam ✓</span>` : ''}
          </div>
          <!-- Split View: File Tree (left) + Stats (right) -->
          <div style="display:grid; grid-template-columns:260px 1fr; gap:16px; min-height:380px;">
            <!-- Left: Real File Tree from victim_tree -->
            <div style="background:rgba(0,0,0,0.7); border:1px solid var(--nf-border); border-radius:8px; overflow:hidden; display:flex; flex-direction:column;">
              <div style="padding:10px 14px; font-size:0.75rem; font-weight:bold; color:var(--nf-gray-muted); border-bottom:1px solid var(--nf-border);">FILE BROWSER — ${totalFiles} files</div>
              <div style="flex:1; overflow-y:auto; font-family:monospace; font-size:0.82rem;">${treeHtml}</div>
            </div>
            <!-- Right: Cookie Stats -->
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div style="background:rgba(0,0,0,0.6); border:1px solid var(--nf-border); border-radius:8px; padding:16px;">
                <div style="font-size:0.78rem; font-weight:bold; color:var(--nf-gray-muted); margin-bottom:12px; letter-spacing:0.05em;">🍪 COOKIE INTELLIGENCE</div>
                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:14px;">
                  <div style="text-align:center; background:rgba(255,255,255,0.04); border-radius:8px; padding:12px 6px;">
                    <div style="font-size:1.5rem; font-weight:bold; color:#fff;">${cookieTotal.toLocaleString()}</div>
                    <div style="font-size:0.72rem; color:var(--nf-gray-muted); margin-top:4px;">TOTAL</div>
                  </div>
                  <div style="text-align:center; background:rgba(255,255,255,0.04); border-radius:8px; padding:12px 6px;">
                    <div style="font-size:1.5rem; font-weight:bold; color:#4caf50;">${cookieSession}</div>
                    <div style="font-size:0.72rem; color:var(--nf-gray-muted); margin-top:4px;">SESSION</div>
                  </div>
                  <div style="text-align:center; background:rgba(255,255,255,0.04); border-radius:8px; padding:12px 6px;">
                    <div style="font-size:1.5rem; font-weight:bold; color:#2196F3;">${cookieDomains}</div>
                    <div style="font-size:0.72rem; color:var(--nf-gray-muted); margin-top:4px;">DOMAINS</div>
                  </div>
                </div>
                ${topDomains.length > 0 ? `
                  <div style="font-size:0.75rem; color:var(--nf-gray-muted); margin-bottom:8px; letter-spacing:0.05em;">TOP DOMAINS</div>
                  ${topDomains.slice(0,8).map(td => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                      <span style="font-size:0.82rem; color:#fff;">${td.domain}</span>
                      <span style="font-size:0.78rem; color:var(--nf-gray-muted); background:rgba(255,255,255,0.06); border-radius:4px; padding:1px 7px;">${td.count}</span>
                    </div>
                  `).join('')}
                ` : '<div style="color:var(--nf-gray-muted); font-size:0.82rem;">No domain data available</div>'}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch(err) {
      modalBody.innerHTML = `<div style="color:var(--nf-red); padding:20px;">Error: ${err.message}</div>`;
    }
    detailModal.classList.add('active');
  }

  // Open Detail Modal
  function openDetailModal(data, title = "INTELLIGENCE RECORD DETAILS") {
    if (!detailModal) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = `<pre style="background: #000; padding: 16px; border-radius: 8px; color: #00ff66; overflow-x: auto; font-family: monospace; font-size: 0.88rem;">${JSON.stringify(data, null, 2)}</pre>`;
    detailModal.classList.add('active');
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      detailModal.classList.remove('active');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      detailModal.classList.remove('active');
    }
  });

  // ==========================================
  // Netflix-Themed Music Player Logic
  // ==========================================
  
  const nfMusicPlayer = document.getElementById('nfMusicPlayer');
  const nfAudioPlayer = document.getElementById('nfAudioPlayer');
  const nfMusicTitle = document.getElementById('nfMusicTitle');
  const btnMusicPlay = document.getElementById('btnMusicPlay');
  const btnMusicPrev = document.getElementById('btnMusicPrev');
  const btnMusicNext = document.getElementById('btnMusicNext');
  const btnMusicToggle = document.getElementById('btnMusicToggle');
  const nfMusicTracklist = document.getElementById('nfMusicTracklist');
  const nfMusicProgress = document.getElementById('nfMusicProgress');
  const nfMusicProgressContainer = document.getElementById('nfMusicProgressContainer');
  const musicVolume = document.getElementById('musicVolume');
  
  if (musicVolume && nfAudioPlayer) {
    musicVolume.addEventListener('input', (e) => {
      nfAudioPlayer.volume = e.target.value;
    });
  }
  
  let currentTrackIndex = 0;
  let trackList = [];
  let isPlaying = false;
  
  async function initMusicPlayer() {
    if (!nfMusicPlayer) return;
    try {
      const fd = new FormData();
      fd.append('action', 'get_music_list');
      const res = await fetch('/api/handler', { method: 'POST', body: fd });
      const data = await res.json();
  
      if (data.success && data.data && data.data.length > 0) {
        trackList = data.data;
        renderTracklist();
        loadTrack(0);
        nfMusicPlayer.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Failed to init music player', err);
    }
  }
  
  function loadTrack(index) {
    if (index < 0 || index >= trackList.length) return;
    currentTrackIndex = index;
    const track = trackList[index];
    if (nfMusicTitle) nfMusicTitle.textContent = track.name;
    if (nfAudioPlayer) nfAudioPlayer.src = track.path;
    updateTracklistActiveState();
    if (isPlaying && nfAudioPlayer) {
      nfAudioPlayer.play();
    }
  }
  
  function togglePlay() {
    if (!nfAudioPlayer || !btnMusicPlay) return;
    if (isPlaying) {
      nfAudioPlayer.pause();
      btnMusicPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
      nfAudioPlayer.play();
      btnMusicPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
    isPlaying = !isPlaying;
  }
  
  function nextTrack() {
    let next = currentTrackIndex + 1;
    if (next >= trackList.length) next = 0;
    loadTrack(next);
    if (!isPlaying) togglePlay();
  }
  
  function prevTrack() {
    let prev = currentTrackIndex - 1;
    if (prev < 0) prev = trackList.length - 1;
    loadTrack(prev);
    if (!isPlaying) togglePlay();
  }
  
  function renderTracklist() {
    if (!nfMusicTracklist) return;
    nfMusicTracklist.innerHTML = '';
    trackList.forEach((track, idx) => {
      const div = document.createElement('div');
      div.className = 'nf-track-item';
      div.innerHTML = `<i class="fa-solid fa-music"></i> ${track.name}`;
      div.addEventListener('click', () => {
        loadTrack(idx);
        if (!isPlaying) togglePlay();
        nfMusicTracklist.classList.add('hidden');
      });
      nfMusicTracklist.appendChild(div);
    });
  }
  
  function updateTracklistActiveState() {
    if (!nfMusicTracklist) return;
    const items = nfMusicTracklist.querySelectorAll('.nf-track-item');
    items.forEach((item, idx) => {
      if (idx === currentTrackIndex) item.classList.add('active');
      else item.classList.remove('active');
    });
  }
  
  // Event Listeners
  if (btnMusicPlay) btnMusicPlay.addEventListener('click', togglePlay);
  if (btnMusicNext) btnMusicNext.addEventListener('click', nextTrack);
  if (btnMusicPrev) btnMusicPrev.addEventListener('click', prevTrack);
  if (btnMusicToggle) btnMusicToggle.addEventListener('click', () => {
    nfMusicTracklist.classList.toggle('hidden');
  });
  
  if (nfAudioPlayer) {
    nfAudioPlayer.addEventListener('timeupdate', () => {
      if (!nfAudioPlayer.duration) return;
      const percent = (nfAudioPlayer.currentTime / nfAudioPlayer.duration) * 100;
      nfMusicProgress.style.width = percent + '%';
    });
    
    nfAudioPlayer.addEventListener('ended', nextTrack);
  }
  
  if (nfMusicProgressContainer) {
    nfMusicProgressContainer.addEventListener('click', (e) => {
      const rect = nfMusicProgressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = clickX / rect.width;
      if (nfAudioPlayer && nfAudioPlayer.duration) {
        nfAudioPlayer.currentTime = percent * nfAudioPlayer.duration;
      }
    });
  }
  
  // Initialize on load
  setTimeout(initMusicPlayer, 1000);

  // Global functions for inline handlers
  window.handleTreeFileClick = function(el) {
    if (!el) return;
    const logId = el.getAttribute('data-logid') || '';
    const fileId = decodeURIComponent(el.getAttribute('data-fileid') || '');
    const fileName = decodeURIComponent(el.getAttribute('data-filename') || '');
    window.openFilePreview(logId, fileId, fileName);
  };

  window.openFilePreview = async function(logId, fileId, fileName) {
    const previewModal = document.getElementById('filePreviewModal');
    const previewTitle = document.getElementById('filePreviewTitle');
    const previewContent = document.getElementById('filePreviewContent');
    const closeBtn = document.getElementById('closeFilePreviewBtn');
    
    if (!previewModal || !previewTitle || !previewContent) return;

    previewTitle.textContent = fileName || 'File Preview';
    previewContent.innerHTML = '<div style="text-align:center; padding:30px; color:var(--nf-gray-light);"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:1.5rem; margin-bottom:10px;"></i><br>Fetching file content from OathNet...</div>';
    previewModal.classList.add('active');

    if (closeBtn) {
      closeBtn.onclick = () => previewModal.classList.remove('active');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const fd = new FormData();
      fd.append('action', 'get_file_content');
      fd.append('log_id', logId);
      fd.append('file_id', fileId);
      fd.append('search_id', currentSearchId);

      const res = await fetch('/api/handler', { method: 'POST', body: fd, signal: controller.signal });
      clearTimeout(timeoutId);
      
      const json = await res.json();
      
      if (!json.success || (!json.data && !json.content)) {
        previewContent.innerHTML = `<div style="color:var(--nf-red); padding:20px; font-family:sans-serif;"><i class="fa-solid fa-triangle-exclamation" style="font-size:1.5rem; margin-bottom:10px;"></i><br>Error loading file content: ${json.message || 'File not available or empty.'}</div>`;
        return;
      }
      
      const text = json.data?.content || json.content || '[File is empty]';
      previewContent.textContent = text;
    } catch (e) {
      if (e.name === 'AbortError') {
        previewContent.innerHTML = `<div style="color:var(--nf-red); padding:20px; font-family:sans-serif;"><i class="fa-solid fa-clock" style="font-size:1.5rem; margin-bottom:10px;"></i><br>Request timed out. File is taking too long to load on free hosting. Try downloading the ZIP archive directly.</div>`;
      } else {
        previewContent.innerHTML = `<div style="color:var(--nf-red); padding:20px; font-family:sans-serif;"><i class="fa-solid fa-triangle-exclamation" style="font-size:1.5rem; margin-bottom:10px;"></i><br>Failed to fetch file content: ${e.message}</div>`;
      }
    }
  };

  window.executeCCDumper = async function(query) {
    loadingBox.style.display = 'none';
    resultsGrid.style.display = 'grid';
    
    resultsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; background: #141414; border: 1px solid var(--nf-red); padding: 25px; border-radius: 8px;">
        <h2 style="color: var(--nf-red); font-size: 1.5rem; display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <i class="fa-brands fa-cc-visa fa-bounce"></i> CC DUMPER INITIALIZING...
        </h2>
        <div id="ccDumperLog" style="color: #00ff88; font-family: monospace; font-size: 0.95rem; line-height: 1.5; height: 300px; overflow-y: auto; background: #0a0a0a; padding: 15px; border-radius: 4px; border: 1px solid #333;">
          <div>[+] Connecting to OathNet Stealer Database for target: ${query}...</div>
        </div>
      </div>
    `;

    const dumperLog = document.getElementById('ccDumperLog');
    const logMsg = (msg, color = '#00ff88') => {
      const div = document.createElement('div');
      div.style.color = color;
      div.textContent = msg;
      dumperLog.appendChild(div);
      dumperLog.scrollTop = dumperLog.scrollHeight;
    };

    try {
      // 1. Initial Search (Costs 1 Credit)
      const fd = new FormData();
      fd.append('action', 'search_stealer'); // Standard search deducts 1 credit
      fd.append('query', query);
      
      const res = await fetch('/api/handler', { method: 'POST', body: fd });
      const searchData = await res.json();

      if (!searchData.success || !searchData.data || (!searchData.data.results && !searchData.data.items)) {
        logMsg('[-] Search failed or no logs found.', 'var(--nf-red)');
        return;
      }

      currentSearchId = searchData.search_id || '';
      const logs = searchData.data.results || searchData.data.items || [];
      
      if (logs.length === 0) {
        logMsg('[-] No stealer logs found for this target.', 'var(--nf-red)');
        return;
      }

      const scanLimit = logs.length;
      logMsg(`[+] Found ${logs.length} total logs. Scanning ALL logs for Credit Cards...`);
      logMsg(`-----------------------------------------------------`, '#fff');

      let totalCardsFound = 0;

      // Helper function to scan a single log
      const scanLog = async (logObj, index) => {
        const logId = logObj.log_id || logObj.id;
        if (!logId) return;
        
        const sFd = new FormData();
        sFd.append('action', 'cc_dumper_scan_log');
        sFd.append('log_id', logId);
        sFd.append('search_id', currentSearchId);

        try {
          const sRes = await fetch('/api/handler', { method: 'POST', body: sFd });
          const scanData = await sRes.json();
          
          const shortId = logId.substring(0, 16) + '...';
          logMsg(`[*] Scanned Log [${index+1}/${scanLimit}] ID: ${shortId}`, 'var(--nf-gray-light)');

          if (scanData.success && scanData.cards && scanData.cards.length > 0) {
            logMsg(`[!] BINGO! Found ${scanData.cards.length} cards in log ${shortId}!`, '#ff9800');
            scanData.cards.forEach(card => {
              logMsg(`💳 ${card}`, '#ff9800');
              totalCardsFound++;
            });
          }
        } catch(e) {
          logMsg(`[-] Error scanning log ${logId.substring(0, 16)}...`, 'var(--nf-red)');
        }
      };

      // Process in batches of 15 to balance speed and prevent ZIP download timeouts
      const batchSize = 15;
      for (let i = 0; i < scanLimit; i += batchSize) {
        const batch = logs.slice(i, i + batchSize);
        const promises = batch.map((logObj, idx) => scanLog(logObj, i + idx));
        await Promise.all(promises);
      }

      logMsg(`-----------------------------------------------------`, '#fff');
      logMsg(`[+] Scan Complete! Total Unique Cards Found: ${totalCardsFound}`, totalCardsFound > 0 ? '#ff9800' : '#00ff88');

    } catch (e) {
      logMsg('[-] Fatal Error executing CC Dumper.', 'var(--nf-red)');
    }
  };

  // Single Log ID Force Scan Handler
  const forceScanBtn = document.getElementById('forceScanBtn');
  const singleLogInput = document.getElementById('singleLogInput');
  if (forceScanBtn && singleLogInput) {
    forceScanBtn.addEventListener('click', async () => {
      const logId = singleLogInput.value.trim();
      if (!logId) return;

      resultsSection.classList.add('active');
      loadingBox.style.display = 'none';
      resultsGrid.innerHTML = ''; 

      logMsg(`[+] Initiating FORCE SCAN for Log ID: ${logId}`, '#ff9800');
      logMsg(`[*] This will scan ALL text files inside the log, bypassing filters...`, 'var(--nf-gray-light)');
      
      const sFd = new FormData();
      sFd.append('action', 'cc_dumper_scan_log');
      sFd.append('log_id', logId);
      sFd.append('scan_all_files', 'true'); // Force scan all files flag

      try {
        const sRes = await fetch('/api/handler', { method: 'POST', body: sFd });
        const scanData = await sRes.json();

        if (scanData.success && scanData.cards && scanData.cards.length > 0) {
          logMsg(`[!] BINGO! Found ${scanData.cards.length} cards in log!`, '#00ff88');
          scanData.cards.forEach(card => {
            logMsg(`💳 ${card}`, '#00ff88');
          });
        } else {
          logMsg(`[-] Scan completed. No 13-16 digit cards found in ANY text file in this log.`, 'var(--nf-red)');
        }
      } catch(e) {
        logMsg(`[-] Error force scanning log ${logId}...`, 'var(--nf-red)');
      }
    });
  }

}); // DOMContentLoaded end
