// src/components/services/AvailabilityTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import {
  useTimeSlotsByService,
  useCreateTimeSlot,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
  TimeSlot,
} from '@/hooks/useTimeSlots';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface AvailabilityTabProps {
  serviceId: string;
  appointmentDuration: number; // in minutes
}

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

// Match backend order: MONDAY through SUNDAY
const DAYS_OF_WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

interface TimeSlotInput {
  start_time: string;
  end_time: string;
}

export default function AvailabilityTab({ serviceId, appointmentDuration }: AvailabilityTabProps) {
  const { data: timeSlots, isLoading, isError, error } = useTimeSlotsByService(serviceId);
  const createTimeSlot = useCreateTimeSlot();
  const updateTimeSlot = useUpdateTimeSlot();
  const deleteTimeSlot = useDeleteTimeSlot();

  // State for managing time slots by day
  const [daySlots, setDaySlots] = useState<Record<DayOfWeek, TimeSlotInput[]>>({
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
    SUNDAY: [],
  });

  // State for active days
  const [activeDays, setActiveDays] = useState<Set<DayOfWeek>>(new Set());

  // State for existing slot IDs (for updates/deletes)
  const [existingSlotIds, setExistingSlotIds] = useState<Record<string, string>>({});

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    slotId?: string;
    day?: DayOfWeek;
    slotIndex?: number;
  }>({ isOpen: false });

  // Initialize state from fetched time slots
  useEffect(() => {
    // console.log('📊 Time Slots Data:', timeSlots);
    
    if (timeSlots && Array.isArray(timeSlots) && timeSlots.length > 0) {
      const newDaySlots: Record<DayOfWeek, TimeSlotInput[]> = {
        MONDAY: [],
        TUESDAY: [],
        WEDNESDAY: [],
        THURSDAY: [],
        FRIDAY: [],
        SATURDAY: [],
        SUNDAY: [],
      };
      const newActiveDays = new Set<DayOfWeek>();
      const newExistingSlotIds: Record<string, string> = {};

      timeSlots.forEach((slot: TimeSlot) => {
        const day = slot.day_of_week as DayOfWeek;
        
        // Validate day is in our expected list
        if (!DAYS_OF_WEEK.includes(day)) {
          // console.warn(`Invalid day_of_week: ${day}`, slot);
          return;
        }
        
        newDaySlots[day].push({
          start_time: slot.start_time,
          end_time: slot.end_time,
        });
        newActiveDays.add(day);
        
        // Store ID with a unique key
        const key = `${day}-${slot.start_time}-${slot.end_time}`;
        newExistingSlotIds[key] = slot.id;
      });

      // console.log('✅ Initialized Day Slots:', newDaySlots);
      // console.log('✅ Active Days:', Array.from(newActiveDays));

      setDaySlots(newDaySlots);
      setActiveDays(newActiveDays);
      setExistingSlotIds(newExistingSlotIds);
    } else if (timeSlots && Array.isArray(timeSlots) && timeSlots.length === 0) {
      // console.log('ℹ️ No time slots found - initializing empty state');
      // Initialize empty state
      setDaySlots({
        MONDAY: [],
        TUESDAY: [],
        WEDNESDAY: [],
        THURSDAY: [],
        FRIDAY: [],
        SATURDAY: [],
        SUNDAY: [],
      });
      setActiveDays(new Set());
      setExistingSlotIds({});
    }
  }, [timeSlots]);

  const toggleDay = (day: DayOfWeek) => {
    const newActiveDays = new Set(activeDays);
    if (newActiveDays.has(day)) {
      newActiveDays.delete(day);
    } else {
      newActiveDays.add(day);
      // Add a default time slot if none exists
      if (daySlots[day].length === 0) {
        setDaySlots({
          ...daySlots,
          [day]: [{ start_time: '09:00', end_time: '17:00' }],
        });
      }
    }
    setActiveDays(newActiveDays);
  };

  const addTimeSlot = (day: DayOfWeek) => {
    setDaySlots({
      ...daySlots,
      [day]: [...daySlots[day], { start_time: '09:00', end_time: '17:00' }],
    });
  };

  const updateTimeSlotInput = (day: DayOfWeek, index: number, field: 'start_time' | 'end_time', value: string) => {
    const newSlots = [...daySlots[day]];
    newSlots[index][field] = value;
    setDaySlots({
      ...daySlots,
      [day]: newSlots,
    });
  };

  const removeTimeSlot = (day: DayOfWeek, index: number) => {
    const slot = daySlots[day][index];
    const key = `${day}-${slot.start_time}-${slot.end_time}`;
    const slotId = existingSlotIds[key];

    if (slotId) {
      // This is an existing slot in the database, show confirmation
      setDeleteModal({ isOpen: true, slotId, day, slotIndex: index });
    } else {
      // This is a new slot not yet saved, remove directly
      const newSlots = daySlots[day].filter((_, i) => i !== index);
      setDaySlots({
        ...daySlots,
        [day]: newSlots,
      });
    }
  };

  const confirmDeleteSlot = async () => {
    if (!deleteModal.slotId || !deleteModal.day || deleteModal.slotIndex === undefined) return;

    try {
      await deleteTimeSlot.mutateAsync(deleteModal.slotId);
      
      // Remove from local state
      const newSlots = daySlots[deleteModal.day].filter((_, i) => i !== deleteModal.slotIndex);
      setDaySlots({
        ...daySlots,
        [deleteModal.day]: newSlots,
      });

      // Remove from existingSlotIds
      const slot = daySlots[deleteModal.day][deleteModal.slotIndex];
      const key = `${deleteModal.day}-${slot.start_time}-${slot.end_time}`;
      const newExistingSlotIds = { ...existingSlotIds };
      delete newExistingSlotIds[key];
      setExistingSlotIds(newExistingSlotIds);

      setDeleteModal({ isOpen: false });
    } catch (error) {
      // console.error('Failed to delete time slot:', error);
      alert('Failed to delete time slot. Please try again.');
    }
  };

  const handleSave = async () => {
    const promises: Promise<any>[] = [];

    // Process each active day
    for (const day of Array.from(activeDays)) {
      const slots = daySlots[day];

      for (const slot of slots) {
        const key = `${day}-${slot.start_time}-${slot.end_time}`;
        const existingId = existingSlotIds[key];

        if (existingId) {
          // Update existing slot
          promises.push(
            updateTimeSlot.mutateAsync({
              id: existingId,
              data: {
                day_of_week: day,
                start_time: slot.start_time,
                end_time: slot.end_time,
                is_active: true,
              },
            })
          );
        } else {
          // Create new slot
          promises.push(
            createTimeSlot.mutateAsync({
              service: serviceId,
              day_of_week: day,
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_active: true,
            })
          );
        }
      }
    }

    // Handle inactive days - delete their slots
    for (const day of DAYS_OF_WEEK) {
      if (!activeDays.has(day) && daySlots[day].length > 0) {
        // Delete all slots for this inactive day
        for (const slot of daySlots[day]) {
          const key = `${day}-${slot.start_time}-${slot.end_time}`;
          const existingId = existingSlotIds[key];
          if (existingId) {
            promises.push(deleteTimeSlot.mutateAsync(existingId));
          }
        }
      }
    }

    try {
      await Promise.all(promises);
      alert('Availability saved successfully!');
    } catch (error) {
      // console.error('Failed to save availability:', error);
      alert('Failed to save availability. Please try again.');
    }
  };

  const calculateSlotCount = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const totalMinutes = endMinutes - startMinutes;
    
    return Math.floor(totalMinutes / appointmentDuration);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005994] mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600">Loading availability...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center text-red-600">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <p className="text-base font-semibold mb-2">Failed to load availability</p>
          <p className="text-sm text-gray-600">{error?.message || 'Please try again later'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 border   border-[#005994]/40 rounded-xl p-5  ">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-white rounded-lg  ">
            <Clock className="w-5 h-5 text-[#005994]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[#005994] mb-2.5 tracking-tight">Set Your Business Hours</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-2.5">
              Define when you're available to accept appointments. Each appointment will be <span className="font-semibold text-gray-900">{appointmentDuration} minutes</span> long.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              You can set multiple availability windows for each day (e.g., morning and afternoon shifts).
            </p>
          </div>
        </div>
      </div>

      {/* Days of Week */}
      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => {
          const isActive = activeDays.has(day);
          const slots = daySlots[day];

          return (
            <div 
              key={day} 
              className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
                isActive ? '   border-[#005994]/40  ' : 'border-gray-200'
              }`}
            >
              {/* Day Header */}
              <div className={`flex items-center justify-between p-4 transition-colors ${
                isActive ? 'bg-gradient-to-r from-gray-50 to-blue-50/30' : 'bg-gray-50/50'
              }`}>
                <div className="flex items-center gap-3.5">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleDay(day)}
                    className="w-5 h-5 text-[#005994] rounded border-gray-300 focus:ring-[#005994] focus:ring-offset-0 cursor-pointer transition-all"
                  />
                  <div>
                    <span className="text-[15px] font-semibold text-gray-900 tracking-tight">{DAY_LABELS[day]}</span>
                    {!isActive && <span className="text-xs text-gray-500 ml-2 font-medium">Closed</span>}
                  </div>
                </div>
                {isActive && (
                  <button
                    onClick={() => addTimeSlot(day)}
                    className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-[#005994] hover:bg-blue-100/70 rounded-lg transition-all duration-150 hover: "
                  >
                    <Plus className="w-4 h-4" />
                    Add Hours
                  </button>
                )}
              </div>

              {/* Time Slots */}
              {isActive && (
                <div className="p-4 space-y-3 bg-white">
                  {slots.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-1">No business hours set</p>
                      <p className="text-xs text-gray-500">Click "Add Hours" to set your opening times</p>
                    </div>
                  ) : (
                    slots.map((slot, index) => {
                      const slotCount = calculateSlotCount(slot.start_time, slot.end_time);
                      return (
                        <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-4 border border-gray-200/60   hover:shadow-md transition-shadow duration-150">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5">
                              <label className="text-xs text-gray-600 font-semibold tracking-wide uppercase">Open</label>
                              <input
                                type="time"
                                value={slot.start_time}
                                onChange={(e) => updateTimeSlotInput(day, index, 'start_time', e.target.value)}
                                className="px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005994]/50 focus:border-[#005994] text-sm font-medium transition-all   hover:border-gray-400"
                              />
                            </div>
                            <span className="text-gray-400 text-lg">→</span>
                            <div className="flex items-center gap-2.5">
                              <label className="text-xs text-gray-600 font-semibold tracking-wide uppercase">Close</label>
                              <input
                                type="time"
                                value={slot.end_time}
                                onChange={(e) => updateTimeSlotInput(day, index, 'end_time', e.target.value)}
                                className="px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005994]/50 focus:border-[#005994] text-sm font-medium transition-all   hover:border-gray-400"
                              />
                            </div>
                            <div className="flex items-center gap-2.5 ml-auto">
                              <span className="text-xs font-medium text-gray-700 bg-white px-3.5 py-2 rounded-lg border border-gray-200  ">
                                <span className="text-[#005994] font-semibold">{slotCount}</span> appointment{slotCount !== 1 ? 's' : ''} per shift
                              </span>
                              <button
                                onClick={() => removeTimeSlot(day, index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 hover: "
                                title="Remove hours"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <div className="w-48">
          <Button
            variant="filled"
            onClick={handleSave}
            title="Save Availability"
            color="#005994"
            disabled={createTimeSlot.isPending || updateTimeSlot.isPending || deleteTimeSlot.isPending}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDeleteSlot}
        title="Delete Business Hours"
        message="Are you sure you want to delete these hours? This action cannot be undone and may affect existing bookings."
        confirmText="Delete"
        confirmButtonColor="red"
        isLoading={deleteTimeSlot.isPending}
      />
    </div>
  );
}