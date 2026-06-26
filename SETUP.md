# IEC Electricity Dashboard — Setup Guide

## What you'll end up with

A live dashboard at `https://YOUR_GITHUB_USERNAME.github.io/iec/`  
Anyone with the link can upload an IEC CSV and instantly see their electricity usage analysis.

---

## Step 1 — Create a GitHub repo

1. Go to https://github.com/new
2. Name it **`iec`** (or anything you like)
3. Keep it **Public** (required for free GitHub Pages)
4. Don't add README / .gitignore (we have them already)
5. Click **Create repository**

---

## Step 2 — Push this project

```bash
cd /Users/albert/iec
git init
git add .
git commit -m "Initial IEC dashboard"
git remote add origin https://github.com/YOUR_USERNAME/iec.git
git push -u origin main
```

---

## Step 3 — Enable GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

---

## Step 4 — Create a Supabase project (for archiving uploads)

1. Go to https://supabase.com and sign up (free, no credit card)
2. Click **New project**, give it a name (e.g. `iec-uploads`)
3. Once created, go to **Storage** → **New bucket**
   - Name: `iec-uploads`
   - Toggle **Public** → OFF (private)
   - Click **Create**
4. Go to **Storage** → `iec-uploads` → **Policies** → **New policy**
   - Select **For full customization**
   - Policy name: `anon-insert`
   - Allowed operation: **INSERT** only
   - Target roles: **anon**
   - WITH CHECK expression: `true`
   - Save
5. Go to **Project Settings** → **API**
   - Copy **Project URL** and **anon/public key**

---

## Step 5 — Add secrets to GitHub

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add two secrets:
   - `VITE_SUPABASE_URL` → your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key

> **Note:** Even without Supabase, the dashboard works fine — uploads just won't be archived.

---

## Step 6 — Trigger the deploy

Push any change (or go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**).

After ~60 seconds your site will be live at:
```
https://YOUR_USERNAME.github.io/iec/
```

---

## Viewing archived uploads (as admin)

Go to **Supabase dashboard** → **Storage** → `iec-uploads` to see all uploaded files.

---

## Sharing with family

Just send the link: `https://YOUR_USERNAME.github.io/iec/`  
No login needed. They upload → see dashboard → close tab → done.
