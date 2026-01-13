// src/components/payments/PaymentCheckoutSummary.tsx
'use client';
import { PaymentCheckoutResponse, CartItem } from '@/types/payment';
import { Calendar, Clock, Tag, Receipt, ExternalLink } from 'lucide-react';

interface PaymentCheckoutSummaryProps {
  checkoutData: PaymentCheckoutResponse;
  onProceedToCheckout?: () => void;
}

export default function PaymentCheckoutSummary({
  checkoutData,
  onProceedToCheckout
}: PaymentCheckoutSummaryProps) {
  const handleCheckout = () => {
    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else {
      // Default behavior: redirect to checkout URL
      window.location.href = checkoutData.checkout_url;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatTime = (time: string) => {
    return time;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Summary</h2>
            <p className="text-sm text-gray-600 mt-1">{checkoutData.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Reference</p>
            <p className="text-sm font-mono font-medium text-gray-900">{checkoutData.payment_reference}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer Information</h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-900">{checkoutData.customer_name}</p>
            <p className="text-sm text-gray-600">{checkoutData.customer_email}</p>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Services Booked
          </h3>

          {checkoutData.cart_items.map((item, index) => (
            <CartItemCard key={index} item={item} />
          ))}
        </div>

        {/* Total */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
            <span className="text-3xl font-bold text-[#005994]">
              {formatCurrency(checkoutData.total_amount)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            className="w-full bg-[#005994] text-white py-4 rounded-lg font-semibold hover:bg-[#004070] transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            Proceed to Payment
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Cart Item Card Component
const CartItemCard = ({ item }: { item: CartItem }) => {
  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
  const formatTime = (time: string) => time;
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalSavings = item.had_discount ? item.discount_amount : 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-900">{item.service_name}</h4>
          {item.had_discount && (
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                <Tag className="w-3 h-3" />
                {item.discount_percentage}% OFF
              </span>
              <span className="text-xs text-gray-600">
                Save {formatCurrency(totalSavings)}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          {item.had_discount && (
            <p className="text-sm text-gray-500 line-through">
              {formatCurrency(item.original_price)}
            </p>
          )}
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(item.discounted_price)}
          </p>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(item.date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
        </div>
      </div>
    </div>
  );
};
