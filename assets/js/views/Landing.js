/* =========================================================
   views/Landing.js — Pantalla 1: Landing del curso.
   Hero + "Que aprenderas" + beneficios + catalogo (proximamente).
   ========================================================= */

import { el, mount } from '../utils/dom.js';
import { getCurso, getCursos, sortedModulos } from '../config.js';
import { store } from '../store.js';
import { skeletonView } from '../components/Skeleton.js';

export async function renderLanding(root, { params }) {
  mount(root, skeletonView(), 'ica-anim-fade');

  const cursoId = params.cursoId;
  const [curso, todosCursos] = await Promise.all([getCurso(cursoId), getCursos()]);

  if (!curso) {
    mount(root, el('div', { class: 'ica-container', style: 'padding:80px 0;text-align:center;' }, [
      el('h2', {}, 'Curso no encontrado'),
      el('p', {}, `No existe un curso con id "${cursoId}".`),
      el('a', { href: '#/', class: 'ica-btn ica-btn-navy' }, 'Volver al inicio')
    ]));
    return;
  }

  const yaRegistrado = !!store.getRegistro(cursoId);
  const modulos = sortedModulos(curso);
  const otros = todosCursos.filter((c) => c.id !== cursoId && c.visible);

  const hero = el('section', { class: 'ica-hero' }, [
    el('div', { class: 'ica-hero-orbits', 'aria-hidden': 'true' }, [
      el('span', { class: 'o1' }), el('span', { class: 'o2' }), el('span', { class: 'o3' })
    ]),
    el('div', { class: 'ica-hero-grid' }, [
      el('div', { class: 'ica-anim-slide-up' }, [
        el('div', { class: 'ica-flex ica-items-center ica-gap-3', style: 'margin-bottom:22px;' }, [
          el('div', { class: 'ica-icon-circle-lg', style: 'background:transparent;border:2px solid #d9b84a;' }, [el('i', { class: 'fa-solid fa-shield-halved', style: 'color:#d9b84a' })]),
          el('div', {}, [
            el('strong', { style: 'display:block;color:#fff;font-family:var(--ica-font-head);font-size:20px;' }, 'INTER-CON'),
            el('span', { style: 'display:block;color:rgba(255,255,255,0.55);font-size:12px;letter-spacing:0.05em;' }, 'ACADEMY')
          ])
        ]),
        el('span', { class: 'ica-hero-badge' }, [el('i', { class: 'fa-solid fa-graduation-cap' }), ' Primer curso disponible en INTER-CON Academy']),
        el('h1', {}, curso.nombre),
        el('p', { class: 'ica-hero-desc' }, curso.descripcion || curso.descripcionCorta || ''),
        el('div', { class: 'ica-hero-stats' }, [
          el('div', { class: 'ica-hero-stat' }, [el('i', { class: 'fa-regular fa-clock' }), el('span', {}, [' Duración estimada: ', el('strong', {}, curso.duracionEstimada || '—')])]),
          el('div', { class: 'ica-hero-stat' }, [el('i', { class: 'fa-solid fa-layer-group' }), el('span', {}, [' ', el('strong', {}, String(modulos.length)), ' módulos'])]),
          el('div', { class: 'ica-hero-stat' }, [el('i', { class: 'fa-solid fa-clipboard-check' }), el('span', {}, [' ', el('strong', {}, String((curso.evaluacion?.preguntas || []).length)), ' preguntas de evaluación'])]),
          curso.certificadoOficial ? el('div', { class: 'ica-hero-stat' }, [el('i', { class: 'fa-solid fa-certificate' }), ' Certificado oficial INTER-CON']) : null
        ]),
        el('div', { class: 'ica-hero-actions' }, [
          el('a', {
            href: yaRegistrado ? `#/curso/${cursoId}/dashboard` : `#/curso/${cursoId}/registro`,
            class: 'ica-btn ica-btn-primary ica-btn-lg'
          }, [yaRegistrado ? 'Continuar curso' : 'Comenzar curso', el('i', { class: 'fa-solid fa-arrow-right' })])
        ])
      ]),
      el('div', { class: 'ica-hero-card ica-glass-dark ica-anim-slide-up', style: 'animation-delay:120ms' }, [
        el('h4', {}, 'Este curso incluye'),
        el('ul', {}, [
          el('li', {}, [el('i', { class: 'fa-solid fa-video' }), `${modulos.length} módulos con video`]),
          el('li', {}, [el('i', { class: 'fa-solid fa-list-check' }), 'Puntos clave por módulo']),
          el('li', {}, [el('i', { class: 'fa-solid fa-clipboard-question' }), 'Evaluación final con retroalimentación']),
          el('li', {}, [el('i', { class: 'fa-solid fa-certificate' }), 'Certificado descargable al aprobar']),
          el('li', {}, [el('i', { class: 'fa-solid fa-mobile-screen' }), 'Compatible con móvil, tablet y escritorio'])
        ])
      ])
    ]),
    el('a', { href: '#que-aprenderas', class: 'ica-scroll-cue', 'aria-label': 'Desplazarse hacia abajo' }, [el('i', { class: 'fa-solid fa-chevron-down' })])
  ]);

  const queAprenderas = el('section', { class: 'ica-learn-section', id: 'que-aprenderas' }, [
    el('div', { class: 'ica-container' }, [
      el('p', { class: 'ica-eyebrow' }, '¿Qué aprenderás?'),
      el('h2', {}, 'Contenido diseñado para aplicarse desde el primer día'),
      el('div', { class: 'ica-learn-grid ica-stagger' },
        (curso.queAprenderas || []).map((item) => el('div', { class: 'ica-learn-item' }, [
          el('div', { class: 'ica-icon-circle' }, [el('i', { class: item.icono })]),
          el('p', {}, item.texto)
        ]))
      )
    ])
  ]);

  const beneficios = el('section', { class: 'ica-benefits-strip' }, [
    el('div', { class: 'ica-benefits-grid ica-stagger' },
      (curso.beneficios || []).map((b) => el('div', { class: 'ica-benefit-card' }, [
        el('i', { class: b.icono }),
        el('p', {}, b.texto)
      ]))
    )
  ]);

  const catalogo = otros.length ? el('section', { class: 'ica-learn-section' }, [
    el('div', { class: 'ica-container' }, [
      el('p', { class: 'ica-eyebrow' }, 'INTER-CON Academy'),
      el('h2', {}, 'Una plataforma preparada para crecer'),
      el('p', { class: 'ica-text-muted', style: 'max-width:640px;margin-bottom:8px;' }, 'El Código de Ética es el primer curso disponible. Próximamente se incorporarán más programas de capacitación corporativa.'),
      el('div', { class: 'ica-catalog-grid ica-stagger', style: 'margin-top:28px;' },
        otros.slice(0, 9).map((c) => el('div', { class: 'ica-card ica-catalog-card' }, [
          el('div', { class: 'ica-icon-circle', style: `background:${c.color || '#0b1f3a'}` }, [el('i', { class: c.icono || 'fa-solid fa-book' })]),
          el('h4', {}, c.nombre),
          el('p', {}, c.descripcionCorta || ''),
          el('span', { class: 'ica-badge ica-badge-proximamente' }, 'Próximamente')
        ]))
      )
    ])
  ]) : null;

  const footer = el('footer', { class: 'ica-landing-footer' }, [
    el('p', {}, '© 2026 INTER-CON Servicios de Seguridad Privada, S.A. de C.V. — INTER-CON Academy')
  ]);

  const page = el('div', { class: 'ica-screen' }, [hero, queAprenderas, beneficios, catalogo, footer].filter(Boolean));
  mount(root, page, 'ica-anim-fade');
}
