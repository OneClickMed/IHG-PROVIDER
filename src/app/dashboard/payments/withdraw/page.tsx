// src/app/dashboard/payments/withdraw/page.tsx
'use client';
import { useState } from 'react';
import {
  Wallet,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Calendar,
  Ban,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import {
  useAvailableBalance,
  useWithdrawals,
  useCancelWithdrawal,
} from '@/hooks/useWithdrawals';
import { Withdrawal } from '@/types/payment';
import PageSkeleton from '@/components/ui/PageSkeleton';
import WithdrawalDetailsModal from '@/components/payments/WithdrawalDetailsModal';

export default function WithdrawFundsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<number | null>(null);

  const { data: balance, isLoading: balanceLoading } = useAvailableBalance();
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useWithdrawals(selectedStatus);
  const cancelWithdrawal = useCancelWithdrawal();

  const handleCancelWithdrawal = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this withdrawal?')) {
      return;
    }

    try {
      await cancelWithdrawal.mutateAsync(id);
      alert('Withdrawal cancelled successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cancel withdrawal');
    }
  };

  if (balanceLoading || withdrawalsLoading) {
    return <PageSkeleton type="detail" />;
  }

  const statusConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
    APPROVED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Approved', icon: CheckCircle },
    PROCESSING: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Processing', icon: TrendingUp },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: CheckCircle },
    FAILED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed', icon: XCircle },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled', icon: Ban },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/payments"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Payments</span>
          </Link>
        </div>

        <Link
          href="/dashboard/payments/withdraw/request"
          className="flex items-center gap-2 bg-[#005994] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#004070] transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Withdrawal Request
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your withdrawal requests and history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Balance & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Available Balance Card */}
          <div className="bg-gradient-to-br from-[#005994] to-[#003d6b] rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Available Balance</span>
            </div>
            <p className="text-4xl font-bold mb-4">₦{(balance?.available_balance || 0).toLocaleString()}</p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-xs opacity-75">Pending</p>
                <p className="text-lg font-semibold">₦{(balance?.pending_balance || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs opacity-75">Completed</p>
                <p className="text-lg font-semibold">₦{(balance?.completed_balance || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs opacity-75">Payments</p>
                <p className="text-lg font-semibold">{balance?.total_payments || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Summary</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Total Requested</span>
                <span className="text-sm font-semibold text-gray-900">
                  ₦{(withdrawalsData?.summary.total_requested || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Total Completed</span>
                <span className="text-sm font-semibold text-green-600">
                  ₦{(withdrawalsData?.summary.total_completed || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Pending Amount</span>
                <span className="text-sm font-semibold text-yellow-600">
                  ₦{(withdrawalsData?.summary.pending_amount || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Withdrawals</span>
                <span className="text-sm font-semibold text-gray-900">
                  {withdrawalsData?.summary.count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Withdrawal History</h2>
              <p className="text-sm text-gray-600 mt-1">View all your withdrawal transactions</p>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005994]"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {withdrawalsData && withdrawalsData.withdrawals.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Payments
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {withdrawalsData.withdrawals.map((withdrawal) => (
                  <WithdrawalRow
                    key={withdrawal.id}
                    withdrawal={withdrawal}
                    statusConfig={statusConfig}
                    onCancel={handleCancelWithdrawal}
                    onViewDetails={setSelectedWithdrawalId}
                    isCancelling={cancelWithdrawal.isPending}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No withdrawal history found</p>
              <p className="text-sm mt-1">Click "New Withdrawal Request" to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Details Modal */}
      <WithdrawalDetailsModal
        withdrawalId={selectedWithdrawalId}
        onClose={() => setSelectedWithdrawalId(null)}
      />
    </div>
  );
}

// Withdrawal Row Component
const WithdrawalRow = ({
  withdrawal,
  statusConfig,
  onCancel,
  onViewDetails,
  isCancelling,
}: {
  withdrawal: Withdrawal;
  statusConfig: Record<string, { bg: string; text: string; label: string; icon: any }>;
  onCancel: (id: number) => void;
  onViewDetails: (id: number) => void;
  isCancelling: boolean;
}) => {
  const config = statusConfig[withdrawal.status];
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const canCancel = withdrawal.status === 'PENDING';

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3">
        <button
          onClick={() => onViewDetails(withdrawal.id)}
          className="text-sm font-mono text-[#005994] hover:underline font-medium"
        >
          {withdrawal.reference}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {formatDate(withdrawal.created_at)}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-gray-900">₦{withdrawal.amount.toLocaleString()}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-600">{withdrawal.payment_count} payments</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${config.text}`} />
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(withdrawal.id)}
            className="text-[#005994] hover:text-[#004070] text-sm font-medium"
          >
            View Details
          </button>
          {canCancel && (
            <>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => onCancel(withdrawal.id)}
                disabled={isCancelling}
                className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
