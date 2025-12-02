// src/pages/CustomerDetailPage.tsx
'use client'
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCustomerDetail } from '@/hooks/useCustomers';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { CustomerAppointment } from '@/types/customer';
import PageSkeleton from '@/components/ui/PageSkeleton';

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const router = useRouter();
  const { data: customer, isLoading, error } = useCustomerDetail(customerId );

  // console.log('Customer detail data:', customer);

  if (isLoading) {
    return <PageSkeleton type="detail" />;
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error loading customer details</div>
      </div>
    );
  }

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} - ${timeStr}`;
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Customer's Details</h1>
          </div>

          {/* Customer Info Card */}
          <div className="flex gap-6 mb-8 pb-6 border-b border-primary">
            {/* Avatar Placeholder */}
            <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-20 h-20 text-gray-400" />
            </div>

            {/* Customer Details */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer's Name:</p>
                <p className="text-base text-gray-900 font-medium">{customer.customer_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Customer's ID:</p>
                <p className="text-base text-gray-900">{customer.customer_id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address:</p>
                <p className="text-base text-gray-900">{customer.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Age / Gender:</p>
                <p className="text-base text-gray-900">{customer.age_gender || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Contact:</p>
                <p className="text-base text-gray-900">{customer.contact || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">State:</p>
                <p className="text-base text-gray-900">{customer.state || '-'}</p>
              </div>

              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1">Emergency Contact:</p>
                <p className="text-base text-gray-900">{customer.emergency_contact || '-'}</p>
              </div>
            </div>
          </div>

          {/* Previous Booked Services */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Previous Booked Service Details
            </h2>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs  text-primary uppercase tracking-wider font-semibold">
                      S/N
                    </th>
                    <th className="px-6 py-3 text-left text-xs  text-primary uppercase tracking-wider font-semibold">
                      Service Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs  text-primary uppercase tracking-wider font-semibold">
                      Service Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs  text-primary uppercase tracking-wider font-semibold">
                      Time Stamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customer.appointments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    customer.appointments.map((appointment: CustomerAppointment, index) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}.
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.service_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.service_category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(appointment.date, appointment.start_time)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {customer.appointments.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 min-w-12">Rows per page:</span>
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    1-{Math.min(10, customer.appointments.length)} of {customer.appointments.length}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}