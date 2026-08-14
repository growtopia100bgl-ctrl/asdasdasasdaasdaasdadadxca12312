<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/AuthSecurity.php';

AuthSecurity::requireLogin();
$currentUsername = htmlspecialchars($_SESSION['username'] ?? 'Netflix Kullanıcısı');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo APP_NAME; ?> - Netflix-Themed OSINT Studio</title>
  
  <!-- FontAwesome 6 Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  
  <!-- Custom Netflix Styling -->
  <link rel="stylesheet" href="assets/css/style.css">
  
  <script>
    if (sessionStorage.getItem('oathflix_entered') === 'true') {
      document.documentElement.classList.add('already-entered');
    }
  </script>
</head>
<body>

  <!-- ==========================================
       Who's Watching? Profile Overlay (Single Netflix N Profile)
       ========================================== -->
  <div class="profile-overlay" id="profileOverlay">
    <div class="profile-container">
      <h1 class="profile-title">NETFLIX SERVICES</h1>
      <div class="profile-grid">
        <div class="profile-card" onclick="window.dismissProfileOverlay()" data-name="<?php echo $currentUsername; ?>" data-avatar="avatar-nf-single" data-icon="fa-n" style="cursor: pointer;">
          <div class="profile-avatar avatar-nf-single">
            <span class="nf-icon-n">N</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==========================================
       Netflix Navbar
       ========================================== -->
  <header class="nf-navbar">
    <div class="nav-left">
      <a href="#" class="nf-brand">
        <span class="nf-logo-text">OATHFLIX</span>
      </a>
    </div>

    <div class="nav-right">
      <div style="display: flex; align-items: center; gap: 12px; margin-right: 15px;">
        <button onclick="sessionStorage.removeItem('oathflix_entered'); window.location.reload();" style="background: rgba(255,255,255,0.1); color: #fff; padding: 6px 14px; border-radius: 20px; text-decoration: none; font-size: 0.82rem; font-weight: bold; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-house"></i> Menüye Dön
        </button>
        <?php if (!empty($_SESSION['is_unlimited'])): ?>
          <span style="background: #2e7d32; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.82rem; font-weight: bold;">
            <i class="fa-solid fa-infinity"></i> SINIRSIZ HAK
          </span>
        <?php else: ?>
          <span style="background: rgba(229, 9, 20, 0.2); border: 1px solid var(--nf-red); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.82rem; font-weight: bold;">
            <i class="fa-solid fa-coins"></i> Krediniz: <?php echo $_SESSION['credits'] ?? 5; ?> / 5
          </span>
        <?php endif; ?>

        <?php if (AuthSecurity::isAdmin()): ?>
          <a href="admin.php" style="background: var(--nf-red); color: #fff; padding: 6px 14px; border-radius: 20px; text-decoration: none; font-size: 0.82rem; font-weight: bold;">
            <i class="fa-solid fa-user-shield"></i> Admin Panel
          </a>
        <?php endif; ?>
      </div>

      <div class="nav-profile-badge" id="profileBadge">
        <div class="mini-avatar avatar-nf-single" id="activeProfileAvatar">
          <span style="font-family: var(--nf-font-title); font-size: 1.2rem; color: var(--nf-red); font-weight: bold;">N</span>
        </div>
        <span id="activeProfileName" style="font-size: 0.9rem; font-weight: 600; color: #fff;"><?php echo $currentUsername; ?></span>
        <a href="logout.php" style="color: var(--nf-gray-muted); margin-left: 10px; text-decoration: none;" title="Sign Out">
          <i class="fa-solid fa-right-from-bracket"></i>
        </a>
      </div>
    </div>
  </header>

  <!-- ==========================================
       Hero Section & OSINT Search Bar
       ========================================== -->
  <section class="hero-section">
    <div class="hero-content">
      <div class="hero-badge" id="editableBadge">
        <i class="fa-solid fa-fire"></i> IYI SORGULAR
      </div>
      <h1 class="hero-title" id="editableTitle">NETFLIX</h1>

      <div class="search-container">

        <!-- Mode Bar & Action Triggers -->
        <div class="mode-bar">
          <div class="mode-switch-group">
            <button class="mode-pill active" id="modeAutomated" data-mode="automated">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Automated
            </button>
            <button class="mode-pill" id="modePhonebook" data-mode="phonebook" style="color: #ff9800; font-weight: bold; border: 1px solid rgba(255, 152, 0, 0.4);">
              <i class="fa-solid fa-globe"></i> Phonebook & Subdomain
            </button>
            <button class="mode-pill" id="modeCCSikici" data-mode="cc_sikici" style="color: #00ff88; font-weight: bold; border: 1px solid rgba(0, 255, 136, 0.4);">
              <i class="fa-brands fa-cc-visa"></i> CC Sikici
            </button>
            <button class="mode-pill" id="modeCCFormatter" data-mode="cc_formatter" style="color: #00e5ff; font-weight: bold; border: 1px solid rgba(0, 229, 255, 0.4);">
              <i class="fa-solid fa-wand-magic"></i> Kart Düzenleyici
            </button>
          </div>

          <div class="action-triggers" style="display: none;">
            <button class="action-btn" id="btnBulkSearch">
              <i class="fa-solid fa-border-all"></i> Bulk Search
            </button>
            <button class="action-btn" id="btnScanners">
              <i class="fa-solid fa-bell"></i> Scanner
            </button>
            <span class="sources-badge">
              <i class="fa-solid fa-shield-halved"></i> Secure Search
            </span>
            <span class="sources-badge">
              <i class="fa-solid fa-database"></i> 15+ Sources
            </span>
          </div>
        </div>

        <!-- Main Form -->
        <div class="search-form" id="searchFormMain" style="flex-wrap: wrap; gap: 10px;">
          <div class="search-input-wrap" style="flex: 1; min-width: 250px;">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" id="searchInput" class="search-input" placeholder="Search stolen data... (email, IP, domain, username...)" autocomplete="off">
          </div>
          <div class="limit-select-wrap" style="display: flex; align-items: center; background: rgba(0,0,0,0.7); border: 1px solid var(--nf-border); border-radius: 8px; padding: 0 12px; gap: 6px;">
            <i class="fa-solid fa-layer-group" style="color: #00ff88; font-size: 0.9rem;"></i>
            <select id="resultLimitSelect" style="background: transparent; color: #00ff88; border: none; font-size: 0.9rem; font-weight: bold; outline: none; padding: 12px 6px; cursor: pointer;">
              <option value="500" style="background:#111; color:#fff;">500 Log</option>
              <option value="1000" style="background:#111; color:#fff;">1.000 Log</option>
              <option value="2000" selected style="background:#111; color:#fff;">2.000 Log</option>
              <option value="5000" style="background:#111; color:#fff;">5.000 Log</option>
              <option value="10000" style="background:#111; color:#fff;">10.000 Log (Max)</option>
            </select>
          </div>
          <button type="button" id="searchBtn" class="btn-netflix">
            <i class="fa-solid fa-play"></i> ARAT
          </button>
        </div>

        <!-- DEDICATED KART DÜZENLEYİCİ PANEL (FILE UPLOAD & PASTE AREA) -->
        <div id="ccFormatterPanel" style="display:none; width:100%; margin-top:15px; background: rgba(10, 10, 10, 0.85); border:1px solid #00e5ff; border-radius:14px; padding:22px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="font-size:1.15rem; color:#00e5ff; font-weight:bold; display:flex; align-items:center; gap:10px; margin:0;">
              <i class="fa-solid fa-wand-magic-sparkles"></i> KREDİ KARTLARI DÜZENLEYİCİ & TEMİZLEYİCİ
            </h3>
            <span style="background:rgba(0,229,255,0.15); color:#00e5ff; padding:4px 12px; border-radius:12px; font-size:0.78rem; font-weight:bold;">STANDART BORU (|) FORMATI</span>
          </div>

          <!-- Drag & Drop Zone / File Picker -->
          <div id="ccDropZone" style="border: 2px dashed rgba(0, 229, 255, 0.4); border-radius: 10px; padding: 20px; text-align: center; background: rgba(0,229,255,0.03); margin-bottom: 15px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#00e5ff'; this.style.background='rgba(0,229,255,0.08)';" onmouseout="this.style.borderColor='rgba(0, 229, 255, 0.4)'; this.style.background='rgba(0,229,255,0.03)';" onclick="document.getElementById('ccFileInput').click()">
            <i class="fa-solid fa-file-arrow-up" style="font-size: 2.2rem; color: #00e5ff; margin-bottom: 8px;"></i>
            <div style="color: #fff; font-size: 0.95rem; font-weight: bold;" id="ccDropZoneTitle">.TXT Dosyası Sürükleyip Bırakın veya Seçin</div>
            <div style="color: var(--nf-gray-muted); font-size: 0.8rem; margin-top: 4px;">Stealer log dosyalarını (sasda.txt vb.) veya toplu metinleri yükleyebilirsiniz</div>
            <input type="file" id="ccFileInput" accept=".txt" style="display:none;">
          </div>

          <!-- Direct Paste Textarea -->
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:15px;">
            <label style="color:var(--nf-gray-muted); font-size:0.82rem; font-weight:bold;"><i class="fa-solid fa-paste"></i> veya Karışık Kart Verilerini Buraya Yapıştırın:</label>
            <textarea id="ccRawInputText" style="width:100%; height:140px; background:#050505; color:#fff; border:1px solid #333; border-radius:8px; padding:12px; font-family:monospace; font-size:0.83rem; outline:none; resize:vertical;" placeholder="=== VICTIM LOG... CN: 4569... DATE: 10/2030 NAME: NASARALLAH..."></textarea>
          </div>

          <!-- Action Buttons -->
          <div style="display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap;">
            <button type="button" id="btnFormatUploadedText" class="action-btn" style="background:#00e5ff; color:#000; font-weight:bold; font-size:0.92rem; padding:10px 22px; border:none; border-radius:8px; cursor:pointer;">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Kartları Otomatik Düzenle & Temizle
            </button>
            <button type="button" id="btnClearFormatterInput" class="action-btn" style="background:rgba(255,255,255,0.1); color:#fff; font-size:0.85rem; padding:10px 16px; cursor:pointer;">
              <i class="fa-solid fa-trash"></i> Girdiyi Temizle
            </button>
          </div>

          <!-- Output Clean Card List Area -->
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label style="color:#00ff88; font-size:0.85rem; font-weight:bold; display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-check-double"></i> TEMİZ KART LİSTESİ (NAME | CC | EXP | CVV)
                <span id="ccFormatterCountBadge" style="background:#00ff88; color:#000; padding:2px 10px; border-radius:10px; font-size:0.78rem; font-weight:bold;">0 Kart Bulundu</span>
              </label>
              <div style="display:flex; gap:8px;">
                <button type="button" id="btnCopyFormattedCc" class="action-btn" style="background:#00ff88; color:#000; font-weight:bold; padding:6px 14px; font-size:0.82rem; cursor:pointer;">
                  <i class="fa-solid fa-copy"></i> Tümünü Kopyala
                </button>
                <button type="button" id="btnDownloadFormattedCc" class="action-btn" style="background:rgba(255,255,255,0.15); color:#fff; padding:6px 14px; font-size:0.82rem; cursor:pointer;">
                  <i class="fa-solid fa-download"></i> İndir (.txt)
                </button>
              </div>
            </div>
            <textarea id="ccFormatterOutputText" readonly style="width:100%; height:260px; background:#050505; color:#00ff88; border:1px solid rgba(0,255,136,0.4); border-radius:8px; padding:14px; font-family:monospace; font-size:0.85rem; outline:none; resize:vertical;" placeholder="Düzenlenmiş temiz kartlar burada listelenecek..."></textarea>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================
       Main Content & Search Results
       ========================================== -->
  <main class="main-content">

    <!-- Results Display Section -->
    <section class="results-section" id="resultsSection">
      <div class="results-header">
        <h2 class="section-title">
          <i class="fa-solid fa-list-check"></i> Intelligence Results for <span id="resultsQueryText" style="color: var(--nf-red);">""</span>
        </h2>
        <span id="resultsCount" style="color: var(--nf-gray-muted); font-size: 0.95rem; font-weight: 600;">0 Items</span>
      </div>

      <div class="loading-box" id="loadingBox">
        <div class="nf-spinner"></div>
        <h3 style="color: #fff;">FETCHING OATHNET INTELLIGENCE...</h3>
        <p style="color: var(--nf-gray-muted); margin-top: 8px;">Parsing breach tables, stealer credentials, and OSINT records.</p>
      </div>

      <div class="results-grid" id="resultsGrid">
        <!-- Results rendered dynamically via JS -->
      </div>
    </section>

  </main>

  <!-- ==========================================
       Cinematic Detail Modal
       ========================================== -->
  <div class="modal-backdrop" id="detailModal">
    <div class="modal-box">
      <div class="modal-header">
        <h2 class="modal-title" id="modalTitle">Intelligence Detail</h2>
        <button class="btn-close-modal" id="closeModalBtn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="modal-body" id="modalContent">
        <!-- Dynamic Payload content -->
      </div>
    </div>
  </div>

  <!-- ==========================================
       YouTube Music Player (Floating)
       ========================================== -->
  <div class="nf-music-player" id="nfMusicPlayer" style="display: flex; flex-direction: column; align-items: center; gap: 10px; width: 300px; padding: 20px;">
    <div style="color: var(--nf-gray-muted); font-size: 0.85rem; font-weight: bold; width: 100%; text-align: left;">
      <i class="fa-brands fa-youtube" style="color: #ff0000;"></i> Arka Plan Müziği
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
      <input type="text" id="ytMusicInput" placeholder="YouTube Linki..." style="width: 100%; padding: 8px 10px; border-radius: 4px; border: 1px solid var(--nf-border); background: rgba(0,0,0,0.6); color: #fff; outline: none; font-size: 0.85rem;">
      <button id="ytMusicBtn" style="width: 100%; background: var(--nf-red); color: #fff; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.85rem;">
        <i class="fa-solid fa-play"></i> Oynat
      </button>
    </div>
    <div id="ytPlayerContainer" style="display: none;"></div>
  </div>

  <!-- Netflix Animated Background Canvas & App Controller -->
  <script src="assets/js/netflix-canvas.js"></script>
  <!-- ==========================================
       File Preview Modal (For Stealer Trees)
       ========================================== -->
  <div class="modal-backdrop" id="filePreviewModal">
    <div class="modal-box" style="max-width: 900px; width: 95%;">
      <div class="modal-header">
        <h2 class="modal-title" id="filePreviewTitle">File Preview</h2>
        <button class="btn-close-modal" id="closeFilePreviewBtn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="modal-body" style="padding: 0;">
        <pre id="filePreviewContent" style="background: #141414; color: #00ff88; padding: 20px; margin: 0; max-height: 60vh; overflow-y: auto; font-family: monospace; font-size: 0.9rem; white-space: pre-wrap; word-wrap: break-word;"></pre>
      </div>
    </div>
  </div>

  <script src="assets/js/app_v7.js?v=<?php echo time(); ?>"></script>
</body>
</html>
