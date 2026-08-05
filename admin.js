// admin.js — login gate + yarışma ekle/sil/yedekle

const SESSION_KEY = 'tpc_admin_pw';

const loginSection = document.getElementById('login-section');
const adminContent = document.getElementById('admin-content');
const loginForm    = document.getElementById('login-form');
const passwordInput = document.getElementById('password-input');
const loginError   = document.getElementById('login-error');

const addForm    = document.getElementById('add-form');
const nameInput  = document.getElementById('name-input');
const dateInput  = document.getElementById('date-input');
const timeInput  = document.getElementById('time-input');
const addError   = document.getElementById('add-error');
const listEl     = document.getElementById('admin-list');
const exportBtn  = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');
const logoutBtn  = document.getElementById('logout-btn');

let currentPassword = '';
let cachedList = [];

function showAdmin() {
  loginSection.hidden = true;
  adminContent.hidden = false;
}

function showLogin() {
  loginSection.hidden = false;
  adminContent.hidden = true;
}

function renderAdminList() {
  if (cachedList.length === 0) {
    listEl.innerHTML = '<p class="empty-row">Henüz yarışma eklenmedi.</p>';
    return;
  }
  const now = new Date();
  const sorted = cachedList.slice().sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  listEl.innerHTML = sorted.map(c => {
    const isPast = new Date(c.datetime) <= now;
    return `
      <div class="admin-row ${isPast ? 'is-past' : ''}">
        <div class="admin-row-main">
          <span class="admin-row-name">${escapeHTML(c.name)}</span>
          <span class="admin-row-date">${formatDateTR(c.datetime)}</span>
        </div>
        <button class="btn-delete" data-id="${c.id}" type="button">Sil</button>
      </div>`;
  }).join('');
}

async function refreshList() {
  try {
    cachedList = await fetchCompetitions();
    renderAdminList();
  } catch (e) {
    console.error(e);
  }
}

// --- Login ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  const pw = passwordInput.value;

  const ok = await checkPassword(pw);
  if (!ok) {
    loginError.hidden = false;
    passwordInput.value = '';
    return;
  }
  currentPassword = pw;
  sessionStorage.setItem(SESSION_KEY, pw);
  passwordInput.value = '';
  showAdmin();
  await refreshList();
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  currentPassword = '';
  showLogin();
});

// --- Ekle ---
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  addError.hidden = true;
  const name = nameInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value || '00:00';
  if (!name || !date) return;

  const iso = new Date(`${date}T${time}`).toISOString();
  try {
    cachedList = await addCompetitionRemote(currentPassword, name, iso);
    addForm.reset();
    timeInput.value = '09:00';
    renderAdminList();
  } catch (err) {
    addError.textContent = err.message;
    addError.hidden = false;
  }
});

// --- Sil ---
listEl.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;
  if (!confirm('Bu yarışmayı silmek istediğine emin misin?')) return;
  try {
    cachedList = await deleteCompetitionRemote(currentPassword, btn.dataset.id);
    renderAdminList();
  } catch (err) {
    alert(err.message);
  }
});

// --- Yedek İndir ---
exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(cachedList, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'yarismalar-yedek.json';
  a.click();
  URL.revokeObjectURL(url);
});

// --- Yedek Yükle ---
importInput.addEventListener('change', () => {
  const file = importInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error('Geçersiz format');
      cachedList = await replaceCompetitionsRemote(currentPassword, parsed);
      renderAdminList();
      alert('Yedek yüklendi.');
    } catch (e) {
      alert('Dosya okunamadı ya da yüklenemedi: ' + e.message);
    }
  };
  reader.readAsText(file);
  importInput.value = '';
});

// --- Başlangıç: session'da şifre varsa sessizce dene ---
(async () => {
  const saved = sessionStorage.getItem(SESSION_KEY);
  if (saved) {
    const ok = await checkPassword(saved);
    if (ok) {
      currentPassword = saved;
      showAdmin();
      await refreshList();
      return;
    }
    sessionStorage.removeItem(SESSION_KEY);
  }
  showLogin();
})();
