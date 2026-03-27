/* ============================================================
   availability.js — Motor de disponibilidad de horarios
   ============================================================ */

const Availability = (() => {

  // Convierte "HH:MM" a minutos desde medianoche
  const toMin = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // Convierte minutos a "HH:MM"
  const toTime = (min) => {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  // Suma minutos a un string de tiempo
  const addMin = (time, minutes) => toTime(toMin(time) + minutes);

  // Genera grilla de slots
  const buildGrid = (open, close, interval) => {
    const slots = [];
    let cur = toMin(open);
    const end = toMin(close);
    while (cur < end) {
      slots.push(toTime(cur));
      cur += interval;
    }
    return slots;
  };

  // Obtiene rangos ocupados para un barbero en una fecha
  const getOccupiedRanges = (barberId, date) => {
    const ranges = [];

    // Reservas activas
    Storage.getReservations()
      .filter(r => r.barberId === barberId && r.date === date && r.status !== 'cancelled')
      .forEach(r => ranges.push({ start: toMin(r.startTime), end: toMin(r.endTime) }));

    // Bloqueos manuales
    Storage.getBlocks()
      .filter(b => (b.barberId === barberId || b.barberId === null) && b.date === date)
      .forEach(b => ranges.push({ start: toMin(b.startTime), end: toMin(b.endTime) }));

    return ranges;
  };

  // Verifica si dos rangos se solapan
  const overlaps = (aStart, aEnd, bStart, bEnd) =>
    aStart < bEnd && aEnd > bStart;

  // Retorna slots disponibles como array de strings "HH:MM"
  const getAvailableSlots = (barberId, date, durationMinutes) => {
    const cfg = BUSINESS_CONFIG.hours;
    const grid = buildGrid(cfg.open, cfg.close, cfg.slotInterval);
    const closeMin = toMin(cfg.close);
    const occupied = getOccupiedRanges(barberId, date);

    return grid.filter(slot => {
      const start = toMin(slot);
      const end   = start + durationMinutes;

      // Must end before or at closing
      if (end > closeMin) return false;

      // Must not overlap any occupied range
      return !occupied.some(occ => overlaps(start, end, occ.start, occ.end));
    });
  };

  // Verifica si un slot específico está libre
  const isSlotFree = (barberId, date, startTime, durationMinutes) => {
    const slots = getAvailableSlots(barberId, date, durationMinutes);
    return slots.includes(startTime);
  };

  // Verifica si la fecha está en un día de apertura
  const isDayOpen = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return BUSINESS_CONFIG.hours.daysOpen.includes(d.getDay());
  };

  return {
    getAvailableSlots,
    isSlotFree,
    getOccupiedRanges,
    isDayOpen,
    toMin,
    toTime,
    addMin
  };
})();
