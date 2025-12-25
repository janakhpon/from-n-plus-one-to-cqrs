import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-black dark:text-zinc-50">
          Database Optimization Examples
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Hands-on examples demonstrating N+1 queries, batch querying,
          denormalization, projections, caching, and CQRS patterns.
        </p>

        <div className="grid gap-4">
          <Link
            href="/nplusone"
            className="p-6 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2 text-black dark:text-zinc-50">
              1. N+1 Query Problem
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Demonstrates the classic N+1 query problem with posts and tags.
            </p>
          </Link>

          <Link
            href="/nplusoneresolved"
            className="p-6 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2 text-black dark:text-zinc-50">
              2. N+1 Resolved (Batch Querying)
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Same functionality, but using batch querying and in-memory merging
              to eliminate N+1.
            </p>
          </Link>

          <Link
            href="/denormalized"
            className="p-6 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2 text-black dark:text-zinc-50">
              3. Denormalized Read Model
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Using a projection table (denormalized) for fast reads with a
              single query.
            </p>
          </Link>

          <Link
            href="/optimzed"
            className="p-6 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2 text-black dark:text-zinc-50">
              4. Optimized (ISR + Cache)
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Combining ISR (Incremental Static Regeneration) with Redis caching
              for optimal performance.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
