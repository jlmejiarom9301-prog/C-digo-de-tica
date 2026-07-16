/* =========================================================
   services/api.js — Capa unica de integracion con el backend.

   HOY: no hay backend. Cada funcion resuelve con datos locales
   (config/*.json + store.js) para que toda la SPA sea navegable
   sin servidor ("APP_MODE = 'demo'").

   MANANA: cuando exista un backend real, basta con:
     1) Cambiar APP_MODE a "production" (abajo).
     2) Rellenar las URLs de ENDPOINTS con las rutas reales.
   Ninguna vista ni componente debe cambiar: todas llaman a las
   funciones exportadas de este archivo, nunca a fetch() directo.
   ========================================================= */

/** "demo" -> todo local. "production" -> llama a los endpoints reales. */
export const APP_MODE = 'demo';

/**
 * Endpoints previstos (ver especificacion del proyecto). Mientras
 * el valor sea "" o empiece con "PEGAR_", se consideran sin configurar.
 */
export const ENDPOINTS = {
  registro: 'PEGAR_URL_POST_REGISTRO',       // POST /registro
  curso: 'PEGAR_URL_GET_CURSO',              // GET  /curso
  videos: 'PEGAR_URL_GET_VIDEOS',            // GET  /videos
  progreso: 'PEGAR_URL_POST_PROGRESO',       // POST /progreso
  evaluacion: 'PEGAR_URL_POST_EVALUACION',   // POST /evaluacion
  generarConstancia: 'PEGAR_URL_POST_GENERAR_CONSTANCIA' // POST /generar-constancia
};

function isPlaceholderUrl(url) {
  return !url || typeof url !== 'string' || url.trim() === '' || /^PEGAR_/i.test(url.trim());
}

/** Avisa (evento DOM) que un servicio aun no esta configurado, sin romper la experiencia. */
function warnPendingConfig(serviceKey, serviceLabel) {
  console.warn(`[api] "${serviceLabel}" (${serviceKey}) no esta configurado todavia. Edita ENDPOINTS.${serviceKey} en services/api.js.`);
  document.dispatchEvent(new CustomEvent('ica:config-warning', {
    detail: { serviceKey, serviceLabel, hint: 'assets/js/services/api.js' }
  }));
}

async function callEndpoint(serviceKey, serviceLabel, { method = 'POST', body, query } = {}) {
  const url = ENDPOINTS[serviceKey];
  if (isPlaceholderUrl(url)) {
    warnPendingConfig(serviceKey, serviceLabel);
    return { ok: false, pending: true, data: null };
  }
  try {
    const fullUrl = query ? `${url}?${new URLSearchParams(query)}` : url;
    const res = await fetch(fullUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'GET' ? undefined : JSON.stringify(body || {})
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, pending: false, data };
  } catch (err) {
    console.error(`[api] Error al llamar "${serviceKey}":`, err);
    warnPendingConfig(serviceKey, `${serviceLabel} (error de conexion, ver consola)`);
    return { ok: false, pending: false, error: err, data: null };
  }
}

/* =========================================================
   Servicios expuestos a la aplicacion
   ========================================================= */

/** POST /registro — registra al participante y abre una sesion de curso. */
export async function enviarRegistro(cursoId, datosRegistro) {
  if (APP_MODE !== 'production') {
    // Modo demo: no hay backend, el registro ya se persistio en store.js.
    return { ok: true, sessionId: `demo-${Date.now()}` };
  }
  const { ok, data } = await callEndpoint('registro', 'Registrar participante', {
    body: { cursoId, ...datosRegistro }
  });
  return ok ? { ok: true, sessionId: data?.sessionId || null } : { ok: false, sessionId: null };
}

/** GET /curso — trae la definicion del curso. En demo se usa config/cursos.json ya cargado. */
export async function obtenerCurso(cursoId, cursosLocales) {
  if (APP_MODE !== 'production') {
    return { ok: true, curso: cursosLocales?.find((c) => c.id === cursoId) || null };
  }
  const { ok, data } = await callEndpoint('curso', 'Obtener curso', { method: 'GET', query: { cursoId } });
  return ok ? { ok: true, curso: data } : { ok: false, curso: null };
}

/** GET /videos — trae las URLs de video. En demo se usa config/videos.json ya cargado. */
export async function obtenerVideos(cursoId, videosLocales) {
  if (APP_MODE !== 'production') {
    return { ok: true, videos: videosLocales?.[cursoId] || {} };
  }
  const { ok, data } = await callEndpoint('videos', 'Obtener videos', { method: 'GET', query: { cursoId } });
  return ok ? { ok: true, videos: data } : { ok: false, videos: {} };
}

/** POST /progreso — reporta el avance de un modulo. En demo solo actualiza el store local (ver store.js). */
export async function guardarProgreso(cursoId, moduloId, porcentajeVisto) {
  if (APP_MODE !== 'production') {
    return { ok: true };
  }
  const { ok } = await callEndpoint('progreso', 'Guardar progreso', {
    body: { cursoId, moduloId, porcentajeVisto, completado: porcentajeVisto >= 100 }
  });
  return { ok };
}

/** POST /evaluacion — valida las respuestas del examen en el servidor. En demo se califica localmente. */
export async function enviarEvaluacion(cursoId, respuestas) {
  if (APP_MODE !== 'production') {
    return { ok: true, remota: false };
  }
  const { ok, data } = await callEndpoint('evaluacion', 'Validar examen', { body: { cursoId, respuestas } });
  return ok ? { ok: true, remota: true, calificacion: data?.calificacion ?? null } : { ok: false, remota: false };
}

/** POST /generar-constancia — genera el certificado oficial en el backend. En demo se genera solo en el navegador (PDF). */
export async function generarConstancia(payload) {
  if (APP_MODE !== 'production') {
    return { ok: true, constanciaUrl: null };
  }
  const { ok, data } = await callEndpoint('generarConstancia', 'Generar constancia', { body: payload });
  return ok ? { ok: true, constanciaUrl: data?.constanciaUrl || null } : { ok: false, constanciaUrl: null };
}

/**
 * Video watched-percentage hook. Hoy se calcula en el cliente
 * (ver components/VideoProgress dentro de views/Modulo.js). Cuando
 * exista una API de analitica de video, este es el lugar para
 * sustituirlo por una llamada real, sin tocar la vista.
 */
export async function validarPorcentajeVisto(cursoId, moduloId, porcentajeCliente) {
  if (APP_MODE !== 'production') {
    return { ok: true, porcentaje: porcentajeCliente };
  }
  // TODO: sustituir por endpoint real de analitica de video cuando exista.
  return { ok: true, porcentaje: porcentajeCliente };
}
