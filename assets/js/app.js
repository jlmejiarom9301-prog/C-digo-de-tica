/* =========================================================
   app.js — Bootstrap de INTER-CON Academy. Registra las rutas
   de la SPA y arranca el router. No contiene contenido de
   curso ni logica de negocio: solo conecta router <-> vistas.
   ========================================================= */

import { route, startRouter, setNotFound, navigate } from './router.js';
import { getCursoDestacado } from './config.js';
import { el, mount } from './utils/dom.js';
import { initConfigWarnings } from './components/Toast.js';

import { renderLanding } from './views/Landing.js';
import { renderRegistro } from './views/Registro.js';
import { renderDashboard } from './views/Dashboard.js';
import { renderModulo } from './views/Modulo.js';
import { renderEvaluacion } from './views/Evaluacion.js';
import { renderResultado } from './views/Resultado.js';
import { renderCertificado } from './views/Certificado.js';
import { renderPerfil } from './views/Perfil.js';

const root = document.getElementById('app-root');

initConfigWarnings();

route('/', async () => {
  try {
    const curso = await getCursoDestacado();
    navigate(curso ? `/curso/${curso.id}` : '/no-encontrado');
  } catch (err) {
    console.error('[app] No se pudo cargar la configuración de cursos:', err);
    renderConfigError(err);
  }
});

route('/curso/:cursoId', (ctx) => safeRender(renderLanding, ctx));
route('/curso/:cursoId/registro', (ctx) => safeRender(renderRegistro, ctx));
route('/curso/:cursoId/dashboard', (ctx) => safeRender(renderDashboard, ctx));
route('/curso/:cursoId/modulo/:moduloId', (ctx) => safeRender(renderModulo, ctx));
route('/curso/:cursoId/evaluacion', (ctx) => safeRender(renderEvaluacion, ctx));
route('/curso/:cursoId/resultado', (ctx) => safeRender(renderResultado, ctx));
route('/curso/:cursoId/certificado', (ctx) => safeRender(renderCertificado, ctx));
route('/curso/:cursoId/perfil', (ctx) => safeRender(renderPerfil, ctx));

async function safeRender(viewFn, ctx) {
  try {
    await viewFn(root, ctx);
  } catch (err) {
    console.error('[app] Error al renderizar la vista:', err);
    renderConfigError(err);
  }
}

function renderConfigError(err) {
  mount(root, el('div', { class: 'ica-container', style: 'padding:100px 0;text-align:center;' }, [
    el('i', { class: 'fa-solid fa-triangle-exclamation', style: 'font-size:34px;color:var(--ica-gold-500);margin-bottom:16px;display:block;' }),
    el('h2', {}, 'No se pudo cargar el contenido'),
    el('p', { class: 'ica-text-muted' }, 'Verifica que config/cursos.json y config/videos.json existan y tengan un formato válido. Si abriste el archivo con doble clic, usa un servidor local (ver README).'),
    el('a', { href: '#/', class: 'ica-btn ica-btn-navy' }, 'Reintentar')
  ]));
}

setNotFound(() => {
  mount(root, el('div', { class: 'ica-container', style: 'padding:100px 0;text-align:center;' }, [
    el('h2', {}, 'Página no encontrada'),
    el('p', { class: 'ica-text-muted' }, 'La ruta que buscas no existe.'),
    el('a', { href: '#/', class: 'ica-btn ica-btn-navy' }, 'Volver al inicio')
  ]));
});

startRouter();
