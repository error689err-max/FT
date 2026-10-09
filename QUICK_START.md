# 🚀 Family Tree MVP - Quick Start Guide

Get the app running in **5 minutes**!

---

## ⏱️ 5-Minute Setup

### Step 1: Get Supabase Credentials (2 minutes)

1. Visit: https://app.supabase.com
2. Select your project (create one if needed)
3. Click **Settings** (gear icon) → **API**
4. Copy these three values:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
```

📍 **See "How to Get Supabase Credentials" guide for detailed instructions**

---

### Step 2: Create .env.local File (1 minute)

1. In your project root, create a file named `.env.local`
2. Paste the template:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Replace the values with what you copied from Supabase

---

### Step 3: Configure Auth Redirects (1 minute)

In Supabase:

1. Settings → **Authentication**
2. Click **"URL Configuration"**
3. Add redirect URL: `http://localhost:3000/auth/callback`

---

### Step 4: Install & Run (1 minute)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit: **http://localhost:3000** 🎉

---

## ✅ You're Done!

Try:
- Sign up with email
- Create a person
- View the family tree
- Check the stats

---

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
npm run dev -- -p 3001
# Use port 3001 instead
```

### TypeScript errors?
```bash
npm exec tsc -- --noEmit
# Shows type errors if any
```

### Build issues?
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Environment not loaded?
```bash
# Restart the dev server after creating .env.local
# The new environment variables will be loaded
```

---

## 📚 Full Documentation

- **README.md** - Project overview
- **API_DOCUMENTATION.md** - API reference
- **DEPLOYMENT_GUIDE.md** - Production deployment
- **How to Get Supabase Credentials** - Detailed setup

---

## 🎯 Next Steps

1. ✅ Get Supabase credentials
2. ✅ Create .env.local
3. ✅ Run `npm run dev`
4. ✅ Sign up and test
5. 📖 Read full docs if needed

---

**Questions?** Check the other documentation files or Supabase docs: https://supabase.com/docs
