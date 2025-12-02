// src/components/appointments/AppointmentDetailModal.tsx
'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { 
  useConfirmAppointment, 
  useCancelAppointment,
  useCompleteAppointment,
  useMarkNoShow 
} from '@/hooks/useAppointments';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';

interface AppointmentDetailModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: () => void;
}

export default function AppointmentDetailModal({
  appointment,
  isOpen,
  onClose,
  onActionComplete
}: AppointmentDetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const confirmMutation = useConfirmAppointment();
  const cancelMutation = useCancelAppointment();
  const completeMutation = useCompleteAppointment();
  const noShowMutation = useMarkNoShow();

  if (!isOpen) return null;

  // Determine status badge styling
  const getStatusStyle = (status: AppointmentStatus) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-600 text-white',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels = {
      PENDING: 'Pending',
      CONFIRMED: 'Upcoming',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      NO_SHOW: 'No Show',
    };
    return labels[status] || status;
  };

  // Handle confirm action
  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await confirmMutation.mutateAsync(appointment.id.toString());
      onActionComplete?.();
      onClose();
    } catch (error) {
      // console.error('Failed to confirm appointment:', error);
      alert('Failed to confirm appointment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle decline/cancel action
  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this appointment?')) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await cancelMutation.mutateAsync(appointment.id.toString());
      onActionComplete?.();
      onClose();
    } catch (error) {
      // console.error('Failed to cancel appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle start consultation (for video appointments)
  const handleStartConsultation = () => {
    // TODO: Implement video consultation start logic
    // This would redirect to the video consultation page
    window.open(`/dashboard/consultations/${appointment.id}`, '_blank');
  };

  // Handle complete appointment
  const handleComplete = async () => {
    if (!confirm('Mark this appointment as completed?')) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await completeMutation.mutateAsync(appointment.id.toString());
      onActionComplete?.();
      onClose();
    } catch (error) {
      // console.error('Failed to complete appointment:', error);
      alert('Failed to complete appointment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle mark as no-show
  const handleNoShow = async () => {
    if (!confirm('Mark this patient as no-show?')) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await noShowMutation.mutateAsync(appointment.id.toString());
      onActionComplete?.();
      onClose();
    } catch (error) {
      // console.error('Failed to mark as no-show:', error);
      alert('Failed to mark as no-show. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format appointment date and time
  const appointmentDate = parseISO(appointment.date);
  const formattedDate = format(appointmentDate, 'EEEE, MMM dd, yyyy');
  const formattedTime = appointment.start_time.substring(0, 5);

  return (
    <>
      {/* Modal Overlay - clicking this closes the modal */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content - clicking inside here does NOT close the modal */}
        <div 
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#005994]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              {/* Patient Avatar */}
              <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                {appointment.customer_profile_picture ? (
                  <Image
                    src={appointment.customer_profile_picture}
                    alt={appointment.customer_name || 'Patient'}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-semibold">
                    {appointment.customer_name?.charAt(0) || 'P'}
                  </div>
                )}
              </div>

              {/* Patient Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500">Patient Name:</span>
                      <span className="text-base font-medium text-gray-900">
                        {appointment.customer_name || 'Unknown Patient'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Patient ID:</span>
                      <span className="text-base text-gray-700">
                        {appointment.customer_id 
                          ? `IHG-${String(appointment.customer_id).padStart(9, '0')}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusStyle(appointment.status)}`}>
                    {getStatusLabel(appointment.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Service Booked:</span>
                <span className="text-sm text-gray-900 font-medium text-right">
                  {appointment.service?.title || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Date & Time:</span>
                <span className="text-sm text-gray-900 text-right">
                  {formattedDate}, {formattedTime}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Mode:</span>
                <span className="text-sm text-gray-900">
                  {appointment.service?.is_virtual ? 'Virtual' : 'In-Person'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment Status:</span>
                <span className="text-sm text-gray-900">
                  Paid
                </span>
              </div>
            </div>
          </div>

          {/* Patient Information Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Age / Gender:</span>
                <span className="text-sm text-gray-900">
                  {appointment.customer_age || 'N/A'}, {appointment.customer_gender || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Contact:</span>
                <span className="text-sm text-gray-900">
                  {appointment.customer_phone || appointment.customer_email || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Emergency Contact:</span>
                <span className="text-sm text-gray-900">
                  {appointment.customer_emergency_contact || 'N/A'}
                </span>
              </div>
            </div>

            {/* Notes Section */}
            {appointment.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">Notes:</span>
                <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6">
            {appointment.status === 'PENDING' && (
              <div className="flex gap-3">
                <button
                  onClick={handleDecline}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 border-2 border-[#005994] text-[#005994] rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Decline'}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-[#005994] text-white rounded-lg hover:bg-[#004a7a] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            )}

            {appointment.status === 'CONFIRMED' && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border-2 border-[#005994] text-[#005994] rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Close
                  </button>
                  {appointment.service?.is_virtual && (
                    <button
                      onClick={handleStartConsultation}
                      className="flex-1 px-6 py-3 bg-[#005994] text-white rounded-lg hover:bg-[#004a7a] font-medium transition-colors"
                    >
                      Start Consultation
                    </button>
                  )}
                  {!appointment.service?.is_virtual && (
                    <button
                      onClick={handleComplete}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 bg-[#005994] text-white rounded-lg hover:bg-[#004a7a] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProcessing ? 'Processing...' : 'Mark Complete'}
                    </button>
                  )}
                </div>
                <button
                  onClick={handleNoShow}
                  disabled={isProcessing}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Mark as No-Show'}
                </button>
              </div>
            )}

            {(appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW') && (
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-[#005994] text-white rounded-lg hover:bg-[#004a7a] font-medium transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}