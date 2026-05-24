// ─── Helpers ────────────────────────────────────────────────────────────────

function photoUrl(playerId) {
  return `images/players/${playerId}.jpg`;
}

function initials(p) {
  const a = p.firstName ? p.firstName[0] : '';
  const b = p.lastName  ? p.lastName[0]  : (p.firstName?.[1] || '');
  return (a + b).toUpperCase();
}

const POS_LABEL = { GK:'GK', CB:'CB', RB:'RB', LB:'LB', CDM:'CDM', CM:'CM', CAM:'CAM', RW:'RW', LW:'LW', ST:'ST' };

// Circle flag image — flagcdn only accepts: 20, 40, 80, 160, 320
function flagCircle(teamId, size = 'md') {
  const team = TEAMS[teamId];
  if (!team || !team.flagCode) return '';
  const cdnW = size === 'lg' ? 80 : 40;
  return `<img class="flag-circle flag-circle--${size}"
               src="https://flagcdn.com/w${cdnW}/${team.flagCode}.png"
               alt="${team.name}"
               onerror="this.style.opacity=0">`;
}

// ── Sticker Card HTML ────────────────────────────────────────────────────────
function stickerCardHTML(player, owned, reveal = false, pulledAsRare = false) {
  const count   = owned !== undefined ? owned : getCount(player.id);
  const team    = TEAMS[player.teamId];
  const show    = reveal || count > 0;
  const isRare  = pulledAsRare;
  const fullName = [player.firstName, player.lastName].filter(Boolean).join(' ');
  const ini      = initials(player);

  const rareClass = isRare ? 'rare' : '';
  const missClass = !show ? 'missing' : '';
  const dupBadge  = count > 1 ? `<span class="dup-badge">×${count}</span>` : '';
  const rareBadge = isRare ? `<span class="card-rare-badge">★ RARE</span>` : '';

  const photoHTML = show ? `
    <img class="card-photo" src="${photoUrl(player.id)}"
         alt="${fullName}"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <div class="card-initials" style="background:${team.color};display:none">
      <svg class="card-silhouette" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="36" r="24" fill="white"/>
        <path d="M8 118 Q8 72 50 72 Q92 72 92 118Z" fill="white"/>
      </svg>
    </div>
  ` : `
    <div class="card-initials-q">?</div>
  `;

  return `
    <div class="sticker-card ${rareClass} ${missClass}" data-id="${player.id}">
      <div class="card-header" style="background:${team.color}">
        ${flagCircle(player.teamId, 'sm')}
        <span class="card-team">${team.name.toUpperCase()}</span>
        <span class="card-number">#${String(player.number).padStart(2,'0')}</span>
        ${dupBadge}
      </div>
      <div class="card-photo-wrap">
        ${photoHTML}
        ${!show ? '<div class="missing-overlay"></div>' : ''}
      </div>
      <div class="card-info">
        <div class="card-name">${show ? fullName.toUpperCase() : '???'}</div>
        ${show ? `
          <div class="card-meta">
            <span class="card-pos">${POS_LABEL[player.position] || player.position}</span>
            <span class="card-age">${player.age} yrs</span>
          </div>
          <div class="card-club">${player.club}</div>
          ${rareBadge}
        ` : ''}
      </div>
      <span class="card-sticker-num">${player.id}</span>
    </div>`;
}

// ─── HOME ────────────────────────────────────────────────────────────────────

function handleClearCollection() {
  if (!confirm('Reset your entire collection? This cannot be undone.')) return;
  resetCollection();
  clearLineup();
  renderHome();
}

function renderHome() {
  const unique = getTotalUnique();
  const packs  = getPacksOpened();
  const dups   = getTotalDuplicates();
  const rare   = getTotalRareCount();
  const pct    = Math.round((unique / TOTAL_STICKERS) * 100);

  document.getElementById('app').innerHTML = `
    <div class="home-view">

      <div class="home-logo">
        <div class="logo-title">
          FIFA WORLD CUP
          <span class="logo-year">2026</span>
        </div>
      </div>

      <div class="stats-strip">
        <div class="stat-cell">
          <div class="stat-num">${unique}<small>/${TOTAL_STICKERS}</small></div>
          <div class="stat-lbl">Stickers</div>
        </div>
        <div class="stat-cell">
          <div class="stat-num stat-gold">${rare}</div>
          <div class="stat-lbl">Rare Cards</div>
        </div>
        <div class="stat-cell stat-red">
          <div class="stat-num">${packs}</div>
          <div class="stat-lbl">Packs Opened</div>
        </div>
        <div class="stat-cell">
          <div class="stat-num">${dups}</div>
          <div class="stat-lbl">Duplicates</div>
        </div>
      </div>

      <div class="ruler-wrap">
        <div class="ruler-fill" style="width:${pct}%"></div>
        <span class="ruler-label">${pct}% complete</span>
      </div>

      <div class="home-actions">
        <a href="#collection" class="btn btn-secondary">📖 My Album</a>
        <a href="#pack"       class="btn btn-primary">🎴 Open a Pack</a>
        <a href="#lineup"     class="btn btn-secondary">⚽ Starting 11</a>
      </div>

      <div class="home-meta">
        <button class="btn btn-ghost btn-clear" onclick="handleClearCollection()">Reset Collection</button>
      </div>

      <div class="home-teams">
        ${Object.entries(TEAMS).map(([id, t]) => {
          const teamUnique = t.players.filter(p => getCount(p.id) > 0).length;
          const tPct = Math.round((teamUnique / t.players.length) * 100);
          return `<a href="#collection#${id}" class="mini-nation" style="--section-color:${t.color}">
            ${flagCircle(id, 'lg')}
            <span class="mini-nation-name">${t.name}</span>
            <div class="mini-nation-bar"><div class="mini-nation-fill" style="width:${tPct}%;background:${t.color}"></div></div>
            <span class="mini-nation-pct">${teamUnique}/${t.players.length} · ${tPct}%</span>
          </a>`;
        }).join('')}
      </div>

    </div>`;
}

// ─── ALBUM COLLECTION ────────────────────────────────────────────────────────

function renderCollection(scrollToTeam) {
  const totalUnique = getTotalUnique();

  const sectionsHTML = Object.entries(TEAMS).map(([teamId, team]) => {
    const owned = team.players.filter(p => getCount(p.id) > 0).length;
    const pct   = Math.round((owned / team.players.length) * 100);
    const fillColor = team.accent === '#fff' ? team.color : team.accent;

    return `
      <div class="album-section" id="section-${teamId}" style="--section-color:${team.color}">
        <div class="album-section-header">
          ${flagCircle(teamId, 'lg')}
          <span class="album-section-name">${team.name.toUpperCase()}</span>
          <div class="album-section-progress">
            <span class="album-section-count">${owned} / ${team.players.length}</span>
            <div class="album-section-bar">
              <div class="album-section-fill" style="width:${pct}%;background:${fillColor}"></div>
            </div>
            <span class="album-section-pct">${pct}% collected</span>
          </div>
        </div>
        <div class="album-grid">
          ${team.players.map(p => stickerCardHTML({...p, teamId}, getCount(p.id))).join('')}
        </div>
      </div>`;
  }).join('');

  const navHTML = `
    <nav class="album-nav" aria-label="Jump to country">
      ${Object.entries(TEAMS).map(([id, t]) => `
        <a class="album-nav-dot" href="#" title="${t.name}"
           style="--section-color:${t.color}"
           onclick="event.preventDefault();document.getElementById('section-${id}').scrollIntoView({behavior:'smooth'})"
        >${flagCircle(id, 'sm')}</a>`).join('')}
    </nav>`;

  document.getElementById('app').innerHTML = `
    <div class="collection-view">
      <div class="view-header">
        <a href="#home" class="btn btn-ghost">← Back</a>
        <h2>📖 My Album</h2>
        <div class="view-sub">${totalUnique} / ${TOTAL_STICKERS} collected</div>
        <a href="#gallery" class="btn btn-ghost">Show All Cards</a>
      </div>
      ${sectionsHTML}
    </div>
    ${navHTML}`;

  if (scrollToTeam) {
    requestAnimationFrame(() => {
      const el = document.getElementById(`section-${scrollToTeam}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// ─── GALLERY (all cards, always revealed — for QA) ───────────────────────────

function renderGallery() {
  const sectionsHTML = Object.entries(TEAMS).map(([teamId, team]) => `
    <div class="album-section" id="gsection-${teamId}" style="--section-color:${team.color}">
      <div class="album-section-header">
        ${flagCircle(teamId, 'lg')}
        <span class="album-section-name">${team.name.toUpperCase()}</span>
        <span class="album-section-pct" style="margin-left:auto">All ${team.players.length} players</span>
      </div>
      <div class="album-grid">
        ${team.players.map(p => stickerCardHTML({...p, teamId}, getCount(p.id), true)).join('')}
      </div>
    </div>`).join('');

  document.getElementById('app').innerHTML = `
    <div class="collection-view">
      <div class="view-header">
        <a href="#collection" class="btn btn-ghost">← Back</a>
        <h2>All Cards</h2>
        <div class="view-sub">${TOTAL_STICKERS} stickers · photos QA</div>
      </div>
      ${sectionsHTML}
    </div>`;
}

// ─── STARTING 11 — 4-2-3-1 ──────────────────────────────────────────────────

const FORMATION_431 = [
  { id: 'st',   label: 'ST',  accepts: ['ST','RW','LW'],        row: 1 },
  { id: 'lw',   label: 'LW',  accepts: ['LW','CAM','RW'],       row: 2 },
  { id: 'cam',  label: 'CAM', accepts: ['CAM','CM','CDM'],      row: 2 },
  { id: 'rw',   label: 'RW',  accepts: ['RW','CAM','LW'],       row: 2 },
  { id: 'cdm1', label: 'CDM', accepts: ['CDM','CM'],            row: 3 },
  { id: 'cdm2', label: 'CDM', accepts: ['CDM','CM'],            row: 3 },
  { id: 'lb',   label: 'LB',  accepts: ['LB','CB'],             row: 4 },
  { id: 'cb1',  label: 'CB',  accepts: ['CB','LB','RB'],        row: 4 },
  { id: 'cb2',  label: 'CB',  accepts: ['CB','LB','RB'],        row: 4 },
  { id: 'rb',   label: 'RB',  accepts: ['RB','CB'],             row: 4 },
  { id: 'gk',   label: 'GK',  accepts: ['GK'],                  row: 5 },
];

let _lineupState  = {};
let _activeSlotId = null;

function renderLineup() {
  _lineupState  = getLineup();
  _activeSlotId = null;

  const rowMap = {};
  FORMATION_431.forEach(s => { (rowMap[s.row] = rowMap[s.row] || []).push(s); });

  const rowsHTML = Object.keys(rowMap).sort((a,b) => a-b).map(row => `
    <div class="pitch-row">
      ${rowMap[row].map(slot => slotHTML(slot)).join('')}
    </div>`).join('');

  document.getElementById('app').innerHTML = `
    <div class="lineup-view">
      <div class="view-header">
        <a href="#home" class="btn btn-ghost">← Back</a>
        <h2>⚽ Starting 11</h2>
        <div class="view-sub">4-2-3-1</div>
        <button class="btn btn-ghost" onclick="clearLineupUI()">Clear</button>
      </div>

      <div class="pitch" id="pitch">
        ${rowsHTML}
        <div class="pitch-line pitch-center"></div>
        <div class="pitch-circle"></div>
      </div>

      <div class="slot-picker-overlay" id="slotPicker" style="display:none" onclick="closeSlotPicker(event)">
        <div class="slot-picker-modal">
          <div class="slot-picker-header">
            <span id="slotPickerTitle">Select Player</span>
            <button class="slot-picker-close" onclick="closeSlotPicker()">✕</button>
          </div>
          <div class="slot-picker-list" id="slotPickerList"></div>
        </div>
      </div>
    </div>`;
}

function slotHTML(slot) {
  const pid    = _lineupState[slot.id];
  const player = pid ? ALL_PLAYERS.find(p => p.id === Number(pid)) : null;
  const team   = player ? TEAMS[player.teamId] : null;

  if (player && team) {
    const fullName = [player.firstName, player.lastName].filter(Boolean).join(' ');
    return `
      <div class="pitch-slot pitch-slot--filled" onclick="openSlotPicker('${slot.id}')">
        <div class="pitch-slot-photo-wrap" style="border-color:${team.color}">
          <img src="${photoUrl(player.id)}" alt="${fullName}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="pitch-slot-ini" style="background:${team.color};color:#fff;display:none">${initials(player)}</div>
        </div>
        <div class="pitch-slot-name">${player.lastName || player.firstName}</div>
        <div class="pitch-slot-badge" style="background:${team.color}">${slot.label}</div>
      </div>`;
  }

  return `
    <div class="pitch-slot pitch-slot--empty" onclick="openSlotPicker('${slot.id}')">
      <div class="pitch-slot-pos">${slot.label}</div>
    </div>`;
}

function openSlotPicker(slotId) {
  _activeSlotId = slotId;
  const slot = FORMATION_431.find(s => s.id === slotId);
  const col  = getCollection();

  // Show all collected outfield players for any outfield slot; GK-only for GK
  const eligible = ALL_PLAYERS
    .filter(p => {
      if ((col[p.id] || 0) === 0) return false;
      if (slot.id === 'gk') return p.position === 'GK';
      return p.position !== 'GK';
    })
    .sort((a, b) => {
      // Natural-position matches float to top
      const aMatch = slot.accepts.includes(a.position) ? 0 : 1;
      const bMatch = slot.accepts.includes(b.position) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return (a.lastName || a.firstName).localeCompare(b.lastName || b.firstName);
    });

  document.getElementById('slotPickerTitle').textContent = `Select ${slot.label}`;

  const list = document.getElementById('slotPickerList');
  if (!eligible.length) {
    list.innerHTML = `<div class="picker-empty">No collected ${slot.id === 'gk' ? 'GK' : 'outfield'} players in your album yet.</div>`;
  } else {
    list.innerHTML = eligible.map(p => {
      const team = TEAMS[p.teamId];
      const selected = _lineupState[slotId] === p.id;
      return `
        <button class="picker-item${selected ? ' picker-item--active' : ''}"
                onclick="selectSlotPlayer('${slotId}', ${p.id})">
          ${flagCircle(p.teamId, 'sm')}
          <img class="picker-photo" src="${photoUrl(p.id)}" alt=""
               onerror="this.style.display='none'">
          <div class="picker-info">
            <div class="picker-name">${[p.firstName, p.lastName].filter(Boolean).join(' ')}</div>
            <div class="picker-detail">
              <span class="picker-pos" style="background:${team.color}">${p.position}</span>
              ${p.club}
            </div>
          </div>
        </button>`;
    }).join('');
  }

  document.getElementById('slotPicker').style.display = 'flex';
}

function closeSlotPicker(e) {
  if (e && e.target !== document.getElementById('slotPicker')) return;
  document.getElementById('slotPicker').style.display = 'none';
  _activeSlotId = null;
}

function selectSlotPlayer(slotId, playerId) {
  // Remove this player from any other slot first
  Object.keys(_lineupState).forEach(k => {
    if (_lineupState[k] === playerId) delete _lineupState[k];
  });
  _lineupState[slotId] = playerId;
  saveLineup(_lineupState);
  document.getElementById('slotPicker').style.display = 'none';
  _activeSlotId = null;
  renderLineup();
}

function clearLineupUI() {
  if (!confirm('Clear your Starting 11?')) return;
  clearLineup();
  renderLineup();
}

// ─── PACK OPENING ────────────────────────────────────────────────────────────

let _currentPack = [];
let _flippedCount = 0;

function renderPack() {
  _currentPack = [];
  _flippedCount = 0;

  document.getElementById('app').innerHTML = `
    <div class="pack-view">
      <div class="view-header">
        <a href="#home" class="btn btn-ghost">← Back</a>
        <h2>🎴 Open a Pack</h2>
        <div class="view-sub">${getPacksOpened()} packs opened</div>
      </div>

      <div class="pack-stage">

        <div class="pack-wrap" id="packWrap">
          <div class="pack-body">
            <div class="pack-tearstrip">✂ &nbsp; tear here &nbsp; ✂</div>
            <div class="pack-content">
              <div class="pack-brand">PANINI<small>WC 2026</small></div>
              <div class="pack-flags-row">🇧🇷 🇦🇷 🇫🇷 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇪🇸 🇩🇪 🇵🇹 🇳🇱</div>
              <div class="pack-inside-text">7 stickers inside</div>
            </div>
          </div>
          <div class="pack-top-half" id="packTopHalf"></div>
          <div class="pack-bot-half" id="packBotHalf"></div>
        </div>

        <button class="btn btn-primary pack-open-btn" id="openBtn" onclick="handleOpenPack()">
          ✂ Rip It Open!
        </button>

        <div class="pack-cards-row" id="packCards" style="display:none"></div>

        <div class="pack-add-wrap" id="packAddWrap" style="display:none">
          <div class="pack-result-label">All stickers revealed!</div>
          <button class="btn btn-primary" onclick="handleAddToCollection()">Add to Album →</button>
        </div>
      </div>
    </div>`;
}

function handleOpenPack() {
  _currentPack = openPack();
  _flippedCount = 0;
  incrementPacksOpened();

  const packWrap = document.getElementById('packWrap');
  const openBtn  = document.getElementById('openBtn');
  openBtn.disabled = true;
  openBtn.textContent = 'Ripping…';

  packWrap.classList.add('ripping');

  setTimeout(() => {
    packWrap.classList.remove('ripping');
    packWrap.classList.add('torn');

    setTimeout(() => {
      packWrap.style.display = 'none';
      openBtn.style.display  = 'none';
      showPackCards();
    }, 720);
  }, 750);
}

function showPackCards() {
  const row = document.getElementById('packCards');
  row.style.display = 'flex';

  row.innerHTML = _currentPack.map((player, i) => `
    <div class="flip-card" id="fc${i}"
         style="transition-delay:${i * 0.07}s"
         onclick="flipCard(${i})">
      <div class="flip-inner">
        <div class="flip-back">
          <div class="flip-back-logo">PANINI<small>WC 2026</small></div>
          <div class="flip-back-flags">⚽🏆⚽</div>
        </div>
        <div class="flip-front">
          ${stickerCardHTML(player, undefined, true, player.pulledAsRare)}
        </div>
      </div>
    </div>`).join('');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => row.classList.add('visible'));
  });
}

function flipCard(i) {
  const card = document.getElementById(`fc${i}`);
  if (!card || card.classList.contains('flipped') || card.classList.contains('flip-phase1')) return;

  // Phase 1: squeeze to invisible (27ms transition defined in CSS)
  card.classList.add('flip-phase1');

  setTimeout(() => {
    // Midpoint: swap faces, reset to scaleX(0) with no transition
    card.classList.remove('flip-phase1');
    card.classList.add('flipped', 'flip-phase2');

    // Phase 2: one rAF later, remove phase2 so CSS transition plays scaleX 0→1
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('flip-phase2')));

    _flippedCount++;
    if (_flippedCount === _currentPack.length) {
      setTimeout(() => {
        document.getElementById('packAddWrap').style.display = 'flex';
      }, 500);
    }
  }, 290);
}

function handleAddToCollection() {
  addStickers(_currentPack.map(p => p.id));
  window.location.hash = '#collection';
}
