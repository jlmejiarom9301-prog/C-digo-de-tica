/* =========================================================
   components/Sidebar.js — Menu lateral moderno de la app
   autenticada. Items: Inicio, Mi progreso, Modulos, Evaluacion,
   Certificado, Perfil. Evaluacion/Certificado se muestran
   deshabilitados hasta que el alumno cumple los requisitos.
   ========================================================= */

import { el } from '../utils/dom.js';

const ITEMS = [
  { key: 'inicio', label: 'Inicio', icon: 'fa-solid fa-house', href: (id) => `#/curso/${id}/dashboard` },
  { key: 'progreso', label: 'Mi progreso', icon: 'fa-solid fa-chart-line', href: (id) => `#/curso/${id}/dashboard?foco=progreso` },
  { key: 'modulos', label: 'Módulos', icon: 'fa-solid fa-layer-group', href: (id) => `#/curso/${id}/dashboard?foco=modulos` },
  { key: 'evaluacion', label: 'Evaluación', icon: 'fa-solid fa-clipboard-question', href: (id) => `#/curso/${id}/evaluacion`, gate: 'evaluacion' },
  { key: 'certificado', label: 'Certificado', icon: 'fa-solid fa-award', href: (id) => `#/curso/${id}/certificado`, gate: 'certificado' },
  { key: 'perfil', label: 'Perfil', icon: 'fa-solid fa-user', href: (id) => `#/curso/${id}/perfil` }
];

/**
 * @param {Object} opts
 * @param {string} opts.cursoId
 * @param {string} opts.activeKey - key del item activo (ver ITEMS)
 * @param {{evaluacion:boolean, certificado:boolean}} opts.gates - si cada seccion esta desbloqueada
 * @param {string} opts.nombreCurso
 */
export function renderSidebarNav({ cursoId, activeKey, gates = {}, nombreCurso = '' }) {
  const nav = el('nav', { class: 'ica-sidebar-nav', 'aria-label': 'Navegación del curso' });

  ITEMS.forEach((item) => {
    const locked = item.gate && gates[item.gate] === false;
    const link = el('a', {
      href: locked ? '#' : item.href(cursoId),
      class: `ica-nav-link${activeKey === item.key ? ' is-active' : ''}${locked ? ' is-disabled' : ''}`,
      'aria-disabled': locked ? 'true' : 'false',
      title: locked ? 'Disponible al completar los requisitos' : ''
    }, [
      el('i', { class: item.icon }),
      el('span', {}, item.label),
      locked ? el('i', { class: 'fa-solid fa-lock', style: 'margin-left:auto;font-size:11px;color:rgba(255,255,255,0.35)' }) : null
    ]);
    nav.appendChild(link);
  });

  return nav;
}

export function renderSidebar({ cursoId, activeKey, gates, nombreCurso }) {
  const brand = el('div', { class: 'ica-sidebar-brand' }, [
    el('div', { class: 'ica-icon-circle', style: 'background:transparent;border:2px solid #d9b84a;' }, [el('i', { class: 'fa-solid fa-shield-halved', style: 'color:#d9b84a' })]),
    el('div', {}, [
      el('strong', { style: 'display:block;color:#fff;font-family:var(--ica-font-head);font-size:15px;letter-spacing:0.02em;' }, 'INTER-CON'),
      el('span', { style: 'display:block;color:rgba(255,255,255,0.5);font-size:11px;' }, 'Academy')
    ])
  ]);

  const footer = el('div', { class: 'ica-sidebar-footer' }, [
    el('span', {}, nombreCurso || ''),
    el('small', {}, 'INTER-CON Academy · 2026')
  ]);

  return el('aside', { class: 'ica-sidebar', id: 'appSidebar' }, [
    brand,
    renderSidebarNav({ cursoId, activeKey, gates, nombreCurso }),
    footer
  ]);
}
