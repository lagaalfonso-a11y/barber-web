/* ============================================================
   whatsapp.js — Generador de URLs de WhatsApp
   ============================================================ */

const WhatsApp = (() => {

  const interpolate = (template, vars) =>
    template.replace(/\{(\w+)\}/g, (_, k) => vars[k] || '');

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const bookingURL = (reservation) => {
    const barber  = Storage.getBarberById(reservation.barberId);
    const service = Storage.getServiceById(reservation.serviceId);
    const number  = barber ? barber.whatsapp : BUSINESS_CONFIG.whatsapp.defaultNumber;

    const upsellNames = (reservation.upsellIds || [])
      .map(id => Storage.getServiceById(id)?.name)
      .filter(Boolean)
      .join(', ');

    const serviceName = upsellNames
      ? `${service?.name} + ${upsellNames}`
      : (service?.name || '');

    const message = interpolate(BUSINESS_CONFIG.whatsapp.bookingMessage, {
      name:    `${reservation.clientName} ${reservation.clientLastname}`,
      service: serviceName,
      barber:  barber?.name || '',
      date:    formatDate(reservation.date),
      time:    reservation.startTime,
      price:   `${BUSINESS_CONFIG.currency}${reservation.totalPrice}`,
      business: BUSINESS_CONFIG.name
    });

    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  const reminderURL = (reservation) => {
    const message = interpolate(BUSINESS_CONFIG.whatsapp.reminderMessage, {
      business: BUSINESS_CONFIG.name,
      date:     formatDate(reservation.date),
      time:     reservation.startTime
    });
    return `https://wa.me/${BUSINESS_CONFIG.whatsapp.defaultNumber}?text=${encodeURIComponent(message)}`;
  };

  const generalURL = (number, message) =>
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return { bookingURL, reminderURL, generalURL, formatDate };
})();
