/* ============================================================
   main.js — Punto de entrada de la aplicación
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar config (tema + seed data + textos)
  ConfigLoader.init();

  // 2. Renderizar UI
  UI.renderAll();

  // 3. Inicializar reservas
  Booking.init();

  // 4. Verificar recordatorios del día siguiente
  setTimeout(() => Reminder.check(), 2000);

  // 5. Smooth scroll para anchor links internos
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });

  // 6. Footer year
  const fy = document.getElementById('footer-year');
  if (fy) fy.textContent = new Date().getFullYear();
});
