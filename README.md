# Database Optimization Examples

A demo immplementation demonstrating N+1 queries, batch querying, normalization, denormalization, projections, caching, and CQRS patterns.

## Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment**

   ```bash
   cp env.example .env
   ```

   Update `.env` with your database credentials.

3. **Start services**

   ```bash
   docker compose up -d
   ```

4. **Run migrations**

   ```bash
   pnpm db:push
   ```

5. **Seed database**

   ```bash
   pnpm db:seed
   ```

6. **Build projection table**

   ```bash
   # via api endpoint
   curl -X POST http://localhost:3000/api/project

   # or in code
   import { runFullProjection } from "@/jobs/projection-full";
   await runFullProjection();
   ```

7. **Start dev server**
   ```bash
   pnpm dev
   ```

## Examples

- `/nplusone` - N+1 query problem demonstration
- `/nplusoneresolved` - Batch querying solution
- `/denormalized` - Denormalized read model
- `/optimzed` - ISR + Redis caching

## Scripts

- `pnpm db:generate` - Generate migration files
- `pnpm db:push` - Push schema to database (dev)
- `pnpm db:migrate` - Run migrations (prod)
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Drizzle Studio

## Projection

The projection table (`deposts`) is built from normalized tables. Trigger it via:

- API endpoint: `POST /api/project`
- Or import and call `runFullProjection()` directly
