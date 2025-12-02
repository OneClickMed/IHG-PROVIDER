// src/components/dashboard/GeneralStatsChart.tsx
'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GeneralStats } from '@/hooks/useProviderAnalytics';
import { useState } from 'react';

interface GeneralStatsChartProps {
  data: GeneralStats;
  month: string;
  onMonthChange: (month: string) => void;
}

export default function GeneralStatsChart({ data, month, onMonthChange }: GeneralStatsChartProps) {
  const chartData = [
    { name: 'Virtual', value: data.virtual, color: '#00838F' },
    { name: 'Physical', value: data.physical, color: '#00BCD4' },
    { name: 'Cancelled', value: data.cancelled, color: '#FFA726' },
  ];

  const total = data.virtual + data.physical + data.cancelled;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">General</h2>
        <MonthSelector month={month} onMonthChange={onMonthChange} />
      </div>

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
    </div>
  );
}

function MonthSelector({ month, onMonthChange }: { month: string; onMonthChange: (month: string) => void }) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="relative inline-block">
      <select
        value={month}
        onChange={(e) => onMonthChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {months.map(m => (
          <option key={m} value={m}>
            {m} 2024
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}