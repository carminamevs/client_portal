# FHL Portal Redirect — Vercel Setup

## What this does
Receives a POST webhook from GHL, builds the portal URL with all client
data as query params, and redirects the client's browser to their portal.

---

## Deploy to Vercel (one time)

### Option A — Vercel Dashboard (no terminal needed)
1. Go to https://vercel.com and log in
2. Click **Add New → Project**
3. Click **"Import from GitHub"** — push this folder to a GitHub repo first, or use Option B

### Option B — Deploy via GitHub (recommended)
1. Create a new GitHub repo (can be private)
2. Upload these 3 files:
   - `api/portal.js`
   - `vercel.json`
   - `package.json`
3. Go to https://vercel.com → **Add New → Project**
4. Select your GitHub repo → click **Deploy**
5. Vercel gives you a URL like: `https://fhl-portal-redirect.vercel.app`

### Option C — Vercel CLI
```bash
npm i -g vercel
cd portal-redirect
vercel
```

---

## After deploying

### 1. Update your portal URL
Open `api/portal.js` and update this line with your actual portal page URL:
```js
const PORTAL_URL = 'https://myslimdownsuccess.com/client_portal';
```
Redeploy after changing.

### 2. Update GHL Webhook URL
In your GHL workflow → Webhook action, set the URL to:
```
https://YOUR-VERCEL-APP.vercel.app/api/portal
```

### 3. GHL Webhook Custom Data fields
Make sure all these key/value pairs are in the webhook:

| Key     | Value                              |
|---------|------------------------------------|
| name    | {{contact.first_name}}             |
| last    | {{contact.last_name}}              |
| type    | {{contact.portal_type}}            |
| code    | {{contact.metabolic_reset_code}}   |
| astatus | {{contact.assessment_status}}      |
| loom    | {{contact.loom_before_zoom}}       |
| pay     | {{contact.payment_link}}           |
| bnpl    | {{contact.bnpl_link}}              |
| coupon  | {{contact.coupon_code}}            |
| disc    | {{contact.coupon_discount}}        |
| rdate   | {{contact.reveal_call_date}}       |
| lr      | {{contact.link_report}}            |
| ld      | {{contact.link_discovery}}         |
| lrv     | {{contact.link_reveal}}            |
| lrc     | {{contact.link_recipe}}            |
| lcs     | {{contact.link_cheatsheet}}        |
| lg      | {{contact.link_guide}}             |
| lo      | {{contact.link_onboarding}}        |
| la      | {{contact.link_anthem}}            |
| lm      | {{contact.link_manual}}            |
| lw6     | {{contact.link_week6}}             |
| lf      | {{contact.link_final}}             |
| so      | {{contact.status_onboarding}}      |
| sa      | {{contact.status_anthem}}          |
| sm      | {{contact.status_manual}}          |
| sw6     | {{contact.status_week6}}           |
| sf      | {{contact.status_final}}           |
| pstart  | {{contact.cohort_start_date}}      |
| pend    | {{contact.program_end}}            |

---

## How the redirect works
1. Client submits email on GHL Page 1 form
2. GHL workflow fires, substitutes all {{contact.*}} values in webhook data
3. GHL POSTs real values to Vercel
4. Vercel builds: `https://your-portal.com/client_portal?name=Sarah&last=Johnson&...`
5. Vercel sends 302 redirect to client browser
6. Client lands on their portal, fully personalized

---

## Testing
Use a tool like https://webhook.site to inspect what GHL actually sends,
then test the Vercel URL directly:
```
https://your-vercel-app.vercel.app/api/portal?name=Sarah&last=Test&type=assessment&code=Meal+Frequency
```
(GET requests also work for manual testing)
