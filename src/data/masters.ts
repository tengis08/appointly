import type { MasterProfile } from "@/types/master";

export const masters: Record<string, MasterProfile> = {
  anna: {
    slug: "anna",
    name: "Anna Petrova",
    about:
      "Licensed beauty master in Brooklyn. I specialize in nail services and clean, elegant results.",
    phone: "+17185551234",
    whatsapp: "+17185551234",
    address: "Brooklyn, NY",
    photoUrl: null,
    services: [
      { id: 1, name: "Classic Manicure", price: "$45", duration: "60 min" },
      { id: 2, name: "Gel Manicure", price: "$60", duration: "75 min" },
      { id: 3, name: "Manicure + Removal", price: "$75", duration: "90 min" },
    ],
  },
  lina: {
    slug: "lina",
    name: "Lina Garcia",
    about:
      "Hair stylist offering cuts, color touch-ups, and personalized appointments in a private studio.",
    phone: null,
    whatsapp: null,
    address: "Queens, NY",
    photoUrl: null,
    services: [
      { id: 1, name: "Women’s Haircut", price: "$70", duration: "60 min" },
      { id: 2, name: "Root Touch-Up", price: "$120", duration: "120 min" },
      { id: 3, name: "Haircut + Blowout", price: "$95", duration: "90 min" },
    ],
  },
};