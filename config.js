// ============================================================
// config.js — WHITE-LABEL CONFIG
// Para un nuevo cliente: edita SOLO este archivo + reemplaza imágenes
// ============================================================

const BUSINESS_CONFIG = {
  businessId: "Tokio CH Barber ",
  name: "Tokio CH Barber",
  tagline: "Estilo, precisión y confianza en cada corte",
  phone: "56956854652",
  address: "San Diego 161, Santiago Centro",
  instagram: "@tokioch_dj",
  adminPassword: "pruebadedios123",

  currency: "$",
  locale: "es",

  hours: {
    open: "10:00",
    close: "20:00",
    slotInterval: 15,
    daysOpen: [1, 2, 3, 4, 5, 6] // 0=Dom, 6=Sáb
  },

  theme: {
    primary: "#1A3A52",
    accent: "#D4A574",
    gray: "#7BA3BF",
    light: "#FFFFFF",
    surface: "#0D2438",
    surface2: "#152E42",
    border: "#1E3D54"
  },

  whatsapp: {
    defaultNumber: "56956854652",
    bookingMessage: "Hola, soy {name}. Reservé {service} con {barber} para el {date} a las {time}.",
    reminderMessage: "Recordatorio: Tu cita en {business} es mañana {date} a las {time}. ¡Te esperamos!"
  },

  // Datos semilla — se cargan a localStorage solo la primera vez
  seedBarbers: [
    {
      id: "barber_001",
      name: "Carlos Mendoza",
      specialty: "Fade clásico & degradados",
      photo: "",
      whatsapp: "56956854652",
      active: true,
      order: 1
    },
    {
      id: "barber_002",
      name: "Diego Ramírez",
      specialty: "Cortes modernos & diseños",
      photo: "",
      whatsapp: "56912345002",
      active: true,
      order: 2
    },
    {
      id: "barber_003",
      name: "Andrés Torres",
      specialty: "Barba & afeitado clásico",
      photo: "",
      whatsapp: "56912345003",
      active: true,
      order: 3
    },
    {
      id: "barber_004",
      name: "Miguel Sánchez",
      specialty: "Skin fade & texturizados",
      photo: "",
      whatsapp: "56912345004",
      active: true,
      order: 4
    },
    {
      id: "barber_005",
      name: "Luis Herrera",
      specialty: "Cortes infantiles & familiares",
      photo: "",
      whatsapp: "56912345005",
      active: true,
      order: 5
    }
  ],

  seedServices: [
    {
      id: "service_001",
      name: "Corte Clásico",
      price: 25,
      duration: 30,
      category: "corte",
      description: "Tijera y máquina con acabado perfecto",
      active: true,
      upsells: ["service_004", "service_005"]
    },
    {
      id: "service_002",
      name: "Fade / Degradado",
      price: 30,
      duration: 45,
      category: "corte",
      description: "Degradado suave con máquina, look moderno",
      active: true,
      upsells: ["service_004", "service_005"]
    },
    {
      id: "service_003",
      name: "Skin Fade",
      price: 35,
      duration: 50,
      category: "corte",
      description: "Degradado al cero, definición máxima",
      active: true,
      upsells: ["service_004", "service_006"]
    },
    {
      id: "service_004",
      name: "Arreglo de Barba",
      price: 15,
      duration: 20,
      category: "barba",
      description: "Perfilado y arreglo profesional de barba",
      active: true,
      upsells: []
    },
    {
      id: "service_005",
      name: "Afeitado Clásico",
      price: 20,
      duration: 25,
      category: "barba",
      description: "Afeitado con navaja y toalla caliente",
      active: true,
      upsells: []
    },
    {
      id: "service_006",
      name: "Tratamiento Capilar",
      price: 20,
      duration: 20,
      category: "tratamiento",
      description: "Hidratación y nutrición profunda del cuero cabelludo",
      active: true,
      upsells: []
    },
    {
      id: "service_007",
      name: "Corte + Barba",
      price: 38,
      duration: 55,
      category: "combo",
      description: "Combo completo: corte clásico y arreglo de barba",
      active: true,
      upsells: ["service_006"]
    },
    {
      id: "service_008",
      name: "Corte Infantil",
      price: 18,
      duration: 25,
      category: "corte",
      description: "Corte especial para niños hasta 12 años",
      active: true,
      upsells: []
    }
  ]
};
