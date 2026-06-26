(function () {
  "use strict";

  const Data = window.LegacyLeagueData;
  const GENETIC_KEYS = ["speed", "strength", "endurance", "coordination", "recovery", "iq", "naturalPotential"];
  const REGULAR_GENETICS_BUDGET = 650;
  const REGULAR_GENETIC_MAX = 125;
  const GOD_GENETIC_MAX = 150;
  const MONTHLY_INTERACTION_LIMIT = 7;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickWeighted(items, getWeight) {
    const total = items.reduce((sum, item) => sum + Math.max(0, getWeight(item)), 0);
    let roll = Math.random() * total;
    for (const item of items) {
      roll -= Math.max(0, getWeight(item));
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function defaultTurn(monthKey) {
    return {
      focusLocked: false,
      monthKey: monthKey || 0,
      interactionLimit: MONTHLY_INTERACTION_LIMIT,
      interactionsLeft: MONTHLY_INTERACTION_LIMIT,
      interactionsUsed: 0,
      actionHistory: [],
      lastEffects: null
    };
  }

  function defaultKnownPeople() {
    return {
      family: true,
      friends: false,
      coach: false,
      mentor: false,
      teammates: false,
      rival: false,
      agent: false
    };
  }

  function familyMembersFor(familyId) {
    const templates = {
      supportive: [
        { id: "mom", label: "Mom", emoji: "👩", action: "mom_time", detail: "Supportive, steady, and tuned in." },
        { id: "dad", label: "Dad", emoji: "👨", action: "dad_time", detail: "Encouraging with structure." },
        { id: "sibling", label: "Sibling", emoji: "🧒", action: "sibling_time", detail: "Keeps life playful." }
      ],
      strict: [
        { id: "mom", label: "Mom", emoji: "👩", action: "mom_time", detail: "Loving, but demanding." },
        { id: "dad", label: "Dad", emoji: "👨", action: "dad_time", detail: "Big standards every month." }
      ],
      absent: [
        { id: "caregiver", label: "Caregiver", emoji: "🧑", action: "family_time", detail: "The person holding things together." }
      ],
      famous: [
        { id: "mom", label: "Mom", emoji: "👩", action: "mom_time", detail: "Knows the spotlight too well." },
        { id: "dad", label: "Dad", emoji: "👨", action: "dad_time", detail: "Legacy expectations follow them." },
        { id: "sibling", label: "Sibling", emoji: "🧒", action: "sibling_time", detail: "Also living near the spotlight." }
      ],
      toxic: [
        { id: "parent", label: "Parent", emoji: "🧑", action: "family_time", detail: "Complicated, tense, and unpredictable." },
        { id: "sibling", label: "Sibling", emoji: "🧒", action: "sibling_time", detail: "Someone else who understands home." }
      ],
      working: [
        { id: "mom", label: "Mom", emoji: "👩", action: "mom_time", detail: "Practical support and real sacrifice." },
        { id: "dad", label: "Dad", emoji: "👨", action: "dad_time", detail: "Work ethic shows up early." },
        { id: "sibling", label: "Sibling", emoji: "🧒", action: "sibling_time", detail: "Shares the busy house." }
      ],
      wealthy: [
        { id: "mom", label: "Mom", emoji: "👩", action: "mom_time", detail: "Resources and expectations." },
        { id: "dad", label: "Dad", emoji: "👨", action: "dad_time", detail: "Connections and pressure." },
        { id: "sibling", label: "Sibling", emoji: "🧒", action: "sibling_time", detail: "A familiar rival at home." }
      ]
    };
    return clone(templates[familyId] || templates.supportive);
  }

  function syncKnownPeople(state, announce) {
    state.knownPeople = { ...defaultKnownPeople(), ...(state.knownPeople || {}) };
    const reveals = [
      { key: "friends", label: "Friends", met: state.profile.age >= 5 || state.ratings.friendship >= 25 },
      { key: "coach", label: "Coach", met: state.profile.age >= 8 || state.ratings.coachTrust > 0 },
      { key: "teammates", label: "Teammates", met: state.profile.age >= 10 || state.ratings.chemistry >= 28 },
      { key: "mentor", label: "Mentor", met: state.profile.age >= 12 || state.ratings.mentor > 0 },
      { key: "rival", label: "Rival", met: state.profile.age >= 12 || state.ratings.rivalry > 0 },
      { key: "agent", label: "Agent", met: state.profile.age >= 15 || state.ratings.agent > 0 }
    ];
    reveals.forEach((item) => {
      if (!state.knownPeople[item.key] && item.met) {
        state.knownPeople[item.key] = true;
        if (announce) pushLog(state, `${item.label} added to your people circle.`, "info");
      }
    });
    return state.knownPeople;
  }

  function geneticsTotal(genetics) {
    return GENETIC_KEYS.reduce((sum, key) => sum + Number(genetics[key] || 0), 0);
  }

  function enforceGeneticsBudget(genetics, budget) {
    let total = geneticsTotal(genetics);
    while (total > budget) {
      const highestKey = GENETIC_KEYS.reduce((best, key) => (genetics[key] > genetics[best] ? key : best), GENETIC_KEYS[0]);
      if (genetics[highestKey] <= 25) break;
      genetics[highestKey] -= 1;
      total -= 1;
    }
    return genetics;
  }

  function scaleEffects(effects, factor) {
    const scaled = {};
    Object.keys(effects || {}).forEach((key) => {
      scaled[key] = effects[key] * factor;
    });
    return scaled;
  }

  function uid() {
    return `career-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  function ratingDefaults() {
    return {
      skill: 5,
      athleticism: 8,
      health: 88,
      injuryRisk: 4,
      mental: 50,
      burnout: 5,
      discipline: 10,
      ego: 15,
      confidence: 50,
      motivation: 45,
      chemistry: 20,
      coachTrust: 0,
      family: 50,
      agent: 0,
      mentor: 0,
      social: 0,
      public: 0,
      academics: 0,
      mediaHeat: 0,
      rivalry: 0,
      friendship: 15,
      pressure: 0,
      grit: 10,
      financeIQ: 0,
      brand: 0
    };
  }

  function normalize(state) {
    Object.keys(state.ratings).forEach((key) => {
      state.ratings[key] = clamp(Math.round(state.ratings[key]), 0, 100);
    });
    state.finance.money = Math.round(state.finance.money);
    state.finance.wealth = Math.max(0, Math.round(state.finance.wealth));
    state.finance.debt = Math.max(0, Math.round(state.finance.debt));
    if (state.finance.money < 0) {
      state.finance.debt += Math.abs(state.finance.money);
      state.finance.money = 0;
    }
    if (state.log.length > 80) state.log = state.log.slice(0, 80);
    return state;
  }

  function pushLog(state, text, type) {
    state.log.unshift({
      text,
      type: type || "info",
      date: currentDateLabel(state)
    });
  }

  function applyEffects(state, effects, source) {
    const diff = Data.difficulties[state.profile.difficulty] || Data.difficulties.realistic;
    Object.keys(effects || {}).forEach((key) => {
      let value = effects[key];
      if (key === "money" || key === "wealth" || key === "debt") {
        if (value > 0 && key !== "debt") value *= diff.salaryMod;
        if (value < 0) value *= diff.taxMod;
        state.finance[key] += value;
        return;
      }

      if (key === "legacy") {
        state.career.legacy += value;
        return;
      }

      if (key === "burnout" && value > 0) value *= diff.burnoutMod;
      if (key === "burnout" && value < 0) value *= diff.recoveryMod;
      if (key === "injuryRisk" && value > 0) value *= diff.injuryMod;
      if (key === "injuryRisk" && value < 0) value *= diff.recoveryMod;

      if (!Object.prototype.hasOwnProperty.call(state.ratings, key)) state.ratings[key] = 0;
      state.ratings[key] += value;
    });
    normalize(state);
    syncKnownPeople(state, true);
    if (source) pushLog(state, source, "choice");
    return state;
  }

  function geneticsFromPayload(payload) {
    const godMode = payload.creationMode === "god";
    const max = godMode ? GOD_GENETIC_MAX : REGULAR_GENETIC_MAX;
    const value = (key, fallback) => clamp(Number(payload[key] || fallback), 25, max);
    const genetics = {
      speed: value("speed", 55),
      strength: value("strength", 55),
      endurance: value("endurance", 55),
      coordination: value("coordination", 55),
      recovery: value("recovery", 55),
      iq: value("iq", 55),
      naturalPotential: value("naturalPotential", 65)
    };
    return godMode ? genetics : enforceGeneticsBudget(genetics, REGULAR_GENETICS_BUDGET);
  }

  function calculatePotential(payload, sportId, genetics) {
    const height = Number(payload.height || 72);
    const weight = Number(payload.weight || 180);
    const base =
      genetics.speed * 0.16 +
      genetics.strength * 0.14 +
      genetics.endurance * 0.14 +
      genetics.coordination * 0.2 +
      genetics.recovery * 0.12 +
      genetics.iq * 0.12 +
      genetics.naturalPotential * 0.12;

    let bodyFit = 0;
    if (sportId === "basketball") bodyFit = clamp((height - 68) * 1.5, -8, 15);
    if (sportId === "football") bodyFit = clamp((weight - 175) * 0.08 + (height - 70) * 0.5, -7, 12);
    if (sportId === "soccer") bodyFit = clamp(10 - Math.abs(weight - 165) * 0.08 + genetics.endurance * 0.05, -5, 10);
    if (sportId === "boxing" || sportId === "mma") bodyFit = clamp(genetics.endurance * 0.06 + genetics.strength * 0.05 - Math.abs(weight - 175) * 0.03, -4, 10);

    return clamp(Math.round(base + bodyFit), 35, payload.creationMode === "god" ? 100 : 98);
  }

  function roleFor(payload, sportId) {
    const sport = Data.sports[sportId];
    if (!sport) return "Prospect";
    if (sport.positions && sport.positions.length) return payload.role || sport.positions[0];
    const weight = Number(payload.weight || 180);
    if (weight < 125) return "Flyweight";
    if (weight < 135) return "Bantamweight";
    if (weight < 145) return "Featherweight";
    if (weight < 155) return "Lightweight";
    if (weight < 170) return "Welterweight";
    if (weight < 185) return "Middleweight";
    if (weight < 205) return "Light Heavyweight";
    return "Heavyweight";
  }

  function lifeStageFor(state) {
    const age = state.profile.age;
    const sport = Data.sports[state.profile.sport];
    if (age < 2) return "Birth Year";
    if (age < 5) return "Early Childhood";
    if (age < 8) return "Playground Years";
    if (age < 11) return "Youth Sports";
    if (age < 14) return state.flags?.eliteAcademy ? "Junior Academy" : "Local Youth Circuit";
    if (!state.career.pro) {
      if (state.flags?.eliteAcademy) return "Elite Academy";
      if (state.flags?.hometownPath) return "Hometown Prospect";
      return sport?.startStage || "Prospect";
    }
    return state.career.stage;
  }

  function actionRule(actionId) {
    return Data.actionRules[actionId] || { minAge: 14 };
  }

  function isActionAvailable(state, actionId) {
    const action = Data.actions.find((item) => item.id === actionId);
    if (!action) return false;
    const rule = actionRule(actionId);
    if (state.profile.age < (rule.minAge || 0)) return false;
    if (Number.isFinite(rule.maxAge) && state.profile.age > rule.maxAge) return false;
    if (actionId === "nil_push" && state.career.pro) return false;
    if ((actionId === "agent_meeting" || actionId === "smart_investment") && state.profile.age < 15) return false;
    return true;
  }

  function defaultFocusForAge(age) {
    if (age <= 6) return "early_development";
    if (age <= 11) return "balanced_training";
    return "balanced_training";
  }

  function ensureValidFocus(state) {
    if (!isActionAvailable(state, state.monthlyFocus)) {
      const fallback = Data.actions.find((action) => isActionAvailable(state, action.id));
      state.monthlyFocus = fallback ? fallback.id : defaultFocusForAge(state.profile.age);
      if (state.turn) state.turn.focusLocked = false;
    }
    return state;
  }

  function applyProfileEffects(state, effects) {
    Object.keys(effects || {}).forEach((key) => {
      const value = effects[key];
      if (key === "height") state.profile.height = clamp(state.profile.height + value, 48, 90);
      if (key === "weight") state.profile.weight = clamp(state.profile.weight + value, 25, 360);
      if (key === "potential") state.profile.potential = clamp(state.profile.potential + value, 1, 100);
    });
  }

  function migrateState(inputState) {
    const state = clone(inputState);
    state.flags = state.flags || {};
    state.flags.eventCooldowns = state.flags.eventCooldowns || {};
    state.pendingMiniGame = state.pendingMiniGame || null;
    state.pendingTrashTalk = state.pendingTrashTalk || null;
    state.knownPeople = { ...defaultKnownPeople(), ...(state.knownPeople || {}) };
    const monthKey = state.timeline?.monthsElapsed || 0;
    state.turn = state.turn || defaultTurn(monthKey);
    state.turn.monthKey = Number.isFinite(state.turn.monthKey) ? state.turn.monthKey : monthKey;
    state.turn.interactionLimit = state.turn.interactionLimit || MONTHLY_INTERACTION_LIMIT;
    if (!Number.isFinite(state.turn.interactionsLeft)) {
      state.turn.interactionsLeft = state.turn.focusLocked ? 0 : state.turn.interactionLimit;
    }
    if (!Number.isFinite(state.turn.interactionsUsed)) {
      state.turn.interactionsUsed = state.turn.interactionLimit - state.turn.interactionsLeft;
    }
    state.turn.interactionsLeft = clamp(Math.round(state.turn.interactionsLeft), 0, state.turn.interactionLimit);
    state.turn.interactionsUsed = clamp(Math.round(state.turn.interactionsUsed), 0, state.turn.interactionLimit);
    state.turn.actionHistory = Array.isArray(state.turn.actionHistory) ? state.turn.actionHistory.slice(-state.turn.interactionLimit) : [];
    state.turn.lastEffects = state.turn.lastEffects && typeof state.turn.lastEffects === "object" ? state.turn.lastEffects : null;
    state.turn.focusLocked = state.turn.interactionsLeft <= 0;
    state.profile.creationMode = state.profile.creationMode || "regular";
    state.profile.gender = state.profile.gender || "nonbinary";
    state.profile.genderLabel = state.profile.genderLabel || "Nonbinary";
    state.profile.familyMembers = Array.isArray(state.profile.familyMembers) && state.profile.familyMembers.length
      ? state.profile.familyMembers
      : familyMembersFor(state.profile.family);
    state.career.streaks = state.career.streaks || { healthyMonths: 0, hotMonths: 0, disciplineMonths: 0 };
    if (!state.profile.sportLabel && Data.sports[state.profile.sport]) state.profile.sportLabel = Data.sports[state.profile.sport].label;
    if (!state.profile.difficultyLabel && Data.difficulties[state.profile.difficulty]) state.profile.difficultyLabel = Data.difficulties[state.profile.difficulty].label;
    if (!state.career.stage) state.career.stage = lifeStageFor(state);
    syncKnownPeople(state, false);
    return ensureValidFocus(normalize(state));
  }

  function createCareer(payload) {
    const sportId = payload.sport || "basketball";
    const sport = Data.sports[sportId];
    const genetics = geneticsFromPayload(payload);
    const potential = calculatePotential(payload, sportId, genetics);
    const state = {
      version: 1,
      id: uid(),
      profile: {
        name: (payload.name || "Rookie").trim(),
        creationMode: payload.creationMode === "god" ? "god" : "regular",
        gender: payload.gender || "nonbinary",
        genderLabel: Data.genders.find((gender) => gender.id === (payload.gender || "nonbinary"))?.label || "Nonbinary",
        sport: sportId,
        sportLabel: sport.label,
        role: roleFor(payload, sportId),
        country: payload.country || "United States",
        height: Number(payload.height || 72),
        weight: Number(payload.weight || 180),
        family: payload.family || "supportive",
        familyLabel: Data.families[payload.family || "supportive"].label,
        familyMembers: familyMembersFor(payload.family || "supportive"),
        personality: payload.personality || "driven",
        personalityLabel: Data.personalities[payload.personality || "driven"].label,
        difficulty: payload.difficulty || "realistic",
        difficultyLabel: Data.difficulties[payload.difficulty || "realistic"].label,
        genetics,
        potential,
        age: 0
      },
      timeline: {
        monthIndex: 0,
        year: 1,
        monthsElapsed: 0
      },
      career: {
        stage: "Birth Year",
        pathIndex: 0,
        pro: false,
        retired: false,
        postCareer: null,
        prospectRank: 500,
        amateurRank: sportId === "boxing" || sportId === "mma" ? 250 : null,
        draftStock: 20,
        combineScore: null,
        contract: null,
        yearsPro: 0,
        achievements: [],
        injuryHistory: [],
        hallOfFame: false,
        legacy: 0,
        streaks: {
          healthyMonths: 0,
          hotMonths: 0,
          disciplineMonths: 0
        },
        attempted: {}
      },
      ratings: ratingDefaults(),
      finance: {
        money: 0,
        wealth: 0,
        debt: 0
      },
      monthlyFocus: "early_development",
      turn: defaultTurn(0),
      knownPeople: defaultKnownPeople(),
      flags: {},
      pendingEvent: null,
      pendingMiniGame: null,
      pendingTrashTalk: null,
      log: []
    };

    state.ratings.skill += (genetics.coordination - 50) * 0.14 + (genetics.iq - 50) * 0.1;
    state.ratings.athleticism += (genetics.speed - 50) * 0.18 + (genetics.strength - 50) * 0.14 + (genetics.endurance - 50) * 0.1;
    state.ratings.health += (genetics.recovery - 50) * 0.1;
    state.ratings.motivation += (potential - 60) * 0.08;
    state.ratings.injuryRisk += clamp(70 - genetics.recovery, 0, 30) * 0.08;

    applyEffects(state, Data.families[state.profile.family].effects);
    applyEffects(state, Data.personalities[state.profile.personality].effects);

    state.career.stage = lifeStageFor(state);

    pushLog(state, `${state.profile.name} is born in ${state.profile.country} with ${state.profile.familyLabel}.`, "major");
    pushLog(state, `${state.profile.personalityLabel} instincts and natural potential will start showing over time.`, "info");

    return migrateState(state);
  }

  function currentDateLabel(state) {
    return `${Data.months[state.timeline.monthIndex]} Y${state.timeline.year}, age ${state.profile.age}`;
  }

  function performanceScore(state) {
    const r = state.ratings;
    const potentialLift = (state.profile.potential - 60) * 0.18;
    let healthPenalty = Math.max(0, 80 - r.health) * 0.28 + r.injuryRisk * 0.08;
    const mind = r.mental * 0.12 + r.confidence * 0.12 + r.discipline * 0.13 + r.motivation * 0.1;
    let flagBonus = 0;
    if (state.flags?.earlySpecialization && state.profile.age >= 12) flagBonus += 2;
    if (state.flags?.multiSportBase && state.profile.age >= 14) flagBonus += 3;
    if (state.flags?.protectedChildhood && state.profile.age >= 16) flagBonus += r.burnout < 45 ? 2 : 0;
    if (state.flags?.eliteAcademy && state.profile.age >= 14) flagBonus += 4;
    if (state.flags?.hometownPath && state.profile.age >= 14) flagBonus += r.family > 55 ? 2 : 0;
    if (state.flags?.signatureSkill && state.profile.age >= 14) flagBonus += 3;
    if (state.flags?.balancedFoundation && state.profile.age >= 15) flagBonus += 2;
    if (state.flags?.lateReveal && state.profile.age >= 18) flagBonus += 3;
    if (state.flags?.undergroundTrainer) flagBonus += 2;
    if (state.flags?.weaknessAudit) flagBonus += 2;
    if (state.flags?.revengeArc && r.motivation > 60) flagBonus += 2;
    if (state.flags?.innerWork && r.burnout < 50) flagBonus += 2;
    if (state.flags?.outsidePassion && r.mental > 55) flagBonus += 1;
    if (state.flags?.trashTalkBoost && state.flags?.trashTalkMonths > 0) flagBonus += state.flags.trashTalkBoost;
    if (state.flags?.rushedGrowth) healthPenalty += 4;
    if (state.flags?.partyRisk) healthPenalty += 2;
    if (state.flags?.grindMask && r.burnout > 55) healthPenalty += 3;
    if (state.flags?.lonelyAscent && r.family < 40) healthPenalty += 2;
    if (state.flags?.movementRebuild) healthPenalty -= 2;
    const sport = r.skill * 0.26 + r.athleticism * 0.22 + mind + r.coachTrust * 0.05 + r.chemistry * 0.04;
    return clamp(Math.round(sport + potentialLift + flagBonus - healthPenalty - r.burnout * 0.12), 1, 100);
  }

  function applyMonthlyFocus(state) {
    ensureValidFocus(state);
    const action = Data.actions.find((item) => item.id === state.monthlyFocus);
    if (!action || !isActionAvailable(state, action.id)) return;
    applyEffects(state, action.effects);
    pushLog(state, `Monthly focus: ${action.label}.`, "focus");
  }

  function simulateFinances(state) {
    const r = state.ratings;
    const diff = Data.difficulties[state.profile.difficulty] || Data.difficulties.realistic;
    let income = 0;
    let expenses = 0;
    if (state.career.pro) expenses = 900;
    else if (state.profile.age >= 14) expenses = 120;
    else if (state.profile.age >= 10) expenses = 35;
    expenses += state.profile.age >= 12 ? Math.round(r.mediaHeat * 4 + Math.max(0, r.ego - 55) * 7) : 0;

    if (state.career.contract) {
      const gross = state.career.contract.salary / 12;
      const tax = gross * 0.24 * diff.taxMod;
      const agentFee = r.agent > 25 ? gross * 0.03 : 0;
      income += gross - tax - agentFee;
      state.career.contract.monthsRemaining -= 1;
    }

    const brandIncome = Math.max(0, r.brand * 12 + r.social * 4 + r.public * 3);
    if (state.career.pro || r.brand > 15) income += brandIncome * diff.salaryMod;

    const monthlyChange = income - expenses;
    if (!state.career.pro && state.profile.age < 16 && state.finance.money + monthlyChange < 0) {
      state.finance.money = 0;
    } else {
      state.finance.money += monthlyChange;
    }
    if (state.finance.wealth > 0) {
      const growthRate = 0.0015 + r.financeIQ / 50000;
      state.finance.wealth += state.finance.wealth * growthRate;
    }
    if (state.finance.debt > 0) {
      const payment = Math.min(state.finance.money * 0.15, state.finance.debt);
      state.finance.money -= payment;
      state.finance.debt -= payment;
      state.finance.debt += state.finance.debt * 0.012;
    }
  }

  function simulateBodyAndMind(state) {
    const r = state.ratings;
    const diff = Data.difficulties[state.profile.difficulty] || Data.difficulties.realistic;
    const recovery = state.profile.genetics.recovery;

    if (state.profile.age < 5) {
      r.health += 1.1;
      r.injuryRisk -= 0.8;
      r.burnout -= 1.2;
      r.motivation += 0.4;
      r.family += 0.25;
      return;
    }

    r.health += (recovery - 50) * 0.02 + diff.recoveryMod * 0.7;
    r.injuryRisk += r.burnout * 0.025 + Math.max(0, 70 - r.health) * 0.04 - recovery * 0.015;
    const agePressure = state.profile.age < 12 ? 0.45 : state.profile.age < 16 ? 0.75 : 1;
    r.burnout += diff.burnoutMod * agePressure * (1 + r.pressure / 80) - r.mental * 0.018 - r.family * 0.012;
    r.motivation += randomBetween(-2, 2) + (r.confidence - 50) * 0.015;
    r.confidence += (performanceScore(state) - 50) * 0.02 - r.burnout * 0.01;
    r.mediaHeat -= 2;
    r.social -= 0.5;
    r.public += state.career.pro ? 0.4 : state.profile.age >= 12 ? 0.1 : 0;
    if (state.profile.age >= 5 && state.profile.age <= 20) {
      r.academics += r.discipline * 0.01 - r.burnout * 0.015;
    } else if (state.profile.age > 20) {
      r.academics -= 0.25;
    }

    const youthMod = state.profile.age < 12 ? 0.35 : state.profile.age < 16 ? 0.65 : 1;
    const injuryChance = ((r.injuryRisk / 2800) * diff.injuryMod + r.burnout / 6500) * youthMod;
    if (Math.random() < injuryChance) {
      const severity = Math.round(randomBetween(6, 22) * diff.injuryMod);
      r.health -= severity;
      r.injuryRisk += severity * 0.4;
      r.burnout += 4;
      state.career.injuryHistory.push({
        date: currentDateLabel(state),
        severity
      });
      pushLog(state, `Injury setback: recovery load increases after a severity ${severity} issue.`, "bad");
    }
  }

  function updateCompetition(state) {
    if (state.profile.age < 8) return;
    const score = performanceScore(state);
    const r = state.ratings;
    const isCombat = state.profile.sport === "boxing" || state.profile.sport === "mma";

    if (state.profile.age < 14) {
      state.ratings.public += score > 55 ? 0.25 : 0.05;
      state.ratings.confidence += (score - 45) * 0.015;
      return;
    }

    if (isCombat) {
      const change = Math.round((score - 42) / 5 + randomBetween(-2, 2));
      state.career.amateurRank = clamp((state.career.amateurRank || 250) - change, 1, 250);
      if (state.career.pro) {
        state.career.legacy += Math.max(0, score - 55) * 0.18 + Math.max(0, 60 - state.career.amateurRank) * 0.05;
      }
    } else {
      state.career.draftStock = clamp(state.career.draftStock + (score - 48) * 0.12 + randomBetween(-2, 2), 0, 100);
      state.career.prospectRank = clamp(Math.round(1000 - state.career.draftStock * 9 + randomBetween(-12, 12)), 1, 1000);
      if (state.career.pro) {
        state.career.legacy += Math.max(0, score - 55) * 0.15 + r.public * 0.02;
      }
    }

    if (score >= 88 && !state.career.achievements.includes("Breakout season")) {
      state.career.achievements.push("Breakout season");
      state.career.legacy += 20;
      pushLog(state, "Achievement unlocked: Breakout season.", "major");
    }
    if (state.finance.wealth >= 1000000 && !state.career.achievements.includes("Millionaire investor")) {
      state.career.achievements.push("Millionaire investor");
      state.career.legacy += 14;
      pushLog(state, "Achievement unlocked: Millionaire investor.", "major");
    }
    maybeTrashTalkEvent(state);
  }

  function updateStreaks(state) {
    const score = performanceScore(state);
    const streaks = state.career.streaks;
    streaks.healthyMonths = state.ratings.injuryRisk < 35 && state.ratings.health > 70 ? streaks.healthyMonths + 1 : 0;
    streaks.hotMonths = score >= 72 ? streaks.hotMonths + 1 : 0;
    streaks.disciplineMonths = state.ratings.discipline >= 65 && state.ratings.burnout < 60 ? streaks.disciplineMonths + 1 : 0;

    if (streaks.healthyMonths === 12 && !state.career.achievements.includes("Healthy year")) {
      state.career.achievements.push("Healthy year");
      state.career.legacy += 8;
      pushLog(state, "Achievement unlocked: Healthy year.", "major");
    }
    if (streaks.hotMonths === 6 && !state.career.achievements.includes("Six-month heater")) {
      state.career.achievements.push("Six-month heater");
      state.career.legacy += 10;
      pushLog(state, "Achievement unlocked: Six-month heater.", "major");
    }
    if (streaks.disciplineMonths === 10 && !state.career.achievements.includes("Built different")) {
      state.career.achievements.push("Built different");
      state.career.legacy += 8;
      pushLog(state, "Achievement unlocked: Built different.", "major");
    }
  }

  function maybeTimelineFlavor(state) {
    if (Math.random() > 0.32) return;
    const sport = Data.sports[state.profile.sport]?.label || "sport";
    const snippets = [
      `${state.profile.name} has a quiet ${sport.toLowerCase()} day that still feels important later.`,
      `A small conversation at home changes the mood of the month.`,
      `Someone notices the routine is getting more serious.`,
      `A forgettable practice leaves one useful lesson behind.`,
      `The group chat is louder than usual after a weird week.`,
      `A teacher, neighbor, or local supporter asks how the dream is going.`,
      `A tiny confidence boost shows up at the right time.`,
      `The body feels different this month, and the training plan adjusts.`,
      `A calm day away from the spotlight keeps the story grounded.`,
      `A minor mistake becomes something to laugh about instead of panic over.`
    ];
    if (state.profile.age < 6) {
      snippets.push("Family routines, sleep, and play do more work than anyone realizes.");
      snippets.push("A playful moment becomes part of the athlete's early confidence.");
    } else if (state.profile.age < 13) {
      snippets.push("A playground rep turns into a tiny piece of identity.");
      snippets.push("A school-day win makes the sport feel a little more real.");
    } else if (!state.career.pro) {
      snippets.push("A scout rumor floats around, even if nobody knows what to believe.");
      snippets.push("A stronger opponent exposes one thing to work on.");
    } else {
      snippets.push("A veteran's comment sticks longer than expected.");
      snippets.push("The locker room feels different after a hard week.");
    }
    pushLog(state, snippets[Math.floor(Math.random() * snippets.length)], "info");
  }

  function advanceClock(state) {
    const priorStage = state.career.stage;
    state.timeline.monthsElapsed += 1;
    state.timeline.monthIndex = (state.timeline.monthIndex + 1) % 12;
    state.turn = defaultTurn(state.timeline.monthsElapsed);
    if (state.timeline.monthIndex === 0) {
      state.timeline.year += 1;
      state.profile.age += 1;
      if (state.career.pro) state.career.yearsPro += 1;
      pushLog(state, `${state.profile.name} turns ${state.profile.age}.`, "info");
    }
    if (state.flags.trashTalkMonths > 0) {
      state.flags.trashTalkMonths -= 1;
      if (state.flags.trashTalkMonths <= 0) {
        state.flags.trashTalkBoost = 0;
      }
    }
    if (!state.career.pro && !state.career.retired) {
      state.career.stage = lifeStageFor(state);
      if (state.career.stage !== priorStage) {
        pushLog(state, `Life stage changed: ${state.career.stage}.`, "major");
      }
    }
    syncKnownPeople(state, true);
    ensureValidFocus(state);
  }

  function setContract(state, style) {
    const score = performanceScore(state);
    const diff = Data.difficulties[state.profile.difficulty] || Data.difficulties.realistic;
    const baseSalary = state.profile.sport === "boxing" || state.profile.sport === "mma" ? 45000 : 150000;
    const legacyBoost = Math.max(0, state.career.legacy) * 900;
    let salary = baseSalary + score * score * 42 + legacyBoost + state.ratings.brand * 1800;
    let months = 24;
    let teamFit = 55;
    let brandControl = 50;

    if (style === "money") {
      salary *= 1.35;
      teamFit -= 10;
      brandControl -= 8;
      state.ratings.ego += 3;
    }
    if (style === "fit") {
      salary *= 0.92;
      teamFit += 15;
      state.ratings.chemistry += 8;
      state.ratings.coachTrust += 5;
    }
    if (style === "brand") {
      salary *= 1.05;
      brandControl += 20;
      state.ratings.brand += 8;
      state.ratings.mediaHeat += 3;
    }

    salary = Math.round(salary * diff.salaryMod);
    state.career.contract = {
      salary,
      monthsRemaining: months,
      teamFit,
      brandControl
    };
    state.career.pro = true;
    state.career.stage = Data.sports[state.profile.sport].proStage;
    state.career.pathIndex = Math.max(state.career.pathIndex, 2);
    pushLog(state, `Contract signed: $${salary.toLocaleString()} per year for ${Math.round(months / 12)} years.`, "major");
    normalize(state);
  }

  function buildContractEvent(state) {
    return {
      id: "contract_window",
      kind: "contract",
      title: "Contract Window",
      text: "Teams, sponsors, and advisors want different versions of your future.",
      choices: [
        { label: "Max Money", effects: { agent: 4, public: -1 }, contractStyle: "money", log: "You chase the biggest number." },
        { label: "Best Team Fit", effects: { chemistry: 5, coachTrust: 4 }, contractStyle: "fit", log: "You choose the room that helps you play." },
        { label: "Brand Control", effects: { brand: 6, social: 4 }, contractStyle: "brand", log: "You protect your image and off-field upside." }
      ]
    };
  }

  function buildCombineEvent(state) {
    const sport = Data.sports[state.profile.sport];
    const label = state.profile.sport === "soccer" ? "Trial Week" : state.profile.sport === "boxing" || state.profile.sport === "mma" ? "Pro Tryout" : "Draft Combine";
    return {
      id: "combine_window",
      kind: "combine",
      title: label,
      text: `${sport.combine.join(", ")} will shape your next path.`,
      choices: [
        { label: "All-In Showcase", effects: { confidence: 5, burnout: 5, injuryRisk: 4 }, combineBonus: 8, log: "You push for a spectacular showing." },
        { label: "Balanced Plan", effects: { discipline: 3, coachTrust: 2, burnout: 1 }, combineBonus: 3, log: "You aim for complete, reliable work." },
        { label: "Safe and Healthy", effects: { health: 7, injuryRisk: -5, confidence: -1 }, combineBonus: -2, log: "You protect the body and accept a quieter evaluation." }
      ]
    };
  }

  function buildRetirementEvent(state) {
    return {
      id: "retirement_window",
      kind: "retirement",
      title: "Retirement Crossroads",
      text: "Your playing career is near its final chapter. The next identity matters.",
      choices: Data.postCareer.map((career) => ({
        label: career,
        postCareer: career,
        effects: career === "Coach" || career === "Trainer" ? { legacy: 8, coachTrust: 6 } : { brand: 5, wealth: 1800, public: 3 },
        log: `You begin shaping a future as a ${career.toLowerCase()}.`
      }))
    };
  }

  function buildTrainingMiniGame(state, action) {
    const variants = [
      {
        id: "timing_drill",
        title: "Timing Drill",
        text: `${action.label} turns into a quick reaction drill. Pick the risk level.`,
        choices: [
          { label: "Perfect Timing", effects: { skill: 3, confidence: 2, injuryRisk: 1 }, log: "Mini drill: perfect timing makes the work pop." },
          { label: "Clean Reps", effects: { skill: 1, discipline: 2, burnout: -1 }, log: "Mini drill: clean reps keep the month efficient." },
          { label: "Skip Bonus", effects: { burnout: -2, health: 1 }, log: "Mini drill skipped: you protect energy for later." }
        ]
      },
      {
        id: "conditioning_burst",
        title: "Conditioning Burst",
        text: "A bonus sprint set is available after training.",
        choices: [
          { label: "Empty the Tank", effects: { athleticism: 4, motivation: 2, burnout: 3, injuryRisk: 2 }, log: "Mini drill: the extra burst raises the ceiling and the fatigue." },
          { label: "Controlled Pace", effects: { athleticism: 2, discipline: 2, burnout: 1 }, log: "Mini drill: controlled pace stacks solid work." },
          { label: "Recovery Instead", effects: { health: 3, injuryRisk: -2, burnout: -2 }, log: "Mini drill: recovery wins today." }
        ]
      },
      {
        id: "film_flash",
        title: "Film Flash",
        text: "A coach pauses the session and asks what you see.",
        choices: [
          { label: "Call the Read", effects: { skill: 2, coachTrust: 3, confidence: 1 }, log: "Mini drill: your read earns trust." },
          { label: "Ask for Help", effects: { mentor: 2, mental: 2, ego: -1 }, log: "Mini drill: asking the right question helps." },
          { label: "Play Instinctive", effects: { athleticism: 2, ego: 2, coachTrust: -1 }, log: "Mini drill: instinct carries the rep, but the staff wants more detail." }
        ]
      }
    ];
    const drill = clone(variants[Math.floor(Math.random() * variants.length)]);
    drill.actionId = action.id;
    drill.date = currentDateLabel(state);
    return drill;
  }

  function buildTrashTalkEvent(state) {
    const opponents = ["a rival prospect", "a loud defender", "the other captain", "a ranked opponent", "a media-hyped matchup"];
    return {
      id: `trash_talk_${state.timeline.monthsElapsed}`,
      title: "Heated Moment",
      opponent: opponents[Math.floor(Math.random() * opponents.length)],
      text: "The game gets tense. You can say something, let the AI-style generator write a line, or skip it.",
      maxLength: 150
    };
  }

  function generateTrashTalkText(state) {
    const lines = [
      "You are about to learn why they warned you about me.",
      "Keep talking. I play better when you make it personal.",
      "That matchup is not pressure for me. It is cardio.",
      "I hope your coach has a backup plan for this.",
      "You brought noise. I brought receipts.",
      "By the end, your highlight is going to be guarding me."
    ];
    return lines[Math.floor(Math.random() * lines.length)].slice(0, 150);
  }

  function scoreTrashTalk(text) {
    const cleaned = String(text || "").slice(0, 150).trim();
    const lower = cleaned.toLowerCase();
    const harshWords = ["soft", "weak", "scared", "washed", "fraud", "slow", "bench", "choke", "trash", "clown", "backup", "warning"];
    const weakWords = ["please", "maybe", "sorry", "nice", "try", "hope"];
    const harshHits = harshWords.filter((word) => lower.includes(word)).length;
    const weakHits = weakWords.filter((word) => lower.includes(word)).length;
    const caps = cleaned.replace(/[^A-Z]/g, "").length;
    const letters = cleaned.replace(/[^A-Za-z]/g, "").length || 1;
    const capsRatio = caps / letters;
    const punctuation = (cleaned.match(/[!?]/g) || []).length;
    return clamp(Math.round(cleaned.length * 0.24 + harshHits * 12 + punctuation * 3 + capsRatio * 24 - weakHits * 8), 0, 100);
  }

  function maybeTrashTalkEvent(state) {
    if (state.pendingEvent || state.pendingMiniGame || state.pendingTrashTalk || state.career.retired) return;
    if (state.profile.age < 12) return;
    const heat = state.ratings.rivalry + state.ratings.mediaHeat + state.ratings.confidence * 0.35;
    const chance = 0.006 + heat / 16000;
    if (Math.random() < chance) {
      state.pendingTrashTalk = buildTrashTalkEvent(state);
    }
  }

  function resolveCombine(state, choice) {
    const sportId = state.profile.sport;
    const score = clamp(Math.round(performanceScore(state) + (choice.combineBonus || 0) + randomBetween(-9, 9)), 1, 100);
    state.career.combineScore = score;
    state.career.attempted.combine = (state.career.attempted.combine || 0) + 1;
    state.career.attempted.nextTryMonth = state.timeline.monthsElapsed + 12;

    const easyBoost = state.profile.difficulty === "casual" ? -6 : state.profile.difficulty === "brutal" ? 8 : 0;
    const proLine = 62 + easyBoost;
    const fringeLine = 48 + easyBoost;

    if (score >= proLine) {
      setContract(state, "fit");
      state.career.achievements.push(sportId === "soccer" ? "Signed senior club deal" : sportId === "boxing" || sportId === "mma" ? "Turned professional" : "Drafted");
      state.career.legacy += 18;
      pushLog(state, `Evaluation score ${score}: you move onto the professional path.`, "major");
      return;
    }

    if (score >= fringeLine) {
      state.career.stage = sportId === "soccer" ? "Domestic League Trialist" : sportId === "football" ? "Practice Squad Radar" : sportId === "basketball" ? "International Prospect" : "Regional Prospect";
      state.career.pathIndex = Math.max(state.career.pathIndex, 1);
      state.career.draftStock = clamp(state.career.draftStock + 8, 0, 100);
      pushLog(state, `Evaluation score ${score}: not secure yet, but the door stays open.`, "major");
      return;
    }

    state.career.stage = sportId === "soccer" ? "Academy Reset" : sportId === "football" ? "College Depth Chart" : sportId === "basketball" ? "College Reset" : "Amateur Reset";
    state.ratings.confidence -= 5;
    state.ratings.motivation += 3;
    pushLog(state, `Evaluation score ${score}: you need another year of development.`, "bad");
  }

  function resolveRetirement(state, choice) {
    state.career.retired = true;
    state.career.postCareer = choice.postCareer;
    const hofLine = state.profile.difficulty === "brutal" ? 190 : state.profile.difficulty === "casual" ? 130 : 160;
    state.career.hallOfFame = state.career.legacy >= hofLine || state.career.achievements.length >= 5;
    if (state.career.hallOfFame) {
      state.career.achievements.push("Hall of Fame");
      pushLog(state, "Hall of Fame call: your career becomes part of the sport's memory.", "major");
    }
    pushLog(state, `Retired into post-career path: ${choice.postCareer}.`, "major");
  }

  function maybeMilestone(state) {
    if (state.pendingEvent || state.pendingMiniGame || state.pendingTrashTalk || state.career.retired) return;
    const sportId = state.profile.sport;
    const sport = Data.sports[sportId];
    const age = state.profile.age;

    if (!state.career.pro) {
      if (
        (sportId === "basketball" || sportId === "football") &&
        age >= 18 &&
        state.career.pathIndex === 0 &&
        ["School Prospect", "Elite Academy", "Hometown Prospect"].includes(state.career.stage)
      ) {
        state.career.stage = sportId === "football" ? "College Football" : "College Basketball";
        state.career.pathIndex = 1;
        pushLog(state, `You enter the ${state.career.stage} system.`, "major");
      }

      const canTry = !state.career.attempted.nextTryMonth || state.timeline.monthsElapsed >= state.career.attempted.nextTryMonth;
      const rankReady = sportId === "boxing" || sportId === "mma" ? (state.career.amateurRank || 250) <= 90 || age >= sport.draftAge + 1 : true;

      if (age >= sport.draftAge && canTry && rankReady) {
        state.pendingEvent = buildCombineEvent(state);
      }
    }

    if (state.career.pro && state.career.contract && state.career.contract.monthsRemaining <= 0) {
      state.pendingEvent = buildContractEvent(state);
    }

    const retirementPressure = age >= 38 || (age >= 35 && state.ratings.health < 45) || age >= 34 + Math.max(0, state.career.injuryHistory.length - 2);
    if (state.career.pro && retirementPressure && !state.career.attempted.retirement) {
      state.career.attempted.retirement = true;
      state.pendingEvent = buildRetirementEvent(state);
    }
  }

  function eligibleEvents(state) {
    return Data.majorEvents.filter((event) => {
      if (event.minAge && state.profile.age < event.minAge) return false;
      if (event.maxAge && state.profile.age > event.maxAge) return false;
      if (event.sports && !event.sports.includes(state.profile.sport)) return false;
      if (event.maxStage === "prepro" && state.career.pro) return false;
      if (event.once && state.flags?.[`seen_${event.id}`]) return false;
      const lastSeen = state.flags.eventCooldowns?.[event.id];
      if (Number.isFinite(lastSeen) && state.timeline.monthsElapsed - lastSeen < (event.cooldownMonths || 36)) return false;
      return true;
    });
  }

  function maybeRandomEvent(state) {
    if (state.pendingEvent || state.pendingMiniGame || state.pendingTrashTalk || state.career.retired) return;
    if (state.profile.age < 5) return;
    const diff = Data.difficulties[state.profile.difficulty] || Data.difficulties.realistic;
    const extra = state.ratings.mediaHeat / 500 + state.ratings.injuryRisk / 800;
    if (Math.random() > diff.eventChance + extra) return;
    const options = eligibleEvents(state);
    if (!options.length) return;
    const event = pickWeighted(options, (item) => {
      let weight = item.weight || 5;
      if (item.id === "injury_scare") weight += state.ratings.injuryRisk / 15;
      if (item.id === "media_narrative" || item.id === "viral_highlight") weight += state.ratings.mediaHeat / 12 + state.ratings.social / 18;
      if (item.id === "endorsement_offer") weight += state.ratings.brand / 15 + state.ratings.social / 20;
      return weight;
    });
    state.pendingEvent = clone(event);
  }

  function advanceMonth(inputState) {
    const state = migrateState(inputState);
    if (state.pendingEvent || state.pendingMiniGame || state.pendingTrashTalk || state.career.retired) return state;

    applyMonthlyFocus(state);
    simulateBodyAndMind(state);
    simulateFinances(state);
    updateCompetition(state);
    updateStreaks(state);
    maybeTimelineFlavor(state);
    advanceClock(state);
    maybeMilestone(state);
    maybeRandomEvent(state);

    if (state.finance.debt > 50000 && !state.career.achievements.includes("Bankruptcy scare")) {
      state.career.achievements.push("Bankruptcy scare");
      state.ratings.public -= 6;
      state.ratings.mental -= 4;
      pushLog(state, "Bankruptcy risk enters the story. Financial choices matter now.", "bad");
    }

    return normalize(state);
  }

  function advanceTime(inputState, months) {
    let state = migrateState(inputState);
    let advanced = 0;
    const steps = clamp(Math.round(months || 1), 1, 120);
    for (let index = 0; index < steps; index += 1) {
      if (state.pendingEvent || state.pendingMiniGame || state.pendingTrashTalk || state.career.retired) break;
      state = advanceMonth(state);
      advanced += 1;
      if (state.pendingEvent || state.pendingMiniGame || state.pendingTrashTalk || state.career.retired) break;
    }
    return {
      state,
      advanced,
      stoppedForEvent: Boolean(state.pendingEvent),
      stoppedForMiniGame: Boolean(state.pendingMiniGame),
      stoppedForTrashTalk: Boolean(state.pendingTrashTalk),
      stoppedForRetirement: Boolean(state.career.retired)
    };
  }

  function chooseEvent(inputState, choiceIndex) {
    const state = migrateState(inputState);
    if (!state.pendingEvent) return state;
    const event = state.pendingEvent;
    const choice = event.choices[choiceIndex];
    if (!choice) return state;

    state.pendingEvent = null;
    if (event.once) state.flags[`seen_${event.id}`] = true;
    state.flags.eventCooldowns[event.id] = state.timeline.monthsElapsed;
    Object.assign(state.flags, choice.flags || {});
    applyProfileEffects(state, choice.profileEffects);
    state.turn.lastEffects = choice.effects || {};
    applyEffects(state, choice.effects || {});
    pushLog(state, choice.log || `${event.title}: ${choice.label}.`, "choice");

    if (event.kind === "combine") resolveCombine(state, choice);
    if (event.kind === "contract") setContract(state, choice.contractStyle || "fit");
    if (event.kind === "retirement") resolveRetirement(state, choice);

    return normalize(state);
  }

  function chooseMiniGame(inputState, choiceIndex) {
    const state = migrateState(inputState);
    if (!state.pendingMiniGame) return state;
    const miniGame = state.pendingMiniGame;
    const choice = miniGame.choices[choiceIndex];
    if (!choice) return state;

    state.pendingMiniGame = null;
    state.turn.lastEffects = choice.effects || {};
    applyEffects(state, choice.effects || {});
    pushLog(state, choice.log || `${miniGame.title}: ${choice.label}.`, "choice");
    return normalize(state);
  }

  function submitTrashTalk(inputState, text) {
    const state = migrateState(inputState);
    if (!state.pendingTrashTalk) return state;
    const line = String(text || "").slice(0, 150).trim();
    if (!line) return skipTrashTalk(state);
    const score = scoreTrashTalk(line);
    state.pendingTrashTalk = null;
    let effects;
    let boost;
    let result;
    if (score >= 70) {
      effects = { confidence: 4, rivalry: 3, mediaHeat: 3, ego: 2 };
      boost = 4;
      result = "The opponent looks rattled. Your edge carries into the next run.";
    } else if (score <= 32) {
      effects = { confidence: -3, rivalry: -1, mediaHeat: 1, ego: -1 };
      boost = -3;
      result = "The line lands weak and the opponent feeds off it.";
    } else {
      effects = { confidence: 1, rivalry: 1, mediaHeat: 2 };
      boost = 1;
      result = "The exchange adds heat without fully swinging the matchup.";
    }
    state.flags.trashTalkBoost = boost;
    state.flags.trashTalkMonths = 3;
    state.turn.lastEffects = effects;
    applyEffects(state, effects);
    pushLog(state, `Trash talk (${score}/100): "${line}" ${result}`, "choice");
    return normalize(state);
  }

  function skipTrashTalk(inputState) {
    const state = migrateState(inputState);
    if (!state.pendingTrashTalk) return state;
    state.pendingTrashTalk = null;
    pushLog(state, "Heated moment skipped. The matchup stays decided by the game.", "info");
    return normalize(state);
  }

  function setFocus(inputState, actionId) {
    const state = migrateState(inputState);
    const action = Data.actions.find((item) => item.id === actionId);
    if (!action || !isActionAvailable(state, actionId) || state.pendingEvent || state.pendingMiniGame || state.pendingTrashTalk || state.career.retired) {
      return normalize(state);
    }
    if (state.turn.interactionsLeft <= 0) {
      return normalize(state);
    }
    state.monthlyFocus = actionId;
    state.turn.interactionsUsed = clamp(state.turn.interactionsUsed + 1, 0, state.turn.interactionLimit);
    state.turn.interactionsLeft = clamp(state.turn.interactionLimit - state.turn.interactionsUsed, 0, state.turn.interactionLimit);
    state.turn.focusLocked = state.turn.interactionsLeft <= 0;
    state.turn.actionHistory = [...state.turn.actionHistory, action.label].slice(-state.turn.interactionLimit);
    const immediateEffects = scaleEffects(action.effects, 0.35);
    state.turn.lastEffects = immediateEffects;
    applyEffects(state, immediateEffects);
    if (action.category === "training" && state.profile.age >= 5 && Math.random() < 0.45) {
      state.pendingMiniGame = buildTrainingMiniGame(state, action);
    }
    pushLog(state, `Interaction used: ${action.label}. ${state.turn.interactionsLeft} left this month.`, "focus");
    return normalize(state);
  }

  function randomCareerPayload() {
    const sportKeys = Object.keys(Data.sports);
    const sport = sportKeys[Math.floor(Math.random() * sportKeys.length)];
    const familyKeys = Object.keys(Data.families);
    const personalityKeys = Object.keys(Data.personalities);
    const gender = Data.genders[Math.floor(Math.random() * Data.genders.length)].id;
    const first = ["Jordan", "Maya", "Isaiah", "Sofia", "Kai", "Ari", "Marcus", "Nia", "Leo", "Zara"];
    const last = ["Reed", "Stone", "Carter", "Okafor", "Silva", "Bennett", "Moreno", "Kim", "Hayes", "Diallo"];
    const roles = Data.sports[sport].positions || [];

    return {
      name: `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`,
      gender,
      sport,
      role: roles.length ? roles[Math.floor(Math.random() * roles.length)] : "",
      country: Data.countries[Math.floor(Math.random() * Data.countries.length)],
      height: Math.round(randomBetween(64, sport === "basketball" ? 83 : 76)),
      weight: Math.round(randomBetween(125, sport === "football" ? 275 : 215)),
      family: familyKeys[Math.floor(Math.random() * familyKeys.length)],
      personality: personalityKeys[Math.floor(Math.random() * personalityKeys.length)],
      difficulty: "realistic",
      creationMode: "regular",
      speed: Math.round(randomBetween(35, 90)),
      strength: Math.round(randomBetween(35, 90)),
      endurance: Math.round(randomBetween(35, 90)),
      coordination: Math.round(randomBetween(35, 90)),
      recovery: Math.round(randomBetween(35, 90)),
      iq: Math.round(randomBetween(35, 90)),
      naturalPotential: Math.round(randomBetween(45, 95))
    };
  }

  function formatHeight(inches) {
    const feet = Math.floor(inches / 12);
    const remainder = inches % 12;
    return `${feet}'${remainder}"`;
  }

  function formatAge(age) {
    if (age === 0) return "Newborn";
    if (age === 1) return "1 year";
    return `${age} years`;
  }

  window.LegacyLeagueLogic = {
    createCareer,
    advanceMonth,
    advanceTime,
    chooseEvent,
    chooseMiniGame,
    submitTrashTalk,
    skipTrashTalk,
    generateTrashTalkText,
    setFocus,
    migrateState,
    isActionAvailable,
    actionRule,
    randomCareerPayload,
    performanceScore,
    currentDateLabel,
    formatHeight,
    formatAge,
    clamp
  };
})();
