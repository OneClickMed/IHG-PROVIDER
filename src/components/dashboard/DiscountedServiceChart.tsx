// src/components/dashboard/DiscountedServiceChart.tsx
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DiscountGroup } from '@/hooks/useProviderAnalytics';

interface DiscountedServiceChartProps {
  data: Record<string, DiscountGroup>;
}

export default function DiscountedServiceChart({ data }: DiscountedServiceChartProps) {
  // Transform data for chart
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key,
    count: value.count,
  }));

  const colors = ['#00BCD4', '#FFA726', '#4CAF50', '#FF7043', '#9C27B0'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Discounted Service Performance</h2>

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
          {chartData.map((entry, index) => (
            <Bar 
              key={entry.name}
              dataKey="count"
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}