# Family Tree MVP - Deployment Guide

## Prerequisites

1. Node.js 18+ installed
2. Supabase account
3. GitHub account (for version control)
4. Vercel account (for hosting)

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd family-tree-mvp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth (Optional - for Google login)
# Configure in Supabase Auth settings
```

### 4. Database Setup
Run the migration scripts in `supabase/migrations/` directory:

```bash
# Using Supabase CLI
supabase migration up

# Or manually run SQL files in order:
# 1. supabase/migrations/00_init_schema.sql
# 2. supabase/migrations/01_rls_policies.sql
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Configuration

### Supabase Setup

1. Create a new Supabase project
2. Go to SQL Editor and run migrations:

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create tables (see supabase/migrations/ for complete schema)

-- Enable RLS on all tables
alter table tree enable row level security;
alter table tree_member enable row level security;
alter table person enable row level security;
alter table parent_child enable row level security;
alter table partnership enable row level security;

-- Add RLS policies (see migrations for details)
```

3. Set up authentication:
   - Go to Authentication > Providers
   - Enable Email (default is enabled)
   - Configure Google OAuth (get client ID/secret from Google Cloud Console)

4. Configure URL redirects:
   - Go to Authentication > URL Configuration
   - Add redirect URLs:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://yourdomain.com/auth/callback`

## Deployment to Vercel

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." > "Project"
3. Import your GitHub repository
4. Select the project

### 3. Environment Variables
In Vercel project settings:

1. Go to Settings > Environment Variables
2. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Make sure variables are available in:
   - Production
   - Preview
   - Development

### 4. Deploy
1. Click "Deploy"
2. Vercel will automatically build and deploy
3. Once complete, you'll get a production URL

### 5. Update Supabase URLs
In Supabase Authentication settings:
- Go to URL Configuration
- Add your Vercel production URL as redirect

## Production Checklist

### Security
- [ ] Remove all console logs (or make conditional)
- [ ] Enable HTTPS everywhere
- [ ] Set secure cookie flags
- [ ] Review RLS policies are correct
- [ ] Enable 2FA for admin accounts
- [ ] Set up backup policies

### Performance
- [ ] Enable caching headers
- [ ] Optimize images
- [ ] Set up CDN for static assets
- [ ] Enable database query optimization
- [ ] Monitor Core Web Vitals

### Monitoring & Logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure request logging
- [ ] Set up alerts for failures
- [ ] Monitor database performance

### Backup & Recovery
- [ ] Enable automatic Supabase backups
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Set up database replication

### Compliance
- [ ] Review privacy policy
- [ ] Implement GDPR compliance
- [ ] Set up terms of service
- [ ] Document data retention policies
- [ ] Implement data deletion features

## Scaling Considerations

### Database
- Monitor query performance
- Add indexes for frequently searched columns
- Consider read replicas for high traffic
- Implement connection pooling

### Application
- Enable caching strategies
- Implement API rate limiting
- Use CDN for static content
- Monitor memory usage

### Infrastructure
- Set up auto-scaling if needed
- Monitor costs
- Use reserved instances for predictable load
- Plan for traffic spikes

## Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

### TypeScript Errors
```bash
# Check types
npm exec tsc -- --noEmit

# Fix issues
npm run type-check
```

### Database Connection Issues
1. Check Supabase service is running
2. Verify credentials in `.env.local`
3. Check network connectivity
4. Review RLS policies aren't blocking queries

### Authentication Issues
1. Verify OAuth credentials
2. Check redirect URLs match
3. Clear browser cookies
4. Check auth session in browser DevTools

## Monitoring & Maintenance

### Regular Tasks
- Monitor error logs daily
- Review database performance weekly
- Check uptime monthly
- Review security logs monthly
- Update dependencies quarterly

### Performance Metrics to Track
- Page load times (target < 2s)
- API response times (target < 200ms)
- Error rates (target < 0.1%)
- Database query times (target < 100ms)
- User sessions (monitoring growth)

## Support & Resources

- **Documentation:** See API_DOCUMENTATION.md and PROJECT_STATUS.md
- **Issues:** Check GitHub Issues
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs

## Contact
For deployment questions or issues, create a GitHub issue or contact support.
