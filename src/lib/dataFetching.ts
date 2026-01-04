import { db } from '@/db';
import { deposts } from '@/db/schema';
import { sql, desc, count } from 'drizzle-orm';
import { getCachedPosts, setCachedPosts } from '@/utils/redisCache';
import { withRetry } from '@/utils/retry';

export interface Post {
    postId: number;
    title: string | null;
    body: string | null;
    tags: string[] | null;
    commentsCount: number | null;
    updatedAt: Date | null;
}

export interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface FetchPostsResult {
    posts: Post[];
    pagination: PaginationData;
}

/**
 * Shared data fetching logic for posts.
 * Can be used by both API routes and Server Components.
 */
export async function fetchPosts(
    page: number = 1,
    tag: string | null = null,
    limit: number = 10
): Promise<FetchPostsResult> {
    const offset = (page - 1) * limit;

    // 1. Try cache first
    const cached = await getCachedPosts(page, tag);
    if (cached) {
        return cached as FetchPostsResult;
    }

    // 2. Build query
    const where = tag ? sql`${tag} = ANY(${deposts.tags})` : undefined;

    // 3. Fetch from DB with retry logic
    const { posts, total } = await withRetry(async () => {
        const postsData = await db
            .select()
            .from(deposts)
            .where(where)
            .orderBy(desc(deposts.updatedAt))
            .limit(limit)
            .offset(offset);

        const countResult = await db
            .select({ count: count() })
            .from(deposts)
            .where(where);

        return {
            posts: postsData as Post[],
            total: Number(countResult[0]?.count || 0),
        };
    }, {
        onRetry: (err, attempt) => console.warn(`DB Query attempt ${attempt} failed:`, err)
    });

    const totalPages = Math.ceil(total / limit);

    const result: FetchPostsResult = {
        posts,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };

    // 4. Cache the result for future requests
    await setCachedPosts(page, tag, result, 60);

    return result;
}
