/* =========================================================
   views/Modulo.js — Vista del reproductor de un modulo.
   Video + resumen + puntos clave. "Marcar como completado" se
   habilita solo cuando se detecta que el video fue visto.
   La deteccion hoy es local (ver wireVideoGate); esta preparada
   para sustituirse por validacion de % visto via API
   (services/api.js -> validarPorcentajeVisto).
   ========================================================= */

import { el, mount } from '../utils/dom.js';
import { getCurso, getVideoUrl, isPlaceholderUrl, sortedModulos } from '../config.js';
import { store } from '../store.js';
import { guardarProgreso, validarPorcentajeVisto } from '../services/api.js';
import { navigate } from '../router.js';
import { renderAppShell } from '../components/AppShell.js';
import { getModuloStatus, getGates } from '../progress.js';
import { extraerMinutos } from '../utils/format.js';
import { showToast } from '../components/Toast.js';
import { skeletonView } from '../components/Skeleton.js';

function toYouTubeEmbed(url) {
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const short = url.match(/youtu\.be\/([^?&]+)/);
  return short ? `https://www.youtube.com/embed/${short[1]}` : url;
}
function toVimeoEmbed(url) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}

function buildVideoNode(videoUrl, modulo) {
  if (isPlaceholderUrl(videoUrl)) {
    return el('div', { class: 'ica-video-placeholder' }, [
      el('i', { class: 'fa-solid fa-clapperboard' }),
      el('p', {}, 'Video disponible próximamente'),
      el('span', {}, [`Pega la URL real en `, el('code', {}, `config/videos.json`), ` (módulo ${modulo.id})`]),
      el('button', { type: 'button', class: 'ica-btn ica-btn-outline-gold ica-btn-sm', id: 'demoWatchedBtn', style: 'margin-top:14px;' }, [
        el('i', { class: 'fa-solid fa-eye' }), ' Simular reproducción completa (demo)'
      ])
    ]);
  }
  if (/youtube\.com|youtu\.be/i.test(videoUrl)) {
    return el('iframe', { src: toYouTubeEmbed(videoUrl), title: modulo.titulo, loading: 'lazy', allowfullscreen: 'true', allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' });
  }
  if (/vimeo\.com/i.test(videoUrl)) {
    return el('iframe', { src: toVimeoEmbed(videoUrl), title: modulo.titulo, loading: 'lazy', allowfullscreen: 'true', allow: 'autoplay; fullscreen; picture-in-picture' });
  }
  return el('video', { controls: 'true', preload: 'metadata', id: 'nativeVideo' }, [
    el('source', { src: videoUrl })
  ]);
}

function wireVideoGate(mediaWrap, modulo, onWatched) {
  const video = mediaWrap.querySelector('#nativeVideo');
  const iframe = mediaWrap.querySelector('iframe');
  const demoBtn = mediaWrap.querySelector('#demoWatchedBtn');

  if (video) {
    video.addEventListener('timeupdate', () => {
      if (video.duration && video.currentTime / video.duration >= 0.9) onWatched();
    });
    video.addEventListener('ended', onWatched);
  } else if (iframe) {
    // No hay API de progreso de video conectada todavia (ver services/api.js
    // -> validarPorcentajeVisto). Mientras tanto, se habilita el boton tras
    // un tiempo equivalente a la duracion estimada del modulo.
    const ms = Math.max(extraerMinutos(modulo.duracionEstimada), 1) * 60 * 1000;
    setTimeout(onWatched, ms);
  } else if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      demoBtn.disabled = true;
      demoBtn.innerHTML = '<i class="fa-solid fa-check"></i> Reproducción simulada';
      onWatched();
    });
  }
}

export async function renderModulo(root, { params }) {
  mount(root, skeletonView(), 'ica-anim-fade');

  const cursoId = params.cursoId;
  const moduloId = Number(params.moduloId);
  const curso = await getCurso(cursoId);
  if (!curso) { navigate('/'); return; }
  if (!store.getRegistro(cursoId)) { navigate(`/curso/${cursoId}/registro`); return; }

  const modulos = sortedModulos(curso);
  const idx = modulos.findIndex((m) => m.id === moduloId);
  const modulo = modulos[idx];
  if (!modulo) { navigate(`/curso/${cursoId}/dashboard`); return; }

  const status = getModuloStatus(curso, modulo, cursoId);
  if (status === 'bloqueado') {
    showToast('Completa los módulos anteriores antes de continuar.', { icon: 'fa-solid fa-lock', variant: 'warning' });
    navigate(`/curso/${cursoId}/dashboard`);
    return;
  }

  const videoUrl = await getVideoUrl(cursoId, modulo.id);
  const yaCompletado = store.esModuloCompletado(cursoId, modulo.id);
  const anterior = modulos[idx - 1];
  const siguiente = modulos[idx + 1];

  const videoNode = buildVideoNode(videoUrl, modulo);
  const mediaWrap = el('div', { class: 'ica-video-frame-wrap' }, [videoNode]);

  const completeBtn = el('button', {
    type: 'button',
    class: 'ica-btn ica-btn-primary',
    id: 'completeBtn',
    disabled: 'true'
  }, yaCompletado
    ? [el('i', { class: 'fa-solid fa-circle-check' }), ' Completado']
    : ['Marcar como completado', el('i', { class: 'fa-solid fa-check' })]
  );

  const nextBtn = el('a', {
    href: siguiente ? `#/curso/${cursoId}/modulo/${siguiente.id}` : `#/curso/${cursoId}/dashboard?foco=modulos`,
    class: `ica-btn ica-btn-navy${yaCompletado ? '' : ' ica-hidden'}`,
    id: 'nextBtn'
  }, [siguiente ? 'Siguiente módulo' : 'Volver al dashboard', el('i', { class: 'fa-solid fa-arrow-right' })]);

  const content = el('div', {}, [
    el('div', { class: 'ica-module-header ica-anim-slide-up' }, [
      el('a', { href: `#/curso/${cursoId}/dashboard?foco=modulos`, class: 'ica-text-muted', style: 'font-size:13px;' }, [el('i', { class: 'fa-solid fa-arrow-left' }), ' Volver a módulos']),
      el('div', { class: 'ica-module-tag', style: 'margin-top:14px;' }, [
        el('span', { class: 'ica-badge ica-badge-gold' }, `Módulo ${String(modulo.orden).padStart(2, '0')} de ${modulos.length}`),
        el('span', { class: 'ica-text-muted', style: 'font-size:13px;' }, [el('i', { class: 'fa-regular fa-clock' }), ` ${modulo.duracionEstimada}`])
      ]),
      el('h1', { style: 'font-size:26px;margin-top:10px;' }, modulo.titulo),
      modulo.subtitulo ? el('p', { class: 'ica-text-muted' }, modulo.subtitulo) : null
    ]),
    el('div', { class: 'ica-module-layout ica-anim-slide-up', style: 'animation-delay:80ms' }, [
      el('div', {}, [
        mediaWrap,
        el('p', { class: 'ica-video-progress-note' }, [el('i', { class: 'fa-solid fa-circle-info' }), ' El botón "Marcar como completado" se habilita al terminar el video.'])
      ]),
      el('div', { class: 'ica-card ica-card-pad' }, [
        el('h4', { style: 'font-size:14px;text-transform:uppercase;letter-spacing:0.04em;color:var(--ica-ink-500);margin-bottom:10px;' }, 'Resumen'),
        el('p', {}, modulo.descripcion),
        modulo.puntosClave?.length ? el('h4', { style: 'font-size:14px;text-transform:uppercase;letter-spacing:0.04em;color:var(--ica-ink-500);margin:18px 0 10px;' }, 'Puntos importantes') : null,
        el('ul', { class: 'ica-module-points' }, (modulo.puntosClave || []).map((p) => el('li', {}, [el('i', { class: 'fa-solid fa-check' }), p]))),
        el('div', { class: 'ica-module-actions' }, [completeBtn, nextBtn])
      ])
    ])
  ]);

  const shell = renderAppShell({
    cursoId,
    activeKey: 'modulos',
    gates: getGates(curso, cursoId),
    nombreCurso: curso.nombre,
    content
  });

  mount(root, shell, 'ica-anim-fade');

  if (!yaCompletado) {
    wireVideoGate(mediaWrap, modulo, () => { completeBtn.disabled = false; });
  }

  completeBtn.addEventListener('click', async () => {
    completeBtn.disabled = true;
    completeBtn.innerHTML = '<span class="ica-spinner"></span> Guardando…';
    store.marcarModuloCompletado(cursoId, modulo.id);
    await validarPorcentajeVisto(cursoId, modulo.id, 100);
    await guardarProgreso(cursoId, modulo.id, 100);
    completeBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Completado';
    nextBtn.classList.remove('ica-hidden');
    showToast('Módulo marcado como completado.', { icon: 'fa-solid fa-circle-check' });
  });
}
