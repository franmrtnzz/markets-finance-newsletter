# Markets & Finance Newsletter

A modern, production-ready newsletter platform built with Next.js 14, featuring subscriber management, admin panel, and automated email delivery.

## Features

- **Subscriber Management**: Direct subscription system with unsubscribe functionality
- **Admin Panel**: Content creation and subscriber management interface
- **Email Delivery**: SendGrid integration with domain authentication
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Security**: CSRF protection, rate limiting, and honeypot anti-spam

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Email**: SendGrid with domain authentication
- **Authentication**: Password-based admin system with httpOnly cookies
- **Deployment**: Vercel with custom domain support
- **Package Manager**: pnpm

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── admin/         # Admin-only endpoints
│   │   ├── subscribe/     # Subscription endpoint
│   │   └── unsubscribe/   # Unsubscribe endpoint
│   ├── admin/             # Admin panel pages
│   └── page.tsx           # Public subscription page
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client configuration
│   └── sendgrid.ts        # SendGrid email service
└── types/                 # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 22+ 
- pnpm
- Supabase account
- SendGrid account
- Custom domain (for email authentication)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/markets-finance-newsletter.git
cd markets-finance-newsletter
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp env.example .env.local
```

4. Configure your environment variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Admin
ADMIN_PASSWORD=your_secure_password
BASE_URL=https://yourdomain.com
```

5. Set up database schema
```sql
-- Run this in your Supabase SQL Editor
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT,
  preheader TEXT,
  content_md TEXT,
  html TEXT,
  status TEXT CHECK (status IN ('draft','scheduled','sent','failed')) DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_subscribe ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY public_read_active ON subscribers FOR SELECT USING (is_active = true);
CREATE POLICY admin_subscribers ON subscribers FOR ALL USING (true);
CREATE POLICY admin_issues ON issues FOR ALL USING (true);
```

6. Run the development server
```bash
pnpm dev
```

7. Build for production
```bash
pnpm build
```

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push to main branch

### Domain Configuration

1. Add your custom domain in Vercel
2. Configure nameservers to point to Vercel
3. Set up SendGrid domain authentication
4. Add SPF record: `v=spf1 include:sendgrid.net ~all`

## API Endpoints

### Public Endpoints

- `POST /api/subscribe` - Subscribe to newsletter
- `GET /api/unsubscribe/[token]` - Unsubscribe from newsletter

### Admin Endpoints

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/subscribers` - List subscribers
- `POST /api/admin/newsletter/send` - Send newsletter

## Security Features

- **CSRF Protection**: Built-in Next.js CSRF protection
- **Rate Limiting**: API endpoint rate limiting
- **Honeypot**: Anti-spam honeypot field
- **Input Validation**: Email format and content validation
- **Row Level Security**: Supabase RLS policies
- **Secure Cookies**: httpOnly admin session cookies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## Support

For support and questions, please open an issue in the GitHub repository.
