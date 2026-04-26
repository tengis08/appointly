export type Service = {
  id: number;
  name: string;
  price: string;
  duration: string;
  category: string;
};

export type WorkingDay = {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  start: string; // "10:00"
  end: string;   // "18:00"
};

export type MasterProfile = {
  slug: string;
  name: string;
  about?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  photoUrl?: string | null;
  bookingEmail?: string | null;
  publicCategories: string[];
  slotStepMinutes: number;
  workingDays: WorkingDay[];
  services: Service[];
};