// src/components/services/AvailabilityTab.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Clock, AlertCircle, Check, Layers, Loader2 } from 'lucide-react';
import {
  useTimeSlotsByService,
  useCreateTimeSlot,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
  TimeSlot,
} from '@/hooks/useTimeSlots';
import apiClient from '@/lib/api-client';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface AvailabilityTabProps {
  serviceId: string;
  appointmentDuration: number;
}

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

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

const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

interface TimeSlotInput {
  start_time: string;
  end_time: string;
}

// Branded Checkbox Component
function BrandedCheckbox({ 
  checked, 
  onChange, 
  label,
  sublabel
}: { 
  checked: boolean; 
  onChange: () => void;
  label: string;
  sublabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3 group"
    >
      <div
        className={`
          relative w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center
          ${checked 
            ? 'bg-[#005994] border-[#005994] shadow-sm' 
            : 'bg-white border-gray-300 group-hover:border-[#005994]/50'
          }
        `}
      >
        <Check 
          className={`w-4 h-4 text-white transition-all duration-200 ${
            checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          strokeWidth={3}
        />
      </div>
      <div className="text-left">
        <span className={`text-[15px] font-semibold transition-colors ${
          checked ? 'text-gray-900' : 'text-gray-600'
        }`}>
          {label}
        </span>
        {sublabel && (
          <span className="text-xs text-gray-400 ml-2 font-medium">{sublabel}</span>
        )}
      </div>
    </button>
  );
}

export default function AvailabilityTab({ serviceId, appointmentDuration }: AvailabilityTabProps) {
  const { data: timeSlots, isLoading, isError, error } = useTimeSlotsByService(serviceId);
  const createTimeSlot = useCreateTimeSlot();
  const updateTimeSlot = useUpdateTimeSlot();
  const deleteTimeSlot = useDeleteTimeSlot();

  const [daySlots, setDaySlots] = useState<Record<DayOfWeek, TimeSlotInput[]>>({
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
    SUNDAY: [],
  });

  const [activeDays, setActiveDays] = useState<Set<DayOfWeek>>(new Set());
  const [existingSlotIds, setExistingSlotIds] = useState<Record<string, string>>({});

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    slotId?: string;
    day?: DayOfWeek;
    slotIndex?: number;
  }>({ isOpen: false });
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const dayOrder = useMemo(() => {
    const order: Record<DayOfWeek, number> = {
      MONDAY: 0,
      TUESDAY: 1,
      WEDNESDAY: 2,
      THURSDAY: 3,
      FRIDAY: 4,
      SATURDAY: 5,
      SUNDAY: 6,
    };
    return order;
  }, []);

  const normalizeSlots = (
    slots: Array<{ day_of_week: string; start_time: string; end_time: string }>
  ) => {
    return slots
      .filter((slot) => DAYS_OF_WEEK.includes(slot.day_of_week as DayOfWeek))
      .map((slot) => ({
        day_of_week: slot.day_of_week as DayOfWeek,
        start_time: slot.start_time,
        end_time: slot.end_time,
      }))
      .sort((a, b) => {
        const dayDelta = dayOrder[a.day_of_week] - dayOrder[b.day_of_week];
        if (dayDelta !== 0) return dayDelta;
        const startDelta = a.start_time.localeCompare(b.start_time);
        if (startDelta !== 0) return startDelta;
        return a.end_time.localeCompare(b.end_time);
      });
  };

  const hasUnsavedChanges = useMemo(() => {
    const currentSlots: Array<{ day_of_week: string; start_time: string; end_time: string }> = [];
    const orderedActiveDays = Array.from(activeDays).sort(
      (a, b) => dayOrder[a] - dayOrder[b]
    );

    for (const day of orderedActiveDays) {
      for (const slot of daySlots[day]) {
        currentSlots.push({
          day_of_week: day,
          start_time: slot.start_time,
          end_time: slot.end_time,
        });
      }
    }

    const normalizedCurrent = normalizeSlots(currentSlots);
    const normalizedServer = normalizeSlots(
      Array.isArray(timeSlots) ? timeSlots : []
    );

    return JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedServer);
  }, [activeDays, dayOrder, daySlots, timeSlots]);

  useEffect(() => {
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
        
        if (!DAYS_OF_WEEK.includes(day)) {
          return;
        }
        
        newDaySlots[day].push({
          start_time: slot.start_time,
          end_time: slot.end_time,
        });
        newActiveDays.add(day);
        
        const key = `${day}-${slot.start_time}-${slot.end_time}`;
        newExistingSlotIds[key] = slot.id;
      });

      setDaySlots(newDaySlots);
      setActiveDays(newActiveDays);
      setExistingSlotIds(newExistingSlotIds);
    } else if (timeSlots && Array.isArray(timeSlots) && timeSlots.length === 0) {
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
      setDeleteModal({ isOpen: true, slotId, day, slotIndex: index });
    } else {
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
      
      const newSlots = daySlots[deleteModal.day].filter((_, i) => i !== deleteModal.slotIndex);
      setDaySlots({
        ...daySlots,
        [deleteModal.day]: newSlots,
      });

      const slot = daySlots[deleteModal.day][deleteModal.slotIndex];
      const key = `${deleteModal.day}-${slot.start_time}-${slot.end_time}`;
      const newExistingSlotIds = { ...existingSlotIds };
      delete newExistingSlotIds[key];
      setExistingSlotIds(newExistingSlotIds);

      setDeleteModal({ isOpen: false });
    } catch (error) {
      alert('Failed to delete time slot. Please try again.');
    }
  };

  const getApplyErrorMessage = (error: any) => {
    const data = error?.response?.data;
    if (typeof data === 'string') return data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (data?.detail) return data.detail;
    return 'Failed to apply availability. Please try again.';
  };

  const saveAvailability = async (options?: { suppressAlerts?: boolean }) => {
    setIsSaving(true);
    const promises: Promise<any>[] = [];

    for (const day of Array.from(activeDays)) {
      const slots = daySlots[day];

      for (const slot of slots) {
        const key = `${day}-${slot.start_time}-${slot.end_time}`;
        const existingId = existingSlotIds[key];

        if (existingId) {
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

    for (const day of DAYS_OF_WEEK) {
      if (!activeDays.has(day) && daySlots[day].length > 0) {
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
      if (!options?.suppressAlerts) {
        alert('Availability saved successfully!');
      }
      return true;
    } catch (error) {
      if (!options?.suppressAlerts) {
        alert('Failed to save availability. Please try again.');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyToCategory = async () => {
    setApplyError(null);
    setApplySuccess(null);
    setApplyLoading(true);

    try {
      if (hasUnsavedChanges) {
        const saved = await saveAvailability({ suppressAlerts: true });
        if (!saved) {
          setApplyError('Failed to save availability. Please try again.');
          return;
        }
      }

      await apiClient.post('/service-time-slots/apply-to-category/', {
        service_id: serviceId,
      });
      setApplySuccess('Availability applied to all services in this category.');
      setApplyModalOpen(false);
    } catch (error: any) {
      setApplyError(getApplyErrorMessage(error));
    } finally {
      setApplyLoading(false);
    }
  };

  const handleSave = async () => {
    await saveAvailability();
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#005994] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading availability...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">Failed to load availability</p>
          <p className="text-xs text-gray-500">{error?.message || 'Please try again later'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-[#005994]/5 border border-[#005994]/15 rounded-xl p-5">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-[#005994] rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Set Your Business Hours</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Define when you're available to accept appointments. Each appointment is{' '}
              <span className="font-semibold text-[#005994]">{appointmentDuration} minutes</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Actions */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border border-gray-100 rounded-x p-4 space-y-3">
        {applyError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {applyError}
          </div>
        )}
        {applySuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {applySuccess}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          {(() => {
            const isMutating =
              isSaving ||
              applyLoading ||
              createTimeSlot.isPending ||
              updateTimeSlot.isPending ||
              deleteTimeSlot.isPending;
            return (
              <>
                <div className="w-full sm:w-64">
                  <Button
                    variant="outline"
                    onClick={() => setApplyModalOpen(true)}
                    title={applyLoading ? 'Applying...' : 'Apply To Category'}
                    logo={applyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                    color="#005994"
                    disabled={isMutating}
                  />
                </div>
                <div className="w-full sm:w-44">
                  <Button
                    variant="filled"
                    onClick={handleSave}
                    title={isSaving ? 'Saving...' : 'Save Availability'}
                    logo={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                    color="#005994"
                    disabled={isMutating}
                  />
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => {
          const isActive = activeDays.has(day);
          const slots = daySlots[day];

          return (
            <div 
              key={day} 
              className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
                isActive ? 'border-[#005994]/30 ring-1 ring-[#005994]/10' : 'border-gray-200'
              }`}
            >
              {/* Day Header */}
              <div className={`flex items-center justify-between px-5 py-4 ${
                isActive ? 'bg-[#005994]/[0.03]' : 'bg-gray-50/50'
              }`}>
                <BrandedCheckbox
                  checked={isActive}
                  onChange={() => toggleDay(day)}
                  label={DAY_LABELS[day]}
                  sublabel={!isActive ? 'Closed' : undefined}
                />
                
                {isActive && (
                  <button
                    onClick={() => addTimeSlot(day)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#005994] hover:bg-[#005994]/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Hours</span>
                  </button>
                )}
              </div>

              {/* Time Slots */}
              {isActive && (
                <div className="px-5 py-4 space-y-3 border-t border-gray-100">
                  {slots.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">No hours set</p>
                      <p className="text-xs text-gray-400 mt-0.5">Click "Add Hours" above</p>
                    </div>
                  ) : (
                    slots.map((slot, index) => {
                      const slotCount = calculateSlotCount(slot.start_time, slot.end_time);
                      return (
                        <div 
                          key={index} 
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          {/* Time Inputs */}
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                Opens
                              </label>
                              <input
                                type="time"
                                value={slot.start_time}
                                onChange={(e) => updateTimeSlotInput(day, index, 'start_time', e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005994]/20 focus:border-[#005994] transition-all"
                              />
                            </div>
                            
                            <div className="text-gray-300 mt-5">—</div>
                            
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                Closes
                              </label>
                              <input
                                type="time"
                                value={slot.end_time}
                                onChange={(e) => updateTimeSlotInput(day, index, 'end_time', e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005994]/20 focus:border-[#005994] transition-all"
                              />
                            </div>
                          </div>

                          {/* Slot Count Badge */}
                          <div className="flex items-center gap-3">
                            <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                              <span className="text-xs text-gray-500">
                                <span className="font-semibold text-[#005994]">{slotCount}</span>
                                {' '}slot{slotCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => removeTimeSlot(day, index)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove hours"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      <ConfirmationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onConfirm={handleApplyToCategory}
        title="Apply Availability To Category"
        message="This will replace time slots on all your services in the same category with the current service’s availability. This action is irreversible."
        confirmText="Apply Now"
        confirmButtonColor="red"
        isLoading={applyLoading}
      />
    </div>
  );
}
