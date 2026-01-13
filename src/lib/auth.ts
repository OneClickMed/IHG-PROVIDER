import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * Utility to refresh the access token using Django's /token/refresh/ endpoint
 */
async function refreshAccessToken(token: any) {
  try {
    // console.log('🔄 [NextAuth] Refreshing access token...');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Source': 'provider-app',
        'ngrok-skip-browser-warning': 'true', // Required for ngrok free tier
      },
      body: JSON.stringify({ refresh: token.refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.status}`);
    }

    const data = await response.json();
    const newAccessToken = data.access;

    // console.log('✅ [NextAuth] Token refreshed successfully');

    return {
      ...token,
      accessToken: newAccessToken,
      accessTokenExpires: Date.now() + 5 * 60 * 1000, // 5 minutes
      error: null,
    };
  } catch (error) {
    // console.error('❌ [NextAuth] Token refresh failed:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        // console.log('🔐 [NextAuth] Authorize called with:', credentials?.email);

        if (!credentials?.email || !credentials?.code) {
          // console.error('❌ [NextAuth] Missing credentials');
          return null;
        }

        try {
          const authData = JSON.parse(credentials.code);

          // console.log('✅ [NextAuth] Auth data parsed:', {
          //   userId: authData.user?.id,
          //   email: authData.user?.email,
          //   isProvider: authData.user?.isProvider,
          //   profileId: authData.user?.profileId,
          // });

          if (authData && authData.access && authData.refresh && authData.user) {
            return {
              id: authData.user.id,
              email: authData.user.email,
              accessToken: authData.access,
              refreshToken: authData.refresh,
              isProvider: authData.user.isProvider,
              isCustomer: authData.user.isCustomer,
              profileId: authData.user.profileId,
              name: authData.user.name || null,
              logoUrl: null,
            };
          }

          // console.error('❌ [NextAuth] Invalid auth data structure');
          return null;
        } catch (error) {
          // console.error('❌ [NextAuth] Authorization error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    /**
     * Handles JWT creation, update, auto-sync, and refresh.
     */
    async jwt({ token, user }) {
      // console.log('🔐 [NextAuth] JWT callback');

      // 1️⃣ FIRST LOGIN → Create token
      if (user) {

        return {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 5 * 60 * 1000,
          user: {
            id: user.id,
            email: user.email,
            isProvider: user.isProvider,
            isCustomer: user.isCustomer,
            profileId: user.profileId,
            name: user.name || null,
            logoUrl: null, 
          },
        };
      }

      // 2️⃣ ALWAYS AUTO-SYNC USER PROFILE
      // Determine which profile endpoint to call based on user type
      const profileEndpoint =  `/accounts/profile/provider/`


      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}${profileEndpoint}`,
          {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
              'X-App-Source': 'provider-app',
              'ngrok-skip-browser-warning': 'true', // Required for ngrok free tier
            },
          }
        );

       if (res.ok) {
      const updated = await res.json();

      token.user = {
          ...(token.user as any),
        // PROVIDER-ONLY FIELDS
        name: updated.organization_name || token.user.name,
        email: updated.email || token.user.email,
        logoUrl: updated.logo_url || null,
      };

    } else {
      // console.warn('⚠️ [NextAuth] Failed to sync profile, status:', res.status);
    }

      } catch (err) {
        // console.error('❌ [NextAuth] Failed to sync user profile:', err);
        // Don't fail the entire JWT callback if sync fails
        // The token is still valid, just not synced
      }

      // 3️⃣ Token still valid → return as is
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // 4️⃣ Otherwise token expired → refresh it
      return await refreshAccessToken(token);
    },

    /**
     * Expose token values to client-side session
     */
    async session({ session, token }) {
      // console.log('🔐 [NextAuth] Session callback for:', token.user?.email);

      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.error = token.error as string | undefined;
      session.user = token.user as any;

      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};