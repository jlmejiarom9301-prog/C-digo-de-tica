/* =========================================================
   components/Topbar.js — Barra superior movil (hamburguesa)
   para el shell autenticado. Solo visible en breakpoints
   angostos (ver layout.css).
   ========================================================= */

import { el } from '../utils/dom.js';

export function renderTopbar({ nombreCurso = '' } = {}) {
  const toggle = el('button', {
    class: 'ica-btn ica-btn-ghost ica-btn-sm',
    id: 'sidebarToggle',
    'aria-label': 'Abrir menú',
    'aria-expanded': 'false'
  }, [el('i', { class: 'fa-solid fa-bars' })]);

  return el('header', { class: 'ica-topbar' }, [
    el('div', { class: 'ica-flex ica-items-center ica-gap-3' }, [
      toggle,
      el('strong', { style: 'font-family:var(--ica-font-head);font-size:14px;color:var(--ica-navy-900);' }, nombreCurso)
    ]),
    el('i', { class: 'fa-solid fa-shield-halved', style: 'color:var(--ica-gold-500);' })
  ]);
}

/** Conecta el boton de hamburguesa con el sidebar + overlay ya montados en el DOM. */
export function wireMobileNav() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('navOverlay');
  if (!toggle || !sidebar || !overlay) return;

  function close() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  function open() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }
  toggle.addEventListener('click', () => {
    sidebar.classList.contains('is-open') ? close() : open();
  });
  overlay.addEventListener('click', close);
  sidebar.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
}
