// YouTube チャンネルの最新動画を RSS から取得して JSON で返すプロキシ。
// チャンネル ID は環境変数 YOUTUBE_CHANNEL_ID で指定する。

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_VIDEOS = 3;

interface VideoItem {
  videoId: string;
  title: string;
  published: string;
  thumbnail: string;
}

let cache: { ts: number; videos: VideoItem[] } | null = null;
// 取得に失敗した場合のフォールバック用に、最後に成功した結果を保持する
let lastGood: { ts: number; videos: VideoItem[] } | null = null;

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function tagText(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? decodeEntities(m[1].trim()) : '';
}

function parseRss(xml: string): VideoItem[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const videos: VideoItem[] = [];
  for (const entry of entries) {
    const videoId = tagText(entry, 'yt:videoId');
    if (!videoId) continue;
    const thumbMatch = entry.match(/<media:thumbnail[^>]*url="([^"]+)"/);
    videos.push({
      videoId,
      title: tagText(entry, 'title'),
      published: tagText(entry, 'published'),
      thumbnail: thumbMatch ? thumbMatch[1] : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    });
  }
  return videos;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const channelId = (Deno.env.get('YOUTUBE_CHANNEL_ID') ?? '').trim();
  if (!/^UC[\w-]{22}$/.test(channelId)) {
    return Response.json(
      { error: 'YOUTUBE_CHANNEL_ID is not configured' },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return Response.json({ videos: cache.videos }, { headers: CORS_HEADERS });
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
    );
    if (!res.ok) {
      // 取得に失敗しても、最後に成功したリストがあればそれを返す(古い可能性がある旨をフラグで通知)
      if (lastGood && lastGood.videos.length > 0) {
        return Response.json(
          { videos: lastGood.videos, stale: true },
          { headers: CORS_HEADERS },
        );
      }
      return Response.json(
        { error: `YouTube RSS fetch failed: ${res.status}` },
        { status: 502, headers: CORS_HEADERS },
      );
    }
    const xml = await res.text();
    const videos = parseRss(xml).slice(0, MAX_VIDEOS);
    cache = { ts: Date.now(), videos };
    lastGood = cache;
    return Response.json({ videos }, { headers: CORS_HEADERS });
  } catch (err) {
    if (lastGood && lastGood.videos.length > 0) {
      return Response.json(
        { videos: lastGood.videos, stale: true },
        { headers: CORS_HEADERS },
      );
    }
    return Response.json(
      { error: err instanceof Error ? err.message : 'unknown error' },
      { status: 502, headers: CORS_HEADERS },
    );
  }
});
