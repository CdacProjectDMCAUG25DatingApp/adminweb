/****************************
 * AUTH CHECK
 ****************************/
const storedAdmin = JSON.parse(localStorage.getItem("admin"));
const admin = storedAdmin?.admin ? storedAdmin.admin : storedAdmin;

if (!admin) {
  alert("Not logged in");
  window.location.href = "login.html";
}

/****************************
 * GLOBAL STATE
 ****************************/
let allUsers = [];

/****************************
 * LOAD USERS
 ****************************/
function loadUsers() {
  fetch("http://localhost:5000/admin/users", {
    headers: {
      "x-admin": JSON.stringify(admin)
    }
  })
    .then(res => res.json())
    .then(data => {
      allUsers = data;
      renderUsers(data);
    })
    .catch(err => console.error(err));
}

/****************************
 * APPLY FILTERS
 ****************************/
function applyFilters() {
  const searchText = document
    .getElementById("searchInput")
    .value.toLowerCase();

  const roleFilter = document.getElementById("roleFilter").value;
  const banFilter = document.getElementById("banFilter").value;

  const filtered = allUsers.filter(u => {
    const matchSearch =
      u.user_name.toLowerCase().includes(searchText) ||
      u.email.toLowerCase().includes(searchText);

    const matchRole =
      roleFilter === "all" || String(u.isAdmin) === roleFilter;

    const matchBan =
      banFilter === "all" || String(u.is_banned) === banFilter;

    return matchSearch && matchRole && matchBan;
  });

  renderUsers(filtered);
}

/****************************
 * RENDER USERS
 ****************************/
function renderUsers(users) {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";

  if (!users.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:20px;">
          No users found
        </td>
      </tr>
    `;
    return;
  }

  users.forEach(u => {
    const role =
      u.isAdmin === 2
        ? "Super Admin"
        : u.isAdmin === 1
        ? "Admin"
        : "User";

    /* =====================
       BAN BUTTON LOGIC
    ===================== */
  let banBtn = "-";

const isSelf = u.uid === admin.uid;
const isSuperAdmin = u.isAdmin === 2;
const isBanned = u.is_banned === 1;

// Only allow ban/unban if:
// - not yourself
// - not super admin
if (!isSelf && !isSuperAdmin) {
  banBtn = isBanned
    ? `<button class="action-btn unban"
          onclick="toggleBan(${u.uid}, 0)">Unban</button>`
    : `<button class="action-btn ban"
          onclick="toggleBan(${u.uid}, 1)">Ban</button>`;
}

    /* =====================
       ADMIN ACTION LOGIC
    ===================== */
    let adminAction = "-";

    if (admin.isAdmin === 2 && u.uid !== admin.uid && !isBanned) {
      if (u.isAdmin === 0) {
        adminAction = `
          <button class="action-btn promote"
            onclick="makeAdmin(${u.uid})">
            Make Admin
          </button>`;
      } else if (u.isAdmin === 1) {
        adminAction = `
          <button class="action-btn demote"
            onclick="removeAdmin(${u.uid})">
            Remove Admin
          </button>`;
      }
    }

    tbody.innerHTML += `
      <tr>
        <td>${u.uid}</td>
        <td>${u.user_name}</td>
        <td>${u.email}</td>
        <td>${role}</td>
        <td>${banBtn}</td>
        <td>${adminAction}</td>
      </tr>
    `;
  });
}

/****************************
 * BAN / UNBAN USER
 ****************************/
function toggleBan(uid, ban) {
  fetch("http://localhost:5000/admin/ban-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin": JSON.stringify(admin)
    },
    body: JSON.stringify({ uid, ban })
  })
    .then(res => res.json())
    .then(() => loadUsers())
    .catch(() => alert("Action failed"));
}

/****************************
 * MAKE ADMIN
 ****************************/
function makeAdmin(uid) {
  fetch("http://localhost:5000/admin/make-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin": JSON.stringify(admin)
    },
    body: JSON.stringify({ uid })
  })
    .then(() => loadUsers())
    .catch(() => alert("Failed to promote user"));
}

/****************************
 * REMOVE ADMIN
 ****************************/
function removeAdmin(uid) {
  fetch("http://localhost:5000/admin/remove-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin": JSON.stringify(admin)
    },
    body: JSON.stringify({ uid })
  })
    .then(() => loadUsers())
    .catch(() => alert("Failed to remove admin"));
}

/****************************
 * INIT
 ****************************/
loadUsers();
