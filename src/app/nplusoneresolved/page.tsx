import { db } from '@/db';
import { posts, postTags, tags } from '@/db/schema';
import { inArray, eq } from 'drizzle-orm';

export default async function NPlusOneResolvedPage() {
  // fetch posts (1 query)
  const allPosts = await db.select().from(posts).limit(10);

  const postIds = allPosts.map((p) => p.id);

  // batch fetch all tags (1 query)
  const tagRows = await db
    .select({
      postId: postTags.postId,
      tagName: tags.name,
    })
    .from(postTags)
    .leftJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, postIds));

  // merge tags in memory
  const tagsByPostId = new Map<number, string[]>();

  for (const row of tagRows) {
    if (!tagsByPostId.has(row.postId)) {
      tagsByPostId.set(row.postId, []);
    }
    if (row.tagName) {
      tagsByPostId.get(row.postId)!.push(row.tagName);
    }
  }

  const result = allPosts.map((post) => ({
    ...post,
    tags: tagsByPostId.get(post.id) ?? [],
  }));

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 text-zinc-900">
        2. N + 1 Resolved (Batch Fetching)
      </h1>
      <p className="text-zinc-600 mb-8 pb-4 border-b">
        Performance fix: 1 query to fetch posts + 1 query to fetch all tags = 2
        queries total (regardless of post count).
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
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md"
                >
                  {tag}
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

// recommended: always 2 queries regardless of post count
