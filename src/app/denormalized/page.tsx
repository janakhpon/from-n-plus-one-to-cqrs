import { db } from '@/db';
import { deposts } from '@/db/schema';

export default async function DenormalizedPage() {
  // single query from projection table
  const posts = await db
    .select()
    .from(deposts)
    .orderBy(deposts.updatedAt)
    .limit(10);

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 text-zinc-900">
        3. Denormalized Read Model (SSR)
      </h1>
      <p className="text-zinc-600 mb-8 pb-4 border-b">
        Single query using a pre-computed projection table with all data
        denormalized for maximum read performance.
      </p>

      <div className="grid gap-6">
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
                  className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-md"
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
    </main>
  );
}
