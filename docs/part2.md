## Part 2: From Pain to Peace — Hands-on with Next.js

So, you've read [Part 1](part1.md) and you're ready to see what true database optimization feels like? Good. Let's get our hands dirty.

We're going to build a simple blog demo to see these patterns in action. No fluff, just real code.

### Setup

I've kept the setup as minimal as possible. We use `docker-compose` so you don't have to install Postgres or Redis globally. One command, and you're ready to go.

> [!TIP]
> Use either `docker-compose up -d` or`docker compose up -d` to run everything in the background. Your terminal will thank you later.

### 1. The N+1 Query Problem (The Performance Killer)

Let's look at the "wrong" way first. This is where most developers start, and where the performance nightmare begins.

In `/src/app/nplusone/page.tsx`, the code looks clean, but it's a trap:

```tsx: /src/app/nplusone/page.tsx
  // 1 query to fetch posts
  const allPosts = await db.select().from(posts).limit(10);

  const result = [];

  for (const post of allPosts) {
    // N queries to fetch tags PER post
    const postTagsRows = await db
      .select({ id: tags.id, name: tags.name })
      .from(postTags)
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, post.id));

    result.push({ ...post, tags: postTagsRows });
  }
```

**"But it's only 10 posts!"**

Sure, today. But tomorrow? If you have 100 posts, you hit the DB **101 times**. 1000 posts? **1001 times**.

> N + 1 is Not about rows. It's about roundtrips.

![The Pain of N+1](./images/genjutsu.jpg)

> "Trapped in the cycle of inefficient queries."

### 2. N+1 Resolved (The Batch Fetching Fix)

The solution is simple: **Batching**. Stop asking for tags one by one. Ask for all of them at once.

In `/src/app/nplusoneresolved/page.tsx`:

```tsx: /src/app/nplusoneresolved/page.tsx
// 1. Fetch posts (1 query)
const allPosts = await db.select().from(posts).limit(10);
const postIds = allPosts.map((p) => p.id);

// 2. Batch fetch ALL tags for ALL posts (1 query)
const tagRows = await db
  .select({ postId: postTags.postId, tagName: tags.name })
  .from(postTags)
  .leftJoin(tags, eq(postTags.tagId, tags.id))
  .where(inArray(postTags.postId, postIds));

// 3. Merge in memory
const tagsByPostId = new Map<number, string[]>();
for (const row of tagRows) {
  if (!tagsByPostId.has(row.postId)) tagsByPostId.set(row.postId, []);
  if (row.tagName) tagsByPostId.get(row.postId)!.push(row.tagName);
}
```

Whether you have 10 posts or 10,000, this is always **only 2 queries**.

### 3. Denormalized Read Model (The "Cheat Code")

Sometimes, batching isn't enough. When you have 5+ JOINs, query complexity starts hurting.

**Denormalization** is about trading storage for speed. We precompute the data and store it in a single table that matches exactly what the UI needs.

```tsx: /src/app/denormalized/page.tsx
// Single query. No joins. No batching. No pain.
const posts = await db
  .select()
  .from(deposts)
  .orderBy(deposts.updatedAt)
  .limit(10);
```

![Instant Speed](./images/minato.gif)

> "When the read model is already perfect, there is no work to be done."

### 4. Next.js ISR (The Ultimate Shield)

Why hit the database _at all_ for data that doesn't change every second?

**ISR (Incremental Static Regeneration)** acts as a shield. It serves pre-rendered HTML from the edge, only hitting your DB once in a blue moon to refresh the data.

```tsx: /src/app/optimized/page.tsx
export const revalidate = 60; // Refresh every 60 seconds
```

### 5. API Optimized (Resilience & Scale)

For high-availability systems, you need more than just a fast query. You need **Retry Logic** and **External Caching (Redis)**.

Check the shared logic in `/src/lib/dataFetching.ts`. It tries Redis first, and if the DB has a hiccup, it automatically retries with an exponential backoff.

![Resilient Architecture](./images/resillience.jpg)

> "The system that cannot break."

### Final Takeaway

> Avoid overengineering. What works for FAANG might not work for small startups.

There is no silver bullet.

- **Medicine for one might be poison for another.**
- Normalize for correctness.
- Denormalize for performance.
- Cache for speed.

**Start simple. Evolve intentionally.**

Happy coding, You've got this! 🤜🤛
