# Crush the House — static site for Vercel

A static clone of crushthehouse.com (moved off Squarespace). Plain HTML/CSS, no build step, plus one serverless function for the contact form.

## Pages
| URL | File |
|---|---|
| `/` (About) | `index.html` |
| `/contact` | `contact.html` |
| `/new-page` (Privacy Policy) | `new-page.html` |

`/home`, `/about` → `/` and `/privacy-policy` → `/new-page` redirect (see `vercel.json`).
The privacy policy stays at **/new-page** on purpose: if that URL was submitted for SMS / 10DLC registration, it must keep working.

## Deploy
1. Push this folder to a GitHub repo (or run `npx vercel` inside it).
2. In Vercel: **Add New → Project → Import** the repo. Framework preset: **Other**. No build command, output directory: root.
3. Add environment variables for the contact form (Project → Settings → Environment Variables):
   - `RESEND_API_KEY` — from resend.com (free tier: 3,000 emails/mo)
   - `CONTACT_TO` — `apply@crushthehouse.com`
   - `CONTACT_FROM` — e.g. `Crush the House <forms@crushthehouse.com>` (verify the domain in Resend first)
4. Redeploy, then submit a test entry on `/contact`.

## Move the domain off Squarespace
1. Vercel → Project → Settings → Domains → add `crushthehouse.com` and `www.crushthehouse.com`.
2. Wherever DNS lives (Squarespace Domains if registered there):
   - `A` record `@` → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`
   (Use whatever values Vercel shows — they're authoritative.)
3. **Keep any MX / email records** (apply@crushthehouse.com) untouched.
4. Once the Vercel site is live on the domain, cancel the Squarespace *website* plan. If the domain is registered through Squarespace, either keep the domain-only registration or transfer it (e.g. to Vercel, Cloudflare) before canceling.

## Notes
- The Squarespace cart (`/cart`) wasn't used, so it just redirects home.
- Contact form submissions previously lived in Squarespace — export them (Squarespace → Contacts / Form submissions) before canceling.
