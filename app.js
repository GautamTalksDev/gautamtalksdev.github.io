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
  const baseTitle = document.title;
  function setOutage(on) {
    document.body.classList.toggle('outage', on);
    kill.setAttribute('aria-checked', on);
    linkState.textContent = on ? 'LOST' : 'LIVE';
    pulseTxt.textContent = on ? 'SAFETY LOOP · NOMINAL · OFFLINE MODE' : 'SAFETY LOOP · NOMINAL';
    badgeLive.textContent = on ? '● ON SITE · OFFLINE' : '● ON SITE';
    document.title = on ? '⚠ LINK LOST · Gautam Khosla' : baseTitle;
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
    work: () => 'Takehome [payroll · 98.2% vs the CRA]  assay-gpu + LADING + jevbench [papers]  PLIMSOLL [spec]  AEGIS [edge/QNX]  Cairn [robot integrity]  Vernier [agent eval]  Mayfly [microVM]  Plumbline [transparency log]  Porchlight [offline mesh · 2nd, civic tech]  AeroGuard [SOC triage · MLH award]\n→ github.com/GautamTalksDev',
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

  /* ================= SEC.00 · ONE TOWN, ONE STORM =================
     Both live systems in one 3D town, drawn with a hand-written projection and
     painter's sorting: no library, zero third-party requests.
     West end, the AEGIS worksite: the real pipeline logic. Detection, zone
     rules, a state machine where the relay fires before the voice, and an async
     uplink that buffers on the edge device when the cloud is gone.
     East end, the Porchlight street: calls resent until a node acknowledges,
     gossip with repair, 30% of messages dropped on purpose, delivered to the
     City exactly once. One UPLINK switch cuts both. Runs only while visible. */
  (function town() {
    const cv = $('#townCv'); if (!cv) return;
    const cx = cv.getContext('2d'), W = 1000, H = 380;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const TAU = Math.PI * 2, LOSS = 0.3, DROP_AT = 0.55;
    const K = { amber:'#F5A524', red:'#EF4444', moon:'#8AB4F8', green:'#4ADE80', warn:'#FBBF24', safety:'#FF4100',
                mute:'#6B7280', dim:'#3A3D46', edge:'#2A2C33', dark:'#1E2028', text:'#D7DBE4', steel:'#4B5563' };
    const MONO = '"IBM Plex Mono", monospace';
    const cut = () => document.body.classList.contains('outage');
    const rnd = a => a[Math.floor(Math.random() * a.length)];
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const shell = $('#simShell');
    const ae = { state:$('#simState'), relay:$('#simRelay'), sent:$('#simSent'), buf:$('#simBuf') };
    const pl = { link:$('#plLink'), held:$('#plHeld'), del:$('#plDel'), lost:$('#plLost'), drop:$('#plDrop') };
    let T = 0;

    // ---------- the town, west to east: worksite, uplink mast, street, City Hall ----------
    const SX = 230;
    const WX = x => x - 500 + SX, WZ = y => y - 202;
    const doorZ = y => y < 202 ? WZ(y) + 25 : WZ(y) - 25;
    const YARD = { x0:-935, x1:-520, z0:-122, z1:122 };
    const ZONE = { x0:-705, x1:-590, z0:-104, z1:104 };
    const MAST = { x:-418, z:-84, h:132 };
    const EDGE = { x:-904, z:-98 }, CAMPOS = { x:-888, y:66, z:-98 }, SIREN = { x:-584, z:-112 };
    const PORT = { X: 298 + SX + 2, Y: 62, Z: 0 };

    // ---------- messages in flight, shared by both systems ----------
    const packets = [], marks = [], inflight = new Set();
    function send(kind, a, b, arc, key, onArrive, lossy, delay) {
      if (key) inflight.add(key);
      packets.push({ kind, a, b, arc, t0: T + (delay || 0), key, onArrive,
        dur: kind === 'ble' ? 380 : kind === 'gossip' ? 460 : kind === 'up' ? 620 : 760,
        drop: lossy !== false && Math.random() < LOSS });
    }
    const at3 = (p, k) => ({ X: p.a.X + (p.b.X - p.a.X) * k, Y: p.a.Y + (p.b.Y - p.a.Y) * k + Math.sin(Math.PI * k) * p.arc, Z: p.a.Z + (p.b.Z - p.a.Z) * k });

    // ---------- AEGIS: the worksite ----------
    let workers = [], spawnAt = 0, sent = 0, buf = 0, aState = 'SAFE', alarmT = -1e9, relayT = 0, flushAt = 0, violating = false;
    const EDGE_TOP = { X: EDGE.x, Y: 16, Z: EDGE.z }, MAST_TOP = { X: MAST.x, Y: MAST.h, Z: MAST.z };
    function spawnWorker(x) {
      workers.push({ x: x !== undefined ? x : YARD.x0 + 6, z: -8 + Math.random() * 106, v: .016 + Math.random() * .02,
                     hat: Math.random() > .3, bob: Math.random() * TAU, flagged: false, danger: false });   // 30% forgot their PPE
    }
    for (let i = 0; i < 4; i++) spawnWorker(YARD.x0 + 20 + Math.random() * 230);
    const arrive = () => { if (cut()) buf++; else sent++; };            // the link can die mid-flight
    function aeUplink() {
      if (cut()) { buf++; return; }
      send('ae', EDGE_TOP, MAST_TOP, 60, null, arrive, false);
    }
    function stepAegis(dt) {
      violating = false;
      for (const w of workers) {
        w.x += w.v * dt;
        const inZone = w.x > ZONE.x0 && w.x < ZONE.x1 && w.z > ZONE.z0 && w.z < ZONE.z1;
        w.danger = inZone && !w.hat;
        if (w.danger) { violating = true; if (!w.flagged) { w.flagged = true; aeUplink(); } }   // one event per zone entry
        if (!inZone) w.flagged = false;
      }
      workers = workers.filter(w => w.x < YARD.x1 - 6);
      if (T >= spawnAt) { spawnAt = T + 1400; if (workers.length < 7) spawnWorker(); }
      // state machine: SAFE, then VIOLATION with the relay first and the voice after (SCHED_FIFO ordering)
      if (violating) { if (aState === 'SAFE') relayT = T; aState = 'VIOLATION'; alarmT = T; }
      else if (T - alarmT > 1200) aState = 'SAFE';
      // chunked flush once the link is back: three at a time
      if (T >= flushAt) {
        flushAt = T + 220;
        if (!cut() && buf > 0) { const n = Math.min(buf, 3); buf -= n; for (let i = 0; i < n; i++) send('ae', EDGE_TOP, MAST_TOP, 60, null, arrive, false, i * 70); }
      }
    }

    // ---------- Porchlight: the street ----------
    const COLX = [70, 185, 300, 415, 530, 645], ROWY = [112, 292];
    const homes = [];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) homes.push({ c, r, x: COLX[c], y: ROWY[r] });
    const hAt = (c, r) => homes[r * 6 + c];
    const nodes = [[0,0],[1,1],[2,0],[3,1],[4,0],[5,1]].map(([c, r], i) => {
      const h = hAt(c, r); h.node = i; return { i, x: h.x, y: h.y, have: new Map() };
    });
    const EDGES = [[0,1],[1,2],[2,3],[3,4],[4,5],[0,2],[2,4],[1,3],[3,5]], GATES = [4, 5];
    const beacons = [[1,0,[0,2]],[2,1,[1,3]],[3,0,[2,4]],[4,1,[3,5]]].map(([c, r, b], i) => {
      const h = hAt(c, r); h.beacon = i;
      return { i, name: 'B-0' + (i + 1), x: h.x, y: h.y, buddies: b, state: 'idle', t: 0, ev: null, nextTry: 0, helper: null };
    });
    const roofOf = n => ({ X: WX(n.x), Y: 58, Z: WZ(n.y) });
    let nextPress = 900, nextGossip = 0, nextUp = 0, seq = 0, wasCut = false;
    let drops = 0, calls = 0, dupes = 0, last = null, longest = 0;
    const events = new Map(), walkers = [], pings = [], city = new Set();
    function learn(n, id, hops) {
      if (n.have.has(id)) return;
      n.have.set(id, hops);
      const ev = events.get(id);
      if (ev && ev.gateAt === null && GATES.includes(n.i)) ev.gateAt = T;
    }
    function press(bk) {
      const ev = { id: ++seq, b: bk, gateAt: null, delivered: null };
      events.set(ev.id, ev); calls++;
      Object.assign(bk, { state: 'calling', t: T, ev, nextTry: T, helper: null });
    }
    function stepStreet() {
      const isCut = cut();
      if (wasCut && !isCut) {
        const held = [...events.values()].filter(e => !e.delivered).length;
        if (held && visible) logLine('<b>PORCHLIGHT</b>: ' + held + ' held calls reaching the City');
      }
      wasCut = isCut;
      if (T >= nextPress) {
        nextPress = T + 2400 + Math.random() * 1800;
        const idle = beacons.filter(b => b.state === 'idle');
        if (idle.length) press(rnd(idle));
      }
      for (const bk of beacons) {
        // first hop over Bluetooth, resent until a node acknowledges
        if (bk.state === 'calling' && T >= bk.nextTry && !inflight.has('ble:' + bk.ev.id)) {
          const n = nodes[rnd(bk.buddies)], ev = bk.ev;
          bk.nextTry = T + 650;
          send('ble', { X: WX(bk.x) + 14, Y: 9, Z: doorZ(bk.y) }, roofOf(n), 16, 'ble:' + ev.id, () => {
            learn(n, ev.id, 1);
            if (bk.state === 'calling' && bk.ev === ev) { bk.state = 'acked'; bk.t = T; bk.helper = n; }
          });
        }
        if (bk.state === 'acked' && T - bk.t > 1300) { bk.state = 'helped'; bk.t = T; walkers.push({ from: bk.helper, to: bk, t0: T, dur: 2600 }); }
        if (bk.state === 'helped' && T - bk.t > 5200) bk.state = 'idle';
      }
      // gossip: one exchange per round, each direction, repairing whatever the other side lacks
      if (T >= nextGossip) {
        nextGossip = T + 170;
        const [a, b] = rnd(EDGES);
        for (const [s, d] of [[nodes[a], nodes[b]], [nodes[b], nodes[a]]]) {
          for (const [id, hops] of s.have) {
            const key = 'g:' + s.i + '>' + d.i + ':' + id;
            if (d.have.has(id) || inflight.has(key)) continue;
            send('gossip', roofOf(s), roofOf(d), 30, key, () => learn(d, id, hops + 1));
            break;
          }
        }
      }
      // gateways forward to the City whenever the link is up
      if (T >= nextUp) {
        nextUp = T + 200;
        if (!isCut) for (const g of GATES) {
          const n = nodes[g];
          for (const [id, hops] of n.have) {
            const key = 'u:' + g + ':' + id;
            if (city.has(id) || inflight.has(key)) continue;
            send('up', roofOf(n), PORT, 46, key, () => {
              if (cut()) { drops++; return; }
              if (city.has(id)) { dupes++; return; }                 // exactly once
              city.add(id);
              const ev = events.get(id); ev.delivered = T;
              const held = ev.gateAt === null ? 0 : Math.max(0, T - ev.gateAt - 700);
              last = { name: ev.b.name, hops: hops + 1, held }; if (held > longest) longest = held;
              pings.push({ t0: T });
            });
            break;
          }
        }
      }
      for (const [id, ev] of events) if (ev.delivered !== null && T - ev.delivered > 1500) { events.delete(id); nodes.forEach(n => n.have.delete(id)); }
      for (let i = walkers.length - 1; i >= 0; i--) if (T - walkers[i].t0 > walkers[i].dur + 1600) walkers.splice(i, 1);
      for (let i = pings.length - 1; i >= 0; i--) if (T - pings[i].t0 > 650) pings.splice(i, 1);
    }

    function stepPackets() {
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i], k = (T - p.t0) / p.dur;
        if (p.drop && k >= DROP_AT) { packets.splice(i, 1); if (p.key) inflight.delete(p.key); drops++; marks.push(Object.assign(at3(p, DROP_AT), { t0: T })); }
        else if (k >= 1) { packets.splice(i, 1); if (p.key) inflight.delete(p.key); p.onArrive(); }
      }
      for (let i = marks.length - 1; i >= 0; i--) if (T - marks[i].t0 > 700) marks.splice(i, 1);
    }

    // ---------- the storm ----------
    const rain = Array.from({ length: 150 }, () => ({ x: -960 + Math.random() * 1680, y: Math.random() * 170, z: -170 + Math.random() * 340, v: .12 + Math.random() * .1 }));

    // ---------- camera: presets, a flight between them, drift, and orbit ----------
    const CAMS = {
      aegis: { fx:-728, fz:6, vw:560, yaw:-0.46, pitch:0.58 },
      pl:    { fx:240, fz:0, vw:1010, yaw:-0.38, pitch:0.5 },
      town:  { fx:-150, fz:0, vw:1850, yaw:-0.3, pitch:0.68 }
    };
    let cam = 'aegis', yawOff = 0, pitchOff = 0, grab = null, idleFrom = 0;
    let V = Object.assign({}, reduced ? CAMS.aegis : CAMS.town);
    let fly = reduced ? null : { a: Object.assign({}, CAMS.town), b: CAMS.aegis, t0: 500, dur: 2300, intro: true };
    const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    function flyTo(which) {
      cam = which;
      if (reduced || !visible) { V = Object.assign({}, CAMS[which]); fly = null; yawOff = pitchOff = 0; return; }
      fly = { a: Object.assign({}, V), b: CAMS[which], t0: T, dur: 1900, oy: yawOff, op: pitchOff };
    }
    function stepCamera(dt) {
      if (fly) {
        const k = clamp((T - fly.t0) / fly.dur, 0, 1), e = ease(k), a = fly.a, b = fly.b, arc = Math.sin(Math.PI * k);
        const bump = Math.min(900, Math.abs(b.fx - a.fx) * .75);         // pull back over the rooftops mid-flight
        V = { fx: a.fx + (b.fx - a.fx) * e, fz: a.fz + (b.fz - a.fz) * e, vw: a.vw + (b.vw - a.vw) * e + arc * bump,
              yaw: a.yaw + (b.yaw - a.yaw) * e, pitch: a.pitch + (b.pitch - a.pitch) * e + arc * .12 };
        if (fly.oy !== undefined && !grab) { yawOff = fly.oy * (1 - e); pitchOff = fly.op * (1 - e); }
        if (k >= 1) fly = null;
      } else if (!grab && T > idleFrom) {
        const tgt = Math.sin(T * .00012) * .14, near = tgt + TAU * Math.round((yawOff - tgt) / TAU);
        yawOff += (near - yawOff) * Math.min(1, dt * .0016); pitchOff += (0 - pitchOff) * Math.min(1, dt * .001);
      }
    }
    let cyw = 1, syw = 0, cpt = 1, spt = 0, SC = 1, PF = 1600;
    function setCam() {
      const yaw = V.yaw + yawOff, pitch = clamp(V.pitch + pitchOff, .22, 1.1);
      cyw = Math.cos(yaw); syw = Math.sin(yaw); cpt = Math.cos(pitch); spt = Math.sin(pitch);
      SC = (W - 40) / V.vw; PF = V.vw * 1.7;
    }
    function P(x, y, z) {
      const X = x - V.fx, Z = z - V.fz, rx = X * cyw - Z * syw, rz = X * syw + Z * cyw;
      const up = y * cpt - rz * spt, d = rz * cpt + y * spt, gap = PF - d;
      const s = PF / Math.max(PF * .3, gap) * SC;
      return { x: W / 2 + rx * s, y: H * .6 - up * s, d, s, behind: gap < PF * .3 };
    }

    // ---------- geometry, built once ----------
    const faces = [], LIGHT = [-.42, .78, -.46];
    function shade(hex, f) {
      const n = parseInt(hex.slice(1), 16), c = v => Math.min(255, Math.round(v * f));
      return 'rgb(' + c(n >> 16) + ',' + c((n >> 8) & 255) + ',' + c(n & 255) + ')';
    }
    function face(pts, fill, stroke, decals, owner) {
      const [a, b, c] = pts, u = [b[0]-a[0], b[1]-a[1], b[2]-a[2]], v = [c[0]-a[0], c[1]-a[1], c[2]-a[2]];
      const n = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]], m = Math.hypot(n[0], n[1], n[2]) || 1;
      const lit = .72 + .5 * Math.abs((n[0]*LIGHT[0] + n[1]*LIGHT[1] + n[2]*LIGHT[2]) / m);
      faces.push({ pts, fill: shade(fill, lit), stroke, decals: decals || [], owner });
    }
    const quad = (x0, x1, y0, y1, zf) => [[x0, y0, zf], [x1, y0, zf], [x1, y1, zf], [x0, y1, zf]];
    function box(x0, x1, y0, y1, z0, z1, fill, stroke, owner, decZ1) {
      face(quad(x0, x1, y0, y1, z1), fill, stroke, decZ1, owner);
      face(quad(x0, x1, y0, y1, z0), fill, stroke, null, owner);
      face([[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]], fill, stroke, null, owner);
      face([[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]], fill, stroke, null, owner);
      face([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]], fill, stroke, null, owner);
    }
    function buildHouse(h) {
      const X = WX(h.x), Z = WZ(h.y), lit = h.node !== undefined;
      const x0 = X - 28, x1 = X + 28, z0 = Z - 22, z1 = Z + 22, top = 30, ridge = 52;
      const front = h.y < 202 ? z1 : z0, back = h.y < 202 ? z0 : z1;
      const wins = zf => [X - 20, X + 9].map(wx => ({ q: quad(wx, wx + 11, 12, 22, zf), c: lit ? K.amber : K.dark }));
      const WALL = '#1A1C23', ROOF = '#23262F';
      face(quad(x0, x1, 0, top, front), WALL, K.edge, [...wins(front), { q: quad(X - 5, X + 5, 0, 17, front), c: K.dark }], h);
      face(quad(x0, x1, 0, top, back), WALL, K.edge, wins(back), h);
      face([[x0,0,z0],[x0,0,z1],[x0,top,z1],[x0,top,z0]], WALL, K.edge, null, h);
      face([[x1,0,z0],[x1,0,z1],[x1,top,z1],[x1,top,z0]], WALL, K.edge, null, h);
      face([[x0,top,z0],[x0,top,z1],[x0,ridge,Z]], WALL, K.edge, null, h);
      face([[x1,top,z0],[x1,top,z1],[x1,ridge,Z]], WALL, K.edge, null, h);
      face([[x0-3,top-2,z1+3],[x1+3,top-2,z1+3],[x1+3,ridge,Z],[x0-3,ridge,Z]], ROOF, K.edge, null, h);
      face([[x0-3,top-2,z0-3],[x1+3,top-2,z0-3],[x1+3,ridge,Z],[x0-3,ridge,Z]], ROOF, K.edge, null, h);
    }
    function buildCity() {
      const o = SX, x0 = 322 + o, x1 = 442 + o, z0 = -45, z1 = 45, top = 48, ridge = 76, px = 298 + o, F = '#141925', S = K.moon, R = '#1A2030';
      box(294 + o, 446 + o, 0, 4, -52, 52, F, S, 'city');
      face([[x0,4,z0],[x0,4,z1],[x0,top,z1],[x0,top,z0]], F, S, [{ q: [[x0,4,-9],[x0,4,9],[x0,28,9],[x0,28,-9]], c: '#0E1118' }], 'city');
      face([[x1,4,z0],[x1,4,z1],[x1,top,z1],[x1,top,z0]], F, S, null, 'city');
      face(quad(x0, x1, 4, top, z0), F, S, null, 'city'); face(quad(x0, x1, 4, top, z1), F, S, null, 'city');
      for (const cz of [-36, -18, 0, 18, 36]) {
        const a = px + 6, b = px + 12;
        face(quad(a, b, 4, top, cz - 3), F, S, null, 'city'); face(quad(a, b, 4, top, cz + 3), F, S, null, 'city');
        face([[a,4,cz-3],[a,4,cz+3],[a,top,cz+3],[a,top,cz-3]], F, S, null, 'city'); face([[b,4,cz-3],[b,4,cz+3],[b,top,cz+3],[b,top,cz-3]], F, S, null, 'city');
      }
      face([[px,top,z0-4],[px,top,z1+4],[px,ridge,0]], F, S, null, 'city');
      face([[x1+2,top,z0-4],[x1+2,top,z1+4],[x1+2,ridge,0]], F, S, null, 'city');
      face([[px,top,z1+4],[x1+2,top,z1+4],[x1+2,ridge,0],[px,ridge,0]], R, S, null, 'city');
      face([[px,top,z0-4],[x1+2,top,z0-4],[x1+2,ridge,0],[px,ridge,0]], R, S, null, 'city');
    }
    function buildSite() {
      const ST = '#5C4424', SF = '#1F1B16';
      box(-690, -612, 0, 30, -100, -64, SF, ST, 'site');                                   // the press, inside the zone
      box(-676, -640, 30, 46, -94, -72, SF, ST, 'site');
      box(-806, -750, 0, 26, -120, -86, '#1A1C23', K.edge, 'site',                         // site office, on a generator
          [-798, -782, -766].map(wx => ({ q: quad(wx, wx + 10, 11, 20, -86), c: K.amber })));
      box(EDGE.x - 11, EDGE.x + 11, 0, 13, EDGE.z - 8, EDGE.z + 8, '#15171D', K.safety, 'edge');   // Pi 5 on QNX
      box(CAMPOS.x - 6, CAMPOS.x + 6, CAMPOS.y - 4, CAMPOS.y + 4, CAMPOS.z - 4, CAMPOS.z + 4, '#15171D', '#9CA3AF', 'site');
    }
    homes.forEach(buildHouse); buildCity(); buildSite();

    // ---------- drawing helpers ----------
    function poly(ps) { cx.beginPath(); cx.moveTo(ps[0].x, ps[0].y); for (let i = 1; i < ps.length; i++) cx.lineTo(ps[i].x, ps[i].y); cx.closePath(); }
    function line(a, b) { if (a.behind || b.behind) return; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
    function text(s, x, y, color, size, weight, align) {
      cx.fillStyle = color; cx.font = (weight || 600) + ' ' + (size || 10) + 'px ' + MONO;
      cx.textAlign = align || 'left'; cx.fillText(s, x, y); cx.textAlign = 'left';
    }
    function label(s, wx, wy, wz, color, size, align) { const p = P(wx, wy, wz); if (!p.behind) text(s, p.x, p.y, color, size || 9.5, 600, align || 'center'); }
    function groundGlow(p, r, rgb, a) {
      if (p.behind) return;
      cx.save(); cx.translate(p.x, p.y); cx.scale(1, Math.max(.2, spt));
      const R = r * p.s, g = cx.createRadialGradient(0, 0, 0, 0, 0, R);
      g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, R, 0, TAU); cx.fill(); cx.restore();
    }
    function ring(p, r, color, width) {
      if (p.behind) return;
      cx.strokeStyle = color; cx.lineWidth = width || 2;
      cx.beginPath(); cx.ellipse(p.x, p.y, r * p.s, r * p.s * Math.max(.2, spt), 0, 0, TAU); cx.stroke();
    }
    function wire(x0, x1, y0, y1, z0, z1) {
      const c = [[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]].map(q => P(q[0], q[1], q[2]));
      for (const [i, j] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]) line(c[i], c[j]);
    }
    function drawWorker(w) {
      const f = P(w.x, 0, w.z); if (f.behind) return;
      const ph = Math.sin(T * .012 + w.bob);
      const hip = P(w.x, 9, w.z), sh = P(w.x, 15, w.z), hd = P(w.x, 19.5, w.z);
      cx.strokeStyle = '#9CA3AF'; cx.lineWidth = Math.max(1, 1.5 * f.s); cx.lineCap = 'round';
      cx.beginPath();
      for (const q of [P(w.x - 3 + ph * 2, 0, w.z), P(w.x + 3 - ph * 2, 0, w.z)]) { cx.moveTo(hip.x, hip.y); cx.lineTo(q.x, q.y); }
      cx.moveTo(sh.x, sh.y); cx.lineTo(hip.x, hip.y);
      for (const q of [P(w.x - 4, 11 + ph, w.z), P(w.x + 4, 11 - ph, w.z)]) { cx.moveTo(sh.x, sh.y); cx.lineTo(q.x, q.y); }
      cx.stroke(); cx.lineCap = 'butt';
      cx.fillStyle = '#D1D5DB'; cx.beginPath(); cx.arc(hd.x, hd.y, 2.6 * hd.s, 0, TAU); cx.fill();
      if (w.hat) {
        cx.fillStyle = K.safety; cx.beginPath(); cx.arc(hd.x, hd.y - .6 * hd.s, 3 * hd.s, Math.PI, 0); cx.fill();
        cx.fillRect(hd.x - 3.8 * hd.s, hd.y - .9 * hd.s, 7.6 * hd.s, 1.2 * hd.s);
      }
      // what the on-device model sees
      const col = w.danger ? K.red : w.hat ? 'rgba(74,222,128,.9)' : 'rgba(251,191,36,.9)';
      cx.strokeStyle = col; cx.lineWidth = w.danger ? 2 : 1.1; wire(w.x - 7, w.x + 7, 0, 25, w.z - 7, w.z + 7);
      if (V.vw < 760) {
        const lp = P(w.x - 7, 29, w.z);
        text((w.hat ? 'PERSON · PPE ✓ ' : 'PERSON · NO HELMET ') + (.87 + Math.sin(T * .001 + w.bob) * .06).toFixed(2), lp.x, lp.y, col, 8.5);
      }
    }

    function draw() {
      setCam();
      const isCut = cut(), close = V.vw < 760, mid = V.vw < 1300;
      cx.fillStyle = '#0E0F13'; cx.fillRect(0, 0, W, H);

      // ground: the drafting sheet, the yard, one road through town
      cx.strokeStyle = 'rgba(255,255,255,.045)'; cx.lineWidth = 1;
      for (let gx = -960; gx <= 720; gx += 40) line(P(gx, 0, -150), P(gx, 0, 150));
      for (let gz = -150; gz <= 150; gz += 40) line(P(-960, 0, gz), P(720, 0, gz));
      const g4 = (x0, x1, z0, z1) => [P(x0, 0, z0), P(x1, 0, z0), P(x1, 0, z1), P(x0, 0, z1)];
      cx.fillStyle = '#15161B'; poly(g4(YARD.x0, YARD.x1, YARD.z0, YARD.z1)); cx.fill();
      cx.fillStyle = '#14151B'; poly(g4(YARD.x1, 294 + SX, -26, 26)); cx.fill();
      cx.fillStyle = K.edge;
      for (let x = YARD.x1 + 12; x < 280 + SX; x += 28) { poly(g4(x, x + 14, -1.3, 1.3)); cx.fill(); }
      // the hazard zone, a lit volume that brightens when someone walks in bare-headed
      const hot = aState === 'VIOLATION', pulse = hot ? .5 + .5 * Math.sin(T * .02) : 0;
      cx.fillStyle = 'rgba(255,65,0,' + (.07 + pulse * .1).toFixed(3) + ')'; poly(g4(ZONE.x0, ZONE.x1, ZONE.z0, ZONE.z1)); cx.fill();
      cx.strokeStyle = 'rgba(255,65,0,.9)'; cx.lineWidth = 2; cx.setLineDash([9, 6]); poly(g4(ZONE.x0, ZONE.x1, ZONE.z0, ZONE.z1)); cx.stroke(); cx.setLineDash([]);
      // porch lights, the City's glow, beacon calls rippling out
      for (const n of nodes) groundGlow(P(WX(n.x), 0, doorZ(n.y)), 52, '245,165,36', .26);
      groundGlow(P(-778, 0, -70), 60, '245,165,36', .14);
      if (!isCut) groundGlow(P(370 + SX, 0, 0), 120, '138,180,248', .1);
      for (const bk of beacons) if (bk.state === 'calling') {
        const k = ((T - bk.t) % 900) / 900;
        ring(P(WX(bk.x) + 14, 0, doorZ(bk.y)), 6 + k * 34, 'rgba(239,68,68,' + (1 - k).toFixed(2) + ')', 2);
      }
      for (const p of pings) { const k = (T - p.t0) / 650; ring(P(370 + SX, 0, 0), 78 + k * 40, 'rgba(138,180,248,' + (1 - k).toFixed(2) + ')', 2); }
      // the fence, with a gate where the road leaves the yard
      cx.strokeStyle = 'rgba(156,163,175,.35)'; cx.lineWidth = 1;
      const fence = [];
      for (let x = YARD.x0; x <= YARD.x1; x += 30) fence.push([x, YARD.z0], [x, YARD.z1]);
      for (let z = YARD.z0; z <= YARD.z1; z += 30) { fence.push([YARD.x0, z]); if (Math.abs(z) > 30) fence.push([YARD.x1, z]); }
      for (const [fx, fz] of fence) line(P(fx, 0, fz), P(fx, 14, fz));
      line(P(YARD.x0, 14, YARD.z0), P(YARD.x1, 14, YARD.z0)); line(P(YARD.x0, 14, YARD.z1), P(YARD.x1, 14, YARD.z1));
      line(P(YARD.x0, 14, YARD.z0), P(YARD.x0, 14, YARD.z1));
      line(P(YARD.x1, 14, YARD.z0), P(YARD.x1, 14, -32)); line(P(YARD.x1, 14, 32), P(YARD.x1, 14, YARD.z1));
      // CAM-01's field of view onto the zone
      cx.strokeStyle = 'rgba(215,219,228,.12)'; cx.setLineDash([3, 5]);
      const cam0 = P(CAMPOS.x + 6, CAMPOS.y, CAMPOS.z);
      for (const [zx, zz] of [[ZONE.x0, ZONE.z0], [ZONE.x0, ZONE.z1], [ZONE.x1, ZONE.z0], [ZONE.x1, ZONE.z1]]) line(cam0, P(zx, 0, zz));
      cx.setLineDash([]);
      cx.strokeStyle = '#6B7280'; cx.lineWidth = 2; line(P(CAMPOS.x, 0, CAMPOS.z), P(CAMPOS.x, CAMPOS.y - 4, CAMPOS.z));

      // buildings and people, far to near
      const list = faces.map(f => {
        const pp = f.pts.map(q => P(q[0], q[1], q[2])); let d = 0, behind = false;
        for (const q of pp) { d += q.d; if (q.behind) behind = true; }
        return { f, pp, d: d / pp.length, behind };
      });
      for (const w of workers) list.push({ w, d: P(w.x, 10, w.z).d });
      list.sort((a, b) => a.d - b.d);
      for (const it of list) {
        if (it.w) { drawWorker(it.w); continue; }
        if (it.behind) continue;
        const f = it.f;
        cx.globalAlpha = f.owner === 'city' && isCut ? .4 : 1;
        cx.fillStyle = f.fill; poly(it.pp); cx.fill();
        cx.strokeStyle = f.stroke; cx.lineWidth = f.owner === 'city' || f.owner === 'edge' ? 1.4 : 1.1; cx.stroke();
        for (const dc of f.decals) { cx.fillStyle = dc.c; poly(dc.q.map(v => P(v[0], v[1], v[2]))); cx.fill(); }
      }
      cx.globalAlpha = 1;

      // the zone as a volume, the relay light, and the voice after it
      cx.strokeStyle = 'rgba(255,65,0,' + (.22 + pulse * .4).toFixed(2) + ')'; cx.lineWidth = 1;
      for (const [zx, zz] of [[ZONE.x0, ZONE.z0], [ZONE.x0, ZONE.z1], [ZONE.x1, ZONE.z0], [ZONE.x1, ZONE.z1]]) line(P(zx, 0, zz), P(zx, 40, zz));
      poly([P(ZONE.x0, 40, ZONE.z0), P(ZONE.x1, 40, ZONE.z0), P(ZONE.x1, 40, ZONE.z1), P(ZONE.x0, 40, ZONE.z1)]); cx.stroke();
      cx.strokeStyle = '#6B7280'; cx.lineWidth = 2; line(P(SIREN.x, 0, SIREN.z), P(SIREN.x, 34, SIREN.z));
      const sl = P(SIREN.x, 37, SIREN.z);
      if (hot && !sl.behind) {
        const R = 26 * sl.s, g = cx.createRadialGradient(sl.x, sl.y, 0, sl.x, sl.y, R);
        g.addColorStop(0, 'rgba(239,68,68,' + (.35 + pulse * .4).toFixed(2) + ')'); g.addColorStop(1, 'rgba(239,68,68,0)');
        cx.fillStyle = g; cx.fillRect(sl.x - R, sl.y - R, R * 2, R * 2);
        if (T - relayT > 350) for (let i = 0; i < 3; i++) {                               // voice at P8, after the relay
          const k = ((T * .0012) + i / 3) % 1;
          cx.strokeStyle = 'rgba(251,191,36,' + (1 - k).toFixed(2) + ')'; cx.lineWidth = 1.5;
          cx.beginPath(); cx.arc(sl.x, sl.y, (8 + k * 26) * sl.s, -0.9, 0.9); cx.stroke();
        }
      }
      if (!sl.behind) { cx.fillStyle = hot ? K.red : K.dim; cx.beginPath(); cx.arc(sl.x, sl.y, 4 * sl.s, 0, TAU); cx.fill(); }

      // the uplink mast: the town's only way out
      cx.strokeStyle = K.steel; cx.lineWidth = 1.2;
      const legs = [[-1,-1],[1,-1],[1,1],[-1,1]];
      for (const [a, b] of legs) line(P(MAST.x + a * 12, 0, MAST.z + b * 12), P(MAST.x + a * 3, MAST.h, MAST.z + b * 3));
      for (let lv = 0; lv < 6; lv++) {
        const y0 = lv * 22, y1 = y0 + 22, w0 = 12 - 9 * y0 / MAST.h, w1 = 12 - 9 * y1 / MAST.h;
        line(P(MAST.x - w0, y0, MAST.z - w0), P(MAST.x + w1, y1, MAST.z - w1));
        line(P(MAST.x + w0, y0, MAST.z + w0), P(MAST.x - w1, y1, MAST.z + w1));
      }
      const mt = P(MAST.x, MAST.h + 4, MAST.z);
      if (!mt.behind) {
        const blink = !isCut && Math.sin(T * .006) > 0;
        if (blink) { const R = 18 * mt.s, g = cx.createRadialGradient(mt.x, mt.y, 0, mt.x, mt.y, R); g.addColorStop(0, 'rgba(239,68,68,.5)'); g.addColorStop(1, 'rgba(239,68,68,0)'); cx.fillStyle = g; cx.fillRect(mt.x - R, mt.y - R, R * 2, R * 2); }
        cx.fillStyle = blink ? K.red : K.dim; cx.beginPath(); cx.arc(mt.x, mt.y, 3.5 * mt.s, 0, TAU); cx.fill();
      }

      // lit windows bleed a little light
      cx.globalCompositeOperation = 'lighter';
      for (const n of nodes) {
        const p = P(WX(n.x), 18, WZ(n.y)); if (p.behind) continue;
        const R = 44 * p.s, g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
        g.addColorStop(0, 'rgba(245,165,36,.18)'); g.addColorStop(1, 'rgba(245,165,36,0)');
        cx.fillStyle = g; cx.fillRect(p.x - R, p.y - R, R * 2, R * 2);
      }
      cx.globalCompositeOperation = 'source-over';

      // links: the edge device to the mast, the street's mesh, the gateways to City Hall
      const et = P(EDGE_TOP.X, EDGE_TOP.Y, EDGE_TOP.Z), mtop = P(MAST.x, MAST.h, MAST.z);
      cx.strokeStyle = isCut ? 'rgba(239,68,68,.55)' : 'rgba(255,65,0,.45)'; cx.lineWidth = 1.5;
      cx.setLineDash(isCut ? [4, 7] : [6, 6]); cx.lineDashOffset = isCut ? 0 : -T * .03; line(et, mtop);
      cx.setLineDash([3, 6]); cx.lineDashOffset = 0; cx.strokeStyle = 'rgba(245,165,36,.28)'; cx.lineWidth = 1.3;
      for (const [a, b] of EDGES) line(P(WX(nodes[a].x), 58, WZ(nodes[a].y)), P(WX(nodes[b].x), 58, WZ(nodes[b].y)));
      const port = P(PORT.X, PORT.Y, PORT.Z);
      for (const g of GATES) {
        const n = nodes[g];
        cx.strokeStyle = isCut ? 'rgba(239,68,68,.6)' : 'rgba(138,180,248,.65)';
        cx.setLineDash(isCut ? [4, 7] : [6, 6]); cx.lineDashOffset = isCut ? 0 : -T * .03; cx.lineWidth = 1.6;
        line(P(WX(n.x), 58, WZ(n.y)), port);
      }
      cx.setLineDash([]); cx.lineDashOffset = 0;
      if (isCut) {
        if (!et.behind && !mtop.behind) text('✕ CLOUD LINK CUT', (et.x + mtop.x) / 2, (et.y + mtop.y) / 2 - 8, K.red, 10.5, 600, 'center');
        const a = P(WX(nodes[4].x), 58, WZ(nodes[4].y));
        if (!a.behind && !port.behind) text('✕ CITY LINK CUT', (a.x + port.x) / 2, (a.y + port.y) / 2 - 10, K.red, 10.5, 600, 'center');
      }

      // the offline buffer, stacking on the edge device
      const shown = Math.min(buf, 16);
      for (let i = 0; i < shown; i++) {
        const p = P(EDGE.x - 7.5 + (i % 4) * 5, 16 + Math.floor(i / 4) * 5, EDGE.z); if (p.behind) continue;
        const r = 2.1 * p.s; cx.fillStyle = K.safety; cx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
        cx.strokeStyle = '#0E0F13'; cx.lineWidth = 1; cx.strokeRect(p.x - r, p.y - r, r * 2, r * 2);
      }

      // labels
      label('WORKSITE · AEGIS', -728, 64, -134, '#D7DBE4', 11);
      label('UPLINK MAST', MAST.x, MAST.h + 18, MAST.z, K.mute, 10);
      label('STREET · PORCHLIGHT', WX(357), 104, -150, '#D7DBE4', 11);
      cx.globalAlpha = isCut ? .5 : 1; label('CITY HALL', 370 + SX, 104, 0, K.moon, 11); cx.globalAlpha = 1;
      if (close) {
        label('HAZARD ZONE · PPE REQUIRED', ZONE.x0 + 4, 44, ZONE.z0, 'rgba(255,65,0,.9)', 9.5, 'left');
        label('EDGE · QNX · PI 5', EDGE.x, 0, EDGE.z + 20, K.safety, 9);
        label(hot ? (T - relayT > 350 ? 'RELAY P30 · VOICE P8' : 'RELAY P30 FIRED') : 'RELAY', SIREN.x, 48, SIREN.z, hot ? K.red : K.mute, 9);
        if (buf > 0) label('OFFLINE BUFFER ' + buf, EDGE.x, 16 + Math.ceil(shown / 4) * 5 + 10, EDGE.z, K.safety, 9);
      }
      if (mid) {
        for (const n of nodes) label('NODE', WX(n.x), 72, WZ(n.y), K.amber, 9.5);
        for (const bk of beacons) {
          const lb = bk.state === 'calling' ? ['CALL FOR HELP', K.red] : bk.state === 'acked' ? ['HEARD BY A NODE', K.amber]
                   : bk.state === 'helped' ? ['ON MY WAY', K.green] : [bk.name + ' · BEACON', K.mute];
          label(lb[0], WX(bk.x), 72, WZ(bk.y), lb[1], 9.5);
        }
      }
      for (const bk of beacons) {
        const led = P(WX(bk.x) + 14, 9, doorZ(bk.y)); if (led.behind) continue;
        const col = bk.state === 'calling' ? K.red : bk.state === 'acked' ? K.amber : bk.state === 'helped' ? K.green : K.dim;
        if (bk.state !== 'idle') { cx.fillStyle = col; cx.globalAlpha = .3; cx.beginPath(); cx.arc(led.x, led.y, 9 * led.s, 0, TAU); cx.fill(); cx.globalAlpha = 1; }
        cx.fillStyle = col; cx.beginPath(); cx.arc(led.x, led.y, 3.6 * led.s, 0, TAU); cx.fill();
      }

      // neighbours on their way
      for (const w of walkers) {
        const k = Math.min(1, (T - w.t0) / w.dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const ax = WX(w.from.x), az = doorZ(w.from.y), bx = WX(w.to.x) + 14, bz = doorZ(w.to.y);
        const X = ax + (bx - ax) * e, Z = az + (bz - az) * e, p = P(X, 5 + Math.abs(Math.sin(T * .012)) * 2, Z);
        groundGlow(P(X, 0, Z), 14, '245,165,36', .35);
        if (!p.behind) { cx.fillStyle = K.amber; cx.beginPath(); cx.arc(p.x, p.y, 4 * p.s, 0, TAU); cx.fill(); }
      }

      // messages in flight, arcing over the town
      for (const pk of packets) {
        const k = (T - pk.t0) / pk.dur; if (k < 0) continue;
        const col = pk.kind === 'ble' ? K.red : pk.kind === 'up' ? K.moon : pk.kind === 'ae' ? K.safety : K.amber;
        cx.strokeStyle = col; cx.lineWidth = 2; cx.globalAlpha = .45; cx.beginPath();
        for (let j = 0; j <= 5; j++) { const q = at3(pk, Math.max(0, Math.min(1, k) - .14 + j * .028)), s = P(q.X, q.Y, q.Z); j ? cx.lineTo(s.x, s.y) : cx.moveTo(s.x, s.y); }
        cx.stroke(); cx.globalAlpha = 1;
        const q = at3(pk, Math.min(1, k)), s = P(q.X, q.Y, q.Z);
        if (!s.behind) { cx.fillStyle = col; cx.beginPath(); cx.arc(s.x, s.y, 3.6 * s.s, 0, TAU); cx.fill(); }
      }
      for (const m of marks) {
        const k = (T - m.t0) / 700, p = P(m.X, m.Y, m.Z), r = 5 * p.s; if (p.behind) continue;
        cx.strokeStyle = 'rgba(156,163,175,' + (1 - k).toFixed(2) + ')'; cx.lineWidth = 2;
        cx.beginPath(); cx.moveTo(p.x - r, p.y - r); cx.lineTo(p.x + r, p.y + r); cx.moveTo(p.x + r, p.y - r); cx.lineTo(p.x - r, p.y + r); cx.stroke();
      }

      // the storm, blowing west to east across the whole town
      cx.strokeStyle = 'rgba(138,180,248,.12)'; cx.lineWidth = 1;
      for (const r of rain) line(P(r.x, r.y, r.z), P(r.x + 3, r.y + 10, r.z));

      // heads-up text
      const moving = fly && !fly.intro;
      text(moving ? 'IN TRANSIT ACROSS TOWN' : cam === 'pl' ? 'CAM-02 · STREET · GRID DOWN · NO INTERNET · NO CELL' : 'CAM-01 · WORKSITE · STORM OVERHEAD', 16, 24, moving ? K.amber : K.mute, 10);
      text(grab ? 'ORBITING' : 'DRAG TO ORBIT', W - 16, 24, grab ? K.amber : K.mute, 10, 600, 'right');
      const hud = [];
      if (cam === 'pl') {
        if (last) {
          hud.push(['LAST · ' + last.name + ' · ' + last.hops + ' HOPS', K.text]);
          hud.push(last.held >= 1000 ? ['HELD ' + (last.held / 1000).toFixed(1) + ' s ON THE STREET', K.amber] : ['NO WAIT · LINK WAS UP', K.mute]);
        }
        if (longest >= 1000) hud.push(['LONGEST WAIT ' + (longest / 1000).toFixed(1) + ' s', K.amber]);
        hud.push([dupes + ' DUPLICATES DISCARDED', K.mute]);
      } else {
        hud.push(['SAFETY LOOP · 0 NETWORK DEPENDENCIES', K.text]);
        hud.push(isCut ? ['CLOUD LINK CUT · LOOP UNAFFECTED', K.amber] : ['EVENTS UPLINK ASYNC · NEVER BLOCK', K.mute]);
      }
      hud.forEach(([s, c], i) => text(s, W - 16, H - 22 - (hud.length - 1 - i) * 15, c, 9.5, 600, 'right'));
      const L = cam === 'pl'
        ? [['CALL · BLUETOOTH', K.red], ['GOSSIP · NODE TO NODE', K.amber], ['UPLINK · TO CITY', K.moon], ['DROPPED, RESENT', '#9CA3AF']]
        : [['PPE ✓', K.green], ['NO HELMET', K.warn], ['VIOLATION', K.red], ['EVENT · TO CLOUD', K.safety]];
      let lx = 16;
      for (const [s, c] of L) { cx.fillStyle = c; cx.beginPath(); cx.arc(lx + 4, H - 26, 3.5, 0, TAU); cx.fill(); text(s, lx + 14, H - 22, K.mute, 9.5, 400); lx += 14 + s.length * 6 + 22; }

      // readouts, both systems, always live
      const voice = hot && T - relayT > 350;
      put(ae.state, hot ? (voice ? 'ALARM + VOICE (P8)' : 'ALARM') : 'SAFE', hot ? 'v alarm' : 'v safe');
      put(ae.relay, hot ? 'FIRED (P30)' : 'IDLE', hot ? 'v alarm' : 'v');
      put(ae.sent, String(sent), 'v orange');
      put(ae.buf, String(buf), 'v' + (buf > 0 ? ' warn' : ''));
      if (shell) shell.classList.toggle('alarm-flash', hot && cam === 'aegis');
      const held = [...events.values()].filter(e => !e.delivered).length;
      put(pl.link, isCut ? 'CUT · HOLDING' : 'LIVE', isCut ? 'v warn' : 'v safe');
      put(pl.held, String(held), 'v' + (held && isCut ? ' warn' : ''));
      put(pl.del, String(city.size), 'v orange');
      put(pl.lost, '0 OF ' + calls, 'v safe');
      put(pl.drop, String(drops));
    }
    function put(node, txt, cls) {
      if (!node) return;
      if (node.textContent !== txt) node.textContent = txt;
      if (cls && node.className !== cls) node.className = cls;
    }

    function step(dt) {
      T += dt;
      stepAegis(dt); stepStreet(); stepPackets();
      for (const r of rain) { r.y -= r.v * dt; r.x += r.v * dt * .3; if (r.y < 0) { r.y = 170; r.x = -960 + Math.random() * 1680; r.z = -170 + Math.random() * 340; } }
      if (!reduced) stepCamera(dt);
    }

    // orbit: drag sideways to turn the town, up and down to tilt it
    cv.addEventListener('pointerdown', e => { grab = { x: e.clientX, y: e.clientY, yaw: yawOff, pitch: pitchOff }; if (fly) fly.oy = undefined; cv.setPointerCapture(e.pointerId); cv.classList.add('grabbing'); });
    cv.addEventListener('pointermove', e => {
      if (!grab) return;
      yawOff = grab.yaw + (e.clientX - grab.x) * .005;
      pitchOff = clamp(grab.pitch + (e.clientY - grab.y) * .004, -.34, .5);
      if (!running) draw();
    });
    const release = () => { if (!grab) return; grab = null; idleFrom = T + 2600; cv.classList.remove('grabbing'); if (!running) draw(); };
    cv.addEventListener('pointerup', release); cv.addEventListener('pointercancel', release);

    let visible = false, running = false, lastT = 0;
    function frame(now) {
      if (!visible) { running = false; return; }
      const dt = Math.min(50, lastT ? now - lastT : 16); lastT = now;
      step(dt); draw();
      requestAnimationFrame(frame);
    }
    if (reduced) {
      for (let i = 0; i < 700; i++) step(16);     // about 11 s of simulated time, then one still frame
      new MutationObserver(draw).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    } else {
      new IntersectionObserver(es => es.forEach(e => {
        visible = e.isIntersecting;
        if (visible && !running) { running = true; lastT = 0; requestAnimationFrame(frame); }
      }), { threshold: .15 }).observe(cv);
    }
    draw();

    // two cameras over one town
    const tabs = [...document.querySelectorAll('.sim-tab')], simName = $('#simName');
    function pick(which) {
      tabs.forEach(b => { const on = b.dataset.sim === which; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
      document.querySelectorAll('[data-cam]').forEach(p => p.classList.toggle('is-off', p.dataset.cam !== which));
      if (simName) simName.textContent = which === 'pl' ? 'Porchlight' : 'AEGIS';
      if (which !== cam) flyTo(which);
      if (reduced) draw();
    }
    tabs.forEach((b, i) => {
      b.addEventListener('click', () => { const was = cam; pick(b.dataset.sim); if (was !== cam) logLine('<b>' + (cam === 'pl' ? 'CAM-02 · STREET' : 'CAM-01 · WORKSITE') + '</b>: flying across town'); });
      b.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault(); const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); n.click();
      });
    });
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
      ['Run the live AEGIS simulation', 'GO', () => { const t = document.getElementById('tabAegis'); if (t) t.click(); location.hash = '#sim-sec'; }],
      ['Run the Porchlight simulation (cut the uplink, lose nothing)', 'GO', () => { const t = document.getElementById('tabPl'); if (t) t.click(); location.hash = '#sim-sec'; }],
      ['Cut the uplink (simulate outage)', 'TOGGLE', () => kill.click()],
      ['Read the AEGIS engineering log', 'GK-002', () => location.href = 'aegis.html'],
      ['Read the Mayfly Guest log (microVM restore)', 'GK-003', () => location.href = 'mayfly.html'],
      ['Read the Plumbline log (transparency log)', 'GK-004', () => location.href = 'plumbline.html'],
      ['Read the label-to-lab log (a study that failed)', 'GK-005', () => location.href = 'labtolab.html'],
      ['Read the Vernier log (temperature 0 is not deterministic)', 'GK-006', () => location.href = 'vernier.html'],
      ['Read the Cairn log (when a robot is confidently lost)', 'GK-007', () => location.href = 'cairn.html'],
      ['Read the assay-gpu log (a detector that failed its own bar)', 'GK-008', () => location.href = 'assay.html'],
      ['Read the LADING log (it failed three times)', 'GK-009', () => location.href = 'lading.html'],
      ['Read the mcp-pin log (the tool you approved is not the tool you are running)', 'GK-011', () => location.href = 'mcppin.html'],
      ['Read the Takehome log (the CRA disagrees with the CRA)', 'GK-012', () => location.href = 'takehome.html'],
      ['Open the Takehome payroll calculator', 'LIVE', () => open('https://takehome.gautamkhosla.com', '_blank', 'noopener')],
      ['Read the PLIMSOLL log (how many times did you run it?)', 'GK-010', () => location.href = 'plimsoll.html'],
      ['Paper 1 \u00b7 Calibrating the Checksum (DOI)', 'PAPER', () => open('https://doi.org/10.5281/zenodo.22054179', '_blank', 'noopener')],
      ['Paper 2 \u00b7 Binary Grounded VEX Clearance (DOI)', 'PAPER', () => open('https://doi.org/10.5281/zenodo.22099794', '_blank', 'noopener')],
      ['Spec \u00b7 PLIMSOLL pre-registration v1 (DOI)', 'SPEC', () => open('https://doi.org/10.5281/zenodo.22107451', '_blank', 'noopener')],
      ['Paper 3 \u00b7 Confident Where People Disagree (DOI)', 'PAPER', () => open('https://doi.org/10.5281/zenodo.22971491', '_blank', 'noopener')],
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
  const CH = '#/\\|_=<>[]{}01';
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
