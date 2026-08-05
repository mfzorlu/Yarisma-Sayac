// netlify/functions/competitions.js
//
// Shared backend for the countdown panel. Data lives in Netlify Blobs.
// GET is public (so the main panel works for everyone).
// POST / DELETE / PUT require the SHA-256 hash of ADMIN_PASSWORD.

const { connectLambda, getStore } = require('@netlify/blobs');
const crypto = require('crypto');

const STORE_NAME = 'tpc-panel';
const KEY = 'competitions';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

function isAuthorized(event) {
  const secret = process.env.ADMIN_PASSWORD || '';
  if (!secret) return false; // env var tanımlı değilse erişim yok

  const expected = crypto.createHash('sha256').update(secret).digest('hex');
  const header = event.headers.authorization || event.headers.Authorization || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  return token === expected;
}

exports.handler = async (event) => {
  connectLambda(event);
  const store = getStore({ name: STORE_NAME });

  // Herkese açık okuma
  if (event.httpMethod === 'GET') {
    const list = (await store.get(KEY, { type: 'json' })) || [];
    return json(200, { competitions: list });
  }

  // Yazma işlemleri şifre gerektirir
  if (!isAuthorized(event)) {
    return json(401, { error: 'Yetkisiz. Şifre hatalı veya eksik.' });
  }

  if (event.httpMethod === 'POST') {
    let payload;
    try { payload = JSON.parse(event.body || '{}'); }
    catch { return json(400, { error: 'Geçersiz veri.' }); }

    const { name, datetime } = payload;
    if (!name || !datetime) return json(400, { error: 'Yarışma adı ve tarihi gerekli.' });

    const list = (await store.get(KEY, { type: 'json' })) || [];
    list.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: String(name).trim(),
      datetime
    });
    await store.setJSON(KEY, list);
    return json(200, { competitions: list });
  }

  if (event.httpMethod === 'DELETE') {
    const id = event.queryStringParameters?.id;
    if (!id) return json(400, { error: 'id gerekli.' });

    const list = ((await store.get(KEY, { type: 'json' })) || []).filter(c => c.id !== id);
    await store.setJSON(KEY, list);
    return json(200, { competitions: list });
  }

  if (event.httpMethod === 'PUT') {
    let payload;
    try { payload = JSON.parse(event.body || '{}'); }
    catch { return json(400, { error: 'Geçersiz veri.' }); }

    const list = Array.isArray(payload.competitions) ? payload.competitions : [];
    await store.setJSON(KEY, list);
    return json(200, { competitions: list });
  }

  return json(405, { error: 'Desteklenmeyen metod.' });
};
