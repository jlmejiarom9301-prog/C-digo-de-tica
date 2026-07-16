/* =========================================================
   components/ProgressBar.js — Barra lineal animada y anillo
   circular de progreso (SVG) para el dashboard.
   ========================================================= */

import { el } from '../utils/dom.js';

/** Barra lineal. El ancho anima de 0 -> pct en el siguiente frame. */
export function createProgressBar(pct = 0, { striped = false } = {}) {
  const fill = el('div', { class: `ica-progress-fill${striped ? ' is-animated' : ''}` });
  const track = el('div', { class: 'ica-progress-track', role: 'progressbar', 'aria-valuenow': String(pct), 'aria-valuemin': '0', 'aria-valuemax': '100' }, [fill]);
  requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = `${Math.max(0, Math.min(100, pct))}%`; }));
  return track;
}

/** Anillo circular de progreso via SVG, con el porcentaje al centro. */
export function createProgressRing(pct = 0, size = 108) {
  const radius = (size / 2) - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, pct)) / 100);

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'ica-progress-ring');

  const track = document.createElementNS(svgNS, 'circle');
  track.setAttribute('cx', size / 2);
  track.setAttribute('cy', size / 2);
  track.setAttribute('r', radius);
  track.setAttribute('fill', 'none');
  track.setAttribute('stroke', 'rgba(255,255,255,0.18)');
  track.setAttribute('stroke-width', '9');

  const fill = document.createElementNS(svgNS, 'circle');
  fill.setAttribute('cx', size / 2);
  fill.setAttribute('cy', size / 2);
  fill.setAttribute('r', radius);
  fill.setAttribute('fill', 'none');
  fill.setAttribute('stroke', '#c9a227');
  fill.setAttribute('stroke-width', '9');
  fill.setAttribute('stroke-linecap', 'round');
  fill.setAttribute('stroke-dasharray', String(circumference));
  fill.setAttribute('stroke-dashoffset', String(circumference));
  fill.setAttribute('transform', `rotate(-90 ${size / 2} ${size / 2})`);
  fill.style.transition = 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)';

  const text = document.createElementNS(svgNS, 'text');
  text.setAttribute('x', '50%');
  text.setAttribute('y', '52%');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.setAttribute('font-size', '20');
  text.textContent = `${Math.round(pct)}%`;

  svg.appendChild(track);
  svg.appendChild(fill);
  svg.appendChild(text);

  requestAnimationFrame(() => requestAnimationFrame(() => { fill.setAttribute('stroke-dashoffset', String(offset)); }));

  return svg;
}
