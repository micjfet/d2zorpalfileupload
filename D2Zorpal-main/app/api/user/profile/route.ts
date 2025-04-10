import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { BungieProfile } from '@/types/bungie';

export async function GET(request: NextRequest) {
  console.log('Profile API called');
  
  const headers = Object.fromEntries(request.headers.entries());
  console.log('Request headers:', headers);

  const allCookies = request.cookies.getAll();
  // console.log('All cookies:', allCookies);

  const accessToken = request.cookies.get('access_token')?.value;
  console.log('Access token present:', !!accessToken);

  const apiUrl = request.headers.get('apiUrl');
  console.log('API URL:', apiUrl);

  if(!apiUrl) {
    return NextResponse.json({ error: 'Missing API URL header' }, { status: 400 });
  }

  if (!accessToken) {
    return NextResponse.json({ 
      error: 'Not authenticated',
      debug: {
        cookiesPresent: allCookies.length > 0,
        headers: headers
      }
    }, { status: 401 });
  }

  try {
    console.log('Making Bungie API request...');
    console.log('Access token:', accessToken);
    const response = await axios.get(
      apiUrl,
      {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-API-Key': process.env.NEXT_PUBLIC_BUNGIE_API_KEY!,
      },
      }
    );

    console.log('Bungie API request successful');
    //console.log('Response data:', response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Bungie API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });

    return NextResponse.json({
      error: 'Failed to fetch profile',
      details: error.response?.data,
      debug: {
        statusCode: error.response?.status,
        message: error.message,
        accessTokenPresent: !!accessToken,
        apiKeyPresent: !!process.env.NEXT_PUBLIC_BUNGIE_API_KEY
      }
    }, { 
      status: error.response?.status || 500 
    });
  }
}