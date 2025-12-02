// src/app/(dashboard)/dashboard/page.tsx
'use client';
import { useState } from 'react';
import { useProviderAnalytics } from '@/hooks/useProviderAnalytics';
import { Search, Video, Plus, SquarePlus, Clock, Wallet, Settings } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import BookingRequestsTable from '@/components/dashboard/BookingRequestTable';
import CompletedServiceChart from '@/components/dashboard/CompletdServiceChart';
import DiscountedServiceChart from '@/components/dashboard/DiscountedServiceChart';
import RevenueDistributionChart from '@/components/dashboard/RevenueDistributionChart';
import GeneralStatsChart from '@/components/dashboard/GeneralStatsChart';
import DiscountedServicesList from '@/components/dashboard/DiscountedServiceList';
import PageSkeleton from '@/components/ui/PageSkeleton';
import Link from 'next/link';

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  
  const [year, setYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: analytics, isLoading, error } = useProviderAnalytics({ year });

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
      {/* Search Bar and Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Booking Requests Table */}
          <BookingRequestsTable requests={analytics.booking_requests} />

          {/* Summary Stats */}
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
              value={analytics.total_bookings.toLocaleString()}
              trend="up"
            />
            <StatCard
              icon="wallet"
              label="Total Revenue Generated"
              value={`₦${parseFloat(analytics.total_revenue).toLocaleString()}`}
              trend="up"
            />
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completed Service Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <CompletedServiceChart
            data={analytics.completed_service_performance}
            year={year}
            onYearChange={setYear}
          />
        </div>

        {/* Discounted Services List */}
        <div>
          <DiscountedServicesList services={analytics.discounted_services} />
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discounted Service Performance */}
        <DiscountedServiceChart data={analytics.discounted_service_performance} />

        {/* General Stats */}
        <GeneralStatsChart
          data={analytics.general_stats}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>

      {/* Revenue Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueDistributionChart data={analytics.revenue_distribution} />
      </div>
    </div>
  );
}