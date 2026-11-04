// Vercel serverless function: emails contact-form submissions via Resend (https://resend.com).
// Set these environment variables in the Vercel project:
//   RESEND_API_KEY  – your Resend API key
//   CONTACT_TO      – where submissions go (e.g. apply@crushthehouse.com)
//   CONTACT_FROM    – a verified sender, e.g. "Crush the House <forms@crushthehouse.com>"

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { fname = '', lname = '', email = '', phone = '', company = '' } = body;

  // Honeypot: bots fill the hidden field. Pretend success.
  if (company) return res.status(200).json({ ok: true });

  if (!fname.trim() || !lname.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'First name, last name and a valid email are required.' });
  }

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    console.error('Contact form not configured: missing RESEND_API_KEY, CONTACT_TO or CONTACT_FROM');
    return res.status(500).json({ error: 'Form not configured' });
  }

  const html = `
    <h2>New Crush the House contact form submission</h2>
    <p><b>Name:</b> ${esc(fname)} ${esc(lname)}</p>
    <p><b>Email:</b> ${esc(email)}</p>
    <p><b>Phone:</b> ${esc(phone) || '—'}</p>
    <p><b>SMS consent:</b> Agreed by submitting (consent text shown on form)</p>
    <p><b>Submitted:</b> ${new Date().toISOString()}</p>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: CONTACT_TO.split(',').map(s => s.trim()),
      reply_to: email,
      subject: `Contact form: ${fname} ${lname}`,
      html,
    }),
  });

  if (!r.ok) {
    console.error('Resend error', r.status, await r.text());
    return res.status(502).json({ error: 'Could not send' });
  }
  return res.status(200).json({ ok: true });
}
