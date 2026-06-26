(function () {
  "use strict";

  const Data = window.LegacyLeagueData;
  const Logic = window.LegacyLeagueLogic;
  const Storage = window.LegacyLeagueStorage;
  const GENETIC_KEYS = ["speed", "strength", "endurance", "coordination", "recovery", "iq", "naturalPotential"];
  const REGULAR_GENETICS_BUDGET = 650;
  const REGULAR_GENETIC_MAX = 125;
  const GOD_GENETIC_MAX = 150;

  const app = document.getElementById("app");
  const topActions = document.getElementById("topActions");
  const toast = document.getElementById("toast");

  let state = null;
  let activeTab = "career";
  let selectedSlot = 1;
  let advanceStep = 1;
  let darkMode = localStorage.getItem("legacy-league-theme") === "dark";
  let soundEnabled = localStorage.getItem("legacy-league-sound") === "on";
  let audioContext = null;
  let ambientNodes = null;

  const actionIconFallbacks = {
    early_development: "🧸",
    backyard_play: "🌤️",
    playground_games: "🛝",
    balanced_training: "🏃",
    skill_lab: "🎯",
    strength_speed: "💪",
    recovery_block: "🛌",
    sleep_routine: "🌙",
    nutrition_plan: "🥗",
    film_study: "🎞️",
    footwork_drills: "👟",
    clutch_practice: "⏱️",
    mobility_work: "🧘",
    mental_coach: "🧠",
    offseason_camp: "⛺",
    family_time: "🏠",
    mom_time: "👩",
    dad_time: "👨",
    sibling_time: "🧒",
    family_dinner: "🍽️",
    friend_hangout: "👥",
    school_club: "🎒",
    coach_meeting: "📋",
    coach_intro: "🤝",
    mentor_session: "🧭",
    team_bonding: "🤝",
    teammate_checkin: "🧑",
    rivalry_focus: "🔥",
    agent_meeting: "💼",
    nil_push: "📣",
    local_sponsor: "🏪",
    merch_drop: "👕",
    budget_review: "🧾",
    smart_investment: "📈",
    lifestyle_splurge: "💸",
    press_work: "🎙️",
    social_posting: "📱",
    training_clip: "🎬",
    fan_qna: "💬",
    apology_statement: "🧯",
    charity_event: "❤️",
    podcast_clip: "🎧",
    behind_scenes: "🎥",
    media_blackout: "🔕"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function money(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function applyTheme() {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }

  function ensureAudio() {
    if (audioContext || !window.AudioContext && !window.webkitAudioContext) return audioContext;
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioClass();
    return audioContext;
  }

  function createSoftNoiseBuffer(context, seconds) {
    const length = Math.floor(context.sampleRate * seconds);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let index = 0; index < length; index += 1) {
      const white = Math.random() * 2 - 1;
      last = last * 0.985 + white * 0.015;
      data[index] = last * 0.7;
    }
    return buffer;
  }

  function startAmbient() {
    const context = ensureAudio();
    if (!context || ambientNodes) return;
    const source = context.createBufferSource();
    const master = context.createGain();
    const lowpass = context.createBiquadFilter();
    const highpass = context.createBiquadFilter();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

    source.buffer = createSoftNoiseBuffer(context, 5);
    source.loop = true;
    highpass.type = "highpass";
    highpass.frequency.value = 120;
    lowpass.type = "lowpass";
    lowpass.frequency.value = 620;
    lowpass.Q.value = 0.4;
    lfo.type = "sine";
    lfo.frequency.value = 0.045;
    lfoGain.gain.value = 90;
    master.gain.value = 0;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(master);
    master.connect(context.destination);
    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);
    source.start();
    lfo.start();
    master.gain.setTargetAtTime(0.026, context.currentTime, 0.8);
    ambientNodes = { source, lfo, master };
  }

  function stopAmbient() {
    if (!ambientNodes) return;
    ambientNodes.master.gain.setTargetAtTime(0, audioContext.currentTime, 0.12);
    window.setTimeout(() => {
      try {
        ambientNodes.source.stop();
        ambientNodes.lfo.stop();
      } catch (error) {}
      ambientNodes = null;
    }, 420);
  }

  function setSoundEnabled(enabled) {
    soundEnabled = enabled;
    localStorage.setItem("legacy-league-sound", soundEnabled ? "on" : "off");
    if (soundEnabled && audioContext?.state === "suspended") audioContext.resume();
    if (soundEnabled) startAmbient();
    else stopAmbient();
  }

  function playClickSound() {
    if (!soundEnabled) return;
    const context = ensureAudio();
    if (!context) return;
    if (!ambientNodes) startAmbient();
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const length = Math.floor(context.sampleRate * 0.035);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) {
      const fade = 1 - index / length;
      data[index] = (Math.random() * 2 - 1) * fade * fade;
    }
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    gain.gain.setValueAtTime(0.028, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.035);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start();
  }

  function percent(value) {
    return Logic.clamp(Math.round(value), 0, 100);
  }

  function moodForState(currentState) {
    const r = currentState.ratings;
    if (r.burnout > 72) return { icon: "😵", label: "Overheated", detail: "Recovery needs attention.", value: 100 - r.burnout };
    if (r.mental > 68 && r.confidence > 60) return { icon: "🌤️", label: "Glowing", detail: "The dream feels close.", value: (r.mental + r.confidence) / 2 };
    if (r.confidence < 38) return { icon: "🌧️", label: "Doubting", detail: "Confidence is wobbling.", value: r.confidence };
    if (r.motivation > 70) return { icon: "🔥", label: "Hungry", detail: "Motivation is carrying the month.", value: r.motivation };
    return { icon: "🌿", label: "Steady", detail: "Nothing flashy. Good foundation.", value: (r.mental + r.motivation) / 2 };
  }

  function nextUnlock(currentState) {
    const locked = Data.actions
      .map((action) => ({ action, rule: Logic.actionRule(action.id) }))
      .filter((item) => currentState.profile.age < (item.rule.minAge || 0))
      .sort((a, b) => (a.rule.minAge || 0) - (b.rule.minAge || 0));
    if (!locked.length) return { label: "All focuses unlocked", detail: "The full toolkit is open.", value: 100 };
    const next = locked[0];
    const age = next.rule.minAge || 0;
    return {
      label: `${emojiForAction(next.action.id)} ${next.action.label}`,
      detail: `Unlocks at age ${age}.`,
      value: age ? (currentState.profile.age / age) * 100 : 100
    };
  }

  function storyHook(currentState) {
    const flags = currentState.flags || {};
    if (currentState.pendingEvent) return { icon: "⚡", label: "Decision Time", detail: currentState.pendingEvent.title, value: 100 };
    if (flags.partyRisk) return { icon: "🌙", label: "Temptation Arc", detail: "Discipline could swing the save.", value: currentState.ratings.discipline };
    if (flags.signatureSkill) return { icon: "✨", label: "Signature Skill", detail: "A star identity is forming.", value: currentState.ratings.skill };
    if (flags.eliteAcademy) return { icon: "🚚", label: "Away From Home", detail: "Academy pressure is shaping them.", value: currentState.ratings.mental };
    if (currentState.profile.age < 8) return { icon: "🧸", label: "Tiny Foundations", detail: "Family and joy matter most.", value: currentState.ratings.family };
    if (!currentState.career.pro && currentState.profile.age >= 14) return { icon: "👀", label: "Scout Watch", detail: "Rankings can move fast now.", value: currentState.career.draftStock };
    return { icon: "📖", label: "Story Brewing", detail: "Advance time to reveal the next arc.", value: currentState.ratings.motivation };
  }

  function goalRows(currentState) {
    const r = currentState.ratings;
    const rows = [
      { label: "Stay healthy", value: 100 - r.injuryRisk, detail: "Keep injury risk low." },
      { label: "Build joy", value: (r.mental + r.motivation + r.family) / 3, detail: "Mental, motivation, and family." },
      { label: "Earn attention", value: currentState.career.pro ? r.public : currentState.career.draftStock, detail: currentState.career.pro ? "Public perception." : "Draft stock." },
      { label: "Create wealth", value: Math.min(100, (currentState.finance.wealth / 1000000) * 100), detail: "Long-term financial freedom." }
    ];
    if (currentState.profile.age < 12) rows[2] = { label: "Love the game", value: (r.motivation + r.family + (100 - r.burnout)) / 3, detail: "Joy before hype." };
    return rows;
  }

  function progressBar(value) {
    return `<div class="mini-progress"><span style="width:${percent(value)}%"></span></div>`;
  }

  function render() {
    applyTheme();
    renderTopActions();
    if (!state) {
      renderCreateScreen();
      return;
    }
    state = Logic.migrateState(state);
    renderCareerScreen();
  }

  function cleanEmoji(value, fallback) {
    return value && String(value).trim().toLowerCase() !== "undefined" ? value : fallback;
  }

  function emojiForSport(sportId) {
    return cleanEmoji(Data.emojis?.sports?.[sportId], "");
  }

  function emojiForGender(genderId) {
    return cleanEmoji(Data.emojis?.genders?.[genderId], "🧑");
  }

  function emojiForAction(actionId) {
    return cleanEmoji(actionIconFallbacks[actionId] || Data.emojis?.actions?.[actionId], "✨");
  }

  function emojiForFamily(familyId) {
    return cleanEmoji(Data.emojis?.families?.[familyId], "🏠");
  }

  function emojiForEvent(eventId) {
    return cleanEmoji(Data.emojis?.events?.[eventId], "⚡");
  }

  function renderTopActions() {
    const slots = Storage.list();
    topActions.innerHTML = `
      <button class="ghost-button" data-action="new-career">New</button>
      <select class="slot-picker" data-action="select-slot" aria-label="Save slot">
        ${slots
          .map(
            (slot) =>
              `<option value="${slot.slot}" ${slot.slot === selectedSlot ? "selected" : ""}>Slot ${slot.slot}${slot.empty ? "" : ` - ${escapeHtml(slot.name)}`}</option>`
          )
          .join("")}
      </select>
      <button class="ghost-button" data-action="toggle-theme">${darkMode ? "Light" : "Dark"}</button>
      <button class="ghost-button" data-action="toggle-sound">${soundEnabled ? "Sound On" : "Sound Off"}</button>
      <button class="ghost-button" data-action="quick-save" ${state ? "" : "disabled"}>Save</button>
      <button class="ghost-button" data-action="quick-load">Load</button>
    `;
  }

  function optionList(items, current) {
    return items.map((item) => `<option value="${escapeHtml(item)}" ${item === current ? "selected" : ""}>${escapeHtml(item)}</option>`).join("");
  }

  function keyedOptions(items, current) {
    return Object.keys(items)
      .map((key) => `<option value="${key}" ${key === current ? "selected" : ""}>${escapeHtml(items[key].label)}</option>`)
      .join("");
  }

  function familyOptions(current) {
    return Object.keys(Data.families)
      .map((key) => `<option value="${key}" ${key === current ? "selected" : ""}>${emojiForFamily(key)} ${escapeHtml(Data.families[key].label)}</option>`)
      .join("");
  }

  function sportOptions(current) {
    return Object.keys(Data.sports)
      .map((key) => `<option value="${key}" ${key === current ? "selected" : ""}>${emojiForSport(key)} ${escapeHtml(Data.sports[key].label)}</option>`)
      .join("");
  }

  function genderOptions(current) {
    return Data.genders
      .map((gender) => `<option value="${gender.id}" ${gender.id === current ? "selected" : ""}>${emojiForGender(gender.id)} ${escapeHtml(gender.label)}</option>`)
      .join("");
  }

  function roleOptions(sportId, current) {
    const sport = Data.sports[sportId];
    if (!sport.positions.length) {
      return `<option value="">Weight class auto-assigned</option>`;
    }
    return sport.positions.map((role) => `<option value="${escapeHtml(role)}" ${role === current ? "selected" : ""}>${escapeHtml(role)}</option>`).join("");
  }

  function geneticsTotal(source) {
    return GENETIC_KEYS.reduce((sum, key) => sum + Number(source[key] || 0), 0);
  }

  function fitRegularGenetics(payload) {
    const next = { ...payload, creationMode: "regular" };
    GENETIC_KEYS.forEach((key) => {
      next[key] = Logic.clamp(Math.round(Number(next[key] || 55)), 25, REGULAR_GENETIC_MAX);
    });
    while (geneticsTotal(next) > REGULAR_GENETICS_BUDGET) {
      const highestKey = GENETIC_KEYS.reduce((best, key) => (next[key] > next[best] ? key : best), GENETIC_KEYS[0]);
      if (next[highestKey] <= 25) break;
      next[highestKey] -= 1;
    }
    while (geneticsTotal(next) < REGULAR_GENETICS_BUDGET) {
      const openKeys = GENETIC_KEYS.filter((key) => next[key] < REGULAR_GENETIC_MAX);
      if (!openKeys.length) break;
      const key = openKeys[Math.floor(Math.random() * openKeys.length)];
      next[key] += 1;
    }
    return next;
  }

  function maxGodGenetics(payload) {
    const next = { ...payload, creationMode: "god" };
    GENETIC_KEYS.forEach((key) => {
      next[key] = GOD_GENETIC_MAX;
    });
    return next;
  }

  function presetPayload(kind) {
    const base = Logic.randomCareerPayload();
    if (kind === "prodigy") {
      return {
        ...base,
        creationMode: "god",
        name: "Mika Starling",
        family: "supportive",
        personality: "driven",
        speed: 82,
        strength: 72,
        endurance: 78,
        coordination: 88,
        recovery: 76,
        iq: 84,
        naturalPotential: 92
      };
    }
    if (kind === "underdog") {
      return {
        ...base,
        creationMode: "regular",
        name: "Ari Stone",
        family: "working",
        personality: "analytical",
        speed: 50,
        strength: 48,
        endurance: 62,
        coordination: 55,
        recovery: 56,
        iq: 70,
        naturalPotential: 59
      };
    }
    return {
      ...base,
      creationMode: "god",
      name: "Nova Vale",
      family: "famous",
      personality: "volatile",
      speed: 88,
      strength: 82,
      endurance: 58,
      coordination: 80,
      recovery: 48,
      iq: 64,
      naturalPotential: 90
    };
  }

  function renderCreateScreen(payload) {
    const data =
      payload ||
      {
        name: "",
        gender: "nonbinary",
        sport: "basketball",
        role: "Point Guard",
        country: "United States",
        height: 72,
        weight: 180,
        family: "supportive",
        personality: "driven",
        difficulty: "realistic",
        creationMode: "regular",
        speed: 55,
        strength: 55,
        endurance: 55,
        coordination: 55,
        recovery: 55,
        iq: 55,
        naturalPotential: 65
      };
    data.creationMode = data.creationMode === "god" ? "god" : "regular";
    GENETIC_KEYS.forEach((key) => {
      data[key] = Logic.clamp(Math.round(Number(data[key] || 55)), 25, data.creationMode === "god" ? GOD_GENETIC_MAX : REGULAR_GENETIC_MAX);
    });
    const godMode = data.creationMode === "god";
    const geneticMax = godMode ? GOD_GENETIC_MAX : REGULAR_GENETIC_MAX;
    const geneticTotal = geneticsTotal(data);
    const pointsLeft = REGULAR_GENETICS_BUDGET - geneticTotal;
    const overBudget = !godMode && pointsLeft < 0;

    app.innerHTML = `
      <div class="start-layout">
        <section class="intro-panel">
          <img src="assets/arena.svg" alt="" class="arena-art">
          <div class="intro-copy">
            <p class="eyebrow">Mobile and desktop career sim</p>
            <h1>Build an athlete. Live the whole arc.</h1>
          </div>
        </section>

        <form class="creator panel" id="creatorForm">
          <div class="form-heading">
            <h2>Character Creation</h2>
            <button type="button" class="secondary-button" data-action="randomize">Randomize</button>
          </div>

          <input type="hidden" name="creationMode" value="${data.creationMode}">
          <div class="mode-switch" aria-label="Creation mode">
            <button type="button" class="mode-option ${!godMode ? "active" : ""}" data-action="creation-mode" data-mode="regular">
              <strong>Regular</strong>
              <span>650 genetics points</span>
            </button>
            <button type="button" class="mode-option ${godMode ? "active" : ""}" data-action="creation-mode" data-mode="god">
              <strong>GOD Mode</strong>
              <span>Max anything</span>
            </button>
          </div>

          <div class="origin-card">
            <div class="origin-avatar">${emojiForGender(data.gender)}${emojiForSport(data.sport)}</div>
            <div>
              <strong>${escapeHtml(data.name || "Newborn Prospect")}</strong>
              <span>${emojiForFamily(data.family)} ${escapeHtml(Data.families[data.family]?.label || "Family")} · ${escapeHtml(Data.sports[data.sport]?.label || "Sport")} dream</span>
            </div>
          </div>

          <div class="preset-row" aria-label="Career presets">
            <button type="button" class="preset-button" data-action="preset" data-preset="prodigy">✨ Prodigy</button>
            <button type="button" class="preset-button" data-action="preset" data-preset="underdog">🌱 Underdog</button>
            <button type="button" class="preset-button" data-action="preset" data-preset="chaos">🔥 Chaos</button>
          </div>

          <div class="field-grid">
            <label>Name
              <input name="name" maxlength="32" value="${escapeHtml(data.name)}" placeholder="Rookie Legend" required>
            </label>
            <label>Gender
              <select name="gender">${genderOptions(data.gender)}</select>
            </label>
            <label>Sport
              <select name="sport" data-action="sport-change">${sportOptions(data.sport)}</select>
            </label>
            <label>Position or Class
              <select name="role" id="roleSelect">${roleOptions(data.sport, data.role)}</select>
            </label>
            <label>Country
              <select name="country">${optionList(Data.countries, data.country)}</select>
            </label>
            <label>Difficulty
              <select name="difficulty">${keyedOptions(Data.difficulties, data.difficulty)}</select>
            </label>
            <label>Family
              <select name="family">${familyOptions(data.family)}</select>
            </label>
            <label>Personality
              <select name="personality">${keyedOptions(Data.personalities, data.personality)}</select>
            </label>
          </div>

          <div class="measure-grid">
            ${rangeControl("height", "Projected Height", data.height, 60, 84, `${Logic.formatHeight(Number(data.height))}`)}
            ${rangeControl("weight", "Projected Weight", data.weight, 110, 320, `${data.weight} lb`)}
          </div>

          <h3>Genetics</h3>
          <div class="budget-card ${overBudget ? "over-budget" : ""}" data-genetics-budget>
            <strong data-budget-title>${godMode ? "Unlimited genetics" : `${Math.max(0, pointsLeft)} points left`}</strong>
            <span data-budget-detail>${godMode ? `GOD Mode lets every genetic reach ${GOD_GENETIC_MAX}.` : `${geneticTotal} / ${REGULAR_GENETICS_BUDGET} points used in Regular mode.`}</span>
            ${godMode ? `<button type="button" class="secondary-button" data-action="max-genetics">Max Genetics</button>` : ""}
          </div>
          <div class="genetics-grid">
            ${rangeControl("speed", "Speed", data.speed, 25, geneticMax, data.speed, true)}
            ${rangeControl("strength", "Strength", data.strength, 25, geneticMax, data.strength, true)}
            ${rangeControl("endurance", "Endurance", data.endurance, 25, geneticMax, data.endurance, true)}
            ${rangeControl("coordination", "Coordination", data.coordination, 25, geneticMax, data.coordination, true)}
            ${rangeControl("recovery", "Recovery", data.recovery, 25, geneticMax, data.recovery, true)}
            ${rangeControl("iq", "Sport IQ", data.iq, 25, geneticMax, data.iq, true)}
            ${rangeControl("naturalPotential", "Natural Potential", data.naturalPotential, 25, geneticMax, data.naturalPotential, true)}
          </div>

          <div class="form-footer">
            <button type="submit" class="primary-button" data-start-career ${overBudget ? "disabled" : ""}>Start Career</button>
          </div>
        </form>
      </div>
    `;
    wireRangeLabels();
  }

  function rangeControl(name, label, value, min, max, display, isGenetic) {
    return `
      <label class="range-field">${escapeHtml(label)}
        <span class="range-value" data-range-output="${name}">${escapeHtml(display)}</span>
        <input type="range" name="${name}" min="${min}" max="${max}" value="${value}" data-range="${name}" ${isGenetic ? 'data-genetic="true"' : ""}>
      </label>
    `;
  }

  function updateGeneticsBudget() {
    const form = document.getElementById("creatorForm");
    if (!form) return;
    const payload = collectForm(form);
    const godMode = payload.creationMode === "god";
    const total = geneticsTotal(payload);
    const pointsLeft = REGULAR_GENETICS_BUDGET - total;
    const overBudget = !godMode && pointsLeft < 0;
    const budget = app.querySelector("[data-genetics-budget]");
    const title = app.querySelector("[data-budget-title]");
    const detail = app.querySelector("[data-budget-detail]");
    const submit = app.querySelector("[data-start-career]");
    if (budget) budget.classList.toggle("over-budget", overBudget);
    if (title) title.textContent = godMode ? "Unlimited genetics" : `${Math.max(0, pointsLeft)} points left`;
    if (detail) {
      detail.textContent = godMode
        ? `GOD Mode lets every genetic reach ${GOD_GENETIC_MAX}.`
        : `${total} / ${REGULAR_GENETICS_BUDGET} points used in Regular mode.`;
    }
    if (submit) submit.disabled = overBudget;
  }

  function wireRangeLabels() {
    app.querySelectorAll("[data-range]").forEach((input) => {
      const output = app.querySelector(`[data-range-output="${input.dataset.range}"]`);
      const update = () => {
        if (input.name === "height") output.textContent = Logic.formatHeight(Number(input.value));
        else if (input.name === "weight") output.textContent = `${input.value} lb`;
        else output.textContent = input.value;
      };
      input.addEventListener("input", () => {
        update();
        if (input.dataset.genetic === "true") updateGeneticsBudget();
      });
      update();
    });
    updateGeneticsBudget();
  }

  function collectForm(form) {
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });
    ["height", "weight", "speed", "strength", "endurance", "coordination", "recovery", "iq", "naturalPotential"].forEach((key) => {
      payload[key] = Number(payload[key]);
    });
    payload.creationMode = payload.creationMode === "god" ? "god" : "regular";
    return payload;
  }

  function metric(label, value, tone) {
    return `
      <div class="metric ${tone || ""}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `;
  }

  function bar(label, value, invert, key) {
    const width = Logic.clamp(Math.round(value), 0, 100);
    const tone = invert ? (width > 70 ? "bad" : width > 40 ? "warn" : "good") : width > 70 ? "good" : width > 40 ? "warn" : "bad";
    const rawDelta = key ? Number(state?.turn?.lastEffects?.[key] || 0) : 0;
    const delta = Math.abs(rawDelta) >= 0.05 ? rawDelta : 0;
    const deltaText = delta ? `${delta > 0 ? "+" : ""}${Math.abs(delta) < 1 ? delta.toFixed(1) : Math.round(delta)}` : "";
    return `
      <div class="bar-row ${delta ? "changed" : ""}">
        <div class="bar-label">
          <span>${escapeHtml(label)}</span>
          <strong>${width}${delta ? `<em class="stat-delta ${delta > 0 ? "up" : "down"}">${deltaText}</em>` : ""}</strong>
        </div>
        <div class="bar-track"><span class="${tone}" style="width:${width}%"></span></div>
      </div>
    `;
  }

  function pulseCard(item) {
    return `
      <article class="pulse-card">
        <div class="pulse-top">
          <span>${item.icon}</span>
          <strong>${escapeHtml(item.label)}</strong>
        </div>
        <p>${escapeHtml(item.detail)}</p>
        ${progressBar(item.value)}
      </article>
    `;
  }

  function renderPulseDeck() {
    const mood = moodForState(state);
    const unlock = nextUnlock(state);
    const hook = storyHook(state);
    const moneyMood =
      state.finance.debt > 0
        ? { icon: "🧾", label: "Debt Watch", detail: `${money(state.finance.debt)} owed.`, value: 100 - Math.min(100, state.finance.debt / 500) }
        : { icon: "💰", label: "Money Calm", detail: `${money(state.finance.money)} cash ready.`, value: Math.min(100, 20 + state.finance.money / 100) };
    return `
      <section class="pulse-grid" aria-label="Career pulse">
        ${pulseCard(mood)}
        ${pulseCard(hook)}
        ${pulseCard(unlock)}
        ${pulseCard(moneyMood)}
      </section>
    `;
  }

  function renderGoalBoard() {
    return `
      <section class="goal-board">
        <div class="section-heading">
          <h3>Goal Board</h3>
          <span>small wins keep the save moving</span>
        </div>
        <div class="goal-list">
          ${goalRows(state)
            .map(
              (goal) => `
                <article class="goal-row">
                  <div>
                    <strong>${escapeHtml(goal.label)}</strong>
                    <span>${escapeHtml(goal.detail)}</span>
                  </div>
                  ${progressBar(goal.value)}
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderTimelinePanel() {
    return `
      <section class="panel log-panel timeline-panel">
        <div class="section-heading">
          <h3>Timeline</h3>
          <span>latest story beats</span>
        </div>
        <div class="log-list">
          ${state.log.map((entry) => `<article class="log-item ${entry.type}"><span>${escapeHtml(entry.date)}</span><p>${escapeHtml(entry.text)}</p></article>`).join("")}
        </div>
      </section>
    `;
  }

  function renderCareerScreen() {
    const score = Logic.performanceScore(state);
    const date = Logic.currentDateLabel(state);
    const r = state.ratings;
    const contract = state.career.contract;
    const sportEmoji = emojiForSport(state.profile.sport);
    const personEmoji = emojiForGender(state.profile.gender);
    const focusAction = Data.actions.find((action) => action.id === state.monthlyFocus);
    const interactionLimit = state.turn?.interactionLimit || 7;
    const interactionsLeft = Number.isFinite(state.turn?.interactionsLeft) ? state.turn.interactionsLeft : interactionLimit;
    const bestStreak = Math.max(state.career.streaks?.healthyMonths || 0, state.career.streaks?.hotMonths || 0, state.career.streaks?.disciplineMonths || 0);

    app.innerHTML = `
      <section class="career-hero">
        <img src="assets/arena.svg" alt="" class="hero-bg">
        <div class="hero-content">
          <p class="eyebrow">${escapeHtml(date)}</p>
          <h1><span class="hero-emoji">${personEmoji}</span> ${escapeHtml(state.profile.name)}</h1>
          <p>${sportEmoji} ${escapeHtml(state.profile.role)} | ${escapeHtml(state.profile.sportLabel)} | ${escapeHtml(state.career.stage)}</p>
        </div>
        <div class="hero-score">
          <span>Performance</span>
          <strong>${score}</strong>
        </div>
      </section>

      <section class="command-row">
        <div class="tab-strip" role="tablist">
          ${tabButton("career", "📋 Career")}
          ${tabButton("training", "🏃 Train")}
          ${tabButton("relationships", "👥 People")}
          ${tabButton("business", "💰 Money")}
          ${tabButton("media", "📱 Media")}
          ${tabButton("saves", "💾 Saves")}
          ${tabButton("legacy", "🏆 Legacy")}
        </div>
        <div class="advance-controls">
          <select class="advance-picker" data-action="advance-step" aria-label="Advance amount">
            <option value="1" ${advanceStep === 1 ? "selected" : ""}>1 month</option>
            <option value="12" ${advanceStep === 12 ? "selected" : ""}>1 year</option>
          </select>
          <button class="primary-button advance" data-action="advance-time" ${state.pendingEvent || state.pendingMiniGame || state.pendingTrashTalk || state.career.retired ? "disabled" : ""}>Advance</button>
        </div>
      </section>

      <section class="panel tab-panel primary-panel">
        ${renderActiveTab(contract)}
      </section>

      ${renderTimelinePanel()}

      <section class="metric-grid">
        ${metric("Age", Logic.formatAge(state.profile.age))}
        ${metric("Stage", state.career.stage)}
        ${metric("Focus", focusAction ? `${emojiForAction(focusAction.id)} ${focusAction.label}` : "None")}
        ${metric("Moves Left", `${interactionsLeft}/${interactionLimit}`, interactionsLeft <= 0 ? "warn" : "")}
        ${metric("Money", money(state.finance.money), state.finance.money <= 0 ? "danger" : "")}
        ${metric("Wealth", money(state.finance.wealth))}
        ${metric("Debt", money(state.finance.debt), state.finance.debt > 0 ? "danger" : "")}
        ${metric("Legacy", Math.round(state.career.legacy))}
        ${metric("Potential", state.profile.potential)}
        ${metric("Best Streak", `${bestStreak} mo`)}
      </section>

      ${renderPulseDeck()}

      <div class="main-grid">
        <section class="panel status-panel">
          <h2>Status</h2>
          ${bar("Skill", r.skill, false, "skill")}
          ${bar("Athleticism", r.athleticism, false, "athleticism")}
          ${bar("Health", r.health, false, "health")}
          ${bar("Injury Risk", r.injuryRisk, true, "injuryRisk")}
          ${bar("Mental Health", r.mental, false, "mental")}
          ${bar("Burnout", r.burnout, true, "burnout")}
          ${bar("Discipline", r.discipline, false, "discipline")}
          ${bar("Confidence", r.confidence, false, "confidence")}
          ${bar("Motivation", r.motivation, false, "motivation")}
          ${bar("Ego", r.ego, true, "ego")}
        </section>
      </div>

      ${state.pendingEvent ? renderEventModal(state.pendingEvent) : ""}
      ${state.pendingMiniGame ? renderMiniGameModal(state.pendingMiniGame) : ""}
      ${state.pendingTrashTalk ? renderTrashTalkModal(state.pendingTrashTalk) : ""}
    `;
  }

  function tabButton(id, label) {
    return `<button class="tab-button ${activeTab === id ? "active" : ""}" data-action="tab" data-tab="${id}" role="tab" aria-selected="${activeTab === id}">${label}</button>`;
  }

  function renderActiveTab(contract) {
    if (activeTab === "training") return renderActionTab("training", "Training Focus");
    if (activeTab === "relationships") return renderPeopleTab();
    if (activeTab === "business") return renderActionTab("business", "Business and Lifestyle");
    if (activeTab === "media") return renderMediaTab();
    if (activeTab === "saves") return renderSaveTab();
    if (activeTab === "legacy") return renderLegacyTab();

    return `
      <h2>Career Sheet</h2>
      <div class="profile-list">
        ${fact("Person", `${emojiForGender(state.profile.gender)} ${state.profile.genderLabel}`)}
        ${fact("Mode", state.profile.creationMode === "god" ? "GOD Mode" : "Regular")}
        ${fact("Sport", `${emojiForSport(state.profile.sport)} ${state.profile.sportLabel}`)}
        ${fact("Role", state.profile.role)}
        ${fact("Country", state.profile.country)}
        ${fact("Projected Height", Logic.formatHeight(state.profile.height))}
        ${fact("Projected Weight", `${state.profile.weight} lb`)}
        ${fact("Family", `${emojiForFamily(state.profile.family)} ${state.profile.familyLabel}`)}
        ${fact("Personality", state.profile.personalityLabel)}
        ${fact("Difficulty", state.profile.difficultyLabel)}
        ${fact("Prospect Rank", state.career.prospectRank ? `#${state.career.prospectRank}` : "N/A")}
        ${fact("Draft Stock", `${Math.round(state.career.draftStock)} / 100`)}
        ${fact("Amateur Rank", state.career.amateurRank ? `#${state.career.amateurRank}` : "N/A")}
        ${fact("Contract", contract ? `${money(contract.salary)} yearly, ${contract.monthsRemaining} months left` : "None")}
      </div>
      ${renderGoalBoard()}
    `;
  }

  function fact(label, value) {
    return `<div class="fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
  }

  const effectNames = {
    skill: "Skill",
    athleticism: "Athleticism",
    health: "Health",
    injuryRisk: "Injury",
    mental: "Mental",
    burnout: "Burnout",
    discipline: "Discipline",
    confidence: "Confidence",
    motivation: "Motivation",
    ego: "Ego",
    chemistry: "Team",
    coachTrust: "Coach",
    family: "Family",
    agent: "Agent",
    mentor: "Mentor",
    social: "Social",
    public: "Public",
    mediaHeat: "Heat",
    friendship: "Friends",
    rivalry: "Rivalry",
    brand: "Brand",
    money: "Money",
    wealth: "Wealth"
  };

  function effectChips(effects, limit) {
    const chips = Object.keys(effects || {})
      .filter((key) => effectNames[key])
      .slice(0, limit || 4)
      .map((key) => {
        const value = effects[key];
        const tone = value >= 0 ? "good" : "bad";
        const text = key === "money" || key === "wealth" ? `${value >= 0 ? "+" : ""}${money(value)}` : `${value >= 0 ? "+" : ""}${Math.round(value)}`;
        return `<span class="${tone}">${escapeHtml(effectNames[key])} ${escapeHtml(text)}</span>`;
      });
    return chips.length ? `<div class="effect-chips">${chips.join("")}</div>` : "";
  }

  function renderInteractionMeter() {
    const interactionLimit = state.turn?.interactionLimit || 7;
    const interactionsLeft = Number.isFinite(state.turn?.interactionsLeft) ? state.turn.interactionsLeft : interactionLimit;
    const interactionsUsed = Logic.clamp(interactionLimit - interactionsLeft, 0, interactionLimit);
    return `
      <div class="interaction-meter">
        <div>
          <strong>${interactionsLeft} left</strong>
          <span>${interactionsUsed} / ${interactionLimit} used this month</span>
        </div>
        <div class="dot-row" aria-label="${interactionsUsed} interactions used">
          ${Array.from({ length: interactionLimit }, (_, index) => `<span class="${index < interactionsUsed ? "used" : ""}"></span>`).join("")}
        </div>
      </div>
    `;
  }

  function renderActionTab(category, heading) {
    const actions = Data.actions.filter((action) => action.category === category);
    const interactionLimit = state.turn?.interactionLimit || 7;
    const interactionsLeft = Number.isFinite(state.turn?.interactionsLeft) ? state.turn.interactionsLeft : interactionLimit;
    return `
      <h2>${escapeHtml(heading)}</h2>
      <p class="panel-note">Use up to ${interactionLimit} interactions this month. The last one becomes your monthly focus.</p>
      ${renderInteractionMeter()}
      <div class="action-grid">
        ${actions
          .map((action) => {
            const available = Logic.isActionAvailable(state, action.id);
            const lockedOut = interactionsLeft <= 0;
            const rule = Logic.actionRule(action.id);
            const ageText = !available
              ? state.profile.age < (rule.minAge || 0)
                ? `Available at age ${rule.minAge}`
                : "No longer available"
              : action.summary;
            return `
              <button class="action-tile ${state.monthlyFocus === action.id ? "selected" : ""}" data-action="set-focus" data-focus="${action.id}" ${!available || lockedOut ? "disabled" : ""}>
                <span class="action-emoji">${emojiForAction(action.id)}</span>
                <strong>${escapeHtml(action.label)}</strong>
                <span>${escapeHtml(ageText)}</span>
                ${available ? effectChips(action.effects, 3) : ""}
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function contactCard(person) {
    const value = Logic.clamp(Math.round(state.ratings[person.key] || 0), 0, 100);
    const available = Logic.isActionAvailable(state, person.action);
    const rule = Logic.actionRule(person.action);
    const interactionsLeft = Number.isFinite(state.turn?.interactionsLeft) ? state.turn.interactionsLeft : 7;
    const action = Data.actions.find((item) => item.id === person.action);
    const lockText = available ? person.detail : `Unlocks at age ${rule.minAge || 0}`;
    return `
      <article class="person-card ${available ? "" : "locked"}">
        <div class="person-main">
          <span class="person-emoji">${person.icon}</span>
          <div>
            <strong>${escapeHtml(person.name)}</strong>
            <span>${escapeHtml(lockText)}</span>
          </div>
        </div>
        ${progressBar(value)}
        <div class="person-foot">
          <span>${value} / 100</span>
          <button class="secondary-button" data-action="set-focus" data-focus="${person.action}" ${!available || interactionsLeft <= 0 ? "disabled" : ""}>
            ${escapeHtml(action?.label || "Interact")}
          </button>
        </div>
      </article>
    `;
  }

  function familyContactCards() {
    const members = Array.isArray(state.profile.familyMembers) && state.profile.familyMembers.length
      ? state.profile.familyMembers
      : [{ id: "family", label: state.profile.familyLabel, emoji: emojiForFamily(state.profile.family), action: "family_time", detail: "Home pressure, support, and roots." }];
    const cards = members.map((member) =>
      contactCard({
        icon: member.emoji || "🏠",
        name: member.label,
        key: "family",
        action: member.action || "family_time",
        detail: member.detail || "Home pressure, support, and roots."
      })
    );
    cards.push(
      contactCard({
        icon: "🍽️",
        name: "Whole Family",
        key: "family",
        action: "family_dinner",
        detail: "Bring everyone together for a calmer reset."
      })
    );
    return cards.join("");
  }

  function renderPeopleTab() {
    const people = [
      { known: "friends", icon: "👥", name: "Friends", key: "friendship", action: "friend_hangout", detail: "People who know you outside the sport." },
      { known: "friends", icon: "🎒", name: "School Circle", key: "friendship", action: "school_club", detail: "Classmates and non-sport connections." },
      { known: "coach", icon: "📋", name: "Coach", key: "coachTrust", action: "coach_meeting", detail: "Role clarity, trust, and playing time." },
      { known: "mentor", icon: "🧭", name: "Mentor", key: "mentor", action: "mentor_session", detail: "Older guidance for decisions and pressure." },
      { known: "teammates", icon: "🤝", name: "Close Teammates", key: "chemistry", action: "teammate_checkin", detail: "Locker-room bonds and on-field flow." },
      { known: "rival", icon: "🔥", name: "Rival", key: "rivalry", action: "rivalry_focus", detail: "Competitive tension you can use or mishandle." },
      { known: "agent", icon: "💼", name: "Agent", key: "agent", action: "agent_meeting", detail: "Deals, leverage, contracts, and brand timing." }
    ].filter((person) => state.knownPeople?.[person.known]);
    return `
      <h2>People</h2>
      <p class="panel-note">Only people you have actually met show up here. New connections appear through age, school, teams, events, and choices.</p>
      ${renderInteractionMeter()}
      <h3>Family Members</h3>
      <div class="people-grid">
        ${familyContactCards()}
      </div>
      <h3>People You Have Met</h3>
      <div class="people-grid">
        ${people.length ? people.map(contactCard).join("") : `<article class="empty-card">No one outside the family yet.</article>`}
      </div>
    `;
  }

  function renderMediaTab() {
    const r = state.ratings;
    const followers = Math.round(250 + r.social * r.social * 48 + r.brand * 650 + r.public * 260);
    const engagement = Logic.clamp(r.social * 0.56 + r.brand * 0.24 + r.confidence * 0.18 - r.mediaHeat * 0.18, 0, 100);
    const sentiment = Logic.clamp(r.public * 0.52 + r.mental * 0.18 + r.family * 0.08 - r.mediaHeat * 0.38, 0, 100);
    const actions = ["social_posting", "training_clip", "behind_scenes", "fan_qna", "podcast_clip", "press_work", "charity_event", "apology_statement", "media_blackout"]
      .map((id) => Data.actions.find((action) => action.id === id))
      .filter(Boolean);
    return `
      <h2>Social Media</h2>
      <p class="panel-note">Build the audience, manage the narrative, and keep the noise from eating the career.</p>
      <div class="social-dashboard">
        ${fact("Followers", followers.toLocaleString())}
        ${fact("Engagement", `${Math.round(engagement)} / 100`)}
        ${fact("Sentiment", `${Math.round(sentiment)} / 100`)}
        ${fact("Brand Heat", `${Math.round(r.brand)} / 100`)}
        ${fact("Controversy", `${Math.round(r.mediaHeat)} / 100`)}
        ${fact("Public Image", `${Math.round(r.public)} / 100`)}
      </div>
      ${renderInteractionMeter()}
      <div class="action-grid social-actions">
        ${actions
          .map((action) => {
            const available = Logic.isActionAvailable(state, action.id);
            const lockedOut = (state.turn?.interactionsLeft || 0) <= 0;
            const rule = Logic.actionRule(action.id);
            const text = available ? action.summary : `Available at age ${rule.minAge || 0}`;
            return `
              <button class="action-tile ${state.monthlyFocus === action.id ? "selected" : ""}" data-action="set-focus" data-focus="${action.id}" ${!available || lockedOut ? "disabled" : ""}>
                <span class="action-emoji">${emojiForAction(action.id)}</span>
                <strong>${escapeHtml(action.label)}</strong>
                <span>${escapeHtml(text)}</span>
                ${available ? effectChips(action.effects, 3) : ""}
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderSaveTab() {
    const slots = Storage.list();
    return `
      <h2>Save Slots</h2>
      <div class="slot-list">
        ${slots
          .map(
            (slot) => `
              <div class="slot-row">
                <div>
                  <strong>Slot ${slot.slot}</strong>
                  <span>${slot.empty ? "Empty" : `${escapeHtml(slot.name)} | ${escapeHtml(slot.sport)} | age ${slot.age} | ${escapeHtml(slot.stage)} | legacy ${slot.legacy}`}</span>
                </div>
                <div class="slot-buttons">
                  <button class="secondary-button" data-action="save-slot" data-slot="${slot.slot}">Save</button>
                  <button class="secondary-button" data-action="load-slot" data-slot="${slot.slot}" ${slot.empty ? "disabled" : ""}>Load</button>
                  <button class="danger-button" data-action="delete-slot" data-slot="${slot.slot}" ${slot.empty ? "disabled" : ""}>Delete</button>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="import-export">
        <textarea id="saveText" rows="8" placeholder="Exported save data appears here."></textarea>
        <div class="inline-buttons">
          <button class="secondary-button" data-action="export-save">Export</button>
          <button class="secondary-button" data-action="import-save">Import</button>
        </div>
      </div>
    `;
  }

  function renderLegacyTab() {
    const injuries = state.career.injuryHistory;
    const achievements = state.career.achievements;
    return `
      <h2>Legacy</h2>
      <div class="profile-list">
        ${fact("Legacy Score", Math.round(state.career.legacy))}
        ${fact("Hall of Fame", state.career.hallOfFame ? "Yes" : "Not yet")}
        ${fact("Years Pro", state.career.yearsPro)}
        ${fact("Post-Career Path", state.career.postCareer || "Undecided")}
        ${fact("Coach Trust", `${state.ratings.coachTrust} / 100`)}
        ${fact("Locker Room", `${state.ratings.chemistry} / 100`)}
        ${fact("Social Reputation", `${state.ratings.social} / 100`)}
        ${fact("Public Perception", `${state.ratings.public} / 100`)}
        ${fact("Agent Relationship", `${state.ratings.agent} / 100`)}
        ${fact("Mentor Bond", `${state.ratings.mentor} / 100`)}
        ${fact("Healthy Streak", `${state.career.streaks?.healthyMonths || 0} months`)}
        ${fact("Hot Streak", `${state.career.streaks?.hotMonths || 0} months`)}
        ${fact("Discipline Streak", `${state.career.streaks?.disciplineMonths || 0} months`)}
      </div>
      <h3>Achievements</h3>
      <div class="pill-list">${achievements.length ? achievements.map((item) => `<span>${escapeHtml(item)}</span>`).join("") : "<span>None yet</span>"}</div>
      <h3>Injury History</h3>
      <div class="compact-list">${injuries.length ? injuries.map((item) => `<p>${escapeHtml(item.date)}: severity ${item.severity}</p>`).join("") : "<p>No recorded injuries.</p>"}</div>
    `;
  }

  function renderEventModal(event) {
    return `
      <div class="event-backdrop" role="presentation"></div>
      <section class="event-modal" role="dialog" aria-modal="true" aria-labelledby="eventTitle">
        <p class="eyebrow">Major moment</p>
        <h2 id="eventTitle"><span class="event-emoji">${emojiForEvent(event.id)}</span> ${escapeHtml(event.title)}</h2>
        <p>${escapeHtml(event.text)}</p>
        <div class="choice-grid">
          ${event.choices
            .map(
              (choice, index) => `
                <button class="choice-button" data-action="choose-event" data-choice="${index}">
                  ${escapeHtml(choice.label)}
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderMiniGameModal(miniGame) {
    return `
      <div class="event-backdrop" role="presentation"></div>
      <section class="event-modal mini-game-modal" role="dialog" aria-modal="true" aria-labelledby="miniGameTitle">
        <p class="eyebrow">Optional training drill</p>
        <h2 id="miniGameTitle"><span class="event-emoji">🎮</span> ${escapeHtml(miniGame.title)}</h2>
        <p>${escapeHtml(miniGame.text)}</p>
        <div class="choice-grid">
          ${miniGame.choices
            .map(
              (choice, index) => `
                <button class="choice-button" data-action="choose-mini-game" data-choice="${index}">
                  <strong>${escapeHtml(choice.label)}</strong>
                  ${effectChips(choice.effects, 4)}
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderTrashTalkModal(trashTalk) {
    return `
      <div class="event-backdrop" role="presentation"></div>
      <section class="event-modal trash-talk-modal" role="dialog" aria-modal="true" aria-labelledby="trashTalkTitle">
        <p class="eyebrow">Rare heated moment</p>
        <h2 id="trashTalkTitle"><span class="event-emoji">💬</span> Trash Talk</h2>
        <p>${escapeHtml(trashTalk.text)} Opponent: ${escapeHtml(trashTalk.opponent)}.</p>
        <textarea id="trashTalkText" maxlength="150" rows="4" placeholder="Write up to 150 letters..."></textarea>
        <div class="trash-count"><span id="trashTalkCount">0</span> / 150</div>
        <div class="choice-grid">
          <button class="choice-button" data-action="submit-trash-talk">Send Line</button>
          <button class="choice-button" data-action="generate-trash-talk">AI Generate</button>
          <button class="choice-button" data-action="skip-trash-talk">Skip</button>
        </div>
      </section>
    `;
  }

  function handleAction(target) {
    const action = target.dataset.action;
    if (!action) return;

    if (action === "new-career") {
      state = null;
      activeTab = "career";
      render();
      return;
    }

    if (action === "select-slot") {
      selectedSlot = Number(target.value);
      renderTopActions();
      return;
    }

    if (action === "toggle-theme") {
      darkMode = !darkMode;
      localStorage.setItem("legacy-league-theme", darkMode ? "dark" : "light");
      render();
      return;
    }

    if (action === "toggle-sound") {
      setSoundEnabled(!soundEnabled);
      if (soundEnabled) playClickSound();
      renderTopActions();
      showToast(soundEnabled ? "Sound on." : "Sound off.");
      return;
    }

    if (action === "quick-save") {
      if (!state) return;
      Storage.save(selectedSlot, state);
      showToast(`Saved to slot ${selectedSlot}.`);
      render();
      return;
    }

    if (action === "quick-load") {
      const loaded = Storage.load(selectedSlot);
      if (!loaded) {
        showToast(`Slot ${selectedSlot} is empty.`);
        return;
      }
      state = Logic.migrateState(loaded.state);
      activeTab = "career";
      showToast(`Loaded slot ${selectedSlot}.`);
      render();
      return;
    }

    if (action === "randomize") {
      renderCreateScreen(fitRegularGenetics(Logic.randomCareerPayload()));
      return;
    }

    if (action === "preset") {
      renderCreateScreen(presetPayload(target.dataset.preset));
      return;
    }

    if (action === "creation-mode") {
      const form = document.getElementById("creatorForm");
      const payload = collectForm(form);
      payload.creationMode = target.dataset.mode === "god" ? "god" : "regular";
      renderCreateScreen(payload);
      return;
    }

    if (action === "max-genetics") {
      const form = document.getElementById("creatorForm");
      renderCreateScreen(maxGodGenetics(collectForm(form)));
      return;
    }

    if (action === "sport-change") {
      const form = document.getElementById("creatorForm");
      const payload = collectForm(form);
      const sport = Data.sports[payload.sport];
      payload.role = sport.positions.length ? sport.positions[0] : "";
      renderCreateScreen(payload);
      return;
    }

    if (!state) return;

    if (action === "tab") {
      activeTab = target.dataset.tab;
      render();
      return;
    }

    if (action === "advance-step") {
      advanceStep = Number(target.value);
      render();
      return;
    }

    if (action === "advance-time" || action === "advance-month") {
      const result = Logic.advanceTime(state, advanceStep);
      state = result.state;
      const label = result.advanced === 1 ? "1 month" : `${result.advanced} months`;
      const stopMessage = result.stoppedForMiniGame
        ? `Advanced ${label}. A training drill needs your choice.`
        : result.stoppedForTrashTalk
          ? `Advanced ${label}. A heated moment needs your choice.`
        : result.stoppedForEvent
          ? `Advanced ${label}. A major moment needs your choice.`
          : `Advanced ${label}.`;
      showToast(stopMessage);
      render();
      return;
    }

    if (action === "set-focus") {
      if (state.pendingMiniGame) {
        showToast("Finish the training drill first.");
        return;
      }
      if (state.pendingTrashTalk) {
        showToast("Finish the heated moment first.");
        return;
      }
      if ((state.turn?.interactionsLeft || 0) <= 0) {
        showToast("No interactions left this month. Advance time to refill.");
        return;
      }
      if (!Logic.isActionAvailable(state, target.dataset.focus)) {
        showToast("That focus is not available at this age.");
        return;
      }
      state = Logic.setFocus(state, target.dataset.focus);
      showToast(
        state.pendingMiniGame
          ? "Training drill opened."
          : (state.turn?.interactionsLeft || 0) > 0
            ? `${state.turn.interactionsLeft} interactions left this month.`
            : "Month used up. Advance time when ready."
      );
      render();
      return;
    }

    if (action === "choose-mini-game") {
      state = Logic.chooseMiniGame(state, Number(target.dataset.choice));
      showToast("Training drill applied.");
      render();
      return;
    }

    if (action === "submit-trash-talk") {
      const text = document.getElementById("trashTalkText")?.value || "";
      state = Logic.submitTrashTalk(state, text);
      showToast("Trash talk judged.");
      render();
      return;
    }

    if (action === "generate-trash-talk") {
      const area = document.getElementById("trashTalkText");
      if (area) {
        area.value = Logic.generateTrashTalkText(state);
        area.dispatchEvent(new Event("input", { bubbles: true }));
      }
      showToast("Line generated.");
      return;
    }

    if (action === "skip-trash-talk") {
      state = Logic.skipTrashTalk(state);
      showToast("Heated moment skipped.");
      render();
      return;
    }

    if (action === "choose-event") {
      state = Logic.chooseEvent(state, Number(target.dataset.choice));
      showToast("Choice applied.");
      render();
      return;
    }

    if (action === "save-slot") {
      const slot = Number(target.dataset.slot);
      selectedSlot = slot;
      Storage.save(slot, state);
      showToast(`Saved to slot ${slot}.`);
      render();
      return;
    }

    if (action === "load-slot") {
      const slot = Number(target.dataset.slot);
      const loaded = Storage.load(slot);
      if (!loaded) return;
      selectedSlot = slot;
      state = Logic.migrateState(loaded.state);
      activeTab = "career";
      showToast(`Loaded slot ${slot}.`);
      render();
      return;
    }

    if (action === "delete-slot") {
      const slot = Number(target.dataset.slot);
      Storage.remove(slot);
      showToast(`Deleted slot ${slot}.`);
      render();
      return;
    }

    if (action === "export-save") {
      const area = document.getElementById("saveText");
      area.value = Storage.exportState(state);
      area.select();
      showToast("Save exported.");
      return;
    }

    if (action === "import-save") {
      const area = document.getElementById("saveText");
      try {
        state = Logic.migrateState(Storage.importState(area.value));
        activeTab = "career";
        showToast("Save imported.");
        render();
      } catch (error) {
        showToast(error.message);
      }
    }
  }

  app.addEventListener("submit", (event) => {
    if (event.target.id !== "creatorForm") return;
    event.preventDefault();
    const payload = collectForm(event.target);
    if (payload.creationMode !== "god" && geneticsTotal(payload) > REGULAR_GENETICS_BUDGET) {
      showToast("Regular mode has a 650 genetics point limit.");
      updateGeneticsBudget();
      return;
    }
    state = Logic.createCareer(payload);
    activeTab = "career";
    showToast("Career started.");
    render();
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (target && target.tagName === "SELECT") return;
    if (target) {
      playClickSound();
      handleAction(target);
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target.closest("[data-action]");
    if (target) handleAction(target);
  });

  document.addEventListener("input", (event) => {
    if (event.target.id !== "trashTalkText") return;
    const counter = document.getElementById("trashTalkCount");
    if (counter) counter.textContent = String(event.target.value.length);
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }

  render();
})();
