import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }),
  body: text('body'),
  createdAt: timestamp('created_at'),
});

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
});

export const postTags = pgTable('post_tags', {
  postId: integer('post_id').notNull(),
  tagId: integer('tag_id').notNull(),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull(),
  body: text('body'),
  createdAt: timestamp('created_at'),
});

// denormalized read model (projection table)
export const deposts = pgTable('deposts', {
  postId: integer('post_id').primaryKey(),
  title: varchar('title', { length: 255 }),
  body: text('body'),
  tags: text('tags').array(),
  commentsCount: integer('comments_count'),
  updatedAt: timestamp('updated_at'),
});
