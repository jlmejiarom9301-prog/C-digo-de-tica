/* =========================================================
   COURSE-CONFIG.JS
   Toda la configuración editable del curso vive aquí: nombre,
   calificación mínima, número de intentos, módulos (con sus
   videos, textos y puntos clave) y las preguntas de evaluación.

   app.js NUNCA debe tener módulos, preguntas, textos ni videos
   escritos "a mano": todo se genera dinámicamente a partir de
   este archivo.

   CÓMO CONFIGURAR:
   - Para cambiar el nombre del curso, la calificación mínima o
     el máximo de intentos: edita las propiedades de primer nivel.
   - Para cambiar un video: sustituye "PEGAR_URL_VIDEO_N" por la
     URL real (YouTube, Vimeo, Stream o archivo .mp4 directo).
   - Para editar/agregar/quitar un módulo: modifica el arreglo
     "modulos". El orden visual lo determina el campo "orden".
   - Para editar el examen: modifica "evaluacion.preguntas".
   ========================================================= */

/* ---------------------------------------------------------
   MODO DE LA APLICACIÓN
   Valores permitidos: "demo" | "production"
   - "demo": usa datos locales simulados, NO llama a Power
     Automate y permite recorrer toda la experiencia.
   - "production": consume las 5 APIs de api-config.js. Antes de
     cambiar a este modo, valida que ninguna URL siga siendo un
     placeholder (ver api-config.js y course-config.js).
   --------------------------------------------------------- */
window.APP_MODE = "demo";

window.COURSE_CONFIG = {
  cursoID: "LEG-001",
  nombreCurso: "Código de Ética",
  versionCurso: "1.0",

  // Calificación mínima (%) para aprobar la evaluación demo.
  calificacionMinima: 85,

  // Número máximo de intentos permitidos para el examen.
  maximoIntentos: 5,

  // Debe coincidir con la cantidad de módulos que tengan video.
  totalVideos: 6,

  modulos: [
    {
      id: 1,
      orden: 1,
      titulo: "Introducción y Alcance del Código",
      subtitulo: "Por qué existe este Código y a quién aplica",
      descripcion: "Conoce el objetivo de la capacitación, la misión de INTER-CON y a quiénes aplica este Código: socios comerciales, empleados, proveedores y empresas suministradoras de servicios.",
      videoUrl: "PEGAR_URL_VIDEO_1",
      posterUrl: "",
      duracionEstimada: "2 minutos",
      puntosClave: [
        "Aplica a socios comerciales, sus empleados, proveedores y empresas suministradoras de servicios.",
        "Basado en el Pacto Global de la ONU y las convenciones de la OIT.",
        "El cumplimiento de este Código es criterio para elegir y conservar a un socio comercial."
      ],
      recursos: [
        { titulo: "Ver sección de Alcance", url: "#alcance" }
      ]
    },
    {
      id: 2,
      orden: 2,
      titulo: "Condiciones Laborales",
      subtitulo: "Dignidad humana y trato justo",
      descripcion: "Principios sobre libre elección de empleo, prohibición absoluta de trabajo forzado e infantil, protección a menores y condiciones generales de empleo.",
      videoUrl: "PEGAR_URL_VIDEO_2",
      posterUrl: "",
      duracionEstimada: "3 minutos",
      puntosClave: [
        "Jornada regular máxima de 48 horas por semana y 24 horas de descanso cada 7 días.",
        "Prohibición absoluta de trabajos forzados y de trabajo infantil (menores de 15 años).",
        "Cero tolerancia al acoso, abuso, castigo corporal, coacción o discriminación."
      ],
      recursos: [
        { titulo: "Ver detalle de Condiciones Laborales", url: "#laborales" }
      ]
    },
    {
      id: 3,
      orden: 3,
      titulo: "Salud y Seguridad",
      subtitulo: "Un entorno de trabajo seguro",
      descripcion: "Cómo cumplir la normativa de seguridad, detectar e informar riesgos, y actuar correctamente ante posibles situaciones de emergencia.",
      videoUrl: "PEGAR_URL_VIDEO_3",
      posterUrl: "",
      duracionEstimada: "2 minutos",
      puntosClave: [
        "Cumplir sistemas y procesos de protección laboral y sanitaria.",
        "Detectar, valorar e informar riesgos, e instruir a los empleados.",
        "Proveer equipo de protección personal (EPP) cuando los peligros no puedan controlarse."
      ],
      recursos: [
        { titulo: "Ver detalle de Salud y Seguridad", url: "#salud" }
      ]
    },
    {
      id: 4,
      orden: 4,
      titulo: "Ética Empresarial",
      subtitulo: "Diez principios rectores",
      descripcion: "Los diez principios para operar con absoluta integridad: fidelidad a las leyes, anticorrupción, competencia justa, conflicto de interés, confidencialidad y más.",
      videoUrl: "PEGAR_URL_VIDEO_4",
      posterUrl: "",
      duracionEstimada: "4 minutos",
      puntosClave: [
        "Cero tolerancia al soborno, la corrupción y la malversación.",
        "Manejo responsable de conflictos de interés e información confidencial.",
        "Cumplimiento en importación/exportación, publicación de información y propiedad intelectual."
      ],
      recursos: [
        { titulo: "Ver los 10 principios de Ética Empresarial", url: "#etica" }
      ]
    },
    {
      id: 5,
      orden: 5,
      titulo: "Medio Ambiente",
      subtitulo: "Responsabilidad en toda la cadena de valor",
      descripcion: "Nuestro compromiso con la normativa ambiental, el manejo seguro de sustancias peligrosas y las restricciones de producto.",
      videoUrl: "PEGAR_URL_VIDEO_5",
      posterUrl: "",
      duracionEstimada: "2 minutos",
      puntosClave: [
        "Cumplir la normativa ambiental aplicable e instruir a los trabajadores.",
        "Identificar y manejar de forma segura las sustancias peligrosas.",
        "Cumplir restricciones de producto y criterios de reciclaje/eliminación."
      ],
      recursos: [
        { titulo: "Ver detalle de Medio Ambiente", url: "#ambiente" }
      ]
    },
    {
      id: 6,
      orden: 6,
      titulo: "Canal de Denuncia",
      subtitulo: "Confidencial y sin represalias",
      descripcion: "Cómo reportar cualquier acto que viole este Código a través del Canal Ético de INTER-CON, con confidencialidad garantizada.",
      videoUrl: "PEGAR_URL_VIDEO_6",
      posterUrl: "",
      duracionEstimada: "1 minuto",
      puntosClave: [
        "Cualquier proveedor o socio comercial puede reportar violaciones al Código.",
        "Disponible por correo electrónico y teléfono.",
        "Confidencialidad garantizada y sin represalias."
      ],
      recursos: [
        { titulo: "Ver Canal de Denuncia", url: "#denuncia" }
      ]
    }
  ],

  evaluacion: {
    preguntas: [
      {
        id: "q1",
        moduloId: 2,
        demo: true,
        etiquetaDemo: "Pregunta demo — reemplazar por pregunta validada por Compliance",
        pregunta: "Según el Código, ¿cuál es la jornada laboral regular máxima por semana?",
        opciones: [
          { valor: "a", texto: "40 horas" },
          { valor: "b", texto: "48 horas" },
          { valor: "c", texto: "60 horas" }
        ],
        correcta: "b"
      },
      {
        id: "q2",
        moduloId: 2,
        demo: true,
        etiquetaDemo: "Pregunta demo — reemplazar por pregunta validada por Compliance",
        pregunta: "¿Cuál es la edad mínima por debajo de la cual está prohibido totalmente cualquier tipo de ocupación?",
        opciones: [
          { valor: "a", texto: "12 años" },
          { valor: "b", texto: "14 años" },
          { valor: "c", texto: "15 años" }
        ],
        correcta: "c"
      },
      {
        id: "q3",
        moduloId: 3,
        demo: true,
        etiquetaDemo: "Pregunta demo — reemplazar por pregunta validada por Compliance",
        pregunta: "¿Qué se debe proveer cuando los peligros en el entorno de trabajo no puedan controlarse de otra forma?",
        opciones: [
          { valor: "a", texto: "Equipo de protección personal (EPP) apropiado" },
          { valor: "b", texto: "Un bono económico adicional" },
          { valor: "c", texto: "Ninguna medida especial" }
        ],
        correcta: "a"
      },
      {
        id: "q4",
        moduloId: 4,
        demo: true,
        etiquetaDemo: "Pregunta demo — reemplazar por pregunta validada por Compliance",
        pregunta: "De acuerdo con los principios de Ética Empresarial, ¿qué se debe hacer ante un posible conflicto de interés?",
        opciones: [
          { valor: "a", texto: "Tomar decisiones por consideraciones objetivas y firmar el formulario correspondiente" },
          { valor: "b", texto: "Resolverlo de manera informal sin documentarlo" },
          { valor: "c", texto: "Ignorarlo si no afecta directamente a la empresa" }
        ],
        correcta: "a"
      },
      {
        id: "q5",
        moduloId: 5,
        demo: true,
        etiquetaDemo: "Pregunta demo — reemplazar por pregunta validada por Compliance",
        pregunta: "En materia ambiental, ¿qué se espera de los socios comerciales de INTER-CON?",
        opciones: [
          { valor: "a", texto: "No tienen responsabilidad ambiental alguna" },
          { valor: "b", texto: "Solo deben reportar accidentes graves" },
          { valor: "c", texto: "Cumplir la normativa, manejar sustancias peligrosas de forma segura y cumplir restricciones de producto" }
        ],
        correcta: "c"
      },
      {
        id: "q6",
        moduloId: 6,
        demo: true,
        etiquetaDemo: "Pregunta demo — reemplazar por pregunta validada por Compliance",
        pregunta: "¿A través de qué medios se puede reportar una violación al Código de Ética?",
        opciones: [
          { valor: "a", texto: "Únicamente en juntas presenciales" },
          { valor: "b", texto: "Correo electrónico o teléfono del Canal Ético" },
          { valor: "c", texto: "No existe un canal formal" }
        ],
        correcta: "b"
      }
    ]
  }
};
