// components/LoginButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { getBaseUrl } from '@/utils/getBaseUrl';

const LoginButton: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_BUNGIE_CLIENT_ID;
    const redirectUri = `${getBaseUrl()}/api/auth/callback/bungie`; // Use dynamic base URL

    if (!clientId || !redirectUri) {
      console.error('Missing environment variables');
      return;
    }

    const BUNGIE_AUTH_URL = 'https://www.bungie.net/en/OAuth/Authorize';
    const authUrl = `${BUNGIE_AUTH_URL}?client_id=${clientId}&response_type=code&state=your-state&redirect_uri=${redirectUri}`;
    router.push(authUrl);
  };

  return (
    <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
      Login with Bungie
    </button>
  );
};

export default LoginButton;