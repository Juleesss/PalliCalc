# Hosting Guide — Getting PalliCalc Online

PalliCalc is a **static single-page application** (no backend, no database). Once built, it produces plain HTML/CSS/JS files that any static hosting service can serve. This guide covers every step from zero to a live URL.

---

## Prerequisites

Before you start, make sure you have:

- **Node.js** (v18 or later) — [https://nodejs.org](https://nodejs.org)
- **Git** — [https://git-scm.com](https://git-scm.com)
- A **GitHub account** — [https://github.com](https://github.com) (free tier is sufficient)

---

## Step 1: Build the Production Bundle

The build command compiles TypeScript and bundles everything into optimized static files.

```bash
cd frontend
npm install          # install dependencies (skip if already done)
npm run build        # outputs to frontend/dist/
```

After the build completes, the `frontend/dist/` folder contains everything needed to serve the app:

```
frontend/dist/
├── index.html
└── assets/
    ├── index-XXXXX.css
    └── index-XXXXX.js
```

You can verify the build works locally:

```bash
npm run preview      # opens a local preview server at http://localhost:4173
```

---

## Step 2: Push the Repository to GitHub

### 2a. Create a GitHub repository

1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `pallicalc` (or whatever you prefer)
3. Visibility: **Public** (required for free GitHub Pages) or **Private** (works with Netlify/Vercel free tiers)
4. Do **not** initialize with README (you already have one)
5. Click **Create repository**

### 2b. Push your local code

Replace `YOUR_USERNAME` with your GitHub username:

```bash
cd C:\Users\gyusz\OPIOID_CALCULATOR
git remote add origin https://github.com/YOUR_USERNAME/pallicalc.git
git branch -M main
git push -u origin main
```

You'll be prompted for GitHub credentials. If you have 2FA enabled, use a **Personal Access Token** instead of your password:
- Go to GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
- Generate a token with `repo` scope
- Use that token as your password when pushing

---

## Step 3: Choose a Hosting Platform

Below are three options, ordered by simplicity. **Pick one.**

---

### Option A: GitHub Pages (Simplest — Recommended)

**Cost:** Free
**URL format:** `https://YOUR_USERNAME.github.io/pallicalc/`

#### A1. Configure Vite for subpath deployment

GitHub Pages serves from a subpath (`/pallicalc/`), so Vite needs to know this. Edit `frontend/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/pallicalc/',   // <-- must match your GitHub repo name
})
```

> **Important:** If your repo name is different from `pallicalc`, use that name instead.

#### A2. Install the GitHub Pages deploy tool

```bash
cd frontend
npm install --save-dev gh-pages
```

#### A3. Add a deploy script to `package.json`

Open `frontend/package.json` and add this to the `"scripts"` section:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "deploy": "npm run build && gh-pages -d dist"
}
```

#### A4. Deploy

```bash
cd frontend
npm run deploy
```

This builds the project and pushes the `dist/` folder to a `gh-pages` branch on GitHub.

#### A5. Enable GitHub Pages in repository settings

1. Go to your repository on GitHub
2. Click **Settings** > **Pages** (left sidebar)
3. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes

Your app will be live at: **`https://YOUR_USERNAME.github.io/pallicalc/`**

#### Updating the site

Every time you make changes, just run:

```bash
cd frontend
npm run deploy
```

---

### Option B: Netlify (Auto-deploy on every push)

**Cost:** Free (100 GB bandwidth/month, unlimited sites)
**URL format:** `https://pallicalc.netlify.app` (customizable)

#### B1. No Vite config changes needed

Netlify serves from the root path, so leave `vite.config.ts` as-is (no `base` needed).

#### B2. Sign up and connect your repo

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **Sign up** > **Sign up with GitHub**
3. Authorize Netlify to access your GitHub account

#### B3. Import your project

1. Click **Add new site** > **Import an existing project**
2. Select **GitHub** and pick your `pallicalc` repository
3. Configure the build settings:

| Setting            | Value            |
|--------------------|------------------|
| **Base directory** | `frontend`       |
| **Build command**  | `npm run build`  |
| **Publish directory** | `frontend/dist` |

4. Click **Deploy site**

#### B4. Wait for deployment

Netlify will install dependencies, build the project, and deploy. This takes about 1-2 minutes. You'll get a random URL like `https://random-name-12345.netlify.app`.

#### B5. Customize the URL (optional)

1. Go to **Site configuration** > **Site details** > **Change site name**
2. Enter `pallicalc` (if available)
3. Your site is now at: **`https://pallicalc.netlify.app`**

#### Auto-updates

Every time you `git push` to `main`, Netlify automatically rebuilds and deploys. No manual action needed.

---

### Option C: Vercel (Similar to Netlify)

**Cost:** Free (100 GB bandwidth/month)
**URL format:** `https://pallicalc.vercel.app` (customizable)

#### C1. No Vite config changes needed

#### C2. Sign up and connect

1. Go to [https://vercel.com](https://vercel.com)
2. Click **Sign Up** > **Continue with GitHub**
3. Authorize Vercel

#### C3. Import your project

1. Click **Add New...** > **Project**
2. Select your `pallicalc` repository
3. Configure:

| Setting             | Value           |
|---------------------|-----------------|
| **Framework Preset** | Vite           |
| **Root Directory**   | `frontend`     |

4. Click **Deploy**

#### C4. Done

Vercel builds and deploys automatically. You get a URL like `https://pallicalc-xyz.vercel.app`.

To customize: go to **Settings** > **Domains** and add `pallicalc.vercel.app`.

Auto-deploys on every push to `main`, same as Netlify.

---

## Step 4: Custom Domain (Optional)

If you own a domain (e.g. `pallicalc.hu`), you can point it to any of the above services.

### Buy a domain

- [Namecheap](https://www.namecheap.com) — affordable, good UI
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) — at-cost pricing
- [domain.hu](https://domain.hu) — for `.hu` domains specifically

### Connect it

**GitHub Pages:**
1. In your repo: Settings > Pages > Custom domain > enter `pallicalc.hu`
2. At your domain registrar, add a **CNAME** record:
   - Name: `www`
   - Value: `YOUR_USERNAME.github.io`
3. For the apex domain (`pallicalc.hu`), add **A** records pointing to GitHub's IPs:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
4. Check **Enforce HTTPS** in GitHub Pages settings

**Netlify:**
1. Go to Site configuration > Domain management > Add custom domain
2. Add a **CNAME** record at your registrar pointing to your Netlify URL
3. Netlify handles HTTPS automatically

**Vercel:**
1. Go to Settings > Domains > Add
2. Follow the DNS instructions shown (usually a CNAME or A record)
3. Vercel handles HTTPS automatically

---

## Quick Reference: Complete Deploy with GitHub Pages

End-to-end commands starting from the current state of the project:

```bash
# 1. Configure base path
#    Edit frontend/vite.config.ts and add: base: '/pallicalc/'

# 2. Install deploy tool
cd C:\Users\gyusz\OPIOID_CALCULATOR\frontend
npm install --save-dev gh-pages

# 3. Add deploy script to package.json (see section A3 above)

# 4. Create GitHub repo and push
cd C:\Users\gyusz\OPIOID_CALCULATOR
git remote add origin https://github.com/YOUR_USERNAME/pallicalc.git
git branch -M main
git push -u origin main

# 5. Deploy to GitHub Pages
cd frontend
npm run deploy

# 6. Enable Pages in GitHub repo settings (branch: gh-pages, folder: root)

# Done! Live at https://YOUR_USERNAME.github.io/pallicalc/
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page after deploy | Check that `base` in `vite.config.ts` matches your repo name exactly |
| 404 on page refresh | Not applicable — PalliCalc is a single-page app with no routing |
| Build fails on Netlify/Vercel | Make sure **Base directory** is set to `frontend`, not the repo root |
| `gh-pages` command not found | Run `npm install --save-dev gh-pages` inside `frontend/` |
| GitHub push rejected | Generate a Personal Access Token (Settings > Developer settings > Tokens) |
| DNS not working for custom domain | DNS propagation takes up to 48 hours; verify records with `dig` or [dnschecker.org](https://dnschecker.org) |
