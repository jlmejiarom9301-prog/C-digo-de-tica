/* =========================================================
   API-CONFIG.JS
   Único lugar del proyecto donde deben vivir las URLs de los
   servicios (Power Automate / API propia). Ningún otro archivo
   debe contener URLs de API "quemadas" (hardcodeadas).

   CÓMO CONFIGURAR:
   1. Sustituye cada valor "PEGAR_URL_..." por la URL real del
      flujo de Power Automate (o endpoint HTTP) correspondiente.
   2. No cambies las llaves del objeto (iniciarCurso, obtenerEstado,
      guardarProgreso, validarExamen, generarConstancia).
   3. No agregues URLs de API en ningún otro archivo del proyecto.
   4. Una vez configuradas las 5 URLs, recuerda también cambiar
      window.APP_MODE a "production" en course-config.js.

   Mientras un valor siga empezando con "PEGAR_", el proyecto lo
   trata como no configurado y evita llamarlo (ver app.js,
   función isPlaceholderUrl()).
   ========================================================= */

window.API_CONFIG = {
  // Inicia una sesión/registro de avance del curso para el usuario actual.
  iniciarCurso: "PEGAR_URL_API_INICIAR_CURSO",

  // Recupera el estado/avance guardado (módulos vistos, intentos restantes, etc.).
  obtenerEstado: "PEGAR_URL_API_OBTENER_ESTADO",

  // Guarda el avance del usuario (por ejemplo, al completar un módulo).
  guardarProgreso: "PEGAR_URL_API_GUARDAR_PROGRESO",

  // Envía las respuestas del examen para validación y calificación oficial.
  validarExamen: "PEGAR_URL_API_VALIDAR_EXAMEN",

  // Solicita la generación oficial de la constancia (PDF / SharePoint).
  generarConstancia: "PEGAR_URL_API_GENERAR_CONSTANCIA"
};
