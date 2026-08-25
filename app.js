(() => {
  /* clickjacking guard: X-Frame-Options and frame-ancestors need real headers,
     which GitHub Pages cannot send, so break out of any frame here. */
  if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.documentElement.innerHTML = ''; } }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);

  /* The site loads instantly. No splash, no gate, no manufactured delay.
     Speed is the point: this is what zero dependencies buys you. */
  document.body.classList.add('loaded');

  /* ---- reveals ---- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold:.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---- counters ---- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('[data-count]').forEach(el => {
      const end = +el.dataset.count, t0 = performance.now(), dur = 1300;
      (function tick(t){ const p = Math.min((t-t0)/dur,1), ez = 1-Math.pow(1-p,3);
        el.textContent = Math.round(end*ez).toLocaleString();
        if (p<1) requestAnimationFrame(tick); })(t0);
    });
    cio.unobserve(e.target);
  }), { threshold:.4 });
  document.querySelectorAll('.stats').forEach(el => cio.observe(el));
  if (reduced) document.querySelectorAll('[data-count]').forEach(el => el.textContent = (+el.dataset.count).toLocaleString());

  /* ---- KILL SWITCH ---- */
  const kill = $('#kill'), linkState = $('#linkState'), pulseTxt = $('#pulseTxt'), badgeLive = $('#badgeLive');
  function setOutage(on) {
    document.body.classList.toggle('outage', on);
    kill.setAttribute('aria-checked', on);
    linkState.textContent = on ? 'LOST' : 'LIVE';
    pulseTxt.textContent = on ? 'SAFETY LOOP · NOMINAL · OFFLINE MODE' : 'SAFETY LOOP · NOMINAL';
    badgeLive.textContent = on ? '● ON SITE · OFFLINE' : '● ON SITE';
    document.title = on ? '⚠ LINK LOST · Gautam Khosla' : 'Gautam Khosla — Failure-Aware Systems Engineer';
    logLine(on ? '<b>UPLINK LOST</b>: degrading gracefully' : '<b>UPLINK RESTORED</b>: flushing backlog');
  }
  let actx = null;
  function clack() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime;
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'square'; o.frequency.setValueAtTime(2200, t); o.frequency.exponentialRampToValueAtTime(180, t + .04);
      g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.0001, t + .07);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + .08);
    } catch (e) {}
  }
  kill.addEventListener('click', () => { clack(); setOutage(!document.body.classList.contains('outage')); });
  kill.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kill.click(); } });

  /* ---- inspection log ---- */
  const log = $('#log');
  function logLine(html) {
    if (!log) return;
    const d = document.createElement('div');
    d.innerHTML = new Date().toTimeString().slice(0,8) + ' ' + html;
    log.appendChild(d);
    while (log.children.length > 6) log.removeChild(log.firstChild);
  }
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) logLine('<b>' + e.target.dataset.log + '</b>');
  }), { threshold:.3 });
  document.querySelectorAll('[data-log]').forEach(el => sio.observe(el));
  logLine('<b>VISITOR DETECTED</b>: welcome');

  /* ---- tab-blur alarm ---- */
  let awayTitle;
  addEventListener('visibilitychange', () => {
    if (document.hidden) { awayTitle = document.title; document.title = '⚠ VISITOR LINK LOST'; }
    else if (awayTitle) { document.title = awayTitle; logLine('<b>VISITOR LINK RESTORED</b>'); }
  });

  /* ---- TERMINAL ---- */
  const term = $('#term'), tIn = $('#termIn'), tOut = $('#termOut');
  function toggleTerm(open) {
    term.classList.toggle('open', open ?? !term.classList.contains('open'));
    if (term.classList.contains('open')) tIn.focus();
  }
  $('#termBtn').addEventListener('click', () => toggleTerm());
  addEventListener('keydown', e => {
    if (e.key === '`' && document.activeElement !== tIn) { e.preventDefault(); toggleTerm(); }
    if (e.key === 'Escape') toggleTerm(false);
  });
  /* escape anything that did not originate in this file */
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const CMDS = {
    help: () => 'commands: <b>whoami</b>, <b>work</b>, <b>outage</b>, <b>uptime</b>, <b>contact</b>, <b>edition</b>, <b>sudo hire</b>, <b>clear</b>, <b>exit</b>',
    whoami: () => 'gautam khosla · failure-aware systems engineer. CE @ uOttawa. builds things that survive 2 a.m.',
    work: () => 'assay-gpu + LADING [2 papers \u00b7 DOI]  AEGIS [edge/QNX]  Cairn [robot integrity]  Vernier [agent eval]  Mayfly [microVM]  Plumbline [transparency log]  AeroGuard [SOC triage · MLH award]\n→ github.com/GautamTalksDev',
    outage: () => { setOutage(!document.body.classList.contains('outage')); return document.body.classList.contains('outage') ? '<b>uplink severed.</b> notice anything still works?' : '<span class="ok">uplink restored. backlog flushed.</span>'; },
    uptime: () => 'safety loop: <span class="ok">100%</span> · cloud: eventually consistent · caffeine: elevated',
    edition: () => 'today: <b>' + (window.__EDITION ? window.__EDITION.id : 'SAFETY') + '</b> · this site reissues itself daily from a date seed. come back tomorrow.',
    contact: () => 'developwith.gt@gmail.com. store-and-forward, outage-proof by design.',
    'sudo hire': () => '<span class="ok">permission granted.</span> drafting offer… just kidding. email developwith.gt@gmail.com',
    clear: () => { tOut.innerHTML = ''; return ''; },
    exit: () => { toggleTerm(false); return ''; }
  };
  tIn.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const cmd = tIn.value.trim().toLowerCase(); tIn.value = '';
    if (!cmd) return;
    tOut.innerHTML += '<span class="acc">gk@edge:~$</span> ' + esc(cmd) + '\n';
    tOut.innerHTML += (CMDS[cmd] ? CMDS[cmd]() : 'command not found: ' + esc(cmd) + ' · try <b>help</b>') + '\n';
    tOut.scrollTop = tOut.scrollHeight;
  });

  /* ================= LIVE ENRICHMENT (GitHub API) =================
     Progressive enhancement, never a dependency:
     - baked values render first, always
     - 3.5s timeout; any failure = silent fallback to cached
     - respects the kill switch: outage on = no fetch, honest CACHED tag */
  (async function liveData() {
    const src = $('#dataSrc');
    if (document.body.classList.contains('outage')) return;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 3500);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch('https://api.github.com/users/GautamTalksDev', { signal: ctl.signal }),
        fetch('https://api.github.com/users/GautamTalksDev/repos?sort=pushed&per_page=6', { signal: ctl.signal })
      ]);
      clearTimeout(timer);
      if (!uRes.ok || !rRes.ok) throw new Error('rate-limited or unreachable');
      const user = await uRes.json();
      const repoList = await rRes.json();
      const [latest] = repoList;

      // LATEST FROM THE LAB: auto-synced strip, curated showcase stays curated
      const strip = $('#labStrip'), lab = $('#lab');
      if (strip && Array.isArray(repoList)) {
        const picks = repoList.filter(r => r && !r.fork).slice(0, 3);
        if (picks.length) {
          strip.innerHTML = picks.map(r => {
            const days = Math.max(0, Math.round((Date.now() - new Date(r.pushed_at)) / 864e5));
            const when = days === 0 ? 'PUSHED TODAY' : days === 1 ? 'PUSHED YESTERDAY' : 'PUSHED ' + days + 'D AGO';
            return '<a rel="noopener noreferrer external" href="' + esc(r.html_url) + '">'
              + '<h4>' + esc(r.name) + '</h4>'
              + '<p>' + esc(r.description || 'No description yet.') + '</p>'
              + '<div class="lmeta">' + esc((r.language || 'MIXED').toUpperCase()) + ' · ' + when + '</div></a>';
          }).join('');
          lab.classList.remove('hidden');
        }
      }

      // live repo count
      const reposEl = $('#liveRepos');
      const repos = Number(user.public_repos);
      if (Number.isFinite(repos) && repos >= 0 && repos < 10000) {
        reposEl.dataset.count = repos;
        reposEl.textContent = repos;   // textContent, never innerHTML
      }
      if (src) { src.textContent = '· LIVE'; src.classList.add('live'); }

      // last push in ticker
      if (latest) {
        const days = Math.max(0, Math.round((Date.now() - new Date(latest.pushed_at)) / 864e5));
        const when = days === 0 ? 'TODAY' : days === 1 ? 'YESTERDAY' : days + ' DAYS AGO';
        document.querySelectorAll('.live-slot').forEach(el =>
          el.innerHTML = 'LAST PUSH · <b>' + esc(String(latest.name).toUpperCase()) + '</b> · <i>' + esc(when) + '</i>');
      }
      // Commits: counted from the public events feed. The window is derived
      // from the data itself rather than asserted, so the label cannot go stale.
      try {
        const eRes = await fetch('https://api.github.com/users/GautamTalksDev/events/public?per_page=100', { signal: ctl.signal });
        if (eRes.ok) {
          const evs = await eRes.json();
          if (Array.isArray(evs) && evs.length) {
            let commits = 0, evCount = 0, oldest = Date.now();
            for (const ev of evs) {
              const t = new Date(ev.created_at).getTime();
              if (t < oldest) oldest = t;
              evCount++;
              if (ev.type === 'PushEvent' && ev.payload) {
                // distinct_size is 0 when a push carries commits GitHub has
                // already seen, which is every pull-request merge. `??` does
                // not fall through on 0, so the size fallback must be explicit.
                const d = Number(ev.payload.distinct_size);
                const s = Number(ev.payload.size);
                const n = (Number.isFinite(d) && d > 0) ? d : (Number.isFinite(s) && s > 0 ? s : 0);
                if (n > 0) commits += n;
              }
            }
            const days = Math.max(1, Math.round((Date.now() - oldest) / 864e5));
            const cEl = $('#liveCommits'), cSrc = $('#commitSrc');
            // Never render a zero here. A true zero is still a false impression,
            // so the cell keeps its baked value unless the feed beats it.
            if (cEl && cSrc && commits > 0) {
              cEl.dataset.count = commits;
              cEl.textContent = commits.toLocaleString();
              cSrc.textContent = 'COMMITS · LAST ' + days + ' DAYS';
              cSrc.classList.add('live');
            } else if (cEl && cSrc && evCount > 0) {
              cEl.dataset.count = evCount;
              cEl.textContent = evCount.toLocaleString();
              cSrc.textContent = 'PUBLIC EVENTS · LAST ' + days + ' DAYS';
              cSrc.classList.add('live');
            }
          }
        }
      } catch (e) {}

      logLine('<b>GITHUB UPLINK</b>: live data acquired');
    } catch (e) {
      clearTimeout(timer);
      // graceful fallback: keep baked values, be honest about it
      document.querySelectorAll('.live-slot').forEach(el =>
        el.innerHTML = 'LAST PUSH · <i>CACHED</i> · GITHUB UNREACHABLE · SITE UNAFFECTED');
      logLine('<b>GITHUB UPLINK</b>: unreachable, serving cached (by design)');
    }
  })();

  /* ================= AEGIS SIMULATION ================= */
  (function sim() {
    const cv = $('#simCv'); if (!cv) return;
    const cx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const ZONE = { x: W*0.58, y: 40, w: W*0.38, h: H-80 };   // hazard zone
    const stateEl = $('#simState'), relayEl = $('#simRelay'),
          sentEl = $('#simSent'), bufEl = $('#simBuf'), shell = $('#simShell');
    let workers = [], sent = 0, buf = 0, state = 'SAFE', alarmT = 0, relayT = 0, spawnT = 0;

    function spawn() {
      workers.push({
        x: -30, y: 70 + Math.random()*(H-140),
        v: .5 + Math.random()*.9,
        hat: Math.random() > .3,          // 30% forgot their PPE
        bob: Math.random()*Math.PI*2,
        flagged: false
      });
    }
    for (let i=0;i<4;i++){ spawn(); workers[i].x = Math.random()*W*.5; }

    function uplink(ev) {
      if (document.body.classList.contains('outage')) { buf++; }
      else { sent++; }
    }
    // flush buffer when link restored
    const flushTimer = setInterval(() => {
      if (!document.body.classList.contains('outage') && buf > 0) {
        const n = Math.min(buf, 3); buf -= n; sent += n;   // chunked flush
      }
    }, 220);

    function drawWorker(w, t) {
      const bobY = Math.sin(t*.008 + w.bob) * 2;
      const x = w.x, y = w.y + bobY;
      // body
      cx.strokeStyle = '#9CA3AF'; cx.lineWidth = 2.5; cx.lineCap = 'round';
      cx.beginPath();
      cx.moveTo(x, y-14); cx.lineTo(x, y+6);                    // torso
      cx.moveTo(x, y-8); cx.lineTo(x-7, y-2);                   // arms
      cx.moveTo(x, y-8); cx.lineTo(x+7, y-2);
      const ph = Math.sin(t*.02 + w.bob)*6;
      cx.moveTo(x, y+6); cx.lineTo(x-4, y+16+ph*.4);            // legs
      cx.moveTo(x, y+6); cx.lineTo(x+4, y+16-ph*.4);
      cx.stroke();
      // head
      cx.fillStyle = '#D1D5DB';
      cx.beginPath(); cx.arc(x, y-19, 4.5, 0, Math.PI*2); cx.fill();
      // hard hat
      if (w.hat) {
        cx.fillStyle = '#FF4100';
        cx.beginPath(); cx.arc(x, y-20.5, 5.2, Math.PI, 0); cx.fill();
        cx.fillRect(x-6.5, y-20.5, 13, 2);
      }
    }

    function loop(t) {
      cx.clearRect(0,0,W,H);
      // grid
      cx.strokeStyle = 'rgba(255,255,255,.05)'; cx.lineWidth = 1;
      for (let gx=0; gx<W; gx+=40){ cx.beginPath(); cx.moveTo(gx,0); cx.lineTo(gx,H); cx.stroke(); }
      for (let gy=0; gy<H; gy+=40){ cx.beginPath(); cx.moveTo(0,gy); cx.lineTo(W,gy); cx.stroke(); }
      // hazard zone
      cx.strokeStyle = 'rgba(255,65,0,.85)'; cx.lineWidth = 2; cx.setLineDash([10,6]);
      cx.strokeRect(ZONE.x, ZONE.y, ZONE.w, ZONE.h); cx.setLineDash([]);
      cx.fillStyle = 'rgba(255,65,0,.06)'; cx.fillRect(ZONE.x, ZONE.y, ZONE.w, ZONE.h);
      cx.fillStyle = 'rgba(255,65,0,.9)'; cx.font = '600 11px "IBM Plex Mono", monospace';
      cx.fillText('HAZARD ZONE · PPE REQUIRED', ZONE.x + 10, ZONE.y + 18);

      let violation = false;
      for (const w of workers) {
        w.x += w.v;
        drawWorker(w, t);
        const inZone = w.x > ZONE.x && w.x < ZONE.x + ZONE.w;
        // detection box
        const label = w.hat ? 'PERSON · PPE ✓' : 'PERSON · NO HELMET';
        const danger = inZone && !w.hat;
        cx.strokeStyle = danger ? '#EF4444' : (w.hat ? 'rgba(74,222,128,.9)' : 'rgba(251,191,36,.9)');
        cx.lineWidth = danger ? 2.5 : 1.5;
        cx.strokeRect(w.x-13, w.y-30, 26, 52);
        cx.fillStyle = cx.strokeStyle; cx.font = '600 9.5px "IBM Plex Mono", monospace';
        cx.fillText(label + ' ' + (0.87 + Math.sin(t*.01+w.bob)*0.06).toFixed(2), w.x-13, w.y-35);
        if (danger) {
          violation = true;
          if (!w.flagged) { w.flagged = true; uplink(); }   // one event per zone entry
        }
        if (!inZone) w.flagged = false;
      }
      workers = workers.filter(w => w.x < W + 40);
      if ((spawnT += 16) > 1400) { spawnT = 0; if (workers.length < 7) spawn(); }

      // state machine: SAFE → VIOLATION (relay first, voice after — SCHED_FIFO ordering)
      if (violation) {
        if (state === 'SAFE') { relayT = t; }
        state = 'VIOLATION'; alarmT = t;
        relayEl.textContent = 'FIRED (P30)'; relayEl.className = 'v alarm';
        stateEl.textContent = (t - relayT > 350) ? 'ALARM + VOICE (P8)' : 'ALARM';
        stateEl.className = 'v alarm';
        shell.classList.add('alarm-flash');
      } else if (t - alarmT > 1200) {
        state = 'SAFE';
        stateEl.textContent = 'SAFE'; stateEl.className = 'v safe';
        relayEl.textContent = 'IDLE'; relayEl.className = 'v';
        shell.classList.remove('alarm-flash');
      }

      sentEl.textContent = sent;
      bufEl.textContent = buf;
      bufEl.className = 'v' + (buf > 0 ? ' warn' : '');

      if (!reduced) requestAnimationFrame(loop);
    }
    // only animate when visible — battery-friendly
    const vio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { requestAnimationFrame(loop); vio.unobserve(cv); }
    }), { threshold:.2 });
    if (reduced) {
      // static frame for reduced motion
      requestAnimationFrame(t => { loop(t); });
    } else vio.observe(cv);
  })();

  /* ================= DAILY SELF-EVOLUTION =================
     The site reissues itself every day from a date seed. No server, no
     maintenance, deterministic: every visitor on the same day sees the same
     edition, and tomorrow it is a different one. */
  const THEMES = [
    { id:'SAFETY',      paper:'#FAFAF7', ink:'#14151A', acc:'#FF4100', ch:['#FF4100','#1B5FD9','#0F8A3D','#B26A00'] },
    { id:'BLUEPRINT',   paper:'#F1F5FB', ink:'#0F141C', acc:'#1B5FD9', ch:['#1B5FD9','#FF4100','#0F8A3D','#6D28D9'] },
    { id:'OSCILLOSCOPE',paper:'#F5FAF4', ink:'#101710', acc:'#0F8A3D', ch:['#0F8A3D','#B26A00','#1B5FD9','#FF4100'] },
    { id:'GRAPHITE',    paper:'#F5F5F3', ink:'#101012', acc:'#C81E1E', ch:['#C81E1E','#334155','#0E7490','#B26A00'] },
    { id:'CONTROL',     paper:'#F2FAFB', ink:'#0D1618', acc:'#0E7490', ch:['#0E7490','#FF4100','#0F8A3D','#6D28D9'] },
    { id:'VOLT',        paper:'#F8F7FC', ink:'#14121C', acc:'#6D28D9', ch:['#6D28D9','#0E7490','#C2410C','#0F8A3D'] }
  ];

  (function daily() {
    const now = new Date();
    const doy = Math.floor((now - new Date(now.getFullYear(),0,0)) / 864e5); // day of year = seed

    // today's edition: palette, channel colours, masthead tag
    window.__applyTheme = th => {
      const r = document.documentElement.style;
      r.setProperty('--paper', th.paper); r.setProperty('--ink', th.ink); r.setProperty('--orange', th.acc);
      r.setProperty('--ch-sim', th.ch[0]); r.setProperty('--ch-work', th.ch[1]);
      r.setProperty('--ch-prin', th.ch[2]); r.setProperty('--ch-exp', th.ch[3]);
      window.__EDITION = th;
      const ed = $('#edition');
      if (ed) ed.textContent = ed.textContent.replace(/·.*$/, '· ' + th.id);
    };
    const th = THEMES[doy % THEMES.length];
    window.__applyTheme(th);
    const ed = $('#edition');
    if (ed) ed.textContent = 'ED. ' + String(doy).padStart(3,'0') + ' · ' + th.id;
    // REV auto-tracks today — the document is always current
    const rev = $('#revDate');
    if (rev) rev.textContent = now.getFullYear() + '.' + String(now.getMonth()+1).padStart(2,'0') + '.' + String(now.getDate()).padStart(2,'0');
    // stamp rotates daily
    const stamps = ['Inspected & Approved','Ships or it didn\u2019t happen','Zero network deps','Built for 2 a.m.','Chaos tested','Degrades gracefully','Rollback ready'];
    const st = document.querySelector('.stamp');
    if (st) st.textContent = stamps[doy % stamps.length];
    // one principle is "today's drill"
    const cells = document.querySelectorAll('.prin > div');
    if (cells.length) cells[doy % cells.length].classList.add('today');
    logLine('<b>DAILY SEED</b> \u00b7 DOY-' + doy + ' applied');
  })();

  /* ================= SHOWCASE CAROUSEL ================= */
  (function carousel() {
    const rail = $('#rail'); if (!rail) return;
    const slides = [...rail.children], dots = [...$('#showDots').children];
    let idx = 0, N = slides.length;
    function go(n) {
      idx = ((n % N) + N) % N;
      rail.style.transform = 'translateX(-' + idx * 100 + '%)';
      slides.forEach((s,i) => s.classList.toggle('active', i === idx));
      dots.forEach((d,i) => d.classList.toggle('on', i === idx));
    }
    $('#showNext').addEventListener('click', () => go(idx+1));
    $('#showPrev').addEventListener('click', () => go(idx-1));
    dots.forEach((d,i) => d.addEventListener('click', () => go(i)));
    addEventListener('keydown', e => {
      if (document.activeElement === tIn) return;
      if (e.key === 'ArrowRight') go(idx+1);
      if (e.key === 'ArrowLeft') go(idx-1);
    });
    // swipe
    let px = null;
    rail.addEventListener('pointerdown', e => px = e.clientX, { passive:true });
    rail.addEventListener('pointerup', e => {
      if (px === null) return;
      const d = e.clientX - px; px = null;
      if (Math.abs(d) > 50) go(idx + (d < 0 ? 1 : -1));
    }, { passive:true });
    // auto-advance every 7s, pause on hover, stop after first manual interaction
    let auto = reduced ? null : setInterval(() => go(idx+1), 7000);
    const stopAuto = () => { if (auto) { clearInterval(auto); auto = null; } };
    ['#showNext','#showPrev'].forEach(s => $(s).addEventListener('click', stopAuto));
    $('#showcase').addEventListener('pointerenter', () => auto && clearInterval(auto));
    $('#showcase').addEventListener('pointerleave', () => { if (auto !== null) auto = setInterval(() => go(idx+1), 7000); });
    // daily seed picks the opening slide — the site literally leads with a different project each day
    const doy = Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 864e5);
    go(doy % N);
  })();

  /* ================= PARALLAX GHOST NUMERALS ================= */
  if (!reduced) {
    const ghosts = [...document.querySelectorAll('.ghost-no')];
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        for (const g of ghosts) {
          const r = g.parentElement.getBoundingClientRect();
          g.style.transform = 'translateY(' + ((r.top / innerHeight) * 60).toFixed(1) + 'px)';
        }
        ticking = false;
      });
    }, { passive:true });
  }

  /* ================= TRUE OFFLINE SUPPORT =================
     Service worker caches the site on first visit (network-first, so never stale).
     Real network loss auto-flips the UPLINK switch: the toy becomes instrumentation. */
  if ('serviceWorker' in navigator) {
    addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(() => logLine('<b>OFFLINE CACHE</b>: armed'))
        .catch(() => {});
    });
  }
  addEventListener('offline', () => {
    logLine('<b>REAL OUTAGE DETECTED</b>: serving from cache');
    setOutage(true);
  });
  addEventListener('online', () => {
    logLine('<b>NETWORK RESTORED</b>');
    setOutage(false);
  });
  if (!navigator.onLine) setOutage(true);

  /* ================= SECTION ACCENT CHANNELS =================
     Industrial signal palette: every section is a different channel on the
     same panel, not a different brand. Set ACCENTS = {} to disable. */
  const cs = getComputedStyle(document.documentElement);
  const chan = n => cs.getPropertyValue(n).trim() || '#FF4100';
  const ACCENTS = {
    'sim-sec'    : chan('--ch-sim'),
    'work'       : chan('--ch-work'),
    'principles' : chan('--ch-prin'),
    'experience' : chan('--ch-exp'),
    'contact'    : (window.__EDITION ? window.__EDITION.acc : '#FF4100')
  };
  const BASE = window.__EDITION ? window.__EDITION.acc : '#FF4100';
  function setAccent(c) { document.documentElement.style.setProperty('--orange', c); }
  if (Object.keys(ACCENTS).length) {
    const aio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && ACCENTS[e.target.id]) setAccent(ACCENTS[e.target.id]);
    }), { rootMargin: '-45% 0px -45% 0px' });
    Object.keys(ACCENTS).forEach(id => { const el = document.getElementById(id); if (el) aio.observe(el); });
    const hdr = $('#top');
    if (hdr) new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) setAccent(BASE);
    }), { rootMargin: '-40% 0px -55% 0px' }).observe(hdr);
  }

  /* ---- live session clock: the document is running, not printed ---- */
  (function clock() {
    const el = $('#clock'); if (!el) return;
    const t0 = Date.now();
    const pad = n => String(n).padStart(2, '0');
    setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000);
      el.textContent = pad(s / 3600 | 0) + ':' + pad((s / 60 | 0) % 60) + ':' + pad(s % 60);
    }, 1000);
  })();

  /* ---- copy email: no mailto, no status bar, no dead ends ---- */
  const copyBtn = $('#copyMail'), toast = $('#copyToast');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const addr = copyBtn.dataset.mail;
      let ok = false;
      try { await navigator.clipboard.writeText(addr); ok = true; }
      catch (e) {
        const ta = document.createElement('textarea');
        ta.value = addr; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { ok = document.execCommand('copy'); } catch (_) {}
        ta.remove();
      }
      copyBtn.textContent = ok ? 'COPIED ✓' : addr;
      toast.classList.add('show');
      logLine(ok ? '<b>ADDRESS DISPATCHED</b>: clipboard' : '<b>CLIPBOARD BLOCKED</b>: shown inline');
      clearTimeout(copyBtn._t);
      copyBtn._t = setTimeout(() => {
        toast.classList.remove('show');
        copyBtn.textContent = 'COPY MY EMAIL';
      }, 2600);
    });
  }

  /* ---- stamp re-slam on click ---- */
  const stamp = document.querySelector('.stamp');
  if (stamp) {
    stamp.style.pointerEvents = 'auto';
    stamp.style.cursor = 'pointer';
    stamp.title = 'Re-inspect';
    stamp.addEventListener('click', () => {
      stamp.style.transition = 'none';
      stamp.style.transform = 'rotate(-12deg) scale(3)';
      stamp.style.opacity = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        stamp.style.transition = 'transform .35s cubic-bezier(.5,1.8,.4,.8), opacity .2s ease';
        stamp.style.transform = 'rotate(-12deg) scale(1)';
        stamp.style.opacity = '.9';
      }));
      logLine('<b>RE-INSPECTED</b>: still approved');
    });
  }

  /* ================= COMMAND PALETTE (Ctrl+K) ================= */
  (function palette() {
    const pal = $('#pal'), inp = $('#palInput'), list = $('#palList');
    if (!pal) return;
    const CMDS = [
      ['Run the live AEGIS simulation', 'GO', () => location.hash = '#sim-sec'],
      ['Cut the uplink (simulate outage)', 'TOGGLE', () => kill.click()],
      ['Read the AEGIS engineering log', 'GK-002', () => location.href = 'aegis.html'],
      ['Read the Mayfly Guest log (microVM restore)', 'GK-003', () => location.href = 'mayfly.html'],
      ['Read the Plumbline log (transparency log)', 'GK-004', () => location.href = 'plumbline.html'],
      ['Read the label-to-lab log (a study that failed)', 'GK-005', () => location.href = 'labtolab.html'],
      ['Read the Vernier log (temperature 0 is not deterministic)', 'GK-006', () => location.href = 'vernier.html'],
      ['Read the Cairn log (when a robot is confidently lost)', 'GK-007', () => location.href = 'cairn.html'],
      ['Read the assay-gpu log (a detector that failed its own bar)', 'GK-008', () => location.href = 'assay.html'],
      ['Read the LADING log (it failed three times)', 'GK-009', () => location.href = 'lading.html'],
      ['Paper 1 \u00b7 Calibrating the Checksum (DOI)', 'PAPER', () => open('https://doi.org/10.5281/zenodo.22054179', '_blank', 'noopener')],
      ['Paper 2 \u00b7 Binary Grounded VEX Clearance (DOI)', 'PAPER', () => open('https://doi.org/10.5281/zenodo.22099794', '_blank', 'noopener')],
      ['View selected work', 'GO', () => location.hash = '#work'],
      ['Operating principles', 'GO', () => location.hash = '#principles'],
      ['Field record', 'GO', () => location.hash = '#experience'],
      ['Contact', 'GO', () => location.hash = '#contact'],
      ['Download resume (PDF)', 'FILE', () => location.href = 'resume.pdf'],
      ['Print this page as a resume', 'CTRL+P', () => print()],
      ['Copy my email address', 'CLIP', () => { const b = $('#copyMail'); if (b) b.click(); }],
      ['Open the console', '`', () => toggleTerm(true)],
      ['Preview tomorrow\u2019s edition', 'THEME', () => {
        const i = THEMES.indexOf(window.__EDITION);
        window.__applyTheme(THEMES[(i + 1) % THEMES.length]);
        logLine('<b>EDITION PREVIEW</b> \u00b7 ' + window.__EDITION.id);
        return true; }],
      ['GitHub \u2192 GautamTalksDev', 'LINK', () => open('https://github.com/GautamTalksDev', '_blank', 'noopener')],
      ['LinkedIn', 'LINK', () => open('https://www.linkedin.com/in/gautam-khosla/', '_blank', 'noopener')],
      ['Switch to Band B \u00b7 Gautam Talks', 'GT-001', () => open('https://gautamtalks.com', '_blank', 'noopener')]
    ];
    let items = [], sel = 0;
    function render(q) {
      const ql = (q || '').toLowerCase();
      items = CMDS.filter(c => c[0].toLowerCase().includes(ql));
      sel = 0;
      list.innerHTML = items.map((c, i) =>
        '<button data-i="' + i + '"' + (i === 0 ? ' class="on"' : '') + '><span>' + esc(c[0]) + '</span><span class="k">' + esc(c[1]) + '</span></button>'
      ).join('') || '<button disabled><span>No matches</span></button>';
    }
    function openPal() { pal.classList.add('open'); inp.value = ''; render(''); inp.focus(); }
    function closePal() { pal.classList.remove('open'); }
    function run(i) {
      const c = items[i]; if (!c) return;
      const keep = c[2]();
      if (keep !== true) closePal(); else render(inp.value);
    }
    addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.classList.contains('open') ? closePal() : openPal(); }
      if (!pal.classList.contains('open')) return;
      if (e.key === 'Escape') closePal();
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); sel = Math.max(sel - 1, 0); }
      if (e.key === 'Enter')     { e.preventDefault(); run(sel); return; }
      [...list.children].forEach((b, i) => b.classList.toggle('on', i === sel));
    });
    inp.addEventListener('input', () => render(inp.value));
    list.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) run(+b.dataset.i); });
    pal.addEventListener('click', e => { if (e.target === pal) closePal(); });
    const hint = $('#palHint'); if (hint) hint.addEventListener('click', openPal);
    logLine('<b>PALETTE ARMED</b> \u00b7 CTRL+K');
  })();

  if (reduced) return;

  /* ---- crosshair ---- */
  const chx = $('#chx'), chy = $('#chy'), coord = $('#coord');
  if (matchMedia('(hover:hover)').matches) {
    addEventListener('mousemove', e => {
      chx.style.top = e.clientY + 'px'; chy.style.left = e.clientX + 'px';
      coord.style.left = e.clientX + 'px'; coord.style.top = e.clientY + 'px';
      coord.textContent = 'X:' + String(e.clientX).padStart(4,'0') + ' Y:' + String(e.clientY).padStart(4,'0');
    }, { passive:true });
  }

  /* ---- scramble ---- */
  const CH = '#/\\|_—<>[]{}01';
  function scramble(el) {
    const orig = el.dataset.orig || (el.dataset.orig = el.textContent);
    let f = 0; clearInterval(el._t);
    el._t = setInterval(() => {
      el.textContent = orig.split('').map((c,i) => i<f ? orig[i] : (c===' '?' ':CH[Math.random()*CH.length|0])).join('');
      if (f++ >= orig.length) { clearInterval(el._t); el.textContent = orig; }
    }, 26);
  }
  document.querySelectorAll('.scramble').forEach(el => el.addEventListener('mouseenter', () => scramble(el)));
  document.querySelectorAll('.scramble-auto').forEach(el => setTimeout(() => scramble(el), 1300));

  /* ---- also-built cards: pointer-tracked 3D tilt, no library ----
     CSS perspective plus a rotate driven by cursor position inside the card.
     The existing hard shadow shifts with the tilt so the depth reads as one
     object rather than a flat card with a sticker behind it. */
  if (matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.more-grid .mini').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        const ry = (px * 9).toFixed(2), rx = (-py * 7).toFixed(2);
        card.classList.add('tilting');
        card.style.transform = 'perspective(1100px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translate3d(-3px,-3px,14px)';
        card.style.boxShadow = (5 - px * 4).toFixed(1) + 'px ' + (5 - py * 4).toFixed(1) + 'px 0 var(--orange)';
      });
      const reset = () => {
        card.classList.remove('tilting');
        card.style.transform = '';
        card.style.boxShadow = '';
      };
      card.addEventListener('pointerleave', reset);
      card.addEventListener('pointercancel', reset);
    });
  }

  /* ---- draggable badge with spring-back ---- */
  const badge = $('#badge');
  if (badge && matchMedia('(hover:hover)').matches) {
    let sx, sy, dx = 0, dy = 0, drag = false;
    badge.addEventListener('pointerdown', e => {
      drag = true; sx = e.clientX - dx; sy = e.clientY - dy;
      badge.classList.add('dragging'); badge.classList.remove('snapback');
      badge.setPointerCapture(e.pointerId);
    });
    badge.addEventListener('pointermove', e => {
      if (!drag) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      const rot = Math.max(-14, Math.min(14, dx * .06));
      badge.style.transform = `translate(${dx}px,${dy}px) rotate(${rot}deg)`;
    });
    function release() {
      if (!drag) return; drag = false; dx = 0; dy = 0;
      badge.classList.remove('dragging'); badge.classList.add('snapback');
      badge.style.transform = '';
      logLine('<b>PERSONNEL BADGE</b>: returned to holder');
    }
    badge.addEventListener('pointerup', release);
    badge.addEventListener('pointercancel', release);
  }
})();
