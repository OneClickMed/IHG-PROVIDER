// src/app/(dashboard)/dashboard/services/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useProviderServices, useDeleteService, useToggleServiceStatus } from '@/hooks/useServices';
import apiClient from '@/lib/api-client';
import { Service, ServiceCategory } from '@/types/service';
import Button from '@/components/ui/Button';
import FilterSelect from '@/components/ui/FilterSelect';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

type FilterState = {
  categories: Set<ServiceCategory>;
  statuses: Set<'ACTIVE' | 'INACTIVE'>;
};

export default function ServicesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const providerId = session?.user?.profileId;

  // State
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkErrorDetails, setBulkErrorDetails] = useState<string[]>([]);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  
  // Filter state
  const [tempFilters, setTempFilters] = useState<FilterState>({
    categories: new Set(),
    statuses: new Set(),
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    categories: new Set(),
    statuses: new Set(),
  });

  // Modal states
  const [pauseModal, setPauseModal] = useState<{ isOpen: boolean; serviceId: number | null; currentStatus: string }>({
    isOpen: false,
    serviceId: null,
    currentStatus: '',
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; serviceId: number | null }>({
    isOpen: false,
    serviceId: null,
  });

  // Fetch services with applied filters
  const { data: servicesData, isLoading, error } = useProviderServices(providerId || '', {
    search: searchQuery,
    category: appliedFilters.categories.size > 0 ? Array.from(appliedFilters.categories).join(',') : undefined,
    status: appliedFilters.statuses.size > 0 ? Array.from(appliedFilters.statuses).join(',') : undefined,
    page: currentPage,
    page_size: rowsPerPage,
  });

  const deleteService = useDeleteService();
  const toggleStatus = useToggleServiceStatus();

  // Filter services locally if needed
  const filteredServices = useMemo(() => {
    if (!servicesData?.results) return [];
    return servicesData.results;
  }, [servicesData]);

  // Pagination
  const totalServices = servicesData?.count || 0;
  const totalPages = Math.ceil(totalServices / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, totalServices);

  // Handlers
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed.length === 0) {
      setSearchQuery('');
      setCurrentPage(1);
      return;
    }
    if (trimmed.length < 2) {
      return;
    }
    const timer = setTimeout(() => {
      setSearchQuery(trimmed);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const toggleCategoryFilter = (category: ServiceCategory) => {
    setTempFilters(prev => {
      const newCategories = new Set(prev.categories);
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }
      return { ...prev, categories: newCategories };
    });
  };

  const toggleStatusFilter = (status: 'ACTIVE' | 'INACTIVE') => {
    setTempFilters(prev => {
      const newStatuses = new Set(prev.statuses);
      if (newStatuses.has(status)) {
        newStatuses.delete(status);
      } else {
        newStatuses.add(status);
      }
      return { ...prev, statuses: newStatuses };
    });
  };

  const applyFilters = () => {
    setAppliedFilters(tempFilters);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const emptyFilters = {
      categories: new Set<ServiceCategory>(),
      statuses: new Set<'ACTIVE' | 'INACTIVE'>(),
    };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };

  const resetBulkModal = () => {
    setBulkFile(null);
    setBulkError(null);
    setBulkErrorDetails([]);
    setBulkSuccess(null);
    setBulkUploading(false);
  };

  const getBulkErrorDetails = (data: any) => {
    if (!data || !Array.isArray(data.errors)) return [];
    const messages: string[] = [];
    for (const item of data.errors) {
      if (!item || typeof item !== 'object') continue;
      const row = item.row ?? 'Unknown';
      const errors = item.errors ?? {};
      const fields = Object.keys(errors);
      for (const field of fields) {
        const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
        for (const message of fieldErrors) {
          messages.push(`Row ${row}: ${field} - ${message}`);
        }
      }
    }
    return messages.slice(0, 3);
  };

  const getBulkErrorMessage = (error: any) => {
    const data = error?.response?.data;
    if (typeof data === 'string') return data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (data?.detail) return data.detail;
    if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors[0];
    }
    return 'Failed to upload file. Please try again.';
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError(null);
    setBulkErrorDetails([]);
    setBulkSuccess(null);

    if (!bulkFile) {
      setBulkError('Please select a file to upload.');
      return;
    } 

    try {
      setBulkUploading(true);
      const formData = new FormData();
      formData.append('file', bulkFile);

      const { data } = await apiClient.post('/services/services/bulk-upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const createdCount = data?.created_count ?? 0;
      const errorCount = data?.error_count ?? 0;
      setBulkSuccess(`Bulk upload completed. Created ${createdCount} service(s).`);
      if (errorCount > 0) {
        setBulkErrorDetails(getBulkErrorDetails(data));
      }
      setBulkFile(null);
    } catch (error: any) {
      const data = error?.response?.data;
      setBulkError(getBulkErrorMessage(error));
      const details = getBulkErrorDetails(data);
      if (details.length > 0) setBulkErrorDetails(details);
    } finally {
      setBulkUploading(false);
    }
  };

  const openPauseModal = (serviceId: number, currentStatus: string) => {
    setPauseModal({ isOpen: true, serviceId, currentStatus });
  };

  const closePauseModal = () => {
    setPauseModal({ isOpen: false, serviceId: null, currentStatus: '' });
  };

  const handleToggleStatus = async () => {
    if (!pauseModal.serviceId) return;

    const newStatus = pauseModal.currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await toggleStatus.mutateAsync({ id: pauseModal.serviceId.toString(), status: newStatus });
      closePauseModal();
    } catch (error) {
      // console.error('Failed to toggle status:', error);
    }
  };

  const openDeleteModal = (serviceId: number) => {
    setDeleteModal({ isOpen: true, serviceId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, serviceId: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.serviceId) return;

    try {
      await deleteService.mutateAsync(deleteModal.serviceId.toString());
      closeDeleteModal();
    } catch (error) {
      // console.error('Failed to delete service:', error);
    }
  };

  const handleEdit = (serviceId: number) => {
    router.push(`/dashboard/services/${serviceId}/edit`);
  };

  const handleViewDetails = (serviceId: number) => {
    router.push(`/dashboard/services/${serviceId}`);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">Error loading services. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Container with border and rounded corners */}
      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden h-screen">
        {/* Header Section */}
        <div className="px-8 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Service List</h1>
          </div>

          {/* Search and Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994] focus:border-[#005994] text-sm hover:border-gray-400 transition-colors"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#005994]" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial sm:w-40">
                <Button
                  variant="outline"
                  size="medium"
                  onClick={() => router.push('/dashboard/services/new')}
                  title="Add Service"
                  color="#005994"
                />
              </div>
              <div className="flex-1 sm:flex-initial sm:w-52">
                <Button
                  variant="outline"
                  size="medium"
                  onClick={() => {
                    resetBulkModal();
                    setShowBulkModal(true);
                  }}
                  title="Bulk Add Services"
                  color="#005994"
                />
              </div>
              <div className="flex-1 sm:flex-initial sm:w-32">
                <Button
                  variant="filled"
                  size="medium"
                  onClick={() => setShowFilters(!showFilters)}
                  title="Filters"
                  logo={<Filter className="w-4 h-4" />}
                  color="#005994"
                />
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 py-6 border-y border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md text-gray-700 font-semibold">
                  Select one or more categories to show
                </h3>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Close filters"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {/* Left Column - Categories */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.categories.has('CONSULTATION')}
                        onChange={() => toggleCategoryFilter('CONSULTATION')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Consultations</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.categories.has('DIAGNOSTICS_LAB')}
                        onChange={() => toggleCategoryFilter('DIAGNOSTICS_LAB')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Diagnostics/Lab</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.categories.has('RADIOLOGY')}
                        onChange={() => toggleCategoryFilter('RADIOLOGY')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Radiology</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.categories.has('ULTRA_SOUND')}
                        onChange={() => toggleCategoryFilter('ULTRA_SOUND')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Ultra Sound</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.categories.has('PHARMACY_MEDIC')}
                        onChange={() => toggleCategoryFilter('PHARMACY_MEDIC')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Pharmacy/Medic</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.categories.has('WELLNESS')}
                        onChange={() => toggleCategoryFilter('WELLNESS')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Wellness</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.categories.has('CRITICAL_CARE')}
                        onChange={() => toggleCategoryFilter('CRITICAL_CARE')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Critical Care</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.categories.has('TELEHEALTH')}
                        onChange={() => toggleCategoryFilter('TELEHEALTH')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Telehealth</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.categories.has('REFERRALS')}
                        onChange={() => toggleCategoryFilter('REFERRALS')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Referrals</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.categories.has('SUPPORTIVE')}
                        onChange={() => toggleCategoryFilter('SUPPORTIVE')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Supportive</span>
                  </label>
                </div>

                {/* Right Column - Status Filters */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.statuses.has('ACTIVE')}
                        onChange={() => toggleStatusFilter('ACTIVE')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Active</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={tempFilters.statuses.has('INACTIVE')}
                        onChange={() => toggleStatusFilter('INACTIVE')}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-[#005994] checked:border-[#005994] transition-all hover:border-[#005994]"
                      />
                      <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Inactive</span>
                  </label>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[#005994] text-sm font-medium hover:underline transition-all"
                >
                  Reset filter
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyFilters();
                      setShowFilters(false);
                    }}
                    className="px-6 py-2 bg-[#005994] text-white rounded-lg font-medium hover:bg-[#004475] transition-colors"
                  >
                    Apply filter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowBulkModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Bulk Add Services</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Download the template, fill in your services, then upload the file for processing.
                  </p>
                </div>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleBulkSubmit} className="space-y-4 text-sm text-gray-700">
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload completed template
                  </label>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => setBulkFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-2">Accepted file type: .xlsx</p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                  <p className="font-semibold text-gray-900 mb-2">Instructions</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use the provided template and keep the column headers unchanged.</li>
                    <li>Maximum 100 services per upload.</li>
                    <li>Category must be one of the accepted values below (exact match).</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="font-semibold text-gray-900 mb-2">Column Meanings</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                    <li>title (required): service name, e.g. MRI Brain Scan</li>
                    <li>
                      category (required): must match one of the codes; invalid values are auto-set to OTHERS.
                    </li>
                    <li>price (required): numeric amount, e.g. 15000 or 15000.00</li>
                    <li>description (optional): free text, can be blank</li>
                    <li>appointment_duration (optional): minutes, integer like 30 or 60</li>
                    <li>status (optional): ACTIVE or INACTIVE (default is ACTIVE if blank)</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="font-semibold text-gray-900 mb-2">Accepted Categories</p>
                  <p className="text-xs text-gray-600">
                    CONSULTATION, DIAGNOSTICS_LAB, PHARMACY_MEDIC, WELLNESS, CRITICAL_CARE, TELEHEALTH, SUPPORTIVE,
                    REFERRALS, RADIOLOGY, ULTRA_SOUND, OTHERS
                  </p>
                </div>
                {bulkError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {bulkError}
                  </div>
                )}
                {bulkErrorDetails.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <p className="font-semibold mb-1">First 3 errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {bulkErrorDetails.map((detail, index) => (
                        <li key={`${detail}-${index}`}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {bulkSuccess && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {bulkSuccess}
                  </div>
                )}

                {bulkUploading && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                    Upload in progress. Your file is being processed...
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 mt-2">
                  <a
                    href="/bulk_upload_template.xlsx"
                    download
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Download Template
                  </a>
                  <button
                    type="submit"
                    disabled={!bulkFile || bulkUploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#005994] rounded-lg hover:bg-[#004070] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkUploading ? 'Uploading...' : 'Submit File'}
                  </button>
                </div>
              </form>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Services Table Container with inner border */}
        <div className="mx-8 mb-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    S/N
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Service Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Availability Set
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    View Patient Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-4 w-6 bg-gray-200 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-40 bg-gray-200 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-10 bg-gray-200 rounded mx-auto" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-12 bg-gray-200 rounded mx-auto" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-6 w-24 bg-gray-200 rounded" />
                      </td>
                    </tr>
                  ))
                ) : filteredServices?.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      No services found
                    </td>
                  </tr>
                ) : (
                  filteredServices?.map((service, index) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {startIndex + index}.
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="max-w-xs truncate">{service.title}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {service.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        ₦{parseFloat(service.price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-0 py-0 text-xs font-semibold ${
                            service.status === 'ACTIVE'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {service.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                        {service.rating_count || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                        {service.availability_set ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDetails(service.id)}
                          className="text-primary hover:text-gray-900 underline font-normal"
                        >
                          View details
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openPauseModal(service.id, service.status)}
                            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded border border-gray-400 transition-colors"
                            title={service.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                          >
                            {service.status === 'ACTIVE' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(service.id)}
                            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded border border-gray-400 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(service.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
{!isLoading && (
<div className="w-full py-4 bg-white border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
  <div className="flex items-center gap-2 whitespace-nowrap">
    <div className="text-sm text-gray-600">Rows per page:</div>
    <FilterSelect
      value={rowsPerPage.toString()}
      onChange={(e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
      }}
      className="px-12"  // increased width a bit
    >
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={50}>50</option>
    </FilterSelect>
  </div>

  <div className="flex items-center gap-4 whitespace-nowrap">
    <span className="text-sm text-gray-600">
      {startIndex}-{endIndex} of {totalServices}
    </span>
    <div className="flex gap-1">
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </div>
</div>
)}

        </div>
      </div>

      {/* Pause/Resume Confirmation Modal */}
      <ConfirmationModal
        isOpen={pauseModal.isOpen}
        onClose={closePauseModal}
        onConfirm={handleToggleStatus}
        title={pauseModal.currentStatus === 'ACTIVE' ? 'Pause Service' : 'Resume Service'}
        message={pauseModal.currentStatus === 'ACTIVE' ? 'Are you sure you want to pause this service? It will no longer be visible to customers.' : 'Are you sure you want to resume this service? It will become visible to customers again.'}
        confirmText={pauseModal.currentStatus === 'ACTIVE' ? 'Pause Service' : 'Resume Service'}
        confirmButtonColor="blue"
        isLoading={toggleStatus.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Service Details"
        message="Confirm Delete"
        confirmText="Delete Service"
        confirmButtonColor="red"
        isLoading={deleteService.isPending}
      />
    </div>
  );
}
