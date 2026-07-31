# Security Policy

## Reporting

Found something? Email **developwith.gt@gmail.com**. I will respond, and I will thank you properly.

Also published at [/.well-known/security.txt](https://gautamkhosla.com/.well-known/security.txt) per RFC 9116.

## What this site is

A fully static site: HTML, CSS, JavaScript, four font files, and one image. No backend, no database, no cookies, no analytics, no user accounts, no data collected or stored. The only network call is a read-only request to the public GitHub API for a repo count.

## Current posture

| Control | Status |
|---|---|
| HTTPS | Enforced, HSTS via GitHub Pages |
| Content Security Policy | Strict, no `unsafe-inline` anywhere |
| Third-party origins | None. Fonts self-hosted, no CDN, no trackers |
| XSS | All dynamic and external data escaped before insertion |
| Clickjacking | Frame-buster in JS (`frame-ancestors` is ignored in meta tags) |
| Referrer leakage | `strict-origin-when-cross-origin` |
| External links | `rel="noopener noreferrer"` |
| Service worker | Same-origin only, never caches opaque responses |
| DNS | DNSSEC enabled |
| Accounts | 2FA on GitHub and Cloudflare |

## Rules for anything added later

This baseline is easy to break by accident. Anything new must follow these:

1. **No inline `<script>` or `<style>`, and no `style="..."` attributes.** The CSP forbids them. Put JS in `app.js` and CSS in `styles.css`. If something silently stops working, check the browser console for a CSP violation first.
2. **No third-party scripts, fonts, or CDNs.** Every new origin has to be added to the CSP, and each one is a party that can change what visitors see. Self-host instead.
3. **Never build HTML from untrusted strings.** Use `textContent`, or run values through the `esc()` helper in `app.js`. This applies to anything from an API, a URL parameter, or a user.
4. **New network calls need a `connect-src` entry**, a timeout, and a fallback that keeps the page working when the call fails.
5. **No secrets in this repo. Ever.** It is public and it is a static site: anything committed here is world-readable, including API keys in JavaScript.
6. **Bump the `CACHE` version in `sw.js`** whenever a cached file changes, or returning visitors keep the old copy.

## Known limitations

A meta-tag CSP is weaker than a real HTTP header: `frame-ancestors` and `sandbox` are ignored, `Report-Only` is unavailable, and the policy only applies to markup parsed after the tag. GitHub Pages cannot send custom headers, so this is the strongest option available without adding a proxy layer in front of the site. That trade was made deliberately: fewer moving parts, no dependency that can fail.
