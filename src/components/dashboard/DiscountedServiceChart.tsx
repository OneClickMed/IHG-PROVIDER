// src/components/dashboard/DiscountedServiceChart.tsx
'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDiscountedServiceAnalytics } from '@/hooks/useDiscountedServiceAnalytics';

export default function DiscountedServiceChart() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data: analytics, isLoading } = useDiscountedServiceAnalytics({ year });

  // Transform data for chart
  const chartData = analytics?.summary_by_discount_group.map(group => ({
    name: group.discount_range,
    appointments: group.total_appointments,
    revenue: parseFloat(group.total_revenue.toString()),
  })) || [];

  const colors = ['#00BCD4', '#FFA726', '#4CAF50', '#FF7043', '#9C27B0'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Discounted Service Performance</h2>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
        >
          {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005994]"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px'
              }}
            />
            <Bar
              dataKey="appointments"
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Summary Stats */}
      {analytics && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Total Discounted Services</p>
              <p className="text-lg font-semibold text-gray-900">{analytics.total_discounted_services}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Appointments</p>
              <p className="text-lg font-semibold text-gray-900">
                {analytics.summary_by_discount_group.reduce((sum, g) => sum + g.total_appointments, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}