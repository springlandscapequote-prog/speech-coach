(function () {
  "use strict";

  var C = window.SPEECH_CONTENT;
  var SETTINGS_KEY = "speechcoach.v1.settings";
  var LESSONS_KEY = "speechcoach.v1.lessons";
  var SCORES_KEY = "speechcoach.v1.scores";
  var DRILL_MS = 10 * 60 * 1000;

  var state = {
    tab: "today",
    lessonOpen: null,
    drillStep: 0,
    confirmRestart: false,
    slowerSpeech: false,
    checks: {},
    activeWeekKey: null,
    memoryRecs: [],
    recUrls: {},
    mediaRecorder: null,
    recStream: null,
    recChunks: [],
    recLabel: "Practice",
    wakeLock: null,
    timer: { remainingMs: DRILL_MS, running: false, lastTs: 0, id: 0 },
    part: { remainingMs: 0, running: false, lastTs: 0, id: 0, label: "", durationMs: 0 },
    prompter: { playing: false, speed: 48, fontSize: 40, lastTs: 0, id: 0 },
    toastTimer: 0
  };

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseISO(iso) {
    var p = String(iso).split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function isoFromDate(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function addDays(iso, days) {
    var d = parseISO(iso);
    d.setDate(d.getDate() + days);
    return isoFromDate(d);
  }

  function daysBetween(startISO, endISO) {
    var a = parseISO(startISO);
    var b = parseISO(endISO);
    return Math.round((b - a) / 86400000);
  }

  function longDate(iso) {
    return parseISO(iso).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function shortRange(startISO) {
    var end = addDays(startISO, 6);
    var a = parseISO(startISO);
    var b = parseISO(end);
    var opt = { month: "short", day: "numeric" };
    return a.toLocaleDateString("en-US", opt) + " – " + b.toLocaleDateString("en-US", opt);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function markup(s) {
    var t = esc(s);
    t = t.replace(/\{\/\/\}/g, '<span class="pause long" role="img" aria-label="longer pause, one second">//</span>');
    t = t.replace(/\{\/\}/g, '<span class="pause short" role="img" aria-label="short pause, half a second">/</span>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong class="stress">$1</strong>');
    t = t.replace(/~([^~]+)~/g, '<em class="stage">$1</em>');
    return t;
  }

  function plainSpeak(s) {
    return String(s)
      .replace(/~\[[^\]]*\]~/g, " ")
      .replace(/~([^~]*)~/g, "$1")
      .replace(/\*\*/g, "")
      .replace(/\{\/\/\}/g, ". ")
      .replace(/\{\/\}/g, ", ")
      .replace(/ \/ /g, ", ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function speakBtn(text, label) {
    return '<button type="button" class="btn tiny" data-action="speak" data-speak="' +
      encodeURIComponent(plainSpeak(text)) + '">' + esc(label || "Read aloud") + "</button>";
  }

  function loadSettings() {
    var s = readJSON(SETTINGS_KEY, {});
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.startDate || "")) s.startDate = todayISO();
    return s;
  }

  function saveSettings() {
    writeJSON(SETTINGS_KEY, { startDate: state.settings.startDate });
  }

  function loadLessons() {
    var data = readJSON(LESSONS_KEY, {});
    return data && typeof data === "object" ? data : {};
  }

  function saveLessons(map) {
    writeJSON(LESSONS_KEY, map);
  }

  function loadScores() {
    var data = readJSON(SCORES_KEY, { weeks: {} });
    if (!data || typeof data !== "object" || !data.weeks) data = { weeks: {} };
    return data;
  }

  function saveScores(data) {
    writeJSON(SCORES_KEY, data);
  }

  function planStatus() {
    var index = daysBetween(state.settings.startDate, todayISO());
    if (index < 0) return { phase: "before", index: index };
    if (index >= 28) return { phase: "done", index: index };
    var week = Math.floor(index / 7) + 1;
    var dow = index % 7;
    var plan = C.weeks[week - 1];
    var slot = C.rotation[week][dow];
    var lessonIds;
    var review = false;
    var reviewAll = false;
    if (slot === "review") {
      review = true;
      lessonIds = plan.lessonIds.slice();
    } else if (slot === "all") {
      review = true;
      reviewAll = true;
      lessonIds = C.lessons.map(function (l) { return l.id; });
    } else {
      lessonIds = [slot];
    }
    return {
      phase: "active",
      index: index,
      dayNumber: index + 1,
      week: week,
      dow: dow,
      plan: plan,
      lessonIds: lessonIds,
      review: review,
      reviewAll: reviewAll
    };
  }

  function lessonById(id) {
    for (var i = 0; i < C.lessons.length; i++) {
      if (C.lessons[i].id === id) return C.lessons[i];
    }
    return null;
  }

  function weekKeys() {
    var out = [];
    for (var i = 0; i < 4; i++) {
      out.push({ key: addDays(state.settings.startDate, i * 7), planWeek: i + 1, currentPlan: true });
    }
    return out;
  }

  function defaultWeekKey() {
    var status = planStatus();
    var n = 1;
    if (status.phase === "active") n = status.week;
    if (status.phase === "done") n = 4;
    return addDays(state.settings.startDate, (n - 1) * 7);
  }

  function ensureWeek(key) {
    var scores = loadScores();
    if (!scores.weeks[key]) {
      var planWeek = 1;
      var keys = weekKeys();
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].key === key) planWeek = keys[i].planWeek;
      }
      scores.weeks[key] = { planWeek: planWeek, scores: {}, win: "", nextFocus: "", updated: Date.now() };
    }
    return scores;
  }

  function weekTotal(rec) {
    var sum = 0;
    var n = 0;
    var scores = rec && rec.scores ? rec.scores : {};
    for (var i = 0; i < C.score.skills.length; i++) {
      var v = Number(scores[i]);
      if (v >= 1 && v <= 5) {
        sum += v;
        n += 1;
      }
    }
    return { sum: sum, n: n };
  }

  function formatTime(ms) {
    var clamped = Math.max(0, ms);
    var total = Math.ceil(clamped / 1000 - 1e-9);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return m + ":" + pad(s);
  }

  function suggestedLabel() {
    var elapsed = (DRILL_MS - state.timer.remainingMs) / 1000;
    var labels = [
      [0, "Step 1 — Warm-Up (2 minutes)"],
      [120, "Step 2 — Over-Articulation Reading (2 minutes)"],
      [240, "Step 3 — Tongue Twisters (3 minutes)"],
      [420, "Step 4 — Pace Control (1.5 minutes)"],
      [510, "Step 5 — Pause Instead of Filler Words (1 minute)"],
      [570, "Step 6 — Record & Review (30 seconds)"]
    ];
    var label = labels[0][1];
    for (var i = 0; i < labels.length; i++) {
      if (elapsed >= labels[i][0]) label = labels[i][1];
    }
    if (state.timer.remainingMs <= 0) return "Drill complete.";
    return "Suggested now: " + label;
  }

  function paintTimer() {
    var el = document.getElementById("timer-display");
    if (el) el.textContent = formatTime(state.timer.remainingMs);
    var note = document.getElementById("timer-suggest");
    if (note) note.textContent = suggestedLabel();
    var btn = document.querySelector("[data-testid='timer-toggle']");
    if (btn) {
      if (state.timer.running) btn.textContent = "Pause";
      else if (state.timer.remainingMs <= 0 || state.timer.remainingMs >= DRILL_MS) btn.textContent = "Start";
      else btn.textContent = "Resume";
    }
    var done = document.getElementById("timer-note");
    if (done) {
      done.textContent = state.timer.remainingMs <= 0 ? "Ten minutes. That drill is done." : "";
    }
  }

  function paintPart() {
    var el = document.getElementById("part-timer");
    if (!el) return;
    if (!state.part.label) {
      el.textContent = "";
      return;
    }
    if (state.part.running) el.textContent = state.part.label + " · " + formatTime(state.part.remainingMs);
    else if (state.part.remainingMs <= 0) el.textContent = state.part.label + " · done";
    else el.textContent = state.part.label + " · " + formatTime(state.part.remainingMs);
  }

  function startMainTimer() {
    if (state.timer.remainingMs <= 0) state.timer.remainingMs = DRILL_MS;
    state.timer.running = true;
    state.timer.lastTs = Date.now();
    if (state.timer.id) clearInterval(state.timer.id);
    state.timer.id = setInterval(tickMain, 200);
    paintTimer();
  }

  function pauseMainTimer() {
    state.timer.running = false;
    if (state.timer.id) clearInterval(state.timer.id);
    state.timer.id = 0;
    paintTimer();
  }

  function resetMainTimer() {
    pauseMainTimer();
    state.timer.remainingMs = DRILL_MS;
    paintTimer();
  }

  function tickMain() {
    if (!state.timer.running) return;
    var now = Date.now();
    var delta = now - state.timer.lastTs;
    state.timer.lastTs = now;
    state.timer.remainingMs -= delta;
    if (state.timer.remainingMs <= 0) {
      state.timer.remainingMs = 0;
      pauseMainTimer();
      return;
    }
    paintTimer();
  }

  function startPart(seconds, label) {
    state.part.durationMs = seconds * 1000;
    state.part.remainingMs = seconds * 1000;
    state.part.label = label;
    state.part.running = true;
    state.part.lastTs = Date.now();
    if (state.part.id) clearInterval(state.part.id);
    state.part.id = setInterval(tickPart, 200);
    paintPart();
  }

  function tickPart() {
    if (!state.part.running) return;
    var now = Date.now();
    var delta = now - state.part.lastTs;
    state.part.lastTs = now;
    state.part.remainingMs -= delta;
    if (state.part.remainingMs <= 0) {
      state.part.remainingMs = 0;
      state.part.running = false;
      if (state.part.id) clearInterval(state.part.id);
      state.part.id = 0;
    }
    paintPart();
  }

  function toast(msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () { el.hidden = true; }, 4800);
  }

  function englishVoice() {
    if (!window.speechSynthesis) return null;
    var voices = window.speechSynthesis.getVoices() || [];
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].lang === "en-US") return voices[i];
    }
    for (var j = 0; j < voices.length; j++) {
      if (/^en([_-]|$)/i.test(voices[j].lang)) return voices[j];
    }
    return null;
  }

  function speak(text) {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance !== "function") {
      toast("Read-aloud isn't available in this browser. Read the line out loud yourself.");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = state.slowerSpeech ? 0.72 : 0.95;
      var voice = englishVoice();
      if (voice) u.voice = voice;
      window.speechSynthesis.speak(u);
    } catch (err) {
      toast("Read-aloud isn't available in this browser. Read the line out loud yourself.");
    }
  }

  function legendHtml() {
    return '<div class="legend">' +
      "<p><strong>How to read the marks:</strong></p>" +
      '<p><span class="pause short" role="img" aria-label="short pause">/</span> short pause (half a second)</p>' +
      '<p><span class="pause long" role="img" aria-label="longer pause">//</span> longer pause (one full second — breathe)</p>' +
      '<p><strong class="stress">Bold</strong> = stress this word (a little louder, a little slower)</p>' +
      "</div>";
  }

  function voiceBar(withTestId) {
    var pressed = state.slowerSpeech ? "true" : "false";
    var test = withTestId ? ' data-testid="slower"' : "";
    return '<div class="row wrap">' +
      '<button type="button" class="btn ghost" data-action="toggle-slower" aria-pressed="' + pressed + '"' + test + ">" +
      (state.slowerSpeech ? "Slower voice: on" : "Slower voice") + "</button>" +
      '<button type="button" class="btn ghost" data-action="stop-speech">Stop voice</button>' +
      "</div>";
  }

  function renderToday() {
    var panel = document.getElementById("panel-today");
    var y = window.scrollY;
    var status = planStatus();
    var html = "";
    html += '<p class="kicker">' + esc(C.subtitle) + "</p>";
    html += "<p class=\"date-line\">" + esc(longDate(todayISO())) + "</p>";

    if (status.phase === "before") {
      html += '<section class="card">' +
        "<h2>Plan not started</h2>" +
        "<p>Day 1 is " + esc(longDate(state.settings.startDate)) + ". The drill and the lessons are here whenever you want them.</p>" +
        '<button type="button" class="btn primary" data-action="go-drill" data-testid="start-drill">Start the 10-minute drill</button>' +
        '<button type="button" class="btn ghost" data-action="browse-lessons">Browse the 11 lessons</button>' +
        "</section>";
    } else if (status.phase === "done") {
      html += '<section class="card complete" data-testid="plan-complete">' +
        "<h2>Plan complete</h2>" +
        "<p>The 4 weeks are finished. Keep the daily drill, the lessons, the EDDM script, and the self-score. Restart when you want a new Day 1.</p>" +
        '<button type="button" class="btn primary" data-action="go-drill" data-testid="start-drill">Start the 10-minute drill</button>' +
        '<button type="button" class="btn ghost" data-action="browse-lessons">Review all lessons</button>' +
        '<button type="button" class="btn ghost" data-action="restart-ask" data-testid="restart-ask">Restart the plan</button>' +
        "</section>";
    } else {
      html += '<section class="card">';
      html += '<p class="eyebrow">Week ' + status.week + " of 4 · Day " + status.dayNumber + " of 28</p>";
      html += "<h2>" + esc(status.plan.focus) + "</h2>";
      html += "<p class=\"fine\">This week's lessons: " + esc(status.plan.lessonsLabel) +
        ". They rotate through the seven days. Day 7 reviews them.</p>";
      if (status.reviewAll) {
        html += "<h3>Today: review all 11 lessons</h3>";
        html += "<p>Say the practice scripts out loud. Week 4 calls this review all.</p>";
        html += '<button type="button" class="btn primary" data-action="browse-lessons" data-testid="start-lesson">Open the lessons</button>';
      } else if (status.review) {
        html += "<h3>Today: review this week's lessons</h3>";
        status.lessonIds.forEach(function (id) {
          var lesson = lessonById(id);
          html += '<button type="button" class="btn primary" data-action="open-lesson" data-id="' + id + '" data-testid="start-lesson-' + id + '">Lesson ' + id + " — " + esc(lesson.title) + "</button>";
        });
      } else {
        var only = lessonById(status.lessonIds[0]);
        html += "<h3>Today's lesson</h3>";
        html += '<p class="lesson-name">Lesson ' + only.id + " — " + esc(only.title) + "</p>";
        html += '<button type="button" class="btn primary" data-action="open-lesson" data-id="' + only.id + '" data-testid="start-lesson">Start lesson ' + only.id + "</button>";
      }
      html += '<button type="button" class="btn primary" data-action="go-drill" data-testid="start-drill">Start the 10-minute drill</button>';
      html += '<p class="extra"><strong>Extra this week:</strong> ' + esc(status.plan.extra) + "</p>";
      html += "</section>";
    }

    if (parseISO(todayISO()).getDay() === 0) {
      html += '<section class="card banner"><h2>Sunday self-score</h2><p>' + markup(C.score.intro) + '</p>' +
        '<button type="button" class="btn ghost" data-action="go-score">Open the weekly self-score</button></section>';
    }

    if (state.confirmRestart) {
      html += '<section class="card">' +
        "<h2>Restart from today?</h2>" +
        "<p>Day 1 becomes today. Scores and completed lessons stay on this phone.</p>" +
        '<button type="button" class="btn primary" data-action="restart-yes" data-testid="restart-yes">Restart from today</button>' +
        '<button type="button" class="btn ghost" data-action="restart-no">Keep the current start date</button>' +
        "</section>";
    }

    html += "<h2 class=\"section-label\">The 4-week plan</h2>";
    C.weeks.forEach(function (w) {
      html += '<article class="card slim"><p class="eyebrow">Week ' + w.week + "</p><h3>" + esc(w.focus) +
        "</h3><p><strong>Lessons:</strong> " + esc(w.lessonsLabel) + "</p><p><strong>Extra:</strong> " + esc(w.extra) + "</p></article>";
    });

    html += '<section class="card">';
    html += "<h2>" + esc(C.howTo.heading) + "</h2>";
    C.howTo.paragraphs.forEach(function (p) { html += "<p>" + markup(p) + "</p>"; });
    html += "<h3>" + markup(C.howTo.routineLead) + "</h3>";
    html += "<ul>";
    C.howTo.routine.forEach(function (p) { html += "<li>" + markup(p) + "</li>"; });
    html += "</ul>";
    html += "<h3>" + markup(C.howTo.planLead) + "</h3>";
    html += "<p>The week-by-week plan is the list above.</p>";
    html += "<h3>" + markup(C.howTo.rulesLead) + "</h3>";
    html += "<ul>";
    C.howTo.rules.forEach(function (p) { html += "<li>" + markup(p) + "</li>"; });
    html += "</ul></section>";

    html += '<section class="card settings" id="settings">';
    html += "<h2>Settings</h2>";
    html += '<label class="field" for="start-date">Plan start date</label>';
    html += '<input id="start-date" data-testid="start-date" type="date" value="' + esc(state.settings.startDate) + '">';
    html += "<p class=\"fine\">The first time you open the app, this is set to that day. Change it if you started earlier or later.</p>";
    if (!state.confirmRestart) {
      html += '<button type="button" class="btn ghost" data-action="restart-ask">Restart the plan</button>';
    }
    html += '<p class="fine" data-testid="version">Version ' + esc(C.version) + "</p>";
    html += "<p class=\"fine\">No account. No analytics. Practice stays in this browser on this phone.</p>";
    html += "</section>";

    panel.innerHTML = html;
    if (state.tab === "today") window.scrollTo(0, y);
  }

  function renderDrill() {
    var panel = document.getElementById("panel-drill");
    var y = window.scrollY;
    var step = C.drill.steps[state.drillStep];
    var html = "";
    html += "<h2>" + esc(C.drill.heading) + "</h2>";
    html += "<p>" + esc(C.drill.intro) + "</p>";
    html += '<section class="card timer-card">';
    html += '<p class="eyebrow">10-minute drill timer</p>';
    html += '<p class="timer-num" id="timer-display" data-testid="timer">' + formatTime(state.timer.remainingMs) + "</p>";
    html += '<p id="timer-suggest">' + esc(suggestedLabel()) + "</p>";
    html += '<p id="timer-note"></p>';
    html += '<div class="row">';
    html += '<button type="button" class="btn primary" data-action="timer-toggle" data-testid="timer-toggle">Start</button>';
    html += '<button type="button" class="btn ghost" data-action="timer-reset" data-testid="timer-reset">Reset</button>';
    html += "</div>";
    html += '<p id="part-timer" data-testid="part-timer"></p>';
    html += "</section>";

    html += '<div class="step-rail" role="tablist" aria-label="Drill steps">';
    C.drill.steps.forEach(function (s, i) {
      var pressed = i === state.drillStep ? "true" : "false";
      html += '<button type="button" class="step-btn" data-action="drill-step" data-step="' + i + '" aria-pressed="' + pressed + '">' +
        (i + 1) + ". " + esc(s.title.replace(/^Step \d+ — /, "")) + "<span>" + esc(s.minutesLabel) + "</span></button>";
    });
    html += "</div>";

    html += '<article class="card" id="drill-step">';
    html += "<h2>" + esc(step.title) + "</h2>";
    html += '<p class="eyebrow">' + esc(step.minutesLabel) + "</p>";
    html += '<button type="button" class="btn ghost" data-action="part-timer" data-seconds="' + step.seconds + '" data-label="' + esc(step.title) + '">Time this step (' + formatTime(step.seconds * 1000) + ")</button>";

    if (step.parts) {
      step.parts.forEach(function (part) {
        html += "<h3>" + esc(part.label) + " (" + part.seconds + " sec)</h3>";
        html += "<p>" + esc(part.text) + "</p>";
        html += '<button type="button" class="btn tiny" data-action="part-timer" data-seconds="' + part.seconds + '" data-label="' + esc(part.label) + '">Time ' + part.seconds + " sec</button>";
      });
    }
    if (step.paragraphs) {
      step.paragraphs.forEach(function (p) { html += "<p>" + markup(p) + "</p>"; });
    }
    if (step.quote) {
      html += '<blockquote class="script">' + esc(step.quote) + "</blockquote>";
      html += voiceBar(false);
      html += speakBtn(step.quote, "Read aloud");
    }
    if (step.after) html += "<p>" + markup(step.after) + "</p>";
    if (step.sets) {
      html += "<p>" + markup(step.intro) + "</p>";
      html += voiceBar(false);
      step.sets.forEach(function (set) { html += renderSet(set); });
    }
    if (step.id === "pace") {
      html += '<button type="button" class="btn ghost" data-action="go-script">Open the EDDM script</button>';
    }
    if (step.checks) {
      html += '<div class="checks">';
      step.checks.forEach(function (c, i) {
        var on = state.checks["drill-" + i] ? " checked" : "";
        html += '<label class="check"><input type="checkbox" data-check="drill-' + i + '"' + on + "> <span>" + markup(c) + "</span></label>";
      });
      html += "</div>";
      html += '<button type="button" class="btn primary" data-action="open-recorder" data-label="Daily drill">Record a 30-second clip</button>';
    }
    html += '<div class="row">';
    if (state.drillStep > 0) {
      html += '<button type="button" class="btn ghost" data-action="drill-step" data-step="' + (state.drillStep - 1) + '">Previous step</button>';
    }
    if (state.drillStep < C.drill.steps.length - 1) {
      html += '<button type="button" class="btn primary" data-action="drill-step" data-step="' + (state.drillStep + 1) + '">Next step</button>';
    }
    html += "</div></article>";
    panel.innerHTML = html;
    paintTimer();
    paintPart();
    if (state.tab === "drill") window.scrollTo(0, y);
  }

  function renderSet(set) {
    var html = '<section class="twister">';
    html += "<h3>" + markup(set.title) + "</h3>";
    if (set.how) html += '<p><span class="how">How to:</span> ' + markup(set.how) + "</p>";
    if (set.howParagraphs) {
      html += '<p><span class="how">How to:</span></p>';
      set.howParagraphs.forEach(function (p) { html += "<p>" + markup(p) + "</p>"; });
    }
    set.lines.forEach(function (line, i) {
      var label = set.lineLabels && set.lineLabels[i] ? set.lineLabels[i] + " " : "";
      var note = set.lineNotes && set.lineNotes[i] ? ' <span class="note">' + markup(set.lineNotes[i]) + "</span>" : "";
      html += '<p class="line">' + esc(label) + '<span class="quote">"' + markup(line) + '"</span>' + note + " " + speakBtn(line) + "</p>";
    });
    if (set.business) {
      var bn = set.businessNote ? ' <span class="note">' + esc(set.businessNote) + "</span>" : "";
      html += '<p class="line"><span class="how">Business line:</span> <span class="quote">"' + markup(set.business) + '"</span>' + bn + " " + speakBtn(set.business) + "</p>";
    }
    html += "</section>";
    return html;
  }

  function renderLessons() {
    var panel = document.getElementById("panel-lessons");
    var y = window.scrollY;
    var done = loadLessons();
    var html = "";
    if (state.lessonOpen) {
      var lesson = lessonById(state.lessonOpen);
      var complete = !!done[String(lesson.id)];
      html += '<button type="button" class="btn ghost" data-action="close-lesson">All lessons</button>';
      html += '<article class="card">';
      html += '<p class="eyebrow">Lesson ' + lesson.id + " of 11</p>";
      html += "<h2>" + esc(lesson.title) + "</h2>";
      html += "<h3>Key idea</h3><p>" + markup(lesson.keyIdea) + "</p>";
      html += "<h3>Techniques</h3><ul>";
      lesson.techniques.forEach(function (t) { html += "<li>" + markup(t) + "</li>"; });
      html += "</ul>";
      html += "<h3>" + esc(lesson.scriptTitle) + "</h3>";
      html += legendHtml();
      html += '<blockquote class="script" data-testid="lesson-script">' + markup(lesson.script) + "</blockquote>";
      html += voiceBar(false);
      html += '<div class="row wrap">' + speakBtn(lesson.script, "Read script") +
        '<button type="button" class="btn ghost" data-action="open-recorder" data-label="Lesson ' + lesson.id + '">Record</button></div>';
      if (lesson.note) html += '<p class="note">' + esc(lesson.note) + "</p>";
      html += "<h3>5-minute exercise</h3><p>" + markup(lesson.exercise) + "</p>";
      html += '<button type="button" class="btn primary" data-action="toggle-complete" data-id="' + lesson.id +
        '" data-testid="mark-complete" aria-pressed="' + (complete ? "true" : "false") + '">' +
        (complete ? "Completed — tap to undo" : "Mark complete") + "</button>";
      html += "</article>";
    } else {
      html += "<h2>" + esc(C.lessonsIntro.heading) + "</h2>";
      html += "<p>" + esc(C.lessonsIntro.text) + "</p>";
      var status = planStatus();
      if (status.phase === "active" && (status.review || status.reviewAll)) {
        html += '<p class="banner-inline">Today is a review day. Say the scripts out loud.</p>';
      }
      html += '<div class="lesson-list">';
      C.lessons.forEach(function (lesson) {
        var on = done[String(lesson.id)] ? " done" : "";
        var today = status.phase === "active" && status.lessonIds.indexOf(lesson.id) !== -1;
        html += '<button type="button" class="lesson-row' + on + '" data-action="open-lesson" data-id="' + lesson.id + '" data-lesson="' + lesson.id + '">';
        html += '<span class="num">' + lesson.id + "</span>";
        html += "<span><strong>" + esc(lesson.title) + "</strong>";
        if (today) html += ' <em class="today-pill">Today</em>';
        if (done[String(lesson.id)]) html += ' <em class="done-pill">Complete</em>';
        html += "</span></button>";
      });
      html += "</div>";
    }
    panel.innerHTML = html;
    if (state.tab === "lessons") window.scrollTo(0, y);
  }

  function renderScript() {
    var panel = document.getElementById("panel-script");
    var y = window.scrollY;
    var ed = C.eddm;
    var html = "";
    html += "<h2>" + esc(ed.heading) + "</h2>";
    html += legendHtml();
    html += "<p class=\"note\">" + esc(ed.timing) + "</p>";
    html += '<div class="row wrap">';
    html += '<button type="button" class="btn primary" data-action="open-prompter" data-testid="open-prompter">Teleprompter</button>';
    html += speakBtn(ed.lines.join(" "), "Read aloud");
    html += '<button type="button" class="btn ghost" data-action="open-recorder" data-label="EDDM script">Record</button>';
    html += "</div>";
    html += voiceBar(true);
    html += '<article class="card script-block" data-testid="eddm-script">';
    ed.lines.forEach(function (line) {
      html += '<p class="script-line">' + markup(line) + " " + speakBtn(line, "Read line") + "</p>";
    });
    html += "</article>";
    html += '<p class="note">' + esc(ed.note) + "</p>";
    html += "<h2>" + esc(ed.rehearsal.heading) + "</h2>";
    html += "<h3>" + markup(ed.rehearsal.beforeLead) + "</h3><ul>";
    ed.rehearsal.before.forEach(function (p) { html += "<li>" + markup(p) + "</li>"; });
    html += "</ul><h3>" + markup(ed.rehearsal.dayLead) + "</h3><ul>";
    ed.rehearsal.day.forEach(function (p) { html += "<li>" + markup(p) + "</li>"; });
    html += "</ul><h3>" + markup(ed.rehearsal.reviewLead) + "</h3><ul>";
    ed.rehearsal.review.forEach(function (p) { html += "<li>" + markup(p) + "</li>"; });
    html += "</ul><p>" + markup(ed.rehearsal.close) + "</p>";
    panel.innerHTML = html;
    if (state.tab === "script") window.scrollTo(0, y);
  }

  function renderScore() {
    var panel = document.getElementById("panel-score");
    var y = window.scrollY;
    if (!state.activeWeekKey) state.activeWeekKey = defaultWeekKey();
    var stored = loadScores();
    var rec = stored.weeks[state.activeWeekKey] || { planWeek: 1, scores: {}, win: "", nextFocus: "" };
    var total = weekTotal(rec);
    var keys = weekKeys();
    var html = "";
    html += "<h2>" + esc(C.score.heading) + "</h2>";
    html += "<p>" + markup(C.score.intro) + "</p>";
    html += "<p class=\"fine\">" + esc(C.score.scale) + " The daily-drill row is scored 1–5 on the sheet, same as the other skills, so the total is 75.</p>";
    html += '<div class="week-chips" role="tablist" aria-label="Plan weeks">';
    keys.forEach(function (w) {
      var on = w.key === state.activeWeekKey ? "true" : "false";
      html += '<button type="button" class="chip" data-action="select-week" data-week="' + w.key + '" aria-pressed="' + on + '">Week ' + w.planWeek + "</button>";
    });
    html += "</div>";
    var activeMeta = null;
    keys.forEach(function (w) { if (w.key === state.activeWeekKey) activeMeta = w; });
    html += '<p class="fine">' + (activeMeta ? ("Week " + activeMeta.planWeek + " · " + shortRange(activeMeta.key)) : ("Saved week · " + esc(state.activeWeekKey))) + "</p>";
    html += '<p class="total" data-testid="week-total">Total ' + total.sum + " / 75</p>";
    html += '<p class="fine" data-testid="week-counted">' + total.n + " of " + C.score.skills.length + " skills scored</p>";
    html += '<div class="skills">';
    C.score.skills.forEach(function (skill, i) {
      var current = Number(rec.scores[i]);
      html += '<fieldset class="skill"><legend>' + esc(skill) + "</legend><div class=\"score-row\">";
      for (var n = 1; n <= 5; n++) {
        var pressed = current === n ? "true" : "false";
        html += '<button type="button" data-action="rate" data-skill="' + i + '" data-value="' + n +
          '" data-testid="skill-' + i + "-" + n + '" aria-pressed="' + pressed + '">' + n + "</button>";
      }
      html += "</div></fieldset>";
    });
    html += "</div>";
    html += '<label class="field" for="win-text">' + esc(C.score.winLabel) + "</label>";
    html += '<textarea id="win-text" data-field="win" rows="2">' + esc(rec.win || "") + "</textarea>";
    html += '<label class="field" for="next-text">' + esc(C.score.nextLabel) + "</label>";
    html += '<textarea id="next-text" data-field="nextFocus" rows="2">' + esc(rec.nextFocus || "") + "</textarea>";
    html += "<h2>Past weeks</h2>";
    html += '<ul class="history" data-testid="score-history">';
    var historyKeys = Object.keys(stored.weeks).sort().reverse();
    if (!historyKeys.length) {
      html += "<li class=\"fine\">Weeks you score show up here and stay on this phone.</li>";
    }
    historyKeys.forEach(function (key) {
      var item = stored.weeks[key];
      var t = weekTotal(item);
      html += '<li><button type="button" data-action="select-week" data-week="' + esc(key) + '">Week ' +
        esc(item.planWeek || "?") + " · " + esc(key) + " · Total " + t.sum + " / 75</button></li>";
    });
    html += "</ul>";
    html += '<p class="closing">' + esc(C.score.close) + "</p>";
    panel.innerHTML = html;
    if (state.tab === "score") window.scrollTo(0, y);
  }

  function fillPrompter() {
    var box = document.getElementById("prompter-text");
    if (!box) return;
    var html = "";
    C.eddm.lines.forEach(function (line) {
      html += '<p class="prompter-line">' + markup(line) + "</p>";
    });
    html += '<div class="prompter-spacer"></div>';
    box.innerHTML = html;
    box.style.fontSize = state.prompter.fontSize + "px";
    var speed = document.getElementById("prompter-speed-value");
    if (speed) speed.textContent = String(state.prompter.speed);
    var font = document.getElementById("prompter-font-value");
    if (font) font.textContent = String(state.prompter.fontSize);
  }

  function renderPanel(name) {
    if (name === "today") renderToday();
    if (name === "drill") renderDrill();
    if (name === "lessons") renderLessons();
    if (name === "script") renderScript();
    if (name === "score") renderScore();
  }

  function switchTab(name) {
    state.tab = name;
    var panels = document.querySelectorAll("[data-panel]");
    for (var i = 0; i < panels.length; i++) {
      panels[i].hidden = panels[i].getAttribute("data-panel") !== name;
    }
    var tabs = document.querySelectorAll("[data-tab]");
    for (var t = 0; t < tabs.length; t++) {
      var on = tabs[t].getAttribute("data-tab") === name;
      tabs[t].setAttribute("aria-selected", on ? "true" : "false");
    }
    var titles = {
      today: "Today",
      drill: "Daily Drill",
      lessons: "Lessons",
      script: "EDDM Script",
      score: "Self-Score"
    };
    var h = document.getElementById("page-title");
    if (h) h.textContent = titles[name] || "Speech Coach";
    renderPanel(name);
    window.scrollTo(0, 0);
  }

  function openLesson(id) {
    state.lessonOpen = Number(id);
    switchTab("lessons");
  }

  async function requestWake() {
    state.wakeLock = null;
    if (!("wakeLock" in navigator) || !navigator.wakeLock || typeof navigator.wakeLock.request !== "function") return;
    try {
      state.wakeLock = await navigator.wakeLock.request("screen");
    } catch (err) {
      state.wakeLock = null;
    }
  }

  function releaseWake() {
    var lock = state.wakeLock;
    state.wakeLock = null;
    if (lock && typeof lock.release === "function") {
      lock.release().catch(function () {});
    }
  }

  function playPrompter() {
    var scroller = document.getElementById("prompter-scroll");
    if (!scroller) return;
    state.prompter.playing = true;
    state.prompter.lastTs = Date.now();
    if (state.prompter.id) clearInterval(state.prompter.id);
    state.prompter.id = setInterval(tickPrompter, 50);
    var btn = document.querySelector("[data-testid='prompter-play']");
    if (btn) btn.textContent = "Pause";
    requestWake();
  }

  function pausePrompter() {
    state.prompter.playing = false;
    if (state.prompter.id) clearInterval(state.prompter.id);
    state.prompter.id = 0;
    var btn = document.querySelector("[data-testid='prompter-play']");
    if (btn) btn.textContent = "Play";
    releaseWake();
  }

  function tickPrompter() {
    if (!state.prompter.playing) return;
    var scroller = document.getElementById("prompter-scroll");
    if (!scroller) return;
    var now = Date.now();
    var dt = (now - state.prompter.lastTs) / 1000;
    state.prompter.lastTs = now;
    scroller.scrollTop += state.prompter.speed * dt;
    var max = scroller.scrollHeight - scroller.clientHeight;
    if (scroller.scrollTop >= max - 1) pausePrompter();
  }

  function openPrompter() {
    fillPrompter();
    var root = document.getElementById("prompter");
    root.hidden = false;
    var scroller = document.getElementById("prompter-scroll");
    scroller.scrollTop = 0;
    pausePrompter();
    var play = document.querySelector("[data-testid='prompter-play']");
    if (play) play.textContent = "Play";
  }

  function closePrompter() {
    pausePrompter();
    document.getElementById("prompter").hidden = true;
  }

  function friendlyMic(err) {
    var name = err && err.name ? err.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return "The microphone is blocked. You can allow it in the browser settings, or practice out loud. Recordings never leave this phone.";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return "No microphone was found. You can still practice out loud. Nothing is uploaded.";
    }
    if (name === "NotReadableError" || name === "SecurityError" || name === "AbortError") {
      return "The microphone couldn't be used just now. You can still practice out loud. Nothing is uploaded.";
    }
    return "Recording isn't available here. You can still practice out loud. Nothing is uploaded.";
  }

  function pickRecorderMime(isSupported) {
    var types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac", "audio/mpeg"];
    for (var i = 0; i < types.length; i++) {
      try {
        if (isSupported(types[i])) return types[i];
      } catch (err) {
        /* keep looking */
      }
    }
    return "";
  }
  window.pickRecorderMime = pickRecorderMime;

  function openDb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        reject(new Error("no-idb"));
        return;
      }
      var req = indexedDB.open("speech-coach", 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains("recordings")) {
          db.createObjectStore("recordings", { keyPath: "id" });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function idbPut(rec) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("recordings", "readwrite");
        tx.objectStore("recordings").put(rec);
        tx.oncomplete = function () { db.close(); resolve(); };
        tx.onerror = function () { db.close(); reject(tx.error); };
      });
    });
  }

  function idbAll() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("recordings", "readonly");
        var req = tx.objectStore("recordings").getAll();
        req.onsuccess = function () { db.close(); resolve(req.result || []); };
        req.onerror = function () { db.close(); reject(req.error); };
      });
    });
  }

  function idbDelete(id) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("recordings", "readwrite");
        tx.objectStore("recordings").delete(id);
        tx.oncomplete = function () { db.close(); resolve(); };
        tx.onerror = function () { db.close(); reject(tx.error); };
      });
    });
  }

  function setRecStatus(msg) {
    var el = document.getElementById("rec-status");
    if (el) el.textContent = msg || "";
  }

  async function renderRecordings() {
    var list = document.getElementById("rec-list");
    if (!list) return;
    var rows = [];
    try {
      rows = await idbAll();
    } catch (err) {
      rows = [];
    }
    var seen = {};
    rows.forEach(function (r) { seen[r.id] = true; });
    state.memoryRecs.forEach(function (r) {
      if (!seen[r.id]) rows.push(r);
    });
    rows.sort(function (a, b) { return b.created - a.created; });
    if (!rows.length) {
      list.innerHTML = '<li class="fine">No clips yet.</li>';
      return;
    }
    list.innerHTML = rows.map(function (r) {
      var when = new Date(r.created).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
      return "<li><span>" + esc(r.label || "Practice") + " · " + esc(when) + "</span>" +
        '<button type="button" class="btn tiny" data-action="play-rec" data-id="' + r.id + '">Play</button>' +
        '<button type="button" class="btn tiny danger" data-action="discard-rec" data-id="' + r.id + '">Discard</button></li>';
    }).join("");
    state.recCache = rows;
  }

  function findRec(id) {
    var rows = state.recCache || [];
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i].id) === String(id)) return rows[i];
    }
    return null;
  }

  async function startRecording() {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function" || typeof MediaRecorder === "undefined") {
      setRecStatus("Recording isn't available in this browser. You can still practice out loud. Nothing is uploaded.");
      return;
    }
    if (state.mediaRecorder && state.mediaRecorder.state === "recording") return;
    var stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setRecStatus(friendlyMic(err));
      return;
    }
    var mime = pickRecorderMime(function (type) {
      return !!(MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type));
    });
    var rec;
    try {
      rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch (err) {
      try {
        rec = new MediaRecorder(stream);
        mime = rec.mimeType || "";
      } catch (err2) {
        stream.getTracks().forEach(function (track) { track.stop(); });
        setRecStatus("Recording isn't available in this browser. You can still practice out loud. Nothing is uploaded.");
        return;
      }
    }
    state.recChunks = [];
    state.recStream = stream;
    state.mediaRecorder = rec;
    rec.ondataavailable = function (e) {
      if (e.data && e.data.size > 0) state.recChunks.push(e.data);
    };
    rec.onstop = function () {
      stream.getTracks().forEach(function (track) { track.stop(); });
      var type = rec.mimeType || mime || "audio/mp4";
      var blob = new Blob(state.recChunks, { type: type });
      state.mediaRecorder = null;
      state.recStream = null;
      var stopBtn = document.querySelector("[data-testid='rec-stop']");
      var startBtn = document.querySelector("[data-testid='rec-start']");
      if (stopBtn) stopBtn.hidden = true;
      if (startBtn) startBtn.hidden = false;
      if (!blob.size) {
        setRecStatus("Nothing was captured. Try recording again.");
        return;
      }
      var item = { id: Date.now(), created: Date.now(), mime: type, label: state.recLabel, blob: blob };
      idbPut(item).then(function () {
        setRecStatus("Saved on this phone. It is not uploaded.");
        return renderRecordings();
      }).catch(function () {
        state.memoryRecs.push(item);
        setRecStatus("Saved for this visit only. It is not uploaded.");
        return renderRecordings();
      });
    };
    try {
      rec.start();
    } catch (err) {
      stream.getTracks().forEach(function (track) { track.stop(); });
      setRecStatus("Recording isn't available in this browser. You can still practice out loud. Nothing is uploaded.");
      return;
    }
    var stopBtn2 = document.querySelector("[data-testid='rec-stop']");
    var startBtn2 = document.querySelector("[data-testid='rec-start']");
    if (stopBtn2) stopBtn2.hidden = false;
    if (startBtn2) startBtn2.hidden = true;
    setRecStatus("Recording… tap Stop when you are done.");
  }

  function stopRecording() {
    var rec = state.mediaRecorder;
    if (!rec || rec.state === "inactive") return;
    try {
      if (typeof rec.requestData === "function") rec.requestData();
    } catch (err) { /* optional */ }
    try {
      rec.stop();
    } catch (err) {
      setRecStatus("Recording stopped, but the clip could not be saved. Nothing was uploaded.");
    }
  }

  function playRec(id) {
    var rec = findRec(id);
    var audio = document.getElementById("rec-audio");
    if (!rec || !rec.blob || !audio) {
      setRecStatus("That clip isn't available anymore.");
      return;
    }
    if (state.recUrls[id]) URL.revokeObjectURL(state.recUrls[id]);
    var url = URL.createObjectURL(rec.blob);
    state.recUrls[id] = url;
    audio.hidden = false;
    audio.src = url;
    var played = audio.play();
    if (played && typeof played.catch === "function") {
      played.catch(function () {
        setRecStatus("Playback didn't start. Use the audio controls under the list. The clip stays on this phone.");
      });
    }
  }

  async function discardRec(id) {
    var audio = document.getElementById("rec-audio");
    if (audio && state.recUrls[id] && audio.src === state.recUrls[id]) {
      audio.pause();
      audio.removeAttribute("src");
      audio.hidden = true;
    }
    if (state.recUrls[id]) {
      URL.revokeObjectURL(state.recUrls[id]);
      delete state.recUrls[id];
    }
    state.memoryRecs = state.memoryRecs.filter(function (r) { return String(r.id) !== String(id); });
    try { await idbDelete(Number(id)); } catch (err) { /* memory copy already removed */ }
    setRecStatus("Clip discarded. It was only on this phone.");
    await renderRecordings();
  }

  function openRecorder(label) {
    state.recLabel = label || "Practice";
    var sheet = document.getElementById("recorder");
    sheet.hidden = false;
    var name = document.getElementById("rec-label");
    if (name) name.textContent = state.recLabel;
    setRecStatus("");
    renderRecordings();
  }

  function closeRecorder() {
    if (state.mediaRecorder && state.mediaRecorder.state === "recording") stopRecording();
    document.getElementById("recorder").hidden = true;
  }

  function onClick(e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var action = el.getAttribute("data-action");
    if (action === "tab") {
      switchTab(el.getAttribute("data-tab"));
      return;
    }
    if (action === "go-drill") { switchTab("drill"); return; }
    if (action === "go-script") { switchTab("script"); return; }
    if (action === "go-score") { switchTab("score"); return; }
    if (action === "browse-lessons") {
      state.lessonOpen = null;
      switchTab("lessons");
      return;
    }
    if (action === "open-lesson") { openLesson(el.getAttribute("data-id")); return; }
    if (action === "close-lesson") {
      state.lessonOpen = null;
      renderLessons();
      window.scrollTo(0, 0);
      return;
    }
    if (action === "timer-toggle") {
      if (state.timer.running) pauseMainTimer();
      else startMainTimer();
      return;
    }
    if (action === "timer-reset") { resetMainTimer(); return; }
    if (action === "drill-step") {
      state.drillStep = Number(el.getAttribute("data-step"));
      renderDrill();
      var card = document.getElementById("drill-step");
      if (card) card.scrollIntoView({ block: "start" });
      return;
    }
    if (action === "part-timer") {
      startPart(Number(el.getAttribute("data-seconds")), el.getAttribute("data-label"));
      return;
    }
    if (action === "toggle-complete") {
      var id = String(el.getAttribute("data-id"));
      var map = loadLessons();
      map[id] = !map[id];
      if (!map[id]) delete map[id];
      saveLessons(map);
      renderLessons();
      return;
    }
    if (action === "speak") {
      speak(decodeURIComponent(el.getAttribute("data-speak") || ""));
      return;
    }
    if (action === "stop-speech") {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      return;
    }
    if (action === "toggle-slower") {
      state.slowerSpeech = !state.slowerSpeech;
      if (state.tab === "drill") renderDrill();
      if (state.tab === "lessons") renderLessons();
      if (state.tab === "script") renderScript();
      return;
    }
    if (action === "open-prompter") { openPrompter(); return; }
    if (action === "prompter-toggle") {
      if (state.prompter.playing) pausePrompter();
      else playPrompter();
      return;
    }
    if (action === "prompter-close") { closePrompter(); return; }
    if (action === "restart-ask") {
      state.confirmRestart = true;
      renderToday();
      var yes = document.querySelector("[data-testid='restart-yes']");
      if (yes) yes.scrollIntoView({ block: "center" });
      return;
    }
    if (action === "restart-no") {
      state.confirmRestart = false;
      renderToday();
      return;
    }
    if (action === "restart-yes") {
      state.settings.startDate = todayISO();
      state.confirmRestart = false;
      state.activeWeekKey = null;
      saveSettings();
      switchTab("today");
      return;
    }
    if (action === "select-week") {
      state.activeWeekKey = el.getAttribute("data-week");
      renderScore();
      return;
    }
    if (action === "rate") {
      var skill = el.getAttribute("data-skill");
      var value = Number(el.getAttribute("data-value"));
      var key = state.activeWeekKey || defaultWeekKey();
      state.activeWeekKey = key;
      var all = ensureWeek(key);
      var weekRec = all.weeks[key];
      if (Number(weekRec.scores[skill]) === value) delete weekRec.scores[skill];
      else weekRec.scores[skill] = value;
      weekRec.updated = Date.now();
      var keys = weekKeys();
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].key === key) weekRec.planWeek = keys[i].planWeek;
      }
      saveScores(all);
      renderScore();
      return;
    }
    if (action === "open-recorder") { openRecorder(el.getAttribute("data-label")); return; }
    if (action === "close-recorder") { closeRecorder(); return; }
    if (action === "rec-start") { startRecording(); return; }
    if (action === "rec-stop") { stopRecording(); return; }
    if (action === "play-rec") { playRec(el.getAttribute("data-id")); return; }
    if (action === "discard-rec") { discardRec(el.getAttribute("data-id")); return; }
  }

  function onChange(e) {
    var t = e.target;
    if (t && t.id === "start-date") {
      var v = t.value;
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        state.settings.startDate = v;
        state.activeWeekKey = null;
        saveSettings();
        renderToday();
        renderScore();
      }
    }
    if (t && t.getAttribute("data-check")) {
      state.checks[t.getAttribute("data-check")] = !!t.checked;
    }
  }

  function onInput(e) {
    var t = e.target;
    if (t && (t.getAttribute("data-field") === "win" || t.getAttribute("data-field") === "nextFocus")) {
      var key = state.activeWeekKey || defaultWeekKey();
      state.activeWeekKey = key;
      var all = ensureWeek(key);
      all.weeks[key][t.getAttribute("data-field")] = t.value;
      all.weeks[key].updated = Date.now();
      var keys = weekKeys();
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].key === key) all.weeks[key].planWeek = keys[i].planWeek;
      }
      saveScores(all);
    }
    if (t && t.id === "prompter-speed") {
      state.prompter.speed = Number(t.value);
      var label = document.getElementById("prompter-speed-value");
      if (label) label.textContent = String(state.prompter.speed);
    }
    if (t && t.id === "prompter-font") {
      state.prompter.fontSize = Number(t.value);
      var box = document.getElementById("prompter-text");
      if (box) box.style.fontSize = state.prompter.fontSize + "px";
      var fontLabel = document.getElementById("prompter-font-value");
      if (fontLabel) fontLabel.textContent = String(state.prompter.fontSize);
    }
  }

  function init() {
    var had = localStorage.getItem(SETTINGS_KEY);
    state.settings = loadSettings();
    if (!had) saveSettings();
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = function () {
        window.speechSynthesis.getVoices();
      };
    }
    document.body.addEventListener("click", onClick);
    document.body.addEventListener("change", onChange);
    document.body.addEventListener("input", onInput);
    var scroller = document.getElementById("prompter-scroll");
    scroller.addEventListener("click", function () {
      if (state.prompter.playing) pausePrompter();
      else playPrompter();
    });
    document.getElementById("recorder").addEventListener("click", function (e) {
      if (e.target.id === "recorder") closeRecorder();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible" && state.prompter.playing) requestWake();
    });
    switchTab("today");
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
