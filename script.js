/* =========================================================
   CÓDIGO DE ÉTICA — INTER-CON | script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- AOS (scroll animations) ---------- */
  if (window.AOS) {
    AOS.init({ duration: 700, once: true, offset: 60, easing: 'ease-out-cubic' });
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const sidenav = document.getElementById('sidenav');
  const navOverlay = document.getElementById('navOverlay');

  function closeNav() {
    sidenav.classList.remove('open');
    navOverlay.classList.remove('show');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  function toggleNav() {
    const isOpen = sidenav.classList.toggle('open');
    navOverlay.classList.toggle('show', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  }
  navToggle?.addEventListener('click', toggleNav);
  navOverlay?.addEventListener('click', closeNav);
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  /* ---------- Progress bar + active nav link on scroll ---------- */
  const progressFill = document.getElementById('progressFill');
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    // progress bar
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressFill) progressFill.style.width = pct + '%';

    // active section
    let currentId = sections[0]?.id;
    const triggerLine = window.innerHeight * 0.35;
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= triggerLine) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === currentId);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const wasOpen = item.classList.contains('open');
      // close siblings within the same accordion for a cleaner UX
      item.parentElement.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if (openItem !== item) openItem.classList.remove('open');
      });
      item.classList.toggle('open', !wasOpen);
    });
  });

  /* ---------- Quiz ---------- */
  const quizForm = document.getElementById('quizForm');
  const quizResult = document.getElementById('quizResult');
  const quizScoreNum = document.getElementById('quizScoreNum');
  const quizResultTitle = document.getElementById('quizResultTitle');
  const quizResultMsg = document.getElementById('quizResultMsg');
  let lastQuizScorePct = null;

  quizForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const questions = quizForm.querySelectorAll('.quiz-question');
    let correctCount = 0;
    let answeredAll = true;

    questions.forEach(q => {
      const name = q.querySelector('input[type="radio"]').name;
      const selected = quizForm.querySelector(`input[name="${name}"]:checked`);
      const feedback = q.querySelector('.quiz-feedback');
      const correctValue = q.dataset.correct;

      q.classList.remove('correct', 'incorrect');
      feedback.classList.remove('show');

      if (!selected) {
        answeredAll = false;
        return;
      }
      const isCorrect = selected.value === correctValue;
      if (isCorrect) {
        correctCount++;
        q.classList.add('correct');
        feedback.textContent = '✓ Respuesta correcta.';
      } else {
        q.classList.add('incorrect');
        feedback.textContent = '✗ Respuesta incorrecta. Revisa el contenido de esta sección.';
      }
      feedback.classList.add('show');
    });

    if (!answeredAll) {
      alert('Por favor responde todas las preguntas antes de calcular tu resultado.');
      return;
    }

    const total = questions.length;
    const pct = Math.round((correctCount / total) * 100);
    lastQuizScorePct = pct;
    const passed = pct >= 80;

    quizScoreNum.textContent = pct + '%';
    quizResultTitle.textContent = passed ? 'Aprobado' : 'No aprobado';
    quizResultTitle.style.color = passed ? '#4ade80' : '#f87171';
    quizResultMsg.textContent = passed
      ? `Obtuviste ${correctCount} de ${total} respuestas correctas. ¡Buen trabajo! Este resultado demo se reflejaría en tu constancia.`
      : `Obtuviste ${correctCount} de ${total} respuestas correctas. Se requiere un mínimo de 80% para aprobar. Te recomendamos repasar las secciones marcadas como incorrectas.`;

    quizResult.classList.remove('hidden');
    quizResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- Signature Pad ---------- */
  const canvas = document.getElementById('signaturePad');
  let signaturePad = null;

  function resizeCanvas() {
    if (!canvas) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    if (signaturePad) signaturePad.clear();
  }

  if (canvas && window.SignaturePad) {
    signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgba(255,255,255,1)',
      penColor: '#0b1f3a'
    });
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  }

  document.getElementById('clearSignature')?.addEventListener('click', () => {
    signaturePad?.clear();
  });

  /* ---------- Constancia demo ---------- */
  const constanciaForm = document.getElementById('constanciaForm');
  const downloadPdfBtn = document.getElementById('downloadPdf');

  constanciaForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('ccNombre').value.trim();
    const correo = document.getElementById('ccCorreo').value.trim();
    const area = document.getElementById('ccArea').value;

    if (signaturePad && signaturePad.isEmpty()) {
      alert('Por favor dibuja tu firma antes de generar la constancia demo.');
      return;
    }

    document.getElementById('cpNombre').textContent = nombre || '—';
    document.getElementById('cpCorreo').textContent = correo || '—';
    document.getElementById('cpArea').textContent = area || '—';
    document.getElementById('cpScore').textContent = lastQuizScorePct !== null ? lastQuizScorePct + '%' : 'Sin evaluación demo';
    document.getElementById('cpFecha').textContent = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    const sigImg = document.getElementById('cpSignatureImg');
    if (signaturePad && !signaturePad.isEmpty()) {
      sigImg.src = signaturePad.toDataURL('image/png');
      sigImg.style.display = 'block';
    }

    downloadPdfBtn.disabled = false;
    document.getElementById('constanciaPreview').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  downloadPdfBtn?.addEventListener('click', () => {
    const element = document.getElementById('constanciaPreview');
    if (!window.html2pdf) {
      alert('No se pudo cargar el generador de PDF. Verifica tu conexión a internet.');
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

  /* ---------- KPI counters (métricas demo) ---------- */
  const kpiNums = document.querySelectorAll('.kpi-num');
  let kpiAnimated = false;

  function animateKpis() {
    if (kpiAnimated) return;
    const metricsSection = document.getElementById('metricas');
    if (!metricsSection) return;
    const rect = metricsSection.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.75) return;

    kpiAnimated = true;
    kpiNums.forEach(el => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString('es-MX') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  window.addEventListener('scroll', animateKpis, { passive: true });
  animateKpis();

  /* ---------- Chart.js (métricas demo) ---------- */
  if (window.Chart) {
    const chartAreasCtx = document.getElementById('chartAreas');
    if (chartAreasCtx) {
      new Chart(chartAreasCtx, {
        type: 'bar',
        data: {
          labels: ['Dirección', 'Jurídico', 'Compliance', 'RH', 'Operaciones', 'Administración', 'Pers. Operativo'],
          datasets: [{
            label: '% Completado (demo)',
            data: [100, 95, 98, 88, 74, 91, 63],
            backgroundColor: '#c9a227',
            borderRadius: 6,
            maxBarThickness: 34
          }]
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

    const chartErrorsCtx = document.getElementById('chartErrors');
    if (chartErrorsCtx) {
      new Chart(chartErrorsCtx, {
        type: 'bar',
        data: {
          labels: ['Pregunta 2 (menores)', 'Pregunta 5 (ambiente)', 'Pregunta 1 (jornada)', 'Pregunta 3 (conflicto)', 'Pregunta 4 (canal)'],
          datasets: [{
            label: '% de error (demo)',
            data: [34, 27, 19, 12, 8],
            backgroundColor: '#8aa0c9',
            borderRadius: 6,
            maxBarThickness: 26
          }]
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

});
