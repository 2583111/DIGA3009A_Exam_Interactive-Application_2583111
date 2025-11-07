
/**
 * Performs a fetch with a timeout using AbortController.
 * @param {string} url
 * @param {RequestInit} init
 * @param {number} timeoutMs - milliseconds before abort (default 8000)
 * @returns {Promise<Response>}
 */

export async function fetchWithTimeout(url, init = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    if (err && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs} ms`);
    }
    throw err;
  }
}

/**
 * Build headers for request. Add X-Api-Key when provided.
 * @param {string} [apiKey]
 * @returns {Headers}
 */
export function buildHeaders(apiKey) {
  const headers = new Headers({
    'Accept': 'application/json'
  });
  if (apiKey) headers.set('X-Api-Key', apiKey);
  return headers;
}

/* ---------------------------
   Pokemon TCG API v2
   --------------------------- */

/**
 * Get a single card by id.
 * @param {string} id - card id from the API (required).
 * @param {Object} [options]
 * @param {string} [options.apiKey] - optional API key for PokemonTCG (sent as X-Api-Key)
 * @param {number} [options.timeout] - ms timeout (default 8000)
 * @returns {Promise<Object>} parsed JSON response
 */
export async function getCardById(id, { apiKey, timeout = 8000 } = {}) {
  if (!id || typeof id !== 'string') {
    throw new TypeError('getCardById: id (string) is required');
  }

  const url = `https://api.pokemontcg.io/v2/cards/${encodeURIComponent(id)}`;
  const init = { headers: buildHeaders(apiKey) };

  const resp = await fetchWithTimeout(url, init, timeout);

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Failed to fetch card ${id}: ${resp.status} ${resp.statusText}${text ? ' — ' + text : ''}`);
  }

  const json = await resp.json();
  return json;
}

/**
 * Search / list cards with query parameters.
 * Example params: { q: 'name:charizard', page: 1, pageSize: 20 }
 * For v2 the API accepts query params like 'q' and 'page' etc.
 * @param {Object|string} params - either a query string or an object
 * @param {Object} [options] - { apiKey, timeout }
 * @returns {Promise<Object>} parsed JSON response
 */
export async function searchCards(params = {}, { apiKey, timeout = 8000 } = {}) {
  let query;
  if (typeof params === 'string') {
    query = params.startsWith('?') ? params : `?${params}`;
  } else {
    const esc = (s) => encodeURIComponent(s);
    const parts = [];
    for (const [k, v] of Object.entries(params)) {
      if (v == null) continue;
      if (Array.isArray(v)) {
        for (const item of v) parts.push(`${esc(k)}=${esc(item)}`);
      } else {
        parts.push(`${esc(k)}=${esc(v)}`);
      }
    }
    query = parts.length ? `?${parts.join('&')}` : '';
  }

  const url = `https://api.pokemontcg.io/v2/cards${query}`;
  const resp = await fetchWithTimeout(url, { headers: buildHeaders(apiKey) }, timeout);

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`searchCards failed: ${resp.status} ${resp.statusText}${text ? ' — ' + text : ''}`);
  }

  const json = await resp.json();
  return json;
}

/* ---------------------------
   PokeAPI 
   --------------------------- */

/**
 * Base PokeAPI pokemon endpoint (used for /pokemon/{name} calls)
 */
export const POKE_API = 'https://pokeapi.co/api/v2/pokemon';

/**
 * Fetch a pokemon by name (or numeric id) using POKE_API.
 * @param {string|number} nameOrId
 * @param {Object} [opts]
 * @param {number} [opts.timeout]
 * @returns {Promise<Object>} parsed pokemon JSON
 */
export async function fetchPokemonByName(nameOrId, { timeout = 8000 } = {}) {
  if (!nameOrId && nameOrId !== 0) throw new TypeError('fetchPokemonByName: nameOrId required');
  const url = `${POKE_API}/${encodeURIComponent(String(nameOrId))}`;
  const resp = await fetchWithTimeout(url, { headers: buildHeaders() }, timeout);
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`fetchPokemonByName failed: ${resp.status} ${resp.statusText}${text ? ' — ' + text : ''}`);
  }
  return await resp.json();
}

/**
 * Fetch generation metadata (pokemon species list) from the generation endpoint.
 * @param {number} genId
 * @param {Object} [opts]
 * @param {number} [opts.timeout]
 * @returns {Promise<Object>} parsed generation JSON
 */
export async function fetchGeneration(genId, { timeout = 8000 } = {}) {
  if (!genId) throw new TypeError('fetchGeneration: genId required');
  const url = `https://pokeapi.co/api/v2/generation/${encodeURIComponent(String(genId))}`;
  const resp = await fetchWithTimeout(url, { headers: buildHeaders() }, timeout);
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`fetchGeneration failed: ${resp.status} ${resp.statusText}${text ? ' — ' + text : ''}`);
  }
  return await resp.json();
}

/**
 * Fetch the front_default sprite for a pokemon id.
 * Returns a string URL or null if sprite missing.
 * @param {number|string} id
 * @param {Object} [opts]
 * @param {number} [opts.timeout] - ms timeout
 * @returns {Promise<string|null>}
 */
export async function fetchPokemonSprite(id, { timeout = 8000 } = {}) {
  if (!id) throw new TypeError('fetchPokemonSprite: id required');
  const data = await fetchPokemonByName(id, { timeout });
  return (data && data.sprites && data.sprites.front_default) ? data.sprites.front_default : null;
}

/**
 * Choose a unique random id in range [1, max] and add it to usedSet.
 * @param {Set<number>} usedSet
 * @param {number} [max=898]
 * @returns {number} unique id
 */
export function getUniqueRandomId(usedSet, max = 898) {
  if (!(usedSet instanceof Set)) throw new TypeError('getUniqueRandomId: usedSet must be a Set');
  if (usedSet.size >= max) throw new Error('No unique ids available');
  let id;
  do {
    id = Math.floor(Math.random() * max) + 1;
  } while (usedSet.has(id));
  usedSet.add(id);
  return id;
}

