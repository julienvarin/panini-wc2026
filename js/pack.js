const PACK_SIZE = 7;

function openPack() {
  const drawn = [];
  const pool = [...ALL_PLAYERS];

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Pick PACK_SIZE unique stickers
  const picked = pool.slice(0, PACK_SIZE);

  // Apply rarity treatment per card
  return picked.map(player => {
    const rareChance = player.isRare ? 0.40 : 0.05;
    const pulledAsRare = Math.random() < rareChance;
    return { ...player, pulledAsRare };
  });
}
