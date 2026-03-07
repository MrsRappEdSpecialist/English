const STORAGE_KEY = "holocaust-learning-experience-v1";

const timelineEventsCorrect = [
  "1933: Hitler becomes Chancellor of Germany.",
  "1935: Nuremberg Laws strip Jews of rights.",
  "1938: Kristallnacht (state-sponsored violence).",
  "1939: Germany invades Poland; World War II begins.",
  "1942: Wannsee Conference coordinates the 'Final Solution'.",
  "1945: Liberation of camps and end of war in Europe."
];

const endingEventsCorrect = [
  "1944-1945: Allied forces move across Europe and uncover camps.",
  "January 1945: Auschwitz is liberated.",
  "Spring 1945: More camps are liberated across Europe.",
  "May 8, 1945: Nazi Germany surrenders in Europe (VE Day).",
  "1945-1946: Nuremberg Trials begin to prosecute war crimes."
];

const scratchFacts = [
  "The Holocaust was driven by antisemitic ideology, laws, propaganda, and state violence.",
  "About six million Jewish people were murdered, along with millions of other victims.",
  "Ghettos, concentration camps, and extermination camps were central tools of oppression and murder.",
  "Rescuers, resistance groups, and survivors provide evidence and testimony that shape history education."
];

const matchData = [
  {
    term: "Antisemitism",
    definition: "Prejudice, hostility, or discrimination against Jewish people."
  },
  {
    term: "Ghetto",
    definition: "A segregated area where Jews were forced to live under Nazi control."
  },
  {
    term: "Liberation",
    definition: "The freeing of people and camps by Allied forces near the end of the war."
  },
  {
    term: "Nuremberg Trials",
    definition: "Post-war trials that prosecuted major Nazi leaders for crimes."
  }
];

const causeImpactData = [
  {
    statement: "Nazi propaganda spread false ideas about Jewish people.",
    category: "Cause"
  },
  {
    statement: "Laws removed rights from Jewish citizens.",
    category: "Policy/Action"
  },
  {
    statement: "Families were separated, deported, and killed.",
    category: "Impact/Outcome"
  },
  {
    statement: "The state used police and military power to enforce persecution.",
    category: "Policy/Action"
  },
  {
    statement: "Survivors experienced lifelong trauma and displacement.",
    category: "Impact/Outcome"
  }
];

const allInputsSelector = "input, textarea, select";

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeDraggableList(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  items.forEach((itemText, index) => {
    const li = document.createElement("li");
    li.className = "draggable-item";
    li.draggable = true;
    li.tabIndex = 0;
    li.dataset.index = String(index);
    li.textContent = itemText;

    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", li.dataset.index);
    });

    li.addEventListener("keydown", (e) => {
      // Keyboard reorder: Alt+ArrowUp/Down to move list items.
      if (!e.altKey) return;
      const current = Number(li.dataset.index);
      if (e.key === "ArrowUp" && current > 0) {
        const sibling = container.children[current - 1];
        container.insertBefore(li, sibling);
        updateListIndexes(container);
      }
      if (e.key === "ArrowDown" && current < container.children.length - 1) {
        const after = container.children[current + 2] || null;
        container.insertBefore(li, after);
        updateListIndexes(container);
      }
    });

    container.appendChild(li);
  });

  container.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  container.addEventListener("drop", (e) => {
    e.preventDefault();
    const fromIndex = Number(e.dataTransfer.getData("text/plain"));
    const itemsNow = Array.from(container.children);
    const dragged = itemsNow[fromIndex];
    const target = e.target.closest("li");
    if (!dragged || !target || dragged === target) return;
    const targetIndex = itemsNow.indexOf(target);
    if (fromIndex < targetIndex) {
      container.insertBefore(dragged, target.nextSibling);
    } else {
      container.insertBefore(dragged, target);
    }
    updateListIndexes(container);
    saveState();
  });
}

function updateListIndexes(container) {
  Array.from(container.children).forEach((li, idx) => {
    li.dataset.index = String(idx);
  });
}

function listValues(containerId) {
  return Array.from(document.getElementById(containerId).children).map((li) => li.textContent.trim());
}

function initScratchCards() {
  const scratchGrid = document.getElementById("scratchGrid");
  scratchGrid.innerHTML = "";
  scratchFacts.forEach((fact, idx) => {
    const card = document.createElement("article");
    card.className = "scratch-card";
    card.dataset.id = `fact-${idx}`;

    const text = document.createElement("p");
    text.textContent = fact;

    const overlay = document.createElement("button");
    overlay.type = "button";
    overlay.className = "scratch-overlay";
    overlay.textContent = "Scratch to reveal";
    overlay.setAttribute("aria-label", "Reveal hidden fact");

    overlay.addEventListener("click", () => {
      card.classList.add("revealed");
      saveState();
    });

    card.appendChild(text);
    card.appendChild(overlay);
    scratchGrid.appendChild(card);
  });
}

function initMatching() {
  const container = document.getElementById("matchingContainer");
  const options = shuffle(matchData.map((d) => d.definition));
  container.innerHTML = "";

  matchData.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "match-row";

    const term = document.createElement("div");
    term.textContent = item.term;

    const select = document.createElement("select");
    select.id = `match-${idx}`;
    select.innerHTML = `<option value="">Choose a definition</option>${options
      .map((opt) => `<option value="${opt}">${opt}</option>`)
      .join("")}`;
    select.addEventListener("change", saveState);

    row.appendChild(term);
    row.appendChild(select);
    container.appendChild(row);
  });
}

function initCauseImpact() {
  const container = document.getElementById("causeImpactContainer");
  container.innerHTML = "";

  causeImpactData.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "sort-row";

    const statement = document.createElement("div");
    statement.textContent = item.statement;

    const select = document.createElement("select");
    select.id = `sort-${idx}`;
    select.innerHTML = `
      <option value="">Choose one</option>
      <option>Cause</option>
      <option>Policy/Action</option>
      <option>Impact/Outcome</option>
    `;
    select.addEventListener("change", saveState);

    row.appendChild(statement);
    row.appendChild(select);
    container.appendChild(row);
  });
}

function checkTimeline() {
  const feedback = document.getElementById("timelineFeedback");
  if (!document.getElementById("researchCheck").checked) {
    feedback.textContent = "Please review at least one research link first.";
    feedback.className = "feedback-warn";
    return;
  }
  const current = listValues("timelineList");
  const isCorrect = JSON.stringify(current) === JSON.stringify(timelineEventsCorrect);
  feedback.textContent = isCorrect ? "Great work. Timeline is correct." : "Not yet. Use the hint and try again.";
  feedback.className = isCorrect ? "feedback-ok" : "feedback-warn";
}

function checkEnding() {
  const feedback = document.getElementById("endingFeedback");
  const current = listValues("endingList");
  const isCorrect = JSON.stringify(current) === JSON.stringify(endingEventsCorrect);
  feedback.textContent = isCorrect ? "Sequence is correct." : "Not yet. Re-check the order from 1944 to 1946.";
  feedback.className = isCorrect ? "feedback-ok" : "feedback-warn";
}

function checkMatching() {
  const feedback = document.getElementById("matchFeedback");
  let correct = 0;
  matchData.forEach((item, idx) => {
    const selected = document.getElementById(`match-${idx}`).value;
    if (selected === item.definition) correct += 1;
  });
  feedback.textContent = `You matched ${correct} of ${matchData.length} correctly.`;
  feedback.className = correct === matchData.length ? "feedback-ok" : "feedback-warn";
}

function checkCauseImpact() {
  const feedback = document.getElementById("causeImpactFeedback");
  let correct = 0;
  causeImpactData.forEach((item, idx) => {
    if (document.getElementById(`sort-${idx}`).value === item.category) {
      correct += 1;
    }
  });
  feedback.textContent = `You sorted ${correct} of ${causeImpactData.length} correctly.`;
  feedback.className = correct === causeImpactData.length ? "feedback-ok" : "feedback-warn";
}

function setHintsVisible(visible) {
  document.querySelectorAll(".hint").forEach((hint) => {
    hint.classList.toggle("visible", visible);
  });
}

function readDirectionsAloud() {
  if (!("speechSynthesis" in window)) return;
  const text = [
    "Holocaust learning experience directions.",
    "Complete all five activities in order.",
    "Use the hints and support mode if needed.",
    "Your work autosaves locally.",
    "Use print save as PDF when finished."
  ].join(" ");
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function toggleClassFromCheckbox(checkboxId, className) {
  const checkbox = document.getElementById(checkboxId);
  document.body.classList.toggle(className, checkbox.checked);
}

function saveState() {
  const state = {
    values: {},
    hintsVisible: Array.from(document.querySelectorAll(".hint.visible")).length > 0,
    timelineOrder: listValues("timelineList"),
    endingOrder: listValues("endingList"),
    revealedScratchIds: Array.from(document.querySelectorAll(".scratch-card.revealed")).map((card) => card.dataset.id)
  };

  document.querySelectorAll(allInputsSelector).forEach((el) => {
    if (!el.id) return;
    state.values[el.id] = el.type === "checkbox" ? el.checked : el.value;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const saveStatus = document.getElementById("saveStatus");
  saveStatus.textContent = `Saved ${new Date().toLocaleTimeString()}`;
}

function restoreState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const state = JSON.parse(raw);

    if (state.timelineOrder && Array.isArray(state.timelineOrder) && state.timelineOrder.length === timelineEventsCorrect.length) {
      makeDraggableList("timelineList", state.timelineOrder);
    }

    if (state.endingOrder && Array.isArray(state.endingOrder) && state.endingOrder.length === endingEventsCorrect.length) {
      makeDraggableList("endingList", state.endingOrder);
    }

    if (state.values) {
      Object.entries(state.values).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.type === "checkbox") {
          el.checked = Boolean(value);
        } else {
          el.value = value;
        }
      });
    }

    if (Array.isArray(state.revealedScratchIds)) {
      state.revealedScratchIds.forEach((id) => {
        const card = document.querySelector(`.scratch-card[data-id="${id}"]`);
        if (card) card.classList.add("revealed");
      });
    }

    setHintsVisible(Boolean(state.hintsVisible));
    toggleClassFromCheckbox("highContrastToggle", "high-contrast");
    toggleClassFromCheckbox("largeTextToggle", "large-text");
    toggleClassFromCheckbox("dyslexiaToggle", "dyslexia-font");
    handleSupportMode();
  } catch (_error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function handleSupportMode() {
  const enabled = document.getElementById("supportModeToggle").checked;
  document.getElementById("sentenceStarter").hidden = !enabled;
  if (enabled) setHintsVisible(true);
}

function initPrintDefaults() {
  const dateInput = document.getElementById("studentDate");
  if (!dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
}

function init() {
  makeDraggableList("timelineList", shuffle(timelineEventsCorrect));
  makeDraggableList("endingList", shuffle(endingEventsCorrect));
  initScratchCards();
  initMatching();
  initCauseImpact();
  initPrintDefaults();

  document.getElementById("checkTimelineBtn").addEventListener("click", () => {
    checkTimeline();
    saveState();
  });
  document.getElementById("checkEndingBtn").addEventListener("click", () => {
    checkEnding();
    saveState();
  });
  document.getElementById("checkMatchBtn").addEventListener("click", () => {
    checkMatching();
    saveState();
  });
  document.getElementById("checkCauseImpactBtn").addEventListener("click", () => {
    checkCauseImpact();
    saveState();
  });

  document.getElementById("showAllHintsBtn").addEventListener("click", () => {
    setHintsVisible(true);
    saveState();
  });

  document.getElementById("resetHintsBtn").addEventListener("click", () => {
    setHintsVisible(false);
    if (document.getElementById("supportModeToggle").checked) setHintsVisible(true);
    saveState();
  });

  document.getElementById("readPageBtn").addEventListener("click", readDirectionsAloud);
  document.getElementById("printBtn").addEventListener("click", () => {
    saveState();
    window.print();
  });

  ["highContrastToggle", "largeTextToggle", "dyslexiaToggle"].forEach((id) => {
    document.getElementById(id).addEventListener("change", () => {
      const map = {
        highContrastToggle: "high-contrast",
        largeTextToggle: "large-text",
        dyslexiaToggle: "dyslexia-font"
      };
      toggleClassFromCheckbox(id, map[id]);
      saveState();
    });
  });

  document.getElementById("supportModeToggle").addEventListener("change", () => {
    handleSupportMode();
    saveState();
  });

  document.querySelectorAll(allInputsSelector).forEach((el) => {
    el.addEventListener("input", saveState);
    el.addEventListener("change", saveState);
  });

  restoreState();
  setInterval(saveState, 15000);
}

document.addEventListener("DOMContentLoaded", init);
