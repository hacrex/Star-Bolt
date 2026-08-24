const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const requestJson = async (url: string, init?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`upstream_${response.status}`);
    return data as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
  }
};

const configuredShorts = () => {
  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  const playlistId = Deno.env.get('YOUTUBE_SHORTS_PLAYLIST_ID');
  const ids = (Deno.env.get('YOUTUBE_SHORTS_VIDEO_IDS') || '').split(',').map((id) => id.trim()).filter(Boolean);
  return { apiKey, playlistId, ids };
};

const getShorts = async () => {
  const { apiKey, playlistId, ids } = configuredShorts();
  if (!apiKey || (!playlistId && ids.length === 0)) return { configured: false, items: [] };

  let items: Array<Record<string, unknown>> = [];
  if (ids.length > 0) {
    const data = await requestJson(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(ids.slice(0, 24).join(','))}&key=${encodeURIComponent(apiKey)}`);
    items = Array.isArray(data.items) ? data.items as Array<Record<string, unknown>> : [];
  } else {
    const data = await requestJson(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(playlistId!)}&maxResults=24&key=${encodeURIComponent(apiKey)}`);
    items = Array.isArray(data.items) ? data.items as Array<Record<string, unknown>> : [];
  }

  return {
    configured: true,
    items: items.map((item) => {
      const snippet = item.snippet as Record<string, unknown> | undefined;
      const resource = snippet?.resourceId as Record<string, unknown> | undefined;
      const id = typeof item.id === 'string' ? item.id : typeof resource?.videoId === 'string' ? resource.videoId : '';
      const thumbnails = snippet?.thumbnails as Record<string, Record<string, unknown>> | undefined;
      const high = thumbnails?.high || thumbnails?.medium || thumbnails?.default;
      return {
        id,
        title: typeof snippet?.title === 'string' ? snippet.title : 'Star Lyrix Short',
        description: typeof snippet?.description === 'string' ? snippet.description : '',
        thumbnailUrl: typeof high?.url === 'string' ? high.url : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        publishedAt: typeof snippet?.publishedAt === 'string' ? snippet.publishedAt : null,
        url: `https://www.youtube.com/shorts/${id}`,
      };
    }).filter((item) => item.id),
  };
};

let spotifyToken: { value: string; expiresAt: number } | null = null;
const getSpotifyToken = async () => {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
  if (!clientId || !clientSecret) return null;
  if (spotifyToken && spotifyToken.expiresAt > Date.now() + 30_000) return spotifyToken.value;
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await requestJson('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (typeof response.access_token !== 'string') return null;
  spotifyToken = { value: response.access_token, expiresAt: Date.now() + Number(response.expires_in || 3600) * 1000 };
  return spotifyToken.value;
};

const getSpotifyMatches = async (query: string) => {
  const token = await getSpotifyToken();
  if (!token) return [];
  const data = await requestJson(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8&market=US`, { headers: { Authorization: `Bearer ${token}` } });
  const tracks = (data.tracks as Record<string, unknown> | undefined)?.items;
  if (!Array.isArray(tracks)) return [];
  return tracks.map((track) => {
    const artists = Array.isArray(track.artists) ? track.artists as Array<Record<string, unknown>> : [];
    const album = track.album as Record<string, unknown> | undefined;
    const images = Array.isArray(album?.images) ? album.images as Array<Record<string, unknown>> : [];
    return {
      id: typeof track.id === 'string' ? track.id : '',
      title: typeof track.name === 'string' ? track.name : 'Untitled track',
      artist: typeof artists[0]?.name === 'string' ? artists[0].name : 'Unknown artist',
      album: typeof album?.name === 'string' ? album.name : null,
      thumbnailUrl: typeof images[0]?.url === 'string' ? images[0].url : null,
      spotifyUrl: typeof (track.external_urls as Record<string, unknown> | undefined)?.spotify === 'string' ? (track.external_urls as Record<string, unknown>).spotify as string : null,
      source: 'spotify' as const,
      lyricsAvailable: false,
    };
  }).filter((item) => item.id);
};

const endpointFor = (name: string, value: string) => {
  const template = Deno.env.get(name);
  if (!template) return null;
  return template.includes('{value}') ? template.replace('{value}', encodeURIComponent(value)) : `${template}${template.includes('?') ? '&' : '?'}q=${encodeURIComponent(value)}`;
};

const getMusixmatchMatches = async (query: string) => {
  const endpoint = endpointFor('MUSIXMATCH_PRO_SEARCH_ENDPOINT', query);
  const apiKey = Deno.env.get('MUSIXMATCH_PRO_API_KEY');
  if (!endpoint || !apiKey) return [];
  const data = await requestJson(endpoint, { headers: { Authorization: `Bearer ${apiKey}`, 'X-API-Key': apiKey } });
  const body = (data.message as Record<string, unknown> | undefined)?.body as Record<string, unknown> | undefined;
  const raw = Array.isArray(body?.track_list) ? body.track_list : Array.isArray(data.tracks) ? data.tracks : [];
  return (raw as Array<Record<string, unknown>>).map((entry) => {
    const track = (entry.track as Record<string, unknown> | undefined) || entry;
    return {
      id: String(track.track_id || track.id || ''),
      title: String(track.track_name || track.title || 'Untitled track'),
      artist: String(track.artist_name || track.artist || 'Unknown artist'),
      album: track.album_name ? String(track.album_name) : null,
      thumbnailUrl: null,
      spotifyUrl: null,
      source: 'musixmatch' as const,
      lyricsAvailable: true,
      languageCode: track.lyrics_language ? String(track.lyrics_language) : null,
    };
  }).filter((item) => item.id);
};

const getMusixmatchLyrics = async (trackId: string) => {
  const endpoint = endpointFor('MUSIXMATCH_PRO_LYRICS_ENDPOINT', trackId);
  const apiKey = Deno.env.get('MUSIXMATCH_PRO_API_KEY');
  if (!endpoint || !apiKey) return { configured: false, lyrics: null };
  const data = await requestJson(endpoint, { headers: { Authorization: `Bearer ${apiKey}`, 'X-API-Key': apiKey } });
  const body = (data.message as Record<string, unknown> | undefined)?.body as Record<string, unknown> | undefined;
  const lyrics = (body?.lyrics as Record<string, unknown> | undefined) || (data.lyrics as Record<string, unknown> | undefined);
  const text = typeof lyrics?.lyrics_body === 'string' ? lyrics.lyrics_body : typeof lyrics?.text === 'string' ? lyrics.text : null;
  return { configured: true, lyrics: text };
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const body = await req.json() as Record<string, unknown>;
    const action = body.action;
    if (action === 'shorts') return json(await getShorts());
    if (action === 'lyrics') {
      const query = typeof body.query === 'string' ? body.query.trim().slice(0, 120) : '';
      if (query.length < 2) return json({ configured: false, matches: [] });
      const [musixmatch, spotify] = await Promise.all([getMusixmatchMatches(query), getSpotifyMatches(query)]);
      return json({ configured: musixmatch.length > 0 || spotify.length > 0, matches: [...musixmatch, ...spotify] });
    }
    if (action === 'lyrics_detail' && body.source === 'musixmatch' && typeof body.trackId === 'string') {
      const result = await getMusixmatchLyrics(body.trackId.slice(0, 120));
      return json({ configured: result.configured, trackId: body.trackId, lyrics: result.lyrics, rightsStatus: result.lyrics ? 'authorized' : result.configured ? 'unavailable' : 'pending', notice: result.lyrics ? 'Lyrics supplied through the configured Musixmatch Pro endpoint.' : 'Lyrics are not available for this track through the configured licensed endpoint.' });
    }
    return json({ error: 'Unsupported media action.' }, 400);
  } catch {
    return json({ error: 'The public media catalog is temporarily unavailable.' }, 502);
  }
});
