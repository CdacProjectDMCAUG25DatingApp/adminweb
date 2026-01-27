/****************************
 * AUTH
 ****************************/
const stored = JSON.parse(localStorage.getItem("admin"));
const admin = stored?.admin ? stored.admin : stored;

if (!admin) {
  alert("Not logged in");
  window.location.href = "login.html";
}

/****************************
 * HIDE MANAGE BUTTON FOR NON SUPER ADMIN
 ****************************/
document.addEventListener("DOMContentLoaded", () => {
  const manageBtn = document.getElementById("manageBtn");
  if (manageBtn && admin.isAdmin !== 2) {
    manageBtn.style.display = "none";
  }
});

/****************************
 * LOAD LOOKUPS (READ ONLY)
 ****************************/
function loadLookup() {
  const table = document.getElementById("lookupSelect").value;
  const tbody = document.getElementById("lookupTableBody");

  if (!table) {
    tbody.innerHTML =
      "<tr><td colspan='4'>Select a lookup</td></tr>";
    return;
  }

  fetch(`http://localhost:5000/admin/lookups/${table}`, {
    headers: {
      "x-admin": JSON.stringify(admin)
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then(data => {
      tbody.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML =
          "<tr><td colspan='4'>No data found</td></tr>";
        return;
      }

      data.forEach(row => {
        tbody.innerHTML += `
          <tr>
            <td>${row.id}</td>
            <td>${row.type_code}</td>
            <td>${row.name}</td>
            <td>
              ${
                row.active == 1
                  ? "<span class='badge badge-yes'>Active</span>"
                  : "<span class='badge badge-no'>Inactive</span>"
              }
            </td>
          </tr>
        `;
      });
    })
    .catch(() => {
      tbody.innerHTML =
        "<tr><td colspan='4'>Error loading data</td></tr>";
    });
}
