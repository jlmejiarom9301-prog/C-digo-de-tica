/* =========================================================
   progress.js — Logica compartida de avance/bloqueo de modulos,
   usada por Dashboard, Modulo, Sidebar (gates) y los guards de
   Evaluacion/Certificado. Un solo lugar para la regla de negocio:
   los modulos se desbloquean secuencialmente.
   ========================================================= */

import { store } from './store.js';
import { sortedModulos } from './config.js';
import { extraerMinutos } from './utils/format.js';

/** 'completado' | 'progreso' (desbloqueado, sin terminar) | 'bloqueado' */
export function getModuloStatus(curso, modulo, cursoId) {
  if (store.esModuloCompletado(cursoId, modulo.id)) return 'completado';
  const modulos = sortedModulos(curso);
  const idx = modulos.findIndex((m) => m.id === modulo.id);
  const desbloqueado = idx === 0 || store.esModuloCompletado(cursoId, modulos[idx - 1].id);
  return desbloqueado ? 'progreso' : 'bloqueado';
}

export function getProgresoCurso(curso, cursoId) {
  const modulos = sortedModulos(curso);
  const completados = modulos.filter((m) => store.esModuloCompletado(cursoId, m.id)).length;
  const pct = modulos.length ? Math.round((completados / modulos.length) * 100) : 0;
  return { completados, total: modulos.length, pct };
}

/** Siguiente modulo pendiente (desbloqueado y sin completar), o null si ya se completaron todos. */
export function getSiguienteModulo(curso, cursoId) {
  const modulos = sortedModulos(curso);
  return modulos.find((m) => getModuloStatus(curso, m, cursoId) === 'progreso') || null;
}

export function tiempoRestanteMinutos(curso, cursoId) {
  const modulos = sortedModulos(curso);
  return modulos
    .filter((m) => !store.esModuloCompletado(cursoId, m.id))
    .reduce((acc, m) => acc + extraerMinutos(m.duracionEstimada), 0);
}

/** Secciones desbloqueadas del sidebar: evaluacion requiere 100% de modulos, certificado requiere aprobar. */
export function getGates(curso, cursoId) {
  const { completados, total } = getProgresoCurso(curso, cursoId);
  const todosCompletos = total > 0 && completados === total;
  const resultado = store.getUltimoResultado(cursoId);
  return {
    evaluacion: todosCompletos,
    certificado: !!(resultado && resultado.aprobado)
  };
}
