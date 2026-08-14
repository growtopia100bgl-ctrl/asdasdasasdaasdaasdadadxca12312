const API_KEY = 'oath_T8kLHeX1252XXhSIe3Hq08WG4NlI2_yyCDb67Dxb3_M';
const BASE_URL = 'https://oathnet.org/api';

async function oathFetch(endpoint, method = 'GET', body = null, params = {}) {
  let url = BASE_URL.replace(/\/$/, '') + '/' + endpoint.replace(/^\//, '');
  
  if (method === 'GET' && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += '?' + searchParams.toString();
  }

  const headers = {
    'x-api-key': API_KEY,
    'Accept': 'application/json'
  };

  const options = { method, headers };

  if (method === 'POST' && body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { success: false, message: 'Invalid JSON from OathNet', raw: text, http_code: res.status };
    }
  } catch (err) {
    return { success: false, message: 'Fetch error: ' + err.message };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let params = { ...req.query };

  if (req.body) {
    if (typeof req.body === 'object') {
      params = { ...params, ...req.body };
    } else if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        params = { ...params, ...parsed };
      } catch (e) {
        try {
          const urlParams = new URLSearchParams(req.body);
          for (const [k, v] of urlParams.entries()) {
            params[k] = v;
          }
        } catch (err2) {}
      }
    }
  }

  const action = params.action || 'automated_search';
  const query = (params.query || '').trim();

  try {
    if (action === 'get_music_list') {
      return res.status(200).json({ success: true, data: [] });
    }

    if (action === 'automated_search' || !action) {
      if (!query) {
        return res.status(200).json({ success: true, message: 'OathFlix API Ready', data: { results: [] } });
      }

      let searchId = (params.search_id || '').trim();
      if (!searchId) {
        const initRes = await oathFetch('/service/search/init', 'POST', { query, search_type: 'email' });
        searchId = initRes?.data?.session?.id || null;
      }

      const [stealerRes, breachRes] = await Promise.all([
        oathFetch('/service/v2/stealer/search', 'GET', null, { q: query, search_id: searchId || '' }),
        oathFetch('/service/v2/breach/search', 'GET', null, { q: query, search_id: searchId || '' })
      ]);

      const stealerItems = stealerRes?.data?.items || stealerRes?.data?.results || [];
      const breachItems = breachRes?.data?.items || breachRes?.data?.results || [];

      return res.status(200).json({
        success: true,
        message: 'Automated intelligence search completed',
        search_id: searchId,
        data: {
          results: stealerItems,
          stealer_logs: stealerItems,
          breaches: breachItems,
          ips: [],
          discord: null
        }
      });
    }

    if (action === 'search_stealer') {
      if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });
      const stealerRes = await oathFetch('/service/v2/stealer/search', 'GET', null, { q: query });
      return res.status(200).json(stealerRes);
    }

    if (action === 'search_breach') {
      if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });
      const breachRes = await oathFetch('/service/v2/breach/search', 'GET', null, { q: query });
      return res.status(200).json(breachRes);
    }

    if (action === 'phonebook_search') {
      if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });
      const pbRes = await oathFetch('/service/phonebook/search', 'GET', null, { q: query });
      return res.status(200).json(pbRes);
    }

    const fallbackRes = await oathFetch('/service/v2/stealer/search', 'GET', null, { q: query });
    return res.status(200).json(fallbackRes);

  } catch (err) {
    return res.status(200).json({ success: false, message: err.message });
  }
};
