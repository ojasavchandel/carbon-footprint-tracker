import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { ACTIVITY_TYPES, getUnit, calculateCO2 } from '../utils/emissions';
import { useCarbon } from '../context/CarbonContext';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityModal({ isOpen, onClose }: ActivityModalProps) {
  const { addActivity } = useCarbon();
  const [type, setType] = useState(ACTIVITY_TYPES[0]);
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setType(ACTIVITY_TYPES[0]);
      setQuantity('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowWarning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numQuantity = parseFloat(quantity);
  const estimatedCO2 = isNaN(numQuantity) ? 0 : calculateCO2(type, numQuantity);
  const unit = getUnit(type);

  const checkAbsurdValue = () => {
    if (isNaN(numQuantity)) return false;
    // Arbitrary thresholds for "absurd" values
    if (unit === 'km' && numQuantity > 10000) return true;
    if (unit === 'kWh' && numQuantity > 5000) return true;
    if (unit === 'meals' && numQuantity > 100) return true;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent, force = false) => {
    e.preventDefault();
    if (isNaN(numQuantity) || numQuantity <= 0) return;

    if (!force && checkAbsurdValue()) {
      setShowWarning(true);
      return;
    }

    try {
      setIsSubmitting(true);
      await addActivity({ type, quantity: numQuantity, date });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to log activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#F2EFE9] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Log activity</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {showWarning ? (
            <div className="flex flex-col gap-6">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 text-orange-800">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-sm">That value looks unusually high</h3>
                  <p className="text-sm mt-1">
                    {numQuantity.toLocaleString()} {unit} would produce {estimatedCO2.toLocaleString(undefined, {maximumFractionDigits:1})} kg CO₂.
                    Please confirm if this is correct.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowWarning(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Edit value
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  Confirm anyway
                </button>
              </div>
            </div>
          ) : (
            <form id="activity-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Activity type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                >
                  {ACTIVITY_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                      placeholder="0.0"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                      {unit}
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mt-2 border border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">Estimated footprint</div>
                <div className="text-xl font-semibold text-primary">
                  {estimatedCO2.toFixed(2)} <span className="text-sm text-gray-500 font-normal">kg CO₂</span>
                </div>
              </div>
            </form>
          )}
        </div>

        {!showWarning && (
          <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="activity-form"
              disabled={isSubmitting || !quantity || parseFloat(quantity) <= 0}
              className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Log activity'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
