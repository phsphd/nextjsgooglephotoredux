// pages/api/mediaItems/[mediaItemId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRefreshTokenServerSide, getGoogleMediaItemWithToken } from '../../../utils/GoogleApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mediaItemId } = req.query;
    
    if (!mediaItemId || typeof mediaItemId !== 'string') {
      return res.status(400).json({ error: 'Media Item ID is required' });
    }

    // Get fresh token server-side
    const accessToken = await getAccessTokenFromRefreshTokenServerSide();
    
    // Use the token to fetch media item
    const mediaItemData = await getGoogleMediaItemWithToken(accessToken, mediaItemId);
    
    res.status(200).json(mediaItemData);
  } catch (error) {
    console.error('Error fetching media item:', error);
    res.status(500).json({ 
      error: 'Failed to fetch media item',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}