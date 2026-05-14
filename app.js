// ===============================
// API CONFIG
// ===============================
const API_BASE = "/api"; // Pas aan indien nodig

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

// ===============================
// DATA IN MEMORY (GEEN MOCK DATA)
// ===============================
let students = [];
let skills = [];
let progress = [];

let currentGroup = "";
let currentStudent = null;

// ===============================
// DOM ELEMENTS
// ===============================
const groupsContainer = document.getElementById("groups-container");
const studentsContainer = document.getElementById("students-container");
const studentEdit = document.getElementById("student-edit");
const groupsList = document.getElementById("groups-list");
const studentsList = document.getElementById("students-list");
const groupTitle = document.getElementById("group-title");
const studentName = document.getElementById("student-name");
const groupSelect = document.getElementById("group");
const groupValue = document.getElementById("group-value");
const groupEditButton = document.getElementById("group-edit-button");
const groupDisplay = document.getElementById("group-display");
const stickerInput = document.getElementById("sticker");
const skillsList = document.getElementById("skills-list");
const backToGroups = document.getElementById("back-to-groups");
const backToStudents = document.getElementById("back-to-students");
const studentSearch = document.getElementById("student-search");
const navGroups = document.getElementById("nav-groups");
const navStudents = document.getElementById("nav-students");

// ===============================
// LOAD INITIAL DATA
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  await loadAllData();
  loadGroups();
});

async function loadAllData() {
  students = await apiGet("/students");
  skills = await apiGet("/skills"); // Zorg dat je deze endpoint hebt
  progress = await apiGet("/progress/all"); // Of laad per student later
}

// ===============================
// GROUPS
// ===============================
function getGroups() {
  return [...new Set(students.map(s => s.group))];
}

function loadGroups() {
  currentGroup = "";
  groupsList.innerHTML = "";

  const groups = getGroups();

  groups.forEach(group => {
    const count = students.filter(s => s.group === group).length;

    const div = document.createElement("div");
    div.className = "group-button";
    div.innerHTML = `
      <div class="group-button-title">${group}</div>
      <div class="group-meta"><span>${count} studenten</span></div>
    `;
    div.addEventListener("click", () => showStudents(group));
    groupsList.appendChild(div);
  });

  groupsContainer.style.display = "block";
  studentsContainer.style.display = "none";
  studentEdit.style.display = "none";
}

// ===============================
// STUDENTS IN GROUP
// ===============================
async function showStudents(group) {
  currentGroup = group;
  groupTitle.textContent = `Studenten in ${group}`;

  const filtered = students.filter(s => s.group === group);

  studentsList.innerHTML = "";

  for (const student of filtered) {
    const studentProgress = await apiGet(`/progress/${student.id}`);

    const totalSkills = skills.length;
    const totalScore = studentProgress.reduce((sum, p) => sum + p.score, 0);
    const avg = Math.round((totalScore / (totalSkills * 3)) * 100);

    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
      <div class="student-card-title">${student.firstname} <span class="student-card-extra">Sticker ${student.sticker}</span></div>
      <div class="progress-bar-outer">
        <div class="progress-bar-inner" style="width:${avg}%;"></div>
      </div>
      <div class="progress-label">${avg}% voortgang</div>
    `;
    card.addEventListener("click", () => editStudent(student));
    studentsList.appendChild(card);
  }

  groupsContainer.style.display = "none";
  studentsContainer.style.display = "block";
  studentEdit.style.display = "none";
}

// ===============================
// EDIT STUDENT
// ===============================
async function editStudent(student) {
  currentStudent = student;
  studentName.textContent = `Bewerk ${student.firstname}`;

  groupValue.textContent = student.group;
  stickerInput.value = student.sticker;

  const studentProgress = await apiGet(`/progress/${student.id}`);

  renderSkills(studentProgress);

  studentsContainer.style.display = "none";
  studentEdit.style.display = "block";
}

function renderSkills(studentProgress) {
  skillsList.innerHTML = "";

  const byCategory = {};
  skills.forEach(skill => {
    if (!byCategory[skill.category]) byCategory[skill.category] = [];
    byCategory[skill.category].push(skill);
  });

  Object.entries(byCategory).forEach(([category, skillList]) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = category;
    details.appendChild(summary);

    skillList.forEach(skill => {
      const prog = studentProgress.find(p => p.skillId === skill.id) || { score: 0, note: "" };

      const div = document.createElement("div");
      div.className = "skill-item";
      div.innerHTML = `
        <label>${skill.title}</label>
        <input type="number" min="0" max="3" value="${prog.score}" class="score-input">
        <textarea class="note-input">${prog.note}</textarea>
      `;

      const scoreInput = div.querySelector(".score-input");
      const noteInput = div.querySelector(".note-input");

      scoreInput.addEventListener("change", () => {
        saveProgress(currentStudent.id, skill.id, Number(scoreInput.value), noteInput.value);
      });

      noteInput.addEventListener("blur", () => {
        saveProgress(currentStudent.id, skill.id, Number(scoreInput.value), noteInput.value);
      });

      details.appendChild(div);
    });

    skillsList.appendChild(details);
  });
}

// ===============================
// SAVE PROGRESS
// ===============================
async function saveProgress(studentId, skillId, score, note) {
  await apiPatch(`/progress/${studentId}/${skillId}`, { score, note });
}

// ===============================
// SAVE STUDENT
// ===============================
groupEditButton.addEventListener("click", () => {
  groupValue.style.display = "none";
  groupSelect.style.display = "inline-block";
});

groupSelect.addEventListener("change", async () => {
  await apiPatch(`/students/${currentStudent.id}`, { group: groupSelect.value });
  currentStudent.group = groupSelect.value;
  groupValue.textContent = groupSelect.value;
  groupValue.style.display = "inline";
  groupSelect.style.display = "none";
});

stickerInput.addEventListener("change", async () => {
  await apiPatch(`/students/${currentStudent.id}`, { sticker: Number(stickerInput.value) });
  currentStudent.sticker = Number(stickerInput.value);
});

// ===============================
// NAVIGATION
// ===============================
backToGroups.addEventListener("click", loadGroups);
backToStudents.addEventListener("click", () => showStudents(currentGroup));
navGroups.addEventListener("click", loadGroups);
navStudents.addEventListener("click", () => showStudents(currentGroup));
