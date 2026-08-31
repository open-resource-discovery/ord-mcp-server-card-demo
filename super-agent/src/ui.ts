export const UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MCP Server Card Demo</title>
  <style>
    :root {
      --bg: #0a0f1e;
      --surface: #111827;
      --border: #1e2d45;
      --text: #e6edf3;
      --muted: #6b7f9e;
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header-title h1 { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
    .header-title h1 span { color: var(--blue); }
    .fleet-status { display: flex; gap: 6px; }
    .server-pill {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid var(--border);
      color: var(--muted);
      background: var(--surface);
      transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
    }
    .server-pill.online { border-color: #1a4a28; color: var(--green); background: rgba(63,185,80,0.07); }
    @keyframes pillFlash {
      0%   { background: rgba(63,185,80,0.07); border-color: #1a4a28; }
      40%  { background: rgba(63,185,80,0.3); border-color: var(--green); box-shadow: 0 0 8px rgba(63,185,80,0.4); }
      100% { background: rgba(63,185,80,0.07); border-color: #1a4a28; }
    }
    .server-pill.flash { animation: pillFlash 0.8s ease; }
    .header-actions { display: flex; gap: 8px; }
    .icon-btn {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--muted);
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: border-color 0.2s, color 0.2s;
    }
    .icon-btn:hover { border-color: var(--blue); color: var(--text); }

    /* ── Stage tabs ── */
    .stage-tabs {
      display: flex;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      background: rgba(10,15,30,0.6);
    }
    .stage-tab {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      cursor: pointer;
      border: none;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: var(--muted);
      transition: color 0.2s, border-color 0.2s, background 0.2s;
      text-align: left;
    }
    .stage-tab:not(:last-child) { border-right: 1px solid var(--border); }
    .stage-tab:hover { background: rgba(255,255,255,0.03); color: var(--text); }
    .stage-num {
      width: 26px; height: 26px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 12px;
      border: 1.5px solid currentColor;
      flex-shrink: 0;
      opacity: 0.5;
      transition: opacity 0.2s, background 0.2s;
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

    /* ── Stage description strip ── */
    .stage-strip {
      position: relative;
      padding: 8px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-shrink: 0;
      min-height: 52px;
      transition: border-color 0.3s;
    }
    /* HUD corner brackets */
    .stage-strip::before, .stage-strip::after,
    .hud-br, .hud-bl {
      content: '';
      position: absolute;
      width: 10px; height: 10px;
      border-style: solid;
      border-color: inherit;
      opacity: 0.35;
      transition: border-color 0.3s;
    }
    .stage-strip::before { top: 4px; left: 4px; border-width: 1.5px 0 0 1.5px; }
    .stage-strip::after  { top: 4px; right: 4px; border-width: 1.5px 1.5px 0 0; }
    .hud-br { bottom: 4px; right: 4px; border-width: 0 1.5px 1.5px 0; }
    .hud-bl { bottom: 4px; left: 4px;  border-width: 0 0 1.5px 1.5px; }

    .stage-strip[data-stage="1"] { border-color: rgba(248,81,73,0.3); }
    .stage-strip[data-stage="2"] { border-color: rgba(227,179,65,0.3); }
    .stage-strip[data-stage="3"] { border-color: rgba(88,166,255,0.3); }
    .stage-strip[data-stage="4"] { border-color: rgba(63,185,80,0.3); }

    .stage-desc { font-size: 12px; color: var(--muted); flex-shrink: 0; max-width: 260px; }
    .stage-desc strong { color: var(--text); font-weight: 600; }

    /* ── Flow diagram ── */
    .flow {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: nowrap;
      overflow: hidden;
    }
    .fnode {
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid var(--border);
      color: var(--muted);
      background: var(--surface);
      white-space: nowrap;
      transition: all 0.3s;
    }
    .fnode.on  { color: var(--text); border-color: #2a3f60; background: rgba(255,255,255,0.05); }
    .fnode.hi  { font-weight: 700; }
    .fnode.s1  { color: var(--s1); border-color: rgba(248,81,73,0.4); background: rgba(248,81,73,0.08); }
    .fnode.s2  { color: var(--s2); border-color: rgba(227,179,65,0.4); background: rgba(227,179,65,0.08); }
    .fnode.s3  { color: var(--s3); border-color: rgba(88,166,255,0.4); background: rgba(88,166,255,0.08); }
    .fnode.s4  { color: var(--s4); border-color: rgba(63,185,80,0.4); background: rgba(63,185,80,0.08); }
    .farrow    { font-size: 11px; color: var(--border); flex-shrink: 0; transition: color 0.3s; }
    .farrow.on { color: #3a5070; }

    /* ── Scenarios ── */
    .scenarios {
      padding: 8px 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1px solid var(--border);
      overflow-x: auto;
      scrollbar-width: none;
      flex-shrink: 0;
    }
    .scenarios::-webkit-scrollbar { display: none; }
    .scenarios-label { font-size: 11px; color: var(--muted); white-space: nowrap; flex-shrink: 0; }
    .scenario-btn {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 4px 12px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 11px;
      transition: border-color 0.15s, background 0.15s;
      white-space: nowrap;
    }
    .scenario-btn:hover { border-color: var(--blue); }
    .scenario-btn.active { border-color: var(--blue); background: rgba(88,166,255,0.08); color: var(--blue); }

    /* ── Main panel ── */
    .panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .panel-body::-webkit-scrollbar { width: 4px; }
    .panel-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
    .panel-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--border);
      display: flex;
      gap: 8px;
      background: rgba(10,15,30,0.8);
      flex-shrink: 0;
    }

    /* ── Empty state ── */
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: var(--muted);
      padding: 32px;
    }
    .empty-ship { opacity: 0.55; transition: opacity 0.4s; }
    .empty-ship:hover { opacity: 0.75; }
    .empty-caption { font-size: 13px; text-align: center; line-height: 1.6; max-width: 280px; }
    .empty-caption strong { display: block; margin-bottom: 4px; font-size: 14px; }

    /* ── Steps ── */
    .step {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      font-size: 13px;
      animation: fadeUp 0.22s ease both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(5px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .step-icon    { font-size: 15px; flex-shrink: 0; line-height: 1.5; }
    .step-content { flex: 1; min-width: 0; }
    .step-meta    { font-size: 10px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 3px; }
    .step-text    { line-height: 1.55; word-break: break-word; }

    .step.thinking .step-meta { color: var(--muted); }
    .step.thinking .step-text { color: var(--muted); font-style: italic; }

    .step.tool_call .step-meta { color: var(--blue); }
    .step.tool_call .step-text {
      color: var(--blue);
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 12px;
      background: rgba(88,166,255,0.06);
      padding: 6px 10px;
      border-radius: 5px;
      border-left: 2px solid var(--blue);
    }
    .step.tool_result .step-meta { color: var(--green); }
    .step.tool_result .step-text {
      color: #9ab5cc;
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 12px;
      background: rgba(63,185,80,0.04);
      padding: 6px 10px;
      border-radius: 5px;
      border-left: 2px solid var(--green);
      white-space: pre-wrap;
    }
    .step.answer .step-meta { color: var(--orange); }
    .step.answer .step-text {
      color: var(--text);
      font-size: 13px;
      background: rgba(17,24,39,0.8);
      padding: 12px 14px;
      border-radius: 6px;
      border: 1px solid var(--border);
      line-height: 1.65;
    }
    .step.answer.blind .step-text {
      color: var(--muted);
      background: rgba(248,81,73,0.04);
      border-color: rgba(248,81,73,0.2);
      font-style: italic;
    }
    .step.ord .step-meta { color: var(--purple); }
    .step.ord .step-text {
      color: var(--purple);
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 12px;
      background: rgba(188,140,255,0.06);
      padding: 6px 10px;
      border-radius: 5px;
      border-left: 2px solid var(--purple);
    }
    .step.ord .step-text a { color: var(--purple); text-decoration: underline; opacity: 0.85; }
    .step.ord .step-text a:hover { opacity: 1; }

    /* ── Loading dots ── */
    .loading { display: flex; gap: 5px; padding: 10px 0; align-items: center; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: bounce 1.1s infinite; }
    .dot:nth-child(2) { animation-delay: 0.18s; }
    .dot:nth-child(3) { animation-delay: 0.36s; }
    @keyframes bounce {
      0%, 60%, 100% { opacity: 0.2; transform: scale(0.8); }
      30%            { opacity: 1;   transform: scale(1.2); }
    }

    /* ── Input ── */
    .input-wrap {
      flex: 1;
      display: flex;
      background: rgba(17,24,39,0.8);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .input-wrap:focus-within { border-color: var(--blue); }
    .panel-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      padding: 9px 14px;
      color: var(--text);
      font-size: 13px;
    }
    .panel-input::placeholder { color: var(--muted); }
    .send-btn {
      background: var(--blue);
      color: #0a0f1e;
      border: none;
      padding: 9px 18px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      border-radius: 8px;
      transition: opacity 0.2s;
      white-space: nowrap;
    }
    .send-btn:hover { opacity: 0.85; }
    .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    /* ── Present mode ── */
    body.present .step-text    { font-size: 15px !important; line-height: 1.7 !important; }
    body.present .step-meta    { font-size: 12px !important; }
    body.present .panel-input  { font-size: 15px !important; }
    body.present .empty-caption { font-size: 15px !important; }
    body.present .fnode        { font-size: 12px !important; }
  </style>
</head>
<body>

<header>
  <div class="header-title">
    <svg viewBox="0 0 200 72" width="80" height="29" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
      <ellipse cx="18" cy="36" rx="14" ry="7" fill="#e3891a" opacity="0.2"/>
      <ellipse cx="11" cy="36" rx="8" ry="5" fill="#e3b341" opacity="0.45"/>
      <ellipse cx="6"  cy="36" rx="4" ry="3"  fill="#fff8e1" opacity="0.8"/>
      <path d="M72,38 L44,65 L92,48" fill="#101e38"/>
      <path d="M72,34 L44,7  L92,24" fill="#101e38"/>
      <path d="M32,26 L152,20 L170,36 L152,52 L32,46 Z" fill="#162032" stroke="#243a5e" stroke-width="0.8"/>
      <ellipse cx="122" cy="34" rx="22" ry="11" fill="#0e1d37"/>
      <ellipse cx="122" cy="33" rx="18" ry="9"  fill="#1a3570" opacity="0.9"/>
      <ellipse cx="122" cy="33" rx="13" ry="7"  fill="#1e4aaa" opacity="0.4"/>
      <ellipse cx="117" cy="30" rx="4"  ry="2.5" fill="white" opacity="0.07"/>
      <path d="M170,36 L194,32 L194,40 Z" fill="#2a5aaa"/>
      <rect x="28" y="30" width="12" height="12" rx="2" fill="#0a1220"/>
    </svg>
    <h1>MCP Server Card <span>Demo</span></h1>
  </div>
  <div class="fleet-status" id="fleet-status">
    <span class="server-pill">Thruster Control</span>
    <span class="server-pill">Navigation</span>
    <span class="server-pill">Life Support</span>
    <span class="server-pill">Comms Relay</span>
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
      <div class="stage-title">No MCP</div>
      <div class="stage-sub">Plain LLM</div>
    </div>
  </button>
  <button class="stage-tab" data-stage="2">
    <div class="stage-num">2</div>
    <div class="stage-info-text">
      <div class="stage-title">Config + tools/list</div>
      <div class="stage-sub">URLs in config</div>
    </div>
  </button>
  <button class="stage-tab" data-stage="3">
    <div class="stage-num">3</div>
    <div class="stage-info-text">
      <div class="stage-title">ORD + tools/list</div>
      <div class="stage-sub">Self-describing servers</div>
    </div>
  </button>
  <button class="stage-tab" data-stage="4">
    <div class="stage-num">4</div>
    <div class="stage-info-text">
      <div class="stage-title">ORD + Server Card</div>
      <div class="stage-sub">Static tool metadata</div>
    </div>
  </button>
</div>

<div class="stage-strip" id="stage-strip" data-stage="3">
  <div class="hud-br"></div><div class="hud-bl"></div>
  <div class="stage-desc" id="stage-desc"></div>
  <div class="flow" id="stage-flow"></div>
</div>

<div class="scenarios">
  <span class="scenarios-label">Scenario:</span>
  <button class="scenario-btn active" data-msg="The thruster is overheating! We need to reduce thrust immediately.">&#128293; Thruster overheating</button>
  <button class="scenario-btn" data-msg="CO2 levels are dangerously high in the cabin!">&#9763;&#65039; CO2 critical</button>
  <button class="scenario-btn" data-msg="Prepare the ship for immediate departure to Mars. Plot the course and make sure the thrusters are ready.">&#128640; Depart to Mars</button>
  <button class="scenario-btn" data-msg="We have lost contact with Earth and the thrusters are losing power. Handle both emergencies now.">&#128225; Contact lost + thrusters failing</button>
  <button class="scenario-btn" data-msg="Check if the crew is safe — are life support systems stable and can we still communicate with anyone?">&#129489;&#8205;&#128640; Crew safety check</button>
  <button class="scenario-btn" data-msg="Are we on track and is the ship in good shape to continue the mission? Check our position, life support, and thruster status.">&#128506; Mission readiness</button>
  <button class="scenario-btn" data-msg="We have a critical situation across multiple systems. Run a full system check: thrusters, life support, navigation, and communications.">&#128680; Full system check</button>
</div>

<div class="panel">
  <div class="panel-body" id="panel-body">
    <div class="empty-state" id="empty-state">
      <svg class="empty-ship" viewBox="0 0 280 100" width="280" height="100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="24"  cy="50" rx="20" ry="10" fill="#e3891a" opacity="0.15"/>
        <ellipse cx="14"  cy="50" rx="12" ry="7"  fill="#e3b341" opacity="0.35"/>
        <ellipse cx="7"   cy="50" rx="6"  ry="4"  fill="#fff8e1" opacity="0.65"/>
        <path d="M100,52 L60,88 L128,66" fill="#0d1b30"/>
        <path d="M100,48 L60,12 L128,34" fill="#0d1b30"/>
        <path d="M44,36 L214,28 L238,50 L214,72 L44,64 Z" fill="#162032" stroke="#1e3050" stroke-width="1"/>
        <ellipse cx="174" cy="47" rx="32" ry="15" fill="#0d1b30"/>
        <ellipse cx="174" cy="46" rx="26" ry="12" fill="#1a3570" opacity="0.85"/>
        <ellipse cx="174" cy="46" rx="19" ry="9"  fill="#1e4aaa" opacity="0.4"/>
        <ellipse cx="166" cy="41" rx="6"  ry="4"  fill="white"  opacity="0.06"/>
        <path d="M238,50 L268,44 L268,56 Z" fill="#2a5aaa"/>
        <rect x="40" y="43" width="16" height="14" rx="3" fill="#0a1220"/>
        <line x1="100" y1="42" x2="155" y2="38" stroke="#1e3a6a" stroke-width="0.6" opacity="0.6"/>
        <line x1="100" y1="58" x2="155" y2="62" stroke="#1e3a6a" stroke-width="0.6" opacity="0.6"/>
      </svg>
      <div class="empty-caption" id="empty-caption"></div>
    </div>
  </div>
  <div class="panel-footer">
    <div class="input-wrap">
      <input type="text" class="panel-input" id="msg-input" placeholder="Describe a spaceship emergency..." />
    </div>
    <button class="send-btn" id="send-btn">Send &rarr;</button>
  </div>
</div>

<script>
  var currentStage = 3;

  var STAGE_META = {
    1: {
      desc: '<strong>No MCP.</strong> Claude has no tools. It can reason but cannot act on real system data.',
      flow: [
        { label: 'Agent', cls: 's1' }, '>',
        { label: 'Claude', cls: 's1' }
      ],
      empty: '<strong>Stage 1 — No MCP</strong>Claude has no tools. It can only reason — not act.',
      btnColor: 'var(--s1)'
    },
    2: {
      desc: '<strong>Config-based.</strong> Server URLs are in an env config. Must call tools/list on every server to discover capabilities.',
      flow: [
        { label: 'config.env', cls: 's2' }, '>',
        { label: 'Agent', cls: 'on' }, '>',
        { label: 'tools/list ×4', cls: 's2' }, '>',
        { label: 'MCP servers', cls: 'on' }, '>',
        { label: 'Claude', cls: 'on' }
      ],
      empty: '<strong>Stage 2 — Config + tools/list</strong>URLs from config. Connects to each server to discover tools.',
      btnColor: 'var(--s2)'
    },
    3: {
      desc: '<strong>ORD + tools/list.</strong> Servers self-describe via ORD. No URL config needed — but tools still require a live connection.',
      flow: [
        { label: 'ORD', cls: 's3' }, '>',
        { label: 'Server Card', cls: 'on' }, '>',
        { label: 'Agent', cls: 'on' }, '>',
        { label: 'tools/list ×4', cls: 's3' }, '>',
        { label: 'MCP servers', cls: 'on' }, '>',
        { label: 'Claude', cls: 'on' }
      ],
      empty: '<strong>Stage 3 — ORD + tools/list</strong>ORD reveals the servers. Still needs tools/list to discover capabilities.',
      btnColor: 'var(--s3)'
    },
    4: {
      desc: '<strong>ORD + Server Card metadata.</strong> Tool definitions are in the card. Zero connections before the first tool call.',
      flow: [
        { label: 'ORD', cls: 's4' }, '>',
        { label: 'Card + tools ✓', cls: 's4 hi' }, '>',
        { label: 'Agent', cls: 'on' }, '>',
        { label: 'Claude', cls: 'on' }
      ],
      empty: '<strong>Stage 4 — ORD + Server Card</strong>Tool metadata is in the card. Discovery is static — no connections needed.',
      btnColor: 'var(--s4)'
    }
  };

  function renderStageUI(stage) {
    var meta = STAGE_META[stage];
    var strip = document.getElementById('stage-strip');
    var desc  = document.getElementById('stage-desc');
    var flow  = document.getElementById('stage-flow');
    var empty = document.getElementById('empty-caption');

    strip.dataset.stage = stage;
    desc.innerHTML = meta.desc;
    empty.innerHTML = meta.empty;

    flow.innerHTML = '';
    meta.flow.forEach(function(item) {
      if (item === '>') {
        var arr = document.createElement('span');
        arr.className = 'farrow on';
        arr.textContent = '›';
        flow.appendChild(arr);
      } else {
        var node = document.createElement('span');
        node.className = 'fnode ' + item.cls;
        node.textContent = item.label;
        flow.appendChild(node);
      }
    });

    document.querySelectorAll('.stage-tab').forEach(function(tab) {
      tab.classList.toggle('active', parseInt(tab.dataset.stage) === stage);
    });

    var btn = document.getElementById('send-btn');
    btn.style.background = meta.btnColor;
  }

  // Stage tab clicks
  document.querySelectorAll('.stage-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      currentStage = parseInt(tab.dataset.stage);
      renderStageUI(currentStage);
      resetPanel();
    });
  });

  // Scenarios
  var scenarios = document.querySelectorAll('.scenario-btn');
  var msgInput  = document.getElementById('msg-input');
  msgInput.value = scenarios[0].dataset.msg;

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

  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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
      var eu = esc(step.url);
      textHtml = esc(step.content).replace(eu, '<a href="' + step.url + '" target="_blank">' + eu + '</a>');
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
    var body = document.getElementById('panel-body');
    body.innerHTML =
      '<div class="empty-state" id="empty-state">' +
        '<svg class="empty-ship" viewBox="0 0 280 100" width="280" height="100" xmlns="http://www.w3.org/2000/svg">' +
          '<ellipse cx="24" cy="50" rx="20" ry="10" fill="#e3891a" opacity="0.15"/>' +
          '<ellipse cx="14" cy="50" rx="12" ry="7" fill="#e3b341" opacity="0.35"/>' +
          '<ellipse cx="7" cy="50" rx="6" ry="4" fill="#fff8e1" opacity="0.65"/>' +
          '<path d="M100,52 L60,88 L128,66" fill="#0d1b30"/>' +
          '<path d="M100,48 L60,12 L128,34" fill="#0d1b30"/>' +
          '<path d="M44,36 L214,28 L238,50 L214,72 L44,64 Z" fill="#162032" stroke="#1e3050" stroke-width="1"/>' +
          '<ellipse cx="174" cy="47" rx="32" ry="15" fill="#0d1b30"/>' +
          '<ellipse cx="174" cy="46" rx="26" ry="12" fill="#1a3570" opacity="0.85"/>' +
          '<ellipse cx="174" cy="46" rx="19" ry="9" fill="#1e4aaa" opacity="0.4"/>' +
          '<ellipse cx="166" cy="41" rx="6" ry="4" fill="white" opacity="0.06"/>' +
          '<path d="M238,50 L268,44 L268,56 Z" fill="#2a5aaa"/>' +
          '<rect x="40" y="43" width="16" height="14" rx="3" fill="#0a1220"/>' +
          '<line x1="100" y1="42" x2="155" y2="38" stroke="#1e3a6a" stroke-width="0.6" opacity="0.6"/>' +
          '<line x1="100" y1="58" x2="155" y2="62" stroke="#1e3a6a" stroke-width="0.6" opacity="0.6"/>' +
        '</svg>' +
        '<div class="empty-caption" id="empty-caption">' + (STAGE_META[currentStage] ? STAGE_META[currentStage].empty : '') + '</div>' +
      '</div>';
  }

  document.getElementById('send-btn').addEventListener('click', async function() {
    var message = msgInput.value.trim();
    if (!message) return;
    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Running…';

    var panelBody = document.getElementById('panel-body');
    panelBody.innerHTML = '';
    var loader = loading();
    panelBody.appendChild(loader);

    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message, stage: currentStage }),
      });
      var data = await res.json();
      panelBody.removeChild(loader);

      if (!res.ok) {
        var errDiv = document.createElement('div');
        errDiv.className = 'step';
        errDiv.innerHTML = '<div class="step-icon">⚠️</div><div class="step-content"><div class="step-text" style="color:var(--red)">' + esc(data.error || 'Unknown error') + '</div></div>';
        panelBody.appendChild(errDiv);
        return;
      }

      var isBlind = currentStage === 1;
      for (var i = 0; i < data.steps.length; i++) {
        if (i > 0) await new Promise(function(r) { setTimeout(r, 160); });
        var step = data.steps[i];
        if (step.type === 'tool_call' && step.server) flashPill(step.server);
        panelBody.appendChild(buildStep(step, isBlind));
        panelBody.scrollTop = panelBody.scrollHeight;
      }
    } catch(err) {
      panelBody.innerHTML = '';
      var catchDiv = document.createElement('div');
      catchDiv.innerHTML = '<div class="step-text" style="color:var(--red)">Error: ' + esc(err.message) + '</div>';
      panelBody.appendChild(catchDiv);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send →';
    }
  });

  document.getElementById('reset-btn').addEventListener('click', function() { resetPanel(); });

  document.getElementById('present-btn').addEventListener('click', function() {
    document.body.classList.toggle('present');
    this.textContent = document.body.classList.contains('present') ? '⊟ Normal' : '⊞ Present';
  });

  // Load server catalog for pills
  fetch('/api/catalog')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var pills = document.querySelectorAll('.server-pill');
      pills.forEach(function(pill, i) {
        var server = data.servers[i];
        if (server) { pill.textContent = server.title; pill.classList.add('online'); }
        else { pill.classList.remove('online'); }
      });
    })
    .catch(function() {
      document.querySelectorAll('.server-pill').forEach(function(p) { p.classList.remove('online'); });
    });

  // Init
  renderStageUI(currentStage);
</script>
</body>
</html>`;
