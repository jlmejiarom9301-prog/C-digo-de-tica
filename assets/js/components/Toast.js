/* =========================================================
   components/Toast.js — Notificaciones flotantes discretas.
   Se suscribe a "ica:config-warning" (emitido por services/api.js)
   para avisar de configuracion pendiente sin romper la experiencia.
   ========================================================= */

import { el } from '../utils/dom.js';

let region = null;

function ensureRegion() {
  if (region) return region;
  region = el('div', { class: 'ica-toast-region', id: 'toastRegion', 'aria-live': 'polite' });
  document.body.appendChild(region);
  return region;
}

export function showToast(message, { icon = 'fa-solid fa-circle-info', variant = '', timeout = 6000 } = {}) {
  const container = ensureRegion();
  const toast = el('div', { class: `ica-toast ${variant ? 'ica-toast-' + variant : ''}` }, [
    el('i', { class: icon }),
    el('span', {}, message)
  ]);
  container.appendChild(toast);
  if (timeout) {
    setTimeout(() => {
      toast.style.transition = 'opacity 220ms ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 220);
    }, timeout);
  }
  return toast;
}

/** Inicializa el listener global de avisos de configuracion pendiente. Llamar una sola vez desde app.js. */
export function initConfigWarnings() {
  document.addEventListener('ica:config-warning', (e) => {
    const { serviceLabel, hint } = e.detail || {};
    showToast(`Configuración pendiente: "${serviceLabel}". Edita ${hint}.`, {
      icon: 'fa-solid fa-triangle-exclamation',
      variant: 'warning',
      timeout: 7000
    });
  });
}
