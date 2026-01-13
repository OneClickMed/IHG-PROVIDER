// src/app/dashboard/payments/withdraw/request/page.tsx
'use client';
import { useState, useMemo } from 'react';
import { ArrowLeft, Wallet, Calendar, Tag, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAvailablePayments, useRequestWithdrawal } from '@/hooks/useWithdrawals';
import { PaymentIntent } from '@/types/payment';
import PageSkeleton from '@/components/ui/PageSkeleton';

export default function WithdrawalRequestPage() {
  const router = useRouter();
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [notes, setNotes] = useState('');

  const { data: availablePayments, isLoading: paymentsLoading } = useAvailablePayments();
  const requestWithdrawal = useRequestWithdrawal();

  // Calculate total from selected payments
  const selectedTotal = useMemo(() => {
    if (!availablePayments || !Array.isArray(availablePayments)) return 0;
    const selectedItems = availablePayments.filter((payment) => selectedPayments.includes(payment.id));
    const total = selectedItems.reduce((sum, payment) => {
      const amount = Number(payment.amount);
      return sum + amount;
    }, 0);
    return total;
  }, [selectedPayments, availablePayments]);

  const handleTogglePayment = (paymentId: number) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId) ? prev.filter((id) => id !== paymentId) : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    if (!availablePayments) return;
    if (selectedPayments.length === availablePayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(availablePayments.map((p) => p.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPayments.length === 0) {
      alert('Please select at least one payment to withdraw');
      return;
    }

    try {
      await requestWithdrawal.mutateAsync({
        amount: selectedTotal,
        payment_ids: selectedPayments,
        notes: notes || undefined,
      });
      alert('Withdrawal request submitted successfully!');
      router.push('/dashboard/payments/withdraw');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit withdrawal request');
    }
  };

  if (paymentsLoading) {
    return <PageSkeleton type="detail" />;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/dashboard/payments" className="hover:text-gray-900 transition-colors">
          Payments
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/dashboard/payments/withdraw" className="hover:text-gray-900 transition-colors">
          Withdrawals
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">New Request</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/payments/withdraw"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Withdrawals</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Withdrawal</h1>
        <p className="text-sm text-gray-600 mt-1">Select payments to withdraw from your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selection Summary */}
        {selectedPayments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedPayments.length} payment(s) selected
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-[#005994]">₦{selectedTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Important Information</p>
              <ul className="text-xs space-y-1 text-blue-800">
                <li>• Select the payments you want to withdraw</li>
                <li>• Withdrawals are processed within 1-3 business days</li>
                <li>• Funds will be sent to your registered bank account</li>
                <li>• You can cancel pending withdrawals anytime</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Available Payments */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Available Payments</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Select payments to include in withdrawal request
                </p>
              </div>
              {availablePayments && availablePayments.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm font-medium text-[#005994] hover:text-[#004070]"
                >
                  {selectedPayments.length === availablePayments.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {availablePayments && availablePayments.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPayments.length === availablePayments.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-[#005994] focus:ring-[#005994]"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {availablePayments.map((payment) => (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                      isSelected={selectedPayments.includes(payment.id)}
                      onToggle={handleTogglePayment}
                    />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No payments available for withdrawal</p>
                <p className="text-sm mt-1">Complete services to earn payments</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add any notes about this withdrawal..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994] text-sm"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 bg-white rounded-lg border border-gray-200 p-6">
          <Link
            href="/dashboard/payments/withdraw"
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={selectedPayments.length === 0 || requestWithdrawal.isPending}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#005994] rounded-lg hover:bg-[#004070] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {requestWithdrawal.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Request Withdrawal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Payment Row Component
const PaymentRow = ({
  payment,
  isSelected,
  onToggle,
}: {
  payment: PaymentIntent;
  isSelected: boolean;
  onToggle: (id: number) => void;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <tr
      className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50' : ''
      }`}
      onClick={() => onToggle(payment.id)}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(payment.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-gray-300 text-[#005994] focus:ring-[#005994]"
        />
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{payment.service_name}</p>
          <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
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
          {formatDate(payment.created_at)}
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">₦{payment.amount.toLocaleString()}</p>
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
    </tr>
  );
};
