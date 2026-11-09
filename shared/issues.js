// Fills the "Archived Issues" selector from /issues.json (generated on push).
// Works on any issue page at /issue-N/; adds the selector if the page has none.
(function () {
  var m = location.pathname.match(/issue-(\d+)/);
  var current = m ? parseInt(m[1], 10) : null;

  function ordinal(n) {
    var s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  function label(i) {
    var d = new Date(i.date + "T12:00:00Z");
    return "Issue " + String(i.number).padStart(3, "0") + " — " + ordinal(d.getUTCDate()) + " " +
      d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" }) + " " + d.getUTCFullYear();
  }
  function ensureSelect() {
    var sel = document.getElementById("archive-select");
    if (sel) return sel;
    var header = document.querySelector(".masthead");
    if (!header) return null;
    var style = document.createElement("style");
    style.textContent =
      ".masthead-archive{margin-top:14px;display:flex;justify-content:center;align-items:center;gap:10px;" +
      'font-family:"JetBrains Mono",monospace;font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:#6b6b6b}' +
      '.masthead-archive select{font:inherit;letter-spacing:.08em;text-transform:uppercase;color:inherit;' +
      "background:transparent;border:1px solid #c8c4bc;padding:3px 8px;cursor:pointer;outline:none}" +
      ".masthead-archive select:hover{border-color:#0d0d0d}";
    document.head.appendChild(style);
    var wrap = document.createElement("div");
    wrap.className = "masthead-archive";
    wrap.innerHTML = '<label for="archive-select">Archived Issues</label><select id="archive-select"></select>';
    header.appendChild(wrap);
    return wrap.querySelector("select");
  }

  fetch("../issues.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var sel = ensureSelect();
      if (!sel) return;
      var others = data.issues.filter(function (i) { return i.number !== current; });
      sel.innerHTML = "";
      var first = document.createElement("option");
      first.value = "";
      first.textContent = "Select issue…";
      sel.appendChild(first);
      others.forEach(function (i) {
        var o = document.createElement("option");
        o.value = "../" + i.path + "/";
        o.textContent = label(i);
        sel.appendChild(o);
      });
      sel.onchange = function () { if (sel.value) location.href = sel.value; sel.value = ""; };
      if (!others.length && sel.closest) sel.closest(".masthead-archive").hidden = true;
    })
    .catch(function () { /* keep any static options already on the page */ });
})();
