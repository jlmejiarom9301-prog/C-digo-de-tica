# Código de Ética para Asociados de Negocio — INTER-CON Servicios de Seguridad Privada

Landing page interactiva tipo e-learning para la capacitación corporativa del
**Código de Ética para Asociados de Negocio** de INTER-CON Servicios de Seguridad
Privada, S.A. de C.V. Funciona como apoyo para capacitación presencial y como
material de consulta vía enlace. Es 100% HTML/CSS/JS estático — no requiere
servidor ni backend — y está lista para publicarse en GitHub Pages.

## Estructura del proyecto

```text
codigo-etica-landing/
├── index.html          # Contenido y estructura de las 14 secciones
├── styles.css           # Estilos, paleta corporativa y responsive
├── script.js             # Navegación, acordeones, quiz, firma, PDF, dashboard
├── README.md
└── assets/
    ├── images/           # Ilustraciones propias (SVG) + notas de reemplazo
    ├── icons/             # Íconos SVG propios (el resto usa Font Awesome CDN)
    └── animations/       # Carpeta reservada para GIFs/Lottie ligeros
```

## Contenido incluido

1. Bienvenida (hero)
2. Objetivo de la capacitación
3. Importancia del Código de Ética
4. Alcance
5. Condiciones Laborales
6. Salud y Seguridad
7. Ética Empresarial (10 principios rectores)
8. Medio Ambiente
9. Canal de Denuncia
10. Compromiso Final
11. Evaluación demo (quiz con cálculo automático de resultado)
12. Firma y constancia demo (firma en pantalla + PDF)
13. Métricas demo (dashboard mockup)
14. Cierre

El contenido de las secciones 1 a 10 fue tomado y reorganizado visualmente a
partir de `Inter-Con_Ethics_Blueprint.pptx`, respetando su sentido original.
No se agregó legislación ni obligaciones no mencionadas en la presentación.

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

## 4. Reemplazar las preguntas demo por preguntas finales

En `index.html`, busca la sección `<section id="evaluacion">`. Cada pregunta
está marcada así:

```html
<span class="quiz-demo-tag">Pregunta demo — reemplazar por pregunta validada por Compliance</span>
```

Para cada pregunta:

1. Sustituye el texto de la pregunta (`<h4>`) y las opciones (`<label class="quiz-option">`).
2. Actualiza el atributo `data-correct` en `.quiz-question` con la letra de la
   opción correcta (`a`, `b` o `c`), que debe coincidir con el `value` del
   `<input>` correspondiente.
3. Una vez que Compliance valide las preguntas finales, elimina o actualiza
   la etiqueta `quiz-demo-tag`.
4. El umbral de aprobación (80%) se define en `script.js`, variable `passed`
   dentro de la función del listener de `quizForm` — ajústalo si Compliance
   define un porcentaje distinto.

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

## 6. Preparar integración futura (SharePoint / Power Automate / Power BI)

Este proyecto es una **demo funcional en el navegador**; no tiene backend.
Los módulos diseñados para integrarse a futuro son:

### Firma y constancia (sección 12, `#constancia`)
- Actualmente genera la constancia en el navegador (HTML) y permite
  descargarla como PDF con `html2pdf.js`, sin guardar nada en un servidor.
- Para producción: sustituye el listener de `constanciaForm` en `script.js`
  por una llamada `fetch()` a un flujo de **Power Automate** (HTTP trigger) o
  a una API que escriba en **SharePoint** (lista o biblioteca de documentos),
  enviando `nombre`, `correo`, `área`, `calificación`, `fecha` y la firma en
  base64 (`signaturePad.toDataURL()`).
- Considera agregar autenticación (Azure AD/Entra ID) antes de exponer el
  formulario fuera de un entorno controlado.

### Evaluación (sección 11, `#evaluacion`)
- Sustituye la lógica local de `quizForm` por preguntas obtenidas desde una
  lista de SharePoint o una API, y envía los resultados a la misma fuente de
  datos que alimentará el dashboard de Power BI.

### Métricas (sección 13, `#metricas`)
- Los KPIs y gráficas (`Chart.js`) actualmente usan datos simulados
  (`data-target`, arrays fijos en `script.js`). Para producción:
  1. Expón un dataset (Power BI Embedded, API REST, o export JSON) con los
     campos: participantes capacitados, promedio de calificación, % aprobados,
     % pendientes, avance por área, preguntas con mayor error, documentos
     firmados generados.
  2. Reemplaza los arrays estáticos en `script.js` (función de inicialización
     de `Chart.js`) por una llamada `fetch()` a ese endpoint.
  3. Si usarás Power BI directamente, puedes incrustar un reporte con un
     `<iframe>` de Power BI Embedded en lugar de los `<canvas>` de Chart.js.

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
  reflejarse manualmente en `index.html`.
- Todo el proyecto es editable: no hay build step, empaquetado ni
  dependencias de Node para ejecutarlo.
