// src/components/ui/DiscountTab.tsx
'use client';

import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Tag,
  Info,
} from 'lucide-react';
import {
  useDiscounts,
  useCreateDiscount,
  useUpdateDiscount,
  useDeleteDiscount,
} from '@/hooks/useDiscounts';
import { Discount, CreateDiscountData } from '@/types/discount';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface DiscountTabProps {
  serviceId: string;
  servicePrice: number;
  hasActiveDiscount?: boolean;
  initialDiscount?: any;
}

export default function DiscountTab({
  serviceId,
  servicePrice,
  hasActiveDiscount,
  initialDiscount,
}: DiscountTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);

  // Fetch discounts
  const { data: discounts, isLoading, error } = useDiscounts(serviceId);

  // Mutations
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();
  const deleteDiscount = useDeleteDiscount();

  const handleCreateDiscount = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsEditModalOpen(true);
  };

  const handleDeleteDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDiscount) return;

    try {
      await deleteDiscount.mutateAsync({
        serviceId,
        discountId: selectedDiscount.id,
      });
      setIsDeleteModalOpen(false);
      setSelectedDiscount(null);
    } catch (error) {
      // console.error('Failed to delete discount:', error);
    }
  };

  const getDiscountStatusBadge = (discount: Discount) => {
    const now = new Date();
    const startDate = new Date(discount.start_date);
    const endDate = new Date(discount.end_date);

    if (!discount.is_active) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
          <XCircle className="w-3.5 h-3.5" />
          Inactive
        </span>
      );
    }

    if (now < startDate) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
          <Calendar className="w-3.5 h-3.5" />
          Scheduled
        </span>
      );
    }

    if (now > endDate) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
          <XCircle className="w-3.5 h-3.5" />
          Expired
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
        <CheckCircle className="w-3.5 h-3.5" />
        Active
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005994]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">Error Loading Discounts</h3>
            <p className="text-sm text-red-700 mt-1">
              Unable to load discount information. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Discount Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage discounts for this service. Discount periods cannot overlap.
          </p>
        </div>
        <div>
          <Button
            variant="filled"
            onClick={handleCreateDiscount}
            title="Create Discount"
            color="#005994"
            logo={<Plus className="w-4 h-4" />}
          />
        </div>
      </div>


      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-900">
            <p className="font-medium mb-1">Discount Rules</p>
            <ul className="list-disc list-inside space-y-1 text-gray-800">
              <li>You can have multiple discounts, but their active periods cannot overlap</li>
              <li>Percentage discounts: 0-100%</li>
              <li>Fixed discounts: Must be less than service price (₦{servicePrice?.toLocaleString()})</li>
              <li>To reduce service price, first deactivate or modify conflicting fixed discounts</li>
            </ul>
          </div>
        </div>
      </div>


      {/* Discounts List */}
      {discounts && discounts.length > 0 ? (
        <div className="grid gap-4">
          {discounts.map((discount) => {
            const discountedPrice =
              discount.discount_type === 'PERCENTAGE'
                ? servicePrice * (1 - parseFloat(discount.value) / 100)
                : servicePrice - parseFloat(discount.value);

            return (
              <div
                key={discount.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg flex items-center justify-center">
                      {discount.discount_type === 'PERCENTAGE' ? (
                        <Percent className="w-6 h-6 text-[#005994]" />
                      ) : (
                        <DollarSign className="w-6 h-6 text-[#005994]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {discount.discount_type === 'PERCENTAGE'
                          ? `${discount.value}% Off`
                          : `₦${parseFloat(discount.value).toLocaleString()} Off`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {discount.discount_type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}{' '}
                        Discount
                      </p>
                    </div>
                  </div>
                  {getDiscountStatusBadge(discount)}
                </div>

                {/* Price Display */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Original Price</p>
                      <p className="text-sm text-gray-600 line-through">
                        ₦{servicePrice?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium">Discounted Price</p>
                      <p className="text-lg font-bold text-green-600">
                        ₦{Math.max(0, discountedPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Start Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDateTime(discount.start_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">End Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDateTime(discount.end_date)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEditDiscount(discount)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#005994] border-2 border-[#005994] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDiscount(discount)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Discounts Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first discount to attract more customers.
          </p>
          <div className="w-48 mx-auto">
            <Button
              variant="filled"
              onClick={handleCreateDiscount}
              title="Create First Discount"
              color="#005994"
              logo={<Plus className="w-4 h-4" />}
            />
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <DiscountModal
          isOpen={isCreateModalOpen || isEditModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedDiscount(null);
          }}
          serviceId={serviceId}
          servicePrice={servicePrice}
          discount={selectedDiscount}
          isEdit={isEditModalOpen}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDiscount(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Discount"
        message="Are you sure you want to delete this discount? This action cannot be undone."
        confirmText="Delete Discount"
        confirmButtonColor="red"
        isLoading={deleteDiscount.isPending}
      />
    </div>
  );
}

// Discount Modal Component
interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  servicePrice: number;
  discount?: Discount | null;
  isEdit?: boolean;
}

function DiscountModal({
  isOpen,
  onClose,
  serviceId,
  servicePrice,
  discount,
  isEdit,
}: DiscountModalProps) {
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();

const [formData, setFormData] = useState({
  discount_type: discount?.discount_type || 'PERCENTAGE',
  value: discount?.value || '',
  is_active: discount?.is_active ?? true,
  start_date: discount?.start_date || '',
  end_date: discount?.end_date || '',
});


  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate max fixed discount value
  const maxFixedDiscount = servicePrice - 0.01;

  // Calculate preview price
  const calculatePreviewPrice = () => {
    if (!formData.value) return servicePrice;

    const value = parseFloat(formData.value);
    if (isNaN(value)) return servicePrice;

    if (formData.discount_type === 'PERCENTAGE') {
      return servicePrice * (1 - value / 100);
    } else {
      return servicePrice - value;
    }
  };

  const previewPrice = calculatePreviewPrice();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.discount_type) {
      newErrors.discount_type = 'Discount type is required';
    }

    if (!formData.value) {
      newErrors.value = 'Value is required';
    } else {
      const numValue = parseFloat(formData.value);
      if (isNaN(numValue)) {
        newErrors.value = 'Value must be a number';
      } else if (formData.discount_type === 'PERCENTAGE' && (numValue < 0 || numValue > 100)) {
        newErrors.value = 'Percentage must be between 0 and 100';
      } else if (formData.discount_type === 'FIXED') {
        if (numValue < 0) {
          newErrors.value = 'Fixed amount cannot be negative';
        } else if (numValue >= servicePrice) {
          newErrors.value = `Fixed discount must be less than service price (₦${servicePrice?.toLocaleString()}). Maximum: ₦${maxFixedDiscount.toFixed(2)}`;
        }
      }
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (start >= end) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const submitData: CreateDiscountData = {
        discount_type: formData.discount_type as 'PERCENTAGE' | 'FIXED',
        value: formData.value,
        is_active: formData.is_active,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      if (isEdit && discount) {
        await updateDiscount.mutateAsync({
          serviceId,
          discountId: discount.id,
          data: submitData,
        });
      } else {
        await createDiscount.mutateAsync({
          serviceId,
          data: submitData,
        });
      }

      onClose();
    } catch (error: any) {
      // console.error('Failed to save discount:', error);
      // Handle API errors
      if (error.response?.data) {
        const apiErrors: Record<string, string> = {};
        Object.keys(error.response.data).forEach((key) => {
          if (Array.isArray(error.response.data[key])) {
            apiErrors[key] = error.response.data[key][0];
          } else {
            apiErrors[key] = error.response.data[key];
          }
        });
        setErrors(apiErrors);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-10 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            {isEdit ? 'Edit Discount' : 'Create New Discount'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isEdit ? 'Update discount details below' : 'Set up a new discount for this service'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {/* Service Price Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Service Price</p>
                <p className="text-xl font-bold text-blue-900">₦{servicePrice?.toLocaleString()}</p>
              </div>
              {formData.value && (
                <div className="text-right">
                  <p className="text-xs text-blue-600 font-medium">Preview Price</p>
                  <p className="text-xl font-bold text-green-600">
                    ₦{Math.max(0, previewPrice).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Discount Type
            </label>
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#005994] focus:border-transparent transition-all ${
                errors.discount_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (₦)</option>
            </select>
            {errors.discount_type && (
              <p className="text-red-600 text-sm mt-1">{errors.discount_type}</p>
            )}
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {formData.discount_type === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (₦)'}
              {formData.discount_type === 'FIXED' && (
                <span className="text-xs text-gray-500 font-normal ml-2">
                  Max: ₦{maxFixedDiscount.toFixed(2)}
                </span>
              )}
            </label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              step={formData.discount_type === 'PERCENTAGE' ? '0.01' : '0.01'}
              min="0"
              max={formData.discount_type === 'PERCENTAGE' ? '100' : maxFixedDiscount.toString()}
              placeholder={
                formData.discount_type === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 5000'
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#005994] focus:border-transparent transition-all ${
                errors.value ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.value && <p className="text-red-600 text-sm mt-1">{errors.value}</p>}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#005994] focus:border-transparent transition-all ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.start_date && (
                <p className="text-red-600 text-sm mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#005994] focus:border-transparent transition-all ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_date && <p className="text-red-600 text-sm mt-1">{errors.end_date}</p>}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-5 h-5 text-[#005994] border-gray-300 rounded focus:ring-[#005994]"
            />
            <div>
              <label className="text-sm font-semibold text-gray-900">Active Discount</label>
              <p className="text-xs text-gray-600">
                Enable this discount immediately (subject to date range). Discount periods cannot
                overlap with other active discounts.
              </p>
            </div>
          </div>

          {/* API Error Messages */}
          {errors.non_field_errors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{errors.non_field_errors}</p>
              </div>
            </div>
          )}

          {errors.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{errors.error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDiscount.isPending || updateDiscount.isPending}
              className="px-6 py-3 bg-[#005994] text-white font-medium rounded-lg hover:bg-[#004470] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(createDiscount.isPending || updateDiscount.isPending) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isEdit ? 'Update Discount' : 'Create Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}