# NextJS CRM Deployment Guide

This guide provides step-by-step instructions for deploying your NextJS CRM application on different platforms, with specific attention to Windows development environments.

## Table of Contents
1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Production Build](#production-build)
4. [Database Setup](#database-setup)
5. [Deployment Options](#deployment-options)
   - [Vercel (Recommended)](#vercel-deployment)
   - [Netlify](#netlify-deployment)
   - [DigitalOcean App Platform](#digitalocean-deployment)
   - [Railway](#railway-deployment)
   - [Self-hosted (VPS/Server)](#self-hosted-deployment)
6. [Post-deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)

## Pre-deployment Checklist

Before deploying, ensure you have completed the following:

- [ ] All forms are working correctly (Leads, Deals, Activities, Users)
- [ ] Calendar view is functioning properly
- [ ] Export functionality is working
- [ ] Production build runs without errors
- [ ] Environment variables are configured
- [ ] Database schema is up to date

## Environment Setup

### 1. Copy Environment Variables

```bash
# Copy the example environment file
copy .env.example .env.production
```

### 2. Configure Production Environment Variables

Edit `.env.production` with your production values:

```bash
# Database (choose one based on your hosting platform)
DATABASE_URL="postgresql://username:password@host:5432/database_name"
# or
DATABASE_URL="mysql://username:password@host:3306/database_name"

# NextAuth
NEXTAUTH_URL="https://yourcrm.com"
NEXTAUTH_SECRET="your-production-secret-key"

# Application
APP_NAME="Your CRM Name"
APP_URL="https://yourcrm.com"
NODE_ENV="production"
```

## Production Build

Test your production build locally before deploying:

```bash
# Install dependencies
npm install

# Run production build
npm run build

# Test the production build locally
npm run start
```

If the build succeeds, you're ready to deploy!

## Database Setup

### For SQLite (Development/Small Scale)
SQLite will work out of the box, but consider upgrading to PostgreSQL or MySQL for production.

### For PostgreSQL (Recommended)
1. Create a PostgreSQL database on your hosting platform
2. Update `DATABASE_URL` in your environment variables
3. Run database migrations:
```bash
npx prisma db push
```

### For MySQL
1. Create a MySQL database on your hosting platform
2. Update `DATABASE_URL` in your environment variables  
3. Run database migrations:
```bash
npx prisma db push
```

## Deployment Options

### Vercel Deployment (Recommended)

Vercel is the easiest option for Next.js applications:

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
# From your project directory
vercel

# Follow the prompts:
# - Set up project: Yes
# - Link to existing project: No
# - Project name: nextjs-crm (or your preferred name)
# - Directory: ./ (current directory)
```

#### Step 4: Configure Environment Variables
In your Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add all variables from your `.env.production` file
3. Redeploy: `vercel --prod`

#### Step 5: Database Setup
- For PostgreSQL: Use Vercel Postgres or external provider (Supabase, PlanetScale)
- For MySQL: Use PlanetScale or external provider

### Netlify Deployment

#### Step 1: Build Settings
Create `netlify.toml` in your project root:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 2: Deploy
1. Connect your GitHub repository to Netlify
2. Configure build settings
3. Add environment variables in Netlify dashboard
4. Deploy

### DigitalOcean App Platform

#### Step 1: Create App
1. Go to DigitalOcean App Platform
2. Connect your GitHub repository
3. Configure:
   - Runtime: Node.js
   - Build command: `npm run build`
   - Run command: `npm run start`

#### Step 2: Environment Variables
Add your production environment variables in the DigitalOcean dashboard.

#### Step 3: Database
Add a managed PostgreSQL database from DigitalOcean.

### Railway Deployment

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

#### Step 2: Login and Deploy
```bash
railway login
railway init
railway up
```

#### Step 3: Configure Environment
```bash
railway variables:set NEXTAUTH_URL=https://your-app.railway.app
railway variables:set DATABASE_URL=your-database-url
# Add other environment variables
```

### Self-hosted Deployment

For VPS or dedicated server deployment:

#### Prerequisites
- Ubuntu/Debian server with SSH access
- Node.js 18+ installed
- PM2 for process management
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt recommended)

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### Step 2: Deploy Application
```bash
# Clone your repository
git clone https://github.com/yourusername/nextjs-crm.git
cd nextjs-crm

# Install dependencies
npm install

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "nextjs-crm" -- run start
pm2 save
pm2 startup
```

#### Step 3: Configure Nginx
Create `/etc/nginx/sites-available/nextjs-crm`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/nextjs-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 4: SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Post-deployment Configuration

### 1. Test All Features
- [ ] User authentication
- [ ] Form submissions (Leads, Deals, Activities, Users)
- [ ] Calendar functionality
- [ ] Export features
- [ ] Navigation between pages

### 2. Set up Monitoring
Consider adding:
- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring

### 3. Backup Strategy
- Regular database backups
- Code repository backups
- Environment variable backups

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database server accessibility
- Ensure database exists and has proper permissions

#### Environment Variable Issues
- Double-check all required variables are set
- Verify values don't contain spaces or special characters
- Restart the application after changes

#### Performance Issues
- Enable Next.js optimization features
- Use CDN for static assets
- Implement database indexing
- Consider caching strategies

#### Windows-specific Issues
- Use PowerShell or Command Prompt as Administrator
- Ensure proper line endings (LF vs CRLF)
- Check file path lengths (Windows has 260 character limit)

### Getting Help

If you encounter issues:

1. Check the deployment platform's documentation
2. Review application logs
3. Test locally with production build
4. Check database connectivity
5. Verify environment variables

### Rollback Strategy

Always have a rollback plan:

1. Keep previous working version tagged in Git
2. Database migration rollback procedures
3. Environment variable backups
4. Quick deployment rollback commands

## Security Considerations

- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS in production
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] Environment variable security

## Performance Optimization

- [ ] Enable compression (gzip)
- [ ] Implement caching strategies
- [ ] Optimize images and assets
- [ ] Use CDN for static content
- [ ] Database query optimization
- [ ] Monitor and analyze performance metrics

---

This deployment guide should cover most scenarios. Choose the deployment option that best fits your needs, budget, and technical requirements.