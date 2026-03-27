/* ============================================================
   admin/services-crud.js — CRUD de servicios
   ============================================================ */

const ServicesCRUD = (() => {

  const categories = [
    { value: 'corte', label: 'Corte' },
    { value: 'barba', label: 'Barba' },
    { value: 'tratamiento', label: 'Tratamiento' },
    { value: 'combo', label: 'Combo' }
  ];

  const render = () => {
    const tbody = document.getElementById('services-tbody');
    if (!tbody) return;
    const services = Storage.getServices();

    if (services.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">✂</div><div class="empty-state-text">No hay servicios registrados</div></div></td></tr>`;
      return;
    }

    const catLabel = { corte: 'Corte', barba: 'Barba', tratamiento: 'Tratamiento', combo: 'Combo' };

    tbody.innerHTML = services.map(s => `
      <tr>
        <td><strong>${s.name}</strong><br/><span style="color:var(--color-gray);font-size:0.78rem">${s.description}</span></td>
        <td><span class="service-category-badge badge-${s.category}">${catLabel[s.category] || s.category}</span></td>
        <td><strong>${BUSINESS_CONFIG.currency}${s.price}</strong></td>
        <td>${s.duration} min</td>
        <td><span style="color:${s.active ? '#74C69D' : '#E74C3C'}">${s.active ? '✓' : '✗'}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" onclick="ServicesCRUD.openEdit('${s.id}')" title="Editar">✏</button>
            <button class="btn-icon danger" onclick="ServicesCRUD.remove('${s.id}')" title="Eliminar">🗑</button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  const getForm = (service = null) => {
    const allServices = Storage.getServices();
    const otherServices = service
      ? allServices.filter(s => s.id !== service.id)
      : allServices;

    return `
      <form id="service-form" novalidate>
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input class="form-control" type="text" id="svc-name" value="${service?.name || ''}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Descripción</label>
          <input class="form-control" type="text" id="svc-desc" value="${service?.description || ''}" placeholder="Breve descripción del servicio" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="form-group">
            <label class="form-label">Precio (${BUSINESS_CONFIG.currency}) *</label>
            <input class="form-control" type="number" id="svc-price" value="${service?.price || ''}" min="0" step="0.01" required />
          </div>
          <div class="form-group">
            <label class="form-label">Duración (min) *</label>
            <input class="form-control" type="number" id="svc-duration" value="${service?.duration || ''}" min="5" step="5" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Categoría *</label>
          <select class="form-control" id="svc-category" required>
            ${categories.map(c => `<option value="${c.value}" ${service?.category === c.value ? 'selected' : ''}>${c.label}</option>`).join('')}
          </select>
        </div>
        ${otherServices.length > 0 ? `
        <div class="form-group">
          <label class="form-label">Upsells (complementos a sugerir)</label>
          <div style="display:flex;flex-direction:column;gap:0.4rem;max-height:150px;overflow-y:auto;padding:0.5rem;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md)">
            ${otherServices.map(u => `
              <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.85rem">
                <input type="checkbox" value="${u.id}" class="upsell-check"
                  ${(service?.upsells || []).includes(u.id) ? 'checked' : ''}
                  style="accent-color:var(--color-accent)" />
                ${u.name} (+${BUSINESS_CONFIG.currency}${u.price})
              </label>
            `).join('')}
          </div>
        </div>
        ` : ''}
        <div class="form-group">
          <label class="form-label" style="display:flex;align-items:center;gap:0.5rem;cursor:pointer">
            <input type="checkbox" id="svc-active" ${service?.active !== false ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--color-accent)" />
            Servicio activo
          </label>
        </div>
        <div style="display:flex;gap:0.75rem;margin-top:1rem">
          <button type="submit" class="btn btn-primary" style="flex:1">${service ? 'Guardar cambios' : 'Agregar servicio'}</button>
          <button type="button" class="btn btn-ghost" onclick="AdminModal.close()">Cancelar</button>
        </div>
      </form>
    `;
  };

  const bindForm = (serviceId = null) => {
    document.getElementById('service-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name     = document.getElementById('svc-name').value.trim();
      const price    = parseFloat(document.getElementById('svc-price').value);
      const duration = parseInt(document.getElementById('svc-duration').value);

      if (!name || isNaN(price) || isNaN(duration)) {
        UI.toast('Error', 'Completa nombre, precio y duración', 'error');
        return;
      }

      const upsells = [...document.querySelectorAll('.upsell-check:checked')].map(c => c.value);

      const service = {
        id:          serviceId || Storage.generateId('service'),
        name,
        description: document.getElementById('svc-desc').value.trim(),
        price,
        duration,
        category:    document.getElementById('svc-category').value,
        upsells,
        active:      document.getElementById('svc-active').checked
      };

      Storage.saveService(service);
      AdminModal.close();
      render();
      UI.toast('Listo', serviceId ? 'Servicio actualizado' : 'Servicio agregado', 'success');
    });
  };

  const openAdd = () => {
    AdminModal.open('Agregar Servicio', getForm());
    bindForm();
  };

  const openEdit = (id) => {
    const service = Storage.getServiceById(id);
    if (!service) return;
    AdminModal.open('Editar Servicio', getForm(service));
    bindForm(id);
  };

  const remove = (id) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    Storage.deleteService(id);
    render();
    UI.toast('Eliminado', 'Servicio eliminado', 'info');
  };

  const init = () => {
    document.getElementById('add-service-btn')?.addEventListener('click', openAdd);
    render();
  };

  return { init, render, openEdit, remove };
})();
