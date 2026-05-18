// Lightweight admin auth — keeps the admin pages from being casually browsed by
// public site visitors. NOT a security boundary (anyone who views source can
// read the password). For production, replace with Vercel password protection
// (Pro plan) or Cloudflare Access (free tier supports 50 users).
//
// To change the password: edit ADMIN_PASS_HASH below. Hash is SHA-256 hex.
// Generate a new hash:
//   echo -n "yourNewPassword" | sha256sum
// or in JS console:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourNewPassword'))
//     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))

(function () {
  // Default password: "tradewind2026". Change this before deployment.
  const ADMIN_PASS_HASH = 'bc8e1807670020d1974dc6b33aa71ab0b8900fbc086817583d9245385a2c39fc';
  const STORAGE_KEY = 'tw_admin_auth_v1';
  const SESSION_HOURS = 12;

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  function hasValidSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const { exp } = JSON.parse(raw);
      return exp && Date.now() < exp;
    } catch {
      return false;
    }
  }

  function setSession() {
    const exp = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ exp }));
  }

  function lockout() {
    document.documentElement.style.visibility = 'hidden';
    document.body.style.visibility = 'hidden';
  }

  function unlock() {
    document.documentElement.style.visibility = '';
    document.body.style.visibility = '';
  }

  function renderGate() {
    document.documentElement.style.visibility = '';
    document.body.innerHTML = `
      <div style="display:grid; place-items:center; min-height:100vh; background:#f7f3eb; font-family:'Inter',-apple-system,sans-serif;">
        <div style="background:#fff; border:1px solid #e3dccb; border-radius:8px; padding:40px 48px; box-shadow:0 8px 24px rgba(7,57,61,0.07); max-width:380px; width:100%;">
          <div style="font-family:'Playfair Display',Georgia,serif; font-size:20px; font-weight:700; color:#1f6e72; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:6px;">Trade Wind &amp; Co.</div>
          <div style="font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#d96846; font-weight:600; margin-bottom:24px;">Internal · Authorized only</div>
          <p style="color:#506b6a; font-size:13.5px; line-height:1.55; margin:0 0 22px;">This area is for Trade Wind operations staff. Public buyers should browse <a href="index.html" style="color:#1f6e72;">tradewindandco.com</a> instead.</p>
          <form id="admin-gate-form" onsubmit="return false">
            <label style="display:block; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#8a8c80; font-weight:600; margin-bottom:8px;">Password</label>
            <input id="admin-gate-input" type="password" autofocus autocomplete="off" style="width:100%; padding:12px 14px; border:1px solid #c5bca6; border-radius:4px; font-family:inherit; font-size:14px; background:#f7f3eb; color:#1a2e2c; box-sizing:border-box;" />
            <div id="admin-gate-error" style="display:none; font-size:12px; color:#a63d40; margin-top:8px;"></div>
            <button id="admin-gate-submit" type="submit" style="display:block; width:100%; margin-top:18px; padding:14px 28px; border-radius:4px; font-size:13px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; border:1.5px solid #1f6e72; background:#1f6e72; color:#fff; cursor:pointer; font-family:inherit;">Unlock</button>
          </form>
          <a href="index.html" style="display:block; margin-top:16px; text-align:center; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#8a8c80; text-decoration:none;">← Back to public site</a>
        </div>
      </div>
    `;
    const input = document.getElementById('admin-gate-input');
    const form = document.getElementById('admin-gate-form');
    const errEl = document.getElementById('admin-gate-error');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const entered = input.value;
      const hash = await sha256(entered);
      if (hash === ADMIN_PASS_HASH) {
        setSession();
        location.reload();
      } else {
        errEl.textContent = 'Incorrect password.';
        errEl.style.display = 'block';
        input.value = '';
        input.focus();
      }
    });
  }

  // Block render until auth checked
  lockout();
  if (hasValidSession()) {
    unlock();
  } else {
    // Wait for DOM to be ready, then replace it with the gate
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderGate);
    } else {
      renderGate();
    }
  }
})();
