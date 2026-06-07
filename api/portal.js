// api/portal.js
// Two-request pattern:
// 1. GHL workflow fires a POST webhook with all contact data → stored in KV by email
// 2. Browser arrives via GET (form redirect) with just the email → looks up KV, redirects to portal

import { kv } from '@vercel/kv';

const PORTAL_URL = 'https://client-portal-three-kappa.vercel.app/client_portal.html';

const FIELDS = [
  'name','last','type','code','astatus',
  'loom','pay','bnpl','coupon','disc','rdate',
  'lr','ld','lrv','lrc','lcs','lg',
  'lo','la','lm','lw6','lf',
  'so','sa','sm','sw6','sf',
  'pstart','pend'
];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {

    // ── POST: GHL webhook storing contact data ──
    if (req.method === 'POST') {
      const data = req.body || {};
      const email = (data.email || '').trim().toLowerCase();

      if (!email) {
        return res.status(400).json({ error: 'No email in payload' });
      }

      // Build clean params object from received fields
      const params = {};
      FIELDS.forEach(key => {
        const val = data[key];
        if (val && String(val).trim()) {
          params[key] = String(val).trim();
        }
      });

      // Store in KV keyed by email — expires after 10 minutes
      await kv.set(`portal:${email}`, params, { ex: 600 });

      return res.status(200).json({ ok: true });
    }

    // ── GET: Browser arriving from form redirect ──
    if (req.method === 'GET') {
      const qs = new URLSearchParams(req.url.split('?')[1] || '');
      const email = (qs.get('email') || '').trim().toLowerCase();

      if (!email) {
        // No email — redirect to portal base (will show blank)
        res.setHeader('Location', PORTAL_URL);
        return res.status(302).end();
      }

      // Look up stored data for this email
      const stored = await kv.get(`portal:${email}`);

      if (!stored) {
        // Data not found — may have arrived before webhook, wait briefly and retry once
        await new Promise(r => setTimeout(r, 2000));
        const retry = await kv.get(`portal:${email}`);

        if (!retry) {
          // Still nothing — redirect to base portal
          res.setHeader('Location', PORTAL_URL);
          return res.status(302).end();
        }

        const params = new URLSearchParams(retry);
        res.setHeader('Location', `${PORTAL_URL}?${params.toString()}`);
        return res.status(302).end();
      }

      const params = new URLSearchParams(stored);
      res.setHeader('Location', `${PORTAL_URL}?${params.toString()}`);
      return res.status(302).end();
    }

    return res.status(405).send('Method not allowed');

  } catch (err) {
    console.error('Portal error:', err);
    res.setHeader('Location', PORTAL_URL);
    return res.status(302).end();
  }
}
