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

    if (!res.ok) {
        const message = await res.text();
        throw new Error(`POST ${path}: ${res.status} - ${message}`);
    }

    return res.json();
}



async function apiPatch(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(`PATCH ${path}: ${res.status} - ${message}`);
    }

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
let studentStickerProgress = [];

// ======================================================
// STICKERS
// ======================================================

const STICKERS = [
  { id: 1, title: "Eerste zwemles", icon: "🏊" },
  { id: 2, title: "In het water springen", icon: "💦" },
  { id: 3, title: "Ademhalen", icon: "🌬️" },
  { id: 4, title: "Drijven", icon: "⭐" },
  { id: 5, title: "Trappelbenen", icon: "🦵" },
  { id: 6, title: "Onder water zwemmen", icon: "🐠" },
  { id: 7, title: "Duiken", icon: "🤿" },
  { id: 8, title: "Rugcrawl en borstcrawl", icon: "🏅" },
  { id: 9, title: "Enkelvoudige rugslag", icon: "🏊‍♂️" },
  { id: 10, title: "Door het zeil & wak zwemmen", icon: "🌊" },
  { id: 11, title: "Borstcrawl met ademhalen", icon: "🐬" },
  { id: 12, title: "Schoolslag", icon: "🏆" },
  { id: 13, title: "Met kleding zwemmen", icon: "👕" },
  { id: 14, title: "Afzwemmen", icon: "🥇" }
];

function getStickerStorageKey() {
  return `superspetters_stickers_${currentStudent.id}`;
}

function getStudentStickers() {
  let saved = {};

  try {
    saved = JSON.parse(localStorage.getItem(getStickerStorageKey())) || {};
  } catch (error) {
    console.error("Stickergegevens konden niet worden gelezen:", error);
  }

  return saved;
}

function saveStudentStickers(stickers) {
  localStorage.setItem(
    getStickerStorageKey(),
    JSON.stringify(stickers)
  );
}
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
let fab;
let stickerbookPage;
let stickerbookGrid;
let stickerbookTitle;
let stickerbookCount;
let stickerbookPercentage;
let stickerbookProgressInner;
let openStickerbookButton;
let groupSkillsButton;
let groupSkillsOverview;

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

  fab = document.getElementById("fab");
  stickerbookPage = document.getElementById("stickerbook-page");
stickerbookGrid = document.getElementById("stickerbook-grid");
stickerbookTitle = document.getElementById("stickerbook-title");
stickerbookCount = document.getElementById("stickerbook-count");
stickerbookPercentage = document.getElementById("stickerbook-percentage");
stickerbookProgressInner = document.getElementById("stickerbook-progress-inner");
openStickerbookButton = document.getElementById("open-stickerbook-button");
groupSkillsButton = document.getElementById("group-skills-button");
groupSkillsOverview = document.getElementById("group-skills-overview");
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
  toHome.addEventListener("click", showHome);

backButton.addEventListener("click", () => {
  if (!stickerbookPage.classList.contains("hidden")) {
    showStudentDetail();
  } else if (!studentEdit.classList.contains("hidden")) {
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

  // FAB
  fab.addEventListener("click", () => {
    if (!agendaPage.classList.contains("hidden")) {
      document.getElementById("vacation-title").scrollIntoView({ behavior: "smooth" });
      document.getElementById("vacation-title").focus();
      return;
    }

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


  saveStudentEdit.addEventListener("click", saveStudent);
  deleteStudentBtn.addEventListener("click", deleteStudent);

  openStickerbookButton.addEventListener("click", showStickerbook);

  // Agenda
  document.getElementById("add-vacation").addEventListener("click", addVacation);

  groupSkillsButton.addEventListener("click", showGroupSkillsOverview);
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
  stickerbookPage.classList.add("hidden");
  groupSkillsOverview.classList.add("hidden");
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

    const groups = [
        "Spetter Festijn",
        "Spetter Start",
        "Super Spetters"
    ];

    groups.forEach(group => {
        const count = students.filter(
            student => student.group === group
        ).length;

        const btn = document.createElement("button");
        btn.className = "group-button";

        btn.innerHTML = `
            <div class="group-button-title">${group}</div>
            <div class="group-meta">
                <span>${count} superspetters</span>
            </div>
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

    studentsList.classList.remove("hidden");
    groupSkillsOverview.classList.add("hidden");
    groupSkillsOverview.innerHTML = "";

    const filtered = students
        .filter(s => s.group === group)
        .sort((a, b) => a.firstname.localeCompare(b.firstname));

    for (const student of filtered) {
        let progress = [];

        try {
            progress = await apiGet(`/skill_progress/${student.id}`);
        } catch (error) {
            console.error(
                `Voortgang ophalen mislukt voor ${student.firstname}:`,
                error
            );
        }

        const totalScore = progress.reduce(
            (sum, p) => sum + (Number(p.score) || 0),
            0
        );

        const maxScore = skills.length * 3;
        const avg = maxScore
            ? Math.round((totalScore / maxScore) * 100)
            : 0;

        const card = document.createElement("div");
        card.className = "student-card";

        card.innerHTML = `
            <div class="student-card-title">${student.firstname}</div>
            <div class="progress-bar-outer">
                <div class="progress-bar-inner" style="width:${avg}%;">
                </div>
            </div>
            <div class="progress-label">${avg}%</div>
        `;

        card.addEventListener("click", () => editStudent(student));
        studentsList.appendChild(card);
    }
}

// ======================================================
// VAARDIGHEDENOVERZICHT PER GROEP
// ======================================================


async function showGroupSkillsOverview() {
    studentsList.classList.add("hidden");
    groupSkillsOverview.classList.remove("hidden");
    groupSkillsOverview.innerHTML = "<p>Vaardigheden laden...</p>";

    const groupStudents = students
        .filter(student => student.group === currentGroup)
        .sort((a, b) => a.firstname.localeCompare(b.firstname));

    try {
        // Voortgang van alle leerlingen ophalen
        const progressResults = await Promise.all(
            groupStudents.map(async student => {
                try {
                    const progress = await apiGet(
                        `/skill_progress/${student.id}`
                    );

                    return { student, progress };
                } catch (error) {
                    console.error(
                        `Voortgang ophalen mislukt voor ${student.firstname}:`,
                        error
                    );

                    return { student, progress: [] };
                }
            })
        );

        groupSkillsOverview.innerHTML = "";

        const heading = document.createElement("h3");
        heading.textContent = "Vaardigheden van " + currentGroup;
        groupSkillsOverview.appendChild(heading);

        const explanation = document.createElement("p");
        explanation.className = "overview-explanation";
        explanation.textContent =
            "Open een sticker om de vaardigheden te bekijken. Klik op een score om deze aan te passen.";
        groupSkillsOverview.appendChild(explanation);

        // Vaardigheden groeperen per sticker
        const stickerGroups = {};

        skills.forEach(skill => {
            const stickerId = Number(skill.stickerId);

            const stickerKey = Number.isFinite(stickerId)
                ? stickerId
                : 0;

if (!stickerGroups[stickerKey]) {
    const localSticker = STICKERS.find(
        sticker => Number(sticker.id) === stickerKey
    );

    stickerGroups[stickerKey] = {
        id: stickerKey,
        title: skill.stickerName || localSticker?.title || "Onbekende sticker",
        skills: []
    };
}

            stickerGroups[stickerKey].skills.push(skill);
        });

        // Stickers op nummer sorteren
        Object.values(stickerGroups)
            .sort((a, b) => a.id - b.id)
            .forEach(sticker => {

                // Vaardigheden binnen sticker sorteren
                sticker.skills.sort(
                    (a, b) => Number(a.order) - Number(b.order)
                );

                const stickerDetails = document.createElement("details");
                stickerDetails.className = "overview-sticker";

                const stickerSummary = document.createElement("summary");
                stickerSummary.textContent =
                    `🏅 Sticker ${sticker.id} – ${sticker.title} (${sticker.skills.length} vaardigheden)`;

                stickerDetails.appendChild(stickerSummary);

                // Vaardigheden groeperen per categorie
                const categories = {};

                sticker.skills.forEach(skill => {
                    const category =
                        skill.category || "Overige vaardigheden";

                    if (!categories[category]) {
                        categories[category] = [];
                    }

                    categories[category].push(skill);
                });

                Object.entries(categories).forEach(
                    ([category, categorySkills]) => {

                        const categoryDetails =
                            document.createElement("details");

                        categoryDetails.className = "overview-category";

                        const categorySummary =
                            document.createElement("summary");

                        categorySummary.textContent =
                            `${category} (${categorySkills.length} vaardigheden)`;

                        categoryDetails.appendChild(categorySummary);

                        const tableWrapper =
                            document.createElement("div");

                        tableWrapper.className =
                            "overview-table-wrapper";

                        const table = document.createElement("table");
                        table.className = "overview-table";

                        // Tabelkop
                        const thead = document.createElement("thead");
                        const headerRow = document.createElement("tr");

                        const skillHeader = document.createElement("th");
                        skillHeader.textContent = "Vaardigheid";
                        headerRow.appendChild(skillHeader);

                        groupStudents.forEach(student => {
                            const th = document.createElement("th");
                            th.textContent = student.firstname;
                            headerRow.appendChild(th);
                        });

                        thead.appendChild(headerRow);
                        table.appendChild(thead);

                        // Vaardigheden en scores
                        const tbody = document.createElement("tbody");

                        categorySkills.forEach(skill => {
                            const row = document.createElement("tr");

                            const skillCell = document.createElement("td");
                            skillCell.textContent = skill.title;
                            row.appendChild(skillCell);

                            progressResults.forEach(
                                ({ student, progress }) => {

                                    const cell = document.createElement("td");

                                    let currentProgress = progress.find(
                                        item =>
                                            String(item.skillId) ===
                                            String(skill.id)
                                    ) || null;

                                    const currentScore = Math.min(
                                        3,
                                        Math.max(
                                            0,
                                            Number(currentProgress?.score) || 0
                                        )
                                    );

                                    const scoreButton =
                                        document.createElement("button");

                                    scoreButton.type = "button";
                                    scoreButton.className = "overview-score";

                                    const scoreIcons = [
                                        "⚪",
                                        "🟡",
                                        "🔴",
                                        "✅"
                                    ];

                                    const scoreLabels = [
                                        "Niet begonnen",
                                        "Met hulp",
                                        "Bijna",
                                        "Beheerst"
                                    ];

                                    scoreButton.textContent =
                                        scoreIcons[currentScore];

                                    scoreButton.title =
                                        scoreLabels[currentScore];

                                    scoreButton.addEventListener(
                                        "click",
                                        async () => {

                                            const currentValue = Math.min(
                                                3,
                                                Math.max(
                                                    0,
                                                    Number(currentProgress?.score) || 0
                                                )
                                            );

                                            const nextScore =
                                                (currentValue + 1) % 4;

                                            scoreButton.disabled = true;

                                            try {
                                                await saveProgress(
                                                    student.id,
                                                    skill.id,
                                                    nextScore,
                                                    currentProgress?.note || ""
                                                );

                                                if (currentProgress) {
                                                    currentProgress.score =
                                                        nextScore;
                                                } else {
                                                    currentProgress = {
                                                        skillId: skill.id,
                                                        score: nextScore,
                                                        note: ""
                                                    };

                                                    progress.push(
                                                        currentProgress
                                                    );
                                                }

                                                scoreButton.textContent =
                                                    scoreIcons[nextScore];

                                                scoreButton.title =
                                                    scoreLabels[nextScore];

                                            } catch (error) {
                                                console.error(
                                                    "Score opslaan mislukt:",
                                                    error
                                                );

                                                alert(
                                                    "De score kon niet worden opgeslagen."
                                                );
                                            } finally {
                                                scoreButton.disabled = false;
                                            }
                                        }
                                    );

                                    cell.appendChild(scoreButton);
                                    row.appendChild(cell);
                                }
                            );

                            tbody.appendChild(row);
                        });

                        table.appendChild(tbody);
                        tableWrapper.appendChild(table);
                        categoryDetails.appendChild(tableWrapper);

                        stickerDetails.appendChild(categoryDetails);
                    }
                );

                groupSkillsOverview.appendChild(stickerDetails);
            });

        if (skills.length === 0) {
            groupSkillsOverview.innerHTML +=
                "<p>Er zijn nog geen vaardigheden beschikbaar.</p>";
        }

    } catch (error) {
        console.error(
            "Vaardighedenoverzicht laden mislukt:",
            error
        );

        groupSkillsOverview.innerHTML =
            "<p>Het vaardighedenoverzicht kon niet worden geladen.</p>";
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

  editFirstname.value = student.firstname;
  editGroup.value = student.group;

  document.getElementById("student-form").classList.add("hidden");

  try {
    const progress = await apiGet(`/skill_progress/${student.id}`);
    renderSkills(progress);
  } catch (error) {
    console.error("Vaardigheden ophalen mislukt:", error);
    alert("De vaardigheden konden niet worden opgehaald.");
  }

  await loadStudentStickerProgress();
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
  await apiPatch(`/skill_progress/${studentId}/${skillId}`, { score, note });
}

// ======================================================
// NEW STUDENT
// ======================================================

async function saveNewStudent() {
    const firstname = newStudentName.value.trim();
    const group = currentGroup || newStudentGroup.value;

    if (!firstname) {
        alert("Vul een naam in.");
        return;
    }

    if (!group) {
        alert("Selecteer eerst een groep.");
        return;
    }

    saveStudentButton.disabled = true;
    saveStudentButton.textContent = "Opslaan...";

    try {
        const startDate = new Date().toISOString().split("T")[0];

        const newStudent = await apiPost("/students", {
            firstname,
            group,
            startDate,
            sticker: 0,
            note: ""
        });

        if (!newStudent || !newStudent.id) {
            throw new Error("De server heeft geen leerling-ID teruggegeven.");
        }

        for (const skill of skills) {
            await apiPatch(`/skill_progress/${newStudent.id}/${skill.id}`, {
                score: 0,
                note: ""
            });
        }

        alert("Leerling succesvol toegevoegd!");

        addStudentModal.classList.add("hidden");
        newStudentName.value = "";

        await loadAllData();

        if (currentGroup) {
            showStudents(currentGroup);
        } else {
            showGroups();
        }

    } catch (error) {
        console.error("Fout bij toevoegen leerling:", error);
        alert("Leerling opslaan is niet gelukt: " + error.message);

    } finally {
        saveStudentButton.disabled = false;
        saveStudentButton.textContent = "Opslaan";
    }
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


// =========================================
// STICKERBOEK - BACKEND
// =========================================

async function loadStudentStickerProgress() {
  try {
    studentStickerProgress = await apiGet(
      `/sticker_progress/${currentStudent.id}`
    );

    updateStickerCount();
  } catch (error) {
    console.error("Stickergegevens ophalen mislukt:", error);
    studentSticker.textContent = "?";
  }
}

function updateStickerCount() {
  const achievedCount = STICKERS.filter(sticker => {
    const progress = studentStickerProgress.find(
      item => item.stickerId === sticker.id
    );

    return progress?.achieved === true;
  }).length;

  studentSticker.textContent = achievedCount;
}

// Stickerboek openen
async function showStickerbook() {
  hideAll();

  stickerbookPage.classList.remove("hidden");
  headerTitle.textContent = "Stickerboek";

  stickerbookTitle.textContent =
    `Stickerboek van ${currentStudent.firstname}`;

  stickerbookGrid.innerHTML = "<p>Stickerboek laden...</p>";

  try {
    await loadStudentStickerProgress();
    renderStickerbook();
  } catch (error) {
    console.error(error);
    stickerbookGrid.innerHTML =
      "<p>Het stickerboek kon niet worden geladen.</p>";
  }
}

// Stickerboek tekenen
function renderStickerbook() {
  stickerbookGrid.innerHTML = "";

  const achievedCount = STICKERS.filter(sticker => {
    const progress = studentStickerProgress.find(
      item => item.stickerId === sticker.id
    );

    return progress?.achieved === true;
  }).length;

  const percentage = Math.round(
    (achievedCount / STICKERS.length) * 100
  );

  stickerbookCount.textContent =
    `${achievedCount} van ${STICKERS.length} stickers behaald`;

  stickerbookPercentage.textContent = `${percentage}%`;

  stickerbookProgressInner.style.width = `${percentage}%`;

  studentSticker.textContent = achievedCount;

  STICKERS.forEach(sticker => {
    const progress = studentStickerProgress.find(
      item => item.stickerId === sticker.id
    );

    const achieved = progress?.achieved === true;

    const card = document.createElement("button");
    card.type = "button";
    card.className = `sticker-card ${achieved ? "achieved" : "locked"}`;

    card.innerHTML = `
      <div class="sticker-number">Sticker ${sticker.id}</div>
      <div class="sticker-image">${sticker.icon}</div>
      <div class="sticker-name">${sticker.title}</div>
      <div class="sticker-status">
        ${achieved ? "✓ Behaald" : "Nog te behalen"}
      </div>
    `;

    card.addEventListener("click", () => {
      toggleStudentSticker(sticker, achieved, card);
    });

    stickerbookGrid.appendChild(card);
  });
}

// Sticker aanvinken of uitvinken
async function toggleStudentSticker(sticker, achieved, card) {
  card.disabled = true;

  try {
    const result = await apiPatch(
      `/sticker_progress/${currentStudent.id}/${sticker.id}`,
      { achieved: !achieved }
    );

    const index = studentStickerProgress.findIndex(
      item => item.stickerId === sticker.id
    );

    if (index >= 0) {
      studentStickerProgress[index] = result;
    } else {
      studentStickerProgress.push(result);
    }

    renderStickerbook();

  } catch (error) {
    console.error("Sticker opslaan mislukt:", error);
    alert(
      "De sticker kon niet worden opgeslagen. Controleer of deze sticker voor deze leerling in de backend bestaat."
    );

    card.disabled = false;
  }
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

// ======================================================
// STICKERBOEK
// ======================================================

function showStudentDetail() {
  hideAll();

  studentEdit.classList.remove("hidden");
  headerTitle.textContent = currentStudent.firstname;
}

function showStickerbook() {
  if (!currentStudent) return;

  hideAll();

  stickerbookPage.classList.remove("hidden");
  headerTitle.textContent = "Stickerboek";
  stickerbookTitle.textContent =
    `Stickerboek van ${currentStudent.firstname}`;

  renderStickerbook();
}

function renderStickerbook() {
  const savedStickers = getStudentStickers();

  const achievedCount = STICKERS.filter(
    sticker => savedStickers[sticker.id] === true
  ).length;

  const percentage = Math.round(
    (achievedCount / STICKERS.length) * 100
  );

  stickerbookCount.textContent =
    `${achievedCount} van ${STICKERS.length} stickers behaald`;

  stickerbookPercentage.textContent = `${percentage}%`;

  stickerbookProgressInner.style.width = `${percentage}%`;

  stickerbookGrid.innerHTML = "";

  STICKERS.forEach(sticker => {
    const achieved = savedStickers[sticker.id] === true;

    const card = document.createElement("button");
    card.type = "button";
    card.className = `sticker-card ${achieved ? "achieved" : "locked"}`;

    card.innerHTML = `
      <div class="sticker-image">${sticker.icon}</div>
      <div class="sticker-number">Sticker ${sticker.id}</div>
      <div class="sticker-name">${sticker.title}</div>
      <div class="sticker-status">
        ${achieved ? "✅ Behaald" : "🔒 Nog niet behaald"}
      </div>
    `;

    card.addEventListener("click", () => {
      toggleSticker(sticker.id);
    });

    stickerbookGrid.appendChild(card);
  });
}

function toggleSticker(stickerId) {
  const savedStickers = getStudentStickers();

  savedStickers[stickerId] =
    savedStickers[stickerId] !== true;

  saveStudentStickers(savedStickers);

  renderStickerbook();
}

// Agenda tonen
function showAgenda() {
  hideAll();
  headerTitle.textContent = "Agenda";
  agendaPage.classList.remove("hidden");
  loadVacations();
}

