'use client';
import { useState } from 'react';
import { Calendar } from 'lucide-react';

export interface DateRange {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
  className?: string;
}

export default function DateRangePicker({
  value,
  onChange,
  label,
  className = '',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      start_date: e.target.value,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      end_date: e.target.value,
    });
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getQuickRange = (type: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const now = new Date();
    const start = new Date();

    switch (type) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      start_date: start.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
    };
  };

  const applyQuickRange = (type: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    onChange(getQuickRange(type));
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 border-2 border-white/30 rounded-lg bg-white/95 hover:bg-white hover:border-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#005994]" />
          <span className="text-sm font-medium text-gray-900">
            {value.start_date && value.end_date
              ? `${formatDisplayDate(value.start_date)} - ${formatDisplayDate(value.end_date)}`
              : 'Select date range'}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-[#005994] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {/* Quick Ranges */}
            <div className="p-3 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Quick Ranges</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Today', type: 'today' as const },
                  { label: 'Last 7 days', type: 'week' as const },
                  { label: 'Last 30 days', type: 'month' as const },
                  { label: 'Last 3 months', type: 'quarter' as const },
                  { label: 'Last year', type: 'year' as const },
                ].map(({ label, type }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => applyQuickRange(type)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Inputs */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={value.start_date}
                  onChange={handleStartDateChange}
                  max={value.end_date || undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#005994]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={value.end_date}
                  onChange={handleEndDateChange}
                  min={value.start_date || undefined}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#005994]"
                />
              </div>
            </div>

            {/* Apply Button */}
            <div className="p-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm bg-[#005994] text-white rounded-md hover:bg-[#004070] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
