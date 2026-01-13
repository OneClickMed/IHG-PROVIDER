import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api-client';

export interface ProviderProfile {
  id: number;
  email: string;
  organization_name: string;
  specialty: string;
  bio: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  full_address: string;
  verified: boolean;
  type: string;
  logo: string | null;
  logo_url: string | null;
  organization_active: boolean;
  unread_notifications_count: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateProviderProfileData {
  organization_name?: string;
  specialty?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  type?: string;
  organization_active?: boolean;
  logo?: File;
}

// ===== Fetch Provider Profile =====

const fetchProviderProfile = async (): Promise<ProviderProfile> => {
  // console.log('📥 [Provider Profile] Fetching profile...');
  try {
    const { data } = await apiClient.get('/accounts/profile/provider/');
    // console.log('✅ [Provider Profile] Fetched successfully:', data);
    return data;
  } catch (error: any) {
    // console.error('❌ [Provider Profile] Fetch error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== Update Provider Profile =====

const updateProviderProfile = async (
  updateData: UpdateProviderProfileData
): Promise<ProviderProfile> => {
  // console.log('📤 [Provider Profile] Updating profile...', updateData);

  const formData = new FormData();
  Object.entries(updateData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  try {
    const { data } = await apiClient.patch(
      '/accounts/profile/provider/',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    // console.log('✅ [Provider Profile] Updated successfully:', data);
    return data;
  } catch (error: any) {
    // console.error('❌ [Provider Profile] Update error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== QUERY HOOK =====

export const useProviderProfile = () => {
  const query = useQuery({
    queryKey: ['providerProfile'],
    queryFn: fetchProviderProfile,
    staleTime: 0, // Set to 0 to always consider data stale
    retry: 2,
    refetchOnMount: 'always', // Always refetch on mount to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  /*
  console.log('🔍 [useProviderProfile] Query state:', {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isStale: query.isStale,
    dataUpdatedAt: query.dataUpdatedAt,
  });
  */

  return query;
};

// ===== MUTATION HOOK (WITH IMPROVED SESSION REFRESH) =====

export const useUpdateProviderProfile = () => {
  const queryClient = useQueryClient();
  const { update: refreshSession } = useSession();

  return useMutation({
    mutationFn: updateProviderProfile,
    onSuccess: async (data) => {
      // Step 1: Update React Query cache immediately
      queryClient.setQueryData(['providerProfile'], data);
      /*
      console.log('🔄 [Provider Profile] Cache updated with new data:', {
        organization_name: data.organization_name,
        specialty: data.specialty,
      });
      */

      // Step 2: Trigger session refresh
      // This will call the JWT callback on the backend to sync the updated profile
      // console.log('♻️ [Provider Profile] Triggering session refresh...');
      await refreshSession();
      // console.log('✅ [Provider Profile] Session refreshed');

      // Step 3: Small delay to ensure session state propagates
      // This helps the UI pick up the updated session.user.name
      await new Promise(resolve => setTimeout(resolve, 100));
      // console.log('✅ [Provider Profile] Session update propagated to UI');
    },
    onError: (error: any) => {
      // console.error('❌ [Provider Profile] Mutation error:', error);
    },
  });
};

/**
 * Alternative hook if you want to manually trigger a session update
 * Useful for components that need to sync session after profile changes
 */
export const useSyncProfileWithSession = () => {
  const { update: refreshSession } = useSession();

  return async () => {
    // console.log('🔄 [Session Sync] Manual session sync triggered');
    try {
      await refreshSession();
      // console.log('✅ [Session Sync] Session synced successfully');
    } catch (error) {
      // console.error('❌ [Session Sync] Failed to sync session:', error);
    }
  };
};
