// api/portal.js
// Receives GHL webhook POST or browser GET redirect,
// builds portal URL with all client data, redirects browser to portal.

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

  const params = new URLSearchParams();

  try {
    if (req.method === 'GET') {
      // Browser redirect — read from query string
      const qs = new URLSearchParams(req.url.split('?')[1] || '');
      FIELDS.forEach(key => {
        const val = qs.get(key);
        if (val && val.trim()) params.set(key, val.trim());
      });

    } else if (req.method === 'POST') {
      // GHL webhook — read from body (JSON or form-encoded)
      const data = req.body || {};
      FIELDS.forEach(key => {
        const val = data[key];
        if (val && String(val).trim()) params.set(key, String(val).trim());
      });

    } else {
      return res.status(405).send('Method not allowed');
    }

    // Redirect browser to portal with all params
    const redirectUrl = `${PORTAL_URL}?${params.toString()}`;
    res.setHeader('Location', redirectUrl);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(302).end();

  } catch (err) {
    console.error('Portal redirect error:', err);
    res.setHeader('Location', PORTAL_URL);
    return res.status(302).end();
  }
}
