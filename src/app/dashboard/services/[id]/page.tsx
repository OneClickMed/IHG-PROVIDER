// src/app/(dashboard)/dashboard/services/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ChevronLeft,
  Edit,
  Trash2,
  Pause,
  Play,
  Star,
  Calendar,
  DollarSign,
  Clock,
  Tag,
  MapPin,
  User,
  Mail,
  Phone,
  TrendingUp,
  Users,
  AlertCircle,
  Home
} from 'lucide-react';
import { useService, useDeleteService, useToggleServiceStatus } from '@/hooks/useServices';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import AvailabilityTab from '@/components/ui/availabilityTab';
import StatCard from '@/components/dashboard/StatCard';
import DiscountTab from '@/components/ui/DiscountTab';
import PageSkeleton from '@/components/ui/PageSkeleton';


interface ServiceDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}


type TabId = "overview" | "availability" | "ratings" | "discount";

interface TabsProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  ratingCount: number;
}

const tabColors: Record<TabId, string> = {
  overview: "#FDBE01",
  availability: "#87c71f",
  ratings: "#005994", // primary
  discount: "#FF6B6B", // example 4th color
};

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, ratingCount }) => {
  const tabs: { id: TabId; label: string; icon: React.ReactElement }[] = [
    { id: "overview", label: "Overview", icon: <Home size={18} /> },
    { id: "availability", label: "Availability", icon: <Clock size={18} /> },
    { id: "ratings", label: `Ratings & Reviews (${ratingCount})`, icon: <Star size={18} /> },
    { id: "discount", label: "Discounts", icon: <Tag size={18} /> },
  ];

  return (
    <div className="border-b border-gray-200 py-6 ">
      <div className="px-8">
        <div className="flex -mb-px space-x-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const color = tabColors[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-md font-semibold border-2 rounded transition-colors
                  ${isActive ? "text-white" : "hover:text-white"}`}
                style={{
                  backgroundColor: isActive ? color : "transparent",
                  borderColor: color,
                  color: isActive ? "white" : color,
                }}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};



export default function ServiceDetailsPage({ params }: ServiceDetailsPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'ratings' | 'availability' | 'discount'>('overview');
  const [serviceId, setServiceId] = useState<string>('');

  // Modal states
  const [pauseModal, setPauseModal] = useState<{ isOpen: boolean; currentStatus: string }>({
    isOpen: false,
    currentStatus: '',
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean }>({
    isOpen: false,
  });

  // Unwrap params for Next.js 15
  useEffect(() => {
    params.then((resolvedParams) => {
      setServiceId(resolvedParams.id);
    });
  }, [params]);

  const { data: service, isLoading, error, isError } = useService(serviceId);

  const deleteService = useDeleteService();
  const toggleStatus = useToggleServiceStatus();

  const handleEdit = () => {
    router.push(`/dashboard/services/${serviceId}/edit`);
  };

  const openDeleteModal = () => {
    setDeleteModal({ isOpen: true });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false });
  };

  const handleDelete = async () => {
    try {
      await deleteService.mutateAsync(serviceId);
      closeDeleteModal();
      router.push('/dashboard/services');
    } catch (error) {
      // console.error('Failed to delete service:', error);
    }
  };

  const openPauseModal = () => {
    if (!service) return;
    setPauseModal({ isOpen: true, currentStatus: service.status });
  };

  const closePauseModal = () => {
    setPauseModal({ isOpen: false, currentStatus: '' });
  };

  const handleToggleStatus = async () => {
    if (!pauseModal.currentStatus) return;

    const newStatus = pauseModal.currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await toggleStatus.mutateAsync({ id: serviceId, status: newStatus });
      closePauseModal();
    } catch (error) {
      // console.error('Failed to toggle status:', error);
    }
  };

  if (isLoading || !serviceId) {
    return <PageSkeleton type="detail" />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
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
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load service details.</p>
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

  const averageRating = service.average_rating || 0;
  const ratingCount = service.rating_count || 0;
  const hasDiscount = service.has_active_discount;
  const discountedPrice = service.discounted_price;
  const originalPrice = parseFloat(service.price);

  return (
    <div className="space-y-6">
      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden">
        {/* Header Section */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{service.title}</h1>
                <p className="text-sm text-gray-600 mt-1">Service Details</p>
              </div>
            </div>

            {/* Action Buttons */}
<div className="flex gap-3 flex-wrap">
  <button
    onClick={openPauseModal}
    className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-medium transition-colors ${
      service.status === 'ACTIVE'
        ? 'hover:bg-yellow-50'
        : 'hover:bg-green-50'
    }`}
    style={{
      borderColor: service.status === 'ACTIVE' ? tabColors.overview : tabColors.availability,
      color: service.status === 'ACTIVE' ? tabColors.overview : tabColors.availability
    }}
  >
    {service.status === 'ACTIVE' ? (
      <>
        <Pause className="w-4 h-4" />
        <span>Pause Service</span>
      </>
    ) : (
      <>
        <Play className="w-4 h-4" />
        <span>Resume Service</span>
      </>
    )}
  </button>

  <button
    onClick={handleEdit}
    className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
    style={{
      borderColor: tabColors.availability,
      color: tabColors.availability
    }}
  >
    <Edit className="w-4 h-4" />
    <span>Edit</span>
  </button>

  <button
    onClick={openDeleteModal}
    className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
    style={{
      borderColor: tabColors.discount,
      color: tabColors.discount
    }}
  >
    <Trash2 className="w-4 h-4" />
    <span>Delete</span>
  </button>
</div>
          </div>

          {/* Status Banner */}

          {service.status === 'INACTIVE' && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-primary mr-3 shrink-0" />
                <p className="text-sm text-yellow-800">
                  This service is currently <strong>inactive</strong> and not visible to customers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards - Using StatCard component for 2 cards and custom cards for complex ones */}
        <div className="px-8 py-6 ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Card - Custom due to discount display */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{hasDiscount ? discountedPrice.toLocaleString() : originalPrice.toLocaleString()}
                </p>
                {hasDiscount && (
                  <p className="text-sm text-gray-500 line-through mt-1">₦{originalPrice.toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Average Rating Card - Custom due to star display */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Star className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                  <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                </div>
                <p className="text-sm text-gray-500 mt-1">{ratingCount} reviews</p>
              </div>
            </div>

            {/* Bookings Card - Using StatCard */}
            <StatCard
              icon="calendar"
              label="Total Bookings"
              value={ratingCount}
            />

            {/* Status Card - Custom due to badge display */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    service.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {service.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>


        <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ratingCount={ratingCount}
      />




        {/* Tab Content */}
        <div className="px-8 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Service Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                <div className="rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tag className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Category</p>
                        <p className="text-base font-semibold text-gray-900">{service.category}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Duration</p>
                        <p className="text-base font-semibold text-gray-900">{service.appointment_duration} minutes</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Base Price</p>
                        <p className="text-base font-semibold text-gray-900">₦{originalPrice.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Available</p>
                        <p className="text-base font-semibold text-gray-900">
                          {service.available ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <div className=" rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 leading-relaxed">{service.description}</p>
                </div>
              </div>

              {/* Active Discount */}
              {hasDiscount && service.active_discount && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Discount</h3>
                  <div className=" border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-primary font-medium mb-1">Discount Type</p>
                        <p className="text-base font-semibold text-primary">
                          {service.active_discount.discount_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-primary font-medium mb-1">Value</p>
                        <p className="text-base font-semibold text-primary">
                          {service.active_discount.discount_type === 'PERCENTAGE' 
                            ? `${service.active_discount.value}%` 
                            : `₦${parseFloat(service.active_discount.value).toLocaleString()}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-primary font-medium mb-1">Valid Until</p>
                        <p className="text-base font-semibold text-primary">
                          {new Date(service.active_discount.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Provider Information */}
              {service.provider && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Information</h3>
                  <div className="rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Organization</p>
                          <p className="text-base font-semibold text-gray-900">
                            {service.provider.organization_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Tag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Specialty</p>
                          <p className="text-base font-semibold text-gray-900">
                            {service.provider.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Phone</p>
                          <p className="text-base font-semibold text-gray-900">
                            {service.provider.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Location</p>
                          <p className="text-base font-semibold text-gray-900">
                            {service.provider.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {service.provider.bio && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 font-medium mb-2">About</p>
                        <p className="text-gray-700 leading-relaxed">{service.provider.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <AvailabilityTab 
              serviceId={serviceId} 
              appointmentDuration={service.appointment_duration}
            />
          )}

          {/* Ratings Tab */}
          {activeTab === 'ratings' && (
            <div className="space-y-6">
              {service.reviews && service.reviews.length > 0 ? (
                <>
                  {/* Rating Summary */}
                  <div className=" border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                      <div className="text-center md:text-left">
                        <div className="text-5xl font-semibold text-gray-700 mb-2">
                          {averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.round(averageRating)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm  font-medium">{ratingCount} reviews</p>
                      </div>

                      <div className="flex-1 w-full">
                        <p className="text-sm  font-semibold mb-3">Rating Distribution</p>
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = service.reviews!.filter((r: any) => r.score === rating).length;
                          const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
                          return (
                            <div key={rating} className="flex items-center gap-3 mb-2">
                              <span className="text-sm text-gray-500 font-medium w-8">{rating}★</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                                <div
                                  className="bg-gray-600 h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-primary font-medium w-12 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                    {service.reviews.map((review: any) => (
                      <div key={review.id} className="bg-white rounded-lg p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-[#005994] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {review.customer_name?.charAt(0) ||review.customer_email?.charAt(0)|| 'C'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{review.customer_name}</p>
                                <p className="text-sm text-gray-600">{review.customer_email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.score
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600">
                    This service has not received any reviews from customers yet.
                  </p>
                </div>
              )}
            </div>
          )}


          {/* Availability Tab */}
          {activeTab === 'discount' && (
            <DiscountTab
              serviceId={serviceId} 
              hasActiveDiscount={service.has_active_discount}
              initialDiscount={service.active_discount}
              servicePrice={originalPrice}
              
            />
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