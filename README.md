# gautamtalksdev.github.io

My personal site, built as an engineering spec sheet.

**Live:** [gautamkhosla.com](https://gautamkhosla.com)

No framework, no build step, no npm install, no dependencies. Hand-written HTML, CSS, and JavaScript served straight from this repo. It loads in under a second and there is nothing in it that can rot.

## The idea

I build failure-aware systems, so the site had to be one. It does not just claim that software should survive an outage, it demonstrates it while you read.

**Flip the UPLINK switch** in the top right. Cloud-tagged projects grey out and go dark, the headline starts flickering like a faulty sign, the tab title changes to a warning. AEGIS, tagged `EDGE · SURVIVES OUTAGE`, stays fully lit. The safety loop keeps beating in the corner.

That switch is not decoration. Turn your wifi off and the site loads anyway from the service worker cache, and the switch flips itself.

## What is in here

| Feature | What it does |
|---|---|
| Live AEGIS simulation | The real detection to relay to uplink pipeline from my QNX project, reimplemented in about 150 lines of canvas JS. Relay fires at P30 before voice at P8, matching the SCHED_FIFO ordering on the device. |
| Kill switch | Simulates a network outage. Wired to real `online` and `offline` browser events, so an actual outage triggers it too. |
| Offline support | Service worker with a network-first strategy, so content is never stale but the site still works with zero connection. |
| Live GitHub data | Public repo count (forks excluded) and the last push among listed projects, pulled from the GitHub API, with a 3.5s timeout and a dated fallback when GitHub is unreachable. |
| Daily editions | Seven full palettes on a date seed. Paper, ink, accent, and every section channel colour change each day, deterministically. The masthead shows which edition you are looking at. |
| Print to resume | Press Ctrl+P. The whole site collapses into a clean one page spec sheet with every project URL printed inline. |
| Console | Press the backtick key. Try `whoami`, `outage`, `edition`, `uptime`, `sudo hire`. |

Plus a boot sequence, a CAD crosshair cursor with live coordinates, a draggable ID badge, an animated project showcase, scroll-triggered reveals, and a live inspection log.

## Files

```
index.html            markup only, no inline script or style
styles.css            all styling
app.js                all behaviour
sw.js                 service worker, network-first with cache fallback
profile.jpg           800x800
fonts/                Archivo and IBM Plex Mono, self-hosted woff2
.well-known/          security.txt
```

CSS and JS live in their own files rather than inline. That is a security decision, not a style one: it is what allows the Content Security Policy to forbid `unsafe-inline` entirely, which is the difference between a policy that looks strict and one that actually stops script injection.

## Security

Strict CSP with no `unsafe-inline` anywhere, zero third-party origins, self-hosted fonts, all dynamic and external data escaped before insertion, same-origin-only service worker caching, DNSSEC, and enforced HTTPS.

Full posture and the rules for anything added later: [SECURITY.md](SECURITY.md).

## Running it

Clone it and open `index.html`. That is the whole setup.

The service worker needs HTTPS, so true offline mode only works on the deployed site, not from a local file.

## Tuning

Two CSS variables at the top of `styles.css` control the badge photo:

```css
--photo-zoom:1.06;   /* 1 = whole photo, higher = closer crop */
--photo-focus:35%;   /* vertical focal point */
```

Daily editions are the `THEMES` array in `app.js`. Add an object to lengthen the cycle; the rotation adapts on its own.

## What gets listed

Only finished work goes on the site. Each project gets one of three things.

| | Needs |
|---|---|
| **Log** (GK-0xx page) | A public artifact (repo, live tool or paper); at least one measured result checked by something other than me, stated with its conditions; and a documented failure with a receipt (commit, issue or retraction). Users and revenue are not required. |
| **Card** (A-xx tile) | Public, finished and working, but not yet measured that way, or team work where my part is a slice. |
| **Not listed** | Anything in progress; private or undeployed work; merged or superseded projects; forks, coursework and client work; anything on launch hold (it lists on launch day); anything whose own public page currently says something untrue (fix that first). |

Two logs were written before this rule and fall short of it: GK-004 Plumbline has no outside-judged result (its pre-registered tests were never evaluated) and GK-010 PLIMSOLL has no field data yet. Both pages say so.

GK numbers follow the order the logs are written. GK-001 is the site itself. When a public claim stops being true, the correction is added next to it with a date and the original stays readable.

## Design notes

Safety orange on paper white, hazard stripes, hairline grid, dimension annotations, IBM Plex Mono for data and Archivo Black for headlines. The palette comes from the world AEGIS lives in: hard hats, worksite signage, relay panels. It is loud on purpose and structured on purpose.

Every animation had to earn its place by meaning something. The uplink flickers because networks flicker. The relay fires before the voice because that is the actual priority ordering on the device.

## Contact

developwith.gt@gmail.com · [LinkedIn](https://www.linkedin.com/in/gautam-khosla/) · [YouTube](http://www.youtube.com/@GautamKhoslaOfficial)

Open to co-op placements and internships in systems, infrastructure, and platform engineering.
