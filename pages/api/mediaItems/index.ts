// pages/api/mediaItems/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRefreshTokenServerSide, getGoogleMediaItemsWithToken } from '../../../utils/GoogleApi';

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
    
    // Use the token to fetch media items
    const pageToken = req.query.pageToken as string | undefined;
    const mediaItemsData = await getGoogleMediaItemsWithToken(accessToken, pageToken);
    
    res.status(200).json(mediaItemsData);
  } catch (error) {
    console.error('Error fetching media items:', error);
    res.status(500).json({ 
      error: 'Failed to fetch media items',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}