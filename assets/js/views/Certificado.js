/* =========================================================
   views/Certificado.js — Vista completa del certificado, con
   descarga en PDF. Requiere haber aprobado la evaluacion.
   ========================================================= */

import { el, mount } from '../utils/dom.js';
import { getCurso } from '../config.js';
import { store } from '../store.js';
import { navigate } from '../router.js';
import { renderAppShell } from '../components/AppShell.js';
import { getGates } from '../progress.js';
import { buildCertificadoModel, renderCertSheet, descargarCertificadoPDF, registrarConstancia } from '../certificado.js';
import { showToast } from '../components/Toast.js';
import { skeletonView } from '../components/Skeleton.js';

export async function renderCertificado(root, { params }) {
  mount(root, skeletonView(), 'ica-anim-fade');

  const cursoId = params.cursoId;
  const curso = await getCurso(cursoId);
  if (!curso) { navigate('/'); return; }
  const registro = store.getRegistro(cursoId);
  if (!registro) { navigate(`/curso/${cursoId}/registro`); return; }

  const gates = getGates(curso, cursoId);
  const resultado = store.getUltimoResultado(cursoId);
  if (!gates.certificado || !resultado?.aprobado) {
    showToast('Aprueba la evaluación para obtener tu certificado.', { icon: 'fa-solid fa-lock', variant: 'warning' });
    navigate(`/curso/${cursoId}/dashboard`);
    return;
  }

  const model = buildCertificadoModel(curso, registro, resultado);

  const downloadBtn = el('button', { type: 'button', class: 'ica-btn ica-btn-primary ica-btn-lg', id: 'certDownloadBtn' }, [el('i', { class: 'fa-solid fa-download' }), 'Descargar en PDF']);

  const content = el('div', {}, [
    el('div', { style: 'margin-bottom:24px;' }, [
      el('p', { class: 'ica-eyebrow' }, 'Certificado'),
      el('h1', { style: 'font-size:24px;' }, 'Tu certificado está listo'),
      el('p', { class: 'ica-text-muted' }, `Folio ${model.folio} · Emitido el ${model.fecha}`)
    ]),
    el('div', { class: 'ica-cert-wrap ica-anim-scale' }, [
      renderCertSheet(model),
      downloadBtn
    ])
  ]);

  const shell = renderAppShell({ cursoId, activeKey: 'certificado', gates, nombreCurso: curso.nombre, content });
  mount(root, shell, 'ica-anim-fade');

  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<span class="ica-spinner"></span> Generando PDF…';
    try {
      const sheet = document.getElementById('certSheet');
      await descargarCertificadoPDF(sheet);
      const yaRegistrado = store.getCertificado(cursoId);
      if (!yaRegistrado) {
        await registrarConstancia(cursoId, model);
        store.setCertificado(cursoId, { folio: model.folio, fecha: model.fecha });
      }
    } catch (err) {
      showToast(err.message || 'No se pudo generar el PDF.', { icon: 'fa-solid fa-triangle-exclamation', variant: 'warning' });
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Descargar en PDF';
    }
  });
}
