/* =========================================================
   utils/format.js — Formato de fechas, folios y tiempos.
   ========================================================= */

export function formatFecha(date = new Date()) {
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatFechaHora(date = new Date()) {
  return date.toLocaleString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Genera un folio legible: CURSOID-YYYYMMDD-XXXX */
export function generarFolio(cursoId) {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('');
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${cursoId}-${stamp}-${random}`;
}

export function formatMinutos(mins) {
  if (mins <= 0) return '0 min';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatSegundos(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}

/** Extrae el primer numero entero de un texto tipo "3 minutos" -> 3. */
export function extraerMinutos(texto) {
  const match = String(texto || '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}
