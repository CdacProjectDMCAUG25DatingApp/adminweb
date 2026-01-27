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
 * LOAD REPORTS
 ****************************/
document.addEventListener("DOMContentLoaded", loadReports);

function loadReports() {
  const tbody = document.getElementById("reportsTableBody");

  fetch("http://localhost:5000/admin/reports", {
    headers: {
      "x-admin": JSON.stringify(admin)
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    })
    .then(data => {
      tbody.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center;padding:20px;">
              No reports found
            </td>
          </tr>
        `;
        return;
      }

      data.forEach(r => {
        tbody.innerHTML += `
          <tr>
            <td>${r.report_id}</td>
            <td>${r.reported_user || "-"}</td>
            <td>${r.reason}</td>
            <td>
              <span class="badge ${
                r.status === "resolved" ? "badge-yes" : "badge-no"
              }">
                ${r.status}
              </span>
            </td>
            <td>${new Date(r.timestamp).toLocaleString()}</td>
            <td>
              <button class="action-btn">View</button>
            </td>
          </tr>
        `;
      });
    })
    .catch(() => {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:20px;">
            Error loading reports
          </td>
        </tr>
      `;
    });
}
