const STORAGE_KEYS = { tasks: "campusmate_tasks_v1", notes: "campusmate_notes_v1", focus: "campusmate_focus_v1" };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let tasks = loadData(STORAGE_KEYS.tasks, [
  { id: 1, title: "Revise DBMS normalization", category: "Study", priority: "High", due: "", completed: false },
  { id: 2, title: "Practice 2 array problems", category: "Study", priority: "Medium", due: "", completed: false },
  { id: 3, title: "Update portfolio README", category: "Project", priority: "Low", due: "", completed: true }
]);
let notes = loadData(STORAGE_KEYS.notes, []);
let focusMinutes = Number(localStorage.getItem(STORAGE_KEYS.focus)) || 0;
let currentFilter = "all";
let toastTimeout;
let timerDuration = 25 * 60;
let timerRemaining = timerDuration;
let timerInterval = null;
let timerRunning = false;
const circumference = 2 * Math.PI * 106;

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}
function saveData() {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  localStorage.setItem(STORAGE_KEYS.focus, String(focusMinutes));
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2300);
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}
function taskMarkup(task) {
  return `<div class="task-row">
    <input class="task-check" type="checkbox" data-task-id="${task.id}" ${task.completed ? "checked" : ""} aria-label="Mark ${escapeHTML(task.title)} complete">
    <div class="task-info">
      <div class="task-title ${task.completed ? "completed" : ""}">${escapeHTML(task.title)}</div>
      <div class="task-meta"><span class="tag">${escapeHTML(task.category)}</span><span class="priority ${task.priority}">${escapeHTML(task.priority)} priority</span>${task.due ? `<span>· ${escapeHTML(task.due)}</span>` : ""}</div>
    </div>
    <button class="delete-task" data-delete-id="${task.id}" aria-label="Delete task">×</button>
  </div>`;
}
function renderTasks() {
  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  $("#totalStat").textContent = tasks.length;
  $("#completedStat").textContent = completed;
  $("#pendingStat").textContent = pending;
  $("#navTaskCount").textContent = pending;
  $("#progressPercent").textContent = `${percent}%`;
  $("#progressRing").style.background = `conic-gradient(var(--purple) ${percent * 3.6}deg, #efeff7 0deg)`;
  $("#progressCaption").textContent = tasks.length ? `${completed} of ${tasks.length} tasks completed.` : "Add a task to start your progress.";
  const overview = tasks.filter(task => !task.completed).slice(0, 4);
  $("#overviewTasks").innerHTML = overview.length ? overview.map(taskMarkup).join("") : `<div class="empty-state"><span>🎉</span>All caught up! Add a new task when you're ready.</div>`;
  const search = ($("#taskSearch")?.value || "").toLowerCase();
  const filtered = tasks.filter(task => {
    const matchesFilter = currentFilter === "all" || (currentFilter === "active" && !task.completed) || (currentFilter === "completed" && task.completed);
    return matchesFilter && task.title.toLowerCase().includes(search);
  });
  $("#allTasksList").innerHTML = filtered.length ? filtered.map(taskMarkup).join("") : `<div class="empty-state"><span>📝</span>No tasks found. Add one to get started.</div>`;
}
function renderNotes() {
  $("#notesGrid").innerHTML = notes.length ? notes.map(note => `
    <article class="note-card"><button data-note-delete="${note.id}" aria-label="Delete note">×</button>
    <h3>${escapeHTML(note.title)}</h3><p>${escapeHTML(note.body)}</p></article>`).join("") :
    `<div class="empty-state" style="grid-column:1/-1"><span>💡</span>Your saved notes will appear here.</div>`;
}
function updateFocusUI() {
  const minutes = Math.floor(timerRemaining / 60);
  const seconds = timerRemaining % 60;
  $("#timerDisplay").textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progress = timerDuration ? (timerDuration - timerRemaining) / timerDuration : 0;
  $("#timerProgress").style.strokeDasharray = circumference;
  $("#timerProgress").style.strokeDashoffset = circumference * (1 - progress);
  $("#focusMinutes").textContent = focusMinutes;
  $("#focusStat").textContent = focusMinutes;
  $("#timerStart").textContent = timerRunning ? "Pause timer" : (timerRemaining === timerDuration ? "Start focus" : "Resume timer");
}
function renderAll() {
  renderTasks();
  renderNotes();
  updateFocusUI();
}
function openTaskDialog() {
  $("#taskDialog").showModal();
  $("#taskTitle").focus();
}
function navigate(view) {
  const views = ["overview", "tasks", "notes", "focus"];
  if (!views.includes(view)) return;
  views.forEach(name => $(`#${name}View`).classList.toggle("hidden", name !== view));
  $$(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.view === view));
  $("#pageName").textContent = view.charAt(0).toUpperCase() + view.slice(1);
  $("#sidebar").classList.remove("open");
  history.replaceState(null, "", `#${view}`);
}

$("#todayLabel").textContent = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date());
$("#quickAddBtn").addEventListener("click", openTaskDialog);
$("#addTaskBtn").addEventListener("click", openTaskDialog);
$("#closeDialog").addEventListener("click", () => $("#taskDialog").close());
$("#taskForm").addEventListener("submit", event => {
  event.preventDefault();
  const title = $("#taskTitle").value.trim();
  if (!title) return;
  tasks.unshift({
    id: Date.now(), title, category: $("#taskCategory").value,
    priority: $("#taskPriority").value, due: $("#taskDue").value, completed: false
  });
  saveData();
  renderTasks();
  $("#taskForm").reset();
  $("#taskDialog").close();
  showToast("Task added to your list!");
});
document.addEventListener("click", event => {
  const check = event.target.closest("[data-task-id]");
  const remove = event.target.closest("[data-delete-id]");
  const noteRemove = event.target.closest("[data-note-delete]");
  const nav = event.target.closest("[data-view]");
  const go = event.target.closest("[data-go]");
  if (check) {
    const task = tasks.find(item => item.id === Number(check.dataset.taskId));
    if (task) { task.completed = check.checked; saveData(); renderTasks(); showToast(task.completed ? "Nice work! Task completed." : "Task moved back to active."); }
  }
  if (remove) {
    tasks = tasks.filter(item => item.id !== Number(remove.dataset.deleteId));
    saveData(); renderTasks(); showToast("Task deleted.");
  }
  if (noteRemove) {
    notes = notes.filter(note => note.id !== Number(noteRemove.dataset.noteDelete));
    saveData(); renderNotes(); showToast("Note deleted.");
  }
  if (nav) navigate(nav.dataset.view);
  if (go) navigate(go.dataset.go);
});
$("#filterTabs").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  currentFilter = button.dataset.filter;
  $$(".filter-tab").forEach(tab => tab.classList.toggle("active", tab === button));
  renderTasks();
});
$("#taskSearch").addEventListener("input", renderTasks);
$("#noteBody").addEventListener("input", () => $("#noteCount").textContent = `${$("#noteBody").value.length} / 500`);
$("#saveNoteBtn").addEventListener("click", () => {
  const title = $("#noteTitle").value.trim();
  const body = $("#noteBody").value.trim();
  if (!title || !body) { showToast("Please enter both a title and a note."); return; }
  notes.unshift({ id: Date.now(), title, body });
  $("#noteTitle").value = ""; $("#noteBody").value = ""; $("#noteCount").textContent = "0 / 500";
  saveData(); renderNotes(); showToast("Note saved successfully!");
});
$("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
}
function startTimer() {
  if (timerRunning) {
    stopTimer();
    $("#timerStatus").textContent = "PAUSED";
    updateFocusUI();
    return;
  }
  if (timerRemaining <= 0) timerRemaining = timerDuration;
  timerRunning = true;
  $("#timerStatus").textContent = "YOU'RE IN THE ZONE";
  updateFocusUI();
  timerInterval = setInterval(() => {
    timerRemaining--;
    if (timerRemaining <= 0) {
      stopTimer();
      const selectedMinutes = timerDuration / 60;
      if (selectedMinutes === 25) {
        focusMinutes += 25;
        localStorage.setItem(STORAGE_KEYS.focus, String(focusMinutes));
        showToast("Focus session complete! Take a break.");
      } else {
        showToast("Break complete. Ready for another session?");
      }
      $("#timerStatus").textContent = "SESSION COMPLETE";
      $("#focusHint").textContent = "Great job. Take a breath before your next session.";
    }
    updateFocusUI();
  }, 1000);
}
$("#timerStart").addEventListener("click", startTimer);
$("#timerReset").addEventListener("click", () => {
  stopTimer(); timerRemaining = timerDuration;
  $("#timerStatus").textContent = "READY TO FOCUS";
  $("#focusHint").textContent = "Stay away from distractions. You've got this!";
  updateFocusUI();
});
$$(".mode-btn").forEach(button => button.addEventListener("click", () => {
  stopTimer();
  $$(".mode-btn").forEach(item => item.classList.toggle("active", item === button));
  timerDuration = Number(button.dataset.minutes) * 60;
  timerRemaining = timerDuration;
  $("#timerStatus").textContent = "READY TO FOCUS";
  $("#focusHint").textContent = button.dataset.minutes === "25" ? "Stay away from distractions. You've got this!" : "Rest your mind. You'll be back stronger.";
  updateFocusUI();
}));
const initialView = location.hash.replace("#", "");
navigate(["overview", "tasks", "notes", "focus"].includes(initialView) ? initialView : "overview");
renderAll();
