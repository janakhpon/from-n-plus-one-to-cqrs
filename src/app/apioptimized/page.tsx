import { fetchPosts, type FetchPostsResult } from '@/lib/dataFetching';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ApiOptimizedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page || 1);
  const tag = resolvedSearchParams.tag || null;

  let data: FetchPostsResult | null = null;
  let error: string | null = null;

  try {
    data = await fetchPosts(page, tag);
  } catch (err) {
    console.error('Data fetch error', err);
    error = 'Failed to load posts. Please try again later.';
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">5. API Optimized</h1>
      <p className="text-zinc-600 mb-8 pb-4 border-b">
        High-availability architecture using serverless API patterns, Redis
        caching, and robust database retry logic.
      </p>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-8">
          {error}
        </div>
      ) : !data || !data.posts || data.posts.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-zinc-200 rounded-xl text-zinc-500">
          <p className="font-medium text-zinc-900">No posts found.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mb-12">
            {data.posts.map((post) => (
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
                      className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-md"
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
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {data.pagination.page > 1 && (
                <Link
                  href={`/apioptimized?page=${data.pagination.page - 1}${tag ? `&tag=${tag}` : ''}`}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Previous
                </Link>
              )}

              <span className="px-4 py-2 text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>

              {data.pagination.page < data.pagination.totalPages && (
                <Link
                  href={`/apioptimized?page=${data.pagination.page + 1}${tag ? `&tag=${tag}` : ''}`}
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
