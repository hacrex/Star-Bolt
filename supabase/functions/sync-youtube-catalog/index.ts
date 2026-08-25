import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const syncSecret = Deno.env.get('YOUTUBE_SYNC_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
const channelHandle = Deno.env.get('YOUTUBE_CHANNEL_HANDLE') || '@starlyrix';
const shortsPlaylistId = Deno.env.get('YOUTUBE_SHORTS_PLAYLIST_ID');
const explicitVideoIds = (Deno.env.get('YOUTUBE_SHORTS_VIDEO_IDS') || '').split(',').map((id) => id.trim()).filter(Boolean);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-star-lyrix-sync-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const requestYouTube = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) throw new Error('youtube_request_failed');
    return data;
  } finally {
    clearTimeout(timeout);
  }
};

const getItems = async () => {
  if (!youtubeApiKey || (!shortsPlaylistId && explicitVideoIds.length === 0)) throw new Error('youtube_not_configured');
  if (explicitVideoIds.length > 0) {
    const data = await requestYouTube(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(explicitVideoIds.slice(0, 50).join(','))}&key=${encodeURIComponent(youtubeApiKey)}`);
    return Array.isArray(data.items) ? data.items as Array<Record<string, unknown>> : [];
  }
  const data = await requestYouTube(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(shortsPlaylistId!)}&maxResults=50&key=${encodeURIComponent(youtubeApiKey)}`);
  return Array.isArray(data.items) ? data.items as Array<Record<string, unknown>> : [];
};

const mapVideo = (item: Record<string, unknown>) => {
  const snippet = item.snippet as Record<string, unknown> | undefined;
  const contentDetails = item.contentDetails as Record<string, unknown> | undefined;
  const resourceId = snippet?.resourceId as Record<string, unknown> | undefined;
  const videoId = typeof item.id === 'string' ? item.id : typeof contentDetails?.videoId === 'string' ? contentDetails.videoId : typeof resourceId?.videoId === 'string' ? resourceId.videoId : '';
  const thumbnails = snippet?.thumbnails as Record<string, Record<string, unknown>> | undefined;
  const thumbnail = thumbnails?.maxres || thumbnails?.high || thumbnails?.medium || thumbnails?.default;
  return {
    youtube_video_id: videoId,
    channel_handle: channelHandle,
    title: typeof snippet?.title === 'string' ? snippet.title : 'Star Lyrix Short',
    description: typeof snippet?.description === 'string' ? snippet.description : '',
    thumbnail_url: typeof thumbnail?.url === 'string' ? thumbnail.url : null,
    published_at: typeof snippet?.publishedAt === 'string' ? snippet.publishedAt : null,
    content_type: 'short',
    youtube_url: `https://www.youtube.com/shorts/${videoId}`,
    is_public: true,
    synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ code: 'method_not_allowed', error: 'Method not allowed' }, 405);
  const requestSecret = req.headers.get('x-star-lyrix-sync-secret') || req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!syncSecret || !requestSecret || requestSecret !== syncSecret) return json({ code: 'unauthorized', error: 'Unauthorized sync request.' }, 401);
  if (!supabaseUrl || !serviceRoleKey) return json({ code: 'not_configured', error: 'Supabase server configuration is incomplete.' }, 503);

  try {
    const items = (await getItems()).map(mapVideo).filter((item) => item.youtube_video_id);
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await admin.from('youtube_videos').upsert(items, { onConflict: 'youtube_video_id' });
    if (error) throw new Error('catalog_write_failed');
    return json({ synced: items.length, channelHandle });
  } catch {
    return json({ code: 'sync_failed', error: 'The YouTube catalog sync could not be completed.' }, 502);
  }
});
