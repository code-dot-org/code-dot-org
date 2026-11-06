console.log("📦 script loaded");

const titleInput = document.getElementById("title");
const list = document.getElementById("list");
const emptyState = document.getElementById("emptyState");

const saveBtn = document.getElementById("saveBtn");
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const helpBtn = document.getElementById("helpBtn");
const themeToggle = document.getElementById("themeToggle");
const hint = document.getElementById("hint");

const updateEmptyState = () => {
  if (!emptyState) return;
  emptyState.style.display = list.children.length === 0 ? "block" : "none";
};

const addItem = (text) => {
  const li = document.createElement("li");
  li.textContent = text || "Untitled";
  li.addEventListener("click", () => li.classList.toggle("done"));
  list.appendChild(li);
  updateEmptyState();
};

// SAVE BUTTON: still runs away
saveBtn.addEventListener("mouseenter", () => {
  const dx = Math.random() < 0.5 ? -70 : 70;
  const dy = Math.random() < 0.5 ? -12 : 12;
  saveBtn.style.left = (parseInt(saveBtn.style.left || 0, 10) + dx) + "px";
  saveBtn.style.top = (parseInt(saveBtn.style.top || 0, 10) + dy) + "px";
});

saveBtn.addEventListener("click", () => {
  alert("Saved! (But nothing was actually added.)");
});

// ADD BUTTON: still requires double click
let armed = false;
let armTimer = null;

addBtn.addEventListener("click", () => {
  if (!armed) {
    armed = true;
    hint.textContent = "Click Add again quickly to confirm.";
    armTimer = setTimeout(() => {
      armed = false;
      hint.textContent = "Tip: Use Add to add a reminder. Or maybe Save?";
    }, 1000);
    return;
  }

  clearTimeout(armTimer);
  armed = false;
  addItem(titleInput.value.trim());
  titleInput.value = "";
  hint.textContent = "Reminder added. Or at least, this time it was.";
});

// Inline confirm
function inlineConfirm(message, onYes, onNo) {
  hint.innerHTML = `
    ${message}
    <button id="confirmYes" type="button">Yes</button>
    <button id="confirmNo" type="button">No</button>
  `;
  const yes = document.getElementById("confirmYes");
  const no = document.getElementById("confirmNo");
  yes.onclick = () => {
    onYes();
    hint.textContent = "";
  };
  no.onclick = () => {
    if (onNo) onNo();
    hint.textContent = "";
  };
}

// CLEAR ALL: still removes one random item
clearBtn.addEventListener("click", () => {
  const proceed = () => {
    const items = Array.from(list.querySelectorAll("li"));
    if (items.length === 0) {
      hint.textContent = "No reminders to clear.";
      return;
    }

    const idx = Math.floor(Math.random() * items.length);
    const removedText = items[idx].textContent;
    items[idx].remove();
    updateEmptyState();

    const remaining = Array.from(list.querySelectorAll("li")).map((li) => li.textContent);
    hint.textContent = remaining.length
      ? `Removed: "${removedText}". Remaining: ${remaining.join(" • ")}`
      : `Removed: "${removedText}". No reminders left.`;
  };

  try {
    if (typeof window.confirm === "function") {
      const ok = window.confirm("Clear all reminders?");
      if (ok) proceed();
    } else {
      inlineConfirm("Clear all reminders?", proceed);
    }
  } catch {
    inlineConfirm("Clear all reminders?", proceed);
  }
});

// SHUFFLE: still randomizes list and unexpectedly changes page color
shuffleBtn.addEventListener("click", () => {
  const items = Array.from(list.children);

  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    list.insertBefore(items[j], items[i]);
  }

  document.body.style.backgroundColor = `hsl(${Math.floor(Math.random() * 360)}, 45%, 92%)`;
});

// HELP: still vague
const confusingTips = [
  "Tip: Try clicking everything to see what works!",
  "Some buttons behave differently than expected.",
  "Try Save… or maybe Add?",
];

helpBtn.addEventListener("mouseenter", () => {
  const tip = confusingTips[Math.floor(Math.random() * confusingTips.length)];
  hint.textContent = tip;
});

// THEME: still confusing label / unclear state
themeToggle.addEventListener("click", () => {
  const isMuted = document.body.style.filter !== "grayscale(1)";
  document.body.style.filter = isMuted ? "grayscale(1)" : "grayscale(0)";
  themeToggle.innerHTML = "🌓 <span>Theme</span>";
});

updateEmptyState();