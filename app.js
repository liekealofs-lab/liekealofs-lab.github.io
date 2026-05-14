const API_BASE = 'https://zohz.duckdns.org/superspetters';

const scoreOptions = [
  { value: 0, text: 'Niet begonnen', color: '#6b7280', symbol: '⛔' },
  { value: 1, text: 'Met hulp', color: '#f59e0b', symbol: '🤝' },
  { value: 2, text: 'Bijna', color: '#f97316', symbol: '⏳' },
  { value: 3, text: 'Beheerst', color: '#16a34a', symbol: '✅' }
];

let students = [];
let skills = [];
let progress = [];

// API helper functions
async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

async function updateProgress(studentId, skillId, score, note) {
  try {
    const response = await fetch(`${API_BASE}/progress/${studentId}/${skillId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, note })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to update progress:', error);
    return null;
  }
}

async function updateStudent(studentId, updates) {
  try {
    const response = await fetch(`${API_BASE}/students/${studentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to update student:', error);
    return null;
  }
}

async function loadAllData() {
  const [studentsData, progressData] = await Promise.all([
    fetchData('/students'),
    fetchData('/progress')
  ]);
  
  if (studentsData) students = studentsData;
  if (progressData) progress = progressData;
  
  return { students, progress };
}

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

const groupOrder = ['waterfestijn', 'beginners', 'basis', 'gevorderd'];

function saveProgress(studentId, skillId, score, note) {
  updateProgress(studentId, skillId, score, note);
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

groupSelect.addEventListener('change', async () => {
  if (!currentStudent) return;
  const newGroup = groupSelect.value;
  const updated = await updateStudent(currentStudent.id, { group: newGroup });
  if (updated) {
    currentStudent.group = newGroup;
    groupValue.textContent = newGroup;
    groupValue.style.display = 'inline';
    groupSelect.style.display = 'none';
  }
});

stickerInput.addEventListener('change', async () => {
  if (!currentStudent) return;
  const newSticker = parseInt(stickerInput.value);
  const updated = await updateStudent(currentStudent.id, { sticker: newSticker });
  if (updated) {
    currentStudent.sticker = newSticker;
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded event fired');
  await loadAllData();
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

navStudents.addEventListener('click', () => {
  const selectedGroup = currentGroup || getGroups()[0];
  if (selectedGroup) {
    showStudents(selectedGroup);
  }
});

// Load groups
function loadGroups() {
  currentGroup = '';
  updateNavigationState('groups');
  const query = studentSearch.value.trim().toLowerCase();
  let groups = getGroups();
  
  console.log('Students count:', students.length);
  console.log('Groups:', groups);
  
  if (query) {
    // Filter groepen die studenten hebben die matchen met de zoekterm
    groups = groups.filter(group => {
      const groupStudents = students.filter(s => s.group === group);
      return groupStudents.some(student => {
        const matchesName = student.firstname.toLowerCase().includes(query);
        return matchesName;
      });
    });
  }
  
  groupsList.innerHTML = '';
  if (groups.length === 0) {
    groupsList.innerHTML = '<div class="empty-state">Geen groepen gevonden. Probeer een andere zoekterm.</div>';
  } else {
    groups.forEach(group => {
      const stats = getGroupStats(group);
      const button = document.createElement('div');
      button.className = 'group-button';
      button.innerHTML = `
        <div class="group-button-title">${group}</div>
        <div class="group-meta">
          <span>${stats.studentCount} studenten</span>
        </div>
      `;
      button.addEventListener('click', () => showStudents(group));
      groupsList.appendChild(button);
    });
  }
  
  groupsContainer.style.display = 'block';
  studentsContainer.style.display = 'none';
  studentEdit.style.display = 'none';
}

// Show students in a group
function showStudents(group) {
  currentGroup = group;
  updateNavigationState('students');
  groupTitle.textContent = `Studenten in ${group}`;
  const query = studentSearch.value.trim().toLowerCase();
  const groupStudents = students
    .filter(s => s.group === group)
    .filter(student => {
      if (!query) return true;
      const matchesName = student.firstname.toLowerCase().includes(query);
      return matchesName;
    })
    .sort((a, b) => b.sticker - a.sticker || a.firstname.localeCompare(b.firstname, undefined, { sensitivity: 'base' }));

  studentsList.innerHTML = '';
  if (groupStudents.length === 0) {
    studentsList.innerHTML = '<div class="empty-state">Geen studenten gevonden. Probeer een andere zoekterm.</div>';
  }

  groupStudents.forEach(student => {
    const studentProgress = progress.filter(p => p.studentId === student.id);
    const totalSkills = skills.length;
    const scoreCounts = scoreOptions.reduce((acc, option) => {
      acc[option.value] = 0;
      return acc;
    }, {});
    studentProgress.forEach(p => {
      if (scoreCounts[p.score] !== undefined) {
        scoreCounts[p.score] += 1;
      }
    });

    const scoreSummary = scoreOptions.map(option => {
      const count = scoreCounts[option.value] || 0;
      const percent = totalSkills ? Math.round((count / totalSkills) * 100) : 0;
      return `
        <div class="score-summary-badge score-summary-${option.value}">
          <span class="score-summary-dot"></span>
          <span>${option.text}: ${percent}%</span>
        </div>
      `;
    }).join('');

    const totalScore = studentProgress.reduce((sum, p) => sum + p.score, 0);
    const averagePercent = totalSkills ? Math.round((totalScore / (totalSkills * 3)) * 100) : 0;
    const statusIcon = averagePercent >= 80 ? '✅' : averagePercent >= 60 ? '⚠️' : '❗';
    const barColor = averagePercent >= 80 ? '#16a34a' : averagePercent >= 60 ? '#f97316' : '#d62828';

    const card = document.createElement('div');
    card.className = 'student-card';
    card.innerHTML = `
      <div class="student-card-title">${student.firstname} <span class="student-card-extra">Sticker ${student.sticker}</span></div>
      <div class="student-card-summary">${scoreSummary}</div>
      <div class="progress-bar-outer">
        <div class="progress-bar-inner" style="width: ${averagePercent}%; background: ${barColor};"></div>
      </div>
      <div class="progress-label">${statusIcon} voortgangsstatus</div>
    `;
    card.addEventListener('click', () => editStudent(student));
    studentsList.appendChild(card);
  });

  groupsContainer.style.display = 'none';
  studentsContainer.style.display = 'block';
  studentEdit.style.display = 'none';
}

// Edit student
function editStudent(student) {
  currentStudent = student;
  studentName.textContent = `Bewerk ${student.firstname}`;
  
  // Populate group select
  const groups = getGroups();
  groupSelect.innerHTML = '';
  groups.forEach(group => {
    const option = document.createElement('option');
    option.value = group;
    option.textContent = group;
    if (group === student.group) option.selected = true;
    groupSelect.appendChild(option);
  });
  
  // Sticker
  stickerInput.value = student.sticker;
  
  // Group
  groupValue.textContent = student.group;
  groupValue.style.display = 'inline';
  groupSelect.style.display = 'none';
  groupDisplay.style.display = 'inline-flex';
  
  // Skills
  skillsList.innerHTML = '';
  const sortedSkills = [...skills].sort((a, b) => a.category.localeCompare(b.category));
  const skillsByCategory = {};
  sortedSkills.forEach(skill => {
    if (!skillsByCategory[skill.category]) skillsByCategory[skill.category] = [];
    skillsByCategory[skill.category].push(skill);
  });
  
  Object.keys(skillsByCategory).forEach(category => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = category;
    summary.style.fontWeight = 'bold';
    summary.style.cursor = 'pointer';
    details.appendChild(summary);
    
    const categoryDiv = document.createElement('div');
    categoryDiv.style.marginLeft = '1rem';
    skillsByCategory[category].forEach(skill => {
      const prog = progress.find(p => p.studentId === student.id && p.skillId === skill.id) || { score: 0, note: '' };
      const div = document.createElement('div');
      div.className = 'skill-item';
      
      const label = document.createElement('label');
      label.textContent = `${skill.title}:`;
      
      const scoreContainer = document.createElement('div');
      scoreContainer.className = 'score-container';
      scoreContainer.dataset.skillId = skill.id;
      scoreContainer.dataset.selectedScore = prog.score;
      
      scoreOptions.forEach(option => {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'score-option';
        scoreDiv.dataset.value = option.value;
        scoreDiv.style.backgroundColor = option.color;
        scoreDiv.title = option.text;
        scoreDiv.textContent = option.symbol;
        if (option.value == prog.score) scoreDiv.classList.add('selected');
        scoreDiv.addEventListener('click', () => {
          scoreContainer.querySelectorAll('.score-option').forEach(el => el.classList.remove('selected'));
          scoreDiv.classList.add('selected');
          scoreContainer.dataset.selectedScore = option.value;
          saveProgress(currentStudent.id, skill.id, option.value, noteTextarea.value);
        });
        scoreContainer.appendChild(scoreDiv);
      });
      
      const noteText = document.createElement('div');
      noteText.className = 'note-text';
      noteText.textContent = prog.note;
      noteText.style.display = prog.note.trim() ? 'block' : 'none';

      const noteAction = document.createElement('button');
      noteAction.type = 'button';
      noteAction.className = 'note-action-button';
      noteAction.textContent = prog.note.trim() ? 'Bewerk notitie' : 'Voeg notitie toe';

      const noteTextarea = document.createElement('textarea');
      noteTextarea.placeholder = 'Notitie';
      noteTextarea.value = prog.note;
      noteTextarea.dataset.skillId = skill.id;
      noteTextarea.className = 'note-input';
      noteTextarea.rows = 2;
      noteTextarea.style.width = '100%';
      noteTextarea.style.display = 'none';

      const noteSaveButton = document.createElement('button');
      noteSaveButton.type = 'button';
      noteSaveButton.className = 'note-save-button';
      noteSaveButton.textContent = 'Klaar';
      noteSaveButton.style.display = 'none';

      const noteWrapper = document.createElement('div');
      noteWrapper.className = 'note-wrapper';
      noteWrapper.appendChild(noteText);
      noteWrapper.appendChild(noteAction);
      noteWrapper.appendChild(noteTextarea);
      noteWrapper.appendChild(noteSaveButton);

      function toggleNoteEditor(show) {
        noteTextarea.style.display = show ? 'block' : 'none';
        noteSaveButton.style.display = show ? 'inline-flex' : 'none';
        noteWrapper.style.gap = show ? '0.5rem' : '0.75rem';
        if (show) {
          noteTextarea.focus();
        }
      }

      function saveNote() {
        const noteValue = noteTextarea.value.trim();
        saveProgress(currentStudent.id, skill.id, parseInt(scoreContainer.dataset.selectedScore), noteValue);
        noteText.textContent = noteValue;
        noteText.style.display = noteValue ? 'block' : 'none';
        noteAction.textContent = noteValue ? 'Bewerk notitie' : 'Voeg notitie toe';
        toggleNoteEditor(false);
      }

      noteAction.addEventListener('click', () => {
        toggleNoteEditor(true);
      });

      noteSaveButton.addEventListener('click', () => {
        saveNote();
      });

      div.appendChild(label);
      div.appendChild(scoreContainer);
      div.appendChild(noteWrapper);
      categoryDiv.appendChild(div);
    });
    details.appendChild(categoryDiv);
    details.open = false;
    skillsList.appendChild(details);
  });
  
  studentsContainer.style.display = 'none';
  studentEdit.style.display = 'block';
}

// Prevent default form submit behavior because changes are saved immediately on interaction
studentForm.addEventListener('submit', (e) => {
  e.preventDefault();
});

// Back buttons
backToGroups.addEventListener('click', () => {
  studentSearch.value = '';
  loadGroups();
});
backToStudents.addEventListener('click', () => showStudents(currentGroup));