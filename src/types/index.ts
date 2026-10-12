export type Location = {
  id: string;
  location_name: string;
  order_number?: number;
  district: string | null;
  taluk: string | null;
  area: string | null;
  is_default: boolean;
  created_at: string;
};

export type Shop = {
  id: string;
  shop_name: string;
  contact_person: string | null;
  mobile_number: string;
  location_id: string | null;
  full_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  location?: Location; // joined data
};
