# Código de Ética 2.0 — INTER-CON Servicios de Seguridad Privada

**Versión 2.0**: arquitectura basada en configuración (`api-config.js` +
`course-config.js`), módulos en video generados dinámicamente y evaluación
dinámica con control de intentos. Ver detalle completo más abajo.

Landing page interactiva tipo e-learning para la capacitación corporativa del
**Código de Ética para Asociados de Negocio** de INTER-CON Servicios de Seguridad
Privada, S.A. de C.V. Funciona como apoyo para capacitación presencial y como
material de consulta vía enlace. Es 100% HTML/CSS/JS estático — no requiere
servidor ni backend — y está lista para publicarse en GitHub Pages.

## Estructura del proyecto

```text
codigo-etica-2.0/
├── index.html            # Estructura y secciones (gate, módulos y quiz son dinámicos)
├── styles.css             # Estilos, paleta corporativa y responsive
├── app.js                  # Motor de la app: NO contiene URLs, textos ni preguntas
├── README.md
└── assets/
    ├── images/             # Ilustraciones propias (SVG) + notas de reemplazo
    ├── icons/               # Íconos SVG propios (el resto usa Font Awesome CDN)
    ├── animations/         # Carpeta reservada para GIFs/Lottie ligeros
    └── js/
        ├── api-config.js    # ÚNICO lugar con URLs de API / Power Automate
        └── course-config.js # ÚNICO lugar con bienvenida, registro, módulos, videos y preguntas
```

## Arquitectura de configuración (léelo antes de editar nada)

Este proyecto separa **configuración** (qué se muestra) de **lógica** (cómo se
muestra), para que dar mantenimiento sea seguro y no requiera tocar código:

- **`assets/js/api-config.js`** — las 5 URLs de los servicios (Power Automate
  u otra API). Es el único archivo del proyecto donde deben vivir URLs de API.
- **`assets/js/course-config.js`** — nombre del curso, calificación mínima,
  máximo de intentos, los 6 módulos (título, descripción, video, puntos
  clave, recursos) y las preguntas de la evaluación. También define
  `window.APP_MODE` ("demo" o "production").
- **`app.js`** — solo lógica. Lee ambos archivos de configuración y genera
  dinámicamente la pantalla de bienvenida/registro, las tarjetas de módulo,
  el reproductor, la evaluación y la constancia. **Nunca** contiene URLs,
  títulos ni preguntas escritos a mano.
- **`index.html`** — contiene contenedores vacíos (`#gateTitulo`,
  `#gateMensaje`, `#modulosGrid`, `#moduloPlayer`, `#quizContainer`, etc.)
  que `app.js` llena en tiempo de ejecución. No hay textos de bienvenida,
  módulos ni preguntas repetidos en el HTML.

Ambos archivos de `assets/js/` deben cargarse **antes** que `app.js` (así
está ya configurado en `index.html`).

## Contenido incluido

1. **Bienvenida y registro (gate)** — pantalla de acceso que pide los datos
   del participante antes de mostrar el resto del sitio (ver detalle abajo).
2. Objetivo de la capacitación
3. Importancia del Código de Ética
4. Alcance
5. Condiciones Laborales
6. Salud y Seguridad
7. **Ética Empresarial** (10 principios rectores + **módulos del curso en
   video**, 100% generado desde `course-config.js`)
8. Medio Ambiente
9. Canal de Denuncia
10. Compromiso Final
11. Evaluación (quiz dinámico con cálculo automático de resultado)
12. Firma y constancia demo (firma en pantalla + PDF / API)
13. Métricas demo (dashboard mockup)
14. Cierre

El contenido fue tomado y reorganizado visualmente a partir de
`Inter-Con_Ethics_Blueprint.pptx`, respetando su sentido original. No se
agregó legislación ni obligaciones no mencionadas en la presentación. Los
textos de las secciones 5 a 9 viven en `index.html`; los textos de
bienvenida/registro (sección 1), los videos y puntos clave de los 6 módulos
(sección 7) y las preguntas de la evaluación (sección 11) viven en
`assets/js/course-config.js`.

## La pantalla de bienvenida y registro (gate)

Antes de mostrar cualquier otra sección, el sitio presenta una pantalla de
**bienvenida** (logo, título, mensaje, objetivo, duración estimada y
requisitos para acreditar el curso) con un botón **"Comenzar curso"**. Al
pulsarlo aparece un **formulario de registro** con estos campos:

| Campo | Obligatorio |
|---|---|
| Nombre completo | Sí |
| Tipo de participante (Empleado, Proveedor, Cliente, Contratista, Otro) | Sí |
| Número de empleado | No |
| Empresa | **Solo si no se captura número de empleado** |
| Correo electrónico | Sí |
| Teléfono | No |
| Aceptación de tratamiento de datos / consentimiento | Sí |

Mientras el registro no se complete, el resto del sitio permanece oculto
(`body.gate-locked` en `styles.css`). Al enviarse un registro válido:

- Se guarda localmente (`localStorage`, con la misma lógica de `readLocal` /
  `writeLocal` que usa el resto del progreso del curso).
- Se precarga el nombre y correo en el formulario de constancia (sección 12).
- Se desbloquea el resto del sitio y se inicializan módulos y evaluación.
- En modo `"production"`, el objeto de registro se envía como parte del
  payload de `iniciarCurso` (ver tabla de APIs más abajo).

Si la persona ya se registró antes (mismo navegador), el gate no vuelve a
aparecer en visitas posteriores.

**Para editar los textos de esta pantalla**, edita `COURSE_CONFIG.bienvenida`
(`titulo`, `mensaje`, `objetivo`, `duracionEstimada`) y
`COURSE_CONFIG.registro.tiposParticipante` en `assets/js/course-config.js`.
Los requisitos ("visualizar el 100% de los videos", "calificación mínima",
"máximo de intentos") se generan solos a partir de `totalVideos`,
`calificacionMinima` y `maximoIntentos` — no hay que editarlos por separado.

## 1. Abrir el proyecto localmente

No necesitas instalar nada. Simplemente:

1. Descarga o clona la carpeta `codigo-etica-2.0/`.
2. Haz doble clic en `index.html` para abrirlo en tu navegador.

Si tu navegador bloquea algún recurso al abrir el archivo directamente
(`file://`), puedes levantar un servidor local muy simple:

```bash
# Con Python 3 instalado
cd codigo-etica-2.0
python -m http.server 8000
# Abre http://localhost:8000 en tu navegador
```

```bash
# Alternativa con Node.js
npx serve .
```

## 2. Subir el proyecto a GitHub

```bash
cd codigo-etica-2.0
git init
git add .
git commit -m "Landing e-learning: Código de Ética INTER-CON"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

## 3. Publicar en GitHub Pages

1. En GitHub, entra al repositorio → **Settings** → **Pages**.
2. En **Source**, selecciona la rama `main` y la carpeta `/ (root)`.
3. Guarda los cambios. GitHub Pages generará una URL como:
   `https://TU_USUARIO.github.io/TU_REPOSITORIO/`
4. Espera 1-2 minutos y abre la URL. Si el sitio no está en la raíz del
   repositorio, ajusta la ruta en consecuencia (mueve el contenido de
   `codigo-etica-2.0/` a la raíz del repo, o publica desde esa subcarpeta
   si tu plan de GitHub Pages lo permite).

## 4. Editar módulos, videos y preguntas (todo en `course-config.js`)

Todo el contenido variable del curso vive en **`assets/js/course-config.js`**.
No es necesario tocar `index.html` ni `app.js` para estos cambios.

### Cambiar un video de un módulo
Ubica el módulo dentro del arreglo `modulos` y reemplaza:
```js
videoUrl: "PEGAR_URL_VIDEO_1",
```
por la URL real (YouTube, Vimeo o un archivo `.mp4` directo). Mientras el
valor empiece con `PEGAR_`, el sitio mostrará automáticamente un reproductor
de "video disponible próximamente" en su lugar, sin romperse.

### Editar título, descripción, puntos clave o duración de un módulo
Edita directamente las propiedades `titulo`, `subtitulo`, `descripcion`,
`duracionEstimada`, `puntosClave` (arreglo de strings) y `recursos`
(arreglo de `{ titulo, url }`) de ese módulo. Las tarjetas y el reproductor
se regeneran automáticamente; no hay HTML que editar.

### Agregar, quitar o reordenar módulos
- Agrega o quita objetos del arreglo `modulos`.
- El orden visual lo determina el campo `orden` de cada módulo (no la
  posición en el arreglo).
- Actualiza `totalVideos` para que coincida con el número de módulos que
  tengan video.

### Editar o reemplazar las preguntas de la evaluación
Esta versión (2.0) ya incluye las **10 preguntas finales** de evaluación,
validadas por el negocio, en `evaluacion.preguntas`. Cada pregunta tiene
esta forma:

```js
{
  id: "q1",
  pregunta: "Texto de la pregunta",
  opciones: [
    { valor: "a", texto: "Opción A" },
    { valor: "b", texto: "Opción B" },
    { valor: "c", texto: "Opción C" }
  ],
  correcta: "b"
}
```

Para editar una pregunta:
1. Sustituye `pregunta` y los textos de `opciones`.
2. Ajusta `correcta` para que coincida con el `valor` de la opción correcta.
3. Puedes agregar o quitar preguntas del arreglo libremente; `app.js` las
   genera dinámicamente sin importar cuántas sean.

Si en el futuro Compliance necesita marcar alguna pregunta como pendiente de
validación, `app.js` sigue soportando de forma opcional los campos
`demo: true` y `etiquetaDemo: "..."` en cualquier pregunta — al agregarlos,
esa pregunta mostrará una etiqueta visible de "pregunta demo" en pantalla.

### Calificación mínima y máximo de intentos
Se definen una sola vez, en la raíz de `COURSE_CONFIG`:
```js
calificacionMinima: 85,
maximoIntentos: 5,
```
`app.js` los usa dinámicamente (mensajes, contador de intentos, umbral de
aprobación); no están duplicados en ningún otro archivo.

## 5. Reemplazar imágenes y GIFs por assets corporativos reales

- `assets/images/hero-illustration.svg`: ilustración abstracta propia, sin
  licencia externa. Puede sustituirse por fotografía real de INTER-CON
  (personal, instalaciones) en `.jpg`/`.webp` optimizada para web.
- `assets/icons/`: la mayoría de los íconos provienen de Font Awesome vía CDN
  (ver `<head>` de `index.html`). Si cuentas con el logotipo oficial de
  INTER-CON en vectorial, colócalo en `assets/icons/` o `assets/images/` y
  reemplaza el monograma de texto `.brand-mark` ("IC") por un `<img>`.
- `assets/animations/`: carpeta reservada para GIFs o animaciones Lottie
  ligeras (< 500 KB). Ver `assets/animations/README.txt` para instrucciones
  de integración.

Recuerda: no incluyas imágenes con texto incrustado (el texto debe ir en
HTML real, no "quemado" dentro de la imagen), y evita contenido de terceros
sin licencia confirmada.

## 6. Modo demo vs. modo production (`window.APP_MODE`)

`assets/js/course-config.js` define:

```js
window.APP_MODE = "demo"; // "demo" | "production"
```

**Modo `"demo"` (valor por defecto):**
- No se llama a ninguna API. Todo se resuelve con datos locales simulados.
- La evaluación se califica en el navegador, comparando contra `correcta` en
  `course-config.js`.
- La constancia se genera y descarga localmente con `html2pdf.js`.
- Se puede recorrer toda la experiencia (bienvenida → módulos → evaluación →
  constancia) sin backend ni conexión a Power Automate.

**Modo `"production"`:** `app.js` consume las 5 APIs de `api-config.js`:

| API (`api-config.js`) | Cuándo se llama | Qué envía | Qué espera de vuelta |
|---|---|---|---|
| `iniciarCurso` | Justo después de enviar el registro (o al cargar, si ya había un registro previo) | `cursoID`, `versionCurso`, `registro` (nombre, tipoParticipante, numEmpleado, empresa, correo, teléfono, consentimiento) | `{ sessionId }` |
| `obtenerEstado` | Justo después de `iniciarCurso` | `cursoID`, `sessionId` | `{ completedModules, quizAttemptsUsed }` |
| `guardarProgreso` | Al hacer clic en "Marcar como visto" en un módulo | `cursoID`, `sessionId`, `moduloId`, `completado` | confirmación (no bloqueante) |
| `validarExamen` | Al enviar el formulario de evaluación | `cursoID`, 