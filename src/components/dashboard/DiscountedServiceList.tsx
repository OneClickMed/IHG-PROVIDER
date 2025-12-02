// src/components/dashboard/DiscountedServicesList.tsx
'use client';
import { DiscountedService } from '@/hooks/useProviderAnalytics';
import { Percent } from 'lucide-react';

interface DiscountedServicesListProps {
  services: DiscountedService[];
}

export default function DiscountedServicesList({ services }: DiscountedServicesListProps) {
  if (services.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Discounted Services</h2>
        <p className="text-gray-500 text-center py-8">No active discounts</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Discounted Services</h2>

      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Percent className="w-5 h-5 text-[#005994]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">{service.title}</h3>
                <p className="text-xs text-gray-500">
                  {new Date(service.start_date).toLocaleDateString('en-GB')} - {new Date(service.end_date).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-[#005994]">
                {Number(service.discount_percentage || 0).toFixed(0)}% off

              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}