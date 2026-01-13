// src/app/(dashboard)/dashboard/page.tsx
'use client';
import { useProviderAnalytics } from '@/hooks/useProviderAnalytics';
import { SquarePlus, Wallet, Settings } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import CompletedServiceChart from '@/components/dashboard/CompletdServiceChart';
import DiscountedServiceChart from '@/components/dashboard/DiscountedServiceChart';
import RevenueDistributionChart from '@/components/dashboard/RevenueDistributionChart';
import GeneralStatsChart from '@/components/dashboard/GeneralStatsChart';
import PageSkeleton from '@/components/ui/PageSkeleton';
import NotificationPrompt from '@/components/notifications/NotificationPrompt';
import Link from 'next/link';

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const { data: analytics, isLoading, error } = useProviderAnalytics({ year: currentYear });

  if (isLoading) {
    return <PageSkeleton type="detail" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">Unable to load analytics data</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const quickLinks = [

    { 
      icon: SquarePlus, 
      label: 'Add Service', 
      href: '/dashboard/services/new',
      color: 'bg-[#005994]'
    },

    { 
      icon: Wallet, 
      label: 'Withdraw Funds', 
      href: '/dashboard/payments',
      color: 'bg-[#005994]'
    },
    { 
      icon: Settings, 
      label: 'Change Withdrawal Account', 
      href: '/dashboard/settings',
      color: 'bg-[#005994]'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Notification Prompt */}
      <NotificationPrompt />

      {/* Quick Links and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">

          {/* Summary Stats */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
                              <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Services Stats </h2>
                              <p className="text-sm text-gray-600 mb-4">Overview of all completed services {currentYear}</p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <StatCard
              icon="briefcase"
              label="Total listed services"
              value={analytics.total_services}
              trend="up"
            />
            <StatCard
              icon="calendar"
              label="Total service bookings"
              value={analytics.total_bookings?.toLocaleString()}
              trend="up"
            />
            <StatCard
              icon="wallet"
              label="Total Revenue Generated"
              value={`₦${parseFloat(analytics.total_revenue)?.toLocaleString()}`}
              trend="up"
            />
          </div>

                  </div>


        </div>

        {/* Quick Links Sidebar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="space-y-3">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  href={link.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-10 h-10 ${link.color} rounded-full flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Service Chart */}
        <CompletedServiceChart />

        {/* General Stats */}
        <GeneralStatsChart />
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discounted Service Performance */}
        <DiscountedServiceChart />

        {/* Revenue Distribution */}
        <RevenueDistributionChart />
      </div>
    </div>
  );
}