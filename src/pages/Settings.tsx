import { useEffect, useState } from 'react';
import { dataService } from '../lib/dataService';
import toast from 'react-hot-toast';
import type { Location } from '../types';
import { Trash2, Edit2, MapPin, ArrowUp, ArrowDown, Check, ListOrdered } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export const Settings = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [orderInputs, setOrderInputs] = useState<Record<string, number>>({});
  const [isSavingOrders, setIsSavingOrders] = useState(false);

  // Form state - location name, order number, and default flag
  const [formData, setFormData] = useState({
    location_name: '',
    order_number: 1,
    is_default: false
  });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await dataService.getLocations();
      setLocations(data);
      const inputs: Record<string, number> = {};
      data.forEach((loc, idx) => {
        inputs[loc.id] = loc.order_number ?? (idx + 1);
      });
      setOrderInputs(inputs);
      if (!isEditing) {
        setFormData(prev => ({ ...prev, order_number: data.length + 1 }));
      }
    } catch {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = formData.location_name.trim();
    if (!trimmed) {
      toast.error('Location name is required');
      return;
    }

    try {
      await dataService.saveLocation({
        location_name: trimmed,
        order_number: Number(formData.order_number) || (locations.length + 1),
        is_default: formData.is_default
      }, isEditing);

      toast.success(isEditing ? 'Location updated successfully!' : 'Location added successfully!');
      setFormData({ location_name: '', order_number: locations.length + 2, is_default: false });
      setIsEditing(null);
      await fetchLocations();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while saving location');
    }
  };

  const handleEdit = (location: Location) => {
    setIsEditing(location.id);
    setFormData({
      location_name: location.location_name,
      order_number: location.order_number ?? (locations.findIndex(l => l.id === location.id) + 1),
      is_default: location.is_default
    });
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= locations.length) return;

    const reordered = [...locations];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const orderPayload = reordered.map((loc, idx) => ({
      id: loc.id,
      order_number: idx + 1
    }));

    try {
      const updated = await dataService.updateLocationOrders(orderPayload);
      setLocations(updated);
      const inputs: Record<string, number> = {};
      updated.forEach((loc, idx) => {
        inputs[loc.id] = loc.order_number ?? (idx + 1);
      });
      setOrderInputs(inputs);
      toast.success('Location order updated!');
    } catch {
      toast.error('Failed to update location order');
    }
  };

  const handleOrderInputChange = (locId: string, val: string) => {
    const num = parseInt(val, 10);
    setOrderInputs(prev => ({
      ...prev,
      [locId]: isNaN(num) ? 0 : num
    }));
  };

  const handleSaveIndividualOrder = async (locId: string) => {
    const newOrder = orderInputs[locId];
    if (!newOrder || newOrder < 1) {
      toast.error('Please enter a valid order number (1, 2, 3...)');
      return;
    }

    try {
      const orderPayload = locations.map(l => ({
        id: l.id,
        order_number: l.id === locId ? newOrder : (orderInputs[l.id] ?? l.order_number ?? 1)
      }));
      const updated = await dataService.updateLocationOrders(orderPayload);
      setLocations(updated);
      const inputs: Record<string, number> = {};
      updated.forEach((loc, idx) => {
        inputs[loc.id] = loc.order_number ?? (idx + 1);
      });
      setOrderInputs(inputs);
      toast.success('Location order saved!');
    } catch {
      toast.error('Failed to save order');
    }
  };

  const handleSaveAllOrders = async () => {
    setIsSavingOrders(true);
    try {
      const orderPayload = locations.map(l => ({
        id: l.id,
        order_number: orderInputs[l.id] ?? l.order_number ?? 1
      }));
      const updated = await dataService.updateLocationOrders(orderPayload);
      setLocations(updated);
      const inputs: Record<string, number> = {};
      updated.forEach((loc, idx) => {
        inputs[loc.id] = loc.order_number ?? (idx + 1);
      });
      setOrderInputs(inputs);
      toast.success('All location orders saved successfully!');
    } catch {
      toast.error('Failed to save location orders');
    } finally {
      setIsSavingOrders(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingLocation) return;
    setIsDeleting(true);
    try {
      await dataService.deleteLocation(deletingLocation.id);
      toast.success('Location deleted successfully');
      setDeletingLocation(null);
      await fetchLocations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete location');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasUnsavedOrderChanges = locations.some(loc => {
    const current = loc.order_number ?? 1;
    const inputVal = orderInputs[loc.id];
    return inputVal !== undefined && inputVal !== current;
  });

  const filteredLocations = locations.filter(loc => 
    loc.location_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Information Header Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-blue-900">
        <ListOrdered className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-sm">Location Arrangement (1, 2, 3...)</h3>
          <p className="text-xs text-blue-700 mt-0.5">
            Set location orders (Location 1, Location 2, Location 3...). In <strong>Shop Records</strong> and all exports (PDF & Word), shops will automatically be grouped and arranged strictly according to this location priority.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? 'Edit Location' : 'Add New Location'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Location Name *
                </label>
                <input
                  type="text"
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                  placeholder="e.g. MG Road, Indiranagar, Market Area"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Location Order Number (1, 2, 3...) *
                </label>
                <input
                  type="number"
                  name="order_number"
                  min="1"
                  value={formData.order_number}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                  placeholder="1, 2, 3..."
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  1 = Highest priority (shops here appear first in list and exports).
                </p>
              </div>

              <div className="flex items-center pt-1">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="is_default" className="ml-2.5 block text-sm text-slate-700 cursor-pointer">
                  Set as Default Location
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex justify-center items-center shadow-sm text-sm cursor-pointer"
                >
                  {isEditing ? 'Update Location' : 'Add Location'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(null);
                      setFormData({ location_name: '', order_number: locations.length + 1, is_default: false });
                    }}
                    className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Locations ({locations.length})</h2>
                <p className="text-xs text-slate-500 mt-0.5">Set the location order (1, 2, 3...) to arrange shops</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {hasUnsavedOrderChanges && (
                  <button
                    onClick={handleSaveAllOrders}
                    disabled={isSavingOrders}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Save Orders
                  </button>
                )}
                <div className="w-full sm:w-56">
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading locations...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-36">
                        Order (1, 2...)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Location Name
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredLocations.map((loc, index) => {
                      const currentVal = orderInputs[loc.id] ?? loc.order_number ?? (index + 1);
                      const isModified = currentVal !== (loc.order_number ?? (index + 1));

                      return (
                        <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              {/* Reorder Buttons Up/Down */}
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => handleMove(index, 'up')}
                                  disabled={index === 0}
                                  className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-20 hover:bg-slate-100 rounded cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMove(index, 'down')}
                                  disabled={index === locations.length - 1}
                                  className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-20 hover:bg-slate-100 rounded cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Editable Order Input */}
                              <input
                                type="number"
                                min="1"
                                value={currentVal}
                                onChange={(e) => handleOrderInputChange(loc.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveIndividualOrder(loc.id);
                                  }
                                }}
                                className={`w-14 text-center text-sm font-bold py-1 px-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                                  isModified
                                    ? 'border-amber-400 bg-amber-50 text-amber-900 focus:ring-amber-500'
                                    : 'border-slate-300 bg-slate-50 text-slate-800 focus:ring-blue-500'
                                }`}
                                title="Type order number (1, 2, 3...) and press Enter"
                              />

                              {isModified && (
                                <button
                                  type="button"
                                  onClick={() => handleSaveIndividualOrder(loc.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                  title="Save this order number"
                                >
                                  <Check className="w-4 h-4 font-bold" />
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-slate-400 mr-2.5 flex-shrink-0" />
                              <span className="text-sm font-semibold text-slate-900">
                                {loc.location_name}
                              </span>
                              <span className="ml-2.5 px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Location #{loc.order_number ?? (index + 1)}
                              </span>
                              {loc.is_default && (
                                <span className="ml-2 px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  Default
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => handleEdit(loc)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                              title="Edit location"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingLocation(loc)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete location"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredLocations.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                          No locations found. Add one on the left to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <ConfirmModal
          isOpen={Boolean(deletingLocation)}
          title="Delete Location"
          message={`Are you sure you want to delete "${deletingLocation?.location_name}"? Any shops registered under this location will remain safe but will have their location unassigned.`}
          confirmText="Delete Location"
          isLoading={isDeleting}
          onCancel={() => setDeletingLocation(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
};
