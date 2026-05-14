// ======================================================
// API CONFIG
// ======================================================
const API_BASE = "https://zohz.duckdns.org/superspetters";

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST ${path} failed`);
  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed`);
  return res.json();
}

// ======================================================
// DATA
// ======================================================
let students = [];
let skills = [];
let currentGroup = "";
let currentStudent = null;
let vacations = [];

// ======================================================
// DOM VARS
// ======================================================
let homePage, groupsContainer, studentsContainer, studentEdit, agendaPage;
let groupsList, studentsList, groupTitle;
let studentName, studentGroupBadge, studentSticker;
let editFirstname, editGroup;
let skillsList, studentSearch;
let headerTitle, toHome, backButton, addStudentButton;
let addStudentModal, newStudentName, newStudentGroup, saveStudentButton, cancelStudentButton;
let editNameButton, editGroupButton, editStickerButton;
let saveStudentEdit, deleteStudentBtn;

// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {
  cacheDOM();
  attachEvents();
  await loadAllData();
  showHome();
});

// ======================================================
// CACHE DOM
// ======================================================
function cacheDOM() {
  homePage = document.getElementById("home-page");
  groupsContainer = document.getElementById("groups-container");
  studentsContainer = document.getElementById("students-container");
  studentEdit = document.getElementById("student-edit");
  agendaPage = document.getElementById("agenda-page");

  groupsList = document.getElementById("groups-list");
  studentsList = document.getElementById("students-list");
  groupTitle = document.getElementById("group-title");

  studentName = document.getElementById("student-name");
  studentGroupBadge = document.getElementById("student-group-badge");
  studentSticker = document.getElementById("student-sticker");

  editFirstname = document.getElementById("edit-firstname");
  editGroup = document.getElementById("edit-group");

  skillsList = document.getElementById("skills-list");
  studentSearch = document.getElementById("student-search");

  headerTitle = document.getElementById("header-title");
  toHome = document.getElementById("to-home");
  backButton = document.getElementById("back-button");
  addStudentButton = document.getElementById("add-student-button");

  addStudentModal = document.getElementById("add-student-modal");
  newStudentName = document.getElementById("new-student-name");
  newStudentGroup = document.getElementById("new-student-group");
  saveStudentButton = document.getElementById("save-student-button");
  cancelStudentButton = document.getElementById("cancel-student-button");

  editNameButton = document.getElementById("edit-name-button");
  editGroupButton = document.getElementById("edit-group-button");
  editStickerButton = document.getElementById("edit-sticker-button");

  saveStudentEdit = document.getElementById("save-student-edit");
  deleteStudentBtn = document.getElementById("delete-student");

  homeSuperspetters = document.getElementById("home-superspetters");
  homeAgenda = document.getElementById("home-agenda");
}

// ======================================================
// EVENTS
// ======================================================
function attachEvents() {
  // Home-tegels
  homeSuperspetters.addEventListener("click", () => {
    showGroups();
  });

  homeAgenda.addEventListener("click", () => {
    showAgenda();
  });

  // Header-knoppen
  toHome.addEventListener("click", () => {
    showHome();
  });

  backButton.addEventListener("click", () => {
    if (!studentEdit.classList.contains("hidden")) {
      showStudents(currentGroup);
    } else if (!studentsContainer.classList.contains("hidden")) {
      showGroups();
    } else if (!agendaPage.classList.contains("hidden")) {
      showHome();
    } else {
      showHome();
    }
  });

  // Nieuwe student (header-knop opent modal)
  addStudentButton.addEventListener("click", () => {
    if (groupsContainer.classList.contains("hidden") &&
        studentsContainer.classList.contains("hidden")) {
      alert("Ga eerst naar een groep of studentenlijst.");
      return;
    }
    addStudentModal.classList.remove("hidden");
  });

  // Modal events
  cancelStudentButton.addEventListener("click", () => {
    addStudentModal.classList.add("hidden");
    newStudentName.value = "";
  });

  addStudentModal.addEventListener("click", (e) => {
    if (e.target === addStudentModal) {
      addStudentModal.classList.add("hidden");
      newStudentName.value = "";
    }
  });

  saveStudentButton.addEventListener("click", saveNewStudent);

  // Student edit
  editNameButton.addEventListener("click", () => {
    document.getElementById("student-form").classList.remove("hidden");
    editFirstname.focus();
  });

  editGroupButton.addEventListener("click", () => {
    document.getElementById("student-form").classList.remove("hidden");
    editGroup.focus();
  });

  editStickerButton.addEventListener("click", editSticker);

  saveStudentEdit.addEventListener("click", saveStudent);
  deleteStudentBtn.addEventListener("click", deleteStudent);

  // Zoeken
  studentSearch.addEventListener("input", filterStudents);

  // Agenda
  document.getElementById("add-vacation").addEventListener("click", addVacation);
}

// ======================================================
// VIEW HELPERS
// ======================================================
function hideAll() {
  homePage.classList.add("hidden");
  groupsContainer.classList.add("hidden");
  studentsContainer.classList.add("hidden");
  studentEdit.classList.add("hidden");
  agendaPage.classList.add("hidden");
}

function showHome() {
  hideAll();
  headerTitle.textContent = "SuperSpetters";
  homePage.classList.remove("hidden");
}

function showGroups() {
  hideAll();
  headerTitle.textContent = "SuperSpetters";
  groupsContainer.classList.remove("hidden");
  loadGroups();
}

function showAgenda() {
  hideAll();
  headerTitle.textContent = "Agenda";
  agendaPage.classList.remove("hidden");
  renderCalendar();
}

// ======================================================
// LOAD DATA
// ======================================================
async function loadAllData() {
  const [studentsData, skillsData] = await Promise.all([
    apiGet("/students"),
    apiGet("/skills")
  ]);

  students = studentsData.filter(s => !s.deleted);
  students.sort((a, b) => a.firstname.localeCompare(b.firstname));

  skills = skillsData;
}

// ======================================================
// GROUPS
// ======================================================
function loadGroups() {
  groupsList.innerHTML = "";

  const order = ["MiniSpetters", "Beginners", "Gevorderden", "Uitblinkers"];
  let groups = [...new Set(students.map(s => s.group))];
  groups.sort((a, b) => order.indexOf(a) - order.indexOf(b));

  groups.forEach(group => {
    const count = students.filter(s => s.group === group).length;

    const btn = document.createElement("button");
    btn.className = "group-button";
    btn.innerHTML = `
      <div class="group-button-title">${group}</div>
      <div class="group-meta"><span>${count} superspetters</span></div>
    `;
    btn.addEventListener("click", () => showStudents(group));
    groupsList.appendChild(btn);
  });
}

// ======================================================
// STUDENTS IN GROUP
// ======================================================
async function showStudents(group) {
  hideAll();
  studentsContainer.classList.remove("hidden");
  currentGroup = group;
  headerTitle.textContent = `Superspetters in ${group}`;
  groupTitle.textContent = `Superspetters in ${group}`;
  studentsList.innerHTML = "";

  const filtered = students
    .filter(s => s.group === group)
    .sort((a, b) => a.firstname.localeCompare(b.firstname));

  for (const student of filtered) {
    let progress = await apiGet(`/progress/${student.id}`);

    const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
    const maxScore = skills.length * 3;
    const avg = maxScore ? Math.round((totalScore / maxScore) * 100) : 0;

    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
      <div class="student-card-title">${student.firstname}</div>
      <div class="progress-bar-outer">
        <div class="progress-bar-inner" style="width:${avg}%;"></div>
      </div>
      <div class="progress-label">${avg}%</div>
    `;
    card.addEventListener("click", () => editStudent(student));
    studentsList.appendChild(card);
  }
}

// ======================================================
// FILTER STUDENTS
// ======================================================
function filterStudents() {
  const term = studentSearch.value.toLowerCase();
  document.querySelectorAll(".student-card").forEach(card => {
    const name = card.querySelector(".student-card-title").textContent.toLowerCase();
    card.style.display = name.includes(term) ? "block" : "none";
  });
}

// ======================================================
// EDIT STUDENT
// ======================================================
async function editStudent(student) {
  hideAll();
  studentEdit.classList.remove("hidden");
  currentStudent = student;

  headerTitle.textContent = student.firstname;

  studentName.textContent = student.firstname;
  studentGroupBadge.textContent = student.group;
  studentSticker.textContent = student.sticker ?? 0;

  editFirstname.value = student.firstname;
  editGroup.value = student.group;

  document.getElementById("student-form").classList.add("hidden");

  const progress = await apiGet(`/progress/${student.id}`);
  renderSkills(progress);
}

// ======================================================
// RENDER SKILLS
// ======================================================
function renderSkills(studentProgress) {
  skillsList.innerHTML = "";

  const byCategory = {};
  skills.forEach(skill => {
    if (!byCategory[skill.category]) byCategory[skill.category] = [];
    byCategory[skill.category].push(skill);
  });

  Object.entries(byCategory).forEach(([category, skillList]) => {
    const details = document.createElement("details");
    details.open = true;
    details.innerHTML = `<summary>${category}</summary>`;

    skillList.forEach(skill => {
      const prog = studentProgress.find(p => p.skillId === skill.id) || { score: 0, note: "" };

      const div = document.createElement("div");
      div.className = "skill-item";

      div.innerHTML = `
        <div class="skill-item-title">${skill.title}</div>
        <div class="skill-item-body"></div>
      `;

      const body = div.querySelector(".skill-item-body");

      const scoreIcons = document.createElement("div");
      scoreIcons.className = "score-icons";

      const icons = [
        { value: 0, icon: "⚪" },
        { value: 1, icon: "🟡" },
        { value: 2, icon: "🔴" },
        { value: 3, icon: "✅" }
      ];

      icons.forEach(i => {
        const el = document.createElement("div");
        el.className = "score-icon";
        el.textContent = i.icon;

        if (prog.score === i.value) el.classList.add("selected");

        el.addEventListener("click", async () => {
          await saveProgress(currentStudent.id, skill.id, i.value, prog.note || "");
          scoreIcons.querySelectorAll(".score-icon").forEach(ic => ic.classList.remove("selected"));
          el.classList.add("selected");
          prog.score = i.value;
        });

        scoreIcons.appendChild(el);
      });

      body.appendChild(scoreIcons);

      const noteSection = document.createElement("div");
      noteSection.className = "note-section";

      noteSection.innerHTML = `
        ${prog.note ? `<div class="skill-note">${prog.note}</div>` : ""}
        <button class="note-button">${prog.note ? "Notitie bewerken" : "Notitie toevoegen"}</button>
      `;

      const noteButton = noteSection.querySelector(".note-button");

      noteButton.addEventListener("click", () => {
        noteSection.innerHTML = `
          <textarea class="note-edit">${prog.note || ""}</textarea>
          <div class="note-edit-buttons">
            <button class="btn btn-primary save-note">Opslaan</button>
            <button class="btn btn-secondary cancel-note">Annuleren</button>
          </div>
        `;

        const saveBtn = noteSection.querySelector(".save-note");
        const cancelBtn = noteSection.querySelector(".cancel-note");
        const textarea = noteSection.querySelector(".note-edit");

        saveBtn.addEventListener("click", async () => {
          await saveProgress(currentStudent.id, skill.id, prog.score, textarea.value);
          const refreshed = await apiGet(`/progress/${currentStudent.id}`);
          renderSkills(refreshed);
        });

        cancelBtn.addEventListener("click", async () => {
          const refreshed = await apiGet(`/progress/${currentStudent.id}`);
          renderSkills(refreshed);
        });
      });

      body.appendChild(noteSection);
      details.appendChild(div);
    });

    skillsList.appendChild(details);
  });
}

// ======================================================
// SAVE PROGRESS
// ======================================================
async function saveProgress(studentId, skillId, score, note) {
  await apiPatch(`/progress/${studentId}/${skillId}`, { score, note });
}

// ======================================================
// NEW STUDENT
// ======================================================
async function saveNewStudent() {
  const firstname = newStudentName.value.trim();
  const group = currentGroup || newStudentGroup.value;

  if (!firstname) return alert("Vul een naam in.");

  const startDate = new Date().toISOString().split("T")[0];

  const newStudent = await apiPost("/students", {
    firstname,
    group,
    startDate,
    sticker: 0,
    note: ""
  });

  for (const skill of skills) {
    await apiPatch(`/progress/${newStudent.id}/${skill.id}`, {
      score: 0,
      note: ""
    });
  }

  addStudentModal.classList.add("hidden");
  newStudentName.value = "";

  await loadAllData();
  if (currentGroup) {
    showStudents(currentGroup);
  } else {
    showGroups();
  }
}

// ======================================================
// STICKER
// ======================================================
async function editSticker() {
  const newSticker = prompt("Nieuwe stickerwaarde:", currentStudent.sticker ?? 0);
  if (newSticker === null) return;

  const value = Number(newSticker);
  if (isNaN(value)) return alert("Voer een geldig getal in.");

  await apiPatch(`/students/${currentStudent.id}`, { sticker: value });
  currentStudent.sticker = value;
  studentSticker.textContent = value;
}

// ======================================================
// SAVE STUDENT
// ======================================================
async function saveStudent(e) {
  e.preventDefault();

  const firstname = editFirstname.value.trim();
  const group = editGroup.value;

  if (!firstname) return alert("Naam mag niet leeg zijn.");

  await apiPatch(`/students/${currentStudent.id}`, { firstname, group });

  document.getElementById("student-form").classList.add("hidden");

  await loadAllData();
  currentGroup = group;
  showStudents(group);
}

// ======================================================
// DELETE STUDENT
// ======================================================
async function deleteStudent(e) {
  e.preventDefault();

  if (!confirm("Weet je zeker dat je deze superspetter wilt verwijderen?")) return;

  await apiPatch(`/students/${currentStudent.id}`, { deleted: true });

  await loadAllData();
  showStudents(currentGroup);
}
// ======================================================
// AGENDA - Vakanties toevoegen, tonen en verwijderen
// ======================================================

async function loadVacations() {
  try {
    vacations = await apiGet("/vacations");
    renderCalendar();
    renderVacationList();
  } catch (err) {
    console.error("Fout bij ophalen vakanties:", err);
  }
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const daysInMonth = 31;
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.className = "calendar-day";
    day.textContent = i;

    const isVacation = vacations.some(v => {
      const start = new Date(v.startDate).getDate();
      const end = new Date(v.endDate).getDate();
      return i >= start && i <= end;
    });

    if (isVacation) {
      day.classList.add("vacation");
      const label = document.createElement("div");
      label.className = "vacation-label";
      const vacation = vacations.find(v => {
        const start = new Date(v.startDate).getDate();
        const end = new Date(v.endDate).getDate();
        return i >= start && i <= end;
      });
      label.textContent = vacation.title;
      day.appendChild(label);
    }

    calendar.appendChild(day);
  }
}

function renderVacationList() {
  const formContainer = document.querySelector(".vacation-form");
  let list = document.getElementById("vacation-list");

  if (!list) {
    list = document.createElement("div");
    list.id = "vacation-list";
    formContainer.insertAdjacentElement("beforebegin", list);
  }

  list.innerHTML = "<h3>Huidige vakanties</h3>";

  if (vacations.length === 0) {
    list.innerHTML += "<p>Er zijn nog geen vakanties toegevoegd.</p>";
    return;
  }

  vacations.forEach(v => {
    const item = document.createElement("div");
    item.className = "vacation-item";
    item.innerHTML = `
      <span class="vacation-title">${v.title}</span>
      <span class="vacation-dates">${v.startDate} → ${v.endDate}</span>
      <button class="btn btn-danger btn-small" data-id="${v.id}">🗑️ Verwijderen</button>
    `;
    item.querySelector("button").addEventListener("click", () => deleteVacation(v.id));
    list.appendChild(item);
  });
}

async function addVacation() {
  const title = document.getElementById("vacation-title").value.trim();
  const startDate = document.getElementById("vacation-start").value;
  const endDate = document.getElementById("vacation-end").value;

  if (!title || !startDate || !endDate) {
    alert("Vul alle velden in.");
    return;
  }

  try {
    await apiPost("/vacations", { title, startDate, endDate });
    await loadVacations();

    document.getElementById("vacation-title").value = "";
    document.getElementById("vacation-start").value = "";
    document.getElementById("vacation-end").value = "";
  } catch (err) {
    console.error("Fout bij toevoegen vakantie:", err);
  }
}

async function deleteVacation(id) {
  if (!confirm("Weet je zeker dat je deze vakantie wilt verwijderen?")) return;

  try {
    await apiPatch(`/vacations/${id}`, { deleted: true });
    await loadVacations();
  } catch (err) {
    console.error("Fout bij verwijderen vakantie:", err);
  }
}

// Agenda tonen
function showAgenda() {
  hideAll();
  headerTitle.textContent = "Agenda";
  agendaPage.classList.remove("hidden");
  loadVacations();
}
document.getElementById("fab").addEventListener("click", () => {
  addStudentModal.classList.remove("hidden");
});
