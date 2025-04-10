'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import type { BungieProfile, DestinyProfile } from '@/types/bungie';
import { getWeaponData } from '@/utils/getWeaponData';

export default function Profile() {
  const [profile, setProfile] = useState<BungieProfile | null>(null);
  const [destinyProfile, setDestinyProfile] = useState<DestinyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Fetch the Bungie profile
        const profileResponse = await axios.get<{ Response: BungieProfile }>('/api/user/profile', {
          headers: {
            apiUrl: 'https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/',
          },
        });

        const bungieProfile = profileResponse.data.Response;
        console.log('Bungie profile:', bungieProfile);
        setProfile(bungieProfile);

        // Step 2: Extract primary membership details
        const primaryMembership = bungieProfile.destinyMemberships.find(
          (membership) => membership.membershipId === bungieProfile.primaryMembershipId
        );
        const primaryMembershipType = primaryMembership?.membershipType;
        const primaryMembershipId = primaryMembership?.membershipId;

        if (!primaryMembershipType || !primaryMembershipId) {
          throw new Error('Primary membership details are missing');
        }

        // // Step 3: Fetch the Destiny profile using the primary membership details
        const destinyProfileResponse = await axios.get<{ Response: DestinyProfile }>(`/api/user/profile`, {
          headers: {
            apiUrl: `https://www.bungie.net/Platform/Destiny2/${primaryMembershipType}/Profile/${primaryMembershipId}/?components=700,102,103,104,205,300,302`,
          },
        });

        // Step 4: Update the profile with the Destiny profile data
        const destinyProfile = destinyProfileResponse.data.Response;
        setDestinyProfile(destinyProfile);
        console.log('Destiny profile:', destinyProfile);

      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to load profile';
        setError(errorMessage);

        if (error.response?.status === 401) {
          // Redirect to login
          window.location.href = '/api/auth/login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); 

  

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 w-24 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      ) : profile ? (
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold">{profile.bungieNetUser.displayName}</h2>
          <img
            src={`https://www.bungie.net${profile.bungieNetUser.profilePicturePath}`}
            alt="Profile"
            className="w-24 h-24 rounded-full mt-4"
          />
          <ul className="mt-4">
            {profile.destinyMemberships.map((membership) => (
              <li key={membership.membershipId} className="text-gray-700">
                {membership.displayName} (Type: {membership.membershipType})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}