# Markets & Finance Newsletter

A publishing platform for a markets and finance newsletter. The project combines a public archive for newsletters, articles, and notes with a private admin area for content and subscriber management.

The application is intentionally small: it avoids a commercial email platform, keeps the content model explicit, and uses Supabase for persistence, authentication primitives, storage, and row-level security.

## Features

- Public pages for newsletters, PDF/image-based articles, short notes, and author information.
- Email subscription, reactivation, unsubscribe, and subscriber administration workflows.
- Admin views for drafting and publishing newsletters, articles, notes, template content, and site copy.
- Supabase-backed content tables with draft/published status and publication timestamps.
- Anonymous likes and authenticated comments for published content.
- Article file uploads through Supabase Storage.

## Architecture

The project uses the Next.js App Router as both the public web application and the backend layer.

- `src/app`: public routes, admin routes, and API route handlers.
- `src/components`: shared presentation components for navigation, layout, comments, and engagement.
- `src/lib`: Supabase clients, content fetchers, MJML support, and shared types.
- `supabase/migrations`: database schema for content, engagement, comments, and settings.

Public pages read published records from Supabase. Admin routes use a server-side Supabase client with the service role key and are protected by an admin session cookie. Supabase RLS is enabled for content and engagement tables, with public read access limited to published or visible records.

## Technology

- Next.js 14 with the App Router
- TypeScript and React 18
- Tailwind CSS
- Supabase Postgres, Auth, Storage, and RLS
- Vercel deployment
- pnpm for package management

## Local Setup

```bash
pnpm install
cp env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
BASE_URL=http://localhost:3000
```

For production, set the same variables in Vercel and point `BASE_URL` to `https://markets-finance-newsletter.vercel.app`.

## Database

The Supabase schema is stored in `supabase/migrations`.

```bash
supabase db push
```

The migrations create content tables for newsletters, articles, and notes, plus engagement tables for likes and comments. Articles use the `articles` storage bucket for PDFs, images, and cover assets.

## Useful Commands

```bash
pnpm dev      # run the development server
pnpm build    # create a production build
pnpm start    # run the production build locally
pnpm lint     # run the Next.js lint task
```

## Technical Notes

- The admin area uses simple cookie-based access because the project is operated by a single maintainer.
- Newsletter delivery is intentionally manual: the admin area manages the subscriber list, while sending can remain outside the application.
- Draft/published state is stored in the database instead of being inferred from routes or file names.
- Runtime secrets, subscriber data, and local build artifacts are excluded from version control.

## License

Private project. All rights reserved.
