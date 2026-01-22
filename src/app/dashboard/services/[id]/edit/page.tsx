// src/app/(dashboard)/dashboard/services/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronLeft, Save, X, AlertCircle } from 'lucide-react';
import { useService, useUpdateService } from '@/hooks/useServices';
import { ServiceCategory } from '@/types/service';
import Button from '@/components/ui/Button';
import PageSkeleton from '@/components/ui/PageSkeleton';

const CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'DIAGNOSTICS_LAB', label: 'Diagnostics/Lab' },
  { value: 'RADIOLOGY', label: 'Radiology' },
  { value: 'ULTRA_SOUND', label: 'Ultra Sound' },
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

interface EditServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditServicePage({ params }: EditServicePageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const updateService = useUpdateService();

  const [serviceId, setServiceId] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'CONSULTATION',
    price: '',
    appointment_duration: '60',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Unwrap params for Next.js 15
  useEffect(() => {
    params.then((resolvedParams) => {
      setServiceId(resolvedParams.id);
    });
  }, [params]);

  const { data: service, isLoading, error, isError } = useService(serviceId);

  // Populate form with existing service data
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        description: service.description || '',
        category: service.category,
        price: service.price.toString(),
        appointment_duration: service.appointment_duration.toString(),
        status: service.status,
      });
    }
  }, [service]);

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

      await updateService.mutateAsync({ id: serviceId, data: serviceData });
      router.push(`/dashboard/services/${serviceId}`);
    } catch (error: any) {
      // console.error('Failed to update service:', error);
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

  if (isLoading || !serviceId) {
    return <PageSkeleton type="detail" />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Service</h2>
          <p className="text-gray-600 mb-4">
            {(error as any)?.response?.status === 404 
              ? "The service you are looking for does not exist or has been removed."
              : 'An error occurred while loading the service details.'}
          </p>
          <div className="w-48 mx-auto">
            <Button
              variant="filled"
              onClick={() => router.push('/dashboard/services')}
              title="Back to Services"
              color="#005994"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Service Data</h2>
          <p className="text-gray-600 mb-4">Service data is empty or undefined.</p>
          <div className="w-48 mx-auto">
            <Button
              variant="filled"
              onClick={() => router.push('/dashboard/services')}
              title="Back to Services"
              color="#005994"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Service</h1>
          <p className="text-sm text-gray-600 mt-1">Update service information</p>
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
            <div className="w-48">
              <Button
                variant="filled"
                type="submit"
                title="Update Service"
                logo={<Save className="w-4 h-4" />}
                color="#005994"
                disabled={updateService.isPending}
              />
            </div>
          </div>
        </div>
      </form>

      {/* Loading Overlay */}
      {updateService.isPending && (
        <div className="fixed inset-0   bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005994]"></div>
            <p className="text-gray-700">Updating service...</p>
          </div>
        </div>
      )}
    </div>
  );
}
