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
  iniciarCurso: "https://c9f27ee227e9e5bbb268177097501f.1d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/02/workflows/872079b555194a85aac7c0464a361e5e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5d6xdrr4x_M_XjfJEn49TYPKPvnI8PuaeE4-WnPB180",

  // Recupera el estado/avance guardado (módulos vistos, intentos restantes, etc.).
  obtenerEstado: "https://c9f27ee227e9e5bbb268177097501f.1d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/31/workflows/88c37e646d1e404fbee842c54021b2cf/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-VXth9yw7_iwXkNM0ayfQkelZBlzZhTQPfE38RyyieA",

  // Guarda el avance del usuario (por ejemplo, al completar un módulo).
  guardarProgreso: "https://c9f27ee227e9e5bbb268177097501f.1d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/18/workflows/fcca9c8161c94673bfa893d894293e15/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=DUaDC393J5tuIvM-8nrPTb_xrIjuzqD4Haj5xBKLE1o",

  // Envía las respuestas del examen para validación y calificación oficial.
  validarExamen: "https://c9f27ee227e9e5bbb268177097501f.1d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/21/workflows/bd89c75263984a6abb16f09ab62df172/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Z5Rqn8z49BVO2_oISg0tFeqZvRqS1kgrAYw7QtBt6zo",

  // Solicita la generación oficial de la constancia (PDF / SharePoint).
  generarConstancia: "https://c9f27ee227e9e5bbb268177097501f.1d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/27/workflows/538662a5094142b7a85f60f7cb1bfb3e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=jXjT0wNGTJUTuiQFgizYeRmCHPcQlBzXWYPD-1WlNP8"
};
