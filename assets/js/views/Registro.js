/* =========================================================
   views/Registro.js — Pantalla 2: Registro del participante.
   Nombre, num. empleado (opcional -> autocompleta Empresa),
   empresa, correo, puesto, cliente (si aplica), ciudad, estado, pais.
   ========================================================= */

import { el, mount, qs, scrollIntoViewSafe } from '../utils/dom.js';
import { getCurso } from '../config.js';
import { store } from '../store.js';
import { enviarRegistro } from '../services/api.js';
import { navigate } from '../router.js';
import { showToast } from '../components/Toast.js';

const REQUIRED_FIELDS = ['nombre', 'empresa', 'correo', 'puesto', 'ciudad', 'estado', 'pais'];

function field(id, label, { type = 'text', optional = false, placeholder = '', full = false } = {}) {
  return el('div', { class: `ica-field${full ? ' ica-field-full' : ''}` }, [
    el('label', { for: id }, [label, optional ? el('span', { class: 'ica-optional' }, '(opcional)') : null]),
    el('input', { type, id, name: id, placeholder }),
    el('p', { class: 'ica-field-error-msg', id: `${id}Error`, style: 'display:none;' })
  ]);
}

export async function renderRegistro(root, { params }) {
  const cursoId = params.cursoId;
  const curso = await getCurso(cursoId);
  if (!curso) { navigate('/'); return; }

  const existente = store.getRegistro(cursoId);

  const form = el('form', { id: 'registroForm', novalidate: 'true', class: 'ica-registro-grid' }, [
    field('nombre', 'Nombre completo', { full: true, placeholder: 'Ej. Juan Pérez López' }),
    field('numEmpleado', 'Número de empleado', { optional: true, placeholder: 'Ej. 10234' }),
    field('empresa', 'Empresa', { placeholder: 'Nombre de tu empresa' }),
    field('correo', 'Correo electrónico', { type: 'email', placeholder: 'nombre@empresa.com' }),
    field('puesto', 'Puesto', { placeholder: 'Ej. Supervisor de operaciones' }),
    field('cliente', 'Cliente', { optional: true, placeholder: 'Si aplica' }),
    field('ciudad', 'Ciudad', { placeholder: 'Ej. Ciudad de México' }),
    field('estado', 'Estado', { placeholder: 'Ej. CDMX' }),
    field('pais', 'País', { full: true, placeholder: 'Ej. México' }),
    el('div', { class: 'ica-registro-actions ica-field-full', style: 'grid-column:1/-1;' }, [
      el('a', { href: `#/curso/${cursoId}`, class: 'ica-btn ica-btn-ghost' }, 'Cancelar'),
      el('button', { type: 'submit', class: 'ica-btn ica-btn-primary', id: 'registroSubmit' }, ['Comenzar curso', el('i', { class: 'fa-solid fa-arrow-right' })])
    ])
  ]);

  const card = el('div', { class: 'ica-auth-card ica-card ica-anim-scale' }, [
    el('div', { class: 'ica-auth-brand' }, [
      el('div', { class: 'ica-icon-circle', style: 'background:var(--ica-navy-900);' }, [el('i', { class: 'fa-solid fa-shield-halved', style: 'color:var(--ica-gold-400)' })]),
      el('span', { style: 'font-family:var(--ica-font-head);font-weight:700;color:var(--ica-navy-900);' }, 'INTER-CON Academy')
    ]),
    el('h2', {}, 'Registro de participante'),
    el('p', { class: 'ica-text-muted' }, `Completa tus datos para comenzar "${curso.nombre}". Esta información se usa para dar seguimiento a tu avance y emitir tu certificado.`),
    form
  ]);

  mount(root, el('div', { class: 'ica-auth-screen' }, [card]), 'ica-anim-fade');

  // Prefill si ya existia un registro previo para este curso.
  if (existente) {
    Object.entries(existente).forEach(([key, value]) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input && typeof value === 'string') input.value = value;
    });
  }

  wireEmpresaAutofill(form);
  wireSubmit(form, cursoId);
}

function wireEmpresaAutofill(form) {
  const numEmpleado = form.querySelector('[name="numEmpleado"]');
  const empresa = form.querySelector('[name="empresa"]');
  let autoFilled = false;

  // Nota: se usa readOnly (no disabled) a proposito. Los campos "disabled"
  // se excluyen de FormData al enviar el formulario; "readonly" bloquea la
  // edicion pero conserva el valor en el envio.
  numEmpleado.addEventListener('input', () => {
    if (numEmpleado.value.trim()) {
      if (!empresa.value.trim() || autoFilled) {
        empresa.value = 'INTER-CON';
        autoFilled = true;
      }
      empresa.readOnly = true;
    } else {
      empresa.readOnly = false;
      if (autoFilled) { empresa.value = ''; autoFilled = false; }
    }
  });
}

function setFieldError(form, name, message) {
  const input = form.querySelector(`[name="${name}"]`);
  const msg = form.querySelector(`#${name}Error`);
  if (!input) return;
  if (message) {
    input.classList.add('is-error');
    if (msg) { msg.textContent = message; msg.style.display = 'block'; }
  } else {
    input.classList.remove('is-error');
    if (msg) { msg.style.display = 'none'; }
  }
}

function wireSubmit(form, cursoId) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    REQUIRED_FIELDS.forEach((f) => setFieldError(form, f, ''));

    let hasErrors = false;
    REQUIRED_FIELDS.forEach((f) => {
      if (!data[f] || !String(data[f]).trim()) {
        setFieldError(form, f, 'Este campo es obligatorio.');
        hasErrors = true;
      }
    });
    if (data.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) {
      setFieldError(form, 'correo', 'Ingresa un correo electrónico válido.');
      hasErrors = true;
    }
    if (hasErrors) {
      showToast('Revisa los campos marcados en rojo antes de continuar.', { icon: 'fa-solid fa-triangle-exclamation', variant: 'warning' });
      scrollIntoViewSafe(form.querySelector('.is-error'), { behavior: 'smooth', block: 'center' });
      return;
    }

    const submitBtn = qs('#registroSubmit', form);
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="ica-spinner"></span> Registrando…';

    store.setRegistro(cursoId, data);
    await enviarRegistro(cursoId, data);

    navigate(`/curso/${cursoId}/dashboard`);
  });
}
