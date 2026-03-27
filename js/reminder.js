/* ============================================================
   reminder.js — Recordatorios simulados (toast + WhatsApp URL)
   ============================================================ */

const Reminder = (() => {

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const check = () => {
    const tomorrow = getTomorrow();
    const pending = Storage.getReservations().filter(
      r => r.date === tomorrow && r.status !== 'cancelled' && !r.reminderSent
    );

    pending.forEach((r, i) => {
      const barber = Storage.getBarberById(r.barberId);
      const service = Storage.getServiceById(r.serviceId);

      // Delay toasts slightly so they don't stack immediately
      setTimeout(() => {
        const reminderUrl = WhatsApp.reminderURL(r);
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast info';
        toast.innerHTML = `
          <div class="toast-title">⏰ Cita mañana</div>
          <div class="toast-body">
            ${r.clientName} — ${service?.name || ''} con ${barber?.name || ''} a las ${r.startTime}
            <br/>
            <a href="${reminderUrl}" target="_blank" rel="noopener"
               style="color:var(--color-accent);font-weight:600;text-decoration:underline;font-size:0.8rem;">
              Enviar recordatorio por WhatsApp →
            </a>
          </div>
        `;
        container.appendChild(toast);

        // Mark as sent
        r.reminderSent = true;
        Storage.saveReservation(r);

        // Auto-remove after 10s
        setTimeout(() => {
          toast.classList.add('removing');
          toast.addEventListener('animationend', () => toast.remove());
        }, 10000);
      }, i * 1500);
    });
  };

  return { check };
})();
