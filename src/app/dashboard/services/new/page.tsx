// src/app/(dashboard)/dashboard/services/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronLeft, Save, X } from 'lucide-react';
import { useCreateService } from '@/hooks/useServices';
import { ServiceCategory } from '@/types/service';
import Button from '@/components/ui/Button';

const CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'DIAGNOSTICS_LAB', label: 'Diagnostics/Lab' },
  { value: 'PHARMACY_MEDIC', label: 'Pharmacy/Medic' },
  { value: 'WELLNESS', label: 'Wellness' },
  { value: 'CRITICAL_CARE', label: 'Critical Care' },
  { value: 'TELEHEALTH', label: 'Telehealth' },
  { value: 'SUPPORTIVE', label: 'Supportive' },
  { value: 'REFERRALS', label: 'Referrals' },
  { value: 'OTHERS', label: 'Others' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface FormData {
  title: string;
  description: string;
  category: ServiceCategory;
  price: string;
  appointment_duration: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function NewServicePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const createService = useCreateService();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'CONSULTATION',
    price: '',
    appointment_duration: '60',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Service name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!formData.appointment_duration || parseInt(formData.appointment_duration) <= 0) {
      newErrors.appointment_duration = 'Please enter a valid duration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const serviceData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        appointment_duration: parseInt(formData.appointment_duration),
        status: formData.status,
      };

      await createService.mutateAsync(serviceData);
      router.push('/dashboard/services');
    } catch (error: any) {
      // console.error('Failed to create service:', error);
      // Handle API errors
      if (error.response?.data) {
        const apiErrors: Record<string, string> = {};
        Object.keys(error.response.data).forEach((key) => {
          const messages = error.response.data[key];
          apiErrors[key] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(apiErrors);
      }
    }
  };

  return (
    <div className=" mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Service</h1>
          <p className="text-sm text-gray-600 mt-1">Create a new service for your patients</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-300 p-8">
        <div className="space-y-6">
          {/* Service Name */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter service name"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994] transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994] hover:border-gray-400 transition-colors"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Describe the service in detail"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994] transition-colors resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Price and Duration Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994] transition-colors ${
                  errors.price ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Appointment Duration */}
            <div>
              <label htmlFor="appointment_duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="appointment_duration"
                name="appointment_duration"
                value={formData.appointment_duration}
                onChange={handleChange}
                placeholder="60"
                min="1"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994] transition-colors ${
                  errors.appointment_duration ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.appointment_duration && (
                <p className="mt-1 text-sm text-red-600">{errors.appointment_duration}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994] hover:border-gray-400 transition-colors"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <div className="w-32">
              <Button
                variant="outline"
                onClick={() => router.back()}
                title="Cancel"
                logo={<X className="w-4 h-4" />}
                color="#6B7280"
              />
            </div>
            <div className="w-40">
              <Button
                variant="filled"
                title="Create Service"
                disabled={createService.isPending}
                type="submit"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Loading Overlay */}
      {createService.isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005994]"></div>
            <p className="text-gray-700">Creating service...</p>
          </div>
        </div>
      )}
    </div>
  );
}