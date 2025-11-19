# HappyCat — Baseline Pet Care Web App

Summary
-------
HappyCat is a focused pet-care web application built with Next.js, TypeScript, Prisma and Supabase. The repository in this branch is the baseline application — it does NOT include or require any AI APIs or AI provider usage. An AI-enhanced branch exists separately and provides the same application with optional AI features; that branch is distinct and gated behind environment variables and extra endpoints.

This baseline app is implemented with usability in mind and follows Nielsen’s heuristics (visibility of system status, match between system and the real world, user control and freedom, consistency and standards, error prevention).

Tech stack
----------
- Next.js (app router, TypeScript)
- Prisma (PostgreSQL)
- Supabase (auth + optional project integration)
- Node (recommended v18+)

Key features (baseline)
-----------------------
- User authentication (Supabase)
- Pet management (create, list, view)
- Care tracking (feed, water, play, brush, nails, litter, vaccines)
- Care status analysis and simple mood indicators
- Clean, responsive UI and predictable navigation

Important files and folders
---------------------------
- app/ — Next.js app pages and layouts
  - app/(protected)/ — authenticated area (dashboard, addpet, pet details)
  - app/api/ — API routes (pets, care, auth callbacks)
- src/lib/
  - prisma.ts — Prisma client
  - pets.ts — pet helpers and data access
  - caresystem.ts — care logic and analysis
  - supabase/ — Supabase client helpers for browser & server
- src/types/ — TypeScript types
- prisma/ — Prisma schema and migrations
- .env.local, .env — environment variable examples (do not commit secrets)

Project structure (high level)
------------------------------
- src/app/(protected)/dashboard/page.tsx — user dashboard
- src/app/(protected)/addpet/page.tsx — add new pet
- src/app/(protected)/dashboard/pets/[id]/page.tsx — pet detail
- src/app/(protected)/dashboard/pets/[id]/components/caretracker.tsx — care UI
- src/app/api/pets/route.ts — pets API
- src/app/api/care/route.ts — care logging API
- src/lib/careystem.ts, src/lib/pets.ts — core domain logic

Getting started (local)
-----------------------
Prerequisites
- Node 18+ (or matching runtime)
- pnpm / npm
- Supabase
- Optional: Supabase project for auth

Install dependencies
```sh
npm install
# or
pnpm install
```

Environment
- Create a local .env or set environment variables for:
  - DATABASE_URL — PostgreSQL connection string
  - NEXT_PUBLIC_SUPABASE_URL — Supabase project URL (if using Supabase auth)
  - NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key (browser)
- The baseline branch does not require any AI keys. If you use the AI-enhanced branch, additional keys will be required and documented there.

Run (development)
```sh
npm run dev
```

Build & start
```sh
npm run build
npm run start
```

Database
- Prisma schema is in prisma/schema.prisma
- Apply migrations during development:
```sh
npx prisma migrate dev
```

You need to create a .env and .env.local file. Here is the template for both.
.env : 
DATABASE_URL=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY= "" 

.env.local : 
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENROUTER_API_KEY=
OPENAI_API_KEY=

Branches and AI note
--------------------
- Baseline branch: a complete, working pet-care application that does not rely on AI APIs.
- AI-enhanced branch: the same application plus optional AI features (additional endpoints, UI components). AI features are implemented on a separate branch and are enabled only when corresponding environment variables (API keys) are provided.

