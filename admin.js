// admin.js — handles the add form, the list, and JSON backup.

const form = document.getElementById('add-form');
const nameInput = document.getElementById('name-input');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const listEl = document.getElementById('admin-list');
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');

function renderAdminList() {
  const list = loadCompetitions()
    .slice()
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  if (list.length === 0) {
    listEl.innerHTML = '<p class="empty-row">Henüz yarışma eklenmedi.</p>';
    return;
  }

  const now = new Date();
  listEl.innerHTML = list
    .map((c) => {
      const isPast = new Date(c.datetime) <= now;
      return `
        <div class="admin-row ${isPast ? 'is-past' : ''}">
          <div class="admin-row-main">
            <span class="admin-row-name">${escapeHTML(c.name)}</span>
            <span class="admin-row-date">${formatDateTR(c.datetime)}</span>
          </div>
          <button class="btn-delete" data-id="${c.id}" type="button">Sil</button>
        </div>`;
    })
    .join('');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value || '00:00';
  if (!name || !date) return;

  const iso = new Date(`${date}T${time}`).toISOString();
  addCompetition(name, iso);

  form.reset();
  timeInput.value = '09:00';
  renderAdminList();
});

listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;
  if (!confirm('Bu yarışmayı silmek istediğine emin misin?')) return;
  deleteCompetition(btn.dataset.id);
  renderAdminList();
});

exportBtn.addEventListener('click', () => {
  const data = loadCompetitions();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'yarismalar-yedek.json';
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener('change', () => {
  const file = importInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error('Geçersiz format');
      saveCompetitions(parsed);
      renderAdminList();
      alert('Yedek yüklendi.');
    } catch (e) {
      alert('Dosya okunamadı. Geçerli bir yedek dosyası seç.');
    }
  };
  reader.readAsText(file);
  importInput.value = '';
});

renderAdminList();
