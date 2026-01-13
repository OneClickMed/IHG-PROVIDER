// src/components/dashboard/BookingRequestsTable.tsx
'use client';
import { useState } from 'react';
import { BookingRequest } from '@/hooks/useProviderAnalytics';
import AppointmentDetailModal from './AppointmentDetailModal';
import Link from 'next/link';
import { Appointment } from '@/types/appointment';

interface BookingRequestsTableProps {
  requests: BookingRequest[];
  onRequestUpdate?: () => void;
}

export default function BookingRequestsTable({ requests, onRequestUpdate }: BookingRequestsTableProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convert BookingRequest to Appointment format for the modal
  const convertToAppointment = (request: BookingRequest): Appointment => {
    return {
      id: request.id,
      customer_id: parseInt(request.patient_id.replace('IHG-', '')),
      customer_name: request.customer_name,
      customer_email: '', // Not available in BookingRequest
      rating: null,
      date: request.booking_date,
      start_time: '00:00:00', // Not available in BookingRequest
      end_time: '00:00:00', // Not available in BookingRequest
      duration_minutes: 60,
      status: 'PENDING',
      notes: request.booking_detail,
      service: {
        id: 0,
        provider: {
          id: 0,
          organization_name: '',
          specialty: '',
          phone: '',
          verified: false,
          type: '',
        },
        title: request.service,
        price: '0',
        has_active_discount: false,
        average_rating: 0,
        rating_count: 0,
        discount_percentage_display: 0,
        available: true,
        created_at: request.booking_date,
        appointment_duration: 60,
        status: 'ACTIVE',
        category: '',
      },
      provider: {
        id: 0,
        organization_name: '',
        specialty: '',
        phone: '',
        verified: false,
      },
      created_at: request.booking_date,
      updated_at: request.booking_date,
    };
  };

  const handleViewClick = (request: BookingRequest) => {
    const appointment = convertToAppointment(request);
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleActionComplete = () => {
    // Refresh the requests list after an action is completed
    onRequestUpdate?.();
  };

  if (requests && requests.length === 0) {
    return (
      <div className="bg-[#5A7A2F] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Booking Request</h2>
        </div>
        <p className="text-white text-center py-8">No pending booking requests</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#5A7A2F] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Booking Request</h2>
          <Link 
            href="/dashboard/appointments?status=PENDING"
            className="text-sm text-white hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-white text-sm border-b border-white/20">
                <th className="pb-3 font-medium">S/N</th>
                <th className="pb-3 font-medium">Customer's Name</th>
                <th className="pb-3 font-medium">Patient ID</th>
                <th className="pb-3 font-medium">Booking Date</th>
                <th className="pb-3 font-medium">Service</th>
                <th className="pb-3 font-medium">Booking Detail</th>
                <th className="pb-3 font-medium">View Details</th>
              </tr>
            </thead>
            <tbody>
              {requests && requests.map((request, index) => (
                <tr 
                  key={request.id}
                  className="text-white text-sm border-b border-white/10 last:border-0"
                >
                  <td className="py-3">{index + 1}.</td>
                  <td className="py-3">{request.customer_name}</td>
                  <td className="py-3">{request.patient_id}</td>
                  <td className="py-3">
                    {new Date(request.booking_date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-3">{request.service}</td>
                  <td className="py-3">{request.booking_detail}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleViewClick(request)}
                      className="text-white hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onActionComplete={handleActionComplete}
        />
      )}
    </>
  );
}