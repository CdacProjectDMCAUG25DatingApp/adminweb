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
 * LOAD REPORTS
 ****************************/
document.addEventListener("DOMContentLoaded", loadReports);

function loadReports() {
  const tbody = document.getElementById("reportsTableBody");

  fetch("http://localhost:5000/admin/reports", {
    headers: { token }
  })
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = "";

      if (!data.length) {
        tbody.innerHTML = `
          <tr><td colspan="7" style="text-align:center;padding:20px;">No reports found</td></tr>
        `;
        return;
      }

      data.forEach(r => {
        tbody.innerHTML += `
    <tr onclick="viewUser(${r.reported_uid})" style="cursor:pointer">
      <td>${r.report_id}</td>
      <td>${r.reported_name} (${r.reported_email})</td>
      <td>${r.final_reason}</td>
      <td>
        <span class="badge ${r.status === "resolved" ? "badge-yes" :
            r.status === "in_review" ? "badge-warning" :
              "badge-no"
          }">${r.status}</span>
      </td>
      <td>${new Date(r.timestamp).toLocaleString()}</td>
      <td>
        <button class="action-btn" onclick="event.stopPropagation(); viewUser(${r.reported_uid})">
          View
        </button>
      </td>
    </tr>
  `;
      });
    });
}

function markResolved(id) {
  fetch("http://localhost:5000/admin/reports/resolve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token
    },
    body: JSON.stringify({ report_id: id })
  }).then(() => loadReports());
}

function markInReview(id) {
  fetch("http://localhost:5000/admin/reports/review", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token
    },
    body: JSON.stringify({ report_id: id })
  }).then(() => loadReports());
}

function banUser(uid) {
  fetch("http://localhost:5000/admin/ban-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token
    },
    body: JSON.stringify({ uid, ban: 1 })
  }).then(() => loadReports());
}

document.addEventListener("click", (e) => {
  const row = e.target.closest("tr[data-uid]");
  if (row) openUserProfile(row.dataset.uid);
});

function viewUser(uid) {
  const modal = document.getElementById("userModal");
  const body = document.getElementById("modalBody");
  body.innerHTML = "<p>Loading...</p>";
  modal.style.display = "block";

  fetch(`http://localhost:5000/admin/reports/user/${uid}`, {
    headers: { token: localStorage.getItem("adminToken") }
  })
    .then(res => res.json())
    .then(data => {
      body.innerHTML = buildUserProfileHTML(data);
    })
    .catch(err => {
      body.innerHTML = "<p>Error loading profile</p>";
    });
}

function closeUserModal() {
  document.getElementById("userModal").style.display = "none";
}

window.onclick = function (e) {
  if (e.target.id === "userModal") closeUserModal();
};

function buildUserProfileHTML(data) {
  const user = data.user?.[0];
  const profile = data.profile?.[0];
  const prefs = data.preferences?.[0];
  const photos = data.photos || [];
  const blocks = data.blocked_user || [];
  const blocksBy = data.blocked_by_user || [];
  const swipes = data.swipes || [];
  const likes = data.likes || [];
  const reports = data.reports || [];

  return `
    <div class="user-block">
      <h3>Basic Info</h3>
      <p><b>Name:</b> ${user?.user_name}</p>
      <p><b>Email:</b> ${user?.email}</p>
      <p><b>Phone:</b> ${user?.phone_number || "-"}</p>
      <p><b>Account Created:</b> ${new Date(user?.created_at).toLocaleString()}</p>
      <p><b>Status:</b> ${user?.is_banned ? "Banned" : "Active"}</p>
    </div>

    <div class="user-block">
      <h3>Profile Info</h3>
      <p><b>Gender:</b> ${profile?.gender || "-"}</p>
      <p><b>DOB:</b> ${profile?.dob || "-"}</p>
      <p><b>Location:</b> ${profile?.location || "-"}</p>
      <p><b>Religion:</b> ${profile?.religion || "-"}</p>
      <p><b>Education:</b> ${profile?.education || "-"}</p>
      <p><b>Bio:</b> ${profile?.bio || "-"}</p>
    </div>

    <div class="user-block">
      <h3>Photos</h3>
      <div class="photo-grid">
        ${photos
          .map(
            (p) => `<img src="http://localhost:4000/profilePhotos/${p.photo_url}" />`
          )
          .join("")}
      </div>
    </div>

    <div class="user-block">
      <h3>Preferences</h3>
      <pre>${JSON.stringify(prefs, null, 2)}</pre>
    </div>

    <div class="user-block">
      <h3>Blocked Users</h3>
      ${blocks.length === 0 ? "<p>None</p>" : blocks.map(b => `<p>Blocked → ${b.user_name}</p>`).join("")}
    </div>

    <div class="user-block">
      <h3>Blocked By</h3>
      ${blocksBy.length === 0 ? "<p>None</p>" : blocksBy.map(b => `<p>Blocked By → ${b.user_name}</p>`).join("")}
    </div>

    <div class="user-block">
      <h3>Recent Swipes (last 50)</h3>
      <pre>${JSON.stringify(swipes, null, 2)}</pre>
    </div>

    <div class="user-block">
      <h3>Likes & Matches (last 50)</h3>
      <pre>${JSON.stringify(likes, null, 2)}</pre>
    </div>

    <div class="user-block">
      <h3>Reports Against User</h3>
      ${reports.length === 0 ? "<p>No reports</p>" :
        reports.map(r => `<p>#${r.report_id} → ${r.reason_name} (${r.status})</p>`).join("")
      }
    </div>
  `;
}

