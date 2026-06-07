// api/portal.js
// Receives GHL webhook POST, builds portal URL, redirects client browser.
//
// GHL Webhook URL to use:  https://your-vercel-app.vercel.app/api/portal
// Method: POST
// GHL Custom Data fields — add all of these as key/value pairs in the webhook:
//
//   name       {{contact.first_name}}
//   last       {{contact.last_name}}
//   type       {{contact.portal_type}}
//   code       {{contact.metabolic_reset_code}}
//   astatus    {{contact.assessment_status}}
//   loom       {{contact.loom_before_zoom}}
//   pay        {{contact.payment_link}}
//   bnpl       {{contact.bnpl_link}}
//   coupon     {{contact.coupon_code}}
//   disc       {{contact.coupon_discount}}
//   rdate      {{contact.reveal_call_date}}
//   lr         {{contact.link_report}}
//   ld         {{contact.link_discovery}}
//   lrv        {{contact.link_reveal}}
//   lrc        {{contact.link_recipe}}
//   lcs        {{contact.link_cheatsheet}}
//   lg         {{contact.link_guide}}
//   lo         {{contact.link_onboarding}}
//   la         {{contact.link_anthem}}
//   lm         {{contact.link_manual}}
//   lw6        {{contact.link_week6}}
//   lf         {{contact.link_final}}
//   so         {{contact.status_onboarding}}
//   sa         {{contact.status_anthem}}
//   sm         {{contact.status_manual}}
//   sw6        {{contact.status_week6}}
//   sf         {{contact.status_final}}
//   pstart     {{contact.cohort_start_date}}
//   pend       {{contact.program_end}}

// ── Your portal HTML URL — update this after deploying the portal ──
const PORTAL_URL = 'https://myslimdownsuccess.com/client_portal';

export default async function handler(req, res) {

  // ── Only accept POST ──
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    // GHL sends the custom data fields as the POST body (JSON or form-encoded)
    // Handle both formats
    let data = {};

    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      data = req.body || {};
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      data = req.body || {};
    } else {
      // Try to parse as JSON anyway
      data = req.body || {};
    }

    // ── Build query string from received fields ──
    // Only include fields that have actual values (not empty strings)
    const fields = [
      'name','last','type','code','astatus',
      'loom','pay','bnpl','coupon','disc','rdate',
      'lr','ld','lrv','lrc','lcs','lg',
      'lo','la','lm','lw6','lf',
      'so','sa','sm','sw6','sf',
      'pstart','pend'
    ];

    const params = new URLSearchParams();
    fields.forEach(key => {
      const val = data[key];
      if (val && String(val).trim() !== '') {
        params.set(key, String(val).trim());
      }
    });

    // ── Redirect client browser to portal ──
    const redirectUrl = `${PORTAL_URL}?${params.toString()}`;

    // 302 temporary redirect — browser follows it immediately
    res.setHeader('Location', redirectUrl);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(302).end();

  } catch (err) {
    console.error('Portal redirect error:', err);
    // On any error, redirect to portal base URL so client isn't stranded
    res.setHeader('Location', PORTAL_URL);
    return res.status(302).end();
  }
}
