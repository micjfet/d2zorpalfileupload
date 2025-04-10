// app/api/auth/callback/bungie/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBaseUrl } from '@/utils/getBaseUrl';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_BUNGIE_CLIENT_ID;
  const clientSecret = process.env.BUNGIE_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('redirect_uri', redirectUri);

  try {
    console.log('Attempting to exchange code for token...');
    const response = await axios.post('https://www.bungie.net/platform/app/oauth/token/', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Token exchange successful');
    const { access_token, refresh_token, expires_in } = response.data;
    const baseUrl = getBaseUrl();

    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + expires_in);

    const responseWithCookies = NextResponse.redirect(new URL('/dashboard/profile', baseUrl));
    
    // Set cookies with more permissive settings for ngrok
    responseWithCookies.cookies.set('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: expirationDate
    });

    console.log('Access token cookie set:', !!access_token);

    if (refresh_token) {
      responseWithCookies.cookies.set('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    return responseWithCookies;
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}