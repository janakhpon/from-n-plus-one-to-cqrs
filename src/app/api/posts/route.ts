import { db } from '@/db';
import { deposts } from '@/db/schema';
import { NextResponse } from 'next/server';
import { sql, desc, count } from 'drizzle-orm';
import { getCachedPosts, setCachedPosts } from '@/utils/redisCache';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get('page') ?? 1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const tag = searchParams.get('tag');

  // try cache first
  const cached = await getCachedPosts(page, tag);
  if (cached) {
    return NextResponse.json(cached);
  }

  // build query with array contains
  const where = tag ? sql`${tag} = ANY(${deposts.tags})` : undefined;

  const posts = await db
    .select()
    .from(deposts)
    .where(where)
    .orderBy(desc(deposts.updatedAt))
    .limit(limit)
    .offset(offset);

  // get total count
  const countResult = await db
    .select({ count: count() })
    .from(deposts)
    .where(where);

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const result = {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  // cache result
  await setCachedPosts(page, tag, result, 60);

  return NextResponse.json(result);
}
