// pages/api/debug/token-info.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRefreshTokenServerSide } from '../../../utils/GoogleApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get fresh token server-side
    const accessToken = await getAccessTokenFromRefreshTokenServerSide();
    
    // Check what scopes this token actually has
    const tokenInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    const tokenInfo = await tokenInfoResponse.json();
    
    res.status(200).json({
      tokenInfo,
      message: 'Check the "scope" field to see what permissions this token has'
    });
  } catch (error) {
    console.error('Error checking token info:', error);
    res.status(500).json({ 
      error: 'Failed to check token info',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}