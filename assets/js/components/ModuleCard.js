/* =========================================================
   components/ModuleCard.js — Tarjeta de modulo usada en el
   dashboard. Estados: pendiente | progreso | completado | bloqueado.
   ========================================================= */

import { el } from '../utils/dom.js';

const BADGE = {
  pendiente: { label: 'Pendiente', cls: 'ica-badge-pendiente' },
  progreso: { label: 'En progreso', cls: 'ica-badge-progreso' },
  completado: { label: 'Completado', cls: 'ica-badge-completado' },
  bloqueado: { label: 'Bloqueado', cls: 'ica-badge-bloqueado' }
};

export function createModuleCard(modulo, status, cursoId) {
  const badge = BADGE[status] || BADGE.pendiente;
  const locked = status === 'bloqueado';

  const card = el('div', { class: `ica-card ica-card-pad ica-module-card${locked ? ' is-locked' : ' ica-card-hover'}` }, [
    locked ? el('i', { class: 'fa-solid fa-lock ica-module-lock-icon' }) : null,
    el('div', { class: 'ica-icon-circle', style: modulo.color ? `background:${modulo.color}` : '' }, [
      el('i', { class: modulo.icono || 'fa-solid fa-play' })
    ]),
    el('div', { class: 'ica-module-card-body' }, [
      el('h4', {}, `${String(modulo.orden).padStart(2, '0')}. ${modulo.titulo}`),
      el('p', {}, modulo.subtitulo || modulo.descripcion || ''),
      el('div', { class: 'ica-module-card-footer' }, [
        el('span', { class: 'ica-module-duration' }, [
          el('i', { class: 'fa-regular fa-clock' }),
          ` ${modulo.duracionEstimada || ''}`
        ]),
        el('span', { class: `ica-badge ${badge.cls}` }, badge.label),
        locked
          ? null
          : el('a', {
              href: `#/curso/${cursoId}/modulo/${modulo.id}`,
              class: 'ica-btn ica-btn-navy ica-btn-sm'
            }, [status === 'completado' ? 'Repasar' : 'Continuar', el('i', { class: 'fa-solid fa-arrow-right' })])
      ])
    ])
  ]);

  return card;
}
