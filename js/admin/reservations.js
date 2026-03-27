/* ============================================================
   admin/reservations.js — Gestión de reservas
   ============================================================ */

const ReservationsMgr = (() => {

  const statusLabel = {
    pending:   'Pendiente',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada'
  };

  const render = () => {
    const tbody       = document.getElementById('reservations-tbody');
    const barberFilter = document.getElementById('res-filter-barber');
    if (!tbody) return;

    // Populate barber filter
    if (barberFilter && barberFilter.options.length === 1) {
      Storage.getBarbers().forEach(b => {
        barberFilter.appendChild(new Option(b.name, b.id));
      });
    }

    let reservations = Storage.getReservations();

    // Apply filters
    const dateFilter   = document.getElementById('res-filter-date')?.value;
    const statusFilter = document.getElementById('res-filter-status')?.value;
    const barberF      = barberFilter?.value;

    if (dateFilter)   reservations = reservations.filter(r => r.date === dateFilter);
    if (statusFilter) reservations = reservations.filter(r => r.status === statusFilter);
    if (barberF)      reservations = reservations.filter(r => r.barberId === barberF);

    // Sort by date desc, time desc
    reservations.sort((a, b) => {
      const dateComp = b.date.localeCompare(a.date);
      return dateComp !== 0 ? dateComp : b.startTime.localeCompare(a.startTime);
    });

    if (reservations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">No hay reservas con esos filtros</div></div></td></tr>`;
      return;
    }

    tbody.innerHTML = reservations.map(r => {
      const barber  = Storage.getBarberById(r.barberId);
      const service = Storage.getServiceById(r.serviceId);
      return `
        <tr>
          <td><strong>${r.clientName} ${r.clientLastname}</strong><br/><span style="color:var(--color-gray);font-size:0.78rem">${r.clientPhone}</span></td>
          <td>${service?.name || r.serviceId}</td>
          <td>${barber?.name || r.barberId}</td>
          <td>${r.date}</td>
          <td>${r.startTime} – ${r.endTime}</td>
          <td><strong>${BUSINESS_CONFIG.currency}${r.totalPrice}</strong></td>
          <td><span class="status-badge status-${r.status}">${statusLabel[r.status] || r.status}</span></td>
          <td>
            <div class="table-actions">
              <select class="form-control" style="padding:0.25rem 0.5rem;font-size:0.78rem;width:130px"
                onchange="ReservationsMgr.updateStatus('${r.id}', this.value)">
                ${Object.entries(statusLabel).map(([val, lbl]) =>
                  `<option value="${val}" ${r.status === val ? 'selected' : ''}>${lbl}</option>`
                ).join('')}
              </select>
              <a class="btn-icon success" href="${WhatsApp.bookingURL(r)}" target="_blank" title="WhatsApp">📲</a>
              <button class="btn-icon danger" onclick="ReservationsMgr.remove('${r.id}')" title="Eliminar">🗑</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  const updateStatus = (id, status) => {
    const r = Storage.getReservationById(id);
    if (!r) return;
    r.status = status;
    Storage.saveReservation(r);
    render();
    UI.toast('Actualizado', `Reserva marcada como "${statusLabel[status]}"`, 'success');
  };

  const remove = (id) => {
    if (!confirm('¿Eliminar esta reserva?')) return;
    Storage.deleteReservation(id);
    render();
    UI.toast('Eliminada', 'Reserva eliminada', 'info');
  };

  const init = () => {
    // Bind filters
    ['res-filter-date', 'res-filter-status', 'res-filter-barber'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', render);
    });
    render();
  };

  return { init, render, updateStatus, remove };
})();
