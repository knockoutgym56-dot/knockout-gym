# 🥊 KNOCKOUT GYM WEBSITE — COMPLETE SETUP GUIDE
### One document. Everything. Termux + Supabase + Vercel.

---

## UNDERSTANDING THE SYSTEM (read this first — 2 minutes)

```
YOUR TABLET (Termux)          SUPABASE (Free Cloud Database)      VERCEL (Free Hosting)
─────────────────────         ────────────────────────────────     ──────────────────────
You write the code      →     Stores all gym content, members,  →  Runs the website
                              enquiries, owner login                live on the internet
                              
Owner changes anything  →     Saves to Supabase                 →  Visitors see it
on any phone                  (not just one device)                 everywhere instantly
```

**The old problem (fixed):** localStorage only saved on ONE browser on ONE device.
**The new system:** Supabase = cloud database. Owner changes on phone → shows on laptop, tablet, everywhere.

---

## PART 1 — TERMUX SETUP (one time, ~10 minutes)

Open Termux on your tablet and run these commands **one by one**.
Wait for each to finish before running the next.

```bash
# Update Termux
pkg update -y && pkg upgrade -y

# Install Node.js
pkg install nodejs-lts -y

# Install Git
pkg install git -y

# Verify everything installed
node -v    # must show v20.x.x
npm -v     # must show 10.x.x
git --version  # must show 2.x.x
```

### Create the project

```bash
# Go to home folder
cd ~

# Create Vite + React project
npm create vite@latest knockout-gym -- --template react

# Enter the project
cd knockout-gym

# Install base packages
npm install

# Install project-specific packages
npm install @supabase/supabase-js gsap lenis react-router-dom

# Verify install worked
npm list @supabase/supabase-js   # must show the package
```

---

## PART 2 — ADD ALL CODE FILES

### Step 1: Allow file manager access
```bash
termux-setup-storage
```
Tap "Allow" when it asks for permission.

### Step 2: Install Acode editor (makes editing files easy)
- Download Acode from Play Store (free)
- It works like VS Code on your tablet

### Step 3: Find your project
In your tablet file manager:
```
Internal Storage → Android → data → com.termux → files → home → knockout-gym
```

### Step 4: Copy all files from the ZIP
The ZIP you downloaded contains the complete project.
Extract the ZIP and copy all files into the knockout-gym folder.
**Replace existing files when asked.**

Key file structure (all files already in the ZIP):
```
knockout-gym/
├── package.json
├── vite.config.js       ← base: '/' for Vercel
├── vercel.json          ← fixes page routing
├── index.html
├── .env.example         ← shows what env vars to add
├── public/
│   ├── favicon.svg
│   └── videos/          ← put your gym videos here
└── src/
    ├── index.css
    ├── main.jsx
    ├── App.jsx          ← secret panel route is here
    ├── lib/
    │   ├── supabase.js  ← Supabase client + auth
    │   └── db.js        ← all database functions
    ├── data/
    │   └── defaultContent.js ← placeholder content
    ├── context/
    │   ├── ContentProvider.jsx  ← reads from cloud DB
    │   └── LoadingProvider.jsx
    ├── utils/
    │   └── splitText.js
    ├── components/
    │   ├── Navbar/    Navbar.jsx + Navbar.css
    │   ├── Loader/    Loader.jsx + Loader.css
    │   ├── Cursor/    Cursor.jsx + Cursor.css
    │   ├── HoverLinks/ HoverLinks.jsx + .css
    │   └── Footer/    Footer.jsx + Footer.css
    └── pages/
        ├── Home.jsx + Home.css
        ├── Story.jsx + Story.css
        ├── Results.jsx + Results.css
        ├── GalleryPage.jsx + .css
        ├── ContactPage.jsx + .css
        └── OwnerPanel.jsx + OwnerPanel.css
```

---

## PART 3 — SUPABASE SETUP (one time, ~15 minutes)

### Step 1: Create account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with Google or email

### Step 2: Create project
1. Click "New project"
2. Name: `knockout-gym`
3. Database password: make a strong one, **save it somewhere**
4. Region: `South Asia (Mumbai ap-southeast-1)` — fastest for India
5. Click "Create new project"
6. Wait 2-3 minutes

### Step 3: Run the SQL — EXACT COMMANDS (copy all, paste at once)

Click **"SQL Editor"** in left sidebar. Paste this **entire block** and click **RUN**:

```sql
-- ══════════════════════════════════════════════════
--  KNOCKOUT GYM DATABASE SETUP
--  Run this entire block in Supabase SQL Editor
--  One time only
-- ══════════════════════════════════════════════════

-- 1. SITE CONTENT table (stores all gym info, gallery, etc.)
CREATE TABLE IF NOT EXISTS kg_data (
  id    BIGSERIAL PRIMARY KEY,
  key   TEXT UNIQUE NOT NULL,
  value JSONB
);

-- 2. MEMBERS table (gym member records — private)
CREATE TABLE IF NOT EXISTS kg_members (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT,
  plan        TEXT DEFAULT 'Standard',
  startdate   TEXT,
  enddate     TEXT,
  amountpaid  TEXT,
  status      TEXT DEFAULT 'active',
  notes       TEXT DEFAULT '',
  history     JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENQUIRIES table (contact form submissions)
CREATE TABLE IF NOT EXISTS kg_enquiries (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT,
  phone       TEXT,
  message     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
--  SECURITY: Row Level Security (RLS)
--  Visitors can READ site content & SUBMIT enquiries
--  Only authenticated owner can do everything else
-- ══════════════════════════════════════════════════

ALTER TABLE kg_data      ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_enquiries ENABLE ROW LEVEL SECURITY;

-- kg_data: website reads it (public), only owner writes it
CREATE POLICY "public_read_content"
  ON kg_data FOR SELECT USING (true);

CREATE POLICY "owner_write_content"
  ON kg_data FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "owner_update_content"
  ON kg_data FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "owner_delete_content"
  ON kg_data FOR DELETE
  USING (auth.role() = 'authenticated');

-- kg_members: FULLY PRIVATE — only owner can access
CREATE POLICY "owner_all_members"
  ON kg_members FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- kg_enquiries: anyone can submit (contact form), only owner reads
CREATE POLICY "public_insert_enquiry"
  ON kg_enquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "owner_read_enquiries"
  ON kg_enquiries FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "owner_delete_enquiry"
  ON kg_enquiries FOR DELETE
  USING (auth.role() = 'authenticated');
```

You should see: **"Success. No rows returned."** ✓

### Step 4: Create the owner login account

This is the email + password you'll use to open the owner panel.

1. In Supabase left sidebar → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Email: use any email (e.g. `kgowner@gmail.com`)
4. Password: choose a strong password (min 8 characters)
5. Check **"Auto Confirm User"**
6. Click **"Create User"**

**Save this email and password securely.** This is your owner panel login.

### Step 5: Get your API keys

1. Left sidebar → **Project Settings** (gear icon at bottom)
2. Click **"API"**
3. Copy and save:
   - **Project URL** — looks like: `https://abcdefgh.supabase.co`
   - **anon public** key — long string starting with `eyJ...`

---

## PART 4 — GITHUB SETUP (one time)

### Create GitHub account and repo
1. Go to https://github.com → Sign up
2. Click "+" → "New repository"
3. Name: `knockout-gym`
4. Set to: **Public**
5. **DO NOT** check "Initialize with README"
6. Click "Create repository"

### Push code from Termux
```bash
cd ~/knockout-gym

# Initialize git
git init
git add .
git commit -m "initial commit - knockout gym"
git branch -M main

# Link to your GitHub (replace YOURUSERNAME)
git remote add origin https://github.com/YOURUSERNAME/knockout-gym.git

# Push
git push -u origin main
```

If it asks for password: use a **GitHub Personal Access Token**.
Create one: GitHub → Settings → Developer Settings → Personal Access Tokens → Classic → Generate new → Check "repo" → Copy → use as password.

---

## PART 5 — VERCEL DEPLOYMENT (one time, ~5 minutes)

### Step 1: Connect Vercel to GitHub
1. Go to https://vercel.com
2. Click "Continue with GitHub" → Authorize
3. Click "New Project"
4. Find **knockout-gym** → click **Import**
5. Framework Preset: select **Vite**

### Step 2: Add Supabase keys (CRITICAL — do before Deploy)
Under **"Environment Variables"** add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

### Step 3: Deploy
Click **"Deploy"** — wait 1-2 minutes.

Your site is now live at:
```
https://knockout-gym-XXXXXX.vercel.app
```

Vercel also gives you a permanent URL like:
```
https://knockout-gym.vercel.app
```

### Step 4: Add custom domain (optional)
If you have a domain (e.g. knockoutgymzirakpur.com):
- Vercel → Project → Settings → Domains → Add your domain
- Follow DNS instructions (takes up to 24 hours)

---

## PART 6 — HOW TO USE THE OWNER PANEL

### Open from any phone or device:
```
https://your-vercel-url.vercel.app/kgadmin-9x2
```

### Login:
- **Email**: the email you created in Supabase Step 4
- **Password**: the password you set

### The panel always shows LATEST data because:
- All content is stored in Supabase (cloud)
- When you open the panel on any device → fetches from cloud
- No "default" data shown after first setup
- Changes save instantly and show everywhere

### What you can change from the panel:

| Tab | What changes |
|-----|-------------|
| 🎯 Hero Section | Big heading, background video or image, button text |
| ℹ️ Gym Info | Name, address, phone, hours, WhatsApp, Instagram, Google Maps |
| 📊 Stats | 4 counter numbers (members, rating, years, reviews) |
| 👤 Owner Profile | Name, photo, bio, achievements list |
| 📖 Gym Story | Timeline — add/remove/edit each year's story + photo |
| 💪 Results | Before/After cards — add/remove/edit + photos |
| 📸 Gallery | Add/remove/edit photos, captions, categories |
| 🏆 Trophies | Add/remove/edit awards with photos |
| 💳 Membership Plans | Add/remove/edit plans, prices, features |
| 👥 Members | Full member database — add, edit, extend, pause, delete |
| 📧 Enquiries | View contact form submissions, export CSV |
| 🔒 Security | Change owner panel password |

### Change the password:
1. Log into panel
2. Click **Security** tab (🔒)
3. Enter new password (min 8 characters)
4. Confirm → click Change Password

### Change the secret URL:
1. Open `src/App.jsx` in Acode
2. Find: `path="/kgadmin-9x2"`
3. Change `kgadmin-9x2` to anything you want
4. Save → push to GitHub → Vercel auto-deploys

---

## PART 7 — HOW TO ADD IMAGES

### Method 1: Paste a URL (easiest)
- Upload photo to Google Photos → Share → "Create link" → Copy
- OR upload to imgbb.com (free) → Copy the link
- OR use Cloudinary.com (free account) → Upload → Copy URL
- Paste the URL in owner panel → image field → Save Changes

### Method 2: Upload directly from tablet
- In owner panel → any image field → click "📱 Upload from Phone/Tablet"
- Pick from gallery → uploads automatically
- Max 3MB per image. If larger: compress at **squoosh.app** (free)

### Image field labels explained:
Every image field in the owner panel tells you exactly what it's for:

- **HERO BACKGROUND IMAGE** → Full-screen photo on the home page
- **HERO BACKGROUND VIDEO** → Video playing on home page  
- **OWNER PROFILE PHOTO** → Owner's photo on Story page
- **TIMELINE PHOTO "2019"** → Photo shown next to 2019 story
- **GALLERY PHOTO 1** → Photo in the Gallery page
- **TROPHY PHOTO** → Close-up of trophy/medal
- **BEFORE PHOTO** → Member's before transformation photo
- **AFTER PHOTO** → Member's after transformation photo

---

## PART 8 — HOW TO ADD VIDEOS

### Option A: Direct file (best quality)
```bash
# In Termux, create videos folder
mkdir -p ~/knockout-gym/public/videos

# Copy your video there (using file manager)
# Name it: hero.mp4
```

In owner panel → Hero Section → Hero Background Video:
```
/videos/hero.mp4
```

Then push to GitHub:
```bash
cd ~/knockout-gym
git add public/videos/hero.mp4
git commit -m "add hero video"
git push
```

Vercel auto-deploys. ⚠️ Keep video under 50MB (GitHub limit is 100MB).
Compress video with "Video Compressor" app (free, Play Store).

### Option B: YouTube embed
Upload to YouTube (can be Unlisted) → get video ID from URL → paste:
```
https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=VIDEO_ID
```

---

## PART 9 — HOW THE WEBSITE ADAPTS TO CONTENT CHANGES

The website is built to handle any amount of content:

| If you... | Website does... |
|-----------|----------------|
| Remove an image | That image slot disappears — no broken box |
| Add 10 gallery photos or 2 | Masonry grid fills perfectly either way |
| Write a short bio or very long bio | Text wraps and the section grows |
| Add 2 membership plans or 5 | Grid adjusts automatically |
| Remove a timeline event | Timeline skips that year cleanly |
| Add 1 trophy or 8 | Horizontal scroll handles any number |
| Remove all results photos | Results section is hidden automatically |
| Leave a stat empty | That stat is hidden |
| Add or remove nav links | Navbar/footer adjusts |

**Rule:** Every section only shows if it has real data. Nothing is ever broken or empty.

---

## PART 10 — UPDATING THE SITE (after changes)

### If you changed code files:
```bash
cd ~/knockout-gym
git add .
git commit -m "describe what you changed"
git push
# Vercel detects the push and auto-deploys in 1-2 minutes
```

### If you only changed content from owner panel:
- Changes save to Supabase instantly
- No code push needed
- Visible everywhere immediately

### Test locally before pushing:
```bash
# Create .env.local with your Supabase keys
nano ~/knockout-gym/.env.local
```
Type inside:
```
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJyour-key-here
```
Save (Ctrl+X → Y → Enter). Then:
```bash
npm run dev
# Open browser → http://localhost:5173
```

---

## PART 11 — SECURITY SUMMARY

| What | Who can access |
|------|---------------|
| Website content (gym info, gallery, etc.) | Everyone (needed for site to work) |
| Write/change site content | Only authenticated owner |
| Member records | Only authenticated owner |
| Enquiry submissions (contact form) | Anyone can submit |
| Read/delete enquiries | Only authenticated owner |
| Owner panel URL | Only people you tell it to |
| Owner panel login | Only people with email + password |

**Why member data is safe:**
- Supabase RLS blocks ALL reads of `kg_members` table unless you're logged in
- Even if someone finds the Supabase URL and API key in the browser, they get nothing
- The anon key can only read site content and submit enquiries — that's it

---

## PART 12 — COMMON ERRORS AND FIXES

**Error: "command not found: npm"**
```bash
pkg install nodejs-lts -y
```

**Error: Website shows blank page on Vercel**
- Check vercel.json exists in project root
- Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel → Settings → Environment Variables
- Redeploy: Vercel → Project → Deployments → "..." → Redeploy

**Error: Owner panel shows "Checking session..." forever**
- Your Supabase keys may be wrong
- Check them in Vercel → Settings → Environment Variables

**Error: "Wrong email or password" in owner panel**
- Use the exact email and password from Supabase → Authentication → Users
- If forgot: Supabase → Authentication → Users → find user → click → Reset password

**Error: Members table shows empty even after login**
- Make sure you ran the full SQL block in Part 3 Step 3
- Re-run it — it uses IF NOT EXISTS so it's safe to run again

**Error: Contact form says "sent" but no enquiry appears in panel**
- Check Supabase → Table Editor → kg_enquiries
- If table doesn't exist: re-run the SQL from Part 3 Step 3

**Error: npm install is slow on tablet**
- This is normal. Takes 3-5 minutes first time
- If it crashes: `export NODE_OPTIONS="--max-old-space-size=512"` then retry

**Error: git push asks for password**
```bash
gh auth login
```
Or use Personal Access Token as password (Settings → Developer Settings → PAT)

---

## QUICK REFERENCE — ALL COMMANDS

```bash
# Start local development server
cd ~/knockout-gym && npm run dev
# Open browser: http://localhost:5173

# Stop server
Ctrl+C

# Push changes and deploy to Vercel
git add . && git commit -m "your message" && git push
# Vercel auto-deploys in ~1 minute

# If packages missing
npm install

# If build fails
npm run build  # see error, fix it, try again
```

---

## FINAL CHECKLIST

Before showing the site to the client:

```
SUPABASE:
☐ Account created
☐ Project created (Mumbai region)
☐ SQL block executed successfully
☐ Owner user created (email + password saved)
☐ API URL and anon key copied

VERCEL:
☐ GitHub repo created and code pushed
☐ Vercel connected to GitHub repo
☐ VITE_SUPABASE_URL added in Vercel
☐ VITE_SUPABASE_ANON_KEY added in Vercel
☐ Site deployed and live URL works

OWNER PANEL:
☐ Can log in at /kgadmin-9x2 with email + password
☐ Can change gym info and see it live on website
☐ Can add a member and see them in members list
☐ Contact form submission appears in Enquiries tab
☐ Password changed from default

CONTENT:
☐ Real gym name, address, phone entered
☐ Real owner photo uploaded
☐ Real gym photos added to gallery
☐ Hero video or image added
☐ Membership plans updated with real prices
☐ Default placeholder content replaced
```

---

*Built for Knockout Gym, Zirakpur, Punjab*
*Developed by Rajat Kumar Dua*
*Stack: React + Vite + Supabase + Vercel · 100% Free Hosting*
