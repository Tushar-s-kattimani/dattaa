import React, { useState, useEffect } from 'react';
import { X, Store, Phone, MapPin, Loader2, User, FileText, MapPinned } from 'lucide-react';
import type { Shop, Location } from '../types';
import { UI_STRINGS, type SupportedLanguage } from '../lib/translationService';

interface EditShopModalProps {
  isOpen: boolean;
  shop: Shop | null;
  locations: Location[];
  isLoading?: boolean;
  selectedLang?: SupportedLanguage;
  onClose: () => void;
  onSave: (data: {
    shop_name: string;
    mobile_number: string;
    location_id: string;
    contact_person?: string;
    full_address?: string;
    notes?: string;
  }) => Promise<void>;
}

export const EditShopModal: React.FC<EditShopModalProps> = ({
  isOpen,
  shop,
  locations,
  isLoading = false,
  selectedLang = 'kn',
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    shop_name: '',
    mobile_number: '',
    location_id: '',
    contact_person: '',
    full_address: '',
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const ui = UI_STRINGS[selectedLang] || UI_STRINGS.en;

  useEffect(() => {
    if (shop) {
      setFormData({
        shop_name: shop.shop_name || '',
        mobile_number: shop.mobile_number || '',
        location_id: shop.location_id || (shop.location?.id ?? ''),
        contact_person: shop.contact_person || '',
        full_address: shop.full_address || '',
        notes: shop.notes || ''
      });
      setError(null);
      // Auto-expand optional details if shop already has them
      if (shop.contact_person || shop.full_address || shop.notes) {
        setShowMoreDetails(true);
      } else {
        setShowMoreDetails(false);
      }
    }
  }, [shop, isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !shop) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const validateMobileNumber = (num: string) => {
    return /^[6-9]\d{9}$/.test(num.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.shop_name.trim();
    const trimmedMobile = formData.mobile_number.trim();

    if (!trimmedName) {
      setError(selectedLang === 'kn' ? 'ದಯವಿಟ್ಟು ಅಂಗಡಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : selectedLang === 'hi' ? 'कृपया दुकान का नाम दर्ज करें' : 'Please enter the shop name');
      return;
    }

    if (!validateMobileNumber(trimmedMobile)) {
      setError(selectedLang === 'kn' ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ' : selectedLang === 'hi' ? 'कृपया एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!formData.location_id) {
      setError(selectedLang === 'kn' ? 'ದಯವಿಟ್ಟು ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ' : selectedLang === 'hi' ? 'कृपया स्थान चुनें' : 'Please select a location');
      return;
    }

    try {
      await onSave({
        shop_name: trimmedName,
        mobile_number: trimmedMobile,
        location_id: formData.location_id,
        contact_person: formData.contact_person.trim(),
        full_address: formData.full_address.trim(),
        notes: formData.notes.trim()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 transition-all transform animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{ui.editShopTitle}</h3>
              <p className="text-xs text-slate-500">{ui.editShopSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shop Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Store className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              {ui.shopName} <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="shop_name"
              required
              value={formData.shop_name}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2.5 border text-sm"
              placeholder="e.g. Sri Lakshmi Stores"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              {ui.mobileNumber} <span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="flex rounded-lg shadow-xs">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-slate-500 font-semibold text-sm">
                +91
              </span>
              <input
                type="tel"
                name="mobile_number"
                required
                maxLength={10}
                value={formData.mobile_number}
                onChange={handleChange}
                className="w-full min-w-0 flex-1 rounded-none rounded-r-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2.5 border text-sm font-medium tracking-wide"
                placeholder="10-digit number"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              {ui.location} <span className="text-red-500 ml-0.5">*</span>
            </label>
            <select
              name="location_id"
              required
              value={formData.location_id}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2.5 border bg-white text-sm"
            >
              <option value="">{ui.selectLocation}</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.order_number ? `#${loc.order_number} ` : ''}
                  {loc.location_name} {loc.area ? `(${loc.area})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle additional optional details */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center cursor-pointer"
            >
              {showMoreDetails ? '− Hide additional details' : '+ Edit contact person, address, notes'}
            </button>
          </div>

          {showMoreDetails && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              {/* Contact Person */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Contact Person (Owner)
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 border text-sm"
                  placeholder="e.g. Ramesh"
                />
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center">
                  <MapPinned className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Full Address / Landmark
                </label>
                <input
                  type="text"
                  name="full_address"
                  value={formData.full_address}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 border text-sm"
                  placeholder="e.g. Near Bus Stand, Main Road"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 border text-sm"
                  placeholder="Optional notes or remarks..."
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {ui.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {ui.saving}
                </>
              ) : (
                ui.saveChanges
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
