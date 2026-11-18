# Deployment Guide

> **Project:** PixelForge by SPManchester Private Limited  
> **Document Version:** 1.0

---

## Overview

PixelForge is a fully static application — it consists of plain HTML, CSS, and JavaScript with no build step and no server-side runtime. It can be deployed to any platform capable of serving static files.

> [!IMPORTANT]
> Always serve PixelForge over **HTTPS** in production. The Canvas API and File API both work over plain HTTP for local testing, but modern browsers enforce security restrictions (such as blocking mixed content) that HTTPS resolves. Every platform listed below provides HTTPS automatically.

---

## 1. GitHub Pages

**Cost:** Free for public repositories  
**HTTPS:** Automatic  
**Custom domain:** Supported

### Step-by-Step

1. Push your project to a GitHub repository (the files must be in the **root** of the `main` branch, or in a subfolder you specify).
2. Navigate to your repository on GitHub.
3. Click **Settings** (the gear icon in the top navigation bar).
4. In the left sidebar, scroll to **Pages** under the *Code and automation* section.
5. Under **Build and deployment**, set the source to **Deploy from a branch**.
6. Set the branch to **`main`** and the folder to **`/ (root)`**.
7. Click **Save**.
8. GitHub Actions will trigger a deployment workflow. After 1–2 minutes your site will be live at:

```
https://<your-username>.github.io/<repository-name>/
```

> [!TIP]
> If you use a custom domain (see §6), set it in the **Custom domain** field on the same Pages settings page. GitHub will automatically provision a TLS certificate via Let's Encrypt.

### Keeping It Updated

Every push to the `main` branch automatically triggers a re-deployment. No manual steps are needed.

---

## 2. Netlify

**Cost:** Free tier available  
**HTTPS:** Automatic  
**Custom domain:** Supported

### Option A — Drag-and-Drop (Quickest)

1. Open [app.netlify.com](https://app.netlify.com) and log in (or sign up for free).
2. On the **Sites** dashboard, scroll to the bottom where it says *"Want to deploy a new site without connecting to Git?"*
3. **Drag and drop** your project folder (the folder containing `index.html`) onto the dashed drop zone.
4. Netlify uploads the files and assigns a random URL such as `https://random-name-123.netlify.app`.
5. Rename the site under **Site settings → Site details → Change site name**.

### Option B — Git Integration (Recommended for Ongoing Development)

1. Click **Add new site → Import an existing project**.
2. Connect your GitHub/GitLab/Bitbucket account and select your repository.
3. Configure the build settings:
   - **Build command:** *(leave blank — no build step needed)*
   - **Publish directory:** `.` (root) or the subfolder containing `index.html`
4. Click **Deploy site**.

Every push to your default branch will trigger an automatic re-deployment.

---

## 3. Vercel

**Cost:** Free tier (Hobby plan) available  
**HTTPS:** Automatic  
**Custom domain:** Supported

### Step-by-Step

1. Open [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New → Project**.
3. Select your repository from the list and click **Import**.
4. In the **Configure Project** screen:
   - **Framework Preset:** `Other`
   - **Root Directory:** Click **Edit** and set it to the folder containing `index.html` (use `.` if it's the repo root).
   - **Build Command:** *(leave blank)*
   - **Output Directory:** *(leave blank, or `.` if prompted)*
5. Click **Deploy**.

Your site will be available at `https://<project-name>.vercel.app` within about 30 seconds.

> [!NOTE]
> Vercel re-deploys automatically on every push to the production branch (usually `main`). Preview deployments are created for every pull request automatically.

---

## 4. Cloudflare Pages

**Cost:** Free tier available (unlimited requests, unlimited bandwidth)  
**HTTPS:** Automatic  
**Custom domain:** Supported

### Step-by-Step

1. Open the [Cloudflare dashboard](https://dash.cloudflare.com) and select your account.
2. Navigate to **Workers & Pages → Pages → Create a project**.
3. Choose **Connect to Git** and authorise Cloudflare to access your repository.
4. Select your repository and click **Begin setup**.
5. Configure the build settings:
   - **Project name:** e.g. `pixelforge`
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/` (or the subfolder containing `index.html`)
6. Click **Save and Deploy**.

Your site will be live at `https://<project-name>.pages.dev`.

> [!TIP]
> Cloudflare Pages has a generous free tier with no bandwidth caps, making it an excellent choice for high-traffic or file-heavy tools like PixelForge.

---

## 5. Self-Hosting (Any Static File Server)

If you prefer to host PixelForge on your own infrastructure, any web server capable of serving static files will work.

### Apache (`httpd.conf` or `.htaccess`)

```apache
<VirtualHost *:443>
    ServerName pixelforge.example.com
    DocumentRoot /var/www/pixelforge

    <Directory /var/www/pixelforge>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    # Recommended security headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set Referrer-Policy "no-referrer"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:;"

    SSLEngine on
    SSLCertificateFile    /etc/letsencrypt/live/pixelforge.example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/pixelforge.example.com/privkey.pem
</VirtualHost>
```

### Nginx (`nginx.conf` or site config)

```nginx
server {
    listen 443 ssl http2;
    server_name pixelforge.example.com;

    root /var/www/pixelforge;
    index index.html;

    # Serve all routes from index.html (single-page app pattern)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:;" always;

    # Cache static assets aggressively
    location ~* \.(css|js|png|jpg|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    ssl_certificate     /etc/letsencrypt/live/pixelforge.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pixelforge.example.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
}
```

### Python (Quick Local Preview)

```bash
# Python 3
python -m http.server 8080
# Then open http://localhost:8080
```

### Node.js (Quick Local Preview)

```bash
npx serve .
# or
npx http-server . -p 8080
```

> [!WARNING]
> The Python and Node.js one-liners above are for **local development only**. Do not expose them directly to the internet; use Apache or Nginx (with TLS) for production self-hosting.

---

## 6. Custom Domain Setup

All platforms listed above support custom domains. The general process is:

### Step 1 — Add the Domain to Your Hosting Platform

| Platform | Where to add it |
|---|---|
| GitHub Pages | Settings → Pages → Custom domain |
| Netlify | Site settings → Domain management → Add custom domain |
| Vercel | Project → Settings → Domains |
| Cloudflare Pages | Project → Custom domains → Set up a custom domain |

### Step 2 — Update Your DNS Records

Add one of the following DNS records at your domain registrar (or Cloudflare DNS):

**For a root/apex domain** (e.g. `pixelforge.example.com` → `example.com`):

| Type | Name | Value |
|---|---|---|
| `A` | `@` | IP address provided by your host |
| `ALIAS` / `ANAME` | `@` | CNAME target provided by your host (if your registrar supports it) |

**For a subdomain** (e.g. `tool.example.com`):

| Type | Name | Value |
|---|---|---|
| `CNAME` | `tool` | CNAME target provided by your host (e.g. `cname.vercel-dns.com`) |

### Step 3 — Wait for DNS Propagation

DNS changes can take anywhere from a few minutes to 48 hours to propagate globally. Use [dnschecker.org](https://dnschecker.org) to monitor propagation.

### Step 4 — TLS Certificate

GitHub Pages, Netlify, Vercel, and Cloudflare Pages all automatically provision a free TLS certificate (via Let's Encrypt or their own CA) once DNS is verified. No manual action is needed.

For self-hosted deployments, use [Certbot](https://certbot.eff.org/) to obtain a free Let's Encrypt certificate:

```bash
sudo certbot --nginx -d pixelforge.example.com
# or for Apache:
sudo certbot --apache -d pixelforge.example.com
```

Certbot will also set up automatic renewal.

---

## Deployment Comparison

| Platform | Free Tier | Auto HTTPS | Git Integration | Custom Domain | Bandwidth Limits |
|---|---|---|---|---|---|
| GitHub Pages | ✅ | ✅ | ✅ | ✅ | Soft 100 GB/month |
| Netlify | ✅ | ✅ | ✅ | ✅ | 100 GB/month |
| Vercel | ✅ | ✅ | ✅ | ✅ | 100 GB/month |
| Cloudflare Pages | ✅ | ✅ | ✅ | ✅ | Unlimited |
| Self-hosted | Infra cost | Manual (Certbot) | Manual | ✅ | Unlimited |

> [!TIP]
> For a zero-maintenance, zero-cost deployment of PixelForge, **Cloudflare Pages** offers the most generous free tier with unlimited bandwidth and automatic global CDN distribution.

---

*PixelForge is a product of **SPManchester Private Limited**. All rights reserved.*
