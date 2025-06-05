// pages/api/albums/[albumId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRefreshTokenServerSide, getGoogleAlbumWithToken } from '../../../utils/GoogleApi';

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
    
    // Use the token to fetch album
    const albumData = await getGoogleAlbumWithToken(accessToken, albumId);
    
    res.status(200).json(albumData);
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).json({ 
      error: 'Failed to fetch album',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}