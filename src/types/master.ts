export type Service = {
  id: number;
  name: string;
  price: string;
  duration: string;
  category: string;
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
  publicCategories: string[];
  services: Service[];
};