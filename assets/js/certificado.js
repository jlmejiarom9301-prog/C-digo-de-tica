/* =========================================================
   certificado.js — Construccion del "sheet" del certificado y
   su descarga en PDF (html2pdf.js). Compartido por las vistas
   Resultado (boton "Descargar" directo) y Certificado (vista
   completa). Mantenerlo aqui evita duplicar el marcado del
   certificado en dos vistas.
   ========================================================= */

import { el } from './utils/dom.js';
import { formatFecha } from './utils/format.js';
import { generarConstancia } from './services/api.js';

export function buildCertificadoModel(curso, registro, resultado) {
  return {
    nombre: registro?.nombre || '—',
    empresa: registro?.empresa || '—',
    cursoNombre: curso?.nombre || '—',
    calificacion: resultado?.porcentaje ?? 0,
    folio: resultado?.folio || '—',
    fecha: resultado?.fecha ? formatFecha(new Date(resultado.fecha)) : formatFecha()
  };
}

export function renderCertSheet(model, { id = 'certSheet' } = {}) {
  return el('div', { class: 'ica-cert-sheet', id }, [
    el('div', { class: 'ica-cert-brand' }, [
      el('div', { class: 'ica-icon-circle', style: 'background:var(--ica-navy-900);' }, [el('i', { class: 'fa-solid fa-shield-halved', style: 'color:var(--ica-gold-400)' })]),
      el('strong', { style: 'font-family:var(--ica-font-head);color:var(--ica-navy-900);' }, 'INTER-CON Academy')
    ]),
    el('p', { class: 'ica-cert-eyebrow' }, 'Constancia de capacitación'),
    el('p', { class: 'ica-text-muted' }, 'Se otorga la presente constancia a:'),
    el('h2', { class: 'ica-cert-name' }, model.nombre),
    el('p', { class: 'ica-cert-course' }, ['por haber acreditado satisfactoriamente el curso ', el('strong', {}, model.cursoNombre)]),
    el('div', { class: 'ica-cert-meta' }, [
      el('div', {}, ['Empresa', el('strong', {}, model.empresa)]),
      el('div', {}, ['Calificación', el('strong', {}, `${model.calificacion}%`)]),
      el('div', {}, ['Fecha', el('strong', {}, model.fecha)])
    ]),
    el('p', { class: 'ica-cert-folio' }, `Folio ${model.folio} · Documento generado por INTER-CON Academy en modo demostración, pendiente de integración con el sistema oficial de constancias.`)
  ]);
}

/** Genera y descarga el PDF a partir de un nodo ya montado en el DOM (visible u oculto). */
export async function descargarCertificadoPDF(nodeOrModel) {
  let node = nodeOrModel;
  let cleanup = null;

  if (!(nodeOrModel instanceof HTMLElement)) {
    node = renderCertSheet(nodeOrModel, { id: 'certSheetOffscreen' });
    node.style.position = 'fixed';
    node.style.left = '-9999px';
    node.style.top = '0';
    document.body.appendChild(node);
    cleanup = () => node.remove();
  }

  if (!window.html2pdf) {
    if (cleanup) cleanup();
    throw new Error('html2pdf no está disponible (revisa tu conexión a internet).');
  }

  await window.html2pdf().set({
    margin: 10,
    filename: 'constancia-inter-con-academy.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  }).from(node).save();

  if (cleanup) cleanup();
}

/** Notifica al backend (services/api.js) que se genero una constancia. No-op en modo demo. */
export async function registrarConstancia(cursoId, model) {
  return generarConstancia({ cursoId, ...model });
}
