const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const SAMPLE_ROWS = [
  {
    id: 'sample-foreign-1',
    guest_id: 'sample',
    space_key: 'apartment',
    gate_key: 'foreign',
    room_label: '异乡室',
    text: '希望能在异乡找到属于自己的位置，慢慢站稳脚跟，不再那么焦虑和孤单',
    created_at: new Date(0).toISOString(),
    reactions: { same: 3, lamp: 36, bless: 5 }
  },
  {
    id: 'sample-night-1',
    guest_id: 'sample',
    space_key: 'apartment',
    gate_key: 'night',
    room_label: '夜归室',
    text: '希望回到房间时，能先睡一个好觉，明天再重新出发',
    created_at: new Date(0).toISOString(),
    reactions: { same: 2, lamp: 24, bless: 4 }
  },
  {
    id: 'sample-waiting-1',
    guest_id: 'sample',
    space_key: 'care-room',
    gate_key: 'waiting',
    room_label: '陪护室',
    text: '希望今晚病房里平安一点，也希望我能撑到医生明天查房',
    created_at: new Date(0).toISOString(),
    reactions: { same: 2, lamp: 21, bless: 3 }
  }
];

const FALLBACK_WISHES = SAMPLE_ROWS.map((row) => ({ ...row, reactions: { ...row.reactions } }));
const FALLBACK_REACTIONS = [];

function isPublicWish(row) {
  return row && !String(row.guest_id || '').startsWith('debug-');
}

function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function sanitizeText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 500);
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function supabaseFetch(path, options = {}) {
  if (!isConfigured()) {
    const error = new Error('Supabase is not configured');
    error.code = 'SUPABASE_NOT_CONFIGURED';
    throw error;
  }
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(data?.message || response.statusText);
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

async function ensureGuest(guestId) {
  const id = sanitizeText(guestId, `guest-${Date.now()}`);
  if (!isConfigured()) {
    return { guest_id: id, display_name: '匿名住民', local: true };
  }
  const existing = await supabaseFetch(`paralodge_guests?guest_id=eq.${encodeURIComponent(id)}&limit=1`);
  if (existing?.[0]) return existing[0];
  const created = await supabaseFetch('paralodge_guests', {
    method: 'POST',
    body: JSON.stringify([{ guest_id: id, display_name: '匿名住民' }])
  });
  return created[0];
}

function countReactions(rows, wishId) {
  return rows
    .filter((row) => row.wish_id === wishId)
    .reduce((acc, row) => {
      acc[row.kind] = (acc[row.kind] || 0) + 1;
      return acc;
    }, { same: 0, lamp: 0, bless: 0 });
}

async function listWishes({ spaceKey, gateKey, limit = 10 } = {}) {
  if (!isConfigured()) {
    return FALLBACK_WISHES
      .filter(isPublicWish)
      .filter((row) => (!spaceKey || row.space_key === spaceKey) && (!gateKey || row.gate_key === gateKey))
      .slice(0, limit);
  }
  const filters = [];
  if (spaceKey) filters.push(`space_key=eq.${encodeURIComponent(spaceKey)}`);
  if (gateKey) filters.push(`gate_key=eq.${encodeURIComponent(gateKey)}`);
  filters.push(`order=created_at.desc`);
  filters.push(`limit=${Math.max(1, Math.min(Number(limit) || 10, 10))}`);
  filters.push(`guest_id=not.like.debug-*`);
  const wishes = await supabaseFetch(`paralodge_wishes?${filters.join('&')}`);
  if (!wishes.length) return [];
  const ids = wishes.map((wish) => wish.id).join(',');
  const reactions = await supabaseFetch(`paralodge_reactions?wish_id=in.(${ids})`);
  return wishes.map((wish) => ({
    ...wish,
    reactions: countReactions(reactions, wish.id)
  }));
}

async function createWish(payload) {
  const guest = await ensureGuest(payload.guestId);
  const text = sanitizeText(payload.text);
  if (!text) {
    const error = new Error('请先写一句真正想放下的话');
    error.status = 400;
    throw error;
  }
  if (!isConfigured()) {
    const row = {
      id: `local-${Date.now()}`,
      guest_id: guest.guest_id,
      space_key: sanitizeText(payload.spaceKey, 'apartment'),
      gate_key: sanitizeText(payload.gateKey, 'foreign'),
      place_key: sanitizeText(payload.placeKey),
      room_label: sanitizeText(payload.roomLabel, '异乡室'),
      text,
      created_at: new Date().toISOString(),
      reactions: { same: 0, lamp: 1, bless: 0 },
      local: true
    };
    FALLBACK_WISHES.unshift(row);
    return row;
  }
  const row = {
    guest_id: guest.guest_id,
    space_key: sanitizeText(payload.spaceKey, 'apartment'),
    gate_key: sanitizeText(payload.gateKey, 'foreign'),
    place_key: sanitizeText(payload.placeKey) || null,
    room_label: sanitizeText(payload.roomLabel, '异乡室'),
    text,
    visibility: 'anonymous_public',
    status: 'active'
  };
  const created = await supabaseFetch('paralodge_wishes', {
    method: 'POST',
    body: JSON.stringify([row])
  });
  await createEvent({ guestId: guest.guest_id, eventType: 'wish_created', payload: { wish_id: created[0].id } });
  return created[0];
}

async function createReaction(payload) {
  const guest = await ensureGuest(payload.guestId);
  const kind = ['same', 'lamp', 'bless'].includes(payload.kind) ? payload.kind : 'lamp';
  if (!isConfigured()) {
    const row = { id: `local-${Date.now()}`, guest_id: guest.guest_id, wish_id: payload.wishId, kind, created_at: new Date().toISOString(), local: true };
    FALLBACK_REACTIONS.unshift(row);
    const wish = FALLBACK_WISHES.find((item) => item.id === payload.wishId);
    if (wish) {
      wish.reactions = wish.reactions || { same: 0, lamp: 0, bless: 0 };
      wish.reactions[kind] = (wish.reactions[kind] || 0) + 1;
    }
    return row;
  }
  const created = await supabaseFetch('paralodge_reactions', {
    method: 'POST',
    body: JSON.stringify([{ guest_id: guest.guest_id, wish_id: payload.wishId, kind }])
  });
  await createEvent({ guestId: guest.guest_id, eventType: `reaction_${kind}`, payload: { wish_id: payload.wishId } });
  return created[0];
}

async function createReturn(payload) {
  const guest = await ensureGuest(payload.guestId);
  const row = {
    guest_id: guest.guest_id,
    wish_id: payload.wishId || null,
    status: sanitizeText(payload.status, '还在路上'),
    text: sanitizeText(payload.text, '我回来看一眼，灯还亮着')
  };
  if (!isConfigured()) return { ...row, id: `local-${Date.now()}`, local: true };
  const created = await supabaseFetch('paralodge_returns', {
    method: 'POST',
    body: JSON.stringify([row])
  });
  await createEvent({ guestId: guest.guest_id, eventType: 'return_created', payload: { status: row.status } });
  return created[0];
}

async function createMeetupSignup(payload) {
  const guest = await ensureGuest(payload.guestId);
  const row = {
    guest_id: guest.guest_id,
    source_space: sanitizeText(payload.sourceSpace),
    source_gate: sanitizeText(payload.sourceGate),
    note: sanitizeText(payload.note, '想看看一楼小桌'),
    status: 'interested'
  };
  if (!isConfigured()) return { ...row, id: `local-${Date.now()}`, local: true };
  const created = await supabaseFetch('paralodge_meetup_signups', {
    method: 'POST',
    body: JSON.stringify([row])
  });
  return created[0];
}

async function createEvent({ guestId, eventType, payload = {} }) {
  if (!isConfigured()) return null;
  return supabaseFetch('paralodge_events', {
    method: 'POST',
    body: JSON.stringify([{ guest_id: guestId, event_type: eventType, payload }])
  });
}

async function listEchoes(guestId) {
  const guest = await ensureGuest(guestId);
  if (!isConfigured()) {
    const ownWishes = FALLBACK_WISHES.filter((wish) => wish.guest_id === guest.guest_id);
    const ownIds = new Set(ownWishes.map((wish) => wish.id));
    const wishById = Object.fromEntries(ownWishes.map((wish) => [wish.id, wish]));
    const names = { same: '有人说，他也在你这一关', lamp: '有人给你的愿望点了一盏灯', bless: '有人把“愿你过关”留在你的门边' };
    const echoes = FALLBACK_REACTIONS
      .filter((reaction) => ownIds.has(reaction.wish_id) && reaction.guest_id !== guest.guest_id)
      .slice(0, 10)
      .map((reaction) => ({
        title: names[reaction.kind] || '有人回应了你',
        text: `${wishById[reaction.wish_id]?.room_label || '你的房间'}：${wishById[reaction.wish_id]?.text || '灯还亮着'}`
      }));
    if (echoes.length) return echoes;
    return [
      { title: '有人给你的愿望点了一盏灯', text: '这栋楼很安静，但你的灯还亮着' },
      { title: '有人说，他也在你这一关', text: '这句话已经留在门边' }
    ];
  }
  const wishes = await supabaseFetch(`paralodge_wishes?guest_id=eq.${encodeURIComponent(guest.guest_id)}&select=id,room_label,text&limit=20`);
  if (!wishes.length) return [];
  const ids = wishes.map((wish) => wish.id).join(',');
  const reactions = await supabaseFetch(`paralodge_reactions?wish_id=in.(${ids})&order=created_at.desc&limit=20`);
  const wishById = Object.fromEntries(wishes.map((wish) => [wish.id, wish]));
  const names = { same: '有人说，他也在你这一关', lamp: '有人给你的愿望点了一盏灯', bless: '有人把“愿你过关”留在你的门边' };
  return reactions.map((reaction) => ({
    title: names[reaction.kind] || '有人回应了你',
    text: `${wishById[reaction.wish_id]?.room_label || '你的房间'}：${wishById[reaction.wish_id]?.text || '灯还亮着'}`
  }));
}

module.exports = {
  isConfigured,
  json,
  ensureGuest,
  listWishes,
  listEchoes,
  createWish,
  createReaction,
  createReturn,
  createMeetupSignup
};
