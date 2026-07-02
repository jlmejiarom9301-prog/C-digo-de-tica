const progressBar = document.getElementById('progressBar');
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => nav.classList.toggle('open'));
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
});
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
document.querySelectorAll('.accordion button').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.nextElementSibling;
    document.querySelectorAll('.accordion div').forEach(d => { if (d !== panel) d.classList.remove('open'); });
    panel.classList.toggle('open');
  });
});
let qIndex = 0;
const questions = [...document.querySelectorAll('.question')];
document.querySelectorAll('.question button').forEach(button => {
  button.addEventListener('click', () => {
    const q = button.closest('.question');
    const ok = button.dataset.option === q.dataset.answer;
    q.querySelectorAll('button').forEach(b => b.disabled = true);
    button.classList.add(ok ? 'correct' : 'wrong');
    q.querySelector('.feedback').textContent = ok ? 'Correcto.' : 'Revisa el contenido de la sección correspondiente.';
  });
});
document.getElementById('nextQuestion').addEventListener('click', () => {
  questions[qIndex].classList.remove('active');
  qIndex = Math.min(qIndex + 1, questions.length - 1);
  questions[qIndex].classList.add('active');
});
document.getElementById('completeBtn').addEventListener('click', () => {
  localStorage.setItem('ethics_training_completed','true');
  document.getElementById('completeMessage').style.display = 'block';
});
if(localStorage.getItem('ethics_training_completed') === 'true'){
  document.getElementById('completeMessage').style.display = 'block';
}
