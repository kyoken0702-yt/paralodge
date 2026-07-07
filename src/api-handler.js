const {
  json,
  isConfigured,
  ensureGuest,
  listWishes,
  listEchoes,
  createWish,
  createReaction,
  createReturn,
  createMeetupSignup
} = require('./data/paralodge-store');

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function queryFrom(req) {
  const url = new URL(req.url || '/', 'http://localhost');
  return url.searchParams;
}

async function handleApi(req, res) {
  const url = new URL(req.url || '/', 'http://localhost');
  const pathname = url.pathname;

  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      json(res, 200, { ok: true, supabase: isConfigured() ? 'configured' : 'fallback' });
      return true;
    }

    if (req.method === 'POST' && pathname === '/api/identity') {
      const body = await readBody(req);
      const guest = await ensureGuest(body.guestId);
      json(res, 200, { ok: true, guest });
      return true;
    }

    if (req.method === 'GET' && pathname === '/api/wishes') {
      const query = queryFrom(req);
      const wishes = await listWishes({
        spaceKey: query.get('spaceKey') || '',
        gateKey: query.get('gateKey') || '',
        limit: Number(query.get('limit') || 10)
      });
      json(res, 200, { ok: true, wishes, source: isConfigured() ? 'supabase' : 'fallback' });
      return true;
    }

    if (req.method === 'POST' && pathname === '/api/wishes') {
      const wish = await createWish(await readBody(req));
      json(res, 201, { ok: true, wish, source: isConfigured() ? 'supabase' : 'fallback' });
      return true;
    }

    if (req.method === 'POST' && pathname === '/api/actions') {
      const reaction = await createReaction(await readBody(req));
      json(res, 201, { ok: true, reaction, source: isConfigured() ? 'supabase' : 'fallback' });
      return true;
    }

    if (req.method === 'POST' && pathname === '/api/returns') {
      const returnCard = await createReturn(await readBody(req));
      json(res, 201, { ok: true, returnCard, source: isConfigured() ? 'supabase' : 'fallback' });
      return true;
    }

    if (req.method === 'POST' && pathname === '/api/meetups') {
      const signup = await createMeetupSignup(await readBody(req));
      json(res, 201, { ok: true, signup, source: isConfigured() ? 'supabase' : 'fallback' });
      return true;
    }

    if (req.method === 'GET' && pathname === '/api/echoes') {
      const query = queryFrom(req);
      const echoes = await listEchoes(query.get('guestId') || '');
      json(res, 200, { ok: true, echoes, source: isConfigured() ? 'supabase' : 'fallback' });
      return true;
    }

    if (pathname.startsWith('/api/')) {
      json(res, 404, { ok: false, error: 'api route not found' });
      return true;
    }
  } catch (error) {
    json(res, error.status || 500, {
      ok: false,
      error: error.message || 'api error',
      details: error.details || null
    });
    return true;
  }

  return false;
}

module.exports = { handleApi, readBody };
