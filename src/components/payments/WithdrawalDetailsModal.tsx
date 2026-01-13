// src/components/payments/WithdrawalDetailsModal.tsx
'use client';
import { X, Calendar, CheckCircle, Clock, XCircle, TrendingUp, Ban, Tag, Wallet } from 'lucide-react';
import { useWithdrawalDetails } from '@/hooks/useWithdrawals';

interface WithdrawalDetailsModalProps {
  withdrawalId: number | null;
  onClose: () => void;
}

export default function WithdrawalDetailsModal({ withdrawalId, onClose }: WithdrawalDetailsModalProps) {
  const { data, isLoading } = useWithdrawalDetails(withdrawalId || 0, !!withdrawalId);

  if (!withdrawalId) return null;

  const statusConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
    APPROVED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Approved', icon: CheckCircle },
    PROCESSING: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Processing', icon: TrendingUp },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: CheckCircle },
    FAILED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed', icon: XCircle },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled', icon: Ban },
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Withdrawal Details</h2>
              {data?.withdrawal && (
                <p className="text-sm text-gray-600 mt-1">Reference: {data.withdrawal.reference}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005994]"></div>
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Withdrawal Summary */}
                <div className="bg-gradient-to-br from-[#005994] to-[#003d6b] rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-6 h-6" />
                      <h3 className="text-lg font-semibold">Withdrawal Amount</h3>
                    </div>
                    <div>
                      {data.withdrawal.status && (() => {
                        const config = statusConfig[data.withdrawal.status];
                        const StatusIcon = config.icon;
                        return (
                          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{config.label}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <p className="text-4xl font-bold">₦{Number(data.withdrawal.amount).toLocaleString()}</p>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
                    <div>
                      <p className="text-xs opacity-75">Payments</p>
                      <p className="text-lg font-semibold">{data.withdrawal.payment_count}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Created</p>
                      <p className="text-sm font-semibold">{formatDate(data.withdrawal.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Provider</p>
                      <p className="text-sm font-semibold truncate">{data.withdrawal.provider_name}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.withdrawal.approved_at && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-xs font-medium text-blue-900 mb-1">Approved At</p>
                      <p className="text-sm text-blue-700">{formatDate(data.withdrawal.approved_at)}</p>
                    </div>
                  )}
                  {data.withdrawal.completed_at && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-xs font-medium text-green-900 mb-1">Completed At</p>
                      <p className="text-sm text-green-700">{formatDate(data.withdrawal.completed_at)}</p>
                    </div>
                  )}
                  {data.withdrawal.notes && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:col-span-2">
                      <p className="text-xs font-medium text-gray-900 mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{data.withdrawal.notes}</p>
                    </div>
                  )}
                </div>

                {/* Payments List */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Included Payments ({data.payments?.length || 0})</h3>
                    <p className="text-sm text-gray-600 mt-1">List of all payments in this withdrawal</p>
                  </div>

                  <div className="overflow-x-auto">
                    {data.payments && data.payments.length > 0 ? (
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Reference
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Service
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {data.payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <span className="text-sm font-mono text-gray-900">{payment.reference}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{payment.service_name}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatTime(payment.start_time)} - {formatTime(payment.end_time)}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="text-sm text-gray-900">{payment.customer_name}</p>
                                  <p className="text-xs text-gray-500">{payment.customer_email}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(payment.date)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    ₦{Number(payment.amount).toLocaleString()}
                                  </p>
                                  {payment.had_discount && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                        <Tag className="w-3 h-3" />
                                        {payment.discount_percentage}% OFF
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  payment.status === 'SUCCESS'
                                    ? 'bg-green-100 text-green-700'
                                    : payment.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>No payments found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Footer */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Amount</span>
                    <span className="text-xl font-bold text-[#005994]">
                      ₦{Number(data.withdrawal.amount).toLocaleString()}
                    </span>
                  </div>
                  {data.payments && data.payments.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      {data.payments.length} payment{data.payments.length !== 1 ? 's' : ''} included in this withdrawal
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No withdrawal details found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
