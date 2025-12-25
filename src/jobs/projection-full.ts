import { db } from '@/db';
import { posts, tags, postTags, comments, deposts } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function runFullProjection() {
  // truncate before rebuild
  await db.execute(sql`TRUNCATE TABLE ${deposts}`);

  // use drizzle query builder with proper column references
  await db.execute(sql`
    INSERT INTO ${deposts} (
      ${deposts.postId},
      ${deposts.title},
      ${deposts.body},
      ${deposts.tags},
      ${deposts.commentsCount},
      ${deposts.updatedAt}
    )
    SELECT
      ${posts.id},
      ${posts.title},
      ${posts.body},
      array_agg(DISTINCT ${tags.name}),
      COUNT(DISTINCT ${comments.id}),
      now()
    FROM ${posts}
    LEFT JOIN ${postTags} ON ${postTags.postId} = ${posts.id}
    LEFT JOIN ${tags} ON ${tags.id} = ${postTags.tagId}
    LEFT JOIN ${comments} ON ${comments.postId} = ${posts.id}
    GROUP BY ${posts.id}
  `);
}
