/* ============================================================
   admin/barbers-crud.js — CRUD de barberos
   ============================================================ */

const BarbersCRUD = (() => {

  const render = () => {
    const tbody = document.getElementById('barbers-tbody');
    if (!tbody) return;
    const barbers = Storage.getBarbers().sort((a, b) => a.order - b.order);

    if (barbers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">✂</div><div class="empty-state-text">No hay barberos registrados</div></div></td></tr>`;
      return;
    }

    tbody.innerHTML = barbers.map(b => `
      <tr>
        <td>
          ${b.photo
            ? `<img class="table-photo" src="${b.photo}" alt="${b.name}" />`
            : `<div class="table-photo-placeholder">✂</div>`}
        </td>
        <td><strong>${b.name}</strong></td>
        <td style="color:var(--color-gray)">${b.specialty}</td>
        <td style="color:var(--color-gray);font-size:0.8rem">${b.whatsapp}</td>
        <td style="text-align:center">${b.order}</td>
        <td>
          <span style="color:${b.active ? '#74C69D' : '#E74C3C'}">${b.active ? '✓ Activo' : '✗ Inactivo'}</span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" onclick="BarbersCRUD.openEdit('${b.id}')" title="Editar">✏</button>
            <button class="btn-icon danger" onclick="BarbersCRUD.remove('${b.id}')" title="Eliminar">🗑</button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  const getForm = (barber = null) => `
    <form id="barber-form" novalidate>
      <div class="form-group">
        <label class="form-label">Foto del barbero</label>
        <input type="file" accept="image/*" id="barber-photo-file" style="color:var(--color-gray);font-size:0.85rem;width:100%" />
        ${barber?.photo ? `<img src="${barber.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-top:0.5rem" />` : ''}
        <input type="hidden" id="barber-photo-data" value="${barber?.photo || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Nombre *</label>
        <input class="form-control" type="text" id="barber-name" value="${barber?.name || ''}" required />
      </div>
      <div class="form-group">
        <label class="form-label">Especialidad *</label>
        <input class="form-control" type="text" id="barber-specialty" value="${barber?.specialty || ''}" placeholder="Ej: Fade clásico" required />
      </div>
      <div class="form-group">
        <label class="form-label">WhatsApp (sin +) *</label>
        <input class="form-control" type="tel" id="barber-wa" value="${barber?.whatsapp || ''}" placeholder="16195550001" required />
      </div>
      <div class="form-group">
        <label class="form-label">Orden de visualización</label>
        <input class="form-control" type="number" id="barber-order" value="${barber?.order || 1}" min="1" />
      </div>
      <div class="form-group">
        <label class="form-label" style="display:flex;align-items:center;gap:0.5rem;cursor:pointer">
          <input type="checkbox" id="barber-active" ${barber?.active !== false ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--color-accent)" />
          Barbero activo
        </label>
      </div>
      <div style="display:flex;gap:0.75rem;margin-top:1rem">
        <button type="submit" class="btn btn-primary" style="flex:1">${barber ? 'Guardar cambios' : 'Agregar barbero'}</button>
        <button type="button" class="btn btn-ghost" onclick="AdminModal.close()">Cancelar</button>
      </div>
    </form>
  `;

  const bindForm = (barberId = null) => {
    // Photo preview
    document.getElementById('barber-photo-file')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById('barber-photo-data').value = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('barber-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name     = document.getElementById('barber-name').value.trim();
      const specialty = document.getElementById('barber-specialty').value.trim();
      const wa       = document.getElementById('barber-wa').value.trim();

      if (!name || !specialty || !wa) {
        UI.toast('Error', 'Completa todos los campos requeridos', 'error');
        return;
      }

      const barber = {
        id:        barberId || Storage.generateId('barber'),
        name,
        specialty,
        whatsapp:  wa,
        photo:     document.getElementById('barber-photo-data').value,
        order:     parseInt(document.getElementById('barber-order').value) || 1,
        active:    document.getElementById('barber-active').checked
      };

      Storage.saveBarber(barber);
      AdminModal.close();
      render();
      UI.toast('Listo', barberId ? 'Barbero actualizado' : 'Barbero agregado', 'success');
    });
  };

  const openAdd = () => {
    AdminModal.open('Agregar Barbero', getForm());
    bindForm();
  };

  const openEdit = (id) => {
    const barber = Storage.getBarberById(id);
    if (!barber) return;
    AdminModal.open('Editar Barbero', getForm(barber));
    bindForm(id);
  };

  const remove = (id) => {
    if (!confirm('¿Eliminar este barbero?')) return;
    Storage.deleteBarber(id);
    render();
    UI.toast('Eliminado', 'Barbero eliminado', 'info');
  };

  const init = () => {
    document.getElementById('add-barber-btn')?.addEventListener('click', openAdd);
    render();
  };

  return { init, render, openEdit, remove };
})();
