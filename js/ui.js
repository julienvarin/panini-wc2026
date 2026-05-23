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

// ── Sticker Card HTML ────────────────────────────────────────────────────────
// reveal=true → always show player info (pack reveal)
// reveal=false → hide if not collected (collection view)
function stickerCardHTML(player, owned, reveal = false, pulledAsRare = false) {
  const count   = owned !== undefined ? owned : getCount(player.id);
  const team    = TEAMS[player.teamId];
  const show    = reveal || count > 0;
  const isRare  = pulledAsRare;
  const fullName = [player.firstName, player.lastName].filter(Boolean).join(' ');
  const ini      = initials(player);

  const rareClass  = isRare ? 'rare' : '';
  const missClass  = !show ? 'missing' : '';
  const dupBadge   = count > 1 ? `<span class="dup-badge">×${count}</span>` : '';
  const rareBadge  = isRare ? `<span class="card-rare-badge">★ RARE</span>` : '';

  const photoHTML = show ? `
    <img class="card-photo" src="${photoUrl(player.id)}"
         alt="${fullName}"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <div class="card-initials" style="background:${team.color};color:${team.accent};display:none">${ini}</div>
  ` : `
    <div class="card-initials-q">?</div>
  `;

  return `
    <div class="sticker-card ${rareClass} ${missClass}" data-id="${player.id}">
      <div class="card-header" style="background:${team.color};color:${team.textColor}">
        <span class="card-flag">${team.flag}</span>
        <span class="card-team">${team.name.toUpperCase()}</span>
        <span class="card-number">#${String(player.number).padStart(2,'0')}</span>
        ${dupBadge}
      </div>
      <div class="card-photo-wrap" style="${!show ? 'background:#D4C4A0;' : ''}">
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

function renderHome() {
  const unique = getTotalUnique();
  const packs  = getPacksOpened();
  const dups   = getTotalDuplicates();
  const pct    = Math.round((unique / TOTAL_STICKERS) * 100);

  document.getElementById('app').innerHTML = `
    <div class="home-view">

      <div class="home-logo">
        <div class="corner-stamp">FIFA<br>WC<br>2026</div>
        <div class="logo-edition">Official Sticker Collection</div>
        <div class="logo-title">
          FIFA WORLD CUP
          <span class="logo-year">2026</span>
        </div>
        <div class="logo-sub">Complete your album · ${TOTAL_STICKERS} stickers</div>
      </div>

      <div class="stats-strip">
        <div class="stat-cell">
          <div class="stat-num">${unique}<small>/${TOTAL_STICKERS}</small></div>
          <div class="stat-lbl">Stickers</div>
        </div>
        <div class="stat-cell">
          <div class="stat-num">${pct}<small>%</small></div>
          <div class="stat-lbl">Complete</div>
        </div>
        <div class="stat-cell">
          <div class="stat-num">${packs}</div>
          <div class="stat-lbl">Packs</div>
        </div>
        <div class="stat-cell">
          <div class="stat-num">${dups}</div>
          <div class="stat-lbl">Dupes</div>
        </div>
      </div>

      <div class="ruler-wrap">
        <div class="ruler-fill" style="width:${pct}%"></div>
        <span class="ruler-label">${pct}% complete</span>
      </div>

      <div class="home-actions">
        <a href="#collection" class="btn btn-secondary">📖 My Album</a>
        <a href="#pack"       class="btn btn-primary">🎴 Open a Pack</a>
      </div>

      <div class="home-teams">
        ${Object.entries(TEAMS).map(([id, t]) => {
          const teamUnique = t.players.filter(p => getCount(p.id) > 0).length;
          const tPct = Math.round((teamUnique / t.players.length) * 100);
          return `<a href="#collection#${id}" class="mini-nation" style="border-color:${t.color}">
            <span class="mini-flag-lg">${t.flag}</span>
            <span class="mini-nation-name">${t.name}</span>
            <div class="mini-nation-bar"><div class="mini-nation-fill" style="width:${tPct}%;background:${t.color}"></div></div>
            <span class="mini-nation-pct">${teamUnique}/${t.players.length} · ${tPct}%</span>
          </a>`;
        }).join('')}
      </div>

    </div>`;
}

// ─── ALBUM COLLECTION (all teams, one page) ──────────────────────────────────

function renderCollection(scrollToTeam) {
  const totalUnique = getTotalUnique();

  const sectionsHTML = Object.entries(TEAMS).map(([teamId, team]) => {
    const owned = team.players.filter(p => getCount(p.id) > 0).length;
    const pct   = Math.round((owned / team.players.length) * 100);
    const fillColor = team.accent === '#fff' ? team.color : team.accent;

    return `
      <div class="album-section" id="section-${teamId}" style="--section-color:${team.color}">
        <div class="album-section-header">
          <span class="album-section-flag">${team.flag}</span>
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

  // Floating nation nav
  const navHTML = `
    <nav class="album-nav" aria-label="Jump to country">
      ${Object.entries(TEAMS).map(([id, t]) => `
        <a class="album-nav-dot" href="#" title="${t.name}"
           onclick="event.preventDefault();document.getElementById('section-${id}').scrollIntoView({behavior:'smooth'})"
        >${t.flag}</a>`).join('')}
    </nav>`;

  document.getElementById('app').innerHTML = `
    <div class="collection-view">
      <div class="view-header">
        <a href="#home" class="btn btn-ghost">← Back</a>
        <h2>📖 My Album</h2>
        <div class="view-sub">${totalUnique} / ${TOTAL_STICKERS} stickers collected</div>
      </div>
      ${sectionsHTML}
    </div>
    ${navHTML}`;

  // Scroll to specific team if requested (from home quick-link)
  if (scrollToTeam) {
    requestAnimationFrame(() => {
      const el = document.getElementById(`section-${scrollToTeam}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }
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

  // Shake phase
  packWrap.classList.add('ripping');

  setTimeout(() => {
    packWrap.classList.remove('ripping');
    packWrap.classList.add('torn');

    setTimeout(() => {
      packWrap.style.display = 'none';
      openBtn.style.display  = 'none';
      showPackCards();
    }, 720);
  }, 700);
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
  if (!card || card.classList.contains('flipped')) return;
  card.classList.add('flipped');
  _flippedCount++;
  if (_flippedCount === _currentPack.length) {
    setTimeout(() => {
      document.getElementById('packAddWrap').style.display = 'flex';
    }, 500);
  }
}

function handleAddToCollection() {
  addStickers(_currentPack.map(p => p.id));
  window.location.hash = '#collection';
}
