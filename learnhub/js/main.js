// Menu toggle
const btn = document.querySelector('.menu-btn');
const list = document.querySelector('nav ul');
if (btn) btn.onclick = () => list.classList.toggle('open');

// Scroll reveal
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
}, { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Animated network background (matches the theme)
const cv = document.getElementById('bg');
if (cv) {
  const ctx = cv.getContext('2d');
  let W, H, pts = [];
  const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  resize(); addEventListener('resize', resize);
  const N = innerWidth < 700 ? 35 : 70;
  for (let i = 0; i < N; i++)
    pts.push({ x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-.5)*.6, vy: (Math.random()-.5)*.6 });
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 7);
      ctx.fillStyle = 'rgba(150,180,255,.7)'; ctx.fill();
    });
    for (let i = 0; i < N; i++) for (let j = i+1; j < N; j++) {
      const d = Math.hypot(pts[i].x-pts[j].x, pts[i].y-pts[j].y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(120,150,255,${1 - d/130})`;
        ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  })();
}

// Count-up numbers
document.querySelectorAll('[data-count]').forEach(el => {
  const o = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    const end = +el.dataset.count; let n = 0;
    const t = setInterval(() => {
      n += Math.ceil(end / 40);
      if (n >= end) { n = end; clearInterval(t); }
      el.textContent = n + '+';
    }, 30);
    o.disconnect();
  });
  o.observe(el);
});

// ===== LESSON PAGES =====
// Auto sidebar + scroll-spy
const topics = [...document.querySelectorAll('.topic[id]')];
const side = document.getElementById('side');
if (side) {
  side.innerHTML = '<h4>Topics</h4>' + topics.map((t, i) =>
    `<a href="#${t.id}">${i + 1}. ${t.querySelector('h2').textContent}</a>`).join('');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) side.querySelectorAll('a').forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-30% 0px -60% 0px' });
  topics.forEach(t => spy.observe(t));
}

// Reading progress bar
const bar = document.getElementById('progress');
if (bar) addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
});

// ---------- OSI MODEL ----------
const OSI = [
  { n:7, name:'Application',  pdu:'Data',    job:'Gives network services to the apps you use.', proto:'HTTP, FTP, SMTP, DNS', ex:'Chrome asks for a web page.' },
  { n:6, name:'Presentation', pdu:'Data',    job:'Translates, encrypts and compresses data.', proto:'SSL/TLS, JPEG, ASCII', ex:'Your message is encrypted.' },
  { n:5, name:'Session',      pdu:'Data',    job:'Starts, manages and ends a conversation.', proto:'NetBIOS, RPC', ex:'Keeps a video call connected.' },
  { n:4, name:'Transport',    pdu:'Segment', job:'Splits data into pieces, adds port numbers, ensures delivery.', proto:'TCP, UDP', ex:'A file is split into numbered segments.' },
  { n:3, name:'Network',      pdu:'Packet',  job:'Adds IP addresses and finds the best path (routing).', proto:'IP, ICMP, Routers', ex:'A router picks the next hop.' },
  { n:2, name:'Data Link',    pdu:'Frame',   job:'Adds MAC addresses, delivers inside one network, detects errors.', proto:'Ethernet, Switch, ARP', ex:'A switch sends the frame to the right device.' },
  { n:1, name:'Physical',     pdu:'Bits',    job:'Sends raw 0s and 1s as electrical, light or radio signals.', proto:'Cables, Wi-Fi, Hub', ex:'Signals travel through the cable.' }
];
const stack = document.getElementById('osi-stack');
const info = document.getElementById('osi-info');
if (stack) {
  stack.innerHTML = OSI.map(l => `<div class="layer" data-n="${l.n}"><span>${l.n}. ${l.name}</span><span>${l.pdu}</span></div>`).join('');
  const show = n => {
    const l = OSI.find(x => x.n === n);
    stack.querySelectorAll('.layer').forEach(el => el.classList.toggle('on', +el.dataset.n === n));
    info.innerHTML = `<h4>Layer ${l.n}: ${l.name}</h4><p><b>Job:</b> ${l.job}</p><p><b>Data unit:</b> ${l.pdu}</p><p><b>Protocols/Devices:</b> ${l.proto}</p><p><b>Example:</b> ${l.ex}</p>`;
  };
  stack.onclick = e => { const el = e.target.closest('.layer'); if (el) show(+el.dataset.n); };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  window.sendOSI = async () => {
    for (let n = 7; n >= 1; n--) { show(n); info.innerHTML += `<p>⬇️ <b>Sender:</b> layer ${n} adds its header. Data is now a <b>${OSI.find(x=>x.n===n).pdu}</b>.</p>`; await sleep(900); }
    for (let n = 1; n <= 7; n++) { show(n); info.innerHTML += `<p>⬆️ <b>Receiver:</b> layer ${n} removes its header and passes data up.</p>`; await sleep(900); }
  };
  show(7);
}

// ---------- TCP 3-WAY HANDSHAKE ----------
const HS = [
  ['c2s', '1️⃣ SYN →', '"Hi server, I want to talk. My starting number is 100."'],
  ['s2c', '← 2️⃣ SYN + ACK', '"Hi client, I am ready. My number is 300. I got your 100."'],
  ['c2s', '3️⃣ ACK →', '"Great, I got your 300. Connection is open!"'],
  ['c2s', '📦 DATA →', 'Now real data starts flowing safely.']
];
let hsStep = 0;
window.nextHS = () => {
  const box = document.getElementById('hs-box');
  if (!box) return;
  if (hsStep >= HS.length) { box.innerHTML = ''; hsStep = 0; return; }
  const [dir, title, text] = HS[hsStep++];
  box.innerHTML += `<div class="msg ${dir}"><b>${title}</b><br>${text}</div>`;
  document.getElementById('hs-btn').textContent = hsStep >= HS.length ? '↺ Restart' : 'Next Step ▶';
};

// ---------- SUBNET CALCULATOR ----------
window.calcSubnet = () => {
  const out = document.getElementById('sn-out');
  const ip = document.getElementById('ip').value.trim().split('.').map(Number);
  const c = +document.getElementById('cidr').value;
  if (ip.length !== 4 || ip.some(x => isNaN(x) || x < 0 || x > 255) || isNaN(c) || c < 0 || c > 32) {
    out.innerHTML = '⚠️ Enter a valid IP (like 192.168.1.10) and CIDR between 0 and 32.'; return;
  }
  const toInt = a => ((a[0] << 24) | (a[1] << 16) | (a[2] << 8) | a[3]) >>> 0;
  const toIp = n => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  const mask = c === 0 ? 0 : (0xFFFFFFFF << (32 - c)) >>> 0;
  const net = (toInt(ip) & mask) >>> 0;
  const bc = (net | (~mask >>> 0)) >>> 0;
  const hosts = c >= 31 ? (c === 32 ? 1 : 2) : Math.pow(2, 32 - c) - 2;
  const first = c >= 31 ? net : net + 1, last = c >= 31 ? bc : bc - 1;
  out.innerHTML = `<b>Subnet Mask:</b> ${toIp(mask)}<br><b>Network Address:</b> ${toIp(net)}<br>
    <b>Broadcast Address:</b> ${toIp(bc)}<br><b>First Host:</b> ${toIp(first)}<br>
    <b>Last Host:</b> ${toIp(last)}<br><b>Usable Hosts:</b> ${hosts.toLocaleString()}`;
};
if (document.getElementById('sn-out')) calcSubnet();

// ===================== OS PAGE =====================

// ---------- Process state machine ----------
const STATES = ['New','Ready','Running','Waiting','Terminated'];
const STDESC = {
  New:'Process is being created',
  Ready:'Waiting in queue for the CPU',
  Running:'Instructions are executing',
  Waiting:'Waiting for I/O or an event',
  Terminated:'Finished execution'
};
const TRANS = {
  New:{'Admit':'Ready'},
  Ready:{'Dispatch':'Running'},
  Running:{'Timeout':'Ready','I/O request':'Waiting','Exit':'Terminated'},
  Waiting:{'I/O done':'Ready'},
  Terminated:{'Restart':'New'}
};
let curState = 'New';
function drawStates() {
  const box = document.getElementById('st-box');
  if (!box) return;
  box.innerHTML = STATES.map(s => `<div class="st ${s === curState ? 'on' : ''}">${s}<small>${STDESC[s]}</small></div>`).join('');
  const acts = document.getElementById('st-acts');
  const all = ['Admit','Dispatch','Timeout','I/O request','I/O done','Exit','Restart'];
  acts.innerHTML = all.map(a => `<button class="btn2" ${TRANS[curState][a] ? '' : 'disabled'} onclick="goState('${a}')">${a}</button>`).join('');
}
window.goState = a => { curState = TRANS[curState][a]; drawStates(); };
drawStates();

// ---------- CPU Scheduling Simulator ----------
const COLORS = ['#38bdf8','#a78bfa','#34d399','#fbbf24','#f472b6','#fb923c','#60a5fa','#4ade80'];
window.runSched = () => {
  const out = document.getElementById('sc-out');
  const P = document.getElementById('sc-in').value.trim().split('\n')
    .map(l => l.trim().split(/[\s,]+/)).filter(r => r.length >= 3)
    .map(r => ({ n: r[0], at: +r[1], bt: +r[2], rem: +r[2], ct: 0 }));
  if (!P.length || P.some(p => isNaN(p.at) || isNaN(p.bt) || p.bt <= 0)) {
    out.innerHTML = '⚠️ Enter lines like: <code>P1 0 5</code> (name arrival burst)'; return;
  }
  const algo = document.getElementById('sc-algo').value;
  const q = Math.max(1, +document.getElementById('sc-q').value || 2);
  let t = 0, done = 0; const segs = [];
  const add = (n, s, e) => {
    const l = segs[segs.length - 1];
    if (l && l.n === n && l.e === s) l.e = e; else segs.push({ n, s, e });
  };

  if (algo === 'rr') {
    const queue = [], seen = new Set();
    const arrive = () => P.filter(p => p.at <= t && !seen.has(p)).sort((a, b) => a.at - b.at)
      .forEach(p => { seen.add(p); queue.push(p); });
    arrive();
    while (done < P.length) {
      if (!queue.length) { add('Idle', t, t + 1); t++; arrive(); continue; }
      const p = queue.shift(), run = Math.min(q, p.rem);
      for (let i = 0; i < run; i++) { add(p.n, t, t + 1); t++; p.rem--; arrive(); }
      if (p.rem > 0) queue.push(p); else { p.ct = t; done++; }
    }
  } else {
    while (done < P.length) {
      const ready = P.filter(p => p.at <= t && p.rem > 0);
      if (!ready.length) { add('Idle', t, t + 1); t++; continue; }
      const p = algo === 'fcfs'
        ? ready.sort((a, b) => a.at - b.at)[0]
        : ready.sort((a, b) => a.rem - b.rem || a.at - b.at)[0];
      if (algo === 'fcfs' || algo === 'sjf') { add(p.n, t, t + p.rem); t += p.rem; p.rem = 0; }
      else { add(p.n, t, t + 1); t++; p.rem--; }
      if (p.rem === 0) { p.ct = t; done++; }
    }
  }

  const colorOf = n => COLORS[P.findIndex(p => p.n === n) % COLORS.length];
  const gantt = segs.map((s, i) => {
    const w = (s.e - s.s) * 38;
    const cls = s.n === 'Idle' ? 'gb idle' : 'gb';
    const bg = s.n === 'Idle' ? '' : `background:${colorOf(s.n)};`;
    const last = i === segs.length - 1 ? `<span class="last">${s.e}</span>` : '';
    return `<div class="${cls}" style="width:${w}px;${bg}animation-delay:${i * .12}s">${s.n}<span>${s.s}</span>${last}</div>`;
  }).join('');

  let totW = 0, totT = 0;
  const rows = P.map(p => {
    const tat = p.ct - p.at, wt = tat - p.bt; totW += wt; totT += tat;
    return `<tr><td>${p.n}</td><td>${p.at}</td><td>${p.bt}</td><td>${p.ct}</td><td>${tat}</td><td>${wt}</td></tr>`;
  }).join('');
  out.innerHTML = `<div class="gantt">${gantt}</div>
    <div class="tbl"><table><tr><th>Process</th><th>Arrival</th><th>Burst</th><th>Completion</th><th>Turnaround</th><th>Waiting</th></tr>${rows}</table></div>
    <p class="stat-line">Average Waiting Time = ${(totW / P.length).toFixed(2)} &nbsp;|&nbsp; Average Turnaround Time = ${(totT / P.length).toFixed(2)}</p>`;
};
if (document.getElementById('sc-out')) runSched();

// ---------- Deadlock stepper ----------
const DL = [
  ['c2s', 'Step 1: P1 locks R1', 'P1 holds Printer (R1).'],
  ['s2c', 'Step 2: P2 locks R2', 'P2 holds Scanner (R2).'],
  ['c2s', 'Step 3: P1 requests R2', 'Scanner is busy with P2, so P1 waits...'],
  ['s2c', 'Step 4: P2 requests R1', 'Printer is busy with P1, so P2 waits...'],
  ['c2s', '💀 DEADLOCK!', 'P1 waits for P2, P2 waits for P1. Nobody can ever move forward.']
];
let dlStep = 0;
window.nextDL = () => {
  const box = document.getElementById('dl-box'); if (!box) return;
  if (dlStep >= DL.length) { box.innerHTML = ''; dlStep = 0; }
  const [dir, title, text] = DL[dlStep++];
  box.innerHTML += `<div class="msg ${dir}"><b>${title}</b><br>${text}</div>`;
  document.getElementById('dl-btn').textContent = dlStep >= DL.length ? '↺ Restart' : 'Next Step ▶';
};

// ---------- Page Replacement Simulator ----------
window.runPR = () => {
  const out = document.getElementById('pr-out');
  const refs = document.getElementById('pr-in').value.trim().split(/[\s,]+/).map(Number);
  const F = +document.getElementById('pr-f').value;
  const algo = document.getElementById('pr-algo').value;
  if (!refs.length || refs.some(isNaN) || !(F >= 1 && F <= 8)) { out.innerHTML = '⚠️ Enter numbers like <code>7 0 1 2 0 3</code> and frames 1 to 8.'; return; }
  let frames = [], faults = 0, hits = 0, cols = '';
  refs.forEach((pg, i) => {
    const idx = frames.findIndex(f => f.p === pg);
    let isHit = idx !== -1, newSlot = -1;
    if (isHit) { frames[idx].last = i; hits++; }
    else {
      faults++;
      if (frames.length < F) { frames.push({ p: pg, loaded: i, last: i }); newSlot = frames.length - 1; }
      else {
        let v = 0;
        if (algo === 'fifo') v = frames.reduce((b, f, k) => f.loaded < frames[b].loaded ? k : b, 0);
        else if (algo === 'lru') v = frames.reduce((b, f, k) => f.last < frames[b].last ? k : b, 0);
        else {
          let far = -1;
          frames.forEach((f, k) => {
            const nx = refs.indexOf(f.p, i + 1);
            const d = nx === -1 ? Infinity : nx;
            if (d > far) { far = d; v = k; }
          });
        }
        frames[v] = { p: pg, loaded: i, last: i }; newSlot = v;
      }
    }
    const slots = Array.from({ length: F }, (_, k) =>
      `<div class="fr ${k === newSlot ? 'new' : ''}">${frames[k] ? frames[k].p : ''}</div>`).join('');
    cols += `<div class="pc" style="animation-delay:${i * .07}s"><div class="ref">${pg}</div>${slots}<div class="res ${isHit ? 'hit' : 'flt'}">${isHit ? 'HIT' : 'FAULT'}</div></div>`;
  });
  out.innerHTML = `<div class="pr">${cols}</div>
    <p class="stat-line">Page Faults: ${faults} &nbsp;|&nbsp; Hits: ${hits} &nbsp;|&nbsp; Hit Ratio: ${(hits / refs.length * 100).toFixed(1)}%</p>`;
};
if (document.getElementById('pr-out')) runPR();

// ===================== DBMS PAGE =====================
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const dsleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- Sample database ----------
const DB = {
  students: [
    { id:1, name:'Aarav',  dept_id:1,    marks:88, city:'Delhi'   },
    { id:2, name:'Priya',  dept_id:2,    marks:92, city:'Mumbai'  },
    { id:3, name:'Rohan',  dept_id:1,    marks:67, city:'Pune'    },
    { id:4, name:'Sneha',  dept_id:3,    marks:75, city:'Delhi'   },
    { id:5, name:'Karan',  dept_id:2,    marks:58, city:'Chennai' },
    { id:6, name:'Meera',  dept_id:1,    marks:95, city:'Mumbai'  },
    { id:7, name:'Vikram', dept_id:3,    marks:81, city:'Pune'    },
    { id:8, name:'Isha',   dept_id:null, marks:70, city:'Delhi'   }
  ],
  departments: [
    { id:1, dept_name:'CSE',   hod:'Dr. Rao'  },
    { id:2, dept_name:'ECE',   hod:'Dr. Iyer' },
    { id:3, dept_name:'ME',    hod:'Dr. Khan' },
    { id:4, dept_name:'Civil', hod:'Dr. Das'  }
  ]
};

function renderDBTables() {
  const box = document.getElementById('db-tables'); if (!box) return;
  box.innerHTML = Object.keys(DB).map(t => {
    const cols = Object.keys(DB[t][0]);
    return `<div><h4 style="color:var(--c);margin-bottom:6px">${t}</h4><div class="tbl"><table>
      <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
      ${DB[t].map(r => `<tr>${cols.map(c => `<td>${r[c] === null ? '<i>NULL</i>' : r[c]}</td>`).join('')}</tr>`).join('')}
    </table></div></div>`;
  }).join('');
}

// ---------- Mini SQL engine ----------
function sqlVal(s) {
  s = s.trim();
  if (/^'.*'$/.test(s) || /^".*"$/.test(s)) return s.slice(1, -1);
  if (s !== '' && !isNaN(s)) return +s;
  throw new Error('Bad value: ' + s + ' (put text inside quotes, like \'Delhi\')');
}
function sqlGet(row, name) {
  const find = (o, c) => Object.keys(o).find(k => k.toLowerCase() === c.toLowerCase());
  if (name.includes('.')) {
    const [t, c] = name.split('.');
    const tk = find(row, t), ck = tk && find(row[tk], c);
    if (!ck) throw new Error('Unknown column: ' + name);
    return row[tk][ck];
  }
  const hits = [];
  for (const t in row) { const ck = find(row[t], name); if (ck) hits.push(row[t][ck]); }
  if (!hits.length) throw new Error('Unknown column: ' + name);
  if (hits.length > 1) throw new Error('Column "' + name + '" is ambiguous. Use table.column (example: students.id)');
  return hits[0];
}
function sqlCond(row, c) {
  c = c.trim().replace(/^\(+|\)+$/g, '').trim();
  let m = c.match(/^([\w.]+)\s+is\s+(not\s+)?null$/i);
  if (m) { const v = sqlGet(row, m[1]); const isN = v === null || v === undefined; return m[2] ? !isN : isN; }
  m = c.match(/^([\w.]+)\s*(>=|<=|!=|<>|=|>|<|like)\s*(.+)$/i);
  if (!m) throw new Error('Cannot understand condition: ' + c);
  const l = sqlGet(row, m[1]), op = m[2].toLowerCase(), r = sqlVal(m[3]);
  if (l === null || l === undefined) return false;
  if (op === 'like') {
    const re = new RegExp('^' + String(r).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
    return re.test(String(l));
  }
  switch (op) {
    case '=': return l === r;
    case '!=': case '<>': return l !== r;
    case '>': return l > r;
    case '<': return l < r;
    case '>=': return l >= r;
    case '<=': return l <= r;
  }
}
const sqlWhere = (row, w) => w.split(/\s+or\s+/i).some(g => g.split(/\s+and\s+/i).every(c => sqlCond(row, c)));

function aggCalc(agg, col, grp) {
  if (agg === 'count' && col === '*') return grp.length;
  const v = grp.map(r => sqlGet(r, col)).filter(x => x !== null && x !== undefined);
  if (agg === 'count') return v.length;
  if (!v.length) return null;
  if (agg === 'sum') return v.reduce((a, b) => a + b, 0);
  if (agg === 'avg') return Math.round(v.reduce((a, b) => a + b, 0) / v.length * 100) / 100;
  if (agg === 'min') return v.reduce((a, b) => a < b ? a : b);
  return v.reduce((a, b) => a > b ? a : b);
}

function sqlRun(q) {
  q = q.trim().replace(/;+\s*$/, '').replace(/\s+/g, ' ');
  const m = q.match(/^select (distinct )?(.+?) from (\w+)(?: (inner |left )?join (\w+) on ([\w.]+) ?= ?([\w.]+))?(?: where (.+?))?(?: group by ([\w.]+))?(?: having (.+?))?(?: order by ([\w.]+|\w+\([\w.*]+\))(?: (asc|desc))?)?(?: limit (\d+))?$/i);
  if (!m) throw new Error('Could not understand the query. Check the spelling and the order of clauses.');

  const t1 = m[3].toLowerCase();
  if (!DB[t1]) throw new Error('Unknown table: ' + m[3] + ' (available: students, departments)');
  let rows = DB[t1].map(r => ({ [t1]: r }));
  const tables = [t1];

  if (m[5]) {
    const t2 = m[5].toLowerCase();
    if (!DB[t2]) throw new Error('Unknown table: ' + m[5] + ' (available: students, departments)');
    if (t2 === t1) throw new Error('Self-joins are not supported in this playground.');
    tables.push(t2);
    const empty = {}; Object.keys(DB[t2][0]).forEach(k => empty[k] = null);
    const isLeft = /^left/i.test(m[4] || '');
    const joined = [];
    rows.forEach(r => {
      let hit = false;
      DB[t2].forEach(r2 => {
        const row = { ...r, [t2]: r2 };
        const a = sqlGet(row, m[6]), b = sqlGet(row, m[7]);
        if (a !== null && a === b) { joined.push(row); hit = true; }
      });
      if (!hit && isLeft) joined.push({ ...r, [t2]: empty });
    });
    rows = joined;
  }

  if (m[8]) rows = rows.filter(r => sqlWhere(r, m[8]));

  // select list
  let items = [];
  m[2].split(',').map(s => s.trim()).forEach(s => {
    if (s === '*') {
      tables.forEach(t => Object.keys(DB[t][0]).forEach(k =>
        items.push({ col: t + '.' + k, label: tables.length > 1 ? t + '.' + k : k })));
      return;
    }
    let a = s.match(/^(count|sum|avg|min|max)\(\s*(\*|[\w.]+)\s*\)(?: as (\w+))?$/i);
    if (a) { items.push({ agg: a[1].toLowerCase(), col: a[2], label: a[3] || s }); return; }
    a = s.match(/^([\w.]+)(?: as (\w+))?$/i);
    if (!a) throw new Error('Cannot understand column: ' + s);
    items.push({ col: a[1], label: a[2] || s });
  });

  const hasAgg = items.some(i => i.agg) || m[9];
  let out;
  if (hasAgg) {
    const groups = new Map();
    if (m[9]) rows.forEach(r => { const k = sqlGet(r, m[9]); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); });
    else groups.set('all', rows);
    out = [];
    groups.forEach(g => {
      if (m[10]) {
        const h = m[10].match(/^(count|sum|avg|min|max)\(\s*(\*|[\w.]+)\s*\)\s*(>=|<=|!=|<>|=|>|<)\s*(.+)$/i);
        if (!h) throw new Error('HAVING supports conditions like: COUNT(*) > 1');
        const v = aggCalc(h[1].toLowerCase(), h[2], g), r = sqlVal(h[4]);
        const ok = { '=': v === r, '!=': v !== r, '<>': v !== r, '>': v > r, '<': v < r, '>=': v >= r, '<=': v <= r }[h[3]];
        if (!ok) return;
      }
      const first = g[0] || {};
      out.push({ row: first, vals: items.map(i => i.agg ? aggCalc(i.agg, i.col, g) : (g.length ? sqlGet(first, i.col) : null)) });
    });
  } else {
    out = rows.map(r => ({ row: r, vals: items.map(i => sqlGet(r, i.col)) }));
  }

  if (m[1]) {
    const seen = new Set();
    out = out.filter(o => { const k = JSON.stringify(o.vals); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  if (m[11]) {
    const key = m[11].toLowerCase();
    const hi = items.findIndex(i => i.label.toLowerCase() === key);
    const kf = o => hi >= 0 ? o.vals[hi] : sqlGet(o.row, m[11]);
    const dir = (m[12] || 'asc').toLowerCase() === 'desc' ? -1 : 1;
    out.sort((a, b) => {
      const x = kf(a), y = kf(b);
      if (x === y) return 0;
      if (x === null || x === undefined) return -dir;
      if (y === null || y === undefined) return dir;
      return (x > y ? 1 : -1) * dir;
    });
  }
  if (m[13]) out = out.slice(0, +m[13]);
  return { head: items.map(i => i.label), rows: out.map(o => o.vals) };
}

window.runSQL = () => {
  const box = document.getElementById('sql-out');
  try {
    const r = sqlRun(document.getElementById('sql-in').value);
    box.innerHTML = `<div class="tbl"><table><tr>${r.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>
      ${r.rows.map(row => `<tr>${row.map(v => `<td>${v === null || v === undefined ? '<i>NULL</i>' : esc(v)}</td>`).join('')}</tr>`).join('')}
      </table></div><p class="stat-line">${r.rows.length} row(s) returned</p>`;
  } catch (e) {
    box.innerHTML = `<div class="note" style="border-color:#f87171;background:rgba(248,113,113,.1)">⚠️ ${esc(e.message)}<br>
      <small>Supported: SELECT [DISTINCT] … FROM … [INNER|LEFT] JOIN … ON … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT. Use full table names (no aliases).</small></div>`;
  }
};
const SQLS = [
  'SELECT * FROM students',
  'SELECT name, marks FROM students WHERE marks > 75 ORDER BY marks DESC',
  'SELECT city, COUNT(*) AS total, AVG(marks) AS avg_marks FROM students GROUP BY city',
  'SELECT students.name, departments.dept_name FROM students JOIN departments ON students.dept_id = departments.id',
  'SELECT departments.dept_name, students.name FROM departments LEFT JOIN students ON departments.id = students.dept_id',
  'SELECT city, COUNT(*) AS total FROM students GROUP BY city HAVING COUNT(*) > 1',
  "SELECT name FROM students WHERE city = 'Delhi' AND marks >= 70"
];
window.setSQL = i => { document.getElementById('sql-in').value = SQLS[i]; runSQL(); };

// ---------- Functional dependency / closure / normal form ----------
window.runFD = () => {
  const out = document.getElementById('fd-out');
  const split = s => s.toUpperCase().split(/[\s,]+/).filter(Boolean);
  const attrs = split(document.getElementById('fd-attrs').value);
  const fds = document.getElementById('fd-list').value.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const p = l.split(/->|→/); return p.length === 2 ? { l: split(p[0]), r: split(p[1]) } : null;
  });
  if (!attrs.length || attrs.length > 10 || !fds.length || fds.includes(null)) {
    out.innerHTML = '⚠️ Enter 1 to 10 attributes (like <code>A B C D</code>) and FDs one per line (like <code>A -> B</code>).'; return;
  }
  if (fds.some(f => [...f.l, ...f.r].some(a => !attrs.includes(a)))) {
    out.innerHTML = '⚠️ Every attribute used in an FD must be in the attribute list.'; return;
  }
  const closure = set => {
    const c = new Set(set); let ch = true;
    while (ch) {
      ch = false;
      fds.forEach(f => { if (f.l.every(a => c.has(a)) && !f.r.every(a => c.has(a))) { f.r.forEach(a => c.add(a)); ch = true; } });
    }
    return c;
  };
  const q = split(document.getElementById('fd-q').value);
  if (q.some(a => !attrs.includes(a))) { out.innerHTML = '⚠️ The closure set must use attributes from the list.'; return; }

  const n = attrs.length, keys = [];
  for (let mask = 1; mask < (1 << n); mask++) {
    const sub = attrs.filter((_, i) => mask & (1 << i));
    if (keys.some(k => k.every(a => sub.includes(a)))) continue;
    if (closure(sub).size === n) keys.push(sub);
  }
  const prime = new Set(keys.flat());
  const nonprime = attrs.filter(a => !prime.has(a));
  const isSuper = x => closure(x).size === n;

  const partial = keys.some(k => k.length > 1 && k.some((_, i) => {
    const c = closure(k.filter((_, j) => j !== i));
    return nonprime.some(a => c.has(a));
  }));
  const nontrivial = fds.map(f => ({ l: f.l, r: f.r.filter(a => !f.l.includes(a)) })).filter(f => f.r.length);
  const is3 = nontrivial.every(f => isSuper(f.l) || f.r.every(a => prime.has(a)));
  const isB = nontrivial.every(f => isSuper(f.l));
  const nf = partial ? '1NF' : !is3 ? '2NF' : !isB ? '3NF' : 'BCNF';
  const why = {
    '1NF': 'A partial dependency exists (part of a key determines a non-key attribute), so it is not in 2NF.',
    '2NF': 'No partial dependency, but a transitive dependency exists (a non-key attribute determines another non-key attribute), so it is not in 3NF.',
    '3NF': 'Every FD satisfies 3NF, but some FD has a left side that is not a super key, so it is not in BCNF.',
    'BCNF': 'In every FD X → Y, X is a super key.'
  }[nf];

  out.innerHTML = `<b>Closure of {${q.join(', ')}}⁺</b> = { ${[...closure(q)].join(', ')} }<br>
    <b>Candidate key(s):</b> ${keys.map(k => '{' + k.join(', ') + '}').join('  ·  ')}<br>
    <b>Prime attributes:</b> ${[...prime].join(', ') || 'none'} &nbsp;|&nbsp; <b>Non-prime:</b> ${nonprime.join(', ') || 'none'}<br>
    <b>Highest normal form:</b> <span style="color:var(--c);font-weight:800">${nf}</span> <small>(assuming all values are atomic)</small><br><small>${why}</small>`;
};

// ---------- Transaction animation ----------
let txBusy = false;
window.runTx = async crash => {
  if (txBusy) return; txBusy = true;
  const log = document.getElementById('tx-log'), a = document.getElementById('bal-a'), b = document.getElementById('bal-b');
  log.innerHTML = ''; a.textContent = 1000; b.textContent = 500;
  const say = (d, t, x) => { log.innerHTML += `<div class="msg ${d}"><b>${t}</b><br>${x}</div>`; };
  say('c2s', 'BEGIN', 'Transaction starts: transfer ₹200 from A to B.'); await dsleep(1000);
  say('c2s', 'Step 1: A = A − 200', 'A becomes 800 (not permanent yet).'); a.textContent = 800; await dsleep(1100);
  if (crash) {
    say('s2c', '💥 CRASH!', 'The system fails before B is credited. ₹200 has vanished!'); await dsleep(1300);
    say('s2c', '↩️ ROLLBACK (Atomicity)', 'The DBMS reads its log and undoes every change of this transaction.');
    a.textContent = 1000; b.textContent = 500; await dsleep(1000);
    say('c2s', '✅ Safe state', 'A = 1000, B = 500. Total is still 1500. All or nothing!');
  } else {
    say('s2c', 'Step 2: B = B + 200', 'B becomes 700.'); b.textContent = 700; await dsleep(1100);
    say('c2s', '✅ COMMIT', 'Changes are now permanent (Durability). Total is still 1500 (Consistency).');
  }
  txBusy = false;
};

// ---------- Index race ----------
window.runIdx = () => {
  const out = document.getElementById('ix-out');
  const t = +document.getElementById('ix-t').value, N = 64;
  if (!(t >= 1 && t <= N)) { out.innerHTML = '⚠️ Enter a number from 1 to 64.'; return; }
  const lin = []; for (let i = 1; i <= N; i++) { lin.push(i); if (i === t) break; }
  const bin = []; let lo = 1, hi = N;
  while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); bin.push(mid); if (mid === t) break; if (mid < t) lo = mid + 1; else hi = mid - 1; }
  const grid = v => {
    const ord = {}; v.forEach((x, i) => ord[x] = i);
    return Array.from({ length: N }, (_, i) => {
      const x = i + 1, o = ord[x];
      return `<div class="ix ${o !== undefined ? 'vis' : ''} ${x === t ? 'found' : ''}" ${o !== undefined ? `style="animation-delay:${o * .06}s"` : ''}>${x}</div>`;
    }).join('');
  };
  out.innerHTML = `<p><b>🐢 Without index (full table scan):</b> ${lin.length} row(s) checked</p><div class="ixg">${grid(lin)}</div>
    <p><b>⚡ With index (binary search / B+ tree):</b> ${bin.length} row(s) checked</p><div class="ixg">${grid(bin)}</div>`;
};

// ---------- Init ----------
if (document.getElementById('sql-out')) { renderDBTables(); runSQL(); }
if (document.getElementById('fd-out')) runFD();
if (document.getElementById('ix-out')) runIdx();
