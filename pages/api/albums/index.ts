// pages/api/albums/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRefreshTokenServerSide, getGoogleAlbumsWithToken } from '../../../utils/GoogleApi';

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
    
    // Use the token to fetch albums
    const pageToken = req.query.pageToken as string | undefined;
    const albumsData = await getGoogleAlbumsWithToken(accessToken, pageToken);
    
    res.status(200).json(albumsData);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ 
      error: 'Failed to fetch albums',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}