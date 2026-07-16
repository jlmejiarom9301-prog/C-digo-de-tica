/* =========================================================
   utils/dom.js — Helpers minimos de DOM.
   ========================================================= */

/** Selector corto */
export function qs(sel, root = document) {
  return root.querySelector(sel);
}

/** Selector multiple como array */
export function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

/** Crea un elemento con atributos y contenido de forma declarativa. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return;
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dk, dv]) => { node.dataset[dk] = dv; });
    } else {
      node.setAttribute(key, value);
    }
  });
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return node;
}

/** Escapa texto para insertarlo de forma segura dentro de HTML plantilla. */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

/** Reemplaza el contenido de un contenedor y aplica una animacion de entrada. */
export function mount(container, node, animClass = 'ica-anim-fade') {
  container.innerHTML = '';
  if (animClass) node.classList.add(animClass);
  container.appendChild(node);
  return node;
}

/** scrollIntoView defensivo (algunos entornos/webviews no lo implementan). */
export function scrollIntoViewSafe(node, opts) {
  if (node && typeof node.scrollIntoView === 'function') {
    try { node.scrollIntoView(opts); } catch (e) { /* no-op */ }
  }
}
