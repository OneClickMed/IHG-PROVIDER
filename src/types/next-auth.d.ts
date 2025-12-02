// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    error?: string;

    user: {
      id: string;
      email: string;
      isProvider: boolean;
      isCustomer: boolean;
      profileId?: string;
      logoUrl?:string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    isProvider: boolean;
    isCustomer: boolean;
    profileId?:string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    user: {
      name: any;
      id: string;
      email: string;
      isProvider: boolean;
      isCustomer: boolean;
    };
  }
}