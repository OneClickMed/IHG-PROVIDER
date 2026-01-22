// src/app/(dashboard)/layout.tsx
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { useProviderProfile } from '@/hooks/useProviderProfile';
import {
  Home,
  Users,
  Calendar,
  Briefcase,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Plus,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: profile } = useProviderProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    appointment?: {
      id: number;
      service_title: string;
      provider_name: string;
      customer_name: string;
      date: string;
      start_time: string;
      end_time: string;
      status: string;
    };
  }>({ isOpen: false });
  const displayName = session?.user?.name || session?.user?.email || '';
  const logoUrl = session?.user?.logoUrl || null;
  const [unreadCount, setUnreadCount] = useState(0);


  // Update time and greeting
  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      
      // Format date and time
      const formatted = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' - ' + now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentTime(formatted);

      // Determine greeting based on time of day
      const hour = now.getHours();
      if (hour < 12) {
        setGreeting('Good Morning');
      } else if (hour < 17) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const providerId = session?.user?.profileId || profile?.id;
    const ablyKey = process.env.NEXT_PUBLIC_ABLY_KEY;
    if (!providerId || !ablyKey) return;

    let channel: any;
    let ablyClient: any;
    let isActive = true;

    const setup = async () => {
      const { Realtime } = await import('ably');
      ablyClient = new Realtime({ key: ablyKey });
      channel = ablyClient.channels.get(`provider:${providerId}`);
      const handleUnreadCount = (newCount: number) => {
        setUnreadCount(newCount);
        queryClient.setQueryData(['providerProfile'], (old: any) =>
          old ? { ...old, unread_notifications_count: newCount } : old
        );
        queryClient.setQueryData(['notificationsUnreadCount'], { unread_count: newCount });
      };

      channel.subscribe('notification.new', (message: any) => {
        if (!isActive) return;
        const data = message?.data || {};
        if (typeof data.unread_count === 'number') {
          handleUnreadCount(data.unread_count);
        }

        if (data.appointment?.id) {
          setBookingModal({
            isOpen: true,
            appointment: data.appointment,
          });
          queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
          queryClient.invalidateQueries({ queryKey: ['upcomingAppointments'] });
        }
      });

      channel.subscribe('notification.unread_count', (message: any) => {
        if (!isActive) return;
        const data = message?.data || {};
        if (typeof data.unread_count === 'number') {
          handleUnreadCount(data.unread_count);
        }
      });
    };

    setup();

    return () => {
      isActive = false;
      try {
        channel?.unsubscribe();
        ablyClient?.close();
      } catch {
        // no-op
      }
    };
  }, [profile?.id, queryClient]);

  // Get display name - use name if available, otherwise email, otherwise fallback

  const navigationItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
    { name: 'Services', href: '/dashboard/services', icon: Briefcase },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="h-screen flex overflow-hidden ">
      {/* Sidebar - Fixed */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#EDF6F9] border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Fixed height */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200  p-4">
            <Image
              src="/images/ihg-logo.png"
              alt="Impact Healthcare"
              width={110}
              height={32}
              priority
              className='p-2'
            />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-[#005994] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button - Fixed */}
          <div className="p-4 border-t border-gray-200 shrink-0">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 shrink-0" />
              Log Out
            </button>
          </div>

          {/* Powered by - Fixed */}
          <div className="p-4 text-center border-t border-gray-200 shrink-0">
            <p className="text-xs text-gray-500 mb-2">Powered by</p>
            <Image
              src="/images/oneclickmed.png"
              alt="OneClick Med"
              width={120}
              height={25}
              className="mx-auto"
            />
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area - Takes remaining space */}
      <div className="flex flex-col flex-1 lg:ml-60 overflow-hidden">
        {/* Header - Fixed */}
        <header className="h-16 bg-[#EDF6F9] border-b border-gray-200 shrink-0 z-30">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Date/Time */}
              <div className="hidden sm:block px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded whitespace-nowrap">
                {currentTime}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notification Bell */}
              <Link
                href="/dashboard/notifications"
                className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#005994] rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

 

              {/* Provider Logo and Greeting/Name */}
              <div className="hidden md:flex items-center gap-3">
                {/* Logo */}
                {logoUrl && (
                  <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden shadow-sm  ">
                    <Image
                      src={logoUrl}
                      alt={displayName}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Greeting with user name/email */}
                <span className="text-sm text-gray-700 whitespace-nowrap">
                  {greeting}
                  {displayName && (
                    <span className="font-medium ml-1">
                      {displayName}
                    </span>
                  )}
                </span>
              </div>

              {/* Mobile: Just logo if available */}
              {logoUrl && (
                <div className="md:hidden w-8 h-8 shrink-0 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                  <Image
                    src={logoUrl}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto  bg-white">
          <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>

      {bookingModal.isOpen && bookingModal.appointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setBookingModal({ isOpen: false })}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900">New Service Booking</h2>
            <p className="text-sm text-gray-600 mt-1">
              A new appointment has been booked.
            </p>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium text-gray-900">{bookingModal.appointment.service_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium text-gray-900">{bookingModal.appointment.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{bookingModal.appointment.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">
                  {bookingModal.appointment.start_time} - {bookingModal.appointment.end_time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-gray-900">{bookingModal.appointment.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setBookingModal({ isOpen: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const appointmentId = bookingModal.appointment?.id;
                  setBookingModal({ isOpen: false });
                  if (appointmentId) {
                    router.push(`/dashboard/appointments?appointmentId=${appointmentId}`);
                  } else {
                    router.push('/dashboard/appointments');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-[#005994] rounded-lg hover:bg-[#004070]"
              >
                View Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
