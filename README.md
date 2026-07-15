# Código de Ética para Asociados de Negocio — INTER-CON Servicios de Seguridad Privada

Landing page interactiva tipo e-learning para la capacitación corporativa del
**Código de Ética para Asociados de Negocio** de INTER-CON Servicios de Seguridad
Privada, S.A. de C.V. Funciona como apoyo para capacitación presencial y como
material de consulta vía enlace. Es 100% HTML/CSS/JS estático — no requiere
servidor ni backend — y está lista para publicarse en GitHub Pages.

## Estructura del proyecto

```text
codigo-etica-landing/
├── index.html            # Estructura y secciones (contenido de módulos/quiz es dinámico)
├── styles.css             # Estilos, paleta corporativa y responsive
├── app.js                  # Motor de la app: NO contiene URLs, textos ni preguntas
├── README.md
└── assets/
    ├── images/             # Ilustraciones propias (SVG) + notas de reemplazo
    ├── icons/               # Íconos SVG propios (el resto usa Font Awesome CDN)
    ├── animations/         # Carpeta reservada para GIFs/Lottie ligeros
    └── js/
        ├── api-config.js    # ÚNICO lugar con URLs de API / Power Automate
        └── course-config.js # ÚNICO lugar con módulos, videos, textos y preguntas
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
  dinámicamente las tarjetas de módulo, el reproductor, la evaluación y la
  constancia. **Nunca** contiene URLs, títulos ni preguntas escritos a mano.
- **`index.html`** — contiene contenedores vacíos (`#modulosGrid`,
  `#moduloPlayer`, `#quizContainer`) que `app.js` llena en tiempo de
  ejecución. No hay 6 módulos ni preguntas repetidas en el HTML.

Ambos archivos de `assets/js/` deben cargarse **antes** que `app.js` (así
está ya configurado en `index.html`).

## Contenido incluido

1. Bienvenida (hero)
2. Objetivo de la capacitación
3. Importancia del Código de Ética
4. Alcance
5. **Módulos del curso** (video + puntos clave, 100% generado desde `course-config.js`)
6. Condiciones Laborales
7. Salud y Seguridad
8. Ética Empresarial (10 principios rectores)
9. Medio Ambiente
10. Canal de Denuncia
11. Compromiso Final
12. Evaluación (quiz dinámico con cálculo automático de resultado)
13. Firma y constancia demo (firma en pantalla + PDF / API)
14. Métricas demo (dashboard mockup)
15. Cierre

El contenido fue tomado y reorganizado visualmente a partir de
`Inter-Con_Ethics_Blueprint.pptx`, respetando su sentido original. No se
agregó legislación ni obligaciones no mencionadas en la presentación. Los
textos de las secciones 6 a 10 viven en `index.html`; los textos, videos y
preguntas de los 6 módulos (sección 5) y de la evaluación (sección 12) viven
en `assets/js/course-config.js`.

## 1. Abrir el proyecto localmente

No necesitas instalar nada. Simplemente:

1. Descarga o clona la carpeta `codigo-etica-landing/`.
2. Haz doble clic en `index.html` para abrirlo en tu navegador.

Si tu navegador bloquea algún recurso al abrir el archivo directamente
(`file://`), puedes levantar un servidor local muy simple:

```bash
# Con Python 3 instalado
cd codigo-etica-landing
python -m http.server 8000
# Abre http://localhost:8000 en tu navegador
```

```bash
# Alternativa con Node.js
npx serve .
```

## 2. Subir el proyecto a GitHub

```bash
cd codigo-etica-landing
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
   `codigo-etica-landing/` a la raíz del repo, o publica desde esa subcarpeta
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

### Reemplazar las preguntas demo por preguntas finales
Cada pregunta en `evaluacion.preguntas` tiene esta forma:

```js
{
  id: "q1",
  moduloId: 2,
  demo: true,
  etiquetaDemo: "Pregunta demo — reemplazar por pregunta validada por Compliance",
  pregunta: "Texto de la pregunta",
  opciones: [
    { valor: "a", texto: "Opción A" },
    { valor: "b", texto: "Opción B" },
    { valor: "c", texto: "Opción C" }
  ],
  correcta: "b"
}
```

Para cada pregunta:
1. Sustituye `pregunta` y los textos de `opciones`.
2. Ajusta `correcta` para que coincida con el `valor` de la opción correcta.
3. Una vez validada por Compliance, cambia `demo: true` a `demo: false` (o
   elimina `etiquetaDemo`) para que deje de mostrarse la etiqueta demo.
4. Puedes agregar o quitar preguntas del arreglo libremente.

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
| `iniciarCurso` | Al cargar la página, una sola vez | `cursoID`, `versionCurso` | `{ sessionId }` |
| `obtenerEstado` | Justo después de `iniciarCurso` | `cursoID`, `sessionId` | `{ completedModules, quizAttemptsUsed }` |
| `guardarProgreso` | Al hacer clic en "Marcar como visto" en un módulo | `cursoID`, `sessionId`, `moduloId`, `completado` | confirmación (no bloqueante) |
| `validarExamen` | Al enviar el formulario de evaluación | `cursoID`, `sessionId`, `respuestas` | `{ calificacion }` (0-100) |
| `generarConstancia` | Al enviar el formulario de firma/constancia | `cursoID`, `sessionId`, `nombre`, `correo`, `area`, `calificacion`, `fecha`, `firma` (base64) | idealmente `{ constanciaUrl }` con el PDF oficial |

### Transición de demo a production (3 pasos, ningún otro archivo se toca)
1. Pega las 5 URLs reales en `assets/js/api-config.js`.
2. Pega las 6 URLs de video (y opcionalmente `posterUrl`) en
   `assets/js/course-config.js`.
3. Cambia `window.APP_MODE` de `"demo"` a `"production"` en
   `assets/js/course-config.js`.

### Validación de configuración y avisos
- `app.js` considera "sin configurar" cualquier valor vacío o que empiece con
  `PEGAR_` (función `isPlaceholderUrl`).
- Si `APP_MODE` es `"production"` y falta configurar alguna URL, `app.js` no
  intenta la llamada rota: registra un aviso técnico en la consola del
  navegador y muestra un banner discreto y descartable en pantalla
  ("Configuración pendiente: ..."), sin romper el resto de la experiencia
  visual.
- Al cargar la página, revisa la consola del navegador (F12): se imprime un
  resumen con el modo activo y qué URLs de API/video siguen pendientes.

### Sobre Power BI (sección de métricas demo)
El panel de la sección `#metricas` sigue usando datos simulados con
`Chart.js` (no forma parte de las 5 APIs anteriores, ya que son métricas
agregadas de administración, no de un usuario cursando el curso). Para
producción, la opción más simple es sustituir los `<canvas>` de esa sección
por un `<iframe>` de Power BI Embedded, o exponer un endpoint adicional y
adaptar `setupCharts()` en `app.js` para consumirlo.

## Librerías utilizadas (todas vía CDN, sin claves API)

| Librería | Uso |
|---|---|
| Font Awesome 6 | Iconografía |
| AOS (Animate on Scroll) | Animaciones al hacer scroll |
| Chart.js | Gráficas del dashboard de métricas demo |
| Signature Pad | Firma en pantalla |
| html2pdf.js | Generación de la constancia en PDF |
| Google Fonts (Poppins / Inter) | Tipografía corporativa |

## Notas importantes

- Este micrositio es una **demostración**. Las secciones de evaluación,
  firma/constancia y métricas están claramente etiquetadas como demo y no
  tienen validez oficial hasta integrarse con los sistemas corporativos.
- El contenido de ética, condiciones laborales, salud y seguridad, medio
  ambiente y canal de denuncia refleja fielmente el `Inter-Con_Ethics_Blueprint.pptx`
  proporcionado; cualquier actualización al Código de Ética oficial debe
  reflejarse en `index.html` (secciones de texto) y/o en
  `assets/js/course-config.js` (módulos y evaluación), según corresponda.
- Todo el proyecto es editable: no hay build step, empaquetado ni
  dependencias de Node para ejecutarlo.
