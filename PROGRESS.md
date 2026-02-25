# Nebula Chat — Setup

## Run locally
- `cd next-app`
- `npm install`
- `npm run dev -- --port 4173 --hostname 0.0.0.0`
- Open `http://localhost:4173/`

## Env vars (Next.js)
Create `next-app/.env.local`:

- `NEXT_PUBLIC_CONVEX_URL=...` (from `npx convex dev`)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...`
- `CLERK_SECRET_KEY=...`

## Convex backend
- `cd next-app`
- `npx convex dev`
  - Copy the printed deployment URL into `NEXT_PUBLIC_CONVEX_URL`.

## Clerk auth (email + Google)
- In the Clerk dashboard:
  - Enable Email + Password.
  - Enable Google OAuth.
  - Add allowed redirect URLs for local dev (Clerk will show the exact URLs it needs).

## Clerk → Convex auth
- In Clerk dashboard, create a JWT template with:
  - Name: `convex`
  - Audience (`aud`): `convex`
- In Convex dashboard (deployment settings), set:
  - `CLERK_JWT_ISSUER_DOMAIN=...` (your Clerk JWT issuer domain)

When Clerk is configured, `/` routes to `/sign-in` and successful login redirects to `/dashboard`.
