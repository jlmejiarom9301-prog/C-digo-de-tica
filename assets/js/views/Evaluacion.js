/* =========================================================
   views/Evaluacion.js — Una pregunta a la vez, con progreso y
   temporizador preparado (inactivo por ahora: ver TIMER_ENABLED).
   Al finalizar muestra calificacion, correctas, incorrectas y
   porcentaje, y da acceso a la vista de Resultado.
   ========================================================= */

import { el, mount } from '../utils/dom.js';
import { getCurso } from '../config.js';
import { store } from '../store.js';
import { enviarEvaluacion } from '../services/api.js';
import { navigate } from '../router.js';
import { renderAppShell } from '../components/AppShell.js';
import { getGates } from '../progress.js';
import { generarFolio } from '../utils/format.js';
import { showToast } from '../components/Toast.js';
import { createProgressBar } from '../components/ProgressBar.js';
import { skeletonView } from '../components/Skeleton.js';

// El cronometro esta preparado pero inactivo: se puede encender mas
// adelante sin tocar el resto de la vista (ver renderTimer()).
const TIMER_ENABLED = false;

function renderTimer() {
  if (!TIMER_ENABLED) {
    return el('div', { class: 'ica-eval-timer' }, [el('i', { class: 'fa-regular fa-clock' }), 'Sin límite de tiempo']);
  }
  return el('div', { class: 'ica-eval-timer', id: 'evalTimer' }, [el('i', { class: 'fa-regular fa-clock' }), '00:00']);
}

export async function renderEvaluacion(root, { params }) {
  mount(root, skeletonView(), 'ica-anim-fade');

  const cursoId = params.cursoId;
  const curso = await getCurso(cursoId);
  if (!curso) { navigate('/'); return; }
  if (!store.getRegistro(cursoId)) { navigate(`/curso/${cursoId}/registro`); return; }

  const gates = getGates(curso, cursoId);
  if (!gates.evaluacion) {
    showToast('Completa todos los módulos antes de presentar la evaluación.', { icon: 'fa-solid fa-lock', variant: 'warning' });
    navigate(`/curso/${cursoId}/dashboard`);
    return;
  }

  const preguntas = curso.evaluacion?.preguntas || [];
  const intentosUsados = store.getIntentosUsados(cursoId);
  const intentosRestantes = curso.maximoIntentos - intentosUsados;

  if (intentosRestantes <= 0) {
    renderSinIntentos(root, curso, cursoId, gates);
    return;
  }

  let currentIndex = 0;
  const respuestas = {};

  const shell = renderAppShell({
    cursoId,
    activeKey: 'evaluacion',
    gates,
    nombreCurso: curso.nombre,
    content: el('div', { class: 'ica-eval-shell', id: 'evalShell' })
  });
  mount(root, shell, 'ica-anim-fade');
  const evalShell = document.getElementById('evalShell');

  function renderQuestion() {
    const p = preguntas[currentIndex];
    const pct = Math.round(((currentIndex) / preguntas.length) * 100);

    evalShell.innerHTML = '';
    evalShell.appendChild(el('div', { class: 'ica-eval-topline' }, [
      el('span', { class: 'ica-eval-counter' }, `Pregunta ${currentIndex + 1} de ${preguntas.length}`),
      renderTimer()
    ]));
    evalShell.appendChild(createProgressBar(pct));
    evalShell.appendChild(el('p', { class: 'ica-text-muted', style: 'font-size:12.5px;margin:10px 0 24px;' }, `Intentos restantes: ${intentosRestantes} de ${curso.maximoIntentos} · Calificación mínima para aprobar: ${curso.calificacionMinima}%`));

    const optionsWrap = el('div', { class: 'ica-eval-options' },
      p.opciones.map((op) => {
        const selected = respuestas[p.id] === op.valor;
        const optionEl = el('label', { class: `ica-eval-option${selected ? ' is-selected' : ''}` }, [
          el('input', { type: 'radio', name: p.id, value: op.valor, checked: selected ? 'true' : null }),
          op.texto
        ]);
        optionEl.querySelector('input').addEventListener('change', () => {
          respuestas[p.id] = op.valor;
          optionsWrap.querySelectorAll('.ica-eval-option').forEach((o) => o.classList.remove('is-selected'));
          optionEl.classList.add('is-selected');
          nextBtn.disabled = false;
        });
        return optionEl;
      })
    );

    const nextBtn = el('button', { type: 'button', class: 'ica-btn ica-btn-primary', disabled: respuestas[p.id] ? null : 'true' }, [
      currentIndex === preguntas.length - 1 ? 'Finalizar evaluación' : 'Siguiente',
      el('i', { class: 'fa-solid fa-arrow-right' })
    ]);
    nextBtn.addEventListener('click', () => {
      if (currentIndex < preguntas.length - 1) {
        currentIndex++;
        renderQuestion();
      } else {
        finalizarEvaluacion();
      }
    });

    const backBtn = el('button', { type: 'button', class: 'ica-btn ica-btn-ghost', disabled: currentIndex === 0 ? 'true' : null }, [el('i', { class: 'fa-solid fa-arrow-left' }), 'Anterior']);
    backBtn.addEventListener('click', () => { if (currentIndex > 0) { currentIndex--; renderQuestion(); } });

    evalShell.appendChild(el('div', { class: 'ica-card ica-eval-card ica-anim-slide-up' }, [
      el('p', { class: 'ica-eval-question' }, p.pregunta),
      optionsWrap
    ]));
    evalShell.appendChild(el('div', { class: 'ica-eval-footer' }, [backBtn, nextBtn]));
  }

  async function finalizarEvaluacion() {
    let correctas = 0;
    preguntas.forEach((p) => { if (respuestas[p.id] === p.correcta) correctas += 1; });
    const incorrectas = preguntas.length - correctas;
    const porcentaje = Math.round((correctas / preguntas.length) * 100);
    const aprobado = porcentaje >= curso.calificacionMinima;

    const intentos = store.incrementarIntentos(cursoId);
    await enviarEvaluacion(cursoId, respuestas);

    const resultado = {
      correctas,
      incorrectas,
      porcentaje,
      aprobado,
      intento: intentos,
      folio: aprobado ? generarFolio(cursoId) : null,
      fecha: new Date().toISOString()
    };
    store.setUltimoResultado(cursoId, resultado);

    renderResumen(resultado);
  }

  function renderResumen(resultado) {
    evalShell.innerHTML = '';
    evalShell.appendChild(el('div', { class: 'ica-card ica-eval-summary ica-anim-scale' }, [
      el('p', { class: 'ica-eyebrow' }, 'Evaluación finalizada'),
      el('h2', {}, `Obtuviste ${resultado.porcentaje}%`),
      el('div', { class: 'ica-eval-summary-grid' }, [
        el('div', { class: 'ica-eval-summary-stat' }, [el('strong', {}, String(resultado.porcentaje) + '%'), el('span', { class: 'ica-text-muted' }, 'Calificación')]),
        el('div', { class: 'ica-eval-summary-stat is-correct' }, [el('strong', {}, String(resultado.correctas)), el('span', { class: 'ica-text-muted' }, 'Correctas')]),
        el('div', { class: 'ica-eval-summary-stat is-incorrect' }, [el('strong', {}, String(resultado.incorrectas)), el('span', { class: 'ica-text-muted' }, 'Incorrectas')])
      ]),
      el('a', { href: `#/curso/${cursoId}/resultado`, class: 'ica-btn ica-btn-primary ica-btn-lg' }, ['Ver resultado', el('i', { class: 'fa-solid fa-arrow-right' })])
    ]));
  }

  renderQuestion();
}

function renderSinIntentos(root, curso, cursoId, gates) {
  const content = el('div', { class: 'ica-eval-shell' }, [
    el('div', { class: 'ica-card ica-eval-summary' }, [
      el('div', { class: 'ica-result-icon is-fail' }, [el('i', { class: 'fa-solid fa-hourglass-end' })]),
      el('h2', {}, 'Sin intentos disponibles'),
      el('p', { class: 'ica-text-muted' }, `Alcanzaste el máximo de ${curso.maximoIntentos} intentos permitidos para este examen. Contacta a Compliance o a tu administrador de capacitación para gestionar un nuevo intento.`),
      el('a', { href: `#/curso/${cursoId}/dashboard`, class: 'ica-btn ica-btn-navy' }, 'Volver al dashboard')
    ])
  ]);
  mount(root, renderAppShell({ cursoId, activeKey: 'evaluacion', gates, nombreCurso: curso.nombre, content }), 'ica-anim-fade');
}
