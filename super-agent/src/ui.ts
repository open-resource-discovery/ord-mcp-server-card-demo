export const UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MITRA</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    :root {
      --bg: #0a0f1e;
      --surface: #111827;
      --border: #1e2d45;
      --text: #e6edf3;
      --muted: #c4d4e4;
      --green: #3fb950;
      --blue: #58a6ff;
      --red: #f85149;
      --orange: #e3b341;
      --purple: #bc8cff;
      --s1: #f85149;
      --s2: #e3b341;
      --s3: #58a6ff;
      --s4: #3fb950;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      background-image:
        radial-gradient(ellipse at 10% 5%, rgba(20,50,120,0.25) 0%, transparent 45%),
        radial-gradient(ellipse at 90% 85%, rgba(40,15,80,0.2) 0%, transparent 45%);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── Header ── */
    header {
      padding: 10px 20px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    .header-title { display: flex; align-items: center; gap: 10px; }
    .header-title h1 { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
    .header-subtitle { font-size: 11px; color: var(--muted); letter-spacing: 0.3px; margin-top: 1px; }
    .fleet-status { display: flex; gap: 6px; }
    .server-pill {
      font-size: 11px; padding: 3px 10px; border-radius: 20px;
      border: 1px solid var(--border); color: var(--muted); background: var(--surface);
      transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
    }
    .server-pill.online { border-color: #1a4a28; color: var(--green); background: rgba(63,185,80,0.07); }
    @keyframes pillFlash {
      0%   { background: rgba(63,185,80,0.07); border-color: #1a4a28; }
      40%  { background: rgba(63,185,80,0.3);  border-color: var(--green); box-shadow: 0 0 8px rgba(63,185,80,0.4); }
      100% { background: rgba(63,185,80,0.07); border-color: #1a4a28; }
    }
    .server-pill.flash { animation: pillFlash 0.8s ease; }
    .header-actions { display: flex; gap: 8px; }
    .icon-btn {
      background: var(--surface); border: 1px solid var(--border); color: var(--muted);
      padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;
      transition: border-color 0.2s, color 0.2s;
    }
    .icon-btn:hover { border-color: var(--blue); color: var(--text); }

    /* ── Stage tabs ── */
    .stage-tabs {
      display: flex; border-bottom: 1px solid var(--border);
      flex-shrink: 0; background: rgba(10,15,30,0.6);
    }
    .stage-tab {
      flex: 1; display: flex; align-items: center; gap: 10px;
      padding: 10px 16px; cursor: pointer; border: none;
      border-bottom: 2px solid transparent; background: transparent; color: var(--muted);
      transition: color 0.2s, border-color 0.2s, background 0.2s; text-align: left;
    }
    .stage-tab:not(:last-child) { border-right: 1px solid var(--border); }
    .stage-tab:hover { background: rgba(255,255,255,0.03); color: var(--text); }
    .stage-num {
      width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 12px; border: 1.5px solid currentColor;
      flex-shrink: 0; opacity: 0.5; transition: opacity 0.2s, background 0.2s;
    }
    .stage-info-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .stage-title { font-size: 12px; font-weight: 600; white-space: nowrap; }
    .stage-sub   { font-size: 10px; color: var(--muted); white-space: nowrap; }
    .stage-tab[data-stage="1"].active { color: var(--s1); border-bottom-color: var(--s1); }
    .stage-tab[data-stage="2"].active { color: var(--s2); border-bottom-color: var(--s2); }
    .stage-tab[data-stage="3"].active { color: var(--s3); border-bottom-color: var(--s3); }
    .stage-tab[data-stage="4"].active { color: var(--s4); border-bottom-color: var(--s4); }
    .stage-tab[data-stage="1"].active .stage-num { opacity: 1; background: rgba(248,81,73,0.12); }
    .stage-tab[data-stage="2"].active .stage-num { opacity: 1; background: rgba(227,179,65,0.12); }
    .stage-tab[data-stage="3"].active .stage-num { opacity: 1; background: rgba(88,166,255,0.12); }
    .stage-tab[data-stage="4"].active .stage-num { opacity: 1; background: rgba(63,185,80,0.12); }

    /* ── Mission banner ── */
    .mission-banner {
      padding: 8px 20px; background: rgba(248,81,73,0.07);
      border-bottom: 1px solid rgba(248,81,73,0.25);
      display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    .mission-label { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--red); flex-shrink: 0; }
    .mission-alerts { display: flex; gap: 8px; flex-wrap: wrap; }
    .mission-alert { font-size: 11px; color: #e8a09c; padding: 2px 10px; border-radius: 20px; border: 1px solid rgba(248,81,73,0.3); background: rgba(248,81,73,0.06); }

    /* ── Scenarios ── */
    .scenarios {
      padding: 8px 20px; display: flex; align-items: center; gap: 6px;
      border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; flex-shrink: 0;
    }
    .scenarios::-webkit-scrollbar { display: none; }
    .scenarios-label { font-size: 11px; color: var(--muted); white-space: nowrap; flex-shrink: 0; }
    .scenario-btn {
      background: var(--surface); border: 1px solid var(--border); color: var(--text);
      padding: 4px 12px; border-radius: 20px; cursor: pointer; font-size: 11px;
      transition: border-color 0.15s, background 0.15s; white-space: nowrap;
    }
    .scenario-btn:hover { border-color: var(--blue); }
    .scenario-btn.active { border-color: var(--blue); background: rgba(88,166,255,0.08); color: var(--blue); }

    /* ── 3-column layout ── */
    .main-grid {
      flex: 1; display: flex; overflow: hidden; min-height: 0;
    }

    /* ── Left panel ── */
    .left-panel {
      width: 200px; flex-shrink: 0;
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column; align-items: center;
      padding: 20px 14px 14px; gap: 10px;
      overflow-y: auto; scrollbar-width: none;
    }
    .left-panel::-webkit-scrollbar { display: none; }
    #stage-img { width: 160px; height: 160px; object-fit: contain; flex-shrink: 0; }
    .side-stage-name { font-size: 12px; font-weight: 700; color: var(--text); text-align: center; line-height: 1.4; }
    .side-stage-desc { font-size: 11px; color: var(--muted); text-align: center; line-height: 1.5; }
    .side-divider { width: 100%; border: none; border-top: 1px solid var(--border); }
    .side-flow { display: flex; flex-direction: column; align-items: center; gap: 3px; width: 100%; }
    .side-farrow { font-size: 12px; color: var(--muted); opacity: 0.5; }
    .side-fnode {
      font-size: 10px; font-weight: 600; padding: 3px 6px; border-radius: 4px;
      border: 1px solid var(--border); color: var(--muted); background: var(--surface);
      width: 100%; text-align: center; transition: all 0.3s;
    }
    .side-fnode.on  { color: var(--text); border-color: #2a3f60; background: rgba(255,255,255,0.05); }
    .side-fnode.hi  { font-weight: 700; }
    .side-fnode.s1  { color: var(--s1); border-color: rgba(248,81,73,0.4);  background: rgba(248,81,73,0.08); }
    .side-fnode.s2  { color: var(--s2); border-color: rgba(227,179,65,0.4); background: rgba(227,179,65,0.08); }
    .side-fnode.s3  { color: var(--s3); border-color: rgba(88,166,255,0.4); background: rgba(88,166,255,0.08); }
    .side-fnode.s4  { color: var(--s4); border-color: rgba(63,185,80,0.4);  background: rgba(63,185,80,0.08); }

    /* ── Middle panel ── */
    .panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
    .panel-body {
      flex: 1; overflow-y: auto; padding: 16px 24px;
      display: flex; flex-direction: column; gap: 10px; min-height: 0;
    }
    .panel-body::-webkit-scrollbar { width: 4px; }
    .panel-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
    .panel-footer {
      padding: 12px 20px; border-top: 1px solid var(--border);
      display: flex; gap: 8px; background: rgba(10,15,30,0.8); flex-shrink: 0;
    }
    .empty-state {
      flex: 1; display: flex; align-items: center; justify-content: center;
      color: var(--muted); padding: 32px;
    }
    .empty-caption { font-size: 13px; text-align: center; line-height: 1.6; max-width: 280px; }
    .empty-caption strong { display: block; margin-bottom: 4px; font-size: 15px; color: var(--text); }

    /* ── Resize handle ── */
    .resize-handle {
      width: 4px; flex-shrink: 0; cursor: col-resize;
      background: var(--border);
      transition: background 0.15s;
    }
    .resize-handle:hover, .resize-handle.dragging { background: var(--blue); }

    /* ── Right panel ── */
    .right-panel {
      width: 280px; flex-shrink: 0;
      display: flex; flex-direction: column; overflow: hidden; min-height: 0;
    }
    .activity-header {
      padding: 7px 12px; font-size: 10px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; color: var(--muted);
      border-bottom: 1px solid var(--border); border-left: 1px solid var(--border); flex-shrink: 0;
    }
    .activity-body {
      flex: 1; overflow-y: auto; padding: 8px 10px; border-left: 1px solid var(--border);
      display: flex; flex-direction: column; gap: 6px; min-height: 0;
    }
    .activity-body::-webkit-scrollbar { width: 3px; }
    .activity-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
    .activity-empty {
      font-size: 11px; color: var(--muted); font-style: italic;
      padding: 12px 4px; text-align: center; opacity: 0.6;
    }

    /* ── Steps ── */
    .step {
      display: flex; gap: 8px; align-items: flex-start;
      animation: fadeUp 0.22s ease both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .step-icon    { font-size: 14px; flex-shrink: 0; line-height: 1.5; }
    .step-content { flex: 1; min-width: 0; }
    .step-meta    { font-size: 10px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 3px; }
    .step-text    { font-size: 12px; line-height: 1.5; word-break: break-word; }

    .step.thinking .step-meta { color: var(--muted); }
    .step.thinking .step-text { color: var(--muted); font-style: italic; }

    .step.tool_call .step-meta { color: var(--blue); }
    .step.tool_call .step-text {
      color: var(--blue); font-family: 'SF Mono', Consolas, monospace; font-size: 11px;
      background: rgba(88,166,255,0.06); padding: 5px 8px;
      border-radius: 4px; border-left: 2px solid var(--blue);
    }
    .step.tool_result .step-meta { color: var(--green); }
    .step.tool_result .step-text {
      color: #9ab5cc; font-family: 'SF Mono', Consolas, monospace; font-size: 11px;
      background: rgba(63,185,80,0.04); padding: 5px 8px;
      border-radius: 4px; border-left: 2px solid var(--green);
      white-space: pre-wrap; max-height: 120px; overflow-y: auto;
    }
    .step.answer .step-meta { color: var(--orange); }
    .step.answer .step-text {
      color: var(--text); font-size: 14px;
      background: rgba(17,24,39,0.8); padding: 12px 14px;
      border-radius: 6px; border: 1px solid var(--border); line-height: 1.7;
    }
    .step.answer .step-text h1,
    .step.answer .step-text h2,
    .step.answer .step-text h3 { font-size: 13px; font-weight: 700; color: var(--text); margin: 10px 0 4px; }
    .step.answer .step-text h1:first-child,
    .step.answer .step-text h2:first-child,
    .step.answer .step-text h3:first-child { margin-top: 0; }
    .step.answer .step-text p { margin: 0 0 8px; }
    .step.answer .step-text p:last-child { margin-bottom: 0; }
    .step.answer .step-text ul, .step.answer .step-text ol { margin: 4px 0 8px 18px; }
    .step.answer .step-text li { margin-bottom: 3px; }
    .step.answer .step-text hr { border: none; border-top: 1px solid var(--border); margin: 10px 0; }
    .step.answer .step-text strong { color: var(--text); font-weight: 700; }
    .step.answer .step-text code {
      font-family: 'SF Mono', Consolas, monospace; font-size: 12px;
      background: rgba(88,166,255,0.08); padding: 1px 5px; border-radius: 3px;
    }
    .step.answer.blind .step-text {
      color: var(--muted); background: rgba(248,81,73,0.04);
      border-color: rgba(248,81,73,0.2); font-style: italic;
    }
    .step.ord .step-meta { color: var(--purple); }
    .step.ord .step-text {
      color: var(--purple); font-family: 'SF Mono', Consolas, monospace; font-size: 11px;
      background: rgba(188,140,255,0.06); padding: 5px 8px;
      border-radius: 4px; border-left: 2px solid var(--purple);
    }
    .step.ord .step-text a {
      color: var(--purple); text-decoration: underline;
      display: block; margin-top: 4px; word-break: break-all; font-weight: 600;
    }
    .step.ord .step-text a:hover { opacity: 0.85; }

    /* ── Chat working indicator ── */
    .chat-working {
      display: flex; align-items: center; gap: 8px; padding: 4px 0;
      animation: fadeUp 0.22s ease both;
    }
    .chat-working-dots { display: flex; gap: 4px; }
    .chat-working-dots span {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--muted); animation: bounce 1.1s infinite;
    }
    .chat-working-dots span:nth-child(2) { animation-delay: 0.18s; }
    .chat-working-dots span:nth-child(3) { animation-delay: 0.36s; }
    .chat-working-label { font-size: 11px; color: var(--muted); font-style: italic; }

    /* ── User bubble ── */
    .user-message {
      align-self: flex-end; max-width: 80%;
      background: rgba(88,166,255,0.1); border: 1px solid rgba(88,166,255,0.2);
      border-radius: 12px 12px 2px 12px;
      padding: 8px 14px; font-size: 13px; color: var(--text);
      line-height: 1.5; animation: fadeUp 0.22s ease both;
    }
    .turn-sep { border: none; border-top: 1px solid var(--border); margin: 4px 0; opacity: 0.4; }

    /* ── Loading ── */
    .loading { display: flex; gap: 5px; padding: 8px 4px; align-items: center; }
    .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--muted); animation: bounce 1.1s infinite; }
    .dot:nth-child(2) { animation-delay: 0.18s; }
    .dot:nth-child(3) { animation-delay: 0.36s; }
    @keyframes bounce {
      0%, 60%, 100% { opacity: 0.2; transform: scale(0.8); }
      30%            { opacity: 1;   transform: scale(1.2); }
    }

    /* ── Input ── */
    .input-wrap {
      flex: 1; display: flex; background: rgba(17,24,39,0.8);
      border: 1px solid var(--border); border-radius: 8px;
      overflow: hidden; transition: border-color 0.2s;
    }
    .input-wrap:focus-within { border-color: var(--blue); }
    .panel-input {
      flex: 1; background: transparent; border: none; outline: none;
      padding: 9px 14px; color: var(--text); font-size: 13px;
    }
    .panel-input::placeholder { color: var(--muted); }
    .send-btn {
      background: var(--blue); color: #0a0f1e; border: none;
      padding: 9px 18px; font-weight: 700; font-size: 12px;
      cursor: pointer; border-radius: 8px; transition: opacity 0.2s; white-space: nowrap;
    }
    .send-btn:hover { opacity: 0.85; }
    .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    /* ── Present mode ── */
    body.present .step.answer .step-text { font-size: 16px !important; line-height: 1.8 !important; }
    body.present .step-meta    { font-size: 11px !important; }
    body.present .panel-input  { font-size: 15px !important; }
    body.present .empty-caption { font-size: 15px !important; }
    body.present .side-stage-name { font-size: 14px !important; }
    body.present .side-stage-desc { font-size: 12px !important; }
    body.present #stage-img    { width: 180px !important; height: 180px !important; }
  </style>
</head>
<body>

<header>
  <div class="header-title">
    <div>
      <h1>MITRA</h1>
      <div class="header-subtitle">Spaceship AI Agent</div>
    </div>
  </div>
  <div class="header-actions">
    <button class="icon-btn" id="reset-btn">&#8635; Reset</button>
    <button class="icon-btn" id="present-btn">&#8862; Present</button>
  </div>
</header>

<div class="stage-tabs" id="stage-tabs">
  <button class="stage-tab" data-stage="1">
    <div class="stage-num">1</div>
    <div class="stage-info-text">
      <div class="stage-title">No tool access</div>
      <div class="stage-sub">MITRA can reason, but cannot act</div>
    </div>
  </button>
  <button class="stage-tab" data-stage="2">
    <div class="stage-num">2</div>
    <div class="stage-info-text">
      <div class="stage-title">Configured MCP servers</div>
      <div class="stage-sub">Known URLs · tools discovered via tools/list</div>
    </div>
  </button>
  <button class="stage-tab" data-stage="3">
    <div class="stage-num">3</div>
    <div class="stage-info-text">
      <div class="stage-title">ORD + tools/list</div>
      <div class="stage-sub">Self-described servers · still needs live connections</div>
    </div>
  </button>
  <button class="stage-tab" data-stage="4">
    <div class="stage-num">4</div>
    <div class="stage-info-text">
      <div class="stage-title">ORD + Server Card</div>
      <div class="stage-sub">Discover servers and read tool metadata</div>
    </div>
  </button>
</div>

<div class="scenarios">
  <button class="scenario-btn" data-msg="Give me a full status report of all ship systems.">&#128202; Status report</button>
  <button class="scenario-btn" data-msg="We've taken a hit. Assess the damage and fix what you can.">&#128680; Assess &amp; fix</button>
  <button class="scenario-btn" data-msg="How do we get back to Earth from our current position?">&#127758; Get us home</button>
</div>

<div class="main-grid">

  <!-- Left: stage image + flow -->
  <div class="left-panel">
    <img id="stage-img" src="/assets/stage1.png" />
    <div class="side-stage-name" id="side-stage-name"></div>
    <div class="side-stage-desc" id="side-stage-desc"></div>
    <hr class="side-divider" />
    <div class="side-flow" id="side-flow"></div>
  </div>

  <!-- Middle: conversation -->
  <div class="panel">
    <div class="panel-body" id="panel-body">
      <div class="empty-state" id="empty-state">
        <div class="empty-caption" id="empty-caption"></div>
      </div>
    </div>
    <div class="panel-footer">
      <div class="input-wrap">
        <input type="text" class="panel-input" id="msg-input" placeholder="Ask MITRA…" />
      </div>
      <button class="send-btn" id="send-btn">Send &rarr;</button>
    </div>
  </div>

  <!-- Right: activity log -->
  <div class="resize-handle" id="resize-handle"></div>
  <div class="right-panel" id="right-panel">
    <div class="activity-header">&#9889; Activity</div>
    <div class="activity-body" id="activity-body">
      <div class="activity-empty" id="activity-empty">Tool calls and discovery steps will appear here.</div>
    </div>
  </div>

</div>

<script>
  var currentStage = 1;
  var conversationHistory = [];
  var stageStates = { 1: null, 2: null, 3: null, 4: null };

  var STAGE_META = {
    1: {
      name: 'No tool access',
      desc: 'MITRA can reason but cannot act — no connection to any ship system.',
      flow: [
        { label: 'Agent', cls: 's1' }, '>',
        { label: 'Claude', cls: 's1' }
      ],
      empty: '<strong>No tool access</strong>Ask MITRA about the emergency.',
      btnColor: 'var(--s1)'
    },
    2: {
      name: 'Configured MCP servers',
      desc: 'Known URLs. Calls tools/list on each server to discover capabilities.',
      flow: [
        { label: 'config', cls: 's2' }, '>',
        { label: 'Agent', cls: 'on' }, '>',
        { label: 'tools/list', cls: 's2' }, '>',
        { label: 'MCP servers', cls: 'on' }, '>',
        { label: 'Claude', cls: 'on' }
      ],
      empty: '<strong>Configured MCP servers</strong>Ask MITRA about the emergency.',
      btnColor: 'var(--s2)'
    },
    3: {
      name: 'ORD + tools/list',
      desc: 'ORD reveals all servers. Still connects to each one to discover tools.',
      flow: [
        { label: 'ORD', cls: 's3' }, '>',
        { label: 'Agent', cls: 'on' }, '>',
        { label: 'tools/list', cls: 's3' }, '>',
        { label: 'MCP servers', cls: 'on' }, '>',
        { label: 'Claude', cls: 'on' }
      ],
      empty: '<strong>ORD + tools/list</strong>Ask MITRA about the emergency.',
      btnColor: 'var(--s3)'
    },
    4: {
      name: 'ORD + Server Card',
      desc: 'One document reveals all servers and tool metadata. Zero connections before the first tool call.',
      flow: [
        { label: 'ORD', cls: 's4' }, '>',
        { label: 'Card + tools ✓', cls: 's4 hi' }, '>',
        { label: 'Agent', cls: 'on' }, '>',
        { label: 'Claude', cls: 'on' }
      ],
      empty: '<strong>ORD + Server Card</strong>Ask MITRA about the emergency.',
      btnColor: 'var(--s4)'
    }
  };

  var ACTIVITY_TYPES = { thinking: true, tool_call: true, tool_result: true, ord: true };

  function renderStageUI(stage) {
    var meta     = STAGE_META[stage];
    var stageImg = document.getElementById('stage-img');
    var nameEl   = document.getElementById('side-stage-name');
    var descEl   = document.getElementById('side-stage-desc');
    var flowEl   = document.getElementById('side-flow');
    var emptyEl  = document.getElementById('empty-caption');

    if (stageImg) stageImg.src = stage === 1 ? '/assets/mitra.png' : '/assets/stage' + stage + '.png';
    if (nameEl)  nameEl.textContent = meta.name;
    if (descEl)  descEl.textContent = meta.desc;
    if (emptyEl) emptyEl.innerHTML  = meta.empty;

    if (flowEl) {
      flowEl.innerHTML = '';
      meta.flow.forEach(function(item) {
        if (item === '>') {
          var arr = document.createElement('div');
          arr.className = 'side-farrow';
          arr.textContent = '↓';
          flowEl.appendChild(arr);
        } else {
          var node = document.createElement('span');
          node.className = 'side-fnode ' + item.cls;
          node.textContent = item.label;
          flowEl.appendChild(node);
        }
      });
    }

    document.querySelectorAll('.stage-tab').forEach(function(tab) {
      tab.classList.toggle('active', parseInt(tab.dataset.stage) === stage);
    });

    document.getElementById('send-btn').style.background = meta.btnColor;
  }

  document.querySelectorAll('.stage-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var newStage = parseInt(tab.dataset.stage);
      if (newStage === currentStage) return;

      stageStates[currentStage] = {
        panelHtml: document.getElementById('panel-body').innerHTML,
        activityHtml: document.getElementById('activity-body').innerHTML,
        history: conversationHistory.slice(),
        imgSrc: (document.getElementById('stage-img') || {}).src || ''
      };

      currentStage = newStage;

      var saved = stageStates[currentStage];
      if (saved) {
        document.getElementById('panel-body').innerHTML = saved.panelHtml;
        document.getElementById('activity-body').innerHTML = saved.activityHtml;
        conversationHistory = saved.history.slice();
      } else {
        conversationHistory = [];
        resetPanel();
      }

      renderStageUI(currentStage);

      if (saved && saved.imgSrc) {
        var si = document.getElementById('stage-img');
        if (si) si.src = saved.imgSrc;
      }
    });
  });

  var scenarios = document.querySelectorAll('.scenario-btn');
  var msgInput  = document.getElementById('msg-input');
  msgInput.value = '';

  scenarios.forEach(function(btn) {
    btn.addEventListener('click', function() {
      scenarios.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      msgInput.value = btn.dataset.msg;
    });
  });
  msgInput.addEventListener('input', function() {
    scenarios.forEach(function(b) { b.classList.remove('active'); });
  });
  msgInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !document.getElementById('send-btn').disabled) {
      document.getElementById('send-btn').click();
    }
  });

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function softScroll(el) {
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) el.scrollTop = el.scrollHeight;
  }
  function loading() {
    var d = document.createElement('div');
    d.className = 'loading';
    d.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    return d;
  }

  var ICON = { thinking: '💭', tool_call: '🔧', tool_result: '📥', answer: '✅', ord: '🗺' };
  var META = { thinking: 'Thinking', tool_call: 'Tool call', tool_result: 'Result', answer: 'Answer', ord: 'ORD' };

  function flashPill(serverName) {
    if (!serverName) return;
    document.querySelectorAll('.server-pill').forEach(function(pill) {
      if (pill.textContent.trim() === serverName) {
        pill.classList.remove('flash');
        void pill.offsetWidth;
        pill.classList.add('flash');
        setTimeout(function() { pill.classList.remove('flash'); }, 900);
      }
    });
  }

  function buildStep(step, isBlind) {
    var div = document.createElement('div');
    div.className = 'step ' + step.type + (isBlind && step.type === 'answer' ? ' blind' : '');
    var server = step.server ? '<span style="color:var(--purple)">' + esc(step.server) + '</span> · ' : '';
    var textHtml;
    if (step.type === 'ord' && step.url) {
      var label = esc(step.content).replace(esc(step.url), '').replace(/\s+$/, '');
      textHtml = label + '<a href="' + step.url + '" target="_blank">' + esc(step.url) + '</a>';
    } else if (step.type === 'answer') {
      textHtml = marked.parse(step.content);
    } else {
      textHtml = esc(step.content);
    }
    div.innerHTML =
      '<div class="step-icon">' + (ICON[step.type] || '·') + '</div>' +
      '<div class="step-content">' +
        '<div class="step-meta">' + server + (META[step.type] || step.type) + '</div>' +
        '<div class="step-text">' + textHtml + '</div>' +
      '</div>';
    return div;
  }

  function resetPanel() {
    document.getElementById('panel-body').innerHTML =
      '<div class="empty-state" id="empty-state">' +
        '<div class="empty-caption" id="empty-caption">' + (STAGE_META[currentStage] ? STAGE_META[currentStage].empty : '') + '</div>' +
      '</div>';
    document.getElementById('activity-body').innerHTML =
      '<div class="activity-empty" id="activity-empty">Tool calls and discovery steps will appear here.</div>';
  }

  document.getElementById('send-btn').addEventListener('click', async function() {
    var message = msgInput.value.trim();
    if (!message) return;
    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Running…';
    msgInput.value = '';
    scenarios.forEach(function(b) { b.classList.remove('active'); });

    var panelBody    = document.getElementById('panel-body');
    var activityBody = document.getElementById('activity-body');

    var emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.style.transition = 'opacity 0.2s';
      emptyState.style.opacity = '0';
      setTimeout(function() { if (emptyState.parentNode) emptyState.style.display = 'none'; }, 220);
    }

    var actEmpty = document.getElementById('activity-empty');
    if (actEmpty) actEmpty.remove();

    var nonEmpty = Array.from(panelBody.children).filter(function(c) { return c.id !== 'empty-state'; });
    if (nonEmpty.length > 0) {
      var sep = document.createElement('hr');
      sep.className = 'turn-sep';
      panelBody.appendChild(sep);
    }

    var userBubble = document.createElement('div');
    userBubble.className = 'user-message';
    userBubble.textContent = message;
    panelBody.appendChild(userBubble);

    var chatWorking = document.createElement('div');
    chatWorking.id = 'chat-working';
    chatWorking.className = 'chat-working';
    chatWorking.innerHTML = '<div class="chat-working-dots"><span></span><span></span><span></span></div><div class="chat-working-label">MITRA is working…</div>';
    panelBody.appendChild(chatWorking);
    panelBody.scrollTop = panelBody.scrollHeight;

    var loader = loading();
    activityBody.appendChild(loader);
    softScroll(activityBody);

    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message, stage: currentStage, history: conversationHistory }),
      });
      var data = await res.json();
      if (activityBody.contains(loader)) activityBody.removeChild(loader);

      if (!res.ok) {
        var errDiv = document.createElement('div');
        errDiv.className = 'step';
        errDiv.innerHTML = '<div class="step-icon">⚠️</div><div class="step-content"><div class="step-text" style="color:var(--red)">' + esc(data.error || 'Unknown error') + '</div></div>';
        panelBody.appendChild(errDiv);
        return;
      }

      conversationHistory.push({ role: 'user', content: message });
      if (data.answer) conversationHistory.push({ role: 'assistant', content: data.answer });

      var isBlind = currentStage === 1;
      for (var i = 0; i < data.steps.length; i++) {
        if (i > 0) await new Promise(function(r) { setTimeout(r, 160); });
        var step = data.steps[i];
        if (step.type === 'tool_call' && step.server) flashPill(step.server);
        var target = ACTIVITY_TYPES[step.type] ? activityBody : panelBody;
        target.appendChild(buildStep(step, isBlind));
        softScroll(target);
      }
      var si = document.getElementById('stage-img');
      if (si && currentStage === 1) si.src = '/assets/stage1.png';
    } catch(err) {
      if (activityBody.contains(loader)) activityBody.removeChild(loader);
      var catchDiv = document.createElement('div');
      catchDiv.innerHTML = '<div class="step-text" style="color:var(--red)">Error: ' + esc(err.message) + '</div>';
      panelBody.appendChild(catchDiv);
    } finally {
      var cw = document.getElementById('chat-working');
      if (cw) cw.remove();
      btn.disabled = false;
      btn.textContent = 'Send →';
    }
  });

  document.getElementById('reset-btn').addEventListener('click', function() {
    conversationHistory = [];
    resetPanel();
  });

  document.getElementById('present-btn').addEventListener('click', function() {
    document.body.classList.toggle('present');
    this.textContent = document.body.classList.contains('present') ? '⊟ Normal' : '⊞ Present';
  });

  fetch('/api/catalog')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var pills = document.querySelectorAll('.server-pill');
      pills.forEach(function(pill, i) {
        var server = data.servers[i];
        if (server) { pill.textContent = server.title; pill.classList.add('online'); }
        else pill.classList.remove('online');
      });
    })
    .catch(function() {
      document.querySelectorAll('.server-pill').forEach(function(p) { p.classList.remove('online'); });
    });

  renderStageUI(currentStage);

  (function() {
    var handle = document.getElementById('resize-handle');
    var rightPanel = document.getElementById('right-panel');
    var isDragging = false, startX, startWidth;
    handle.addEventListener('mousedown', function(e) {
      isDragging = true;
      startX = e.clientX;
      startWidth = rightPanel.offsetWidth;
      handle.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var newWidth = Math.max(160, Math.min(480, startWidth + (startX - e.clientX)));
      rightPanel.style.width = newWidth + 'px';
    });
    document.addEventListener('mouseup', function() {
      if (!isDragging) return;
      isDragging = false;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  })();
</script>
</body>
</html>`;
