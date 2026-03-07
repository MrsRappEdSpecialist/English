const safeAnswers = new Set([
  "Turn on Do Not Disturb before driving",
  "Ask a passenger to read messages",
  "Pull over safely before using phone",
  "Keep both hands on the wheel"
]);

const riskyAnswers = new Set([
  "Reply to a text at a red light",
  "Check social media while steering with one hand"
]);

let draggedItem = null;

function setupDragDrop() {
  const items = document.querySelectorAll(".drag-item");
  const zones = document.querySelectorAll(".drop-zone, #cardBank");

  items.forEach((item) => {
    item.addEventListener("dragstart", () => {
      draggedItem = item;
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      draggedItem = null;
    });
  });

  zones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    zone.addEventListener("drop", () => {
      if (!draggedItem) return;
      zone.appendChild(draggedItem);
    });
  });

  document.getElementById("checkSortBtn").addEventListener("click", () => {
    const safeZone = document.querySelector('.drop-zone[data-group="safe"]');
    const riskyZone = document.querySelector('.drop-zone[data-group="risky"]');
    const safeItems = Array.from(safeZone.querySelectorAll(".drag-item")).map((x) => x.textContent.trim());
    const riskyItems = Array.from(riskyZone.querySelectorAll(".drag-item")).map((x) => x.textContent.trim());

    let correct = 0;
    safeItems.forEach((item) => {
      if (safeAnswers.has(item)) correct += 1;
    });
    riskyItems.forEach((item) => {
      if (riskyAnswers.has(item)) correct += 1;
    });

    const total = safeAnswers.size + riskyAnswers.size;
    const feedback = document.getElementById("sortFeedback");
    if (correct === total) {
      feedback.textContent = "Perfect sort. You can spot safe vs. risky choices.";
      feedback.style.color = "#2ca64e";
    } else {
      feedback.textContent = `You got ${correct}/${total}. Move cards and try again.`;
      feedback.style.color = "#ef3d2f";
    }
  });
}

function setupScratchCards() {
  const canvases = document.querySelectorAll(".scratch-layer");
  canvases.forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#b0b8c5";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 22px Nunito";
    ctx.textAlign = "center";
    ctx.fillText("Scratch Here", rect.width / 2, rect.height / 2 + 8);

    let drawing = false;

    const scratch = (x, y) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    };

    const position = (event) => {
      const box = canvas.getBoundingClientRect();
      if (event.touches && event.touches[0]) {
        return {
          x: event.touches[0].clientX - box.left,
          y: event.touches[0].clientY - box.top
        };
      }
      return {
        x: event.clientX - box.left,
        y: event.clientY - box.top
      };
    };

    const start = (e) => {
      drawing = true;
      const p = position(e);
      scratch(p.x, p.y);
    };

    const move = (e) => {
      if (!drawing) return;
      e.preventDefault();
      const p = position(e);
      scratch(p.x, p.y);
    };

    const end = () => {
      drawing = false;
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);

    canvas.addEventListener("touchstart", start, { passive: true });
    canvas.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
  });
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function setupMatching() {
  const pairs = [
    { id: "claim", term: "Claim", definition: "A clear statement of your position" },
    { id: "evidence", term: "Evidence", definition: "Facts or details that support your claim" },
    { id: "reasoning", term: "Reasoning", definition: "Explanation of how evidence proves the claim" },
    { id: "distraction", term: "Distraction", definition: "Anything that takes eyes, hands, or mind off driving" }
  ];

  const termList = document.getElementById("termList");
  const definitionList = document.getElementById("definitionList");
  const feedback = document.getElementById("matchingFeedback");

  const shuffledTerms = shuffle(pairs);
  const shuffledDefs = shuffle(pairs);

  shuffledTerms.forEach((p) => {
    const btn = document.createElement("button");
    btn.className = "match-item";
    btn.type = "button";
    btn.dataset.id = p.id;
    btn.dataset.side = "term";
    btn.textContent = p.term;
    termList.appendChild(btn);
  });

  shuffledDefs.forEach((p) => {
    const btn = document.createElement("button");
    btn.className = "match-item";
    btn.type = "button";
    btn.dataset.id = p.id;
    btn.dataset.side = "def";
    btn.textContent = p.definition;
    definitionList.appendChild(btn);
  });

  let selectedTerm = null;
  let selectedDef = null;
  let matches = 0;

  const resetSelection = () => {
    if (selectedTerm && !selectedTerm.classList.contains("matched")) {
      selectedTerm.classList.remove("selected");
    }
    if (selectedDef && !selectedDef.classList.contains("matched")) {
      selectedDef.classList.remove("selected");
    }
    selectedTerm = null;
    selectedDef = null;
  };

  const tryMatch = () => {
    if (!selectedTerm || !selectedDef) return;

    if (selectedTerm.dataset.id === selectedDef.dataset.id) {
      selectedTerm.classList.remove("selected");
      selectedDef.classList.remove("selected");
      selectedTerm.classList.add("matched");
      selectedDef.classList.add("matched");
      matches += 1;
      feedback.textContent = "Match correct.";
      feedback.style.color = "#2ca64e";
    } else {
      feedback.textContent = "Not a match. Try again.";
      feedback.style.color = "#ef3d2f";
    }

    resetSelection();

    if (matches === pairs.length) {
      feedback.textContent = "Great work. You matched every term.";
      feedback.style.color = "#2ca64e";
    }
  };

  document.querySelectorAll(".match-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("matched")) return;

      if (btn.dataset.side === "term") {
        if (selectedTerm) selectedTerm.classList.remove("selected");
        selectedTerm = btn;
      } else {
        if (selectedDef) selectedDef.classList.remove("selected");
        selectedDef = btn;
      }
      btn.classList.add("selected");
      tryMatch();
    });
  });
}

function setupQuiz() {
  const buttons = document.querySelectorAll(".quiz-btn");
  const feedback = document.getElementById("quizFeedback");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const correct = btn.dataset.correct === "true";
      buttons.forEach((b) => {
        b.disabled = true;
        if (b.dataset.correct === "true") {
          b.classList.add("correct");
        }
      });

      if (correct) {
        feedback.textContent = "Correct. One text can take your focus for a football field of distance.";
        feedback.style.color = "#2ca64e";
      } else {
        btn.classList.add("wrong");
        feedback.textContent = "Not quite. The best answer is one football field length.";
        feedback.style.color = "#ef3d2f";
      }
    });
  });
}

function setupCerTools() {
  const textarea = document.getElementById("cerText");
  const saveDraftBtn = document.getElementById("saveDraftBtn");
  const savePdfBtn = document.getElementById("savePdfBtn");
  const feedback = document.getElementById("cerFeedback");
  const storageKey = "dmv_cer_draft";

  const draft = localStorage.getItem(storageKey);
  if (draft) {
    textarea.value = draft;
  }

  saveDraftBtn.addEventListener("click", () => {
    localStorage.setItem(storageKey, textarea.value.trim());
    feedback.textContent = "Draft saved on this device.";
    feedback.style.color = "#2ca64e";
  });

  savePdfBtn.addEventListener("click", () => {
    const content = textarea.value.trim();
    if (!content) {
      feedback.textContent = "Write your CER paragraph before saving to PDF.";
      feedback.style.color = "#ef3d2f";
      return;
    }

    const existing = document.getElementById("printArea");
    if (existing) existing.remove();

    const printArea = document.createElement("section");
    printArea.id = "printArea";
    printArea.innerHTML = `
      <h1>Teen DMV Permit Lesson - CER Paragraph</h1>
      <p><strong>Prompt:</strong> Why is it important for teens to never text and drive?</p>
      <hr />
      <p style="white-space: pre-wrap; line-height: 1.6;">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    `;

    document.body.appendChild(printArea);
    window.print();
    printArea.remove();

    feedback.textContent = "Print dialog opened. Choose \"Save as PDF\".";
    feedback.style.color = "#2ca64e";
  });
}

setupDragDrop();
setupScratchCards();
setupMatching();
setupQuiz();
setupCerTools();
