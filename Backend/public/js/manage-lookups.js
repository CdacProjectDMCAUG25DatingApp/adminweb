/****************************
 * AUTH CHECK (SUPER ADMIN ONLY)
 ****************************/
const storedAdmin = JSON.parse(localStorage.getItem("admin"));
const admin = storedAdmin?.admin ? storedAdmin.admin : storedAdmin;

if (!admin || admin.isAdmin !== 2) {
  alert("Access denied");
  window.location.href = "lookups.html";
}

/****************************
 * LOOKUP MASTER LIST
 * (single source of truth)
 ****************************/
const LOOKUP_TYPES = [
  { key: "religion", label: "Religion" },
  { key: "education", label: "Education" },
  { key: "language", label: "Language" },
  { key: "gender", label: "Gender" },
  { key: "zodiac", label: "Zodiac" },

  { key: "smoking", label: "Smoking" },
  { key: "drinking", label: "Drinking" },
  { key: "dietary", label: "Dietary" },
  { key: "workout", label: "Workout" },
  { key: "sleepinghabit", label: "Sleeping Habit" },
  { key: "pet", label: "Pet Preference" },

  { key: "lovestyle", label: "Love Style" },
  { key: "personalitytype", label: "Personality Type" },
  { key: "communicationstyle", label: "Communication Style" },
  { key: "lookingfor", label: "Looking For" },
  { key: "opento", label: "Open To" },
  { key: "familyplans", label: "Family Plans" },

  { key: "jobindustry", label: "Job Industry" },
  { key: "interest", label: "Interests" },
  { key: "subscriptiondetails", label: "Subscription Plans" },
  { key: "reportreason", label: "Report Reasons" }
];

/****************************
 * GLOBAL STATE
 ****************************/
let currentLookupType = null;

/****************************
 * AUTO GENERATE LOOKUP CARDS
 ****************************/
function renderLookupCards() {
  const grid = document.getElementById("lookupGrid");
  grid.innerHTML = "";

  LOOKUP_TYPES.forEach(lk => {
    const card = document.createElement("div");
    card.className = "lookup-card";
    card.innerText = lk.label;
    card.onclick = () => openLookup(lk.key);
    grid.appendChild(card);
  });
}

renderLookupCards();

/****************************
 * OPEN LOOKUP MODAL
 ****************************/
function openLookup(type) {
  currentLookupType = type;

  document.getElementById("modalTitle").innerText =
    "Manage " + type.replace(/_/g, " ").toUpperCase();

  document.getElementById("lookupModal").style.display = "block";

  loadManageTable();
}

/****************************
 * CLOSE MODAL
 ****************************/
function closeModal() {
  document.getElementById("lookupModal").style.display = "none";
  currentLookupType = null;
}

/****************************
 * LOAD LOOKUP DATA
 ****************************/
function loadManageTable() {
  const tbody = document.getElementById("lookupTable");
  tbody.innerHTML =
    "<tr><td colspan='5' style='text-align:center'>Loading...</td></tr>";

  fetch(`http://localhost:5000/admin/lookups/${currentLookupType}`, {
    headers: {
      "x-admin": JSON.stringify(admin)
    }
  })
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML =
          "<tr><td colspan='5' style='text-align:center'>No records found</td></tr>";
        return;
      }

      data.forEach(row => {
        tbody.innerHTML += `
          <tr>
            <td>${row.id}</td>
            <td>${row.type_code}</td>
            <td>
              <input
                value="${row.name}"
                onchange="updateName(${row.id}, this.value)"
              />
            </td>
            <td>${row.active == 1 ? "Active" : "Inactive"}</td>
            <td>
              <button onclick="toggleStatus(${row.id})">
                ${row.active == 1 ? "Disable" : "Enable"}
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(() => {
      tbody.innerHTML =
        "<tr><td colspan='5' style='text-align:center'>Error loading data</td></tr>";
    });
}

/****************************
 * TOGGLE ACTIVE / INACTIVE
 * (SOFT DELETE / RESTORE)
 ****************************/
function toggleStatus(id) {
  if (!confirm("Change status of this value?")) return;

  fetch("http://localhost:5000/admin/lookups/toggle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin": JSON.stringify(admin)
    },
    body: JSON.stringify({
      table: currentLookupType,
      id
    })
  }).then(() => loadManageTable());
}

/****************************
 * UPDATE LOOKUP NAME
 ****************************/
function updateName(id, name) {
  if (!name) return;

  fetch("http://localhost:5000/admin/lookups/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin": JSON.stringify(admin)
    },
    body: JSON.stringify({
      table: currentLookupType,
      id,
      name,
      type_code: name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z_]/g, "")
    })
  });
}

/****************************
 * ADD NEW LOOKUP
 ****************************/
function addLookup() {
  const name = prompt("Enter new value");
  if (!name) return;

  fetch("http://localhost:5000/admin/lookups/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin": JSON.stringify(admin)
    },
    body: JSON.stringify({
      table: currentLookupType,
      name,
      type_code: name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z_]/g, "")
    })
  }).then(() => loadManageTable());
}
