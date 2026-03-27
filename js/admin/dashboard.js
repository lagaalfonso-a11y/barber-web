/* ============================================================
   admin/dashboard.js — Métricas y gráficos CSS
   ============================================================ */

const Dashboard = (() => {

  const today = () => new Date().toISOString().split('T')[0];

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const shortDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  };

  const render = () => {
    const reservations = Storage.getReservations().filter(r => r.status !== 'cancelled');
    const barbers      = Storage.getBarbers();
    const services     = Storage.getServices();
    const todayStr     = today();

    // ── Stats ──
    const todayCount = reservations.filter(r => r.date === todayStr).length;
    const weekDays   = getLast7Days();
    const weekCount  = reservations.filter(r => weekDays.includes(r.date)).length;
    const revenue    = reservations
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    const totalAll   = reservations.length;

    const statsGrid = document.getElementById('stats-grid');
    if (statsGrid) {
      statsGrid.innerHTML = `
        <div class="stat-card">
          <div class="stat-card-label">Hoy</div>
          <div class="stat-card-value">${todayCount}</div>
          <div class="stat-card-sub">reservas</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Esta semana</div>
          <div class="stat-card-value">${weekCount}</div>
          <div class="stat-card-sub">reservas</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Ingresos</div>
          <div class="stat-card-value">${BUSINESS_CONFIG.currency}${revenue}</div>
          <div class="stat-card-sub">completadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Total</div>
          <div class="stat-card-value">${totalAll}</div>
          <div class="stat-card-sub">reservas</div>
        </div>
      `;
    }

    // ── Bar chart: last 7 days ──
    const byDay = {};
    weekDays.forEach(d => byDay[d] = 0);
    reservations.forEach(r => {
      if (byDay[r.date] !== undefined) byDay[r.date]++;
    });

    const maxVal = Math.max(...Object.values(byDay), 1);
    const chart = document.getElementById('bar-chart');
    if (chart) {
      chart.innerHTML = weekDays.map(day => {
        const val = byDay[day];
        const pct = Math.round((val / maxVal) * 100);
        return `
          <div class="bar-item">
            <div class="bar-fill" style="height:${pct}%" data-value="${val}" title="${val} reservas"></div>
            <div class="bar-label">${shortDate(day)}</div>
          </div>
        `;
      }).join('');
    }

    // ── Top Barber ──
    const barberCounts = {};
    reservations.forEach(r => {
      barberCounts[r.barberId] = (barberCounts[r.barberId] || 0) + 1;
    });
    const topBarberId = Object.entries(barberCounts).sort((a, b) => b[1] - a[1])[0];
    if (topBarberId) {
      const barber = barbers.find(b => b.id === topBarberId[0]);
      document.getElementById('top-barber-name').textContent = barber?.name || '—';
      document.getElementById('top-barber-count').textContent = `${topBarberId[1]} reservas`;
    }

    // ── Top Service ──
    const serviceCounts = {};
    reservations.forEach(r => {
      serviceCounts[r.serviceId] = (serviceCounts[r.serviceId] || 0) + 1;
    });
    const topServiceId = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];
    if (topServiceId) {
      const service = services.find(s => s.id === topServiceId[0]);
      document.getElementById('top-service-name').textContent = service?.name || '—';
      document.getElementById('top-service-count').textContent = `${topServiceId[1]} veces`;
    }
  };

  return { render };
})();
