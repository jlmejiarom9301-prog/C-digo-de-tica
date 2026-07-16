/* =========================================================
   router.js — Router SPA basado en hash (#/...). No hay
   recargas de pagina completas: cada ruta simplemente
   renderiza una vista dentro de #app-root.
   ========================================================= */

const routes = []; // { pattern, regex, keys, handler }

function compile(pattern) {
  const keys = [];
  const regexStr = pattern
    .replace(/\/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return '/([^/]+)';
    })
    .replace(/\//g, '\\/');
  return { regex: new RegExp(`^${regexStr}$`), keys };
}

/** Registra una ruta. pattern usa sintaxis tipo "/curso/:cursoId/modulo/:moduloId" */
export function route(pattern, handler) {
  const { regex, keys } = compile(pattern);
  routes.push({ pattern, regex, keys, handler });
}

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, queryString] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString || ''));
  return { path: path || '/', query };
}

let notFoundHandler = () => {};
export function setNotFound(handler) { notFoundHandler = handler; }

let beforeEachHook = null;
/** Hook opcional que corre antes de cada navegacion. Retorna false para cancelar. */
export function beforeEach(hook) { beforeEachHook = hook; }

async function resolve() {
  const { path, query } = parseHash();
  for (const r of routes) {
    const match = path.match(r.regex);
    if (match) {
      const params = {};
      r.keys.forEach((key, i) => { params[key] = decodeURIComponent(match[i + 1]); });
      if (beforeEachHook) {
        const allowed = await beforeEachHook({ path, params, query });
        if (allowed === false) return;
      }
      try { window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }); } catch (e) { /* no-op en entornos sin scrollTo */ }
      return r.handler({ params, query, path });
    }
  }
  notFoundHandler({ path, query });
}

/** Navega a una nueva ruta sin recargar la pagina. */
export function navigate(path) {
  if (window.location.hash.replace(/^#/, '') === path) {
    resolve();
  } else {
    window.location.hash = path;
  }
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  window.addEventListener('DOMContentLoaded', resolve);
  if (document.readyState !== 'loading') resolve();
}
