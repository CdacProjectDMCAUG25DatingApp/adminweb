const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const db = require("./db");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(bodyParser.json());

/* =======================
   SERVE FRONTEND
======================= */
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

/* =======================
   API ROUTES
======================= */
app.use("/admin", adminRoutes);

/* =======================
   START SERVER
======================= */
const PORT = 5000;
app.listen(PORT, () => {
  console.log("✅ Server started on port " + PORT);
  console.log("✅ MySQL connected successfully");
});
