/* ============================================================
   ui.js — Renderizado DOM (barberos, servicios, nav)
   ============================================================ */

const UI = (() => {

  // ── Barber cards ──
  const renderBarbers = () => {
    const grid = document.getElementById('barbers-grid');
    if (!grid) return;
    const barbers = Storage.getBarbers().filter(b => b.active);
    grid.innerHTML = '';

    barbers.sort((a, b) => a.order - b.order).forEach((barber, i) => {
      const card = document.createElement('article');
      card.className = `barber-card animate-fadeInUp stagger-${Math.min(i + 1, 5)}`;

      const photoHtml = barber.photo
        ? `<img class="barber-card-photo" src="${barber.photo}" alt="${barber.name}" loading="lazy" />`
        : `<div class="barber-card-photo-placeholder" aria-hidden="true">✂</div>`;

      card.innerHTML = `
        ${photoHtml}
        <div class="barber-card-info">
          <div class="barber-card-name">${barber.name}</div>
          <div class="barber-card-specialty">${barber.specialty}</div>
          <a class="barber-card-wa" href="https://wa.me/${barber.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp de ${barber.name}">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Contactar
          </a>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  // ── Service cards ──
  const renderServices = (filter = 'all') => {
    const grid = document.getElementById('services-grid');
    if (!grid) return;
    let services = Storage.getServices().filter(s => s.active);
    if (filter !== 'all') services = services.filter(s => s.category === filter);
    grid.innerHTML = '';

    const badgeMap = { corte: 'badge-corte', barba: 'badge-barba', tratamiento: 'badge-tratamiento', combo: 'badge-combo' };
    const labelMap = { corte: 'Corte', barba: 'Barba', tratamiento: 'Tratamiento', combo: 'Combo' };

    if (services.length === 0) {
      grid.innerHTML = '<p style="color:var(--color-gray);padding:2rem 0;">No hay servicios en esta categoría.</p>';
      return;
    }

    services.forEach(service => {
      const card = document.createElement('div');
      card.className = 'service-card reveal';
      card.innerHTML = `
        <div class="service-info">
          <div class="service-name">${service.name}</div>
          <div class="service-desc">${service.description}</div>
          <div class="service-duration">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${service.duration} min
          </div>
        </div>
        <div class="service-meta">
          <div class="service-price">${BUSINESS_CONFIG.currency}${service.price}</div>
          <div class="service-category-badge ${badgeMap[service.category] || ''}">${labelMap[service.category] || service.category}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  // ── Category filter tabs ──
  const initCategoryTabs = () => {
    const tabs = document.getElementById('category-tabs');
    if (!tabs) return;
    tabs.addEventListener('click', e => {
      const btn = e.target.closest('.category-tab');
      if (!btn) return;
      tabs.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      renderServices(btn.dataset.cat);
      // Re-trigger reveal for new cards
      setTimeout(initReveal, 50);
    });
  };

  // ── Toast notifications ──
  const toast = (title, body = '', type = 'info', duration = 4000) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <div class="toast-title">${title}</div>
      ${body ? `<div class="toast-body">${body}</div>` : ''}
    `;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('removing');
      el.addEventListener('animationend', () => el.remove());
    }, duration);
  };

  // ── Reveal on scroll ──
  const initReveal = () => {
    const els = document.querySelectorAll('.reveal:not(.visible)');
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });
      els.forEach(el => obs.observe(el));
    } else {
      els.forEach(el => el.classList.add('visible'));
    }
  };

  // ── Nav active state ──
  const initNavHighlight = () => {
    const sections = ['home', 'barberos', 'servicios', 'reservas'];
    const links = document.querySelectorAll('[data-nav]');

    const update = () => {
      let current = 'home';
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) current = id;
      });
      links.forEach(l => {
        l.classList.toggle('active', l.dataset.nav === current);
      });
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  // ── Nav scroll style ──
  const initNavScroll = () => {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav-scrolled', window.scrollY > 60);
    }, { passive: true });
  };

  // ── Hamburger menu ──
  const initHamburger = () => {
    const btn = document.getElementById('nav-hamburger');
    const links = document.getElementById('nav-links');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
      const open = !links.classList.contains('open');
      links.classList.toggle('open', open);
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
    });

    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', false);
      });
    });
  };

  // ── Footer year ──
  const initFooter = () => {
    const y = document.getElementById('footer-year');
    if (y) y.textContent = new Date().getFullYear();
    const wa = document.getElementById('footer-wa');
    if (wa) wa.href = `https://wa.me/${BUSINESS_CONFIG.whatsapp.defaultNumber}`;
  };

  // ── Min date for date inputs ──
  const initDateInputs = () => {
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 8);
    const maxDateStr = maxDate.toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(inp => {
      inp.min = today;
      inp.max = maxDateStr;
    });
  };

  const renderAll = () => {
    renderBarbers();
    renderServices();
    initCategoryTabs();
    initReveal();
    initNavHighlight();
    initNavScroll();
    initHamburger();
    initFooter();
    initDateInputs();
  };

  return { renderAll, renderBarbers, renderServices, toast, initReveal };
})();
