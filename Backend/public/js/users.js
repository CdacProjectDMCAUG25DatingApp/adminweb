/****************************
 * AUTH CHECK
 ****************************/
const token = localStorage.getItem("adminToken");
const admin = JSON.parse(localStorage.getItem("admin"));

if (!token || !admin) {
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
    headers: { token }
  })
    .then(res => res.json())
    .then(data => {
      allUsers = data;
      renderUsers(data);
    })
    .catch(err => console.error("Load users error:", err));
}

/****************************
 * APPLY FILTERS
 ****************************/
function applyFilters() {
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const roleFilter = document.getElementById("roleFilter").value;
  const banFilter = document.getElementById("banFilter").value;

  const filtered = allUsers.filter(u => {
    const matchSearch =
      u.user_name.toLowerCase().includes(searchText) ||
      u.email.toLowerCase().includes(searchText);

    const matchRole = roleFilter === "all" || String(u.isAdmin) === roleFilter;

    const matchBan = banFilter === "all" || String(u.is_banned) === banFilter;

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

    /* =====================================
       BAN BUTTON LOGIC
    ===================================== */
    let banBtn = "-";

    const isSelf = u.uid === admin.uid;
    const isSuperAdmin = u.isAdmin === 2;
    const isBanned = u.is_banned === 1;

    // Allowed only if:
    // - not yourself
    // - not super admin
    if (!isSelf && !isSuperAdmin) {
      banBtn = isBanned
        ? `<button class="action-btn unban" onclick="toggleBan(${u.uid}, 0)">Unban</button>`
        : `<button class="action-btn ban" onclick="toggleBan(${u.uid}, 1)">Ban</button>`;
    }

    /* =====================================
       ADMIN ACTION LOGIC
    ===================================== */
    let adminAction = "-";

    if (admin.isAdmin === 2 && !isSelf && !isBanned) {
      if (u.isAdmin === 0) {
        adminAction = `
          <button class="action-btn promote" onclick="makeAdmin(${u.uid})">
            Make Admin
          </button>`;
      } else if (u.isAdmin === 1) {
        adminAction = `
          <button class="action-btn demote" onclick="removeAdmin(${u.uid})">
            Remove Admin
          </button>`;
      }
    }

    tbody.innerHTML += `
  <tr onclick="viewUser(${u.uid})" style="cursor:pointer">
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
      token
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
      token
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
      token
    },
    body: JSON.stringify({ uid })
  })
    .then(() => loadUsers())
    .catch(() => alert("Failed to remove admin"));
}

function viewUser(uid) {
  const modal = document.getElementById("userModal");
  const body = document.getElementById("modalBody");

  modal.style.display = "block";
  body.innerHTML = "<p>Loading...</p>";

  fetch(`http://localhost:5000/admin/reports/user/${uid}`, {
    headers: { token }
  })
    .then(res => res.json())
    .then(data => {
      body.innerHTML = buildUserProfileHTML(data, uid);
    })
    .catch(err => {
      body.innerHTML = "<p>Error loading user profile.</p>";
    });
}

function closeUserModal() {
  document.getElementById("userModal").style.display = "none";
}

window.onclick = function (e) {
  if (e.target.id === "userModal") closeUserModal();
};

function buildUserProfileHTML(data, uid) {
  const user = data.user?.[0] || {};
  const profile = data.profile?.[0] || {};
  const photos = data.photos || [];
  const prefs = data.preferences?.[0] || {};
  const blocked = data.blocked_user || [];
  const blockedBy = data.blocked_by_user || [];
  const swipes = data.swipes || [];
  const likes = data.likes || [];
  const reports = data.reports || [];

  const bannedText = user.is_banned ? "Banned" : "Active";

  return `
    <div class="user-section">
      <h3>Basic Information</h3>
      <p><b>Name:</b> ${user.user_name}</p>
      <p><b>Email:</b> ${user.email}</p>
      <p><b>Phone:</b> ${user.phone_number || "-"}</p>
      <p><b>Account Created:</b> ${new Date(user.created_at).toLocaleString()}</p>
      <p><b>Status:</b> <b>${bannedText}</b></p>

      <div class="action-area">
        ${user.is_banned
          ? `<button class="modal-btn btn-success" onclick="toggleBan(${uid}, 0)">Unban User</button>`
          : `<button class="modal-btn btn-danger" onclick="toggleBan(${uid}, 1)">Ban User</button>`
        }

        ${user.isAdmin === 0
          ? `<button class="modal-btn btn-warning" onclick="makeAdmin(${uid})">Make Admin</button>`
          : user.isAdmin === 1
          ? `<button class="modal-btn btn-warning" onclick="removeAdmin(${uid})">Remove Admin</button>`
          : ""
        }
      </div>
    </div>

    <div class="user-section">
      <h3>Profile Details</h3>
      <p><b>Gender:</b> ${profile.gender || "-"}</p>
      <p><b>DOB:</b> ${profile.dob || "-"}</p>
      <p><b>Location:</b> ${profile.location || "-"}</p>
      <p><b>Religion:</b> ${profile.religion || "-"}</p>
      <p><b>Education:</b> ${profile.education || "-"}</p>
      <p><b>Bio:</b> ${profile.bio || "-"}</p>
    </div>

    <div class="user-section">
      <h3>Photos</h3>
      <div class="photo-grid">
        ${
          photos.length
            ? photos
                .map(
                  p =>
                    `<img src="http://localhost:4000/profilePhotos/${p.photo_url}" alt="Photo">`
                )
                .join("")
            : "<p>No photos uploaded</p>"
        }
      </div>
    </div>

    <div class="user-section">
      <h3>Preferences</h3>
      <pre>${JSON.stringify(prefs, null, 2)}</pre>
    </div>

    <div class="user-section">
      <h3>Blocked Users</h3>
      ${
        blocked.length
          ? blocked.map(b => `<p>Blocked → ${b.user_name}</p>`).join("")
          : "<p>None</p>"
      }
    </div>

    <div class="user-section">
      <h3>Blocked By</h3>
      ${
        blockedBy.length
          ? blockedBy.map(b => `<p>Blocked By → ${b.user_name}</p>`).join("")
          : "<p>None</p>"
      }
    </div>

    <div class="user-section">
      <h3>Recent Swipes</h3>
      <pre>${JSON.stringify(swipes, null, 2)}</pre>
    </div>

    <div class="user-section">
      <h3>Likes & Matches</h3>
      <pre>${JSON.stringify(likes, null, 2)}</pre>
    </div>

    <div class="user-section">
      <h3>Reports Against User</h3>
      ${
        reports.length
          ? reports
              .map(
                r => `<p>#${r.report_id} → ${r.reason_name} (${r.status})</p>`
              )
              .join("")
          : "<p>No reports</p>"
      }
    </div>
  `;
}


/****************************
 * INIT
 ****************************/
loadUsers();
