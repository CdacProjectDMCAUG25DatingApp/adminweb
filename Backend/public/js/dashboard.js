const stored = JSON.parse(localStorage.getItem("admin"));

if (!stored) {
  alert("Not logged in");
  window.location.href = "login.html";
}

/* ✅ NORMALIZE ADMIN OBJECT */
const admin = stored.admin ? stored.admin : stored;

/* ================= LOAD DASHBOARD ================= */
fetch("http://localhost:5000/admin/dashboard-stats", {
  headers: {
    "x-admin": JSON.stringify(admin)
  }
})
  .then(res => res.json())
  .then(data => {
    document.getElementById("totalUsers").innerText = data.totalUsers || 0;
    document.getElementById("activeUsers").innerText = data.activeUsers || 0;
    document.getElementById("bannedUsers").innerText = data.bannedUsers || 0;
    document.getElementById("adminUsers").innerText = data.adminUsers || 0;
  })
  .catch(err => {
    console.error("Dashboard error:", err);
  });
