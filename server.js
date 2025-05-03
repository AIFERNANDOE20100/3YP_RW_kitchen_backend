const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

// Firebase Admin SDK Initialization
const serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoute");
app.use("/api/auth", authRoutes);

// Optional base route for health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
