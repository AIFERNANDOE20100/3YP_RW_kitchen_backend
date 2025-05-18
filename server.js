const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize Firebase Admin SDK
require("./firebase/firebaseConfig");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route imports
const restaurantRoutes = require("./routes/restaurantRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const robotRoutes = require("./routes/robotRoutes");
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require("./routes/ordersRoute");

// Route usage
app.use("/api/restaurant", restaurantRoutes, menuRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/robot", robotRoutes);
app.use("/api/orders", orderRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


