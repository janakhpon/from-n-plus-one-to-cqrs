import { db } from '@/db';
import { deposts } from '@/db/schema';
import { sql, desc, count } from 'drizzle-orm';
import Link from 'next/link';

export const revalidate = 60; // isr

async function getPosts(page: number = 1, tag?: string | null) {
  const limit = 10;
  const offset = (page - 1) * limit;

  // build query with array contains
  const where = tag ? sql`${tag} = ANY(${deposts.tags})` : undefined;

  const posts = await db
    .select()
    .from(deposts)
    .where(where)
    .orderBy(desc(deposts.updatedAt))
    .limit(limit)
    .offset(offset);

  // get total count for pagination
  const countResult = await db
    .select({ count: count() })
    .from(deposts)
    .where(where);

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  return { posts, totalPages, currentPage: page };
}

export default async function OptimizedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const { page: pageStr, tag: tagStr } = await searchParams;
  const page = Number(pageStr || 1);
  const tag = tagStr || null;

  const { posts, totalPages, currentPage } = await getPosts(page, tag);

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 text-zinc-900">
        4. Optimized Page (ISR + Cache)
      </h1>
      <p className="text-zinc-600 mb-8 pb-4 border-b">
        Server-side rendered with ISR (60s revalidation) + Redis caching via API
        for lightning-fast performance.
      </p>

      {posts.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-zinc-200 rounded-xl text-zinc-500">
          <p className="font-medium text-zinc-900">No posts found.</p>
          <p className="text-sm mt-1">
            Make sure to seed the database and run the projection.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mb-12">
            {posts.map((post) => (
              <div
                key={post.postId}
                className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm hover:border-zinc-300 transition-colors"
              >
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-zinc-700 mb-3 line-clamp-2">{post.body}</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider mr-2">
                    Tags:
                  </span>
                  {post.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-amber-50 text-amber-600 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                  {!post.tags?.length && (
                    <span className="text-zinc-400 text-xs italic">None</span>
                  )}
                  <div className="ml-auto flex items-center gap-1 text-zinc-500 text-sm font-medium">
                    <span className="text-zinc-400">💬</span>{' '}
                    {post.commentsCount || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/optimized?page=${currentPage - 1}${tag ? `&tag=${tag}` : ''}`}
                  className="px-4 py-2 border rounded hover:bg-zinc-100 transition-colors"
                >
                  Previous
                </Link>
              )}

              <span className="px-4 py-2 text-sm text-zinc-600">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages && (
                <Link
                  href={`/optimized?page=${currentPage + 1}${tag ? `&tag=${tag}` : ''}`}
                  className="px-4 py-2 border rounded hover:bg-zinc-100 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
