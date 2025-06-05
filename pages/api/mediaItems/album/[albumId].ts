// pages/api/mediaItems/album/[albumId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRefreshTokenServerSide, getGoogleMediaItemsAlbumWithToken } from '../../../../utils/GoogleApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { albumId } = req.query;
    
    if (!albumId || typeof albumId !== 'string') {
      return res.status(400).json({ error: 'Album ID is required' });
    }

    // Get fresh token server-side
    const accessToken = await getAccessTokenFromRefreshTokenServerSide();
    
    // Use the token to fetch album media items
    const pageToken = req.query.pageToken as string | undefined;
    const mediaItemsData = await getGoogleMediaItemsAlbumWithToken(accessToken, albumId, pageToken);
    
    res.status(200).json(mediaItemsData);
  } catch (error) {
    console.error('Error fetching album media items:', error);
    res.status(500).json({ 
      error: 'Failed to fetch album media items',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}