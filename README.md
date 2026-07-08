# Quote Builder

Internal quotation builder for The Tranquil Wedding.

It supports:

- internal login for sales users
- dashboard with saved quotations
- structured quote editor with live preview
- public share pages
- PDF export

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
pnpm dev
```

4. Open `http://localhost:3000`

## Environment variables

The app currently reads these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Current runtime behavior

If Supabase variables are not set, the app still runs in local fallback mode:

- internal login uses a local cookie session
- quotations are stored in `.data/quotes.json`

If Supabase variables are set, the app will detect hosted configuration and is ready for the next step of wiring auth and persistence to Supabase-backed flows.

## Commands

```bash
pnpm dev
pnpm typecheck
pnpm build
pnpm start
```
