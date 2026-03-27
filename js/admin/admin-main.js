/* ============================================================
   admin/admin-main.js — Coordinador del panel admin
   ============================================================ */

// ── Modal helper ──
const AdminModal = (() => {
  const open = (title, bodyHtml) => {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('crud-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    document.getElementById('crud-modal').classList.add('hidden');
    document.body.style.overflow = '';
  };

  return { open, close };
})();

// ── Admin Main ──
const AdminMain = (() => {

  const panelTitles = {
    dashboard:    'Panel General',
    reservations: 'Reservas',
    barbers:      'Barberos',
    services:     'Servicios',
    blocks:       'Bloqueos de Horario'
  };

  const showPanel = (panelId) => {
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));

    const panel = document.getElementById(`panel-${panelId}`);
    if (panel) panel.classList.add('active');

    const navBtn = document.querySelector(`[data-panel="${panelId}"]`);
    if (navBtn) navBtn.classList.add('active');

    document.getElementById('admin-panel-title').textContent = panelTitles[panelId] || panelId;

    // Refresh data when switching panels
    if (panelId === 'dashboard')    Dashboard.render();
    if (panelId === 'reservations') ReservationsMgr.render();
    if (panelId === 'barbers')      BarbersCRUD.render();
    if (panelId === 'services')     ServicesCRUD.render();
    if (panelId === 'blocks')       BlocksMgr.render();
  };

  const init = () => {
    // Today date in topbar
    const dateEl = document.getElementById('admin-today-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    // Sidebar navigation
    document.querySelectorAll('[data-panel]').forEach(btn => {
      btn.addEventListener('click', () => {
        showPanel(btn.dataset.panel);
        // Close mobile sidebar
        document.getElementById('admin-sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Logout
    document.getElementById('admin-logout')?.addEventListener('click', Auth.logout);

    // Mobile sidebar toggle
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
      const sidebar  = document.getElementById('admin-sidebar');
      const overlay  = document.getElementById('sidebar-overlay');
      const isOpen   = sidebar.classList.toggle('open');
      overlay.classList.toggle('active', isOpen);
      if (isOpen) document.body.style.overflow = 'hidden';
      else document.body.style.overflow = '';
    });

    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      document.getElementById('admin-sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('active');
      document.body.style.overflow = '';
    });

    // Modal close
    document.getElementById('modal-close')?.addEventListener('click', AdminModal.close);
    document.getElementById('crud-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'crud-modal') AdminModal.close();
    });

    // Initialize all modules
    Dashboard.render();
    ReservationsMgr.init();
    BarbersCRUD.init();
    ServicesCRUD.init();
    BlocksMgr.init();
  };

  return { init, showPanel };
})();

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', () => {
  const authenticated = Auth.init();
  if (authenticated) AdminMain.init();
});
