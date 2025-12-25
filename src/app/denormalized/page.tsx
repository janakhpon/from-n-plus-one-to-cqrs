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
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Denormalized Read Model (SSR)</h1>
      <p className="text-gray-600 mb-6">
        Single query using a pre-computed projection table with all data
        denormalized
      </p>

      {posts.map((post) => (
        <div key={post.postId} className="mb-4 p-4 border rounded">
          <h3 className="text-xl font-semibold">{post.title}</h3>
          <p className="text-gray-700 mb-2">{post.body}</p>
          <p className="text-sm text-gray-600">
            Tags: {post.tags?.join(', ') || 'None'}
          </p>
          <p className="text-sm text-gray-600">
            Comments: {post.commentsCount || 0}
          </p>
        </div>
      ))}
    </main>
  );
}
