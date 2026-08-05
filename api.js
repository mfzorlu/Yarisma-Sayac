// api.js — client-side helpers. GET istekleri şifresiz,
// yazma istekleri SHA-256 hashlenmiş şifre gönderir.

const API_URL = '/api/competitions';

// --- Yardımcı fonksiyonlar ---

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
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// SHA-256 hash — Web Crypto API, yerleşik, kütüphane gerekmez
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- API çağrıları ---

async function fetchCompetitions() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Veri alınamadı (sunucu hatası).');
  const data = await res.json();
  return Array.isArray(data.competitions) ? data.competitions : [];
}

async function checkPassword(password) {
  const hash = await sha256(password);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hash}` },
    body: JSON.stringify({ __check: true }) // sunucu name/datetime kontrolü yapacak, 400 dönecek ama 401 değil
  });
  // 400 = şifre doğru ama eksik alan (beklenen), 401 = şifre yanlış
  return res.status !== 401;
}

async function authHeaders(password) {
  const hash = await sha256(password);
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${hash}` };
}

async function addCompetitionRemote(password, name, datetimeISO) {
  const headers = await authHeaders(password);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, datetime: datetimeISO })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Eklenemedi (sunucu kodu: ${res.status}).`);
  }
  return (await res.json()).competitions;
}

async function deleteCompetitionRemote(password, id) {
  const headers = await authHeaders(password);
  const res = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE', headers
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Silinemedi (sunucu kodu: ${res.status}).`);
  }
  return (await res.json()).competitions;
}

async function replaceCompetitionsRemote(password, list) {
  const headers = await authHeaders(password);
  const res = await fetch(API_URL, {
    method: 'PUT', headers,
    body: JSON.stringify({ competitions: list })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Yedek yüklenemedi (sunucu kodu: ${res.status}).`);
  }
  return (await res.json()).competitions;
}
