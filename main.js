// main.js — renders the public countdown panel.

function tileGroup(value, label) {
  const str = String(Math.max(0, value)).padStart(2, '0');
  const tiles = str
    .split('')
    .map((d) => `<span class="tile">${d}</span>`)
    .join('');
  return `
    <div class="tile-group">
      <div class="tiles">${tiles}</div>
      <div class="tile-label">${label}</div>
    </div>`;
}

function renderHero(next) {
  const heroEl = document.getElementById('hero');

  if (!next) {
    heroEl.innerHTML = `
      <div class="hero empty">
        <p class="empty-text">Yaklaşan yarışma yok.</p>
        <a class="empty-link" href="admin.html">Admin panelinden yarışma ekle</a>
      </div>`;
    return;
  }

  const d = diffParts(next.datetime);
  heroEl.innerHTML = `
    <div class="hero">
      <p class="hero-eyebrow">Sıradaki</p>
      <h1 class="hero-name">${escapeHTML(next.name)}</h1>
      <div class="board">
        ${tileGroup(d.days, 'GÜN')}
        ${tileGroup(d.hours, 'SAAT')}
        ${tileGroup(d.minutes, 'DAKİKA')}
        ${tileGroup(d.seconds, 'SANİYE')}
      </div>
      <p class="hero-date">${formatDateTR(next.datetime)}</p>
    </div>`;
}

function renderList(containerId, items, finished) {
  const el = document.getElementById(containerId);

  if (items.length === 0) {
    el.innerHTML = `<p class="empty-row">${
      finished ? 'Henüz tamamlanmış yarışma yok.' : 'Başka yaklaşan yarışma yok.'
    }</p>`;
    return;
  }

  el.innerHTML = items
    .map((c) => {
      const d = diffParts(c.datetime);
      const countdownText = finished
        ? 'Tamamlandı'
        : `${d.days} gün ${d.hours} saat ${d.minutes} dk`;
      return `
        <div class="row">
          <span class="row-name">${escapeHTML(c.name)}</span>
          <span class="row-countdown">${countdownText}</span>
          <span class="row-date">${formatDateTR(c.datetime)}</span>
        </div>`;
    })
    .join('');
}

function render() {
  const list = loadCompetitions();
  const now = new Date();

  const upcoming = list
    .filter((c) => new Date(c.datetime) > now)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  const finished = list
    .filter((c) => new Date(c.datetime) <= now)
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

  const [next, ...rest] = upcoming;

  renderHero(next || null);
  renderList('upcoming-list', rest, false);
  renderList('finished-list', finished, true);
}

render();
setInterval(render, 1000);
