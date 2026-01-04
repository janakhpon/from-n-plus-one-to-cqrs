import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold mb-4 text-zinc-900 tracking-tight">
            Database Optimization{' '}
            <span className="text-blue-600">Walkthrough</span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl leading-relaxed">
            Hands-on examples demonstrating N+1 queries, batch fetching,
            denormalization, projections, and high-performance caching patterns.
          </p>
        </div>

        <div className="grid gap-6">
          <Link
            href="/nplusone"
            className="group p-8 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 hover:shadow-md transition-all"
          >
            <h2 className="text-2xl font-bold mb-2 text-zinc-900 group-hover:text-blue-600 transition-colors">
              1. N+1 Query Problem
            </h2>
            <p className="text-zinc-600">
              The classic performance bottleneck: fetching related data one by
              one.
            </p>
          </Link>

          <Link
            href="/nplusoneresolved"
            className="group p-8 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 hover:shadow-md transition-all"
          >
            <h2 className="text-2xl font-bold mb-2 text-zinc-900 group-hover:text-emerald-600 transition-colors">
              2. N+1 Resolved (Batch Querying)
            </h2>
            <p className="text-zinc-600">
              Fixing N+1 by batching requests and merging data in-memory.
            </p>
          </Link>

          <Link
            href="/denormalized"
            className="group p-8 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 hover:shadow-md transition-all"
          >
            <h2 className="text-2xl font-bold mb-2 text-zinc-900 group-hover:text-amber-600 transition-colors">
              3. Denormalized Read Model
            </h2>
            <p className="text-zinc-600">
              Using a pre-computed projection table for ultra-fast single-query
              reads.
            </p>
          </Link>

          <Link
            href="/optimized"
            className="group p-8 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 hover:shadow-md transition-all"
          >
            <h2 className="text-2xl font-bold mb-2 text-zinc-900 group-hover:text-purple-600 transition-colors">
              4. Optimized (ISR + Cache)
            </h2>
            <p className="text-zinc-600">
              Combining Next.js ISR with Redis for a balance of speed and
              freshness.
            </p>
          </Link>

          <Link
            href="/apioptimized"
            className="group p-8 bg-white border-2 border-blue-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 px-4 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest">
              Advanced
            </div>
            <h2 className="text-2xl font-bold mb-2 text-zinc-900 group-hover:text-blue-700 transition-colors">
              5. API Optimized
            </h2>
            <p className="text-zinc-600">
              Robust serverless API pattern with Redis caching and DB retry
              logic.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
