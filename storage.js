// storage.js — shared data layer for the contest countdown panel.
// All competition data lives in the browser's localStorage on this device.

const STORAGE_KEY = 'tpc_panel_competitions';

function loadCompetitions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Veri okunamadı:', e);
    return [];
  }
}

function saveCompetitions(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error('Veri kaydedilemedi:', e);
    return false;
  }
}

function addCompetition(name, datetimeISO) {
  const list = loadCompetitions();
  list.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: name.trim(),
    datetime: datetimeISO
  });
  saveCompetitions(list);
  return list;
}

function deleteCompetition(id) {
  const list = loadCompetitions().filter((c) => c.id !== id);
  saveCompetitions(list);
  return list;
}

function diffParts(targetISO, now) {
  const target = new Date(targetISO);
  const current = now || new Date();
  const ms = target.getTime() - current.getTime();
  const past = ms <= 0;
  const abs = Math.abs(ms);
  return {
    past,
    days: Math.floor(abs / 86400000),
    hours: Math.floor((abs % 86400000) / 3600000),
    minutes: Math.floor((abs % 3600000) / 60000),
    seconds: Math.floor((abs % 60000) / 1000)
  };
}

function formatDateTR(iso) {
  const d = new Date(iso);
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
