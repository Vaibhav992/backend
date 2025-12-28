# Render Backend Deployment Guide

## Environment Variables for Render

Render dashboard में जाकर **Environment** section में ये variables add करें:

### Required Variables:

```env
PORT=5000
```

**Note:** Render automatically sets PORT, लेकिन fallback के लिए 5000 रखें।

```env
DB_URL=postgresql://neondb_owner:npg_h3wqY1KLFEuD@ep-sparkling-smoke-a7ojwt0w-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Important:** अपनी Neon DB connection string paste करें।

```env
JWT_SECRET=your_very_strong_secret_key_here_change_this
```

**Important:** Production के लिए एक strong, random secret key use करें। Example:
- Use a long random string (minimum 32 characters)
- Or generate using: `openssl rand -base64 32`

```env
JWT_EXPIRE=7d
```

Token expiration time (7 days default)।

```env
NODE_ENV=production
```

**Critical:** Production mode के लिए `production` set करें।

```env
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Important:** अपनी Vercel frontend URL add करें। Example:
- `https://frontend-nine-psi-88.vercel.app`
- Multiple URLs के लिए comma-separated: `https://app1.vercel.app,https://app2.vercel.app`

## Complete Example for Render:

```env
PORT=5000
DB_URL=postgresql://neondb_owner:npg_h3wqY1KLFEuD@ep-sparkling-smoke-a7ojwt0w-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=assignment_submission_secret_key_2024_production_strong_key
JWT_EXPIRE=7d
NODE_ENV=production
FRONTEND_URL=https://frontend-nine-psi-88.vercel.app
```

## Steps to Add in Render:

1. Render dashboard में अपने backend service पर जाएं
2. **Settings** → **Environment** section खोलें
3. **Add Environment Variable** button click करें
4. हर variable के लिए:
   - **Key:** Variable name (जैसे `PORT`)
   - **Value:** Variable value (जैसे `5000`)
   - **Add** button click करें
5. सभी variables add करने के बाद, service automatically redeploy होगा

## Security Notes:

⚠️ **Important:**
- `JWT_SECRET` को कभी भी GitHub में commit न करें
- Production में strong secret key use करें
- `FRONTEND_URL` में सही Vercel URL add करें (CORS के लिए)

## Testing:

Deploy के बाद test करें:
```bash
curl https://backend-9leq.onrender.com/api/health
```

Success response मिलना चाहिए:
```json
{"status":"OK","message":"Database connected"}
```

