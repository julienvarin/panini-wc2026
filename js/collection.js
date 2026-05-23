const COLLECTION_KEY = 'panini_collection';
const META_KEY = 'panini_meta';

function getCollection() {
  try { return JSON.parse(localStorage.getItem(COLLECTION_KEY)) || {}; }
  catch { return {}; }
}

function getMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY)) || { packsOpened: 0 }; }
  catch { return { packsOpened: 0 }; }
}

function saveCollection(col) {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(col));
}

function saveMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function addSticker(id) {
  const col = getCollection();
  col[id] = (col[id] || 0) + 1;
  saveCollection(col);
}

function addStickers(ids) {
  const col = getCollection();
  ids.forEach(id => { col[id] = (col[id] || 0) + 1; });
  saveCollection(col);
}

function getCount(id) {
  return getCollection()[id] || 0;
}

function getTotalUnique() {
  return Object.values(getCollection()).filter(v => v > 0).length;
}

function getTotalDuplicates() {
  return Object.values(getCollection()).reduce((sum, v) => sum + Math.max(0, v - 1), 0);
}

function getPacksOpened() {
  return getMeta().packsOpened;
}

function incrementPacksOpened() {
  const meta = getMeta();
  meta.packsOpened = (meta.packsOpened || 0) + 1;
  saveMeta(meta);
}

function resetCollection() {
  localStorage.removeItem(COLLECTION_KEY);
  localStorage.removeItem(META_KEY);
}
