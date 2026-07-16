/* =========================================================
   components/Skeleton.js — Placeholders de carga (shimmer).
   ========================================================= */

import { el } from '../utils/dom.js';

export function skeletonText(count = 3) {
  const wrap = el('div', {});
  for (let i = 0; i < count; i++) {
    wrap.appendChild(el('div', { class: 'ica-skeleton ica-skeleton-text', style: i === count - 1 ? 'width:70%' : '' }));
  }
  return wrap;
}

export function skeletonCard() {
  return el('div', { class: 'ica-skeleton ica-skeleton-card' });
}

export function skeletonCards(count = 3) {
  const wrap = el('div', { class: 'ica-module-grid' });
  for (let i = 0; i < count; i++) wrap.appendChild(skeletonCard());
  return wrap;
}

export function skeletonView() {
  const wrap = el('div', {});
  wrap.appendChild(el('div', { class: 'ica-skeleton ica-skeleton-title' }));
  wrap.appendChild(skeletonText(3));
  wrap.appendChild(el('div', { class: 'ica-skeleton ica-skeleton-card', style: 'margin-top:24px' }));
  return wrap;
}
