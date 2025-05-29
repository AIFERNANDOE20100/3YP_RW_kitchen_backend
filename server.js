const express = require("express");
const cors = require("cors");
const WebSocket = require('ws');
const awsIot = require("aws-iot-device-sdk");
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

// Create HTTP server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// WebSocket server setup
const wss = new WebSocket.Server({ server });
const connections = new Map();

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'register' && data.robotId) {
        connections.set(data.robotId, ws);
        console.log(`Registered WebSocket for robot: ${data.robotId}`);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    // Remove connection when closed
    for (const [robotId, socket] of connections.entries()) {
      if (socket === ws) {
        connections.delete(robotId);
        console.log(`Unregistered WebSocket for robot: ${robotId}`);
      }
    }
  });
});

// AWS IoT setup
const device = awsIot.device({
  keyPath:
    "./cert/567ac5f9b0348408455bfc91506042fe17270e042a0499705711a24c5c7a6883-private.pem.key",
  certPath:
    "./cert/567ac5f9b0348408455bfc91506042fe17270e042a0499705711a24c5c7a6883-certificate.pem.crt",
  caPath: "./cert/AmazonRootCA1.pem",
  clientId: `myNodeSubscriber-${Date.now()}`,
  host: "a2cdp9hijgdiig-ats.iot.ap-southeast-2.amazonaws.com",
});

// MQTT connection handlers
device.on('connect', () => {
  console.log('Connected to AWS IoT MQTT');
  device.subscribe('robot/connect');
  console.log('Subscribed to robot/connect topic');
});

device.on('message', (topic, payload) => {
  console.log('Received message:', topic);
  if (topic === 'robot/connect') {
    try {
      const { robotId, idToken, timestamp } = JSON.parse(payload.toString());
      
      if (connections.has(robotId)) {
        const ws = connections.get(robotId);
        ws.send(JSON.stringify({
          type: 'auth',
          idToken,
          timestamp
        }));
        console.log(`Sent auth token to robot: ${robotId}`);
      } else {
        console.log(`No active connection for robot: ${robotId}`);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }
});
