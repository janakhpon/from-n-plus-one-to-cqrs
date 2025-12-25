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
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        N + 1 Resolved (Batch Fetching)
      </h1>
      <p className="text-gray-600 mb-6">
        1 query to fetch posts + 1 query to fetch all tags = 2 queries total
        (regardless of post count)
      </p>

      {result.map((post) => (
        <div key={post.id} className="mb-4 p-4 border rounded">
          <h3 className="text-xl font-semibold">{post.title}</h3>
          <p className="text-gray-600">
            Tags: {post.tags.join(', ') || 'None'}
          </p>
        </div>
      ))}
    </main>
  );
}

// recommended: always 2 queries regardless of post count
