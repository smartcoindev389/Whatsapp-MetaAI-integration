# Deployment Guide

This guide covers deploying the WhatsApp Business API integration (Official API) to production.

## Overview

The application consists of:
- **Backend API** (NestJS) - Handles WABA connections, webhooks, messages, campaigns
- **Frontend** (React + Vite) - User interface including the "Choose API" page
- **Database** (MySQL) - Stores shops, WABA accounts, messages, templates
- **Redis** - Used for BullMQ job queues
- **Worker** - Processes campaign jobs (runs in same container or separate)

## Prerequisites

- Docker and Docker Compose installed
- Domain name with DNS access
- SSL certificate (for HTTPS)
- Meta/Facebook App credentials:
  - `META_APP_ID`
  - `META_APP_SECRET`
  - `META_VERIFY_TOKEN` (for webhook verification)

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```env
# Application
APP_PORT=3000
NODE_ENV=production

# Database (use individual variables or DATABASE_URL)
DB_HOST=your-db-host
DB_PORT=3306
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=evozap
DB_SCHEMA=public

# Or use DATABASE_URL directly
# DATABASE_URL=mysql://user:password@host:3306/evozap?schema=public

# Redis
REDIS_URL=redis://your-redis-host:6379

# Security
JWT_SECRET=your-very-secure-jwt-secret-min-32-chars
ENCRYPTION_KEY=your-32-character-encryption-key

# Meta/Facebook API (REQUIRED)
META_APP_ID=your-facebook-app-id
META_APP_SECRET=your-facebook-app-secret
META_VERIFY_TOKEN=your-webhook-verify-token
META_API_VERSION=v21.0

# Frontend URLs (REQUIRED - must match your actual domain)
FRONTEND_URL=https://app.yourdomain.com
FRONTEND_CALLBACK_URL=https://app.yourdomain.com/onboarding/callback

# Webhook URL (REQUIRED - must be publicly accessible)
WEBHOOK_PUBLIC_URL=https://api.yourdomain.com/webhooks/meta

# Rate Limiting
RATE_LIMIT_DEFAULT=10
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=https://api.yourdomain.com
```

## Deployment Steps

### 1. Backend Deployment

#### Option A: Docker Compose (Recommended for single server)

1. **Update docker-compose.yml** with production environment variables:
   ```yaml
   environment:
     META_APP_ID: ${META_APP_ID}
     META_APP_SECRET: ${META_APP_SECRET}
     FRONTEND_CALLBACK_URL: ${FRONTEND_CALLBACK_URL}
     WEBHOOK_PUBLIC_URL: ${WEBHOOK_PUBLIC_URL}
     # ... other variables
   ```

2. **Build and start services**:
   ```bash
   cd backend
   docker-compose up -d --build
   ```

3. **Run database migrations**:
   ```bash
   docker-compose exec app npm run prisma:migrate:deploy
   ```

#### Option B: Manual Deployment

1. **Install dependencies**:
   ```bash
   cd backend
   npm ci --only=production
   ```

2. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

3. **Run migrations**:
   ```bash
   npm run prisma:migrate:deploy
   ```

4. **Build the application**:
   ```bash
   npm run build
   ```

5. **Start with PM2 or similar**:
   ```bash
   pm2 start dist/main.js --name evozap-api
   ```

### 2. Frontend Deployment

1. **Build for production**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting service:
   - **Vercel**: Connect GitHub repo, set `VITE_API_URL` in environment variables
   - **Netlify**: Deploy `dist/` folder, set environment variables
   - **Nginx/Apache**: Copy `dist/` contents to web root

3. **Configure reverse proxy** (if using Nginx):
   ```nginx
   server {
       listen 80;
       server_name app.yourdomain.com;
       
       location / {
           root /var/www/evozap-frontend/dist;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### 3. Meta App Configuration

1. **Configure OAuth Redirect URI** in Meta App Settings:
   - Go to https://developers.facebook.com/apps
   - Select your app → Settings → Basic
   - Add to "Valid OAuth Redirect URIs":
     ```
     https://app.yourdomain.com/onboarding/callback
     ```

2. **Configure Webhook**:
   - Go to Webhooks section in Meta App Settings
   - Add webhook URL: `https://api.yourdomain.com/webhooks/meta`
   - Verify token: Use your `META_VERIFY_TOKEN`
   - Subscribe to: `whatsapp_business_account` events

## Public URLs

After deployment, these URLs must be publicly accessible:

### Backend API
- **API Base**: `https://api.yourdomain.com`
- **Webhook Endpoint**: `https://api.yourdomain.com/webhooks/meta`
- **OAuth Callback**: `https://api.yourdomain.com/auth/embedded/callback`
- **Health Check**: `https://api.yourdomain.com/health`

### Frontend
- **Choose API Page**: `https://app.yourdomain.com/choose-api`
- **Onboarding**: `https://app.yourdomain.com/onboarding`
- **Onboarding Callback**: `https://app.yourdomain.com/onboarding/callback`

## Testing Deployment

1. **Test Health Endpoint**:
   ```bash
   curl https://api.yourdomain.com/health
   ```

2. **Test Choose API Page**:
   - Visit: `https://app.yourdomain.com/choose-api`
   - Verify both buttons are visible
   - Test "Unofficial API" button redirects to `https://salvazap.com/autenticar`
   - Test "Official API" button (requires login) starts Meta OAuth flow

3. **Test OAuth Flow**:
   - Log in to frontend
   - Click "Use Official API" on Choose API page
   - Should redirect to Meta authorization
   - After authorization, should return to `/onboarding/callback`
   - WABA account should appear in database

4. **Test Webhook**:
   - Meta will send a GET request to verify webhook
   - Check logs for successful verification
   - Send a test message to verify POST webhook handling

## Security Checklist

- [ ] All environment variables are set and secure
- [ ] `JWT_SECRET` is a strong random string (32+ characters)
- [ ] `ENCRYPTION_KEY` is exactly 32 characters
- [ ] HTTPS is enabled for all public endpoints
- [ ] Database credentials are secure
- [ ] Meta App credentials are stored securely
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] Webhook signature verification is working

## Monitoring

### Health Checks
- Backend: `GET /health`
- Database connection status
- Redis connection status

### Logs
- Backend logs: `docker-compose logs -f app`
- Frontend errors: Check browser console and hosting logs

### Database
- Access Prisma Studio: `docker-compose exec app npm run prisma:studio`
- Or connect directly to MySQL

## Troubleshooting

### OAuth Redirect Mismatch
- Ensure `FRONTEND_CALLBACK_URL` matches exactly what's in Meta App settings
- Check that the URL is accessible (no redirects, correct protocol)

### Webhook Not Receiving Events
- Verify webhook URL is publicly accessible
- Check `META_VERIFY_TOKEN` matches Meta App settings
- Ensure webhook subscription is active in Meta App

### Database Connection Issues
- Verify database credentials
- Check network connectivity between containers
- Ensure database is accessible from backend

## Rollback Procedure

1. Stop current deployment
2. Restore previous database backup (if needed)
3. Deploy previous version
4. Run migrations if schema changed

## Support

For issues or questions:
- Check application logs
- Review Meta App dashboard for API errors
- Verify all environment variables are set correctly

