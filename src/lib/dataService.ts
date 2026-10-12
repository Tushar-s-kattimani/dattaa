import type { Location, Shop } from '../types';

const DEFAULT_INITIAL_LOCATIONS: Location[] = [
  { id: 'loc-1', location_name: 'Main Market', order_number: 1, district: 'Central', taluk: 'City', area: 'Commercial Zone', is_default: true, created_at: new Date().toISOString() },
  { id: 'loc-2', location_name: 'Gandhi Road', order_number: 2, district: 'North', taluk: 'North Zone', area: 'Shopping Complex', is_default: false, created_at: new Date().toISOString() },
  { id: 'loc-3', location_name: 'Station Square', order_number: 3, district: 'South', taluk: 'Railway Division', area: 'Station Road', is_default: false, created_at: new Date().toISOString() },
];

export const dataService = {
  isCloudConnected: async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.connected);
    } catch {
      return false;
    }
  },

  // Locations
  getLocations: async (): Promise<Location[]> => {
    try {
      const res = await fetch('/api/locations');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch locations');
      }
      const data: Location[] = await res.json();
      // Cache in local storage
      localStorage.setItem('shop_manager_locations', JSON.stringify(data));
      return data;
    } catch (err: any) {
      console.warn('API error, reading local fallback:', err);
      const raw = localStorage.getItem('shop_manager_locations');
      if (!raw) {
        localStorage.setItem('shop_manager_locations', JSON.stringify(DEFAULT_INITIAL_LOCATIONS));
        return DEFAULT_INITIAL_LOCATIONS;
      }
      const locs: Location[] = JSON.parse(raw);
      return locs.sort((a, b) => (a.order_number ?? 9999) - (b.order_number ?? 9999) || a.location_name.localeCompare(b.location_name));
    }
  },

  saveLocation: async (
    formData: {
      location_name: string;
      order_number?: number;
      district?: string;
      taluk?: string;
      area?: string;
      is_default: boolean;
    },
    editingId?: string | null
  ): Promise<Location> => {
    try {
      const url = editingId ? `/api/locations/${editingId}` : '/api/locations';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save location');
      }

      return await res.json();
    } catch (err: any) {
      console.warn('API error, saving to local fallback:', err);
      const raw = localStorage.getItem('shop_manager_locations');
      let locs: Location[] = raw ? JSON.parse(raw) : [...DEFAULT_INITIAL_LOCATIONS];

      if (formData.is_default) {
        locs = locs.map(l => ({ ...l, is_default: false }));
      }

      let saved: Location;
      if (editingId) {
        locs = locs.map(l => {
          if (l.id === editingId) {
            saved = {
              ...l,
              ...formData,
              order_number: formData.order_number !== undefined ? Number(formData.order_number) : (l.order_number ?? 1)
            };
            return saved;
          }
          return l;
        });
        saved = locs.find(l => l.id === editingId)!;
      } else {
        const nextOrder = formData.order_number !== undefined ? Number(formData.order_number) : (locs.length + 1);
        saved = {
          id: 'loc_' + Date.now(),
          location_name: formData.location_name,
          order_number: nextOrder,
          district: formData.district ?? null,
          taluk: formData.taluk ?? null,
          area: formData.area ?? null,
          is_default: formData.is_default,
          created_at: new Date().toISOString()
        };
        locs.push(saved);
      }

      locs.sort((a, b) => (a.order_number ?? 9999) - (b.order_number ?? 9999) || a.location_name.localeCompare(b.location_name));
      localStorage.setItem('shop_manager_locations', JSON.stringify(locs));
      return saved;
    }
  },

  updateLocationOrders: async (orders: { id: string; order_number: number }[]): Promise<Location[]> => {
    try {
      const res = await fetch('/api/locations/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to reorder locations');
      }
      const data: Location[] = await res.json();
      localStorage.setItem('shop_manager_locations', JSON.stringify(data));
      return data;
    } catch (err: any) {
      console.warn('API error, reordering in local fallback:', err);
      const raw = localStorage.getItem('shop_manager_locations');
      let locs: Location[] = raw ? JSON.parse(raw) : [...DEFAULT_INITIAL_LOCATIONS];
      const orderMap = new Map(orders.map(o => [o.id, o.order_number]));
      locs = locs.map(loc => {
        if (orderMap.has(loc.id)) {
          return { ...loc, order_number: orderMap.get(loc.id)! };
        }
        return loc;
      });
      locs.sort((a, b) => (a.order_number ?? 9999) - (b.order_number ?? 9999) || a.location_name.localeCompare(b.location_name));
      localStorage.setItem('shop_manager_locations', JSON.stringify(locs));
      return locs;
    }
  },

  deleteLocation: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete location');
      }
    } catch (err: any) {
      console.warn('API error, deleting from local fallback:', err);
      const raw = localStorage.getItem('shop_manager_locations');
      if (raw) {
        const locs: Location[] = JSON.parse(raw);
        localStorage.setItem('shop_manager_locations', JSON.stringify(locs.filter(l => l.id !== id)));
      }
    }
  },

  // Shops
  getShops: async (): Promise<Shop[]> => {
    try {
      const res = await fetch('/api/shops');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch shops');
      }
      const data = await res.json();
      localStorage.setItem('shop_manager_shops', JSON.stringify(data));
      return data;
    } catch (err: any) {
      console.warn('API error, reading local fallback:', err);
      const raw = localStorage.getItem('shop_manager_shops');
      return raw ? JSON.parse(raw) : [];
    }
  },

  saveShop: async (shopData: {
    shop_name: string;
    contact_person?: string;
    mobile_number: string;
    location_id: string;
    full_address?: string;
    notes?: string;
  }): Promise<Shop> => {
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopData)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save shop');
      }

      return await res.json();
    } catch (err: any) {
      console.warn('API error, saving to local fallback:', err);
      const raw = localStorage.getItem('shop_manager_shops');
      const shops: Shop[] = raw ? JSON.parse(raw) : [];

      if (shops.some(s => s.mobile_number === shopData.mobile_number.trim())) {
        throw new Error('A shop with this mobile number already exists');
      }

      const rawLocs = localStorage.getItem('shop_manager_locations');
      const locs: Location[] = rawLocs ? JSON.parse(rawLocs) : [...DEFAULT_INITIAL_LOCATIONS];
      const loc = locs.find(l => l.id === shopData.location_id);

      const newShop: Shop = {
        id: 'shop_' + Date.now(),
        shop_name: shopData.shop_name,
        contact_person: shopData.contact_person ?? null,
        mobile_number: shopData.mobile_number,
        location_id: shopData.location_id ?? null,
        full_address: shopData.full_address ?? null,
        notes: shopData.notes ?? null,
        location: loc,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      shops.unshift(newShop);
      localStorage.setItem('shop_manager_shops', JSON.stringify(shops));
      return newShop;
    }
  },

  updateShop: async (
    id: string,
    shopData: {
      shop_name: string;
      contact_person?: string;
      mobile_number: string;
      location_id: string;
      full_address?: string;
      notes?: string;
    }
  ): Promise<Shop> => {
    try {
      const res = await fetch(`/api/shops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopData)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update shop');
      }

      const updatedShop: Shop = await res.json();
      const raw = localStorage.getItem('shop_manager_shops');
      if (raw) {
        const shops: Shop[] = JSON.parse(raw);
        localStorage.setItem(
          'shop_manager_shops',
          JSON.stringify(shops.map(s => (s.id === id ? updatedShop : s)))
        );
      }
      return updatedShop;
    } catch (err: any) {
      console.warn('API error, updating in local fallback:', err);
      const raw = localStorage.getItem('shop_manager_shops');
      const shops: Shop[] = raw ? JSON.parse(raw) : [];

      if (shops.some(s => s.id !== id && s.mobile_number === shopData.mobile_number.trim())) {
        throw new Error('A shop with this mobile number already exists');
      }

      const rawLocs = localStorage.getItem('shop_manager_locations');
      const locs: Location[] = rawLocs ? JSON.parse(rawLocs) : [...DEFAULT_INITIAL_LOCATIONS];
      const loc = locs.find(l => l.id === shopData.location_id);

      let updatedShop: Shop | null = null;
      const updatedList = shops.map(s => {
        if (s.id === id) {
          updatedShop = {
            ...s,
            shop_name: shopData.shop_name.trim(),
            mobile_number: shopData.mobile_number.trim(),
            location_id: shopData.location_id,
            contact_person: shopData.contact_person ?? s.contact_person,
            full_address: shopData.full_address ?? s.full_address,
            notes: shopData.notes ?? s.notes,
            location: loc,
            updated_at: new Date().toISOString()
          };
          return updatedShop;
        }
        return s;
      });

      if (!updatedShop) {
        throw new Error('Shop not found');
      }

      localStorage.setItem('shop_manager_shops', JSON.stringify(updatedList));
      return updatedShop;
    }
  },

  deleteShop: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/shops/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete shop');
      }
    } catch (err: any) {
      console.warn('API error, deleting from local fallback:', err);
      const raw = localStorage.getItem('shop_manager_shops');
      if (raw) {
        const shops: Shop[] = JSON.parse(raw);
        localStorage.setItem('shop_manager_shops', JSON.stringify(shops.filter(s => s.id !== id)));
      }
    }
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<{
    totalShops: number;
    totalLocations: number;
    shopsAddedToday: number;
  }> => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch dashboard stats');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('API error, calculating from fallback:', err);
      const rawShops = localStorage.getItem('shop_manager_shops');
      const rawLocs = localStorage.getItem('shop_manager_locations');
      const shops: Shop[] = rawShops ? JSON.parse(rawShops) : [];
      const locs: Location[] = rawLocs ? JSON.parse(rawLocs) : [...DEFAULT_INITIAL_LOCATIONS];

      const today = new Date().toDateString();
      const shopsAddedToday = shops.filter(s => new Date(s.created_at).toDateString() === today).length;

      return {
        totalShops: shops.length,
        totalLocations: locs.length,
        shopsAddedToday
      };
    }
  }
};
