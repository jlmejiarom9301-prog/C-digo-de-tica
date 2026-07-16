/* =========================================================
   COURSE-CONFIG.JS
   Toda la configuración editable del curso vive aquí: nombre,
   calificación mínima, número de intentos, contenido de la
   pantalla de bienvenida/registro, módulos (con sus videos,
   textos y puntos clave) y las preguntas de evaluación.

   app.js NUNCA debe tener módulos, preguntas, textos ni videos
   escritos "a mano": todo se genera dinámicamente a partir de
   este archivo.

   CÓMO CONFIGURAR:
   - Para cambiar el nombre del curso, la calificación mínima o
     el máximo de intentos: edita las propiedades de primer nivel.
   - Para editar la pantalla de bienvenida: edita "bienvenida".
   - Para editar las opciones de "Tipo de participante": edita
     "registro.tiposParticipante".
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
  versionCurso: "2.0",

  // Calificación mínima (%) para aprobar la evaluación.
  calificacionMinima: 85,

  // Número máximo de intentos permitidos para el examen.
  maximoIntentos: 5,

  // Debe coincidir con la cantidad de módulos que tengan video.
  totalVideos: 6,

  /* -------------------------------------------------------
     Pantalla de bienvenida (antes del registro).
     Los requisitos (100% de videos, calificación mínima y
     máximo de intentos) se construyen dinámicamente en app.js
     a partir de totalVideos / calificacionMinima / maximoIntentos
     de arriba, para no repetir esos números en dos lugares.
     ------------------------------------------------------- */
  bienvenida: {
    titulo: "Curso Código de Ética",
    mensaje: "Te damos la bienvenida al curso de capacitación en el Código de Ética para Asociados de Negocio de INTER-CON Servicios de Seguridad Privada.",
    objetivo: "Conocer y comprender los principios de conducta, cumplimiento y ética empresarial que INTER-CON espera de sus colaboradores, socios comerciales, proveedores y clientes.",
    duracionEstimada: "20-25 minutos"
  },

  /* -------------------------------------------------------
     Formulario de registro previo al curso.
     ------------------------------------------------------- */
  registro: {
    tiposParticipante: ["Empleado", "Proveedor", "Cliente", "Contratista", "Otro"]
  },

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

  /* -------------------------------------------------------
     Evaluación final (10 preguntas validadas).
     ------------------------------------------------------- */
  evaluacion: {
    preguntas: [
      {
        id: "q1",
        pregunta: "¿Cuál es el principal objetivo del Código de Ética de INTER-CON?",
        opciones: [
          { valor: "a", texto: "Aumentar las ventas." },
          { valor: "b", texto: "Guiar la conducta ética de colaboradores, clientes y proveedores." },
          { valor: "c", texto: "Reducir costos." },
          { valor: "d", texto: "Evaluar el desempeño." }
        ],
        correcta: "b"
      },
      {
        id: "q2",
        pregunta: "Si conoces una posible violación al Código de Ética, ¿qué debes hacer?",
        opciones: [
          { valor: "a", texto: "Ignorarla." },
          { valor: "b", texto: "Comentarla con otros compañeros." },
          { valor: "c", texto: "Reportarla por los medios establecidos." },
          { valor: "d", texto: "Publicarla en redes sociales." }
        ],
        correcta: "c"
      },
      {
        id: "q3",
        pregunta: "¿Qué significa actuar con integridad?",
        opciones: [
          { valor: "a", texto: "Obtener beneficios personales." },
          { valor: "b", texto: "Actuar con honestidad, transparencia y ética." },
          { valor: "c", texto: "Hacer lo que la mayoría haga." },
          { valor: "d", texto: "Evitar responsabilidades." }
        ],
        correcta: "b"
      },
      {
        id: "q4",
        pregunta: "¿Qué es un conflicto de interés?",
        opciones: [
          { valor: "a", texto: "Un desacuerdo entre compañeros." },
          { valor: "b", texto: "Cuando los intereses personales pueden influir en decisiones laborales." },
          { valor: "c", texto: "Un problema con un cliente." },
          { valor: "d", texto: "Una diferencia de opinión." }
        ],
        correcta: "b"
      },
      {
        id: "q5",
        pregunta: "¿Qué debes hacer si identificas un posible conflicto de interés?",
        opciones: [
          { valor: "a", texto: "Ocultarlo." },
          { valor: "b", texto: "Informarlo para su evaluación." },
          { valor: "c", texto: "Esperar a que alguien más lo reporte." },
          { valor: "d", texto: "Resolverlo por tu cuenta." }
        ],
        correcta: "b"
      },
      {
        id: "q6",
        pregunta: "La información confidencial de INTER-CON y de sus clientes debe:",
        opciones: [
          { valor: "a", texto: "Compartirse con cualquier compañero." },
          { valor: "b", texto: "Publicarse cuando sea útil." },
          { valor: "c", texto: "Utilizarse únicamente para fines laborales y por personas autorizadas." },
          { valor: "d", texto: "Enviarse por cualquier medio." }
        ],
        correcta: "c"
      },
      {
        id: "q7",
        pregunta: "¿Cuál es la postura de INTER-CON frente al soborno y la corrupción?",
        opciones: [
          { valor: "a", texto: "Se permiten en algunos casos." },
          { valor: "b", texto: "Dependen del cliente." },
          { valor: "c", texto: "Existe una política de cero tolerancia." },
          { valor: "d", texto: "Solo aplican para directivos." }
        ],
        correcta: "c"
      },
      {
        id: "q8",
        pregunta: "¿Qué tipo de ambiente promueve INTER-CON?",
        opciones: [
          { valor: "a", texto: "Competitivo y excluyente." },
          { valor: "b", texto: "Solo para personal administrativo." },
          { valor: "c", texto: "Respetuoso, inclusivo y libre de discriminación y acoso." },
          { valor: "d", texto: "Basado en jerarquías estrictas." }
        ],
        correcta: "c"
      },
      {
        id: "q9",
        pregunta: "¿Quiénes deben cumplir el Código de Ética?",
        opciones: [
          { valor: "a", texto: "Solo los directivos." },
          { valor: "b", texto: "Solo Recursos Humanos." },
          { valor: "c", texto: "Todos los colaboradores." },
          { valor: "d", texto: "Solo el personal operativo." }
        ],
        correcta: "c"
      },
      {
        id: "q10",
        pregunta: "¿Por qué es importante cumplir el Código de Ética?",
        opciones: [
          { valor: "a", texto: "Para evitar capacitaciones." },
          { valor: "b", texto: "Porque protege a la empresa, a los colaboradores, clientes y proveedores, fortaleciendo la confianza y el cumplimiento." },
          { valor: "c", texto: "Para recibir bonos." },
          { valor: "d", texto: "Solo para cumplir un requisito administrativo." }
        ],
        correcta: "b"
      }
    ]
  }
};
