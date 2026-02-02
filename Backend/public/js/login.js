function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch("http://localhost:5000/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
    .then(async res => {
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json();
    })
    .then(data => {
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      document.getElementById("error").innerText = err.message || "Login failed";
    });
}
