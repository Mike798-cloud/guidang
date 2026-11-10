(() => {
  "use strict";

  const H4 = window.H4 = window.H4 || {};
  H4.KEY = "h4_archive_save_v3";

  const progressLists = ["read", "unlocked", "contradictions", "fragments", "endingsSeen", "profiles", "radio"];

  H4.defaultState = function () {
    return {
      v: 3,
      rulesRevision: 7,
      cycle: 1,
      anomaly: 0,
      muted: false,
      reduced: false,
      read: [],
      unlocked: [],
      contradictions: [],
      fragments: [],
      endingsSeen: [],
      profiles: [],
      organized: {},
      organizedModes: {time: {}, person: {}},
      archiveMode: "time",
      radio: [],
      lookbacks: 0,
      stairLoops: 0,
      footWrong: 0,
      flags: {},
      corridor: {seg: 1, p: 0},
      floor: 0
    };
  };

  H4.state = H4.defaultState();

  const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const isNumeric = value => (typeof value === "number" || typeof value === "string") && Number.isFinite(Number(value));

  function validSave(saved, defaults) {
    if (!isRecord(saved) || saved.v !== defaults.v || ![1, 2].includes(saved.cycle)) return false;
    if (!Array.isArray(saved.read) || !Array.isArray(saved.unlocked) || !isRecord(saved.flags)) return false;

    // Earlier v3 saves can omit fields that were introduced by a rules revision.
    for (const [key, fallback] of Object.entries(defaults)) {
      if (!Object.hasOwn(saved, key)) continue;
      const value = saved[key];
      if (key === "floor") {
        if (!isNumeric(value)) return false;
      } else if (Array.isArray(fallback)) {
        if (!Array.isArray(value)) return false;
      } else if (isRecord(fallback)) {
        if (!isRecord(value)) return false;
      } else if (typeof value !== typeof fallback || (typeof value === "number" && !Number.isFinite(value))) {
        return false;
      }
    }

    const {corridor, organizedModes, flags} = saved;
    if (["seg", "p"].some(key => Object.hasOwn(corridor || {}, key) && !isNumeric(corridor[key]))) return false;
    if (["time", "person"].some(key => Object.hasOwn(organizedModes || {}, key) && !isRecord(organizedModes[key]))) return false;
    return ["publishedEdition", "endingSnapshots"].every(key => !Object.hasOwn(flags, key) || isRecord(flags[key]));
  }

  H4.load = function () {
    let raw;
    try {
      raw = localStorage.getItem(H4.KEY);
    } catch {
      H4.state = H4.defaultState();
      return;
    }
    if (raw === null) return;

    let saved;
    try {
      saved = JSON.parse(raw);
    } catch {
      // An invalid JSON value follows the same fallback as an invalid save structure.
    }
    const defaults = H4.defaultState();
    if (!validSave(saved, defaults)) {
      H4.state = defaults;
      H4.notice("本机存档读不了，这次从头开始。");
      return;
    }

    const state = {...defaults, ...saved};
    for (const key of progressLists) {
      state[key] = [...new Set(state[key].filter(value => typeof value === "string"))];
    }
    state.flags = {...saved.flags};
    state.archiveMode = saved.archiveMode === "person" ? "person" : "time";
    state.organizedModes = {
      time: {...saved.organizedModes?.time},
      person: {...saved.organizedModes?.person}
    };
    if (!saved.organizedModes) {
      state.organizedModes[state.archiveMode] = {...saved.organized};
    }

    const personFiles = state.organizedModes.person;
    for (const id of Object.keys(personFiles)) {
      if (personFiles[id] === "飞杳") personFiles[id] = "林杳";
    }
    state.organized = {...state.organizedModes[state.archiveMode]};

    const corridor = saved.corridor;
    state.corridor = {
      seg: Math.max(1, Math.min(3, Math.floor(Number(corridor?.seg) || 1))),
      p: Math.max(0, Math.min(1, Number(corridor?.p) || 0)),
      passed: {0: !!corridor?.passed?.[0], 1: !!corridor?.passed?.[1]}
    };
    state.floor = Math.max(0, Math.min(2, Math.floor(Number(saved.floor) || 0)));

    if (!saved.rulesRevision || saved.rulesRevision < 4) {
      state.contradictions = [];
      state.flags.timelineDone = false;
      state.flags.proofsRevised = true;
    }
    if (!["family", "excerpts"].includes(state.flags.memoScope) ||
        !["initials", "names"].includes(state.flags.memoIdentity)) {
      state.flags.mirrorReviewed = false;
    }
    if (saved.rulesRevision && saved.rulesRevision < 6 && state.radio.length === 6 && state.flags.timelineDone) {
      state.flags.tapeLayout = {gap: "unknown", trial: "r6"};
      state.flags.tapeReviewed = true;
    }
    if (state.endingsSeen.includes("e5")) {
      if (!state.flags.publishedEdition) {
        const edition = {
          scope: state.flags.memoScope || "family",
          identity: state.flags.memoIdentity || "initials",
          line: state.flags.memoLine || "",
          version: 1
        };
        state.flags.publishedEdition = edition;
        state.flags.endingSnapshots = state.flags.endingSnapshots || {};
        state.flags.endingSnapshots.e5 = {...edition};
      }
      state.flags.personalPagePublished = true;
    }
    state.rulesRevision = defaults.rulesRevision;
    H4.state = state;
  };

  H4.save = function () {
    try {
      localStorage.setItem(H4.KEY, JSON.stringify(H4.state));
      H4.storageFailed = false;
    } catch {
      H4.storageFailed = true;
    }
    H4.app?.status?.();
  };

  H4.hasClue = function (id) {
    return H4.state.unlocked.includes(id);
  };

  H4.add = function (list, id) {
    if (H4.state[list].includes(id)) return false;
    H4.state[list].push(id);
    H4.save();
    return true;
  };

  H4.giveClue = function (id) {
    if (!H4.add("unlocked", id)) return false;
    H4.state.anomaly = Math.min(3, Math.floor(H4.state.read.length / 5));
    H4.save();
  };

  H4.markContradiction = function (id) {
    return H4.data.CONTRADICTION_PAIRS.some(pair => pair.id === id) && H4.add("contradictions", id);
  };

  H4.unlockProfile = function (id) {
    H4.add("profiles", id);
  };

  H4.readSource = function (id) {
    H4.add("read", id);
    if (id.startsWith("p_")) H4.unlockProfile(id.slice(2));
  };

  H4.giveFragment = function (id) {
    return H4.state.cycle === 2 && H4.add("fragments", id) && H4.notice("日记已收好，可在线索簿重读。");
  };

  H4.seeEnding = function (id) {
    H4.add("endingsSeen", id);
  };

  H4.nextCycle = function () {
    H4.state.cycle = 2;
    H4.state.anomaly = 2;
    H4.state.floor = 0;
    H4.state.corridor = {seg: 1, p: 0};
    H4.state.flags.lookedThisRun = false;
    H4.save();
    H4.go("#/home");
  };

  H4.resetAll = function () {
    const {muted, reduced} = H4.state;
    H4.app?.clear();
    H4.state = {...H4.defaultState(), muted, reduced};
    H4.save();
  };
})();
