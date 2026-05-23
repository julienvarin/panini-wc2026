function route() {
  const raw  = window.location.hash || '#home';
  // Support #collection#teamId for direct scroll-to
  const hash = raw.startsWith('#collection#') ? '#collection' : raw;
  const teamScroll = raw.startsWith('#collection#') ? raw.replace('#collection#', '') : null;

  if (hash === '#home' || hash === '') {
    renderHome();
  } else if (hash === '#collection') {
    renderCollection(teamScroll);
  } else if (hash === '#pack') {
    renderPack();
  } else {
    renderHome();
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);
