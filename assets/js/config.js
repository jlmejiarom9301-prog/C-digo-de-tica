/* =========================================================
   config.js — Carga y cachea config/cursos.json y config/videos.json.
   Es la UNICA parte de la app que hace fetch() de configuracion
   estatica. Las vistas siempre piden datos a traves de aqui
   (o de services/api.js cuando exista backend real).
   ========================================================= */

let cursosData = null;
let videosData = null;

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path} (HTTP ${res.status})`);
  return res.json();
}

export async function loadCursos() {
  if (!cursosData) cursosData = await fetchJson('config/cursos.json');
  return cursosData;
}

export async function loadVideos() {
  if (!videosData) videosData = await fetchJson('config/videos.json');
  return videosData;
}

export async function getPlataforma() {
  const { plataforma } = await loadCursos();
  return plataforma;
}

export async function getCursos() {
  const { cursos } = await loadCursos();
  return cursos;
}

export async function getCurso(cursoId) {
  const cursos = await getCursos();
  return cursos.find((c) => c.id === cursoId) || null;
}

export async function getCursoDestacado() {
  const { plataforma, cursos } = await loadCursos();
  return cursos.find((c) => c.id === plataforma.cursoDestacado) || cursos[0] || null;
}

export async function getVideoUrl(cursoId, moduloId) {
  const videos = await loadVideos();
  return (videos[cursoId] || {})[String(moduloId)] || '';
}

export function isPlaceholderUrl(url) {
  return !url || typeof url !== 'string' || url.trim() === '' || /^PEGAR_/i.test(url.trim());
}

export function sortedModulos(curso) {
  return (curso?.modulos || []).slice().sort((a, b) => a.orden - b.orden);
}
