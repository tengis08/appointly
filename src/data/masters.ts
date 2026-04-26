import type { MasterProfile } from "@/types/master";

const mondayToSaturday: MasterProfile["workingDays"] = [
  { dayOfWeek: 1, start: "10:00", end: "18:00" },
  { dayOfWeek: 2, start: "10:00", end: "18:00" },
  { dayOfWeek: 3, start: "10:00", end: "18:00" },
  { dayOfWeek: 4, start: "10:00", end: "18:00" },
  { dayOfWeek: 5, start: "10:00", end: "18:00" },
  { dayOfWeek: 6, start: "10:00", end: "18:00" },
];

const mondayToFriday: MasterProfile["workingDays"] = [
  { dayOfWeek: 1, start: "10:00", end: "18:00" },
  { dayOfWeek: 2, start: "10:00", end: "18:00" },
  { dayOfWeek: 3, start: "10:00", end: "18:00" },
  { dayOfWeek: 4, start: "10:00", end: "18:00" },
  { dayOfWeek: 5, start: "10:00", end: "18:00" },
];

const tuesdayToSunday: MasterProfile["workingDays"] = [
  { dayOfWeek: 0, start: "11:00", end: "19:00" },
  { dayOfWeek: 2, start: "11:00", end: "19:00" },
  { dayOfWeek: 3, start: "11:00", end: "19:00" },
  { dayOfWeek: 4, start: "11:00", end: "19:00" },
  { dayOfWeek: 5, start: "11:00", end: "19:00" },
  { dayOfWeek: 6, start: "11:00", end: "19:00" },
];

export const masters: Record<string, MasterProfile> = {
  anna: {
    slug: "anna",
    name: "Anna Petrova",
    about:
      "Licensed beauty master in Brooklyn. I specialize in nail services and clean, elegant results.",
    phone: "+17185551234",
    whatsapp: "+17185551234",
    address: "Brooklyn, NY",
    city: "Brooklyn",
    neighborhood: "Brighton Beach",
    photoUrl: null,
    bookingEmail: "appointly@yahoo.com",
    publicCategories: ["manicure", "pedicure"],
    slotStepMinutes: 30,
    workingDays: mondayToSaturday,
    services: [
      {
        id: 1,
        name: "Classic Manicure",
        price: "$45",
        duration: "60 min",
        category: "manicure",
      },
      {
        id: 2,
        name: "Gel Manicure",
        price: "$60",
        duration: "75 min",
        category: "manicure",
      },
      {
        id: 3,
        name: "Pedicure",
        price: "$70",
        duration: "75 min",
        category: "pedicure",
      },
    ],
  },

  lina: {
    slug: "lina",
    name: "Lina Garcia",
    about:
      "Hair stylist offering cuts, color touch-ups, and personalized appointments in a private studio.",
    phone: "+17185550001",
    whatsapp: "+17185550001",
    address: "Queens, NY",
    city: "Queens",
    neighborhood: "Astoria",
    photoUrl: null,
    bookingEmail: "appointly@yahoo.com",
    publicCategories: ["haircut", "hair coloring"],
    slotStepMinutes: 30,
    workingDays: mondayToSaturday,
    services: [
      {
        id: 1,
        name: "Women’s Haircut",
        price: "$70",
        duration: "60 min",
        category: "haircut",
      },
      {
        id: 2,
        name: "Root Touch-Up",
        price: "$120",
        duration: "120 min",
        category: "hair coloring",
      },
      {
        id: 3,
        name: "Haircut + Blowout",
        price: "$95",
        duration: "90 min",
        category: "haircut",
      },
    ],
  },

  maya: {
    slug: "maya",
    name: "Maya Lee",
    about:
      "Lash artist focused on natural and volume sets. Cozy private studio and careful work.",
    phone: "+17185550002",
    whatsapp: null,
    address: "Brooklyn, NY",
    city: "Brooklyn",
    neighborhood: "Sheepshead Bay",
    photoUrl: null,
    bookingEmail: "appointly@yahoo.com",
    publicCategories: ["lashes"],
    slotStepMinutes: 30,
    workingDays: tuesdayToSunday,
    services: [
      {
        id: 1,
        name: "Classic Lashes",
        price: "$110",
        duration: "120 min",
        category: "lashes",
      },
      {
        id: 2,
        name: "Volume Lashes",
        price: "$140",
        duration: "150 min",
        category: "lashes",
      },
    ],
  },

  sara: {
    slug: "sara",
    name: "Sara Kim",
    about:
      "Massage therapist with a quiet studio and flexible scheduling for wellness-focused sessions.",
    phone: "+17185550003",
    whatsapp: "+17185550003",
    address: "Manhattan, NY",
    city: "Manhattan",
    neighborhood: "SoHo",
    photoUrl: null,
    bookingEmail: "appointly@yahoo.com",
    publicCategories: ["massage"],
    slotStepMinutes: 30,
    workingDays: mondayToFriday,
    services: [
      {
        id: 1,
        name: "Relax Massage",
        price: "$120",
        duration: "60 min",
        category: "massage",
      },
      {
        id: 2,
        name: "Deep Tissue Massage",
        price: "$150",
        duration: "75 min",
        category: "massage",
      },
    ],
  },

  elena: {
    slug: "elena",
    name: "Elena Morozova",
    about:
      "Nail and beauty specialist working with clients who want detailed and clean results.",
    phone: "+17185550004",
    whatsapp: null,
    address: "Brooklyn, NY",
    city: "Brooklyn",
    neighborhood: "Midwood",
    photoUrl: null,
    bookingEmail: "appointly@yahoo.com",
    publicCategories: ["manicure", "pedicure"],
    slotStepMinutes: 30,
    workingDays: mondayToSaturday,
    services: [
      {
        id: 1,
        name: "Russian Manicure",
        price: "$65",
        duration: "90 min",
        category: "manicure",
      },
      {
        id: 2,
        name: "Pedicure",
        price: "$75",
        duration: "75 min",
        category: "pedicure",
      },
    ],
  },

  diana: {
    slug: "diana",
    name: "Diana Flores",
    about:
      "Brow and lash specialist helping clients with shaping, tint, and natural enhancement.",
    phone: "+17185550005",
    whatsapp: "+17185550005",
    address: "Manhattan, NY",
    city: "Manhattan",
    neighborhood: "Chinatown",
    photoUrl: null,
    bookingEmail: "appointly@yahoo.com",
    publicCategories: ["lashes", "brows"],
    slotStepMinutes: 30,
    workingDays: tuesdayToSunday,
    services: [
      {
        id: 1,
        name: "Brow Shaping",
        price: "$40",
        duration: "30 min",
        category: "brows",
      },
      {
        id: 2,
        name: "Lash Lift",
        price: "$95",
        duration: "60 min",
        category: "lashes",
      },
    ],
  },

  viktoria: {
    slug: "viktoria",
    name: "Viktoria Green",
    about:
      "Hair and styling services for busy clients who want practical appointments and consistent quality.",
    phone: "+17185550006",
    whatsapp: null,
    address: "Brooklyn, NY",
    city: "Brooklyn",
    neighborhood: "Bensonhurst",
    photoUrl: null,
    bookingEmail: "appointly@yahoo.com",
    publicCategories: ["haircut"],
    slotStepMinutes: 30,
    workingDays: mondayToSaturday,
    services: [
      {
        id: 1,
        name: "Haircut",
        price: "$55",
        duration: "45 min",
        category: "haircut",
      },
      {
        id: 2,
        name: "Hair Styling",
        price: "$65",
        duration: "60 min",
        category: "haircut",
      },
    ],
  },

  milena: {
    slug: "milena",
    name: "Milena White",
    about:
      "Beauty specialist serving local clients in a private room near the waterfront.",
    phone: "+17185550007",
    whatsapp: "+17185550007",
    address: "Brooklyn, NY",
    city: "Brooklyn",
    neighborhood: "Gravesend",
    photoUrl: null,
    bookingEmail: "appointly@yahoo.com",
    publicCategories: ["pedicure", "manicure"],
    slotStepMinutes: 30,
    workingDays: mondayToSaturday,
    services: [
      {
        id: 1,
        name: "Gel Manicure",
        price: "$58",
        duration: "75 min",
        category: "manicure",
      },
      {
        id: 2,
        name: "Spa Pedicure",
        price: "$80",
        duration: "90 min",
        category: "pedicure",
      },
    ],
  },
};