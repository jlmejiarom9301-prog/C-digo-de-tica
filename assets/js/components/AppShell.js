/* =========================================================
   components/AppShell.js — Envoltura comun (sidebar + topbar +
   contenedor) para las vistas autenticadas: Dashboard, Modulo,
   Evaluacion, Resultado, Certificado, Perfil.
   ========================================================= */

import { el } from '../utils/dom.js';
import { renderSidebar } from './Sidebar.js';
import { renderTopbar, wireMobileNav } from './Topbar.js';

/**
 * @param {Object} opts
 * @param {string} opts.cursoId
 * @param {string} opts.activeKey
 * @param {{evaluacion:boolean, certificado:boolean}} opts.gates
 * @param {string} opts.nombreCurso
 * @param {HTMLElement} opts.content - nodo con el contenido de la vista
 */
export function renderAppShell({ cursoId, activeKey, gates = {}, nombreCurso = '', content }) {
  const shell = el('div', { class: 'ica-shell' }, [
    renderSidebar({ cursoId, activeKey, gates, nombreCurso }),
    el('div', { class: 'ica-nav-overlay', id: 'navOverlay' }),
    el('div', { class: 'ica-main' }, [
      renderTopbar({ nombreCurso }),
      el('main', { class: 'ica-content ica-anim-fade', id: 'mainContent' }, [content])
    ])
  ]);

  requestAnimationFrame(wireMobileNav);
  return shell;
}
