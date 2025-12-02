// src/components/dashboard/CompletedServiceChart.tsx
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ServicePerformance } from '@/hooks/useProviderAnalytics';

interface CompletedServiceChartProps {
  data: ServicePerformance[];
  year: number;
  onYearChange: (year: number) => void;
}

export default function CompletedServiceChart({ data, year, onYearChange }: CompletedServiceChartProps) {
  // Transform data for recharts
  const chartData = transformDataForChart(data);

  const colors = ['#00BCD4', '#4CAF50', '#9C27B0', '#F44336'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Completed Service</h2>
        <YearSelector year={year} onYearChange={onYearChange} />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
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
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="rect"
          />
          {chartData.length > 0 && Object.keys(chartData[0])
            .filter(key => key !== 'month')
            .map((service, index) => (
              <Bar 
                key={service}
                dataKey={service}
                stackId="a"
                fill={colors[index % colors.length]}
                radius={index === 3 ? [4, 4, 0, 0] : 0}
              />
            ))
          }
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function transformDataForChart(data: ServicePerformance[]) {
  const months = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartData = months.map(month => {
    const monthData: any = { month };
    
    // Get all services for this month
    const monthServices = data.filter(d => d.month === month);
    monthServices.forEach(service => {
      monthData[service.service_name] = service.count;
    });
    
    return monthData;
  });
  
  return chartData;
}

function YearSelector({ year, onYearChange }: { year: number; onYearChange: (year: number) => void }) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="relative inline-block">
      <select
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {years.map(y => (
          <option key={y} value={y}>
            {y} January - December
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