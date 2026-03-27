/* ============================================================
   booking.js — Lógica del formulario de reserva
   ============================================================ */

const Booking = (() => {

  let selectedTime = null;
  let upsellSelected = [];

  // ── Poblar selects ──
  const populateSelects = () => {
    const svcSel = document.getElementById('book-service');
    const barSel = document.getElementById('book-barber');
    const qbSvc  = document.getElementById('qb-service');
    const qbBar  = document.getElementById('qb-barber');

    const services = Storage.getServices().filter(s => s.active);
    const barbers  = Storage.getBarbers().filter(b => b.active);

    services.forEach(s => {
      const o = new Option(`${s.name} — ${BUSINESS_CONFIG.currency}${s.price} (${s.duration}min)`, s.id);
      if (svcSel) svcSel.appendChild(o.cloneNode(true));
      if (qbSvc)  qbSvc.appendChild(o.cloneNode(true));
    });

    barbers.sort((a,b) => a.order - b.order).forEach(b => {
      const o = new Option(b.name, b.id);
      if (barSel) barSel.appendChild(o.cloneNode(true));
      if (qbBar)  qbBar.appendChild(o.cloneNode(true));
    });
  };

  // ── Calcular duración + precio con upsells ──
  const getTotals = (serviceId) => {
    const svc = Storage.getServiceById(serviceId);
    if (!svc) return { duration: 0, price: 0 };
    let duration = svc.duration;
    let price    = svc.price;
    upsellSelected.forEach(uid => {
      const u = Storage.getServiceById(uid);
      if (u) { duration += u.duration; price += u.price; }
    });
    return { duration, price };
  };

  // ── Renderizar upsells ──
  const renderUpsells = (serviceId) => {
    const container = document.getElementById('upsell-container');
    if (!container) return;
    const svc = Storage.getServiceById(serviceId);
    if (!svc || !svc.upsells || svc.upsells.length === 0) {
      container.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    const upsells = svc.upsells
      .map(id => Storage.getServiceById(id))
      .filter(u => u && u.active);

    if (upsells.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="upsell-section">
        <div class="upsell-title">✨ Complementa tu visita</div>
        ${upsells.map(u => `
          <div class="upsell-item">
            <input type="checkbox" id="ups-${u.id}" value="${u.id}" />
            <div class="upsell-item-info">
              <div class="upsell-item-name">${u.name}</div>
              <div class="upsell-item-duration">+${u.duration} min</div>
            </div>
            <div class="upsell-item-price">+${BUSINESS_CONFIG.currency}${u.price}</div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', () => {
        upsellSelected = [...container.querySelectorAll('input:checked')].map(c => c.value);
        refreshSlots();
        updateSummary();
      });
    });
  };

  // ── Actualizar resumen de precio/duración ──
  const updateSummary = () => {
    const svcId = document.getElementById('book-service')?.value;
    const summary = document.getElementById('booking-summary');
    if (!svcId || !summary) return;
    const { duration, price } = getTotals(svcId);
    document.getElementById('summary-duration').textContent = `${duration} min`;
    document.getElementById('summary-price').textContent    = `${BUSINESS_CONFIG.currency}${price}`;
    summary.style.display = 'flex';
  };

  // ── Renderizar slots de tiempo ──
  const renderSlots = (slots, containerId, hiddenId) => {
    const container = document.getElementById(containerId);
    const hidden    = document.getElementById(hiddenId);
    if (!container) return;

    selectedTime = null;
    if (hidden) hidden.value = '';

    if (slots.length === 0) {
      container.innerHTML = '<p class="time-slots-empty">No hay horarios disponibles para esta selección.</p>';
      return;
    }

    container.innerHTML = `<div class="time-slots-grid"></div>`;
    const grid = container.querySelector('.time-slots-grid');

    slots.forEach(slot => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot';
      btn.textContent = slot;
      btn.addEventListener('click', () => {
        grid.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedTime = slot;
        if (hidden) hidden.value = slot;
      });
      grid.appendChild(btn);
    });
  };

  // ── Refrescar slots (formulario principal) ──
  const refreshSlots = () => {
    const barberId  = document.getElementById('book-barber')?.value;
    const date      = document.getElementById('book-date')?.value;
    const serviceId = document.getElementById('book-service')?.value;

    if (!barberId || !date || !serviceId) {
      const c = document.getElementById('time-slots-container');
      if (c) c.innerHTML = '<p class="time-slots-empty">Selecciona servicio, barbero y fecha primero.</p>';
      return;
    }

    if (!Availability.isDayOpen(date)) {
      const c = document.getElementById('time-slots-container');
      if (c) c.innerHTML = '<p class="time-slots-empty">No atendemos ese día. Elige otro.</p>';
      return;
    }

    const { duration } = getTotals(serviceId);
    const slots = Availability.getAvailableSlots(barberId, date, duration);
    renderSlots(slots, 'time-slots-container', 'book-time');
  };

  // ── Validar formulario ──
  const validate = (data) => {
    const errors = [];
    if (!data.clientName.trim())    errors.push('Nombre requerido');
    if (!data.clientLastname.trim()) errors.push('Apellido requerido');
    if (!data.clientPhone.trim())   errors.push('Teléfono requerido');
    if (!data.serviceId)            errors.push('Selecciona un servicio');
    if (!data.barberId)             errors.push('Selecciona un barbero');
    if (!data.date)                 errors.push('Selecciona una fecha');
    if (!data.startTime)            errors.push('Selecciona una hora');
    return errors;
  };

  // ── Crear reserva ──
  const createReservation = (data) => {
    // Double-check availability
    const { duration, price } = getTotals(data.serviceId);
    if (!Availability.isSlotFree(data.barberId, data.date, data.startTime, duration)) {
      UI.toast('Horario no disponible', 'Ese horario acaba de ser ocupado. Elige otro.', 'error');
      refreshSlots();
      return null;
    }

    const reservation = {
      id:             Storage.generateId('res'),
      clientName:     data.clientName,
      clientLastname: data.clientLastname,
      clientPhone:    data.clientPhone,
      serviceId:      data.serviceId,
      barberId:       data.barberId,
      date:           data.date,
      startTime:      data.startTime,
      endTime:        Availability.addMin(data.startTime, duration),
      status:         'pending',
      upsellIds:      [...upsellSelected],
      totalDuration:  duration,
      totalPrice:     price,
      whatsappSent:   false,
      reminderSent:   false,
      createdAt:      new Date().toISOString()
    };

    Storage.saveReservation(reservation);
    return reservation;
  };

  // ── Inicializar formulario principal ──
  const initMainForm = () => {
    const form = document.getElementById('booking-form');
    if (!form) return;

    document.getElementById('book-service')?.addEventListener('change', (e) => {
      upsellSelected = [];
      renderUpsells(e.target.value);
      updateSummary();
      refreshSlots();
    });

    ['book-barber', 'book-date'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', refreshSlots);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        clientName:     document.getElementById('book-name').value,
        clientLastname: document.getElementById('book-lastname').value,
        clientPhone:    document.getElementById('book-phone').value,
        serviceId:      document.getElementById('book-service').value,
        barberId:       document.getElementById('book-barber').value,
        date:           document.getElementById('book-date').value,
        startTime:      document.getElementById('book-time').value
      };

      const errors = validate(data);
      if (errors.length > 0) {
        UI.toast('Completa el formulario', errors[0], 'error');
        return;
      }

      const reservation = createReservation(data);
      if (!reservation) return;

      form.reset();
      upsellSelected = [];
      document.getElementById('upsell-container').classList.add('hidden');
      document.getElementById('booking-summary').style.display = 'none';
      document.getElementById('time-slots-container').innerHTML =
        '<p class="time-slots-empty">Selecciona servicio, barbero y fecha primero.</p>';

      Confirmation.show(reservation);
    });
  };

  // ── Quick Book Modal ──
  const initQuickBook = () => {
    const btn    = document.getElementById('quick-book-btn');
    const modal  = document.getElementById('quick-modal');
    const close  = document.getElementById('quick-modal-close');
    const form   = document.getElementById('quick-book-form');
    if (!btn || !modal) return;

    const openModal = () => {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    };

    btn.addEventListener('click', openModal);
    close?.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    ['qb-service', 'qb-barber', 'qb-date'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        const svcId   = document.getElementById('qb-service')?.value;
        const barId   = document.getElementById('qb-barber')?.value;
        const dateVal = document.getElementById('qb-date')?.value;
        if (!svcId || !barId || !dateVal) return;
        const svc = Storage.getServiceById(svcId);
        if (!svc) return;
        const slots = Availability.getAvailableSlots(barId, dateVal, svc.duration);
        renderSlots(slots, 'qb-time-slots', 'qb-time');
      });
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        clientName:     document.getElementById('qb-name').value,
        clientLastname: '',
        clientPhone:    '',
        serviceId:      document.getElementById('qb-service').value,
        barberId:       document.getElementById('qb-barber').value,
        date:           document.getElementById('qb-date').value,
        startTime:      document.getElementById('qb-time').value
      };

      if (!data.clientName || !data.serviceId || !data.barberId || !data.date || !data.startTime) {
        UI.toast('Completa todos los campos', '', 'error');
        return;
      }

      upsellSelected = [];
      const svc = Storage.getServiceById(data.serviceId);
      const duration = svc?.duration || 30;
      const price    = svc?.price || 0;

      const reservation = {
        id:             Storage.generateId('res'),
        clientName:     data.clientName,
        clientLastname: '',
        clientPhone:    '',
        serviceId:      data.serviceId,
        barberId:       data.barberId,
        date:           data.date,
        startTime:      data.startTime,
        endTime:        Availability.addMin(data.startTime, duration),
        status:         'pending',
        upsellIds:      [],
        totalDuration:  duration,
        totalPrice:     price,
        whatsappSent:   false,
        reminderSent:   false,
        createdAt:      new Date().toISOString()
      };

      if (!Availability.isSlotFree(data.barberId, data.date, data.startTime, duration)) {
        UI.toast('Horario no disponible', 'Elige otro horario.', 'error');
        return;
      }

      Storage.saveReservation(reservation);
      closeModal();
      Confirmation.show(reservation);
    });
  };

  const init = () => {
    populateSelects();
    initMainForm();
    initQuickBook();
  };

  return { init };
})();
