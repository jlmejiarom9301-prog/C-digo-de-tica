/* =========================================================
   views/Perfil.js — Datos de registro del participante y
   resumen de su avance en el curso actual.
   ========================================================= */

import { el, mount } from '../utils/dom.js';
import { getCurso } from '../config.js';
import { store } from '../store.js';
import { navigate } from '../router.js';
import { renderAppShell } from '../components/AppShell.js';
import { getGates, getProgresoCurso } from '../progress.js';
import { skeletonView } from '../components/Skeleton.js';

const LABELS = {
  nombre: 'Nombre completo',
  numEmpleado: 'Número de empleado',
  empresa: 'Empresa',
  correo: 'Correo electrónico',
  puesto: 'Puesto',
  cliente: 'Cliente',
  ciudad: 'Ciudad',
  estado: 'Estado',
  pais: 'País'
};

export async function renderPerfil(root, { params }) {
  mount(root, skeletonView(), 'ica-anim-fade');

  const cursoId = params.cursoId;
  const curso = await getCurso(cursoId);
  if (!curso) { navigate('/'); return; }
  const registro = store.getRegistro(cursoId);
  if (!registro) { navigate(`/curso/${cursoId}/registro`); return; }

  const gates = getGates(curso, cursoId);
  const { completados, total, pct } = getProgresoCurso(curso, cursoId);
  const resultado = store.getUltimoResultado(cursoId);

  const items = Object.entries(LABELS).map(([key, label]) =>
    el('div', { class: 'ica-card ica-card-pad ica-profile-item' }, [
      el('span', {}, label),
      el('strong', {}, registro[key] && String(registro[key]).trim() ? registro[key] : '—')
    ])
  );

  const content = el('div', {}, [
    el('div', { style: 'margin-bottom:24px;' }, [
      el('p', { class: 'ica-eyebrow' }, 'Perfil'),
      el('h1', { style: 'font-size:24px;' }, registro.nombre),
      el('p', { class: 'ica-text-muted' }, `Inscrito en "${curso.nombre}"`)
    ]),
    el('div', { class: 'ica-card ica-card-pad ica-flex ica-items-center ica-justify-between', style: 'margin-bottom:24px;flex-wrap:wrap;gap:16px;' }, [
      el('div', {}, [
        el('h4', { style: 'margin-bottom:4px;' }, 'Avance del curso'),
        el('p', { style: 'margin:0;' }, `${completados} de ${total} módulos completados (${pct}%)`)
      ]),
      el('div', {}, [
        el('span', { class: `ica-badge ${resultado?.aprobado ? 'ica-badge-completado' : 'ica-badge-pendiente'}` }, resultado ? (resultado.aprobado ? `Aprobado · ${resultado.porcentaje}%` : `Último intento: ${resultado.porcentaje}%`) : 'Evaluación pendiente')
      ])
    ]),
    el('div', { class: 'ica-profile-grid ica-stagger' }, items)
  ]);

  const shell = renderAppShell({ cursoId, activeKey: 'perfil', gates, nombreCurso: curso.nombre, content });
  mount(root, shell, 'ica-anim-fade');
}
