import { db } from '@/db';
import { posts, postTags, tags } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function NPlusOnePage() {
  // fetch posts (1 query)
  const allPosts = await db.select().from(posts).limit(10);

  const result = [];

  for (const post of allPosts) {
    // fetch tags per post (N queries)
    const postTagsRows = await db
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(postTags)
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, post.id));

    result.push({
      ...post,
      tags: postTagsRows,
    });
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 text-zinc-900">
        1. N + 1 Query Problem
      </h1>
      <p className="text-zinc-600 mb-8 pb-4 border-b">
        Demonstrates the classic performance bottleneck: 1 query to fetch posts
        + N queries to fetch tags per post = 1 + N queries total.
      </p>

      <div className="grid gap-6">
        {result.map((post) => (
          <div
            key={post.id}
            className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm hover:border-zinc-300 transition-colors"
          >
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              {post.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t.id}
                  className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-md"
                >
                  {t.name}
                </span>
              ))}
              {post.tags.length === 0 && (
                <span className="text-zinc-400 text-sm italic">No tags</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
