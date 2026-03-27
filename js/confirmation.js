/* ============================================================
   confirmation.js — Pantalla de confirmación post-reserva
   ============================================================ */

const Confirmation = (() => {

  const show = (reservation) => {
    const overlay  = document.getElementById('confirmation-overlay');
    const details  = document.getElementById('confirmation-details');
    const waBtn    = document.getElementById('confirmation-wa-btn');
    const closeBtn = document.getElementById('confirmation-close-btn');

    if (!overlay || !details) return;

    const barber  = Storage.getBarberById(reservation.barberId);
    const service = Storage.getServiceById(reservation.serviceId);
    const upsells = (reservation.upsellIds || [])
      .map(id => Storage.getServiceById(id)?.name)
      .filter(Boolean)
      .join(', ');

    const serviceName = upsells
      ? `${service?.name} + ${upsells}`
      : (service?.name || '—');

    const dateFormatted = WhatsApp.formatDate(reservation.date);

    details.innerHTML = `
      <div class="confirmation-detail-row">
        <span class="confirmation-detail-label">Cliente</span>
        <span class="confirmation-detail-value">${reservation.clientName} ${reservation.clientLastname}</span>
      </div>
      <div class="confirmation-detail-row">
        <span class="confirmation-detail-label">Servicio</span>
        <span class="confirmation-detail-value">${serviceName}</span>
      </div>
      <div class="confirmation-detail-row">
        <span class="confirmation-detail-label">Barbero</span>
        <span class="confirmation-detail-value">${barber?.name || '—'}</span>
      </div>
      <div class="confirmation-detail-row">
        <span class="confirmation-detail-label">Fecha</span>
        <span class="confirmation-detail-value">${dateFormatted}</span>
      </div>
      <div class="confirmation-detail-row">
        <span class="confirmation-detail-label">Hora</span>
        <span class="confirmation-detail-value">${reservation.startTime} – ${reservation.endTime}</span>
      </div>
      <div class="confirmation-detail-row">
        <span class="confirmation-detail-label">Total</span>
        <span class="confirmation-detail-value">${BUSINESS_CONFIG.currency}${reservation.totalPrice}</span>
      </div>
    `;

    if (waBtn) {
      waBtn.href = WhatsApp.bookingURL(reservation);
      waBtn.addEventListener('click', () => {
        reservation.whatsappSent = true;
        Storage.saveReservation(reservation);
      }, { once: true });
    }

    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    closeBtn?.addEventListener('click', () => close(), { once: true });

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    }, { once: true });
  };

  const close = () => {
    const overlay = document.getElementById('confirmation-overlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { show, close };
})();
