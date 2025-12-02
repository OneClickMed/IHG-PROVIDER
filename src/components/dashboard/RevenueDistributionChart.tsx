// src/components/dashboard/RevenueDistributionChart.tsx
'use client';
import { RevenueDistribution } from '@/hooks/useProviderAnalytics';

interface RevenueDistributionChartProps {
  data: RevenueDistribution[];
}

export default function RevenueDistributionChart({ data }: RevenueDistributionChartProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Revenue Distribution Summary</h2>
      <p className="text-sm text-gray-600 mb-6">Number of patients served according to service package.</p>

      <div className="space-y-3">
        {data.map((item, index) => {
          const revenue = parseFloat(item.revenue);
          const maxRevenue = Math.max(...data.map(d => parseFloat(d.revenue)));
          const percentage = (revenue / maxRevenue) * 100;

          return (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-20">
                {item.service_name}
              </span>
              <div className="flex-1 bg-gray-100  h-8 relative overflow-hidden">
                <div
                  className="h-full rounded-tr-xl rounded-br-xl  flex items-center justify-end pr-3 transition-all duration-500"

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
        })}
      </div>
    </div>
  );
}