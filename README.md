# INTER-CON Academy

Plataforma corporativa de capacitación de **INTER-CON Servicios de Seguridad
Privada, S.A. de C.V.** Rediseño completo del proyecto anterior
(`Código de Ética`), convertido en la primera versión de una plataforma tipo
LMS: una Single Page Application (SPA) modular, basada en configuración,
preparada para alojar múltiples cursos sin tocar el código fuente.

El **Código de Ética** es hoy el primer curso disponible. Toda la
arquitectura — rutas, componentes, vistas — es agnóstica al curso: agregar
"NOM-035", "Protección Civil", etc. es una tarea de **configuración**, no de
programación.

No requiere build step (sin Webpack/Vite/npm run build): es HTML/CSS/JS
puro con ES Modules, listo para publicarse tal cual en GitHub Pages o
cualquier hosting estático.

## Índice

1. [Cómo abrir el proyecto localmente](#1-cómo-abrir-el-proyecto-localmente)
2. [Arquitectura general](#2-arquitectura-general)
3. [Cómo agregar un curso nuevo](#3-cómo-agregar-un-curso-nuevo-sin-tocar-código)
4. [Cómo cambiar los videos](#4-cómo-cambiar-los-videos)
5. [Rutas de la SPA](#5-rutas-de-la-spa)
6. [Reglas de negocio: bloqueo de módulos y evaluación](#6-reglas-de-negocio-bloqueo-de-módulos-y-evaluación)
7. [Conectar APIs reales (`services/api.js`)](#7-conectar-apis-reales-servicesapijs)
8. [Sistema de diseño](#8-sistema-de-diseño)
9. [Publicar en GitHub Pages](#9-publicar-en-github-pages)
10. [Qué se reutilizó de la versión anterior](#10-qué-se-reutilizó-de-la-versión-anterior)
11. [Rendimiento y accesibilidad](#11-rendimiento-y-accesibilidad)

## 1. Cómo abrir el proyecto localmente

Los archivos `config/*.json` se cargan con `fetch()`, así que **no funcionan
abriendo `index.html` con doble clic** (los navegadores bloquean `fetch` en
`file://` por CORS). Usa un servidor local simple:

```bash
cd inter-con-academy
python -m http.server 8000
# Abre http://localhost:8000 en tu navegador
```

```bash
# Alternativa con Node.js
npx serve .
```

GitHub Pages sirve el proyecto por HTTPS normal, así que en producción esto
no es un problema.

## 2. Arquitectura general

```text
inter-con-academy/
├── index.html                    # Shell de la SPA (un solo <div id="app-root">)
├── README.md
├── config/
│   ├── cursos.json                # Fuente unica de verdad de TODOS los cursos
│   └── videos.json                # URLs de video por curso y modulo
└── assets/
    ├── img/                        # Imagenes/ilustraciones
    ├── css/
    │   ├── tokens.css              # Paleta INTER-CON, tipografia, espaciado, sombras
    │   ├── base.css                 # Reset + animaciones (fade/slide/skeleton)
    │   ├── layout.css               # Shell: sidebar + topbar + contenido
    │   ├── components.css           # Botones, tarjetas, badges, progreso, toast...
    │   └── views.css                # Estilos especificos de cada pantalla
    └── js/
        ├── app.js                   # Bootstrap: registra rutas y arranca el router
        ├── router.js                 # Router SPA basado en hash (#/...), sin recargas
        ├── store.js                  # Unica capa que toca localStorage (namespaced por curso)
        ├── config.js                  # Carga/cachea config/cursos.json y config/videos.json
        ├── progress.js                 # Reglas de bloqueo de modulos y "gates" de nav
        ├── certificado.js              # Construccion y descarga en PDF del certificado
        ├── services/
        │   └── api.js                   # UNICO lugar con URLs/llamadas a un backend futuro
        ├── components/                  # Piezas de UI reutilizables entre vistas
        │   ├── AppShell.js                # Envoltura sidebar+topbar+contenido
        │   ├── Sidebar.js
        │   ├── Topbar.js
        │   ├── ModuleCard.js
        │   ├── ProgressBar.js             # Barra lineal + anillo circular SVG
        │   ├── Toast.js
        │   └── Skeleton.js
        ├── views/                        # Una vista = una pantalla de la SPA
        │   ├── Landing.js                  # Pantalla 1
        │   ├── Registro.js                 # Pantalla 2
        │   ├── Dashboard.js                # Pantalla 3
        │   ├── Modulo.js                    # Reproductor de modulo
        │   ├── Evaluacion.js                 # Examen, una pregunta a la vez
        │   ├── Resultado.js                   # Aprobado / no aprobado
        │   ├── Certificado.js                  # Certificado + descarga PDF
        │   └── Perfil.js
        └── utils/
            ├── dom.js                        # Helpers de creacion de DOM (el(), qs(), mount())
            └── format.js                      # Fechas, folios, minutos
```

**Principio de separación** (igual que en la versión anterior, ahora llevado
a toda la plataforma):

- **Configuración** (`config/*.json`) — qué cursos existen, sus módulos,
  preguntas y videos.
- **Servicios** (`services/api.js`) — cómo se habla con un backend futuro.
- **Estado** (`store.js`) — qué hizo el alumno (registro, progreso, examen).
- **Lógica de negocio** (`progress.js`, `certificado.js`) — reglas
  compartidas (bloqueo de módulos, cálculo de folio, etc.).
- **Presentación** (`components/`, `views/`, `assets/css/`) — cómo se ve.

Ninguna vista contiene URLs, textos de curso ni preguntas "quemadas": todo
se pide a `config.js` o `store.js`.

## 3. Cómo agregar un curso nuevo (sin tocar código)

1. Abre `config/cursos.json`.
2. Copia el objeto del curso `LEG-001` (Código de Ética) como plantilla.
3. Cambia `id` (debe ser único, ej. `"NOM-035"`), `nombre`, `descripcion`,
   `color`, `icono`, `duracionEstimada`, `beneficios`, `queAprenderas`,
   `modulos` y `evaluacion.preguntas`.
4. Marca `"activo": true` y `"visible": true` para que deje de aparecer como
   "Próximamente" en el catálogo de la landing.
5. Agrega las URLs de video de ese curso en `config/videos.json`, bajo una
   clave con el mismo `id` del curso.
6. Para que la landing lo muestre por defecto al entrar a `/`, cambia
   `plataforma.cursoDestacado` en `cursos.json`. Cualquier curso también es
   accesible directamente en `#/curso/SU-ID`.

No hay que tocar `index.html`, ningún archivo de `assets/js/`, ni el CSS.
Los cursos placeholder ya incluidos (NOM-035, Protección Civil, Seguridad
Física, Seguridad Electrónica, Compliance, Anticorrupción, Prevención de
Lavado de Dinero, Inducción General, Capacitación por Cliente) están
marcados `"activo": false` — aparecen en el catálogo de la landing como
"Próximamente" y sirven de plantilla para completarse más adelante.

## 4. Cómo cambiar los videos

Edita `config/videos.json`:

```json
{
  "LEG-001": {
    "1": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
    "2": "PEGAR_URL_VIDEO_2"
  }
}
```

Mientras un valor empiece con `PEGAR_` (o esté vacío), la vista de módulo
muestra automáticamente un reproductor de "video disponible próximamente"
con un botón de demostración, sin romperse. Se aceptan URLs de YouTube,
Vimeo o un archivo de video directo (`.mp4`, etc.).

Cuando exista un backend, este archivo puede sustituirse por la respuesta
del endpoint `GET /videos` (ver `services/api.js`) sin cambiar ninguna
vista: `config.js` y `services/api.js` exponen la misma forma de datos.

## 5. Rutas de la SPA

Router 100% basado en hash (`#/...`), sin recargas de página
(`assets/js/router.js`):

| Ruta | Vista | Pantalla del brief |
|---|---|---|
| `#/` | redirige al curso destacado | — |
| `#/curso/:cursoId` | `Landing.js` | 1. Landing Page |
| `#/curso/:cursoId/registro` | `Registro.js` | 2. Registro del participante |
| `#/curso/:cursoId/dashboard` | `Dashboard.js` | 3. Dashboard del alumno |
| `#/curso/:cursoId/modulo/:moduloId` | `Modulo.js` | Vista del módulo |
| `#/curso/:cursoId/evaluacion` | `Evaluacion.js` | Evaluación |
| `#/curso/:cursoId/resultado` | `Resultado.js` | Resultado |
| `#/curso/:cursoId/certificado` | `Certificado.js` | Certificado |
| `#/curso/:cursoId/perfil` | `Perfil.js` | Perfil (barra lateral) |

## 6. Reglas de negocio: bloqueo de módulos y evaluación

Centralizadas en `assets/js/progress.js` para que Dashboard, Módulo, el
sidebar y los guards de Evaluación/Certificado usen siempre la misma regla:

- Los módulos se desbloquean **secuencialmente**: el módulo 1 siempre está
  disponible; el módulo N se desbloquea al completar el módulo N-1.
- Un módulo se marca "completado" solo cuando se detecta que el video se
  vio completo (evento `ended`/`timeupdate` en video nativo; en video
  embebido, hoy se usa un temporizador de respaldo — ver el comentario
  `TODO` en `views/Modulo.js` — listo para sustituirse por una validación
  real de porcentaje visto vía API).
- La **Evaluación** se desbloquea solo cuando el 100% de los módulos están
  completados.
- El **Certificado** se desbloquea solo si el intento más reciente de
  evaluación fue aprobado (`calificacion >= calificacionMinima`).
- Los intentos de evaluación están limitados por `maximoIntentos` (definido
  por curso en `cursos.json`); al agotarse, la vista de evaluación muestra
  un mensaje y bloquea nuevos intentos.

Todo el avance se guarda en `localStorage`, separado por curso
(`store.js`), para que el alumno pueda cerrar y volver sin perder su lugar.

## 7. Conectar APIs reales (`services/api.js`)

Hoy no hay backend: `APP_MODE = "demo"` en `assets/js/services/api.js` hace
que toda la plataforma funcione con datos locales
(`config/*.json` + `store.js`). El archivo ya define los 6 servicios
previstos, con URLs placeholder:

| Función exportada | Endpoint previsto | Cuándo se llama |
|---|---|---|
| `enviarRegistro()` | `POST /registro` | Al enviar el formulario de registro |
| `obtenerCurso()` | `GET /curso` | Al cargar cualquier vista del curso (en demo usa `cursos.json`) |
| `obtenerVideos()` | `GET /videos` | Al abrir un módulo (en demo usa `videos.json`) |
| `guardarProgreso()` | `POST /progreso` | Al marcar un módulo como completado |
| `enviarEvaluacion()` | `POST /evaluacion` | Al finalizar el examen |
| `generarConstancia()` | `POST /generar-constancia` | Al descargar el certificado |

**Para pasar a producción:**

1. Cambia `export const APP_MODE = 'demo'` a `'production'` en
   `assets/js/services/api.js`.
2. Reemplaza cada URL en el objeto `ENDPOINTS` del mismo archivo.
3. Listo — ninguna vista ni componente necesita cambios: todas llaman a las
   funciones exportadas de `services/api.js`, nunca a `fetch()` directo.

Mientras una URL siga empezando con `PEGAR_`, la app lo detecta
(`isPlaceholderUrl`), no intenta la llamada rota, y muestra un aviso
discreto (`components/Toast.js`, evento `ica:config-warning`) sin romper la
experiencia visual.

## 8. Sistema de diseño

Inspirado en Microsoft Learn / Fluent Design / Material Design 3:
espacio en blanco generoso, tarjetas con sombras ligeras, glassmorphism
discreto en el hero y en el sidebar, animaciones cortas (`base.css`:
`fade`, `slide-up`, `scale`, `shimmer` para skeletons). Toda la paleta,
tipografía, espaciado y radios están centralizados como variables CSS en
`assets/css/tokens.css` — para ajustar el color institucional, radios o
tipografía de toda la plataforma basta con editar ese archivo.

## 9. Publicar en GitHub Pages

```bash
cd inter-con-academy
git init
git add .
git commit -m "INTER-CON Academy — plataforma de capacitación"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

Luego en GitHub: **Settings → Pages → Source** = rama `main`, carpeta
`/ (root)`. La URL quedará como
`https://TU_USUARIO.github.io/TU_REPOSITORIO/`.

## 10. Qué se reutilizó de la versión anterior

Todo el contenido oficial del curso de Código de Ética (los 6 módulos, sus
puntos clave, y las 10 preguntas de evaluación validadas) se migró tal cual
desde `codigo-etica-2.0/assets/js/course-config.js` a
`config/cursos.json`, sin alterar el texto. También se conservaron los
patrones ya probados de esa versión: persistencia en `localStorage`
namespaced por curso, detección de URLs placeholder (`PEGAR_...`), avisos
de configuración pendiente sin romper la UI, y descarga de constancia en
PDF vía `html2pdf.js`. Lo que cambió es la arquitectura alrededor: de un
sitio de una sola página a una SPA con router, vistas independientes y
configuración multi-curso.

## 11. Rendimiento y accesibilidad

- **Lazy loading real**: cada vista solo se renderiza cuando se navega a
  ella (no se generan los 6 módulos ni el examen por adelantado). Los
  iframes de video usan `loading="lazy"`.
- **Skeletons**: cada vista muestra un estado de carga (`components/Skeleton.js`)
  mientras se resuelve `fetch()` de la configuración.
- **`prefers-reduced-motion`**: todas las animaciones se desactivan
  automáticamente si el usuario lo tiene activado en su sistema.
- **Responsive**: sidebar colapsable en móvil/tablet (`layout.css`), grids
  que pasan a una columna por debajo de 680px.
- **Contraste**: la paleta de `tokens.css` fue elegida para mantener
  contraste AA sobre fondos claros y oscuros.
