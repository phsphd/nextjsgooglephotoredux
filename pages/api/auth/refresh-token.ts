// pages/api/auth/refresh-token.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRefreshTokenServerSide } from '../../../utils/GoogleApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = await getAccessTokenFromRefreshTokenServerSide();
    
    res.status(200).json({
      access_token: accessToken,
      expires_in: 3600, // 1 hour
      token_type: 'Bearer'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Failed to refresh token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}