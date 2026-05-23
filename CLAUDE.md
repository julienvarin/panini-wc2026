# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

```bash
npx serve -l 3456 .
# Open http://localhost:3456
```

No build step. Open `index.html` directly in a browser or use the serve command above (configured in `.claude/launch.json`).

## Architecture

Vanilla HTML/CSS/JS SPA with hash-based routing (`#home`, `#collection`, `#pack`, `#collection#<teamId>`). No framework, no bundler, no dependencies.

**JS load order matters** — `index.html` loads scripts in this sequence:
1. `js/data.js` — all player data + `TEAMS`, `ALL_PLAYERS`, `TOTAL_STICKERS`
2. `js/collection.js` — localStorage helpers
3. `js/pack.js` — pack opening logic
4. `js/ui.js` — DOM rendering functions
5. `js/app.js` — router + event wiring (entry point)

**CSS responsibilities:**
- `css/style.css` — layout, typography, retro paper theme, home/collection views
- `css/cards.css` — sticker card anatomy, rare shimmer animation, duplicate badge
- `css/pack.css` — pack graphic, rip/reveal animation, card flip (CSS 3D `rotateY`)

## Data Model

208 stickers total (8 teams × 26 players). ID ranges are global sticker numbers:

| Team | ID range |
|------|----------|
| Brazil | 1–26 |
| Argentina | 27–52 |
| France | 53–78 |
| England | 79–104 |
| Spain | 105–130 |
| Germany | 131–156 |
| Portugal | 157–182 |
| Netherlands | 183–208 |

Each player: `{ id, number, firstName, lastName, age, club, position, isRare, tmId }` where `number` is 1–26 within the team, `id` is the global sticker number, and `tmId` is a Transfermarkt numeric ID (used historically, now superseded by local photo files).

`TOTAL_STICKERS` is computed dynamically as `ALL_PLAYERS.length` — never hardcode 208.

## localStorage Schema

- Key `panini_collection`: `{ [stickerId]: count }` — e.g. `{ "7": 3, "42": 1 }`
- Key `panini_meta`: `{ packsOpened: number }`

## Player Photos

Local JPEGs at `images/players/{id}.jpg`. Cards use `onerror` to fall back to a CSS initials circle if the image is missing or fails to load.

**Download utilities** (run when photos are missing after squad/ID changes):
- `download_missing.sh` — downloads from Wikipedia REST API by player ID + article name
- `download_curl.sh` — original download script (older squad IDs)
- `download_wiki.js` / `download_photos.js` — Node.js alternatives
- `remap_photos.py` — remaps photo files when player IDs change (three-phase: stage to temp → remove old → place new, to avoid ID collision conflicts)

## Rarity System

- `isRare: true` on a player → 40% chance of gold treatment per pull
- Common players (`isRare: false`) → 5% chance
- Each pulled card gets a `pulledAsRare` flag; rare cards render with gold border + shimmer keyframe

## Pack Opening Flow

`openPack()` in `pack.js` picks 7 unique random players from `ALL_PLAYERS`, applies rarity rolls, returns array with `pulledAsRare` flag. The UI sequence: pack graphic → shake (`.ripping`) → split (`clip-path`, `.torn`) → 7 face-down cards → click each to flip → "Add to Album" → `addStickers()` → redirect to `#collection`.

## Squad Data Notes

Spain, Argentina, and Netherlands squads in `data.js` are based on pre-announcement predictions (as of May 2026) — update when official lists are confirmed. Brazil (May 18), France (May 14), England (May 22), Germany (May 21), Portugal (May 19) are official.
