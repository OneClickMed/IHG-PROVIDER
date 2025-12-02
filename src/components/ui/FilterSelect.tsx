// src/components/ui/FilterSelect.tsx
'use client';

import { ChevronDown } from 'lucide-react';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface FilterSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const FilterSelect = forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-2.5 
              bg-white
              border border-gray-300 
              rounded-lg 
              text-sm text-gray-700
              appearance-none
              cursor-pointer
              transition-all duration-200
              hover:border-gray-400
              focus:outline-none 
              focus:ring-2 
              focus:ring-[#005994] 
              focus:border-[#005994]
              disabled:bg-gray-100 
              disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
            <div className="w-px h-5 bg-gray-300 mr-2" />
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

FilterSelect.displayName = 'FilterSelect';

export default FilterSelect;