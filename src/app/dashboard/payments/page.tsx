// src/app/(dashboard)/dashboard/payments/page.tsx
'use client';
import { useState } from 'react';
import { 
  Search, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Users,
  Activity,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePaymentAnalytics } from '@/hooks/usePaymentAnalytics';
import { Transaction, Withdrawal } from '@/types/payment';
import PageSkeleton from '@/components/ui/PageSkeleton';

// Stat Card Component
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = 'up',
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600'
}: any) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            changeType === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'up' ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Transaction Row Component
const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  const statusConfig = {
    success: { bg: 'bg-green-100', text: 'text-green-700', label: 'Success' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
  };

  const config = statusConfig[transaction.status];

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900">{transaction.customer}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{transaction.service}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">₦{transaction.amount.toLocaleString()}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{transaction.date}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{transaction.time}</td>
      <td className="px-4 py-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{transaction.reference}</td>
      <td className="px-4 py-3">
        <button className="text-primary hover:text-underline text-sm font-medium">
          View details
        </button>
      </td>
    </tr>
  );
};

// Withdrawal Row Component
const WithdrawalRow = ({ withdrawal }: { withdrawal: Withdrawal }) => {
  const statusConfig = {
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: CheckCircle },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed', icon: XCircle },
  };

  const config = statusConfig[withdrawal.status];
  const StatusIcon = config.icon;

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900">{withdrawal.id}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{withdrawal.bank}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{withdrawal.date}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{withdrawal.time}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">₦{withdrawal.amount.toLocaleString()}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${config.text}`} />
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View details
        </button>
      </td>
    </tr>
  );
};


// Error State Component
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Payment Analytics</h3>
      <p className="text-gray-600 mb-4">Unable to load payment data</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary"
      >
        Retry
      </button>
    </div>
  </div>
);

export default function PaymentAnalyticsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [days, setDays] = useState(30);

  // Fetch analytics data
  const { data, isLoading, error, refetch } = usePaymentAnalytics({ days });

  if (isLoading) {
    return <PageSkeleton type="detail" />;
  }

  if (error || !data) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const quickLinks = [
    { 
      icon: Wallet, 
      label: 'Earning Breakdown', 
      description: 'View detailed income sources',
      href: '/dashboard/payments/earnings',
      color: 'bg-[#005994]'
    },
    { 
      icon: Activity, 
      label: 'Withdrawal History', 
      description: 'Track all withdrawal transactions',
      href: '/dashboard/payments/withdrawals',
      color: 'bg-[#005994]'
    },
    { 
      icon: CreditCard, 
      label: 'Change Withdrawal Account', 
      description: 'Update your bank details',
      href: '/dashboard/settings',
      color: 'bg-[#005994]'
    },
  ];

  // Format change percentages
  const formatChange = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Monitor your financial performance and transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary">
            <Download className="w-4 h-4" />
            <span className="text-sm">Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Wallet Balance - Featured Card */}
          <div className="bg-primary rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium bg-green-500 text-white px-3 py-1 rounded-full">
                Current Wallet Balance
              </span>
              <span className="text-xs opacity-90">Updated now</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold mb-2">₦ {data.current_wallet_balance.toLocaleString()}</p>
                <p className="text-sm opacity-90">Available for withdrawal</p>
              </div>
              <Link
                href="/dashboard/payments/withdraw"
                className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Withdraw Funds
              </Link>
            </div>
          </div>

          {/* Income & Withdrawals Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Income</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">₦ {data.total_income.toLocaleString()}</span>
                    <span className="text-xs text-green-600 font-medium">
                      {formatChange(data.finance_analytics.growth_rate)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">Last {days} days</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Withdrawals</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">₦ {data.total_withdrawals.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">Last {days} days</p>
            </div>
          </div>

          {/* Daily Finance Report Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Daily Finance Report</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded"></div>
                  <span className="text-gray-600">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Withdrawals</span>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="relative h-64">
              {data.daily_finance.length > 0 ? (
                <div className="absolute inset-0 flex items-end justify-around gap-2 pb-8">
                  {data.daily_finance.map((day, index) => {
                    const maxValue = Math.max(
                      ...data.daily_finance.map(d => Math.max(d.income, d.withdrawals)),
                      100
                    );
                    const incomeHeight = (day.income / maxValue) * 100;
                    const withdrawalHeight = (day.withdrawals / maxValue) * 100;

                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div className="w-full flex items-end justify-center gap-1 mb-2" style={{ height: '200px' }}>
                          {/* Income Bar */}
                          <div className="relative flex flex-col items-center flex-1">
                            {day.income > 0 && (
                              <span className="text-xs font-medium text-gray-600 mb-1">
                                {day.income >= 1000 ? `${(day.income / 1000).toFixed(0)}k` : day.income.toFixed(0)}
                              </span>
                            )}
                            <div 
                              className="w-full bg-primary rounded-t transition-all hover:bg-primary"
                              style={{ height: `${incomeHeight}%`, minHeight: day.income > 0 ? '4px' : '0' }}
                            />
                          </div>
                          {/* Withdrawal Bar */}
                          <div className="relative flex flex-col items-center flex-1">
                            {day.withdrawals > 0 && (
                              <span className="text-xs font-medium text-gray-600 mb-1">
                                {day.withdrawals >= 1000 ? `${(day.withdrawals / 1000).toFixed(0)}k` : day.withdrawals.toFixed(0)}
                              </span>
                            )}
                            <div 
                              className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                              style={{ height: `${withdrawalHeight}%`, minHeight: day.withdrawals > 0 ? '4px' : '0' }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 mt-2">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={CheckCircle}
              label="Successful"
              value={data.successful_transactions}
              change={formatChange(data.finance_analytics.growth_rate)}
              changeType={data.finance_analytics.growth_rate >= 0 ? 'up' : 'down'}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={`₦${(data.pending_amount / 1000).toFixed(0)}K`}
              iconBgColor="bg-yellow-100"
              iconColor="text-yellow-600"
            />
            <StatCard
              icon={XCircle}
              label="Failed"
              value={data.failed_transactions}
              iconBgColor="bg-red-100"
              iconColor="text-red-600"
            />
            <StatCard
              icon={Users}
              label="Customers"
              value={data.total_customers}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                  <p className="text-sm text-gray-600 mt-1">Track all payment transactions</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {data.recent_transactions.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_transactions
                      .filter(t => 
                        searchQuery === '' || 
                        t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.reference.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((transaction) => (
                        <TransactionRow key={transaction.id} transaction={transaction} />
                      ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No transactions found
                </div>
              )}
            </div>

            {data.recent_transactions.length > 0 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {data.recent_transactions.length} of {data.total_transactions} transactions
                </p>
              </div>
            )}
          </div>

          {/* Withdrawal History Table */}
          {data.withdrawal_history.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Withdrawal History</h2>
                    <p className="text-sm text-gray-600 mt-1">View all your withdrawal transactions</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">S/N</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Bank Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.withdrawal_history.map((withdrawal) => (
                      <WithdrawalRow key={withdrawal.id} withdrawal={withdrawal} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Links & Analytics */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div className="space-y-3">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors group border border-gray-100"
                  >
                    <div className={`w-10 h-10 ${link.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 block">
                        {link.label}
                      </span>
                      <span className="text-xs text-gray-600 mt-1 block">
                        {link.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Finance Analytics Donut Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Finance Analytics</h2>
            
            {/* Donut Chart */}
            <div className="relative mx-auto w-48 h-48 mb-6">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                {/* Income arc (blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="20"
                  strokeDasharray={`${data.finance_analytics.income_percentage * 2.51} 251.2`}
                  strokeLinecap="round"
                />
                {/* Withdrawal arc (green) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="20"
                  strokeDasharray={`${data.finance_analytics.withdrawal_percentage * 2.51} 251.2`}
                  strokeDashoffset={`-${data.finance_analytics.income_percentage * 2.51}`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {data.finance_analytics.income_percentage.toFixed(0)}%
                </span>
                <span className="text-xs text-gray-600">Income Ratio</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-gray-600">Income</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {data.finance_analytics.income_percentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Withdrawal</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {data.finance_analytics.withdrawal_percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className={`text-sm font-semibold ${
                  data.finance_analytics.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatChange(data.finance_analytics.growth_rate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Month over Month</span>
                <span className={`text-sm font-semibold ${
                  data.finance_analytics.month_over_month >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatChange(data.finance_analytics.month_over_month)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Transaction</span>
                <span className="text-sm font-semibold text-gray-900">
                  ₦{data.average_transaction.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Top Services */}
          {data.top_services.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Services</h2>
              <div className="space-y-3">
                {data.top_services.map((service, index) => (
                  <div key={service.service_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{service.service_name}</p>
                        <p className="text-xs text-gray-600">{service.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₦{service.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Cards */}
          <div className="space-y-3">
            <Link
              href="/dashboard/payments/withdraw"
              className="w-full bg-primary text-white p-4 rounded-lg transition-all shadow-md flex items-center justify-between"
            >
              <span className="font-medium">Withdraw Funds</span>
              <ArrowUpRight className="w-5 h-5" />
            </Link>
            
            <button className="w-full bg-white border-2 border-primary text-primary p-4 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-between">
              <span className="font-medium">Download Report</span>
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}