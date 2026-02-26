# Live Chat Messaging Application

Modern realtime chat app built with Next.js (App Router), Clerk authentication, and Convex as the realtime backend.

**Live Demo:** https://live-chat-messaging-application.vercel.app/

---

## Highlights

- Clerk authentication + protected routes (middleware)
- Realtime conversations and messaging (Convex queries/subscriptions)
- Typing indicators
- Emoji reactions + message deletion
- Presence (online/away/offline) with heartbeat + stale detection
- Unread counts per conversation + sidebar unread badge
- Smart chat scrolling (“↓ New messages” when you’re reading older messages)

---

## Tech Stack

- Next.js (App Router) + React
- Convex (database + realtime functions)
- Clerk (auth)
- Tailwind CSS v4 + Radix UI

---

## Getting Started (Local Development)

### 1) Install

```bash
npm install
```

### 2) Configure environment variables

Create a `.env.local` in `next-app/` (never commit this file):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
```

Notes:
- `NEXT_PUBLIC_CONVEX_URL` will be set automatically when you run `npx convex dev` locally.
- `NEXT_PUBLIC_CONVEX_URL` must be a Convex cloud URL in production (not localhost).

### 3) Run Convex (backend)

```bash
npx convex dev
```

### 4) Run Next.js (frontend)

```bash
npm run dev
```

Open the app at `http://localhost:3000`.

---

## Project Structure (Quick Tour)

**Frontend**
- `src/app/` — Next.js routes (App Router)
  - `(public)/` — sign-in / sign-up screens
  - `(authed)/dashboard` — chat list + unread + presence
  - `(authed)/chat/[conversationId]` — realtime chat + smart scroll + mark-as-read
  - `(authed)/discover` — search users + create DMs
- `src/components/` — UI building blocks
  - `providers/` — Clerk/Convex bootstrapping and app providers
  - `chat/` — chat-specific UI (bubbles, typing indicator, presence dot, etc.)
  - `layout/` — AppShell, SideNav, TopNav
- `src/lib/` — shared utilities (env helpers, presence derivation, formatting)

**Backend (Convex)**
- `convex/schema.ts` — database schema and indexes
- `convex/users.ts` — user upsert/search + effective presence status
- `convex/conversations.ts` — list conversations, unread counts, markRead
- `convex/messages.ts` — list/send/delete messages + reactions
- `convex/typing.ts` — typing indicator state
- `convex/lib/auth.ts` — auth helpers + membership checks
- `convex/_generated/` — auto-generated client/server bindings (do not edit)

---

## Core Concepts

### Authentication

- Next.js middleware protects authed routes when Clerk is configured.
- Convex verifies Clerk JWTs when `CLERK_JWT_ISSUER_DOMAIN` is set on the Convex deployment.

### Presence (Online / Away / Offline)

- The app periodically upserts the current viewer as `online`.
- When the tab is hidden it updates to `away`.
- Users automatically become `offline` when their last update becomes stale.

### Unread Counts

- Each member has a `lastReadAt` timestamp per conversation.
- Unread count is computed as messages after `lastReadAt` excluding the viewer’s own messages.

### Smart Chat Scrolling

- If you’re at the bottom when new messages arrive: auto-scroll.
- If you’ve scrolled up: show a “↓ New messages” button instead of forcing scroll.

---

## Scripts

```bash
npm run dev     # start Next.js dev server
npm run build   # build
npm run start   # run production build locally
npm run lint    # lint
```

---

## Deployment (Convex + Vercel)

### 1) Deploy Convex (backend)

```bash
npx convex deploy --yes
```

In the Convex Dashboard for your **production** deployment, set:

- `CLERK_JWT_ISSUER_DOMAIN` = your Clerk issuer domain (e.g. `https://<instance>.clerk.accounts.dev`)

### 2) Deploy Next.js on Vercel (frontend)

Connect the GitHub repository to Vercel and set these env vars in:
Vercel → Project → Settings → Environment Variables

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CONVEX_URL` = `https://<your-deployment>.convex.cloud`

Push to `main` and Vercel will redeploy automatically (or use “Redeploy” in the Deployments tab).

---

## Troubleshooting

- **Users not visible across devices**
  - Make sure Vercel uses a Convex cloud URL (not `http://127.0.0.1:3210`).

- **Presence always offline**
  - Verify the `users` table is being updated (heartbeat is running).
  - Verify Convex auth is configured via `CLERK_JWT_ISSUER_DOMAIN`.

- **Security**
  - Never commit `.env.local`.
  - Rotate keys if a secret was exposed.

---

## Demo Tip

Run two sessions (normal + incognito) to showcase realtime:
- Presence dot switching online/offline
- Unread count badge updates
- Smart scroll button when scrolled up in a chat
