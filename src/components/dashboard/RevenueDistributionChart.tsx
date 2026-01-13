// src/components/dashboard/RevenueDistributionChart.tsx
'use client';
import { useState } from 'react';
import { useRevenueDistribution } from '@/hooks/useProviderAnalytics';

export default function RevenueDistributionChart() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useRevenueDistribution({ year: selectedYear, limit });

  // Generate year range (2020 to current year + 1)
  const yearRange = Array.from(
    { length: currentYear - 2020 + 2 },
    (_, i) => 2020 + i
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Revenue Distribution Summary</h2>
          <p className="text-sm text-gray-600 mt-1">Number of patients served according to service package.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Year Selector */}
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

          {/* Limit Selector */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[250px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005994]"></div>
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {data && data.length > 0 ? (
            data.map((item, index) => {
              const revenue = parseFloat(item.revenue);
              const maxRevenue = Math.max(...data.map(d => parseFloat(d.revenue)));
              const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-24 truncate" title={item.service_name}>
                    {item.service_name}
                  </span>
                  <div className="flex-1 bg-gray-100 h-8 relative overflow-hidden">
                    <div
                      className="h-full rounded-tr-xl rounded-br-xl flex items-center justify-end pr-3 transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    >
                      <span className="text-xs font-semibold text-white">
                        ₦{revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              <p>No revenue data available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
