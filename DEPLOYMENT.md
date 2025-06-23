# Deployment Guide - Hospital Inventory Management System

## 🚀 Deploy to Vercel

### Prerequisites
1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database** - We recommend:
   - [Supabase](https://supabase.com) (Free tier available)
   - [Neon](https://neon.tech) (Free tier available)
   - [Railway](https://railway.app) (PostgreSQL hosting)

### Step 1: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect this as a Next.js project
4. Click **Deploy**

#### Option B: Deploy via CLI
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy the project
vercel --prod
```

### Step 2: Set Up PostgreSQL Database

#### Using Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string (it looks like):
   ```
   postgresql://postgres.xyz:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

#### Using Neon
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard

### Step 3: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

#### Required Variables
```env
DATABASE_URL=postgresql://username:password@host:port/database_name
JWT_SECRET=your-super-secure-random-string-at-least-32-chars
```

#### Optional Variables
```env
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
NODE_ENV=production
```

### Step 4: Generate JWT Secret
Generate a secure JWT secret:
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

### Step 5: Set Up Database Schema

After deployment, you need to set up your database:

#### Option A: Use Prisma Studio (Recommended)
1. Clone your repository locally
2. Set up your `.env.local` with the production `DATABASE_URL`
3. Run migrations:
   ```bash
   npm install
   npm run db:deploy
   npm run db:seed
   ```

#### Option B: Manual SQL Setup
Run this SQL in your PostgreSQL database:
```sql
-- Copy the contents of prisma/schema.production.prisma
-- and convert to SQL, or use Prisma migrate
```

### Step 6: Test Your Deployment

1. Visit your Vercel app URL
2. Register a new account (this creates the first company)
3. Test the main features:
   - Site creation
   - Stock area management
   - Item creation (medications and supplies)
   - Inventory tracking
   - Analytics dashboard

### Step 7: Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` environment variable
4. Update any hardcoded URLs in your application

## 🔧 Post-Deployment Configuration

### Database Considerations
- **Backup**: Set up automated backups for your database
- **Scaling**: Monitor database performance and upgrade as needed
- **Security**: Ensure your database is only accessible from your application

### Performance Monitoring
- Enable Vercel Analytics in your dashboard
- Monitor Core Web Vitals
- Set up error tracking (optional: Sentry)

### Security Checklist
- ✅ Strong JWT secret (32+ random characters)
- ✅ Database connections over SSL
- ✅ Environment variables properly configured
- ✅ No sensitive data in source code

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Errors**
```
Error: P1001: Can't reach database server
```
- Check your `DATABASE_URL` is correct
- Ensure database allows connections from Vercel
- Verify SSL settings

**2. JWT Secret Errors**
```
Error: JWT secret is required
```
- Set `JWT_SECRET` environment variable in Vercel
- Ensure it's at least 32 characters long

**3. Build Errors**
```
Error: Module not found
```
- Check all dependencies are in `package.json`
- Run `npm run build` locally to test

**4. Migration Errors**
```
Error: Migration failed
```
- Ensure database is empty for first deployment
- Run `npm run db:deploy` manually
- Check database permissions

### Getting Help

1. **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
3. **Prisma Documentation**: [prisma.io/docs](https://prisma.io/docs)

## 🎉 You're Live!

Your Hospital Inventory Management System is now deployed and ready for production use. Don't forget to:

1. Set up user accounts for your team
2. Configure your hospital sites and stock areas
3. Import your existing inventory data
4. Train users on the new system

---

**🏥 Built for healthcare professionals with ❤️**