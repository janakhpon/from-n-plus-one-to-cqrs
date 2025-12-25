### CQRS, N+1, Normalized and/or Denormalized Database Schema?

Normalized? Denormalized? Projection Builder? What are these things anyway? Are they useful for side projects? For real-world systems? Do I _actually_ need to care about this when building applications?

Can't I just use those new blazingly fast ORMs? TypeORM? Sequelize? Prisma? Drizzle ORM? Oh wait — Drizzle is faster than Prisma, right? Can't I just pick a fast ORM and let it magically make my queries fast without thinking too much about database design?

Let's pause right there.

Even though modern ORMs do a great job improving developer experience, they cannot save a database schema that's out of shape.

We should not think like this:

> "We use Prisma / Sequelize / Drizzle, so performance is handled."

Because in reality:
- ORMs can hide N + 1 queries
- ORMs can generate inefficient SQL
- Clean-looking code can still be very slow

**"We're a small team, it's fine" (famous last words)**

If you're in a small team (like me), an escape thought usually pops up:

> "We're small, the data is small, we don't need to worry about scalability, security, or storage yet. It works fine. Let's not overengineer."

And honestly? I agree with part of that.

- Premature optimization is the root of all evil
- Overengineering is bad
- "Keep it simple" is generally the right instinct

But when it comes to database schema design, there's one thing worth remembering:

> "Small data" does NOT mean "safe design."

You don't need to overengineer, but you should design your schema intentionally.

**So… what are these things actually?**

Let's break them down.

**Normalization**

Normalization ensures correctness, not performance.

It's the process of organizing data to:
- Reduce duplication
- Improve data integrity
- Make relationships explicit

In practice, this means:
- Splitting data into multiple related tables
- Each table has a clear responsibility

Example (simplified):
- `posts`
- `tags`
- `comments`
- join tables like `post_tags`

This makes the data:
- Cleaner
- Safer
- Easier to reason about
- Easier to update correctly

This is what databases are really good at.

**Denormalization**

Denormalization is about performance and simplicity.

It's the process of:
- Combining data from multiple tables
- Storing it in a shape that's easy and fast to read

Developers love this because:
- Queries are simpler
- Fewer JOINs
- Faster APIs
- Cleaner frontend code

But denormalization comes with a cost:
- Data duplication
- Risk of inconsistency if done incorrectly

So… should we just denormalize everything? Not quite.

**The problem: normalized tables are painful to read from**

Let's say we have:
- posts
- tags
- categories
- comments

Schema (simplified):

```text
posts
tags
categories
comments

post_tags        (post_id, tag_id)
post_categories  (post_id, category_id)
comments         (id, post_id, body)
```

Now imagine we want:

> "Give me 100 posts, with their tags, categories, and comments."

If we're not careful… we hit N + 1 queries.

**N + 1 queries (what it actually means)**

N + 1 is not about rows. It's about queries.

Example:

```ts
// 1 query
const posts = await db.query(`SELECT * FROM posts LIMIT 100`);

for (const post of posts) {
  // N queries
  post.tags = await db.query(
    `
    SELECT t.*
    FROM tags t
    JOIN post_tags pt ON pt.tag_id = t.id
    WHERE pt.post_id = $1
  `,
    [post.id],
  );
}
```

If N = 100 posts, then you get:

```text
1 (posts)
+ 100 (tags per post)
= 101 queries
```

**2N + 1 is even worse**

```ts
const posts = await db.query(`SELECT * FROM posts LIMIT 100`);

for (const post of posts) {
  post.tags = await db.query(`... WHERE post_id = $1`, [post.id]);
  post.categories = await db.query(`... WHERE post_id = $1`, [post.id]);
}
```

Now it's:

```text
1 (posts)
+ N (tags)
+ N (categories)
= 2N + 1 queries
```

This grows linearly with data, which is terrible for scalability.

**"But my ORM code looks clean!"**

Yep, that's the trap.

Prisma example:

```ts
const posts = await prisma.post.findMany();

for (const post of posts) {
  const tags = await prisma.tag.findMany({
    where: { posts: { some: { postId: post.id } } },
  });
}
```

Drizzle example:

```ts
const posts = await db.select().from(postsTable);

for (const post of posts) {
  const tags = await db
    .select()
    .from(postTags)
    .where(eq(postTags.postId, post.id));
}
```

Looks fine. Reads nicely. Still N + 1.

> N + 1 is sneaky because it looks innocent.

**How do people usually fix this?**

There's no silver bullet, but here are the common approaches.

**1. Batch fetching + merge in memory (most common)**

Instead of querying per post, fetch everything in batches.

```ts
const posts = await db.query(`SELECT * FROM posts LIMIT 100`);
const postIds = posts.map((p) => p.id);

const tags = await db.query(
  `
  SELECT pt.post_id, t.*
  FROM post_tags pt
  JOIN tags t ON t.id = pt.tag_id
  WHERE pt.post_id = ANY($1)
`,
  [postIds],
);
```

Then group and merge in memory.

Prisma (eager loading):

```ts
const posts = await prisma.post.findMany({
  include: {
    tags: true,
    categories: true,
    comments: true,
  },
});
```

Drizzle (manual batching):

```ts
const posts = await db.select().from(postsTable);
const postIds = posts.map((p) => p.id);

const tags = await db
  .select()
  .from(postTags)
  .where(inArray(postTags.postId, postIds));
```

This works well for many cases, but it's not always enough.

**2. JOINs**

For simple cases (one-to-one, many-to-one), JOINs are great.

```sql
SELECT p.*, t.*, c.*
FROM posts p
LEFT JOIN tags t ON t.post_id = p.id
LEFT JOIN categories c ON c.post_id = p.id;
```

But:
- Too many JOINs
- Cross filtering
- Pagination

This quickly becomes painful. Pagination over joined data is notoriously hard.

**3. CQRS (Command Query Responsibility Segregation)**

This is where things get interesting.

The idea is simple:
- Writes need correctness
- Reads need speed and simplicity

Trying to use one schema for both causes:
- Too many JOINs
- N + 1 problems
- Slow queries
- Messy code

So CQRS separates them.

**How CQRS helps**

- Write to normalized tables (source of truth)
- Read from denormalized tables (UI-friendly)
- Keep them in sync using a projection builder

The projection builder:
- Listens for changes
- Rebuilds read models
- Can be async, event-driven, or cron-based

This gives you:
- Fast reads
- Clean writes
- No N + 1 issues
- Better scalability

**But should everyone use CQRS?**

Short answer: Hell noooo!

Because it adds:
- More moving parts
- More complexity
- More things to maintain

I personally love this approach because it scales extremely well long-term, but I would not recommend it for every project.

Use it when:
- Reads become complex
- Performance actually hurts
- You clearly feel the pain

![Nagato – Pain Quote](./images/pain1.jpg)

> "Those who do not understand true pain can never understand true peace." — Nagato

**4. Caching (last layer)**

Caching is a system-level optimization.

Use it when:
- Your schema is already solid
- Queries are already optimized
- You genuinely need extra speed

Caching bad queries just hides problems.

**Final takeaway**

- Normalize for correctness
- Denormalize for performance
- Use projections when reads become painful
- There is no silver bullet, choose what fits your budget, team size, resources, and use cases

Start simple. Evolve intentionally.

Don't bring big-tech architecture into a tiny project that may never grow. But also don't ignore real problems when they show up.

And when N + 1 appears:
1. Try batching + merging in memory
2. Try better queries or JOINs
3. If it's still messy, CQRS is waiting for you

![Nagato – World Shall Know Pain](./images/pain2.jpeg)

> "Feel pain. Contemplate pain. Accept pain. Know pain. Now this world shall know pain!"

[Read part 2](part2.md) here with hands-on example in Nextjs and walkthrough.