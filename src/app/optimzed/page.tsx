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
  searchParams: { page?: string; tag?: string };
}) {
  const page = Number(searchParams.page || 1);
  const tag = searchParams.tag || null;

  const { posts, totalPages, currentPage } = await getPosts(page, tag);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Optimized Page (ISR + Cache)</h1>
      <p className="text-gray-600 mb-6">
        Server-side rendered with ISR (60s revalidation) + Redis caching via API
      </p>

      {posts.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No posts found.</p>
          <p className="text-sm mt-2">
            Make sure to seed the database and run the projection.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {posts.map((post) => (
              <div
                key={post.postId}
                className="p-4 border rounded hover:bg-gray-50"
              >
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-700 mb-2 line-clamp-2">{post.body}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Tags: {post.tags?.join(', ') || 'None'}</span>
                  <span>Comments: {post.commentsCount || 0}</span>
                </div>
              </div>
            ))}
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/optimzed?page=${currentPage - 1}${tag ? `&tag=${tag}` : ''}`}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Previous
                </Link>
              )}

              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages && (
                <Link
                  href={`/optimzed?page=${currentPage + 1}${tag ? `&tag=${tag}` : ''}`}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
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
