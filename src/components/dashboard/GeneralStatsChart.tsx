// src/components/dashboard/GeneralStatsChart.tsx
'use client';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useGeneralStats } from '@/hooks/useProviderAnalytics';
import { Calendar } from 'lucide-react';

export default function GeneralStatsChart() {
  const currentYear = new Date().getFullYear();
  const [viewType, setViewType] = useState<'year' | 'range'>('year');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Build filters based on view type
  const filters = viewType === 'year'
    ? { year: selectedYear }
    : startDate && endDate
      ? { start_date: startDate, end_date: endDate }
      : { year: selectedYear };

  const { data, isLoading } = useGeneralStats(filters);

  const chartData = data ? [
    { name: 'Virtual', value: data.virtual, color: '#00838F' },
    { name: 'Physical', value: data.physical, color: '#00BCD4' },
    { name: 'Cancelled', value: data.cancelled, color: '#FFA726' },
  ] : [];

  const total = data ? data.virtual + data.physical + data.cancelled : 0;

  // Generate year range (2020 to current year + 1)
  const yearRange = Array.from(
    { length: currentYear - 2020 + 2 },
    (_, i) => 2020 + i
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">General Stats</h2>

        <div className="flex items-center gap-2">
          {/* View Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('year')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewType === 'year'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setViewType('range')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewType === 'range'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Date Range
            </button>
          </div>

          {/* Year Selector */}
          {viewType === 'year' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
            >
              {yearRange.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}

          {/* Date Range Selector */}
          {viewType === 'range' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994] pr-8"
                />
                <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <span className="text-gray-500">to</span>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994] pr-8"
                />
                <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[250px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005994]"></div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
                  ''
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {chartData.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
