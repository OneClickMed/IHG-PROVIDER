// src/components/dashboard/CompletedServiceChart.tsx
'use client';
import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCompletedServiceAnalytics, CompletedServiceData } from '@/hooks/useCompletedServiceAnalytics';

export default function CompletedServiceChart() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear);
  const [view, setView] = useState<'yearly' | 'daily'>('yearly');
  const [month, setMonth] = useState<number | undefined>(undefined);

  // Set default month when switching to daily view
  const handleViewChange = (newView: 'yearly' | 'daily') => {
    setView(newView);
    if (newView === 'daily' && month === undefined) {
      setMonth(currentMonth);
    }
  };

  // Only fetch when we have required params (for daily view, month must be selected)
  const shouldFetch = view === 'yearly' || (view === 'daily' && month !== undefined);

  const { data: analytics, isLoading } = useCompletedServiceAnalytics(
    {
      year,
      view,
      month: view === 'daily' ? month : undefined,
    },
    { enabled: shouldFetch }
  );

  // Transform data for recharts
  const chartData = transformDataForChart(analytics?.data || [], view);
  const colors = ['#00BCD4', '#4CAF50', '#9C27B0', '#F44336'];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year range from 2020 to current year + 1
  const yearRange = Array.from(
    { length: currentYear - 2020 + 2 },
    (_, i) => 2020 + i
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Completed Services</h2>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewChange('yearly')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                view === 'yearly'
                  ? 'bg-white text-[#005994] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => handleViewChange('daily')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                view === 'daily'
                  ? 'bg-white text-[#005994] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily
            </button>
          </div>

          {/* Year Selector */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
          >
            {yearRange.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Month Selector (only for daily view) */}
          {view === 'daily' && (
            <select
              value={month || ''}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
            >
              <option value="">Select Month</option>
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {!shouldFetch && view === 'daily' ? (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-500 text-sm">Please select a month to view daily data</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005994]"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          {view === 'yearly' ? (
            <BarChart data={chartData} barSize={40}>
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
                .filter(key => key !== 'month' && key !== 'day' && key !== 'date')
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
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
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
                iconType="circle"
              />
              {chartData.length > 0 && Object.keys(chartData[0])
                .filter(key => key !== 'month' && key !== 'day' && key !== 'date')
                .map((service, index) => (
                  <Line
                    key={service}
                    type="monotone"
                    dataKey={service}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))
              }
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}

function transformDataForChart(data: CompletedServiceData[], view: 'yearly' | 'daily') {
  if (!data || data.length === 0) {
    return [];
  }

  // Group by month/day and service
  const grouped = data.reduce((acc: any[], item) => {
    const key = view === 'yearly' ? item.month : item.day;
    const existing = acc.find(row =>
      view === 'yearly' ? row.month === key : row.day === key
    );

    if (existing) {
      existing[item.service_name] = item.count;
    } else {
      const newRow: any = view === 'yearly'
        ? { month: key }
        : { day: key, date: item.date };
      newRow[item.service_name] = item.count;
      acc.push(newRow);
    }

    return acc;
  }, []);

  return grouped;
}