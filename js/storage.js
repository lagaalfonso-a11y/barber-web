/* ============================================================
   storage.js — Capa de datos (localStorage)
   Todos los keys con namespace por businessId
   ============================================================ */

const Storage = (() => {
  const ns = () => BUSINESS_CONFIG.businessId;

  const key = (entity) => `${ns()}:${entity}`;

  const get = (entity) => {
    try {
      const raw = localStorage.getItem(key(entity));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const set = (entity, value) => {
    localStorage.setItem(key(entity), JSON.stringify(value));
  };

  // ── Barbers ──
  const getBarbers = () => get('barbers') || [];
  const saveBarbers = (barbers) => set('barbers', barbers);

  const saveBarber = (barber) => {
    const list = getBarbers();
    const idx = list.findIndex(b => b.id === barber.id);
    if (idx >= 0) list[idx] = barber;
    else list.push(barber);
    saveBarbers(list);
    return barber;
  };

  const deleteBarber = (id) => {
    saveBarbers(getBarbers().filter(b => b.id !== id));
  };

  const getBarberById = (id) => getBarbers().find(b => b.id === id) || null;

  // ── Services ──
  const getServices = () => get('services') || [];
  const saveServices = (services) => set('services', services);

  const saveService = (service) => {
    const list = getServices();
    const idx = list.findIndex(s => s.id === service.id);
    if (idx >= 0) list[idx] = service;
    else list.push(service);
    saveServices(list);
    return service;
  };

  const deleteService = (id) => {
    saveServices(getServices().filter(s => s.id !== id));
  };

  const getServiceById = (id) => getServices().find(s => s.id === id) || null;

  // ── Reservations ──
  const getReservations = () => get('reservations') || [];
  const saveReservations = (reservations) => set('reservations', reservations);

  const saveReservation = (reservation) => {
    const list = getReservations();
    const idx = list.findIndex(r => r.id === reservation.id);
    if (idx >= 0) list[idx] = reservation;
    else list.push(reservation);
    saveReservations(list);
    return reservation;
  };

  const deleteReservation = (id) => {
    saveReservations(getReservations().filter(r => r.id !== id));
  };

  const getReservationById = (id) => getReservations().find(r => r.id === id) || null;

  // ── Blocks ──
  const getBlocks = () => get('blocks') || [];
  const saveBlocks = (blocks) => set('blocks', blocks);

  const saveBlock = (block) => {
    const list = getBlocks();
    const idx = list.findIndex(b => b.id === block.id);
    if (idx >= 0) list[idx] = block;
    else list.push(block);
    saveBlocks(list);
    return block;
  };

  const deleteBlock = (id) => {
    saveBlocks(getBlocks().filter(b => b.id !== id));
  };

  // ── Helpers ──
  const isInitialized = () => !!get('initialized');
  const markInitialized = () => set('initialized', true);

  const generateId = (prefix) => {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 6);
    return `${prefix}_${ts}${rand}`;
  };

  return {
    get, set,
    getBarbers, saveBarbers, saveBarber, deleteBarber, getBarberById,
    getServices, saveServices, saveService, deleteService, getServiceById,
    getReservations, saveReservations, saveReservation, deleteReservation, getReservationById,
    getBlocks, saveBlocks, saveBlock, deleteBlock,
    isInitialized, markInitialized,
    generateId
  };
})();
