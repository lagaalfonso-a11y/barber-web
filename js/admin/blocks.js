/* ============================================================
   admin/blocks.js — Bloqueos manuales de horarios
   ============================================================ */

const BlocksMgr = (() => {

  const render = () => {
    const tbody = document.getElementById('blocks-tbody');
    if (!tbody) return;
    const blocks  = Storage.getBlocks();
    const barbers = Storage.getBarbers();

    if (blocks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">🚫</div><div class="empty-state-text">No hay bloqueos configurados</div></div></td></tr>`;
      return;
    }

    blocks.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

    tbody.innerHTML = blocks.map(b => {
      const barber = b.barberId ? barbers.find(bar => bar.id === b.barberId) : null;
      return `
        <tr>
          <td>${barber ? barber.name : '<em style="color:var(--color-gray)">Todos</em>'}</td>
          <td>${b.date}</td>
          <td>${b.startTime}</td>
          <td>${b.endTime}</td>
          <td style="color:var(--color-gray)">${b.reason || '—'}</td>
          <td>
            <button class="btn-icon danger" onclick="BlocksMgr.remove('${b.id}')" title="Eliminar">🗑</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  const getForm = () => {
    const barbers = Storage.getBarbers().filter(b => b.active);
    const today   = new Date().toISOString().split('T')[0];

    return `
      <form id="block-form" novalidate>
        <div class="form-group">
          <label class="form-label">Barbero</label>
          <select class="form-control" id="block-barber">
            <option value="">— Todos los barberos —</option>
            ${barbers.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha *</label>
          <input class="form-control" type="date" id="block-date" min="${today}" required />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="form-group">
            <label class="form-label">Desde *</label>
            <input class="form-control" type="time" id="block-start" value="10:00" required />
          </div>
          <div class="form-group">
            <label class="form-label">Hasta *</label>
            <input class="form-control" type="time" id="block-end" value="11:00" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Motivo (opcional)</label>
          <input class="form-control" type="text" id="block-reason" placeholder="Ej: Descanso, mantenimiento..." />
        </div>
        <div style="display:flex;gap:0.75rem;margin-top:1rem">
          <button type="submit" class="btn btn-primary" style="flex:1">Guardar bloqueo</button>
          <button type="button" class="btn btn-ghost" onclick="AdminModal.close()">Cancelar</button>
        </div>
      </form>
    `;
  };

  const openAdd = () => {
    AdminModal.open('Nuevo Bloqueo', getForm());
    document.getElementById('block-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const date  = document.getElementById('block-date').value;
      const start = document.getElementById('block-start').value;
      const end   = document.getElementById('block-end').value;

      if (!date || !start || !end) {
        UI.toast('Error', 'Completa fecha, inicio y fin', 'error');
        return;
      }

      if (start >= end) {
        UI.toast('Error', 'La hora de inicio debe ser anterior al fin', 'error');
        return;
      }

      const block = {
        id:        Storage.generateId('block'),
        barberId:  document.getElementById('block-barber').value || null,
        date,
        startTime: start,
        endTime:   end,
        reason:    document.getElementById('block-reason').value.trim()
      };

      Storage.saveBlock(block);
      AdminModal.close();
      render();
      UI.toast('Listo', 'Bloqueo creado', 'success');
    });
  };

  const remove = (id) => {
    if (!confirm('¿Eliminar este bloqueo?')) return;
    Storage.deleteBlock(id);
    render();
    UI.toast('Eliminado', 'Bloqueo eliminado', 'info');
  };

  const init = () => {
    document.getElementById('add-block-btn')?.addEventListener('click', openAdd);
    render();
  };

  return { init, render, remove };
})();
