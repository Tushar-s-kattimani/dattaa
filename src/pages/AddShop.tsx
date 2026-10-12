import React, { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import type { Location } from '../types';
import toast from 'react-hot-toast';
import { Store, Phone, MapPin } from 'lucide-react';

export const AddShop = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    shop_name: '',
    mobile_number: '',
    location_id: ''
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await dataService.getLocations();
        setLocations(data);
        const defaultLoc = data.find(l => l.is_default);
        if (defaultLoc) {
          setFormData(prev => ({ ...prev, location_id: defaultLoc.id }));
        }
      } catch (err) {
        console.error('Failed to load locations', err);
      }
    };
    fetchLocations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateMobileNumber = (number: string) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(number);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shop_name.trim()) {
      toast.error('Please enter the shop name');
      return;
    }

    if (!validateMobileNumber(formData.mobile_number)) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!formData.location_id) {
      toast.error('Please select a location');
      return;
    }

    setLoading(true);

    try {
      await dataService.saveShop({
        shop_name: formData.shop_name.trim(),
        mobile_number: formData.mobile_number.trim(),
        location_id: formData.location_id
      });

      toast.success('Shop added successfully!');
      handleClear();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save shop');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const defaultLoc = locations.find(l => l.is_default);
    setFormData({
      shop_name: '',
      mobile_number: '',
      location_id: defaultLoc ? defaultLoc.id : ''
    });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Add New Shop</h2>
          <p className="text-sm text-slate-500">Enter shop name, mobile number, and location</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
            <Store className="w-4 h-4 mr-1.5 text-slate-400" />
            Shop Name *
          </label>
          <input
            type="text"
            name="shop_name"
            required
            value={formData.shop_name}
            onChange={handleChange}
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
            placeholder="Enter shop name (e.g. Sri Lakshmi Stores)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
            <Phone className="w-4 h-4 mr-1.5 text-slate-400" />
            Mobile Number *
          </label>
          <div className="flex rounded-lg shadow-sm">
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3.5 text-slate-500 font-medium sm:text-sm">
              +91
            </span>
            <input
              type="tel"
              name="mobile_number"
              required
              maxLength={10}
              value={formData.mobile_number}
              onChange={handleChange}
              className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
              placeholder="10-digit number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
            <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
            Location *
          </label>
          <select
            name="location_id"
            required
            value={formData.location_id}
            onChange={handleChange}
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-white"
          >
            <option value="">Select a location...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.location_name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-slate-500">
            Don't see the location? Add it in Settings.
          </p>
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-5 py-3 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium flex justify-center items-center disabled:opacity-50 text-sm"
          >
            {loading ? 'Saving...' : 'Save Shop'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 bg-white text-slate-700 px-5 py-3 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-sm"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};
