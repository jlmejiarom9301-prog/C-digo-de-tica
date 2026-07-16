/* =========================================================
   CODIGO DE ETICA - INTER-CON | app.js
   Motor de la aplicacion. Este archivo NO debe contener:
     - URLs de API (viven en assets/js/api-config.js)
     - URLs de video, titulos, textos o preguntas (viven en
       assets/js/course-config.js)
   Todo el contenido de modulos y evaluacion se genera aqui de
   forma dinamica a partir de window.COURSE_CONFIG.
   ========================================================= */

(function () {
  'use strict';

  /* =========================================================
     0. VALIDACION DE CONFIGURACION
     ========================================================= */

  if (!window.API_CONFIG) {
    console.error('[config] Falta assets/js/api-config.js o no se cargo antes que app.js.');
  }
  if (!window.COURSE_CONFIG) {
    console.error('[config] Falta assets/js/course-config.js o no se cargo antes que app.js.');
  }

  var API = window.API_CONFIG || {};
  var COURSE = window.COURSE_CONFIG || { modulos: [], evaluacion: { preguntas: [] } };
  var MODE = (window.APP_MODE === 'production') ? 'production' : 'demo';

  if (window.APP_MODE && window.APP_MODE !== 'demo' && window.APP_MODE !== 'production') {
    console.warn('[config] APP_MODE invalido. Valores permitidos: demo o production. Usando demo por seguridad.');
  }

  function isPlaceholderUrl(url) {
    return !url || typeof url !== 'string' || url.trim() === '' || /^PEGAR_/i.test(url.trim());
  }

  function missingApiKeys() {
    return Object.keys(API).filter(function (key) { return isPlaceholderUrl(API[key]); });
  }
  function missingVideoModules() {
    return (COURSE.modulos || []).filter(function (m) { return isPlaceholderUrl(m.videoUrl); });
  }

  console.info(
    '[Codigo de Etica] curso=' + (COURSE.nombreCurso || '') + ' version=' + (COURSE.versionCurso || '') +
    ' modo=' + MODE +
    ' apisPendientes=' + (missingApiKeys().join(',') || 'ninguna') +
    ' videosPendientes=' + (missingVideoModules().length ? missingVideoModules().map(function (m) { return m.id; }).join(',') : 'ninguno')
  );

  if (MODE === 'production') {
    var missing = missingApiKeys();
    var missingVideos = missingVideoModules();
    if (missing.length || missingVideos.length) {
      console.warn('[config] APP_MODE=production pero hay configuracion pendiente. APIs: ' + missing.join(',') + ' Videos modulo: ' + missingVideos.map(function (m) { return m.id; }).join(','));
    }
  }

  /* =========================================================
     1. UTILIDADES GENERALES
     ========================================================= */

  var STORAGE_PREFIX = 'eticaIC_' + (COURSE.cursoID || 'curso') + '_';

  function readLocal(key, fallback) {
    try {
      var raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function writeLocal(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) { /* almacenamiento no disponible */ }
  }

  function showConfigWarning(serviceLabel, fileHint) {
    console.warn('[config] "' + serviceLabel + '" no esta configurado todavia. Edita ' + fileHint + '.');
    var toast = document.getElementById('configToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'configToast';
      toast.className = 'config-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Configuracion pendiente: "' +
      serviceLabel + '". Edita <code>' + fileHint + '</code> para conectar este servicio.';
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(function () { toast.classList.remove('show'); }, 7000);
  }

  function callApi(serviceKey, serviceLabel, payload) {
    var url = API[serviceKey];
    if (isPlaceholderUrl(url)) {
      showConfigWarning(serviceLabel, 'assets/js/api-config.js');
      return Promise.resolve(null);
    }
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).catch(function (err) {
      console.error('[api] Error al llamar "' + serviceKey + '":', err);
      showConfigWarning(serviceLabel + ' (error de conexion, ver consola)', 'assets/js/api-config.js');
      return null;
    });
  }

  function toYouTubeEmbed(url) {
    var watch = url.match(/[?&]v=([^&]+)/);
    if (watch) return 'https://www.youtube.com/embed/' + watch[1];
    var short = url.match(/youtu\.be\/([^?&]+)/);
    if (short) return 'https://www.youtube.com/embed/' + short[1];
    return url;
  }
  function toVimeoEmbed(url) {
    var match = url.match(/vimeo\.com\/(\d+)/);
    return match ? 'https://player.vimeo.com/video/' + match[1] : url;
  }

  function buildVideoMarkup(mod) {
    if (isPlaceholderUrl(mod.videoUrl)) {
      return '<div class="video-placeholder"><i class="fa-solid fa-clapperboard"></i><p>Video disponible proximamente</p><span>Pega la URL real en assets/js/course-config.js (modulo ' + mod.id + ')</span></div>';
    }
    if (/youtube\.com|youtu\.be/i.test(mod.videoUrl)) {
      return '<iframe class="video-frame" src="' + toYouTubeEmbed(mod.videoUrl) + '" title="' + mod.titulo + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    }
    if (/vimeo\.com/i.test(mod.videoUrl)) {
      return '<iframe class="video-frame" src="' + toVimeoEmbed(mod.videoUrl) + '" title="' + mod.titulo + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
    }
    return '<video class="video-frame" controls preload="metadata"' + (mod.posterUrl ? ' poster="' + mod.posterUrl + '"' : '') + '><source src="' + mod.videoUrl + '">Tu navegador no soporta video.</video>';
  }

  /* =========================================================
     2. ESTADO DEL CURSO
     ========================================================= */

  var state = {
    sessionId: readLocal('session', null),
    completedModules: readLocal('completedModules', {}),
    activeModuleId: null,
    quizAttemptsUsed: readLocal('quizAttemptsUsed', 0),
    lastQuizScorePct: readLocal('lastQuizScorePct', null)
  };

  var registro = readLocal('registro', null);

  function initCourseSession() {
    if (MODE !== 'production') return Promise.resolve();

    var startPromise = state.sessionId
      ? Promise.resolve()
      : callApi('iniciarCurso', 'Iniciar curso', { cursoID: COURSE.cursoID, versionCurso: COURSE.versionCurso, registro: registro })
          .then(function (result) {
            if (result && result.sessionId) {
              state.sessionId = result.sessionId;
              writeLocal('session', state.sessionId);
            }
          });

    return startPromise
      .then(function () {
        return callApi('obtenerEstado', 'Obtener estado', { cursoID: COURSE.cursoID, sessionId: state.sessionId });
      })
      .then(function (estado) {
        if (estado) {
          if (estado.completedModules) {
            state.completedModules = estado.completedModules;
            writeLocal('completedModules', state.completedModules);
          }
          if (typeof estado.quizAttemptsUsed === 'number') {
            state.quizAttemptsUsed = estado.quizAttemptsUsed;
            writeLocal('quizAttemptsUsed', state.quizAttemptsUsed);
          }
        }
      });
  }

  /* =========================================================
     1.6 GATE DE ACCESO (bienvenida + registro)
     ========================================================= */

  function renderGate() {
    var b = COURSE.bienvenida || {};
    var tituloEl = document.getElementById('gateTitulo');
    var mensajeEl = document.getElementById('gateMensaje');
    var objetivoEl = document.getElementById('gateObjetivo');
    var duracionEl = document.getElementById('gateDuracion');
    var reqList = document.getElementById('gateRequisitosList');
    var tipoSelect = document.getElementById('regTipoParticipante');

    if (tituloEl) tituloEl.textContent = b.titulo || COURSE.nombreCurso || 'Curso';
    if (mensajeEl) mensajeEl.textContent = b.mensaje || '';
    if (objetivoEl) objetivoEl.textContent = b.objetivo || '';
    if (duracionEl) duracionEl.textContent = b.duracionEstimada || '';

    if (reqList) {
      var totalVideos = COURSE.totalVideos || (COURSE.modulos || []).length;
      var items = [
        'Visualizar el 100% de los videos del curso (' + totalVideos + ' modulos).',
        'Obtener una calificacion minima de ' + COURSE.calificacionMinima + '.',
        'Maximo ' + COURSE.maximoIntentos + ' intentos para la evaluacion.'
      ];
      reqList.innerHTML = items.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    }

    if (tipoSelect) {
      var tipos = (COURSE.registro && COURSE.registro.tiposParticipante) || [];
      tipoSelect.innerHTML = '<option value="">Selecciona una opcion</option>' +
        tipos.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
    }
  }

  function prefillConstancia(reg) {
    var nombreEl = document.getElementById('ccNombre');
    var correoEl = document.getElementById('ccCorreo');
    if (nombreEl && reg.nombre) nombreEl.value = reg.nombre;
    if (correoEl && reg.correo) correoEl.value = reg.correo;
  }

  function unlockSite() {
    document.body.classList.remove('gate-locked');
  }

  function setupGate(onUnlock) {
    var gateBienvenida = document.getElementById('gateBienvenida');
    var gateRegistro = document.getElementById('gateRegistro');
    var btnComenzar = document.getElementById('btnComenzarCurso');
    var btnVolver = document.getElementById('btnVolverBienvenida');
    var registroForm = document.getElementById('registroForm');
    var empresaInput = document.getElementById('regEmpresa');
    var numEmpleadoInput = document.getElementById('regNumEmpleado');
    var errorEl = document.getElementById('registroError');

    if (registro) {
      unlockSite();
      if (onUnlock) onUnlock();
      return;
    }

    if (btnComenzar) {
      btnComenzar.addEventListener('click', function () {
        if (gateBienvenida) gateBienvenida.classList.add('hidden');
        if (gateRegistro) gateRegistro.classList.remove('hidden');
      });
    }
    if (btnVolver) {
      btnVolver.addEventListener('click', function () {
        if (gateRegistro) gateRegistro.classList.add('hidden');
        if (gateBienvenida) gateBienvenida.classList.remove('hidden');
      });
    }

    function clearErrors() {
      if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
      if (registroForm) {
        registroForm.querySelectorAll('.field-error').forEach(function (el) { el.classList.remove('field-error'); });
      }
    }

    function showError(msg) {
      if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
    }

    if (registroForm) {
      registroForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors();

        var nombre = document.getElementById('regNombre').value.trim();
        var tipoParticipante = document.getElementById('regTipoParticipante').value;
        var numEmpleado = numEmpleadoInput.value.trim();
        var empresa = empresaInput.value.trim();
        var correo = document.getElementById('regCorreo').value.trim();
        var telefono = document.getElementById('regTelefono').value.trim();
        var consentimiento = document.getElementById('regConsentimiento').checked;

        var missing = [];
        if (!nombre) missing.push('regNombre');
        if (!tipoParticipante) missing.push('regTipoParticipante');
        if (!correo) missing.push('regCorreo');
        if (!consentimiento) missing.push('regConsentimiento');
        // Empresa es obligatoria SOLO cuando no exista numero de empleado
        var empresaRequerida = !numEmpleado && !empresa;
        if (empresaRequerida) missing.push('regEmpresa');

        if (missing.length) {
          missing.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.classList.add('field-error');
          });
          showError(empresaRequerida
            ? 'Por favor completa los campos obligatorios. La empresa es obligatoria cuando no se cuenta con numero de empleado.'
            : 'Por favor completa los campos obligatorios.');
          return;
        }

        var correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
        if (!correoValido) {
          document.getElementById('regCorreo').classList.add('field-error');
          showError('Ingresa un correo electronico valido.');
          return;
        }

        registro = {
          nombre: nombre,
          tipoParticipante: tipoParticipante,
          numEmpleado: numEmpleado,
          empresa: empresa,
          correo: correo,
          telefono: telefono,
          consentimiento: consentimiento,
          fechaRegistro: new Date().toISOString()
        };
        writeLocal('registro', registro);
        prefillConstancia(registro);
        unlockSite();
        if (onUnlock) onUnlock();
      });
    }
  }

  function markModuleCompleted(moduleId) {
    state.completedModules[moduleId] = true;
    writeLocal('completedModules', state.completedModules);
    renderModuleCards();

    if (MODE === 'production') {
      return callApi('guardarProgreso', 'Guardar progreso', {
        cursoID: COURSE.cursoID, sessionId: state.sessionId, moduloId: moduleId, completado: true
      });
    }
    return Promise.resolve();
  }

  /* =========================================================
     3. MODULOS
     ========================================================= */

  function sortedModules() {
    return (COURSE.modulos || []).slice().sort(function (a, b) { return a.orden - b.orden; });
  }

  function renderModuleCards() {
    var grid = document.getElementById('modulosGrid');
    if (!grid) return;
    var modules = sortedModules();

    grid.innerHTML = modules.map(function (mod) {
      var done = !!state.completedModules[mod.id];
      var active = mod.id === state.activeModuleId;
      return '<button type="button" class="module-card' + (active ? ' active' : '') + (done ? ' done' : '') + '" data-module-id="' + mod.id + '">' +
        '<span class="module-card-num">' + String(mod.orden).padStart(2, '0') + '</span>' +
        '<span class="module-card-status"><i class="fa-solid ' + (done ? 'fa-circle-check' : 'fa-circle') + '"></i></span>' +
        '<h4>' + mod.titulo + '</h4>' +
        '<p>' + (mod.subtitulo || '') + '</p>' +
        '<span class="module-card-duration"><i class="fa-regular fa-clock"></i> ' + (mod.duracionEstimada || '') + '</span>' +
        '</button>';
    }).join('');

    var cards = grid.querySelectorAll('.module-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () { setActiveModule(Number(card.dataset.moduleId)); });
    });
  }

  function setActiveModule(moduleId) {
    state.activeModuleId = moduleId;
    renderModuleCards();
    renderActiveModule();
    var el = document.getElementById('moduloPlayer');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderActiveModule() {
    var wrap = document.getElementById('moduloPlayer');
    if (!wrap) return;
    var modules = sortedModules();
    var mod = modules.filter(function (m) { return m.id === state.activeModuleId; })[0] || modules[0];
    if (!mod) { wrap.innerHTML = ''; return; }
    state.activeModuleId = mod.id;

    var idx = modules.indexOf(mod);
    var prevMod = modules[idx - 1];
    var nextMod = modules[idx + 1];
    var done = !!state.completedModules[mod.id];

    var puntos = (mod.puntosClave || []).map(function (p) { return '<li><i class="fa-solid fa-check"></i>' + p + '</li>'; }).join('');
    var recursos = (mod.recursos || []).map(function (r) { return '<a href="' + r.url + '" class="resource-link"><i class="fa-solid fa-arrow-up-right-from-square"></i> ' + r.titulo + '</a>'; }).join('');

    wrap.innerHTML =
      '<div class="module-video">' + buildVideoMarkup(mod) + '</div>' +
      '<div class="module-detail">' +
      '<span class="module-detail-tag">Modulo ' + String(mod.orden).padStart(2, '0') + ' - ' + (mod.duracionEstimada || '') + '</span>' +
      '<h3>' + mod.titulo + '</h3>' +
      (mod.subtitulo ? '<p class="module-subtitle">' + mod.subtitulo + '</p>' : '') +
      '<p>' + mod.descripcion + '</p>' +
      (puntos ? '<ul class="module-points">' + puntos + '</ul>' : '') +
      (recursos ? '<div class="module-resources">' + recursos + '</div>' : '') +
      '<div class="module-actions">' +
      '<button type="button" class="btn btn-ghost small" id="prevModuleBtn"' + (prevMod ? '' : ' disabled') + '><i class="fa-solid fa-arrow-left"></i> Anterior</button>' +
      '<button type="button" class="btn btn-primary small" id="completeModuleBtn">' + (done ? '<i class="fa-solid fa-circle-check"></i> Completado' : 'Marcar como visto') + '</button>' +
      '<button type="button" class="btn btn-ghost small" id="nextModuleBtn"' + (nextMod ? '' : ' disabled') + '>Siguiente <i class="fa-solid fa-arrow-right"></i></button>' +
      '</div>' +
      '</div>';

    var completeBtn = document.getElementById('completeModuleBtn');
    if (completeBtn) completeBtn.addEventListener('click', function () { markModuleCompleted(mod.id).then(renderActiveModule); });
    var prevBtn = document.getElementById('prevModuleBtn');
    if (prevBtn) prevBtn.addEventListener('click', function () { if (prevMod) setActiveModule(prevMod.id); });
    var nextBtn = document.getElementById('nextModuleBtn');
    if (nextBtn) nextBtn.addEventListener('click', function () { if (nextMod) setActiveModule(nextMod.id); });
  }

  /* =========================================================
     4. EVALUACION
     ========================================================= */

  function renderQuiz() {
    var container = document.getElementById('quizContainer');
    if (!container) return;
    var preguntas = (COURSE.evaluacion && COURSE.evaluacion.preguntas) || [];
    var maxIntentos = COURSE.maximoIntentos;
    var restantes = Math.max(maxIntentos - state.quizAttemptsUsed, 0);

    var preguntasHtml = preguntas.map(function (p) {
      var opcionesHtml = p.opciones.map(function (op) {
        return '<label class="quiz-option"><input type="radio" name="' + p.id + '" value="' + op.valor + '"> ' + op.texto + '</label>';
      }).join('');
      var tag = p.demo ? '<span class="quiz-demo-tag">' + (p.etiquetaDemo || 'Pregunta demo - reemplazar por pregunta validada por Compliance') + '</span>' : '';
      return '<div class="quiz-question" data-question-id="' + p.id + '" data-correct="' + p.correcta + '">' + tag + '<h4>' + p.pregunta + '</h4>' + opcionesHtml + '<div class="quiz-feedback"></div></div>';
    }).join('');

    var infoHtml = '<div class="quiz-attempts-info" id="quizAttemptsInfo">Intentos disponibles: <strong>' + restantes + '</strong> de ' + maxIntentos + ' - Calificacion minima para aprobar: <strong>' + COURSE.calificacionMinima + '%</strong></div>';
    var btnHtml = '<button type="submit" class="btn btn-primary" id="quizSubmit"' + (restantes <= 0 ? ' disabled' : '') + '>Calcular resultado <i class="fa-solid fa-check"></i></button>';

    container.innerHTML = preguntasHtml + infoHtml + btnHtml;
  }

  function handleQuizSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var restantes = COURSE.maximoIntentos - state.quizAttemptsUsed;
    if (restantes <= 0) {
      alert('Has alcanzado el maximo de intentos permitidos (' + COURSE.maximoIntentos + ').');
      return;
    }

    var questions = form.querySelectorAll('.quiz-question');
    var respuestas = {};
    var answeredAll = true;

    questions.forEach(function (q) {
      var name = q.dataset.questionId;
      var selected = form.querySelector('input[name="' + name + '"]:checked');
      if (!selected) { answeredAll = false; return; }
      respuestas[name] = selected.value;
    });

    if (!answeredAll) {
      alert('Por favor responde todas las preguntas antes de calcular tu resultado.');
      return;
    }

    state.quizAttemptsUsed += 1;
    writeLocal('quizAttemptsUsed', state.quizAttemptsUsed);

    function finishGrading(pct) {
      questions.forEach(function (q) {
        var name = q.dataset.questionId;
        var feedback = q.querySelector('.quiz-feedback');
        var selected = respuestas[name];
        var isCorrect = selected === q.dataset.correct;
        q.classList.remove('correct', 'incorrect');
        q.classList.add(isCorrect ? 'correct' : 'incorrect');
        feedback.textContent = isCorrect ? 'Respuesta correcta.' : 'Respuesta incorrecta. Revisa el contenido de esta seccion.';
        feedback.classList.add('show');
      });

      state.lastQuizScorePct = pct;
      writeLocal('lastQuizScorePct', pct);

      var passed = pct >= COURSE.calificacionMinima;
      var quizResult = document.getElementById('quizResult');
      document.getElementById('quizScoreNum').textContent = pct + '%';
      var title = document.getElementById('quizResultTitle');
      title.textContent = passed ? 'Aprobado' : 'No aprobado';
      title.style.color = passed ? '#4ade80' : '#f87171';
      document.getElementById('quizResultMsg').textContent = passed
        ? 'Obtuviste ' + pct + '%. Se requiere un minimo de ' + COURSE.calificacionMinima + '% para aprobar. Este resultado se reflejaria en tu constancia.'
        : 'Obtuviste ' + pct + '%. Se requiere un minimo de ' + COURSE.calificacionMinima + '% para aprobar. Te recomendamos repasar las secciones marcadas como incorrectas.';
      quizResult.classList.remove('hidden');
      quizResult.scrollIntoView({ behavior: 'smooth', block: 'center' });

      var attemptsLeft = COURSE.maximoIntentos - state.quizAttemptsUsed;
      var infoEl = document.getElementById('quizAttemptsInfo');
      if (infoEl) infoEl.innerHTML = 'Intentos disponibles: <strong>' + attemptsLeft + '</strong> de ' + COURSE.maximoIntentos + ' - Calificacion minima para aprobar: <strong>' + COURSE.calificacionMinima + '%</strong>';
      var submitBtn = document.getElementById('quizSubmit');
      if (submitBtn) submitBtn.disabled = attemptsLeft <= 0;
    }

    if (MODE === 'production' && !isPlaceholderUrl(API.validarExamen)) {
      callApi('validarExamen', 'Validar examen', { cursoID: COURSE.cursoID, sessionId: state.sessionId, respuestas: respuestas })
        .then(function (result) {
          if (result && typeof result.calificacion === 'number') {
            finishGrading(result.calificacion);
          } else {
            finishGrading(computeLocalScore());
          }
        });
    } else {
      finishGrading(computeLocalScore());
    }

    function computeLocalScore() {
      var correctCount = 0;
      questions.forEach(function (q) {
        var name = q.dataset.questionId;
        if (respuestas[name] === q.dataset.correct) correctCount++;
      });
      return Math.round((correctCount / questions.length) * 100);
    }
  }

  /* =========================================================
     5. CONSTANCIA
     ========================================================= */

  function setupConstancia() {
    var canvas = document.getElementById('signaturePad');
    var signaturePad = null;

    function resizeCanvas() {
      if (!canvas) return;
      var ratio = Math.max(window.devicePixelRatio || 1, 1);
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      var ctx = canvas.getContext && canvas.getContext('2d');
      if (ctx) ctx.scale(ratio, ratio);
      if (signaturePad) signaturePad.clear();
    }

    if (canvas && window.SignaturePad) {
      signaturePad = new SignaturePad(canvas, { backgroundColor: 'rgba(255,255,255,1)', penColor: '#0b1f3a' });
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
    }

    var clearBtn = document.getElementById('clearSignature');
    if (clearBtn) clearBtn.addEventListener('click', function () { if (signaturePad) signaturePad.clear(); });

    var constanciaForm = document.getElementById('constanciaForm');
    var downloadPdfBtn = document.getElementById('downloadPdf');

    if (constanciaForm) {
      constanciaForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var nombre = document.getElementById('ccNombre').value.trim();
        var correo = document.getElementById('ccCorreo').value.trim();
        var area = document.getElementById('ccArea').value;

        if (signaturePad && signaturePad.isEmpty()) {
          alert('Por favor dibuja tu firma antes de generar la constancia.');
          return;
        }

        var firmaDataUrl = (signaturePad && !signaturePad.isEmpty()) ? signaturePad.toDataURL('image/png') : '';
        var fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

        document.getElementById('cpNombre').textContent = nombre || '-';
        document.getElementById('cpCorreo').textContent = correo || '-';
        document.getElementById('cpArea').textContent = area || '-';
        document.getElementById('cpScore').textContent = state.lastQuizScorePct !== null ? state.lastQuizScorePct + '%' : 'Sin evaluacion';
        document.getElementById('cpFecha').textContent = fecha;
        var sigImg = document.getElementById('cpSignatureImg');
        if (firmaDataUrl) { sigImg.src = firmaDataUrl; sigImg.style.display = 'block'; }

        downloadPdfBtn.disabled = true;
        downloadPdfBtn.dataset.officialUrl = '';

        function finishAndShow() {
          downloadPdfBtn.disabled = false;
          document.getElementById('constanciaPreview').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        if (MODE === 'production') {
          callApi('generarConstancia', 'Generar constancia', {
            cursoID: COURSE.cursoID, sessionId: state.sessionId, nombre: nombre, correo: correo, area: area,
            calificacion: state.lastQuizScorePct, fecha: fecha, firma: firmaDataUrl
          }).then(function (result) {
            if (result && result.constanciaUrl) downloadPdfBtn.dataset.officialUrl = result.constanciaUrl;
            finishAndShow();
          });
        } else {
          finishAndShow();
        }
      });
    }

    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', function () {
        if (downloadPdfBtn.dataset.officialUrl) {
          window.open(downloadPdfBtn.dataset.officialUrl, '_blank');
          return;
        }
        var element = document.getElementById('constanciaPreview');
        if (!window.html2pdf) {
          alert('No se pudo cargar el generador de PDF. Verifica tu conexion a internet.');
          return;
        }
        html2pdf().set({
          margin: 10,
          filename: 'constancia-demo-codigo-etica.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(element).save();
      });
    }
  }

  /* =========================================================
     6. NAV, PROGRESO, ACORDEONES, METRICAS
     ========================================================= */

  function setupNav() {
    var navToggle = document.getElementById('navToggle');
    var sidenav = document.getElementById('sidenav');
    var navOverlay = document.getElementById('navOverlay');

    function closeNav() {
      sidenav.classList.remove('open');
      navOverlay.classList.remove('show');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    function toggleNav() {
      var isOpen = sidenav.classList.toggle('open');
      navOverlay.classList.toggle('show', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    }
    if (navToggle) navToggle.addEventListener('click', toggleNav);
    if (navOverlay) navOverlay.addEventListener('click', closeNav);
    document.querySelectorAll('.nav-link').forEach(function (link) { link.addEventListener('click', closeNav); });

    var progressFill = document.getElementById('progressFill');
    var sections = document.querySelectorAll('.section[id]');
    var navLinks = document.querySelectorAll('.nav-link');

    function onScroll() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressFill) progressFill.style.width = pct + '%';

      var currentId = sections.length ? sections[0].id : null;
      var triggerLine = window.innerHeight * 0.35;
      sections.forEach(function (sec) {
        var rect = sec.getBoundingClientRect();
        if (rect.top <= triggerLine) currentId = sec.id;
      });
      navLinks.forEach(function (link) { link.classList.toggle('active', link.dataset.section === currentId); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setupAccordions() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.accordion-trigger');
      if (!trigger) return;
      var item = trigger.closest('.accordion-item');
      var wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item.open').forEach(function (openItem) {
        if (openItem !== item) openItem.classList.remove('open');
      });
      item.classList.toggle('open', !wasOpen);
    });
  }

  function setupKpiCounters() {
    var kpiNums = document.querySelectorAll('.kpi-num');
    var kpiAnimated = false;
    function animateKpis() {
      if (kpiAnimated) return;
      var metricsSection = document.getElementById('metricas');
      if (!metricsSection) return;
      var rect = metricsSection.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.75) return;
      kpiAnimated = true;
      kpiNums.forEach(function (el) {
        var target = parseInt(el.dataset.target, 10) || 0;
        var suffix = el.dataset.suffix || '';
        var duration = 1400;
        var start = performance.now();
        function tick(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target).toLocaleString('es-MX') + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }
    window.addEventListener('scroll', animateKpis, { passive: true });
    animateKpis();
  }

  function setupCharts() {
    if (!window.Chart) return;
    var chartAreasCtx = document.getElementById('chartAreas');
    if (chartAreasCtx) {
      new Chart(chartAreasCtx, {
        type: 'bar',
        data: {
          labels: ['Direccion', 'Juridico', 'Compliance', 'RH', 'Operaciones', 'Administracion', 'Pers. Operativo'],
          datasets: [{ label: '% Completado (demo)', data: [100, 95, 98, 88, 74, 91, 63], backgroundColor: '#c9a227', borderRadius: 6, maxBarThickness: 34 }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } },
            y: { beginAtZero: true, max: 100, ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.08)' } }
          }
        }
      });
    }
    var chartErrorsCtx = document.getElementById('chartErrors');
    if (chartErrorsCtx) {
      new Chart(chartErrorsCtx, {
        type: 'bar',
        data: {
          labels: ['Pregunta 2 (menores)', 'Pregunta 5 (ambiente)', 'Pregunta 1 (jornada)', 'Pregunta 3 (EPP)', 'Pregunta 4 (conflicto)'],
          datasets: [{ label: '% de error (demo)', data: [34, 27, 19, 12, 8], backgroundColor: '#8aa0c9', borderRadius: 6, maxBarThickness: 26 }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, max: 100, ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.08)' } },
            y: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } }
          }
        }
      });
    }
  }

  /* =========================================================
     7. INICIALIZACION
     ========================================================= */

  function startCourseFlow() {
    initCourseSession().then(function () {
      var incomplete = sortedModules().filter(function (m) { return !state.completedModules[m.id]; });
      var mods = sortedModules();
      state.activeModuleId = (incomplete[0] || mods[0] || {}).id;
      renderModuleCards();
      renderActiveModule();

      renderQuiz();
      var quizForm = document.getElementById('quizForm');
      if (quizForm) quizForm.addEventListener('submit', handleQuizSubmit);
    });
  }

  function safeRun(fn, label) {
    try {
      fn();
    } catch (e) {
      console.error('[init] Error en "' + label + '":', e);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.AOS) AOS.init({ duration: 700, once: true, offset: 60, easing: 'ease-out-cubic' });

    // El gate (bienvenida/registro) se inicializa primero y de forma aislada:
    // un error en cualquier otro modulo (nav, graficas, firma, etc.) nunca debe
    // impedir que el usuario pueda registrarse y desbloquear el sitio.
    safeRun(renderGate, 'renderGate');
    if (registro) safeRun(function () { prefillConstancia(registro); }, 'prefillConstancia');
    safeRun(function () { setupGate(startCourseFlow); }, 'setupGate');

    safeRun(setupNav, 'setupNav');
    safeRun(setupAccordions, 'setupAccordions');
    safeRun(setupKpiCounters, 'setupKpiCounters');
    safeRun(setupCharts, 'setupCharts');
    safeRun(setupConstancia, 'setupConstancia');
  });

})();
