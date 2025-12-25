// redis cache utility with graceful fallback
type RedisClient = Awaited<ReturnType<typeof import('redis').createClient>>;
let redis: RedisClient | null = null;
let isConnecting = false;
let connectionError = false;

async function getRedisClient() {
  if (connectionError || !process.env.REDIS_URL) {
    return null;
  }

  // lazy load redis module
  if (!redis && !isConnecting) {
    try {
      isConnecting = true;
      const { createClient } = await import('redis');
      redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      redis.on('error', (err: Error) => {
        console.error('redis client error', err);
        connectionError = true;
      });

      await redis.connect();
      isConnecting = false;
    } catch (err) {
      console.warn('redis unavailable, continuing without cache', err);
      connectionError = true;
      isConnecting = false;
      return null;
    }
  }

  // wait for connection
  while (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return redis;
}

export async function getCachedPosts(page: number, tag?: string | null) {
  try {
    const client = await getRedisClient();
    if (!client) return null;

    const cacheKey = `posts:page:${page}:tag:${tag ?? 'all'}`;
    const cached = await client.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn('cache read error', err);
  }

  return null;
}

export async function setCachedPosts(
  page: number,
  tag: string | null | undefined,
  data: unknown,
  ttlSeconds = 60,
) {
  try {
    const client = await getRedisClient();
    if (!client) return;

    const cacheKey = `posts:page:${page}:tag:${tag ?? 'all'}`;
    await client.set(cacheKey, JSON.stringify(data), { EX: ttlSeconds });
  } catch (err) {
    console.warn('cache write error', err);
  }
}
