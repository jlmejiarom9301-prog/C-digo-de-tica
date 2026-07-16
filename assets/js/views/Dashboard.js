/* =========================================================
   views/Dashboard.js — Pantalla 3: Dashboard del alumno.
   Bienvenida personalizada, tarjeta de progreso del curso y
   lista de modulos (tipo Microsoft Learn).
   ========================================================= */

import { el, mount, scrollIntoViewSafe } from '../utils/dom.js';
import { getCurso, sortedModulos } from '../config.js';
import { store } from '../store.js';
import { navigate } from '../router.js';
import { renderAppShell } from '../components/AppShell.js';
import { createModuleCard } from '../components/ModuleCard.js';
import { createProgressRing } from '../components/ProgressBar.js';
import { getModuloStatus, getProgresoCurso, tiempoRestanteMinutos, getGates } from '../progress.js';
import { formatMinutos } from '../utils/format.js';
import { skeletonView } from '../components/Skeleton.js';

export async function renderDashboard(root, { params, query }) {
  mount(root, skeletonView(), 'ica-anim-fade');

  const cursoId = params.cursoId;
  const curso = await getCurso(cursoId);
  if (!curso) { navigate('/'); return; }

  const registro = store.getRegistro(cursoId);
  if (!registro) { navigate(`/curso/${cursoId}/registro`); return; }

  const modulos = sortedModulos(curso);
  const { completados, total, pct } = getProgresoCurso(curso, cursoId);
  const minutosRestantes = tiempoRestanteMinutos(curso, cursoId);
  const resultado = store.getUltimoResultado(cursoId);
  const gates = getGates(curso, cursoId);
  const primerNombre = (registro.nombre || '').split(' ')[0] || registro.nombre || '';

  const welcomeBanner = el('div', { class: 'ica-welcome-banner ica-anim-slide-up' }, [
    el('h1', {}, `Hola, ${primerNombre} 👋`),
    el('p', { class: 'ica-text-muted' }, curso.nombre),
    el('div', { class: 'ica-course-progress-card', id: 'progreso' }, [
      el('div', {}, [
        el('div', { class: 'ica-progress-meta' }, [
          el('div', { class: 'ica-progress-meta-item' }, [el('strong', {}, `${completados}/${total}`), 'Módulos completados']),
          el('div', { class: 'ica-progress-meta-item' }, [el('strong', {}, formatMinutos(minutosRestantes)), 'Tiempo restante']),
          el('div', { class: 'ica-progress-meta-item' }, [
            el('strong', {}, resultado ? `${resultado.porcentaje}%` : '—'),
            resultado ? (resultado.aprobado ? 'Aprobado' : 'Calificación actual') : 'Sin evaluar'
          ])
        ])
      ]),
      el('div', { class: 'ica-progress-ring-wrap' }, [
        createProgressRing(pct),
        el('span', { style: 'font-size:11px;color:rgba(255,255,255,0.6);' }, 'Avance del curso')
      ])
    ])
  ]);

  const moduleSection = el('section', { id: 'modulos' }, [
    el('div', { class: 'ica-section-heading' }, [
      el('h2', {}, 'Módulos del curso'),
      el('span', { class: 'ica-badge ica-badge-gold' }, `${completados} de ${total} completados`)
    ]),
    el('div', { class: 'ica-module-grid ica-stagger' },
      modulos.map((m) => createModuleCard(m, getModuloStatus(curso, m, cursoId), cursoId))
    )
  ]);

  const evalCta = gates.evaluacion ? el('div', { class: 'ica-card ica-card-pad ica-flex ica-items-center ica-justify-between', style: 'margin-top:32px;flex-wrap:wrap;gap:16px;' }, [
    el('div', {}, [
      el('h4', { style: 'margin-bottom:4px;' }, '¡Completaste todos los módulos!'),
      el('p', { style: 'margin:0;' }, 'Ya puedes presentar la evaluación final del curso.')
    ]),
    el('a', { href: `#/curso/${cursoId}/evaluacion`, class: 'ica-btn ica-btn-primary' }, ['Presentar evaluación', el('i', { class: 'fa-solid fa-arrow-right' })])
  ]) : null;

  const content = el('div', {}, [welcomeBanner, moduleSection, evalCta].filter(Boolean));

  const shell = renderAppShell({
    cursoId,
    activeKey: 'inicio',
    gates,
    nombreCurso: curso.nombre,
    content
  });

  mount(root, shell, 'ica-anim-fade');

  const foco = query?.foco;
  if (foco === 'progreso' || foco === 'modulos') {
    requestAnimationFrame(() => {
      scrollIntoViewSafe(document.getElementById(foco), { behavior: 'smooth', block: 'start' });
    });
  }
}
