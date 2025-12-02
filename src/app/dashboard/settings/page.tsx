// src/app/(dashboard)/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useProviderProfile, useUpdateProviderProfile, type UpdateProviderProfileData } from '@/hooks/useProviderProfile';
import { Upload, Save, AlertCircle, CheckCircle2, Loader2, ArrowLeft, ToggleLeft } from 'lucide-react';
import Link from 'next/link';
import PageSkeleton from '@/components/ui/PageSkeleton';

export default function ProviderSettingsPage() {
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useProviderProfile();
  const { mutate: updateProfile, isPending: isUpdating, isSuccess, error: updateError } = useUpdateProviderProfile();

  const [activeTab, setActiveTab] = useState<'availability' | 'basic' | 'contact' | 'branding'>('availability');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState<UpdateProviderProfileData>({
    organization_active: true,
    organization_name: '',
    specialty: '',
    bio: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    type: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        organization_active: profile.organization_active,
        organization_name: profile.organization_name || '',
        specialty: profile.specialty || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        postal_code: profile.postal_code || '',
        type: profile.type || '',
      });

      // Set initial logo preview
      if (profile.logo_url) {
        setLogoPreview(profile.logo_url);
      }
    }
  }, [profile]);

  // Handle success state
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      setSuccessMessage('Profile updated successfully!');
      setLogoFile(null);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  }, [isSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      organization_active: checked
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submitData: UpdateProviderProfileData = { ...formData };
    if (logoFile) {
      submitData.logo = logoFile;
    }

    updateProfile(submitData);
  };

  if (isLoadingProfile) {
    return <PageSkeleton type="detail" />;
  }

  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Settings</h3>
          <p className="text-gray-600 mb-4">Unable to load your profile settings</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#005994] text-white rounded-lg hover:bg-[#004070]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your provider profile and account settings</p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {updateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error updating profile</p>
            <p className="text-red-700 text-sm mt-1">
              {updateError instanceof Error ? updateError.message : 'Something went wrong'}
            </p>
          </div>
        </div>
      )}

      {/* Settings Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('availability')}
            className={`flex-1 min-w-max px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'availability'
                ? 'text-[#005994] border-b-2 border-[#005994]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <ToggleLeft className="w-4 h-4" />
              Availability
            </span>
          </button>
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 min-w-max px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'basic'
                ? 'text-[#005994] border-b-2 border-[#005994]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 min-w-max px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'contact'
                ? 'text-[#005994] border-b-2 border-[#005994]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contact Information
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex-1 min-w-max px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'branding'
                ? 'text-[#005994] border-b-2 border-[#005994]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Branding
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="space-y-8">
              {/* Main Availability Card */}
              <div className={` rounded-lg p-6 transition-all ${
                formData.organization_active
                  ? ' bg-[#f0f5e8]'
                  : ' bg-[#fff3e0]'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Provider Availability
                    </h3>
                    <p className={`text-sm mb-4 ${
                      formData.organization_active
                        ? 'text-[#5A7A2F]'
                        : 'text-[#FFA726]'
                    }`}>
                      {formData.organization_active
                        ? '✓ Your organization is currently ACTIVE. All your services are available to customers.'
                        : '⚠ Your organization is currently PAUSED. All your services will be hidden from customers.'}
                    </p>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>What does this do?</strong>
                      </p>
                      <ul className="text-sm text-gray-600 mt-3 space-y-2 ml-4 list-disc">
                        <li>
                          <strong>Active (ON):</strong> Your services are visible to customers and they can book them
                        </li>
                        <li>
                          <strong>Paused (OFF):</strong> All your services will be hidden and customers cannot book new appointments
                        </li>
                        <li>Existing bookings are not affected when you toggle this setting</li>
                      </ul>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  {/* Toggle Switch */}
<div className="ml-6 flex-shrink-0">
  <div className="flex items-center gap-3">
    <div
      className="relative inline-flex h-8 w-14 items-center rounded-full cursor-pointer transition-colors"
      onClick={() => handleToggleChange(!formData.organization_active)}
      style={
        formData.organization_active
          ? { backgroundColor: '#5A7A2F' }
          : { backgroundColor: '#FFA726' }
      }
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
          formData.organization_active ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </div>

    <div className="text-right">
      <p
        className={`font-semibold ${
          formData.organization_active ? 'text-[#5A7A2F]' : 'text-[#FFA726]'
        }`}
      >
        {formData.organization_active ? 'ACTIVE' : 'PAUSED'}
      </p>
      <p className="text-xs text-gray-600">
        {formData.organization_active ? 'Now accepting bookings' : 'All services hidden'}
      </p>
    </div>
  </div>
</div>

                </div>
              </div>


            </div>
          )}

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleInputChange}
                  placeholder="Your organization name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Specialty
                </label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  placeholder="e.g., Healthcare, Consulting, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Service Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
                  disabled={isUpdating}
                >
                  <option value="">Select a type</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="ORGANIZATION">Organization</option>
                  <option value="CLINIC">Clinic</option>
                  <option value="HOSPITAL">Hospital</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bio / About
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell customers about your services and expertise..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994] resize-none"
                  disabled={isUpdating}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio?.length || 0}/500 characters
                </p>
              </div>

              {profile?.verified && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">✓ Verified Provider</span> - Your account has been verified
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
                  disabled={isUpdating}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    State / Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="United States"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005994]"
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Organization Logo
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a logo to represent your organization. Recommended size: 500x500px
                </p>

                <div className="flex gap-6">
                  {/* Logo Preview */}
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            setLogoFile(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">No image</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Input */}
                  <div className="flex-1">
                    <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#005994] hover:bg-blue-50 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      <input
                        type="file"
                        name="logo"
                        onChange={handleLogoChange}
                        accept="image/png,image/jpeg"
                        className="hidden"
                        disabled={isUpdating}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-6 py-2 bg-[#005994] text-white rounded-lg hover:bg-[#004070] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Account Information Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-base font-medium text-gray-900">{profile?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${profile?.verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <p className="text-base font-medium text-gray-900">
                {profile?.verified ? 'Verified' : 'Pending Verification'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Provider Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${profile?.organization_active ? 'bg-[#5A7A2F]' : 'bg-[#FFA726]'}`} />
              <p className="text-base font-medium text-gray-900">
                {profile?.organization_active ? 'Active' : 'Paused'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Member Since</p>
            <p className="text-base font-medium text-gray-900">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}