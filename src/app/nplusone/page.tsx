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
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">N + 1 Query Problem</h1>
      <p className="text-gray-600 mb-6">
        1 query to fetch posts + N queries to fetch tags per post = 1 + N
        queries total
      </p>

      {result.map((post) => (
        <div key={post.id} className="mb-4 p-4 border rounded">
          <h3 className="text-xl font-semibold">{post.title}</h3>
          <p className="text-gray-600">
            Tags: {post.tags.map((t) => t.name).join(', ') || 'None'}
          </p>
        </div>
      ))}
    </main>
  );
}

// not recommended: 1 + N queries (doesn't scale)
