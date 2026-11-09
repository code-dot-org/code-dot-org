// -------- Theme toggle (safe; won’t block reminders logic) --------
(function () {
  var toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  function apply(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    toggle.setAttribute("aria-pressed", String(mode === "dark"));
    try { localStorage.setItem("remindme-theme", mode); }
    catch (err) { /* ignore */ }
  }

  var saved = "";
  try { saved = (localStorage.getItem("remindme-theme") || "").toLowerCase(); } catch {}
  var prefersDark = false;
  try { prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; } catch {}

  apply(saved || (prefersDark ? "dark" : "light"));
  toggle.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    apply(current === "dark" ? "light" : "dark");
  });
})();

// -------- Reminders (no form submit; button listeners only) --------
(function () {
  // Elements
  var titleInput = document.getElementById("title");
  var addBtn = document.getElementById("addBtn");
  var clearAll = document.getElementById("clearAll");
  var list = document.getElementById("list");
  var empty = document.getElementById("emptyState");
  var hint = document.getElementById("hint");

  // If we’re not on the reminders page, bail.
  if (!titleInput || !addBtn || !clearAll || !list || !empty) return;

  // Simple in-memory state
  var items = [];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" })[m];
    });
  }

  function updateEmpty() {
    empty.style.display = items.length ? "none" : "block";
  }

  function render() {
    list.innerHTML = "";
    for (var i = 0; i < items.length; i++) {
      var li = document.createElement("li");
      li.innerHTML =
        '<span class="text">' + escapeHtml(items[i]) + '</span>' +
        '<button class="item-btn" type="button" data-i="' + i + '" data-action="done">Done</button>' +
        '<button class="item-btn" type="button" data-i="' + i + '" data-action="delete">Delete</button>';
      list.appendChild(li);
    }
    updateEmpty();
  }

  function addItemFromInput() {
    var value = (titleInput.value || "").trim();
    if (!value) {
      hint && (hint.textContent = "Please enter a reminder title.");
      titleInput.focus();
      return;
    }
    items.push(value);
    titleInput.value = "";
    render();
    hint && (hint.textContent = "Added a new reminder.");
  }

  // Add button click (primary path)
  addBtn.addEventListener("click", addItemFromInput);

  // Also add on Enter key in the input
  titleInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); // don’t submit anything
      addItemFromInput();
    }
  });

  // Delete / Done via event delegation
  list.addEventListener("click", function (e) {
    var btn = e.target.closest("button.item-btn");
    if (!btn) return;

    var idx = parseInt(btn.getAttribute("data-i"), 10);
    if (isNaN(idx)) return;

    var action = btn.getAttribute("data-action");
    if (action === "delete") {
      items.splice(idx, 1);
      render();
      hint && (hint.textContent = "Reminder deleted.");
    } else if (action === "done") {
      var li = btn.closest("li");
      if (li) {
        li.classList.toggle("done");
        hint && (hint.textContent = li.classList.contains("done") ? "Marked as done." : "Marked as not done.");
      }
    }
  });

  // Clear All button
  clearAll.addEventListener("click", function () {
    items.length = 0;
    render();
    hint && (hint.textContent = "All reminders cleared.");
  });

  // Initial paint
  render();
})();