// =========================
// AUTH CHECK
// =========================
const token = localStorage.getItem("adminToken");
const admin = JSON.parse(localStorage.getItem("admin"));

if (!token || !admin) {
  alert("Not logged in");
  window.location.href = "login.html";
}

// =========================
// LOAD FEEDBACK
// =========================
function loadFeedback() {
  fetch("http://localhost:5000/admin/feedback", {
    headers: { token }
  })
    .then(res => res.json())
    .then(renderFeedback)
    .catch(err => console.error("Feedback load error:", err));
}

// =========================
// RENDER FEEDBACK
// =========================
function renderFeedback(list) {
  const tbody = document.getElementById("feedbackTableBody");
  tbody.innerHTML = "";

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:20px;">
          No feedback submitted yet
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(f => {
    const statusBadge =
      f.status === "resolved"
        ? "<span class='badge badge-yes'>Resolved</span>"
        : f.status === "in_progress"
        ? "<span class='badge badge-warning'>In Progress</span>"
        : "<span class='badge badge-no'>Pending</span>";

    tbody.innerHTML += `
      <tr>
        <td>${f.feedback_id}</td>
        <td>${f.user_name || "Anonymous"}</td>
        <td>${f.subject || "-"}</td>
        <td style="max-width:350px;">${f.details || "-"}</td>
        <td>${statusBadge}</td>
        <td>${new Date(f.timestamp).toLocaleString()}</td>
      </tr>
    `;
  });
}

// =========================
// INIT
// =========================
loadFeedback();
