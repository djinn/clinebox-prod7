// ClineBox Wizard HTML

export function wizardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ClineBox Setup</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0a0a0f;color:#e4e4e7;display:flex;justify-content:center;padding:2rem}
.container{max-width:720px;width:100%}
h1{font-size:1.75rem;font-weight:600;margin-bottom:.5rem;color:#fff}
.subtitle{color:#a1a1aa;margin-bottom:2rem;font-size:.9rem}
.form-group{margin-bottom:1.5rem}
label{display:block;font-size:.85rem;font-weight:500;color:#d4d4d8;margin-bottom:.4rem}
.hint{font-size:.75rem;color:#71717a;margin-top:.25rem;line-height:1.4}
input,select{width:100%;padding:.6rem .8rem;background:#1f1f23;border:1px solid #3f3f46;border-radius:8px;color:#e4e4e7;font-size:.9rem;outline:none}
input:focus,select:focus{border-color:#3b82f6}
select{cursor:pointer}
.btn{width:100%;padding:.75rem;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-weight:600;font-size:1rem;cursor:pointer}
.btn:hover{background:#2563eb}
.btn:disabled{opacity:.5}
.error{background:#450a0a;border:1px solid #991b1b;color:#fca5a5;padding:.75rem;border-radius:8px;margin-bottom:1rem;display:none}
.card{background:#18181b;border-radius:12px;padding:1.5rem;border:1px solid #27272a}
.grid{display:grid;gap:.5rem}
.g2{grid-template-columns:1fr 1fr}
.g3{grid-template-columns:1fr 1fr 1fr}
.opt{padding:.6rem;background:#1f1f23;border:1px solid #3f3f46;border-radius:8px;color:#e4e4e7;cursor:pointer;font-size:.85rem;text-align:center}
.opt.sel{border-color:#3b82f6;background:#1e293b}
.back{display:inline-block;margin-bottom:1rem;color:#71717a;text-decoration:none;font-size:.85rem}
.tags{background:#1f1f23;border-radius:8px;padding:.75rem;margin-top:.25rem;font-size:.8rem;color:#a1a1aa;line-height:1.5}
.tags span{display:inline-block;background:#27272a;padding:.15rem .5rem;border-radius:4px;margin:.1rem;font-size:.75rem;color:#d4d4d8}
</style>
</head>
<body><div class="container">
<a href="/" class="back">\u2190 Back</a>
<h1>Setup Workspace</h1>
<p class="subtitle">Configure your ClineBox workspace</p>
<div id="err" class="error"></div>
<div class="card">
<form id="f" onsubmit="return false">
<div class="form-group"><label for="wn">Workspace Name</label>
<input type="text" id="wn" placeholder="my-workspace" required />
<div class="hint">Lowercase letters, numbers, and hyphens only.</div></div>
<div class="form-group"><label>Template</label>
<div class="grid g3" id="tg">
<b class="opt sel" data-v="node" onclick="pick('tg','tmpl','node')">Node.js</b>
<b class="opt" data-v="python" onclick="pick('tg','tmpl','python')">Python</b>
<b class="opt" data-v="go" onclick="pick('tg','tmpl','go')">Go</b>
<b class="opt" data-v="rust" onclick="pick('tg','tmpl','rust')">Rust</b>
<b class="opt" data-v="zig" onclick="pick('tg','tmpl','zig')">Zig</b>
<b class="opt" data-v="blank" onclick="pick('tg','tmpl','blank')">Blank</b>
</div><input type="hidden" id="tmpl" value="node" /></div>
<div class="form-group"><label for="aid">Cloudflare Account ID</label>
<input type="text" id="aid" placeholder="Paste your 32-char Account ID" required />
<div class="hint">Found in Cloudflare Dashboard under <strong>Workers &amp; Pages</strong> right sidebar, or <strong>Overview</strong> page bottom. 32-char hex string.</div></div>
<div class="form-group"><label for="gid">AI Gateway ID</label>
<input type="text" id="gid" placeholder="Paste your AI Gateway ID" required />
<div class="hint">Create one at <strong>AI &gt; AI Gateway</strong> in Cloudflare Dashboard, then paste the name here.</div></div>
<div class="form-group"><label>AI Provider</label>
<div class="grid g2" id="pg">
<b class="opt" data-v="openai" onclick="pick('pg','prov','openai')">OpenAI</b>
<b class="opt sel" data-v="anthropic" onclick="pick('pg','prov','anthropic')">Anthropic</b>
<b class="opt" data-v="google" onclick="pick('pg','prov','google')">Google</b>
<b class="opt" data-v="deepseek" onclick="pick('pg','prov','deepseek')">DeepSeek</b>
<b class="opt" data-v="openrouter" onclick="pick('pg','prov','openrouter')">OpenRouter</b>
<b class="opt" data-v="cline" onclick="pick('pg','prov','cline')">Cline API</b>
</div><input type="hidden" id="prov" value="anthropic" /></div>
<div class="form-group"><label for="mdl">Model</label>
<select id="mdl"></select>
<div class="tags" id="mlist"></div></div>
<div class="form-group"><label for="key">Provider API Key</label>
<input type="password" id="key" placeholder="sk-..." required />
<div class="hint">Your API key for the selected provider.</div></div>
<button type="button" class="btn" id="sbtn" onclick="go()">Provision Workspace</button>
</form>
</div>
</div>
<script>
var models={openai:["gpt-4o","gpt-4o-mini","gpt-4-turbo","o3-mini"],anthropic:["claude-sonnet-4","claude-haiku-3-5","claude-opus-4"],google:["gemini-2.5-pro","gemini-2.0-flash"],deepseek:["deepseek-v4-flash","deepseek-v4-pro"],openrouter:["anthropic/claude-sonnet-4","openai/gpt-4o","google/gemini-2.5-pro","deepseek/deepseek-chat","deepseek/deepseek-r1"],cline:["cline-sonnet","cline-haiku"]};
function pick(gridId, inputId, val) {
  var g = document.getElementById(gridId);
  if (!g) return;
  var b = g.querySelectorAll(".opt");
  for (var i = 0; i < b.length; i++) b[i].classList.remove("sel");
  for (var i = 0; i < b.length; i++) {
    if (b[i].getAttribute("data-v") === val) {
      b[i].classList.add("sel"); break;
    }
  }
  var inp = document.getElementById(inputId);
  if (inp) inp.value = val;
  if (inputId === "prov") showModels(val);
}
function showModels(p) {
  var list = models[p] || [];
  var s = document.getElementById("mdl");
  if (s) {
    s.innerHTML = "";
    for (var i = 0; i < list.length; i++) {
      var o = document.createElement("option");
      o.value = list[i]; o.textContent = list[i]; s.appendChild(o);
    }
  }
  var t = document.getElementById("mlist");
  if (t) {
    t.innerHTML = "<strong>Available models:</strong><br>";
    for (var i = 0; i < list.length; i++) t.innerHTML += "<span>" + list[i] + "</span>";
  }
}
function go() {
  var e = document.getElementById("err");
  var aid = document.getElementById("aid").value.trim();
  var gid = document.getElementById("gid").value.trim();
  var key = document.getElementById("key").value.trim();
  if (!aid || !gid || !key) {
    e.textContent = "Fill in Account ID, Gateway ID, and API Key.";
    e.style.display = "block"; return;
  }
  e.style.display = "none";
  var btn = document.getElementById("sbtn");
  btn.disabled = true; btn.textContent = "Provisioning...";
  fetch("/api/provision", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      workspaceName: document.getElementById("wn").value,
      template: document.getElementById("tmpl").value,
      provider: document.getElementById("prov").value,
      model: document.getElementById("mdl").value,
      accountId: aid, gatewayId: gid, apiKey: key
    })
  }).then(function(r) { return r.json(); }).then(function(d) {
    if (!d.ok) {
      e.textContent = d.error || "Failed"; e.style.display = "block";
      btn.disabled = false; btn.textContent = "Provision Workspace";
    } else {
      window.location.href = "/?provisioned=1";
    }
  }).catch(function(ex) {
    e.textContent = "Error: " + ex.message; e.style.display = "block";
    btn.disabled = false; btn.textContent = "Provision Workspace";
  });
}
showModels("anthropic");
</script>
</body>
</html>`; }

