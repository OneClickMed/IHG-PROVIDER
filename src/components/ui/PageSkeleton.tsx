// src/components/ui/PageSkeleton.tsx
import React from 'react';

interface PageSkeletonProps {
  type?: 'list' | 'detail';
}

export default function PageSkeleton({ type = 'list' }: PageSkeletonProps) {
  if (type === 'detail') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Main Container */}
        <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden">
          {/* Header Section */}
          <div className="px-8 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
              {/* Action Buttons Skeleton */}
              <div className="flex gap-3 flex-wrap">
                <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="border-b border-gray-200 py-6">
            <div className="px-8">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="px-8 py-8">
            <div className="space-y-8">
              {[1, 2].map((i) => (
                <div key={i}>
                  <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
                  <div className="rounded-lg border border-gray-200 p-6">
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                      <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List type skeleton (default)
  return (
    <div className="space-y-6 animate-pulse">
      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden">
        {/* Header Section */}
        <div className="px-8 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
          </div>

          {/* Search and Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="h-11 w-full max-w-md bg-gray-200 rounded-lg"></div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="h-11 w-40 bg-gray-200 rounded-lg"></div>
              <div className="h-11 w-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="mx-8 mb-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                  <tr key={row}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
                      <td key={col} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Skeleton */}
          <div className="w-full py-4 bg-white border-t border-gray-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-10 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="flex gap-1">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
