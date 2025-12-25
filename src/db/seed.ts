import * as dotenv from 'dotenv';

// load env vars before importing db
dotenv.config();

import { db } from './index';
import { posts, tags, postTags, comments } from './schema';
import { sql } from 'drizzle-orm';

const tagNames = [
  'javascript',
  'typescript',
  'react',
  'nextjs',
  'nodejs',
  'database',
  'sql',
  'nosql',
  'performance',
  'optimization',
  'architecture',
  'design',
  'tutorial',
  'guide',
  'best-practices',
  'webdev',
  'frontend',
  'backend',
  'fullstack',
  'api',
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('error: DATABASE_URL not set in environment');
    process.exit(1);
  }

  // validate connection string format
  try {
    const url = new URL(process.env.DATABASE_URL);
    if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
      console.error(
        'error: DATABASE_URL must use postgresql:// or postgres:// protocol',
      );
      process.exit(1);
    }
    if (!url.password) {
      console.error('error: password is required in DATABASE_URL');
      console.error(
        'format: postgresql://username:password@host:port/database',
      );
      process.exit(1);
    }
  } catch (_err) {
    console.error('error: invalid DATABASE_URL format');
    console.error(
      'expected format: postgresql://username:password@host:port/database',
    );
    process.exit(1);
  }

  console.log('seeding database...');

  // clear existing data
  await db.execute(
    sql`TRUNCATE TABLE ${comments}, ${postTags}, ${posts}, ${tags} RESTART IDENTITY CASCADE`,
  );

  // insert tags
  const insertedTags = await db
    .insert(tags)
    .values(tagNames.map((name) => ({ name })))
    .returning();

  console.log(`inserted ${insertedTags.length} tags`);

  // create posts with tags and comments
  const postData = [];
  for (let i = 1; i <= 50; i++) {
    postData.push({
      title: `Post ${i}: Understanding Database Optimization Techniques`,
      body: `This is the body content for post ${i}. It contains detailed information about database optimization, query performance, and best practices. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ),
    });
  }

  const insertedPosts = await db.insert(posts).values(postData).returning();
  console.log(`inserted ${insertedPosts.length} posts`);

  // assign random tags to posts (2-5 tags per post)
  const postTagData = [];
  for (const post of insertedPosts) {
    const numTags = Math.floor(Math.random() * 4) + 2; // 2-5 tags
    const shuffled = [...insertedTags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffled.slice(0, numTags);

    for (const tag of selectedTags) {
      postTagData.push({
        postId: post.id,
        tagId: tag.id,
      });
    }
  }

  await db.insert(postTags).values(postTagData);
  console.log(`inserted ${postTagData.length} post-tag relationships`);

  // create comments (2-8 comments per post)
  const commentData = [];
  for (const post of insertedPosts) {
    const numComments = Math.floor(Math.random() * 7) + 2; // 2-8 comments
    for (let j = 0; j < numComments; j++) {
      commentData.push({
        postId: post.id,
        body: `This is comment ${j + 1} on post ${post.id}. Great article! Very informative and helpful.`,
        createdAt: post.createdAt
          ? new Date(
              post.createdAt.getTime() +
                Math.random() * 7 * 24 * 60 * 60 * 1000,
            )
          : new Date(),
      });
    }
  }

  await db.insert(comments).values(commentData);
  console.log(`inserted ${commentData.length} comments`);

  console.log('seeding completed');
}

seed()
  .then(() => {
    console.log('seed script finished');
    process.exit(0);
  })
  .catch((err) => {
    console.error('seed script failed', err);
    process.exit(1);
  });
