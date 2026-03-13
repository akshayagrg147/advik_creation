# Deploy Advik E-Commerce on AWS (Very Low Cost)

Rough cost: **~$0–5/month** (depending on traffic and choices below).

---

## Auto-deploy on push & cost

**Will pushing small changes deploy automatically?**
- **Frontends (Amplify):** Yes. Once you connect your GitHub repo to Amplify, each push to the branch you chose triggers a new build and deploy. No extra setup.
- **Backend (Lightsail):** No, by default. You’d either:
  - **Manual:** SSH in, `git pull`, `pm2 restart advik-api`, or  
  - **Auto:** Use GitHub Actions to run those steps on push (free tier is enough).

**Will it cost extra?**
- **Amplify:** Free tier includes 1000 build minutes/month. A small frontend build is usually 1–3 minutes. So many pushes per month = still $0. Only if you exceed free tier (build minutes or bandwidth) would you pay a bit.
- **Lightsail:** Same fixed $3.50–5/month. Deploying new code doesn’t change the price.
- **GitHub Actions:** 2000 minutes/month free for private repos; a deploy job is ~1–2 min. Occasional pushes = no extra cost.

**Summary:** Small changes and normal push frequency = no meaningful extra cost; frontends can auto-deploy with Amplify; backend can auto-deploy if you add a simple GitHub Action.

---

## 1. Use MongoDB Atlas (Free) – Don’t Run DB on AWS

- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → sign up.
- Create a **free M0 cluster** (e.g. AWS region same as your app).
- Create a DB user (username + password).
- **Network Access** → Add IP: `0.0.0.0/0` (or your server IP later for better security).
- Get **connection string**: `mongodb+srv://user:pass@cluster.mongodb.net/advik_ecom`.
- Put this in your backend as `MONGODB_URI`. No DB cost on AWS.

---

## 2. Backend on AWS Lightsail (Cheapest VPS)

**Cost: ~$3.50–5/month** (512MB–1GB RAM).

1. **AWS Console** → **Lightsail** → Create instance:
   - **Platform:** Linux/Unix  
   - **Blueprint:** Node.js (or OS Only + you install Node)  
   - **Plan:** $3.50 or $5  
   - Pick a region close to your users.

2. **After instance is running**, connect (browser SSH or your terminal):
   ```bash
   # Install Node 20 (if not pre-installed)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Clone your repo (or upload backend folder)
   git clone https://github.com/akshayagrg147/advik_creation.git
   cd advik_creation/backend

   # Install and run
   npm install
   cp .env.example .env
   # Edit .env: set MONGODB_URI (Atlas), PORT=4000
   npm run seed   # optional
   node src/server.js
   ```

3. **Keep it running:** use **PM2** (free):
   ```bash
   sudo npm install -g pm2
   pm2 start src/server.js --name advik-api
   pm2 save && pm2 startup
   ```

4. **Open port 4000** in Lightsail: Networking → add TCP 4000.

5. **Static IP** (Lightsail): Create one and attach to instance so the URL doesn’t change.

Your API will be: `http://YOUR_STATIC_IP:4000`

---

## 3. Frontends (Admin + Customer) – Free / Very Cheap

Two options: **Amplify** (easiest) or **S3 + CloudFront** (slightly more setup, very cheap).

### Option A: AWS Amplify (Easiest, Free Tier)

**Cost: $0** within free tier (limited build minutes + GB/month).

1. **Build both frontends locally** (set API URL first):
   ```bash
   # Customer frontend
   cd stylejaipur-clone
   echo "VITE_API_URL=https://YOUR_LIGHTSAIL_IP:4000/api" > .env
   npm install && npm run build
   # Upload or connect repo: deploy dist/ as static site

   # Admin
   cd advik-admin
   echo "VITE_API_URL=https://YOUR_LIGHTSAIL_IP:4000/api" > .env
   npm install && npm run build
   ```

2. **Amplify Console** → **New app** → **Host web app**:
   - Connect GitHub repo `advik_creation`.
   - **Monorepo:** set base path (e.g. `stylejaipur-clone` or `advik-admin`).
   - Build: `npm ci && npm run build`; output: `dist`.
   - Create **two apps** (or two branches): one for admin, one for customer, each pointing to its folder.

3. Amplify gives you HTTPS URLs. Point your domain there (or use Amplify’s default URL).

### Option B: S3 + CloudFront (Cents per Month)

1. **S3:** Create two buckets (e.g. `advik-admin` and `advik-store`). Enable **Static website hosting** (index.html, error=index.html for SPA).
2. **Build** both apps (with correct `VITE_API_URL`), then upload:
   ```bash
   aws s3 sync stylejaipur-clone/dist s3://advik-store --delete
   aws s3 sync advik-admin/dist s3://advik-admin --delete
   ```
3. **CloudFront:** Create two distributions; origin = each S3 bucket; default root = `index.html`; viewer protocol = Redirect HTTP to HTTPS.
4. **SSL:** Request certificate in **ACM** (us-east-1 if using CloudFront) for your domain; attach to CloudFront.

---

## 4. CORS and Environment

- **Backend `.env`** on Lightsail: set `MONGODB_URI` (Atlas) and allow your frontend origins:
  - In code (e.g. `server.js`), add your Amplify/CloudFront URLs to `allowedOrigins` (e.g. `https://main.xxxx.amplifyapp.com`, `https://yourdomain.com`).
- **Frontend `.env`** (or build env in Amplify):  
  `VITE_API_URL=https://YOUR_LIGHTSAIL_IP:4000/api`  
  or `https://api.yourdomain.com/api` if you put CloudFront/ALB in front of the API later.

---

## 5. (Optional) Custom Domain and HTTPS for API

- **Lightsail:** Attach a **Load Balancer** (~$18/mo) **or** put **CloudFront** in front of the Lightsail origin and use **ACM** for HTTPS (CloudFront free tier can cover low traffic).
- Cheaper: use **CloudFlare** (free) in front of Lightsail: add site, proxy through CloudFlare, use their SSL. Then use `https://api.yourdomain.com` for `VITE_API_URL`.

---

## 6. Cost Summary (Target: Very Low Cost)

| Item              | Option              | Cost          |
|-------------------|---------------------|---------------|
| Database          | MongoDB Atlas M0    | **$0**        |
| Backend           | Lightsail 512MB–1GB | **~$3.50–5/mo** |
| Admin + Customer  | Amplify free tier   | **$0**        |
| Or static         | S3 + CloudFront     | **Cents**     |
| Domain            | Route 53 or CloudFlare | **$0–0.50/mo** |

**Total: ~$0–5/month** (with Amplify free tier for frontends and Atlas for DB).

---

## 7. Quick Checklist

- [ ] MongoDB Atlas M0 created; `MONGODB_URI` in backend `.env`.
- [ ] Lightsail instance: Node, PM2, port 4000 open, static IP.
- [ ] Backend `allowedOrigins` includes your frontend URLs.
- [ ] Both frontends built with correct `VITE_API_URL`.
- [ ] Admin + customer deployed on Amplify (or S3+CloudFront).
- [ ] (Optional) Domain + CloudFlare/ACM for HTTPS on API.

If you tell me whether you prefer “single server (Lightsail only)” or “Lightsail + Amplify,” I can give you exact commands and repo changes (e.g. CORS, env) for that setup.
