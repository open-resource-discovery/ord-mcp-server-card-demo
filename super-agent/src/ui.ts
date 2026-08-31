export const UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MCP Server Card Demo</title>
  <style>
    :root {
      --bg: #0d1117;
      --surface: #161b22;
      --border: #30363d;
      --text: #e6edf3;
      --muted: #8b949e;
      --green: #3fb950;
      --blue: #58a6ff;
      --red: #f85149;
      --orange: #e3b341;
      --purple: #bc8cff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    header {
      padding: 10px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    header h1 { font-size: 17px; font-weight: 700; letter-spacing: -0.3px; }
    header h1 span { color: var(--blue); }
    .header-right { display: flex; align-items: center; gap: 10px; }
    .fleet-status { display: flex; gap: 8px; }
    .server-pill {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid var(--border);
      color: var(--muted);
      background: var(--surface);
      transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
    }
    .server-pill.online { border-color: #238636; color: var(--green); background: rgba(63,185,80,0.08); }
    @keyframes pillFlash {
      0%   { background: rgba(63,185,80,0.08); border-color: #238636; box-shadow: none; }
      40%  { background: rgba(63,185,80,0.35); border-color: var(--green); box-shadow: 0 0 8px rgba(63,185,80,0.5); }
      100% { background: rgba(63,185,80,0.08); border-color: #238636; box-shadow: none; }
    }
    .server-pill.flash { animation: pillFlash 0.8s ease; }
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
    .scenarios {
      padding: 10px 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid var(--border);
      overflow-x: auto;
      scrollbar-width: none;
    }
    .scenarios::-webkit-scrollbar { display: none; }
    .scenarios-label { font-size: 12px; color: var(--muted); white-space: nowrap; }
    .scenario-btn {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 5px 14px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 12px;
      transition: border-color 0.15s, background 0.15s;
      white-space: nowrap;
    }
    .scenario-btn:hover { border-color: var(--blue); }
    .scenario-btn.active { border-color: var(--blue); background: rgba(88,166,255,0.1); color: var(--blue); }
    .panels {
      display: grid;
      grid-template-columns: 1fr 1fr;
      flex: 1;
      overflow: hidden;
    }
    .panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-right: 1px solid var(--border);
    }
    .panel:last-child { border-right: none; }
    .panel-header {
      padding: 10px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--surface);
    }
    .panel-header h2 { font-size: 13px; font-weight: 600; flex: 1; }
    .badge { font-size: 11px; padding: 2px 9px; border-radius: 10px; font-weight: 600; }
    .badge-red { background: rgba(248,81,73,0.15); color: var(--red); }
    .badge-green { background: rgba(63,185,80,0.15); color: var(--green); }
    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .panel-body::-webkit-scrollbar { width: 4px; }
    .panel-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
    .panel-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--border);
      display: flex;
      gap: 8px;
      background: var(--surface);
    }
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: var(--muted);
    }
    .empty-state .icon { font-size: 36px; }
    .empty-state p { font-size: 13px; text-align: center; line-height: 1.6; max-width: 220px; }
    .step {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      font-size: 13px;
      animation: fadeUp 0.25s ease both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .step-icon { font-size: 15px; flex-shrink: 0; line-height: 1.5; }
    .step-content { flex: 1; min-width: 0; }
    .step-meta { font-size: 10px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 3px; }
    .step-text { line-height: 1.55; word-break: break-word; }
    .step.thinking .step-meta { color: var(--muted); }
    .step.thinking .step-text { color: var(--muted); font-style: italic; }
    .step.tool_call .step-meta { color: var(--blue); }
    .step.tool_call .step-text {
      color: var(--blue);
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 12px;
      background: rgba(88,166,255,0.07);
      padding: 6px 10px;
      border-radius: 5px;
      border-left: 2px solid var(--blue);
    }
    .step.tool_result .step-meta { color: var(--green); }
    .step.tool_result .step-text {
      color: #adbac7;
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 12px;
      background: rgba(63,185,80,0.05);
      padding: 6px 10px;
      border-radius: 5px;
      border-left: 2px solid var(--green);
      white-space: pre-wrap;
    }
    .step.answer .step-meta { color: var(--orange); }
    .step.answer .step-text {
      color: var(--text);
      font-size: 13px;
      background: var(--surface);
      padding: 12px 14px;
      border-radius: 6px;
      border: 1px solid var(--border);
      line-height: 1.65;
    }
    .step.answer.no-tools .step-text {
      color: var(--muted);
      background: rgba(248,81,73,0.05);
      border: 1px solid rgba(248,81,73,0.2);
      font-style: italic;
    }
    .step.ord .step-meta { color: var(--purple); }
    .step.ord .step-text {
      color: var(--purple);
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 12px;
      background: rgba(188,140,255,0.07);
      padding: 6px 10px;
      border-radius: 5px;
      border-left: 2px solid var(--purple);
    }
    .step.ord .step-text a { color: var(--purple); text-decoration: underline; opacity: 0.85; }
    .step.ord .step-text a:hover { opacity: 1; }
    .loading { display: flex; gap: 5px; padding: 12px 0; align-items: center; }
    .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--muted); animation: bounce 1.1s infinite; }
    .dot:nth-child(2) { animation-delay: 0.18s; }
    .dot:nth-child(3) { animation-delay: 0.36s; }
    @keyframes bounce {
      0%, 60%, 100% { opacity: 0.25; transform: scale(0.85); }
      30%           { opacity: 1;    transform: scale(1.15); }
    }
    .input-wrap {
      flex: 1;
      display: flex;
      background: var(--bg);
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
      color: #0d1117;
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
    .send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    body.present .step-text { font-size: 15px !important; line-height: 1.7 !important; }
    body.present .step-meta { font-size: 12px !important; }
    body.present .panel-header h2 { font-size: 15px !important; }
    body.present .panel-input { font-size: 15px !important; }
    body.present .badge { font-size: 12px !important; }
    body.present .empty-state p { font-size: 15px !important; }
  </style>
</head>
<body>

<header>
  <h1>MCP Server Card <span>Demo</span></h1>
  <div class="header-right">
    <button class="icon-btn" id="reset-btn">&#8635; Reset</button>
    <button class="icon-btn" id="present-btn">&#8862; Present</button>
    <div class="fleet-status" id="fleet-status">
      <span class="server-pill online">Thruster Control</span>
      <span class="server-pill online">Navigation</span>
      <span class="server-pill online">Life Support</span>
      <span class="server-pill online">Comms Relay</span>
    </div>
  </div>
</header>

<div class="scenarios">
  <span class="scenarios-label">Scenarios:</span>
  <button class="scenario-btn active" data-msg="The thruster is overheating! We need to reduce thrust immediately.">&#128293; Thruster overheating</button>
  <button class="scenario-btn" data-msg="CO2 levels are dangerously high in the cabin!">&#9763;&#65039; CO2 critical</button>
  <button class="scenario-btn" data-msg="Prepare the ship for immediate departure to Mars. Plot the course and make sure the thrusters are ready.">&#128640; Depart to Mars</button>
  <button class="scenario-btn" data-msg="We have lost contact with Earth and the thrusters are losing power. Handle both emergencies now.">&#128225; Contact lost + thrusters failing</button>
  <button class="scenario-btn" data-msg="Check if the crew is safe — are life support systems stable and can we still communicate with anyone?">&#129489;&#8205;&#128640; Crew safety check</button>
  <button class="scenario-btn" data-msg="Are we on track and is the ship in good shape to continue the mission? Check our position, life support, and thruster status.">&#128506; Mission readiness</button>
  <button class="scenario-btn" data-msg="We have a critical situation across multiple systems. Run a full system check: thrusters, life support, navigation, and communications.">&#128680; Full system check</button>
</div>

<div class="panels">
  <div class="panel">
    <div class="panel-header">
      <h2>Server Card without tool metadata</h2>
      <span class="badge badge-red" id="badge-without">No tool metadata</span>
    </div>
    <div class="panel-body" id="panel-without">
      <div class="empty-state">
        <div class="icon">&#129335;</div>
        <p>Finds the servers,<br>but can't see their tools.</p>
      </div>
    </div>
    <div class="panel-footer">
      <div class="input-wrap">
        <input type="text" class="panel-input" id="msg-without" placeholder="Describe a spaceship emergency..." />
      </div>
      <button class="send-btn" id="send-without-btn">Send query &rarr;</button>
    </div>
  </div>
  <div class="panel">
    <div class="panel-header">
      <h2>Server Card with tool metadata</h2>
      <span class="badge badge-green" id="badge-with">Tool metadata</span>
    </div>
    <div class="panel-body" id="panel-with">
      <div class="empty-state">
        <div class="icon">&#128269;</div>
        <p>Reads tool metadata,<br>discovers capabilities, acts.</p>
      </div>
    </div>
    <div class="panel-footer">
      <div class="input-wrap">
        <input type="text" class="panel-input" id="msg-with" placeholder="Describe a spaceship emergency..." />
      </div>
      <button class="send-btn" id="send-with-btn">Send query &rarr;</button>
    </div>
  </div>
</div>

<script>
  var scenarios      = document.querySelectorAll('.scenario-btn');
  var inputWithout   = document.getElementById('msg-without');
  var inputWith      = document.getElementById('msg-with');
  var sendWithoutBtn = document.getElementById('send-without-btn');
  var sendWithBtn    = document.getElementById('send-with-btn');
  var panelWithout   = document.getElementById('panel-without');
  var panelWith      = document.getElementById('panel-with');
  var badgeWithout   = document.getElementById('badge-without');
  var badgeWith      = document.getElementById('badge-with');

  inputWithout.value = scenarios[0].dataset.msg;
  inputWith.value    = scenarios[0].dataset.msg;

  scenarios.forEach(function(btn) {
    btn.addEventListener('click', function() {
      scenarios.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      inputWithout.value = btn.dataset.msg;
      inputWith.value    = btn.dataset.msg;
    });
  });

  inputWithout.addEventListener('input', function() { scenarios.forEach(function(b) { b.classList.remove('active'); }); });
  inputWith.addEventListener('input',    function() { scenarios.forEach(function(b) { b.classList.remove('active'); }); });
  inputWithout.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !sendWithoutBtn.disabled) sendWithoutBtn.click(); });
  inputWith.addEventListener('keydown',    function(e) { if (e.key === 'Enter' && !sendWithBtn.disabled)    sendWithBtn.click(); });

  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function loading() {
    var d = document.createElement('div');
    d.className = 'loading';
    d.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    return d;
  }

  var ICON = { thinking: '\u{1F4AD}', tool_call: '\u{1F527}', tool_result: '\u{1F4E5}', answer: '✅', ord: '\u{1F5FA}' };
  var META = { thinking: 'Thinking', tool_call: 'Tool call', tool_result: 'Result', answer: 'Answer', ord: 'ORD Discovery' };

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

  function buildStep(step, isNoTools) {
    var div = document.createElement('div');
    div.className = 'step ' + step.type;
    if (isNoTools && step.type === 'answer') div.className += ' no-tools';
    var server = step.server ? '<span style="color:var(--purple)">' + esc(step.server) + '</span> &middot; ' : '';
    var textHtml;
    if (step.type === 'ord' && step.url) {
      var escapedUrl = esc(step.url);
      textHtml = esc(step.content).replace(escapedUrl, '<a href="' + step.url + '" target="_blank">' + escapedUrl + '</a>');
    } else {
      textHtml = esc(step.content);
    }
    div.innerHTML =
      '<div class="step-icon">' + (ICON[step.type] || '&middot;') + '</div>' +
      '<div class="step-content">' +
        '<div class="step-meta">' + server + (META[step.type] || step.type) + '</div>' +
        '<div class="step-text">' + textHtml + '</div>' +
      '</div>';
    return div;
  }

  function delay(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

  function resetPanel(panel, icon, line1, line2) {
    panel.innerHTML = '<div class="empty-state"><div class="icon">' + icon + '</div><p>' + line1 + '<br>' + line2 + '</p></div>';
  }

  async function runAgent(message, withDiscovery, panel) {
    panel.innerHTML = '';
    var loader = loading();
    panel.appendChild(loader);
    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message, withDiscovery: withDiscovery }),
      });
      var data = await res.json();
      panel.removeChild(loader);
      if (!res.ok) {
        var errDiv = document.createElement('div');
        errDiv.className = 'step';
        errDiv.innerHTML = '<div class="step-icon">⚠️</div><div class="step-content"><div class="step-text" style="color:var(--red)">' + esc(data.error || 'Unknown error') + '</div></div>';
        panel.appendChild(errDiv);
        return;
      }
      if (data.serverCount !== undefined && data.toolCount !== undefined) {
        if (withDiscovery) {
          badgeWith.textContent = data.toolCount + ' tools \xb7 ' + data.serverCount + ' servers';
        } else {
          badgeWithout.textContent = data.serverCount + ' servers \xb7 0 tools';
        }
      }
      var isNoTools = !withDiscovery;
      for (var i = 0; i < data.steps.length; i++) {
        if (i > 0) await delay(180);
        var step = data.steps[i];
        if (step.type === 'tool_call' && step.server) flashPill(step.server);
        panel.appendChild(buildStep(step, isNoTools));
        panel.scrollTop = panel.scrollHeight;
      }
    } catch(err) {
      panel.innerHTML = '';
      var catchDiv = document.createElement('div');
      catchDiv.className = 'step';
      catchDiv.innerHTML = '<div class="step-text" style="color:var(--red)">Error: ' + esc(err.message) + '</div>';
      panel.appendChild(catchDiv);
    }
  }

  function setBtnsDisabled(disabled) {
    sendWithoutBtn.disabled = disabled;
    sendWithBtn.disabled    = disabled;
  }

  sendWithoutBtn.addEventListener('click', async function() {
    var message = inputWithout.value.trim();
    if (!message) return;
    setBtnsDisabled(true);
    sendWithoutBtn.textContent = 'Discovering...';
    await runAgent(message, false, panelWithout);
    setBtnsDisabled(false);
    sendWithoutBtn.textContent = 'Send query →';
  });

  sendWithBtn.addEventListener('click', async function() {
    var message = inputWith.value.trim();
    if (!message) return;
    setBtnsDisabled(true);
    sendWithBtn.textContent = 'Discovering...';
    await runAgent(message, true, panelWith);
    setBtnsDisabled(false);
    sendWithBtn.textContent = 'Send query →';
  });

  document.getElementById('reset-btn').addEventListener('click', function() {
    resetPanel(panelWithout, '\u{1F937}', 'Finds the servers,', 'but can’t see their tools.');
    resetPanel(panelWith,    '\u{1F50D}', 'Reads tool metadata,', 'discovers capabilities, acts.');
    badgeWithout.textContent = 'No tool metadata';
    badgeWith.textContent    = 'Tool metadata';
    setBtnsDisabled(false);
    sendWithoutBtn.textContent = 'Send query →';
    sendWithBtn.textContent    = 'Send query →';
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
        else { pill.classList.remove('online'); }
      });
    })
    .catch(function() {
      document.querySelectorAll('.server-pill').forEach(function(p) { p.classList.remove('online'); });
    });
</script>
</body>
</html>`;
