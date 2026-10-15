"use strict";

/*
 * love-diary — page logic.
 *
 * "Our Diary": one small dated entry per day, with a prompt that changes daily.
 * Everything is kept in localStorage on this device only.
 */

(function () {
  var STORE = "mena-diary";

  var PROMPTS = [
    "What made you think of her today?",
    "One small thing you noticed.",
    "What would you tell her if she were here right now?",
    "A moment that felt like the two of you.",
    "What are you looking forward to together?",
    "Something she'd have laughed at today.",
    "What are you grateful for, quietly?",
    "A song, a smell, a sky that reminded you of her.",
    "What did you learn about yourself today?",
    "If today had a title, what would it be?",
    "What do you want to remember about today?",
    "A promise you're keeping.",
    "What would you thank her for?",
    "The kindest thing you did today.",
    "What's on your mind that you haven't said?",
    "Describe today in three words, then explain."
  ];

  var state = { entries: [] };

  /* ---------------- helpers ---------------- */

  function pad2(n) { return String(n).padStart(2, "0"); }

  function dayISO(date) {
    var d = date || new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function asDate(iso) {
    var parts = String(iso).split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function pretty(iso) {
    var d = asDate(iso);
    var months = ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function shiftDay(iso, delta) {
    var d = asDate(iso);
    d.setDate(d.getDate() + delta);
    return dayISO(d);
  }

  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function promptFor(day) {
    return PROMPTS[hashStr(day) % PROMPTS.length];
  }

  function cap(s) {
    s = String(s || "");
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  /* ---------------- storage ---------------- */

  function load() {
    state.entries = [];
    var raw = null;
    try { raw = localStorage.getItem(STORE); } catch (e) { raw = null; }
    var s = null;
    if (raw) { try { s = JSON.parse(raw); } catch (e) { s = null; } }
    if (s && Array.isArray(s.entries)) {
      s.entries.forEach(function (e) {
        if (e && typeof e.day === "string" && typeof e.text === "string") {
          state.entries.push({
            day: e.day,
            prompt: typeof e.prompt === "string" ? e.prompt.slice(0, 200) : "",
            mood: typeof e.mood === "string" ? e.mood.slice(0, 24) : "",
            text: e.text.slice(0, 2800),
            updatedAt: isFinite(e.updatedAt) ? Math.floor(e.updatedAt) : 0
          });
        }
      });
    }
    state.entries.sort(function (a, b) { return a.day < b.day ? -1 : (a.day > b.day ? 1 : 0); });
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* ---------------- actions ---------------- */

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function note(id, message) { setText(id, message); }

  function findEntry(day) {
    for (var i = 0; i < state.entries.length; i += 1) {
      if (state.entries[i].day === day) return state.entries[i];
    }
    return null;
  }

  function saveEntry(text, mood) {
    text = String(text || "").trim();
    if (!text) return false;
    var today = dayISO();
    var existing = findEntry(today);
    if (existing) {
      existing.text = text.slice(0, 2800);
      existing.mood = String(mood || "").slice(0, 24);
      existing.prompt = promptFor(today);
      existing.updatedAt = Date.now();
    } else {
      state.entries.push({
        day: today,
        prompt: promptFor(today),
        mood: String(mood || "").slice(0, 24),
        text: text.slice(0, 2800),
        updatedAt: Date.now()
      });
    }
    state.entries.sort(function (a, b) { return a.day < b.day ? -1 : (a.day > b.day ? 1 : 0); });
    save();
    render();
    return true;
  }

  function removeEntry(day) {
    for (var i = 0; i < state.entries.length; i += 1) {
      if (state.entries[i].day === day) {
        state.entries.splice(i, 1);
        save();
        render();
        note("entry-note", "That page is gone.");
        return true;
      }
    }
    return false;
  }

  function resetDiary() {
    state.entries = [];
    save();
    render();
    note("save-note", "The diary is empty \u2014 a fresh page whenever you're ready.");
  }

  function streak() {
    var days = {};
    state.entries.forEach(function (e) { days[e.day] = true; });
    var today = dayISO();
    var start = days[today] ? today : (days[shiftDay(today, -1)] ? shiftDay(today, -1) : null);
    if (!start) return 0;
    var count = 0;
    var cur = start;
    while (days[cur]) {
      count += 1;
      cur = shiftDay(cur, -1);
    }
    return count;
  }

  /* ---------------- rendering ---------------- */

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function renderEntry(e) {
    var card = el("div", "entry");
    card.setAttribute("data-day", e.day);

    var head = el("div", "entry-head");
    head.appendChild(el("span", "entry-day")).textContent = pretty(e.day);
    if (e.mood) head.appendChild(el("span", "entry-mood")).textContent = cap(e.mood);
    card.appendChild(head);

    if (e.prompt) card.appendChild(el("span", "entry-prompt")).textContent = e.prompt;

    var body = el("p", "entry-text");
    body.textContent = e.text;
    card.appendChild(body);

    var rm = el("button", "entry-remove");
    rm.type = "button";
    rm.textContent = "Delete this page";
    rm.addEventListener("click", function () { removeEntry(e.day); });
    card.appendChild(rm);

    return card;
  }

  function renderEntries() {
    var list = document.getElementById("entry-list");
    if (list) {
      list.textContent = "";
      if (!state.entries.length) {
        var empty = el("p", "entry-empty");
        empty.textContent = "No pages yet \u2014 today is a good place to start.";
        list.appendChild(empty);
      } else {
        state.entries.slice().reverse().forEach(function (e) { list.appendChild(renderEntry(e)); });
      }
    }
    setText("diary-count", state.entries.length);
    setText("diary-streak", streak());
  }

  function renderToday() {
    var today = dayISO();
    setText("today-date", pretty(today).toUpperCase());
    setText("prompt-text", promptFor(today));
  }

  function prefetchToday() {
    var existing = findEntry(dayISO());
    if (!existing) return;
    var t = document.getElementById("entry-text");
    var m = document.getElementById("mood-select");
    if (t) t.value = existing.text;
    if (m) m.value = existing.mood;
    note("entry-note", "You already wrote today \u2014 saving again will update it \u2665");
  }

  function render() {
    renderToday();
    renderEntries();
  }

  /* ---------------- events ---------------- */

  function wire() {
    var btn = document.getElementById("save-entry");
    if (btn) btn.addEventListener("click", function () {
      var t = document.getElementById("entry-text");
      var m = document.getElementById("mood-select");
      if (!t || !String(t.value).trim()) {
        note("entry-note", "Write a few words first \u2665");
        return;
      }
      saveEntry(t.value, m ? m.value : "");
      note("entry-note", "Saved \u2014 today is written down \u2665");
    });

    var reset = document.getElementById("reset-diary");
    if (reset) reset.addEventListener("click", resetDiary);

    var share = document.getElementById("share-button");
    if (share) share.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { note("save-note", "Link copied \u2665"); })
          .catch(function () { note("save-note", url); });
        return;
      }
      note("save-note", url);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    load();
    render();
    prefetchToday();
    wire();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      });
    }
  });
})();
