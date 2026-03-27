/* ============================================================
   admin/auth.js — Autenticación del panel admin
   ============================================================ */

const Auth = (() => {
  const SESSION_KEY = 'admin_session';
  let attempts = 0;
  let lockUntil = 0;

  const isAuthenticated = () => !!sessionStorage.getItem(SESSION_KEY);

  const login = (password) => {
    const now = Date.now();
    if (now < lockUntil) {
      const secs = Math.ceil((lockUntil - now) / 1000);
      return { ok: false, msg: `Bloqueado. Intenta en ${secs}s` };
    }

    if (password === BUSINESS_CONFIG.adminPassword) {
      sessionStorage.setItem(SESSION_KEY, '1');
      attempts = 0;
      return { ok: true };
    }

    attempts++;
    if (attempts >= 3) {
      lockUntil = now + 60000;
      attempts = 0;
      return { ok: false, msg: 'Demasiados intentos. Bloqueado 60s.' };
    }

    return { ok: false, msg: 'Contraseña incorrecta' };
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  };

  const init = () => {
    ConfigLoader.init();

    if (isAuthenticated()) {
      document.getElementById('auth-gate').classList.add('hidden');
      document.getElementById('admin-app').classList.remove('hidden');
      return true;
    }

    const form  = document.getElementById('auth-form');
    const errEl = document.getElementById('auth-error');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pwd = document.getElementById('auth-password')?.value || '';
      const result = login(pwd);

      if (result.ok) {
        document.getElementById('auth-gate').classList.add('hidden');
        document.getElementById('admin-app').classList.remove('hidden');
        AdminMain.init();
      } else {
        errEl.textContent = result.msg;
        errEl.classList.remove('hidden');
        setTimeout(() => errEl.classList.add('hidden'), 4000);
      }
    });

    return false;
  };

  return { init, isAuthenticated, logout };
})();
