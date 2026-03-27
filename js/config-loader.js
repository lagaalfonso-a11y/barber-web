/* ============================================================
   config-loader.js — Aplica tema CSS y siembra localStorage
   ============================================================ */

const ConfigLoader = (() => {

  const applyTheme = () => {
    const t = BUSINESS_CONFIG.theme;
    const r = document.documentElement.style;
    r.setProperty('--color-primary',   t.primary);
    r.setProperty('--color-accent',    t.accent);
    r.setProperty('--color-gray',      t.gray);
    r.setProperty('--color-light',     t.light);
    if (t.surface)  r.setProperty('--color-surface',   t.surface);
    if (t.surface2) r.setProperty('--color-surface-2', t.surface2);
    if (t.border)   r.setProperty('--color-border',    t.border);
  };

  const applyText = () => {
    const cfg = BUSINESS_CONFIG;
    // Business name in all slots
    document.querySelectorAll('[data-business-name]').forEach(el => {
      el.textContent = cfg.name;
    });
    document.querySelectorAll('[data-business-tagline]').forEach(el => {
      el.textContent = cfg.tagline;
    });
    document.querySelectorAll('[data-business-address]').forEach(el => {
      el.textContent = cfg.address;
    });
    document.querySelectorAll('[data-business-phone]').forEach(el => {
      el.textContent = cfg.phone;
    });
    document.querySelectorAll('[data-business-instagram]').forEach(el => {
      el.textContent = cfg.instagram;
    });

    // WhatsApp floating link
    const waFloat = document.getElementById('btn-whatsapp-float');
    if (waFloat) {
      waFloat.href = `https://wa.me/${cfg.whatsapp.defaultNumber}`;
    }

    // Page title
    document.title = cfg.name;
  };

  const seedData = () => {
    if (Storage.isInitialized()) return;
    Storage.saveBarbers(BUSINESS_CONFIG.seedBarbers);
    Storage.saveServices(BUSINESS_CONFIG.seedServices);
    Storage.markInitialized();
  };

  const init = () => {
    applyTheme();
    seedData();
    applyText();
  };

  return { init, applyTheme, seedData };
})();
