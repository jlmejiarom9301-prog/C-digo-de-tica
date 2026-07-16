/* =========================================================
   store.js — Estado de la app: persistencia en localStorage
   (namespaced por curso) + un pub-sub minimo para que los
   componentes reaccionen a cambios (progreso, registro,
   resultado) sin acoplarse entre si.

   Este store es la UNICA capa que toca localStorage. Las
   vistas y componentes siempre pasan por aqui.
   ========================================================= */

const PREFIX = 'icAcademy';
const listeners = new Map(); // "cursoId:evento" -> Set(callback)

function storageKey(cursoId, key) {
  return `${PREFIX}_${cursoId}_${key}`;
}

function readLocal(cursoId, key, fallback) {
  try {
    const raw = localStorage.getItem(storageKey(cursoId, key));
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeLocal(cursoId, key, value) {
  try {
    localStorage.setItem(storageKey(cursoId, key), JSON.stringify(value));
  } catch (e) {
    /* almacenamiento no disponible (modo privado, cuota llena, etc.) */
  }
}

function emit(cursoId, evento) {
  const set = listeners.get(`${cursoId}:${evento}`);
  if (set) set.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } });
}

/** Suscribirse a cambios de un evento del store para un curso. Retorna funcion para desuscribir. */
export function on(cursoId, evento, callback) {
  const key = `${cursoId}:${evento}`;
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(callback);
  return () => listeners.get(key)?.delete(callback);
}

export const store = {
  /* ---- Registro del participante ---- */
  getRegistro(cursoId) {
    return readLocal(cursoId, 'registro', null);
  },
  setRegistro(cursoId, datos) {
    writeLocal(cursoId, 'registro', { ...datos, fechaRegistro: new Date().toISOString() });
    emit(cursoId, 'registro');
  },

  /* ---- Sesion (para cuando exista backend real) ---- */
  getSessionId(cursoId) {
    return readLocal(cursoId, 'sessionId', null);
  },
  setSessionId(cursoId, sessionId) {
    writeLocal(cursoId, 'sessionId', sessionId);
  },

  /* ---- Progreso de modulos ---- */
  getProgreso(cursoId) {
    return readLocal(cursoId, 'progreso', {});
  },
  esModuloCompletado(cursoId, moduloId) {
    return !!this.getProgreso(cursoId)[moduloId];
  },
  marcarModuloCompletado(cursoId, moduloId) {
    const progreso = this.getProgreso(cursoId);
    progreso[moduloId] = true;
    writeLocal(cursoId, 'progreso', progreso);
    emit(cursoId, 'progreso');
  },

  /* ---- Evaluacion ---- */
  getIntentosUsados(cursoId) {
    return readLocal(cursoId, 'intentosUsados', 0);
  },
  incrementarIntentos(cursoId) {
    const n = this.getIntentosUsados(cursoId) + 1;
    writeLocal(cursoId, 'intentosUsados', n);
    emit(cursoId, 'intentos');
    return n;
  },
  getUltimoResultado(cursoId) {
    return readLocal(cursoId, 'ultimoResultado', null);
  },
  setUltimoResultado(cursoId, resultado) {
    writeLocal(cursoId, 'ultimoResultado', resultado);
    emit(cursoId, 'resultado');
  },

  /* ---- Certificado ---- */
  getCertificado(cursoId) {
    return readLocal(cursoId, 'certificado', null);
  },
  setCertificado(cursoId, certificado) {
    writeLocal(cursoId, 'certificado', certificado);
    emit(cursoId, 'certificado');
  },

  /* ---- Utilidad de desarrollo: reinicia el avance de un curso ---- */
  reset(cursoId) {
    ['registro', 'sessionId', 'progreso', 'intentosUsados', 'ultimoResultado', 'certificado']
      .forEach((key) => localStorage.removeItem(storageKey(cursoId, key)));
    emit(cursoId, 'registro');
    emit(cursoId, 'progreso');
  }
};
