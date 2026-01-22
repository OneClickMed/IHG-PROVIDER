// src/app/(dashboard)/dashboard/appointments/page.tsx
'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { Calendar as CalendarIcon, List, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMyAppointments } from '@/hooks/useAppointments';
import { useSession } from 'next-auth/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { AppointmentStatus, CalendarAppointment, CalendarDay, Appointment } from '@/types/appointment';
import Link from 'next/link';
import AppointmentDetailModal from '@/components/dashboard/AppointmentDetailModal';
import PageSkeleton from '@/components/ui/PageSkeleton';
import { useSearchParams } from 'next/navigation';

function AppointmentsPageInner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
  
  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoOpenedAppointmentId, setAutoOpenedAppointmentId] = useState<number | null>(null);



  // Fetch appointments
  const { data: appointmentsData, isLoading, error, refetch } = useMyAppointments({
    ordering: '-date',
  });

  // Handle both paginated and non-paginated responses
  const appointments = useMemo(() => {
    if (!appointmentsData) return [];
    // Check if it's a paginated response
    if (Array.isArray(appointmentsData)) {
      return appointmentsData;
    }
    // Otherwise it's a paginated response with results
    return appointmentsData.results || [];
  }, [appointmentsData]);

  // Filter appointments based on tab, search, and status
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Filter by tab (upcoming vs past)
    const now = new Date();
    
    if (selectedTab === 'upcoming') {
      // Upcoming: PENDING or CONFIRMED appointments in the future or today
      filtered = filtered.filter(apt => {
        const aptDate = parseISO(apt.date);
        const aptDateTime = new Date(`${apt.date}T${apt.start_time}`);
        return aptDateTime >= now && (apt.status === 'CONFIRMED' || apt.status === 'PENDING');
      });
    } else {
      // Past: COMPLETED, CANCELLED, NO_SHOW, or any past appointments
      filtered = filtered.filter(apt => {
        const aptDateTime = new Date(`${apt.date}T${apt.start_time}`);
        return aptDateTime < now || apt.status === 'COMPLETED' || apt.status === 'CANCELLED' || apt.status === 'NO_SHOW';
      });
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.customer_name?.toLowerCase().includes(query) ||
        apt.service?.title?.toLowerCase().includes(query) ||
        apt.customer_email?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [appointments, selectedTab, searchQuery, statusFilter]);

  // Transform appointments for calendar view
  const calendarAppointments: CalendarAppointment[] = useMemo(() => {
    return appointments.map((apt: Appointment) => ({
      id: apt.id.toString(),
      title: apt.service?.title || 'Appointment',
      customerName: apt.customer_name || 'Unknown',
      customerId: apt.customer_id?.toString() || '',
      patientId: apt.customer_id?.toString() || '',
      service: apt.service?.title || 'Service',
      date: apt.date,
      time: apt.start_time.substring(0, 5), // HH:MM format
      startTime: apt.start_time,
      endTime: apt.end_time,
      status: apt.status,
      notes: apt.notes,
    }));
  }, [appointments]);

  // Generate calendar days
  const calendarDays: CalendarDay[] = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      dayOfWeek: day.getDay(),
      isCurrentMonth: isSameMonth(day, selectedDate),
      appointments: calendarAppointments.filter(apt => apt.date === format(day, 'yyyy-MM-dd')),
    }));
  }, [selectedDate, calendarAppointments]);

  // Navigate months
  const handlePreviousMonth = () => {
    setSelectedDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => addMonths(prev, 1));
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  // Handle action complete (refresh data)
  const handleActionComplete = () => {
    refetch();
  };

  useEffect(() => {
    const appointmentIdParam = searchParams.get('appointmentId');
    if (!appointmentIdParam) return;
    const appointmentId = Number(appointmentIdParam);
    if (!Number.isFinite(appointmentId)) return;
    if (autoOpenedAppointmentId === appointmentId) return;
    const match = appointments.find((apt) => apt.id === appointmentId);
    if (match) {
      setSelectedAppointment(match);
      setIsModalOpen(true);
      setAutoOpenedAppointmentId(appointmentId);
    }
  }, [appointments, searchParams, autoOpenedAppointmentId]);

  // Status badge component
  const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status]}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return <PageSkeleton type="list" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading appointments. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
{/* Header */}
<div className="flex items-center justify-between gap-6">
  {/* Left */}
  <div className="flex items-center gap-4 shrink-0">
    <button className="p-2 hover:bg-gray-100 rounded-lg">
      <ChevronLeft className="w-5 h-5 text-gray-600" />
    </button>
    <h1 className="text-2xl font-semibold text-gray-900">
      Appointments
    </h1>
  </div>

  {/* Right / Search */}
  <div className="flex flex-1 justify-end">
    <div className="relative w-full max-w-lg">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search appointments…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-[#005994]
                   focus:border-transparent"
      />
    </div>
  </div>
</div>



      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-lg ">
        {/* View Toggle and Tabs */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            {/* Month/Year Navigation */}
            <div className="flex items-center gap-4">
              <button onClick={handlePreviousMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-lg font-semibold text-gray-900 min-w-[150px] text-center">
                {viewMode === 'calendar' 
                  ? format(selectedDate, 'MMMM yyyy')  // Shows "November 2025"
                  : format(selectedDate, 'yyyy')       // Shows "2025"
                }
              </span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-[#005994] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#005994] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`px-6 py-2 font-medium rounded-sm ${
                selectedTab === 'upcoming'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 border border-primary hover:bg-gray-50'
              }`}
            >
              Upcoming Appointments
            </button>
            <button
              onClick={() => setSelectedTab('past')}
              className={`px-6 py-2 font-medium rounded-sm ${
                selectedTab === 'past'
                   ? 'bg-primary text-white'
                  : 'text-gray-600 border border-primary hover:bg-gray-50'
              }`}
            >
              Past Appointments
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {viewMode === 'list' ? (
            /* List View */
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4 pb-3 border-b border-gray-200 text-md font-semibold font-medium text-primary">
                <div>S/N</div>
                <div>Customer's Name</div>
                <div>Patient ID</div>
                <div>Service</div>
                <div>Booking Detail</div>
                <div>Status</div>
                <div>View Patient Details</div>
              </div>

              {/* Table Body */}
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No appointments found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAppointments.map((appointment, index) => (
                    <div
                      key={appointment.id}
                      className="grid grid-cols-7 gap-4 py-4 border-b border-gray-100 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <div className="text-gray-900">{index + 1}.</div>
                      <div className="text-gray-900">{appointment.customer_name || 'Unknown'}</div>
                      <div className="text-gray-600">
                        {appointment.customer_id ? `IHG-${String(appointment.customer_id).padStart(9, '0')}` : 'N/A'}
                      </div>
                      <div className="text-gray-900">
                        {appointment.service?.title || 'N/A'}
                      </div>
                      <div className="text-gray-600">
                        {format(parseISO(appointment.date), 'MM/dd/yy')} - {appointment.start_time.substring(0, 5)}
                      </div>
                      <div>
                        <StatusBadge status={appointment.status} />
                      </div>
                      <div>
                        <button 
                          className="text-[#005994] hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppointmentClick(appointment);
                          }}
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filteredAppointments.length > 0 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 ">
                    <div className='min-w-12'>Rows per page:</div>
                    <select className="border border-gray-300 rounded px-2 py-1">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>1-{Math.min(10, filteredAppointments.length)} of {filteredAppointments.length}</span>
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Calendar View */
            <div className="space-y-4">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT', 'SUN'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Adjust for week starting on Monday */}
                {(() => {
                  const firstDayOfMonth = calendarDays[0]?.dayOfWeek || 0;
                  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
                  const emptyDays = Array(offset).fill(null);

                  return (
                    <>
                      {emptyDays.map((_, index) => (
                        <div key={`empty-${index}`} className="aspect-square" />
                      ))}
                      {calendarDays.map(day => {
                        const dayDate = parseISO(day.date);
                        const isToday = isSameDay(dayDate, new Date());
                        
                        return (
                          <div
                            key={day.date}
                            className={`aspect-square border border-gray-200 rounded-lg p-2 ${
                              isToday ? 'bg-[#005994] text-white' : 'bg-white'
                            }`}
                          >
                            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-white' : 'text-gray-900'}`}>
                              {format(dayDate, 'd')}
                            </div>
                            <div className="space-y-1">
                              {day.appointments.slice(0, 3).map(apt => {
                                // Find the full appointment object
                                const fullApt = appointments.find(a => a.id.toString() === apt.id);
                                
                                return (
                                  <div
                                    key={apt.id}
                                    onClick={() => fullApt && handleAppointmentClick(fullApt)}
                                    className="text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                                    style={{
                                      backgroundColor: isToday ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                                      color: isToday ? 'white' : '#374151'
                                    }}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                      <span className="truncate">{apt.time} | {apt.service}</span>
                                    </div>
                                  </div>
                                );
                              })}
                              {day.appointments.length > 3 && (
                                <div className={`text-xs ${isToday ? 'text-white' : 'text-gray-500'}`}>
                                  +{day.appointments.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<PageSkeleton type="list" />}>
      <AppointmentsPageInner />
    </Suspense>
  );
}
