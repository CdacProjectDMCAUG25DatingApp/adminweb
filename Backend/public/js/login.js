function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:5000/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
    .then(res => {
      if (!res.ok) {
        return res.text().then(msg => { throw new Error(msg); });
      }
      return res.json();
    })
    .then(data => {
      localStorage.setItem("admin", JSON.stringify(data.admin));
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      document.getElementById("error").innerText = err.message;
    });
}
