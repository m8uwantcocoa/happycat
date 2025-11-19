# HappyCat

Small pet-care web app built with Next.js, Supabase, Prisma and AI helpers (OpenAI / OpenRouter). This README explains how to get the project running locally and covers common troubleshooting.

## Features
- User auth via Supabase
- Pet management (CRUD)
- Care tracking and reminders
- AI utilities: name suggestions, care summaries, chat helpers
- Prisma-powered database access (local / Supabase Postgres)

## Prerequisites
- Node.js 18+ (or the version specified in engines)
- npm, pnpm or yarn
- A Supabase project (URL + anon key)
- An OpenAI or OpenRouter API key (optional for AI features)
- Git (recommended)

## Quick start (local)
1. Clone repo
   - git clone <repo-url>
   - cd happycat

2. Install deps
   - npm install
   - (or `pnpm install` / `yarn`)

3. Create environment file
   - Copy and populate `.env.local` with your keys (see example below).
   - Do NOT commit `.env.local`.

4. Prisma (if schema changed / first-time)
   - Generate client:
     - npx prisma generate
   - Push schema to DB (for development):
     - npx prisma db push
   - If using migrations: npx prisma migrate dev

5. Start dev server
   - npm run dev
   - Open http://localhost:3000

6. Restart dev server after changing environment variables.

## Required environment variables
Create `f:\Sys_Books\happycat\.env.local` (example):

```env
# filepath: [.env.local](http://_vscodecontentref_/0)
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here   # optional for server tasks

# Database (if using Prisma direct DB connection)
DATABASE_URL="postgresql://user:password@host:port/dbname"

# AI keys (optional)
OPENAI_API_KEY=sk-xxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxx