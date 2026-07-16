/* =========================================================
   views/Resultado.js — Pantalla de resultado. Si aprueba:
   animacion + calificacion + folio + Ver certificado / Descargar.
   Si no aprueba: explicacion + reintento (segun intentos restantes).
   ========================================================= */

import { el, mount } from '../utils/dom.js';
import { getCurso } from '../config.js';
import { store } from '../store.js';
import { navigate } from '../router.js';
import { renderAppShell } from '../components/AppShell.js';
import { getGates } from '../progress.js';
import { buildCertificadoModel, descargarCertificadoPDF } from '../certificado.js';
import { showToast } from '../components/Toast.js';
import { skeletonView } from '../components/Skeleton.js';

function confetti() {
  const colors = ['#c9a227', '#0b1f3a', '#d9b84a', '#1b3a6b'];
  const wrap = el('div', { style: 'position:relative;height:0;overflow:visible;' });
  for (let i = 0; i < 26; i++) {
    const piece = el('span', { class: 'ica-confetti-piece' });
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    wrap.appendChild(piece);
  }
  return wrap;
}

export async function renderResultado(root, { params }) {
  mount(root, skeletonView(), 'ica-anim-fade');

  const cursoId = params.cursoId;
  const curso = await getCurso(cursoId);
  if (!curso) { navigate('/'); return; }
  const registro = store.getRegistro(cursoId);
  if (!registro) { navigate(`/curso/${cursoId}/registro`); return; }

  const resultado = store.getUltimoResultado(cursoId);
  if (!resultado) { navigate(`/curso/${cursoId}/dashboard`); return; }

  const gates = getGates(curso, cursoId);
  const intentosRestantes = curso.maximoIntentos - store.getIntentosUsados(cursoId);

  let content;
  if (resultado.aprobado) {
    content = el('div', { class: 'ica-result-screen' }, [
      confetti(),
      el('div', { class: 'ica-result-icon is-pass' }, [el('i', { class: 'fa-solid fa-trophy' })]),
      el('p', { class: 'ica-eyebrow' }, '¡Felicidades!'),
      el('h1', {}, 'Aprobaste la evaluación'),
      el('p', { class: 'ica-text-muted' }, `Completaste "${curso.nombre}" con una calificación de ${resultado.porcentaje}%.`),
      el('div', { class: 'ica-result-score' }, `${resultado.porcentaje}%`),
      el('div', { class: 'ica-result-folio' }, [el('i', { class: 'fa-solid fa-hashtag' }), ` Folio ${resultado.folio}`]),
      el('div', { class: 'ica-result-actions' }, [
        el('a', { href: `#/curso/${cursoId}/certificado`, class: 'ica-btn ica-btn-primary ica-btn-lg' }, [el('i', { class: 'fa-solid fa-award' }), 'Ver certificado']),
        el('button', { type: 'button', class: 'ica-btn ica-btn-ghost ica-btn-lg', id: 'downloadBtn' }, [el('i', { class: 'fa-solid fa-download' }), 'Descargar'])
      ])
    ]);
  } else {
    content = el('div', { class: 'ica-result-screen' }, [
      el('div', { class: 'ica-result-icon is-fail' }, [el('i', { class: 'fa-solid fa-face-frown' })]),
      el('p', { class: 'ica-eyebrow' }, 'Casi lo logras'),
      el('h1', {}, 'No alcanzaste la calificación mínima'),
      el('p', { class: 'ica-text-muted' }, `Obtuviste ${resultado.porcentaje}% (${resultado.correctas} correctas de ${resultado.correctas + resultado.incorrectas}). Se requiere un mínimo de ${curso.calificacionMinima}% para aprobar.`),
      el('div', { class: 'ica-result-score' }, `${resultado.porcentaje}%`),
      intentosRestantes > 0
        ? el('p', { class: 'ica-text-muted' }, `Te quedan ${intentosRestantes} de ${curso.maximoIntentos} intentos. Te recomendamos repasar los módulos antes de volver a intentarlo.`)
        : el('p', { class: 'ica-text-muted', style: 'color:var(--ica-danger);font-weight:600;' }, 'Alcanzaste el máximo de intentos permitidos. Contacta a Compliance para gestionar un nuevo intento.'),
      el('div', { class: 'ica-result-actions' }, [
        intentosRestantes > 0
          ? el('a', { href: `#/curso/${cursoId}/evaluacion`, class: 'ica-btn ica-btn-primary ica-btn-lg' }, [el('i', { class: 'fa-solid fa-rotate-right' }), 'Reintentar evaluación'])
          : null,
        el('a', { href: `#/curso/${cursoId}/dashboard`, class: 'ica-btn ica-btn-ghost ica-btn-lg' }, 'Volver al dashboard')
      ].filter(Boolean))
    ]);
  }

  const shell = renderAppShell({ cursoId, activeKey: 'evaluacion', gates, nombreCurso: curso.nombre, content });
  mount(root, shell, 'ica-anim-fade');

  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      downloadBtn.disabled = true;
      downloadBtn.innerHTML = '<span class="ica-spinner"></span> Generando PDF…';
      try {
        const model = buildCertificadoModel(curso, registro, resultado);
        await descargarCertificadoPDF(model);
      } catch (err) {
        showToast(err.message || 'No se pudo generar el PDF.', { icon: 'fa-solid fa-triangle-exclamation', variant: 'warning' });
      } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Descargar';
      }
    });
  }
}
