export type Service = {
  id: number;
  name: string;
  price: string;
  duration: string;
};

export type MasterProfile = {
  slug: string;
  name: string;
  about?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  photoUrl?: string | null;
  services: Service[];
};