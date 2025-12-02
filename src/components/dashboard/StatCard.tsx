// src/components/dashboard/StatCard.tsx
'use client';
import { Briefcase, Calendar, Wallet, TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: 'briefcase' | 'calendar' | 'wallet';
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
}

export default function StatCard({ icon, label, value, trend }: StatCardProps) {
  const icons = {
    briefcase: Briefcase,
    calendar: Calendar,
    wallet: Wallet,
  };

  const Icon = icons[icon];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
          <Icon className="w-6 h-6 text-[#005994]" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}