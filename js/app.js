function route() {
  const raw  = window.location.hash || '#home';
  const hash = raw.startsWith('#collection#') ? '#collection' : raw;
  const teamScroll = raw.startsWith('#collection#') ? raw.replace('#collection#', '') : null;

  if (hash === '#home' || hash === '') {
    renderHome();
  } else if (hash === '#collection') {
    renderCollection(teamScroll);
  } else if (hash === '#pack') {
    renderPack();
  } else if (hash === '#lineup') {
    renderLineup();
  } else if (hash === '#gallery') {
    renderGallery();
  } else {
    renderHome();
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);
