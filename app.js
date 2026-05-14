// Mock data - replace with API calls when ready
const API_BASE = 'https://your-api-url.com/api'; // Replace with actual API URL

const scoreOptions = [
  { value: 0, text: 'Niet begonnen', color: '#6b7280', symbol: '⛔' },
  { value: 1, text: 'Met hulp', color: '#f59e0b', symbol: '🤝' },
  { value: 2, text: 'Bijna', color: '#f97316', symbol: '⏳' },
  { value: 3, text: 'Beheerst', color: '#16a34a', symbol: '✅' }
];

let students = [
  { id: 1, firstname: 'Jan', group: 'Waterfestijn', startDate: '2023-01-01', sticker: 5, note: '' },
  { id: 2, firstname: 'Piet', group: 'Waterfestijn', startDate: '2023-01-01', sticker: 3, note: '' },
  { id: 3, firstname: 'Klaas', group: 'Beginners', startDate: '2023-01-01', sticker: 4, note: '' },
  { id: 4, firstname: 'Marie', group: 'Beginners', startDate: '2023-02-01', sticker: 6, note: '' },
  { id: 5, firstname: 'Anna', group: 'Basis', startDate: '2023-03-01', sticker: 2, note: '' },
  { id: 6, firstname: 'Tom', group: 'Basis', startDate: '2023-03-01', sticker: 7, note: '' },
];

let skills = [
  { id: 1, order: 1, title: 'Lezen', category: 'Basis' },
  { id: 2, order: 2, title: 'Schrijven', category: 'Basis' },
  { id: 3, order: 3, title: 'Rekenen', category: 'Basis' },
  { id: 4, order: 4, title: 'Tellen', category: 'Basis' },
  { id: 5, order: 5, title: 'Woordenschat', category: 'Taal' },
  { id: 6, order: 6, title: 'Zinnen maken', category: 'Taal' },
  { id: 7, order: 7, title: 'Verhaal begrijpen', category: 'Taal' },
  { id: 8, order: 8, title: 'Optellen', category: 'Rekenen' },
  { id: 9, order: 9, title: 'Aftrekken', category: 'Rekenen' },
  { id: 10, order: 10, title: 'Vermenigvuldigen', category: 'Geavanceerd' },
];

let progress = [
  // Student 1
  { studentId: 1, skillId: 1, score: 3, note: 'Goed' },
  { studentId: 1, skillId: 2, score: 2, note: '' },
  { studentId: 1, skillId: 3, score: 3, note: 'Uitstekend' },
  { studentId: 1, skillId: 4, score: 3, note: '' },
  { studentId: 1, skillId: 5, score: 2, note: 'Bijna' },
  { studentId: 1, skillId: 6, score: 1, note: '' },
  { studentId: 1, skillId: 7, score: 3, note: '' },
  { studentId: 1, skillId: 8, score: 3, note: '' },
  { studentId: 1, skillId: 9, score: 2, note: '' },
  { studentId: 1, skillId: 10, score: 0, note: '' },
  // Student 2
  { studentId: 2, skillId: 1, score: 1, note: '' },
  { studentId: 2, skillId: 2, score: 0, note: '' },
  { studentId: 2, skillId: 3, score: 2, note: '' },
  { studentId: 2, skillId: 4, score: 2, note: '' },
  { studentId: 2, skillId: 5, score: 1, note: '' },
  { studentId: 2, skillId: 6, score: 0, note: '' },
  { studentId: 2, skillId: 7, score: 1, note: '' },
  { studentId: 2, skillId: 8, score: 2, note: '' },
  { studentId: 2, skillId: 9, score: 1, note: '' },
  { studentId: 2, skillId: 10, score: 0, note: '' },
  // Student 3
  { studentId: 3, skillId: 1, score: 3, note: '' },
  { studentId: 3, skillId: 2, score: 3, note: '' },
  { studentId: 3, skillId: 3, score: 3, note: '' },
  { studentId: 3, skillId: 4, score: 3, note: '' },
  { studentId: 3, skillId: 5, score: 3, note: '' },
  { studentId: 3, skillId: 6, score: 3, note: '' },
  { studentId: 3, skillId: 7, score: 3, note: '' },
  { studentId: 3, skillId: 8, score: 3, note: '' },
  { studentId: 3, skillId: 9, score: 3, note: '' },
  { studentId: 3, skillId: 10, score: 2, note: '' },
  // Student 4
  { studentId: 4, skillId: 1, score: 3, note: 'Zeer goed' },
  { studentId: 4, skillId: 2, score: 3, note: '' },
  { studentId: 4, skillId: 3, score: 3, note: '' },
  { studentId: 4, skillId: 4, score: 3, note: '' },
  { studentId: 4, skillId: 5, score: 3, note: '' },
  { studentId: 4, skillId: 6, score: 3, note: '' },
  { studentId: 4, skillId: 7, score: 3, note: '' },
  { studentId: 4, skillId: 8, score: 3, note: '' },
  { studentId: 4, skillId: 9, score: 3, note: '' },
  { studentId: 4, skillId: 10, score: 3, note: 'Top!' },
  // Student 5
  { studentId: 5, skillId: 1, score: 0, note: '' },
  { studentId: 5, skillId: 2, score: 0, note: '' },
  { studentId: 5, skillId: 3, score: 1, note: '' },
  { studentId: 5, skillId: 4, score: 1, note: '' },
  { studentId: 5, skillId: 5, score: 0, note: '' },
  { studentId: 5, skillId: 6, score: 0, note: '' },
  { studentId: 5, skillId: 7, score: 0, note: '' },
  { studentId: 5, skillId: 8, score: 1, note: '' },
  { studentId: 5, skillId: 9, score: 0, note: '' },
  { studentId: 5, skillId: 10, score: 0, note: '' },
  // Student 6
  { studentId: 6, skillId: 1, score: 3, note: '' },
  { studentId: 6, skillId: 2, score: 3, note: '' },
  { studentId: 6, skillId: 3, score: 3, note: '' },
  { studentId: 6, skillId: 4, score: 3, note: '' },
  { studentId: 6, skillId: 5, score: 3, note: '' },
  { studentId: 6, skillId: 6, score: 3, note: '' },
  { studentId: 6, skillId: 7, score: 3, note: '' },
  { studentId: 6, skillId: 8, score: 3, note: '' },
  { studentId: 6, skillId: 9, score: 3, note: '' },
  { studentId: 6, skillId: 10, score: 3, note: '' },
];

// DOM elements
const groupsContainer = document.getElementById('groups-container');
const studentsContainer = document.getElementById('students-container');
const studentEdit = document.getElementById('student-edit');
const groupsList = document.getElementById('groups-list');
const studentsList = document.getElementById('students-list');
const groupTitle = document.getElementById('group-title');
const studentName = document.getElementById('student-name');
const studentForm = document.getElementById('student-form');
const groupSelect = document.getElementById('group');
const groupValue = document.getElementById('group-value');
const groupEditButton = document.getElementById('group-edit-button');
const groupDisplay = document.getElementById('group-display');
const stickerInput = document.getElementById('sticker');
const skillsList = document.getElementById('skills-list');
const backToGroups = document.getElementById('back-to-groups');
const backToStudents = document.getElementById('back-to-students');
const studentSearch = document.getElementById('student-search');
const navGroups = document.getElementById('nav-groups');
const navStudents = document.getElementById('nav-students');

let currentGroup = '';
let currentStudent = null;

const LOCAL_STORAGE_KEY = 'studentProgressWebAppData';
const groupOrder = ['waterfestijn', 'beginners', 'basis', 'gevorderd'];

function loadSavedState() {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return;

  try {
    const parsed = JSON.parse(stored);
    if (parsed.students && Array.isArray(parsed.students) && parsed.students.length > 0) {
      students = parsed.students;
    }
    if (parsed.progress && Array.isArray(parsed.progress)) {
      progress = parsed.progress;
    }
  } catch (err) {
    console.error('Kon opgeslagen gegevens niet lezen:', err);
  }
}

function saveState() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ students, progress }));
}

function getGroupStats(group) {
  const groupStudents = students.filter(s => s.group === group);

  return {
    studentCount: groupStudents.length
  };
}

function getProgressColor(percent) {
  // Interpoleer van grijs (#6b7280) naar groen (#16a34a)
  const startColor = { r: 107, g: 114, b: 128 }; // grijs
  const endColor = { r: 22, g: 164, b: 74 }; // groen
  
  const factor = percent / 100;
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * factor);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * factor);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * factor);
  
  return `rgb(${r}, ${g}, ${b})`;
}

function getGroups() {
  const uniqueGroups = [...new Set(students.map(s => s.group))];
  console.log('Unique groups found:', uniqueGroups);
  const sorted = uniqueGroups.sort((a, b) => {
    const aIndex = groupOrder.indexOf(a.toLowerCase());
    const bIndex = groupOrder.indexOf(b.toLowerCase());
    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  });
  console.log('Sorted groups:', sorted);
  return sorted;
}

function saveProgress(studentId, skillId, score, note) {
  let prog = progress.find(p => p.studentId === studentId && p.skillId === skillId);
  if (prog) {
    prog.score = score;
    prog.note = note;
  } else {
    progress.push({ studentId, skillId, score, note });
  }
  saveState();
}

groupEditButton.addEventListener('click', () => {
  groupValue.style.display = 'none';
  groupSelect.style.display = 'inline-block';
  groupSelect.focus();
});

groupSelect.addEventListener('change', () => {
  if (!currentStudent) return;
  currentStudent.group = groupSelect.value;
  groupValue.textContent = groupSelect.value;
  groupValue.style.display = 'inline';
  groupSelect.style.display = 'none';
  saveState();
});

stickerInput.addEventListener('change', () => {
  if (!currentStudent) return;
  currentStudent.sticker = parseInt(stickerInput.value);
  saveState();
});

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  loadSavedState();
  studentSearch.value = '';
  console.log('About to load groups. Students:', students.length);
  loadGroups();
  console.log('Groups loaded');
});

studentSearch.addEventListener('input', () => {
  if (currentGroup) {
    showStudents(currentGroup);
  } else {
    loadGroups();
  }
});

navGroups.addEventListener('click', () => {
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
