'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// COSMIC SURVIVORS v8.0 — KOMUTA HANGARI, PROFESYONEL KATALOG & ATÖLYE KONTROLCÜSÜ
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  const DATA = window.COSMIC_DATA;
  const PERSIST = window.CosmicPersistence;

  let selectedShipId = sessionStorage.getItem('cosmic_ship') || 'interceptor';
  let selectedMapId = sessionStorage.getItem('cosmic_map') || 'sector9';
  let selectedDiff = sessionStorage.getItem('cosmic_diff') || 'normal';
  let shipRoleFilter = 'all';
  let shipSearchQuery = '';
  let weaponsPreviewOn = true;

  // Catalog state
  let catCategory = 'all';
  let catShipFilter = 'all';
  let catSort = 'tier';
  let catViewMode = 'table';
  let catSearch = '';

  // Validate selectedShipId
  if (!DATA.ships.some(s => s.id === selectedShipId)) selectedShipId = 'interceptor';
  if (!DATA.maps.some(m => m.id === selectedMapId)) selectedMapId = 'sector9';

  const DIFF_LABELS = {
    easy: 'KOLAY',
    normal: 'NORMAL',
    hard: 'ZOR',
    nightmare: 'KABUS'
  };

  const BOSS_INTEL = [
    {
      id: 'behemoth',
      name: 'Oblivion Behemoth',
      wave: 'Dalga 5 & 20',
      color: '#ffaa00',
      asset: 'assets/bosses/behemoth.svg',
      weakSpot: 'Arka Mavi Kuantum Reaktör Çekirdeği (2.0x Gerçek Hasar)',
      frontArmor: 'Ön Altın Zırh Plakası (%55 Hasar Sönümleme)',
      tactic: 'Ön kalkanına ateş etmek yerine geminizin hız/sıçrama yeteneğiyle arkasına geçin ve mavi çekirdeğe odaklanın.'
    },
    {
      id: 'leviathan',
      name: 'Void Leviathan',
      wave: 'Dalga 10 & 25',
      color: '#bf00ff',
      asset: 'assets/bosses/leviathan.svg',
      weakSpot: 'Spiral Mermi Salvosu Sonrası Açılan Boğaz Çekirdeği',
      frontArmor: 'Biyomekanik Kitin Pulları (%30 Zırh)',
      tactic: 'Sekizli spiral plazma halkaları arasında orta mesafede daire çizin; Aegis EMP veya Chronos Stasis yeteneği mermileri tamamen etkisizleştirir.'
    },
    {
      id: 'hivemind',
      name: 'Nexus Hive-Queen',
      wave: 'Dalga 15 & 30',
      color: '#00ff88',
      asset: 'assets/bosses/hivemind.svg',
      weakSpot: 'Yavrulama Kapsülleri Açıldığında Merkez Kristal',
      frontArmor: 'Biyo-Rejeneratif Kalkan Zarı',
      tactic: 'Çağrılan Swarmer sürülerini Gatling Fırtınası veya Titan Koronası gibi alan/sekme silahlarıyla anında temizleyerek boss\'u yalnız bırakın.'
    },
    {
      id: 'chronovore',
      name: 'Chronovore (Zaman Yiyici)',
      wave: 'Dalga 20+',
      color: '#00f0ff',
      asset: 'assets/bosses/chronovore.svg',
      weakSpot: 'Jiroskop Halkaları Hizalandığında İç Tekillik Gözü',
      frontArmor: 'Zaman Bükücü Faz Kalkanı',
      tactic: 'Işınlanma sonrasında bıraktığı zaman yarıklarından uzak durun; güdümlü Füze Sürüsü ve Otonom Dronelar hedefi asla kaybetmez.'
    },
    {
      id: 'seraphim',
      name: 'Corrupted Dyson Seraph',
      wave: 'Dalga 30+ (Kıyamet)',
      color: '#ff006a',
      asset: 'assets/bosses/seraphim.svg',
      weakSpot: '6 Kanat Açıldığında Merkez Güneş Kalbi',
      frontArmor: 'Yörüngesel Foton Kanatları',
      tactic: 'Çapraz lazer taramasından Warp Dash veya Gölge Sıçraması ile geçin; Kozmik Mega Evrimler olmadan bu fazda uzun süre kalınamaz.'
    }
  ];

  // ── 1. ÜST BAR & PROFİL TELEMETRİSİ ──
  function refreshProfileHeader() {
    const p = PERSIST.load();
    const topCr = document.getElementById('topCreditAmount');
    const wsCr = document.getElementById('workshopCreditBalance');
    const topWv = document.getElementById('topMaxWave');
    const topKl = document.getElementById('topTotalKills');

    if (topCr) topCr.textContent = p.credits.toLocaleString('tr-TR');
    if (wsCr) wsCr.textContent = p.credits.toLocaleString('tr-TR');
    if (topWv) topWv.textContent = p.maxWave || 1;
    if (topKl) topKl.textContent = (p.totalKills || 0).toLocaleString('tr-TR');
  }

  // ── 2. SOL SIDEBAR SEKME GEÇİŞLERİ ──
  function initSidebarNavigation() {
    const tabs = document.querySelectorAll('.sidebar-tab');
    const views = document.querySelectorAll('.portal-view');

    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-view');
        tabs.forEach(t => t.classList.toggle('active', t === btn));
        views.forEach(v => v.classList.toggle('active', v.id === targetId));
        if (targetId === 'view-catalog') {
          renderCatalog();
          renderShipComparator();
        } else if (targetId === 'view-workshop') {
          renderWorkshop();
        } else if (targetId === 'view-maps') {
          renderSectorsAndBosses();
        } else if (targetId === 'view-achievements') {
          renderAchievementsAndLeaderboard();
        }
      });
    });
  }

  // ── 3. KOKPİT SOL SÜTUN: 8 GEMİ PROFESYONEL LİSTE & FİLTRELEME ──
  function renderShipRoster() {
    const listEl = document.getElementById('shipRosterList');
    if (!listEl) return;

    const q = shipSearchQuery.trim().toLowerCase();
    const filtered = DATA.ships.filter(ship => {
      if (shipRoleFilter !== 'all') {
        const roleMatch =
          (shipRoleFilter === 'Taarruz' && (ship.role.includes('Taarruz') || ship.role.includes('Suikast') || ship.role.includes('Alan'))) ||
          (shipRoleFilter === 'Zırh' && (ship.role.includes('Zırh') || ship.role.includes('Savunma'))) ||
          (shipRoleFilter === 'Kontrol' && (ship.role.includes('Kriyo') || ship.role.includes('Drone') || ship.role.includes('Zaman')));
        if (!roleMatch) return false;
      }
      if (q) {
        const hay = `${ship.name} ${ship.code} ${ship.role} ${ship.starterWeaponName} ${ship.sigWeaponName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const badge = document.getElementById('rosterCountBadge');
    if (badge) badge.textContent = `${filtered.length} / ${DATA.ships.length} GEMİ`;

    listEl.innerHTML = filtered.map(ship => {
      const isSel = ship.id === selectedShipId;
      return `
        <div class="ship-roster-item ${isSel ? 'active' : ''}" data-ship-id="${ship.id}" style="--ship-c:${ship.color}">
          <div class="sri-thumb">
            <img src="${ship.asset}" alt="${ship.name}" loading="lazy" onerror="this.style.display='none'" />
          </div>
          <div class="sri-info">
            <div class="sri-top">
              <span class="sri-name">${ship.name}</span>
              <span class="badge tier-s" style="border-color:${ship.color};color:${ship.color}">${ship.tier}</span>
            </div>
            <div class="sri-role">${ship.role}</div>
            <div class="sri-weapons">
              <span>🔫 ${ship.starterWeaponName}</span>
              <span>🌟 ${ship.sigWeaponName}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.ship-roster-item').forEach(item => {
      item.addEventListener('click', () => {
        selectedShipId = item.getAttribute('data-ship-id');
        sessionStorage.setItem('cosmic_ship', selectedShipId);
        sessionStorage.setItem('cosmic_p1_ship', selectedShipId);
        renderShipRoster();
        updateCockpitDetails();
      });
    });
  }

  // ── 4. KOKPİT ORTA & SAĞ SÜTUN: SEÇİLİ GEMİ TELEMETRİSİ, HARİTALAR VE ÖZEL AĞAÇ ──
  function updateCockpitDetails() {
    const ship = DATA.ships.find(s => s.id === selectedShipId) || DATA.ships[0];
    const map = DATA.maps.find(m => m.id === selectedMapId) || DATA.maps[0];
    const bonuses = PERSIST.getBonuses();

    document.getElementById('scShipCode').textContent = `${ship.code} • ${ship.faction.toUpperCase()}`;
    document.getElementById('scShipName').textContent = ship.name.toUpperCase();
    document.getElementById('scShipName').style.color = ship.color;
    document.getElementById('scShipTier').textContent = `TIER ${ship.tier}`;
    document.getElementById('scShipRole').textContent = ship.role;
    document.getElementById('scShipLore').textContent = ship.lore;

    const treeLink = document.getElementById('btnInspectShipTree');
    if (treeLink) treeLink.href = `tree.html?ship=${encodeURIComponent(ship.id)}`;

    // 5-Axis Stat Bars
    const statLabels = [
      { key: 'firepower', label: 'ATEŞ GÜCÜ & DPS POTANSİYELİ', color: '#ff006a', val: ship.stats.firepower },
      { key: 'speed', label: 'İTİCİ HIZI & ÇEVİKLİK', color: '#00f0ff', val: ship.stats.speed },
      { key: 'defense', label: 'ZIRH & KALKAN DAYANIKLILIĞI', color: '#00ff88', val: ship.stats.defense },
      { key: 'utility', label: 'ALAN KONTROL & SİNERJİ', color: '#ffd700', val: ship.stats.utility },
      { key: 'complexity', label: 'PİLOTAJ USTALIK SEVİYESİ', color: '#bf00ff', val: ship.stats.complexity }
    ];

    const statBarsEl = document.getElementById('shipStatBars');
    if (statBarsEl) {
      const effHp = Math.round(ship.hp * bonuses.hpMult);
      const effSh = Math.round(ship.sh * bonuses.hpMult);
      const effCrit = Math.round((ship.crit + bonuses.critAdd) * 100);
      const effArmor = Math.round(ship.armor * 100);

      statBarsEl.innerHTML = `
        <div class="quick-num-grid">
          <div class="qnum-cell"><span>GÖVDE (HP)</span><strong style="color:#00ff88">${effHp}</strong></div>
          <div class="qnum-cell"><span>KALKAN (SH)</span><strong style="color:#00f0ff">${effSh}</strong></div>
          <div class="qnum-cell"><span>KRİTİK ŞANS</span><strong style="color:#ffd700">%${effCrit}</strong></div>
          <div class="qnum-cell"><span>ZIRH DİRENCİ</span><strong style="color:#ffaa00">%${effArmor}</strong></div>
        </div>
        ${statLabels.map(st => `
          <div class="stat-bar-row">
            <div class="sbr-head">
              <span>${st.label}</span>
              <strong style="color:${st.color}">${st.val}/100</strong>
            </div>
            <div class="sbr-track">
              <div class="sbr-fill" style="width:${st.val}%;background:${st.color}"></div>
            </div>
          </div>
        `).join('')}
      `;
    }

    // Signature Root Loadout Box
    const sigBox = document.getElementById('shipSignatureBox');
    if (sigBox) {
      sigBox.innerHTML = `
        <div class="sig-box-title">🌟 GEMİYE ÖZEL İMZA KÖK AĞACI &amp; YETENEK</div>
        <div class="sig-grid">
          <div class="sig-card">
            <span class="sig-tag">BAŞLANGIÇ SİLAHI</span>
            <strong>🔫 ${ship.starterWeaponName}</strong>
          </div>
          <div class="sig-card gold">
            <span class="sig-tag">ÖZEL KÖK SİLAH + ALET</span>
            <strong>🌟 ${ship.sigWeaponName} + ${ship.sigTrinketName}</strong>
          </div>
          <div class="sig-card mega">
            <span class="sig-tag">ÖZEL EVRİM ➔ MEGA EVRİM</span>
            <strong>👑 ${ship.sigEvoName} ➔ ${ship.sigMegaName}</strong>
          </div>
          <div class="sig-card ability">
            <span class="sig-tag">AKTİF YETENEK [SPACE • ${ship.abilityCd}sn]</span>
            <strong>⚡ ${ship.abilityName}:</strong> <small>${ship.abilityDesc}</small>
          </div>
        </div>
      `;
    }

    // Active Meta Bonuses Strip
    const metaStrip = document.getElementById('activeMetaStrip');
    if (metaStrip) {
      metaStrip.innerHTML = `
        <span>🔧 <strong>Atölye Bonusları:</strong></span>
        <span>⚔️ Hasar +${Math.round((bonuses.dmgMult - 1) * 100)}%</span>
        <span>🛡️ Gövde +${Math.round((bonuses.hpMult - 1) * 100)}%</span>
        <span>🎲 +${bonuses.extraRerolls} Reroll</span>
        <span>💎 Kredi x${bonuses.creditMult.toFixed(1)}</span>
      `;
    }

    // Launch Button Summary
    const launchSub = document.getElementById('launchSubSummary');
    if (launchSub) {
      launchSub.textContent = `${ship.name.toUpperCase()} • ${map.name.toUpperCase()} • ${DIFF_LABELS[selectedDiff] || 'NORMAL'}`;
    }
  }

  // ── 5. 4 SEKTÖR HARİTA KARTLARI (KOKPİT ALT BAR) ──
  function renderLobbyMaps() {
    const wrap = document.getElementById('lobbyMapCards');
    const hazardHint = document.getElementById('selectedMapHazard');
    if (!wrap) return;

    const currentMap = DATA.maps.find(m => m.id === selectedMapId) || DATA.maps[0];
    if (hazardHint) hazardHint.textContent = `⚠️ ${currentMap.hazards}`;

    wrap.innerHTML = DATA.maps.map(m => {
      const isSel = m.id === selectedMapId;
      const isSynergy = m.recommendedShips.includes(selectedShipId);
      return `
        <div class="map-mini-card ${isSel ? 'active' : ''}" data-map-id="${m.id}" style="--map-c:${m.color}">
          <div class="mmc-top">
            <span class="mmc-name">${m.name}</span>
            <span class="mmc-mult">${m.difficulty.split(' ')[1] || 'x1.0'}</span>
          </div>
          <div class="mmc-sub">${m.subtitle}</div>
          ${isSynergy ? '<div class="mmc-synergy">★ Seçili Gemiyle Yüksek Sinerji</div>' : ''}
        </div>
      `;
    }).join('');

    wrap.querySelectorAll('.map-mini-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedMapId = card.getAttribute('data-map-id');
        sessionStorage.setItem('cosmic_map', selectedMapId);
        renderLobbyMaps();
        updateCockpitDetails();
      });
    });
  }

  // ── 6. PROFESYONEL FİLTRELENEBİLİR & SIRALANABİLİR KATALOG (GÖRÜNÜM 2) ──
  function renderCatalog() {
    const container = document.getElementById('catalogContainer');
    if (!container) return;

    const tierRank = { 'MEGA': 5, 'S+': 4, 'S': 3, 'A+': 2, 'A': 1 };
    const q = catSearch.trim().toLowerCase();

    let items = DATA.catalog.filter(item => {
      if (catCategory !== 'all' && item.category !== catCategory) return false;
      if (catShipFilter !== 'all' && item.ship !== 'all' && item.ship !== catShipFilter) return false;
      if (q) {
        const hay = `${item.name} ${item.pair} ${item.evo} ${item.desc}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    items.sort((a, b) => {
      if (catSort === 'dmg-desc') return (b.baseDmg || 0) - (a.baseDmg || 0);
      if (catSort === 'name') return a.name.localeCompare(b.name, 'tr');
      return (tierRank[b.tier] || 0) - (tierRank[a.tier] || 0) || (b.baseDmg || 0) - (a.baseDmg || 0);
    });

    const catBadges = {
      'weapon': '<span class="badge weapon">AKTİF SİLAH</span>',
      'sig-weapon': '<span class="badge ship-sig">🌟 GEMİ ÖZEL KÖK</span>',
      'trinket': '<span class="badge trinket">PASİF ALET</span>',
      'evolution': '<span class="badge evo">⚡ ÇAPRAZ EVRİM</span>',
      'mega': '<span class="badge mega">👑 MEGA EVRİM</span>'
    };

    if (catViewMode === 'table') {
      container.innerHTML = `
        <div class="pro-table-wrap">
          <table class="pro-table">
            <thead>
              <tr>
                <th>MODÜL / YETENEK ADI</th>
                <th>SINIF</th>
                <th>UYUMLU GEMİ</th>
                <th>KADEME</th>
                <th>BAZ GÜÇ</th>
                <th>DOLUM / TİP</th>
                <th>SENTEZ BAĞLANTISI &amp; EVRİM FORMÜLÜ</th>
                <th>TEKNİK AÇIKLAMA</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(it => {
                const shipObj = DATA.ships.find(s => s.id === it.ship);
                const shipLbl = it.ship === 'all' ? '🌐 Evrensel (8 Gemi)' : `🛸 ${shipObj ? shipObj.name : it.ship}`;
                return `
                  <tr>
                    <td>
                      <div class="tbl-item-name">
                        <span class="tbl-ico" style="border-color:${it.color};color:${it.color}">${it.icon}</span>
                        <strong style="color:${it.color}">${it.name}</strong>
                      </div>
                    </td>
                    <td>${catBadges[it.category] || it.category}</td>
                    <td><span class="tbl-ship-tag">${shipLbl}</span></td>
                    <td><span class="badge tier-s">${it.tier}</span></td>
                    <td><strong class="mono-num">${it.baseDmg > 0 ? it.baseDmg + ' DMG' : 'PASİF'}</strong></td>
                    <td><span class="mono-num">${it.cd}</span></td>
                    <td>
                      <div class="tbl-formula">🔗 ${it.pair}</div>
                      <div class="tbl-evo-res">➔ ${it.evo}</div>
                    </td>
                    <td class="tbl-desc">${it.desc}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="pro-card-grid">
          ${items.map(it => {
            const shipObj = DATA.ships.find(s => s.id === it.ship);
            const shipLbl = it.ship === 'all' ? '🌐 Evrensel' : `🛸 ${shipObj ? shipObj.name : it.ship}`;
            return `
              <div class="pro-card" style="--card-c:${it.color}">
                <div class="pc-head">
                  <div class="pc-title-wrap">
                    <span class="pc-ico">${it.icon}</span>
                    <div>
                      <h4 style="color:${it.color}">${it.name}</h4>
                      <small>${shipLbl} • ${it.cd}</small>
                    </div>
                  </div>
                  <span class="badge tier-s">${it.tier}</span>
                </div>
                <p class="pc-desc">${it.desc}</p>
                <div class="pc-meta">
                  <div><span>Sentez:</span> <strong>${it.pair}</strong></div>
                  <div><span>Sonuç:</span> <strong style="color:#ffd700">${it.evo}</strong></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  // ── 7. YAN YANA GEMİ KARŞILAŞTIRMA ARACI (SHIP COMPARATOR) ──
  function renderShipComparator() {
    const selA = document.getElementById('compShipA');
    const selB = document.getElementById('compShipB');
    const wrap = document.getElementById('shipComparisonTableWrap');
    if (!selA || !selB || !wrap) return;

    if (!selA.options.length) {
      const opts = DATA.ships.map(s => `<option value="${s.id}">${s.name} (${s.role})</option>`).join('');
      selA.innerHTML = opts;
      selB.innerHTML = opts;
      selA.value = selectedShipId;
      selB.value = selectedShipId === 'dreadnought' ? 'phantom' : 'dreadnought';
      selA.addEventListener('change', renderShipComparator);
      selB.addEventListener('change', renderShipComparator);
    }

    const sA = DATA.ships.find(s => s.id === selA.value) || DATA.ships[0];
    const sB = DATA.ships.find(s => s.id === selB.value) || DATA.ships[1];

    const rows = [
      { label: 'Gövde Dayanıklılığı (HP)', a: sA.hp, b: sB.hp, unit: ' HP' },
      { label: 'Kalkan Kapasitesi (SH)', a: sA.sh, b: sB.sh, unit: ' SH' },
      { label: 'Azami İtici Hızı', a: sA.sp, b: sB.sp, unit: ' px/s' },
      { label: 'Baz Kritik Şansı', a: Math.round(sA.crit * 100), b: Math.round(sB.crit * 100), unit: '%' },
      { label: 'Gövde Zırh Direnci', a: Math.round(sA.armor * 100), b: Math.round(sB.armor * 100), unit: '%' },
      { label: 'Ateş Gücü Puanı', a: sA.stats.firepower, b: sB.stats.firepower, unit: '/100' },
      { label: 'Alan Kontrol & Taktik', a: sA.stats.utility, b: sB.stats.utility, unit: '/100' }
    ];

    wrap.innerHTML = `
      <table class="pro-table comp-table">
        <thead>
          <tr>
            <th>TELEMETRİ PARAMETRESİ</th>
            <th style="color:${sA.color}">🛸 ${sA.name}</th>
            <th>FARK ANALİZİ</th>
            <th style="color:${sB.color}">🛸 ${sB.name}</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => {
            const diff = r.a - r.b;
            const winA = diff > 0;
            const winB = diff < 0;
            return `
              <tr>
                <td><strong>${r.label}</strong></td>
                <td style="color:${winA ? '#00ff88' : '#eef6ff'};font-weight:${winA ? '800' : '500'}">${r.a}${r.unit} ${winA ? '▲' : ''}</td>
                <td><span class="mono-num" style="color:#ffd700">${diff === 0 ? 'EŞİT' : (diff > 0 ? `+${diff}${r.unit} (${sA.name.split(' ')[0]})` : `+${Math.abs(diff)}${r.unit} (${sB.name.split(' ')[0]})`)}</span></td>
                <td style="color:${winB ? '#00ff88' : '#eef6ff'};font-weight:${winB ? '800' : '500'}">${r.b}${r.unit} ${winB ? '▲' : ''}</td>
              </tr>
            `;
          }).join('')}
          <tr>
            <td><strong>Özel İmza Kök Silahı</strong></td>
            <td style="color:${sA.color}">${sA.sigWeaponName} ➔ ${sA.sigEvoName}</td>
            <td>🌟 ÖZEL DAL</td>
            <td style="color:${sB.color}">${sB.sigWeaponName} ➔ ${sB.sigEvoName}</td>
          </tr>
          <tr>
            <td><strong>Kozmik Mega Evrim</strong></td>
            <td style="color:#ffd700">👑 ${sA.sigMegaName}</td>
            <td>👑 NİHAİ FORM</td>
            <td style="color:#ffd700">👑 ${sB.sigMegaName}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // ── 8. REAKTÖR ATÖLYESİ (GÖRÜNÜM 3: KALICI KREDİ YÜKSELTMELERİ) ──
  function renderWorkshop() {
    const grid = document.getElementById('workshopGrid');
    if (!grid) return;
    const p = PERSIST.load();
    refreshProfileHeader();

    grid.innerHTML = DATA.workshopUpgrades.map(u => {
      const lv = p.upgrades[u.id] || 0;
      const isMax = lv >= u.maxLevel;
      const cost = PERSIST.getUpgradeCost(u.id);
      const canAfford = cost !== null && p.credits >= cost;

      let pips = '';
      for (let i = 0; i < u.maxLevel; i++) {
        pips += `<span class="ws-pip ${i < lv ? 'filled' : ''}" style="--pip-c:${u.color}"></span>`;
      }

      return `
        <div class="workshop-card" style="--ws-c:${u.color}">
          <div class="ws-card-top">
            <span class="ws-icon">${u.icon}</span>
            <div class="ws-title-box">
              <h4>${u.name}</h4>
              <span class="ws-lv-badge">SEVİYE ${lv} / ${u.maxLevel}</span>
            </div>
          </div>
          <div class="ws-pips-row">${pips}</div>
          <p class="ws-desc">${u.desc}</p>
          <div class="ws-bonus-line">Her Seviye: <strong style="color:${u.color}">${u.bonusPerLv}</strong></div>
          <button type="button" class="ws-buy-btn ${isMax ? 'maxed' : (canAfford ? 'ready' : 'locked')}" data-upg-id="${u.id}" ${isMax || !canAfford ? 'disabled' : ''}>
            ${isMax ? '★ MAKSİMUM SEVİYE ★' : `💎 ${cost} KREDİ İLE YÜKSELT`}
          </button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.ws-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const upgId = btn.getAttribute('data-upg-id');
        const res = PERSIST.buyUpgrade(upgId);
        if (res.ok) {
          renderWorkshop();
          updateCockpitDetails();
        }
      });
    });
  }

  // ── 9. SEKTÖR HARİTALARI & 5 BOSS İSTİHBARATI (GÖRÜNÜM 4) ──
  function renderSectorsAndBosses() {
    const mapGrid = document.getElementById('sectorDetailGrid');
    const bossGrid = document.getElementById('bossIntelGrid');

    if (mapGrid) {
      mapGrid.innerHTML = DATA.maps.map(m => {
        const recShips = m.recommendedShips.map(sid => {
          const s = DATA.ships.find(x => x.id === sid);
          return s ? s.name.split(' ')[0] : sid;
        }).join(', ');
        return `
          <div class="sector-card" style="--sec-c:${m.color}">
            <div class="sec-preview">
              <img src="${m.asset}" alt="${m.name}" loading="lazy" onerror="this.style.display='none'" />
              <span class="sec-diff-tag">${m.difficulty}</span>
            </div>
            <div class="sec-body">
              <h3 style="color:${m.color}">${m.name}</h3>
              <p class="sec-desc">${m.desc}</p>
              <div class="sec-meta">
                <div><strong>⚠️ Çevresel Anomali:</strong> ${m.hazards}</div>
                <div><strong>👾 Düşman Odağı:</strong> ${m.enemyFocus}</div>
                <div><strong>🛸 Önerilen Gemiler:</strong> <span style="color:#00ff88">${recShips}</span></div>
              </div>
              <button type="button" class="sec-play-btn" data-select-map="${m.id}">🚀 Bu Sektörde Savaşa Gir</button>
            </div>
          </div>
        `;
      }).join('');

      mapGrid.querySelectorAll('.sec-play-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedMapId = btn.getAttribute('data-select-map');
          sessionStorage.setItem('cosmic_map', selectedMapId);
          launchBattle();
        });
      });
    }

    if (bossGrid) {
      bossGrid.innerHTML = BOSS_INTEL.map(b => `
        <div class="boss-intel-card" style="--boss-c:${b.color}">
          <div class="bic-thumb">
            <img src="${b.asset}" alt="${b.name}" loading="lazy" onerror="this.style.display='none'" />
          </div>
          <div class="bic-body">
            <div class="bic-head">
              <h4 style="color:${b.color}">${b.name}</h4>
              <span class="badge tier-s">${b.wave}</span>
            </div>
            <div class="bic-weak">🎯 <strong>Zayıf Nokta:</strong> ${b.weakSpot}</div>
            <div class="bic-armor">🛡️ <strong>Savunma:</strong> ${b.frontArmor}</div>
            <p class="bic-tactic">💡 <strong>Taktik:</strong> ${b.tactic}</p>
          </div>
        </div>
      `).join('');
    }
  }

  // ── 10. BAŞARIMLAR & LİDERLİK TABLOSU (GÖRÜNÜM 5) ──
  function renderAchievementsAndLeaderboard() {
    const achEl = document.getElementById('achievementsList');
    const lbEl = document.getElementById('lobbyLeaderboardBox');
    const p = PERSIST.load();
    const totalUpgrades = Object.values(p.upgrades || {}).reduce((a, b) => a + b, 0);
    const statSnapshot = { ...p, totalUpgrades };

    if (achEl) {
      achEl.innerHTML = DATA.achievements.map(ach => {
        const unlocked = ach.check(statSnapshot);
        const claimed = !!p.claimedAchievements[ach.id];
        return `
          <div class="ach-row ${unlocked ? 'unlocked' : ''}">
            <span class="ach-ico">${ach.icon}</span>
            <div class="ach-info">
              <strong>${ach.name}</strong>
              <p>${ach.desc}</p>
            </div>
            <div class="ach-action">
              ${claimed
                ? '<span class="badge tier-s" style="color:#00ff88;border-color:#00ff88">✓ ALINDI</span>'
                : unlocked
                  ? `<button type="button" class="ach-claim-btn" data-ach-id="${ach.id}" data-reward="${ach.reward}">💎 +${ach.reward} AL</button>`
                  : `<span class="ach-reward-lbl">💎 +${ach.reward} Kredi</span>`
              }
            </div>
          </div>
        `;
      }).join('');

      achEl.querySelectorAll('.ach-claim-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const achId = btn.getAttribute('data-ach-id');
          const reward = Number(btn.getAttribute('data-reward') || 0);
          const prof = PERSIST.load();
          if (!prof.claimedAchievements[achId]) {
            prof.claimedAchievements[achId] = true;
            prof.credits += reward;
            PERSIST.save(prof);
            refreshProfileHeader();
            renderAchievementsAndLeaderboard();
          }
        });
      });
    }

    if (lbEl) {
      const scores = (typeof CosmicLeaderboard !== 'undefined' && CosmicLeaderboard.getScores)
        ? CosmicLeaderboard.getScores()
        : [];
      if (!scores.length) {
        lbEl.innerHTML = `<div class="empty-lb">Henüz yerel skor kaydı yok. İlk savaşı başlatarak liderlik tablosuna adını yazdır!</div>`;
      } else {
        lbEl.innerHTML = `
          <table class="pro-table">
            <thead>
              <tr>
                <th>#</th>
                <th>PİLOT</th>
                <th>SKOR</th>
                <th>DALGA</th>
                <th>ZORLUK</th>
              </tr>
            </thead>
            <tbody>
              ${scores.slice(0, 10).map((s, i) => `
                <tr>
                  <td><strong style="color:#ffd700">#${i + 1}</strong></td>
                  <td><strong>${s.name || 'Pilot'}</strong></td>
                  <td class="mono-num" style="color:#00f0ff">${Number(s.score || 0).toLocaleString('tr-TR')}</td>
                  <td>Dalga ${s.wave || 1}</td>
                  <td><span class="badge">${(s.difficulty || 'normal').toUpperCase()}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }
  }

  // ── 11. 3D/2.5D TURNTABLE GEMİ VİTRİN RENDER DÖNGÜSÜ ──
  function initTurntableAnimation() {
    const canvas = document.getElementById('lobbyShipCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t0 = performance.now();

    function frame(now) {
      const time = (now - t0) / 1000;
      const ship = DATA.ships.find(s => s.id === selectedShipId) || DATA.ships[0];

      if (window.CosmicModels && typeof window.CosmicModels.renderTurntable === 'function') {
        window.CosmicModels.renderTurntable(canvas, ship.id, time, {
          fireWeapons: weaponsPreviewOn,
          shipData: ship
        });
      } else {
        // Fallback high-detail turntable until CosmicModels loads
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2;
        ctx.save();
        ctx.strokeStyle = ship.color + '44';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 40, 160, 48, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.translate(cx, cy + Math.sin(time * 2.5) * 6);
        ctx.rotate(Math.sin(time * 0.9) * 0.25);
        ctx.fillStyle = ship.color;
        ctx.beginPath();
        ctx.moveTo(45, 0);
        ctx.lineTo(-32, -28);
        ctx.lineTo(-18, 0);
        ctx.lineTo(-32, 28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // ── 12. ARKA PLAN YILDIZ ALANI ──
  function initBackgroundStars() {
    const c = document.getElementById('bgStarCanvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      v: Math.random() * 0.015 + 0.004
    }));

    function resize() {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawStars() {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#cfe8ff';
      for (const s of stars) {
        s.y += s.v * 0.016;
        if (s.y > 1) s.y = 0;
        ctx.globalAlpha = 0.25 + (s.r / 2) * 0.45;
        ctx.beginPath();
        ctx.arc(s.x * c.width, s.y * c.height, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(drawStars);
    }
    requestAnimationFrame(drawStars);
  }

  // ── 13. SAVAŞA BAŞLATMA FONKSİYONU ──
  function launchBattle() {
    const pilotInput = document.getElementById('pilotNameInput');
    const pilotName = (pilotInput && pilotInput.value.trim()) ? pilotInput.value.trim() : 'KOMUTAN';
    sessionStorage.setItem('cosmic_p1', pilotName);
    sessionStorage.setItem('cosmic_ship', selectedShipId);
    sessionStorage.setItem('cosmic_p1_ship', selectedShipId);
    sessionStorage.setItem('cosmic_map', selectedMapId);
    sessionStorage.setItem('cosmic_diff', selectedDiff);
    window.location.href = `game.html?ship=${encodeURIComponent(selectedShipId)}&map=${encodeURIComponent(selectedMapId)}&diff=${encodeURIComponent(selectedDiff)}`;
  }

  // ── 14. EVENT LISTENERS BAĞLANTILARI ──
  function bindEvents() {
    // Ship search & role pills
    const shipSearch = document.getElementById('shipSearchInput');
    if (shipSearch) {
      shipSearch.addEventListener('input', e => {
        shipSearchQuery = e.target.value;
        renderShipRoster();
      });
    }

    document.querySelectorAll('#shipRolePills .filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#shipRolePills .filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        shipRoleFilter = btn.getAttribute('data-role');
        renderShipRoster();
      });
    });

    // Difficulty buttons
    document.querySelectorAll('#diffBtnGroup .diff-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-diff') === selectedDiff);
      btn.addEventListener('click', () => {
        selectedDiff = btn.getAttribute('data-diff');
        sessionStorage.setItem('cosmic_diff', selectedDiff);
        document.querySelectorAll('#diffBtnGroup .diff-btn').forEach(b => b.classList.toggle('active', b === btn));
        updateCockpitDetails();
      });
    });

    // Turntable buttons
    const btnWeap = document.getElementById('btnToggleWeapons');
    if (btnWeap) {
      btnWeap.addEventListener('click', () => {
        weaponsPreviewOn = !weaponsPreviewOn;
        btnWeap.classList.toggle('active', weaponsPreviewOn);
        btnWeap.textContent = `🔫 Silah Simülasyonu: ${weaponsPreviewOn ? 'AÇIK' : 'KAPALI'}`;
      });
    }

    const btnComp = document.getElementById('btnCompareCurrent');
    if (btnComp) {
      btnComp.addEventListener('click', () => {
        const catTab = document.querySelector('.sidebar-tab[data-view="view-catalog"]');
        if (catTab) catTab.click();
        setTimeout(() => {
          document.querySelector('.comparator-panel')?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      });
    }

    // Catalog filters
    document.querySelectorAll('#catalogCategoryPills .filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#catalogCategoryPills .filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        catCategory = btn.getAttribute('data-cat');
        renderCatalog();
      });
    });

    document.getElementById('catalogSearchInput')?.addEventListener('input', e => {
      catSearch = e.target.value;
      renderCatalog();
    });
    document.getElementById('catalogShipFilter')?.addEventListener('change', e => {
      catShipFilter = e.target.value;
      renderCatalog();
    });
    document.getElementById('catalogSortSelect')?.addEventListener('change', e => {
      catSort = e.target.value;
      renderCatalog();
    });

    document.querySelectorAll('.view-mode-toggle .vmode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-mode-toggle .vmode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        catViewMode = btn.getAttribute('data-mode');
        renderCatalog();
      });
    });

    // Workshop reset
    document.getElementById('btnResetWorkshop')?.addEventListener('click', () => {
      PERSIST.resetUpgrades();
      renderWorkshop();
      updateCockpitDetails();
    });

    // Launch Battle
    document.getElementById('btnLaunchBattle')?.addEventListener('click', launchBattle);
  }

  // Başlangıç
  refreshProfileHeader();
  initSidebarNavigation();
  renderShipRoster();
  renderLobbyMaps();
  updateCockpitDetails();
  bindEvents();
  initTurntableAnimation();
  initBackgroundStars();
})();

