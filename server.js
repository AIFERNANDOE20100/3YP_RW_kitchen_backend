const express = require("express");
const cors = require("cors");
const WebSocket = require('ws');
const awsIot = require("aws-iot-device-sdk");
const AWS = require('aws-sdk');
require("dotenv").config();

// Initialize Firebase Admin SDK
require("./firebase/firebaseConfig");
const { db } = require("./firebase/firebaseConfig"); // Make sure to export db from firebaseConfig
const admin = require('firebase-admin');

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

// Function to process idToken and generate authentication credentials
const processIdToken = async (idToken) => {
  try {
    // Verify the idToken using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;
    const localId = decodedToken.uid;

    console.log(`Processing authentication for email: ${email}`);

    // Configure AWS region and temporary credentials from Cognito Identity Pool
    AWS.config.region = process.env.AWS_REGION;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: process.env.AWS_IDENTITY_POOL_ID,
      Logins: {
        [`securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}`]: idToken,
      },
    });

    console.log("AWS credentials configured for robot authentication");

    // Fetch AWS temporary credentials
    await new Promise((resolve, reject) => {
      AWS.config.credentials.get(function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    const identityId = AWS.config.credentials.identityId;
    console.log("Fetched AWS Identity ID for robot:", identityId);

    // === Step: Ensure IoT policy is attached to this Identity ID ===
    const iot = new AWS.Iot();
    const policyName = process.env.AWS_IOT_POLICY_NAME;

    try {
      const attached = await iot
        .listAttachedPolicies({ target: identityId })
        .promise();
      console.log("Attached policies checked for robot");
      const alreadyAttached = attached.policies.some(
        (policy) => policy.policyName === policyName
      );

      if (!alreadyAttached) {
        console.log(`Policy not attached, attaching policy: ${policyName}`);
        await iot
          .attachPolicy({
            policyName: policyName,
            target: identityId,
          })
          .promise();
        console.log("IoT policy attached successfully for robot");
      } else {
        console.log("IoT policy already attached for robot");
      }
    } catch (err) {
      console.error("Error checking/attaching IoT policy for robot:", err);
      throw new Error("Failed to ensure IoT permissions");
    }

    // === Step: Fetch Firestore data for user ===
    const snapshot = await db
      .collection("employees")
      .where("email", "==", email)
      .get();
    let restaurantId = null;

    if (!snapshot.empty) {
      restaurantId = snapshot.docs[0].data().restaurantId || null;
    }

    // Return the complete authentication data
    return {
      message: "Authentication successful",
      user: {
        uid: localId,
        email,
        token: idToken,
        restaurantId,
        awsAccessKey: AWS.config.credentials.accessKeyId,
        awsSecretKey: AWS.config.credentials.secretAccessKey,
        awsSessionToken: AWS.config.credentials.sessionToken,
        awsRegion: process.env.AWS_REGION,
        awsHost: process.env.AWS_IOT_ENDPOINT,
        topic: `robot/${identityId}/control`, // dynamically include identityId in the topic string
      },
    };
  } catch (error) {
    console.error("Error processing idToken:", error);
    throw error;
  }
};

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
    "cert/1c0e76c62d58f716b82ae99a257860aa55b29e4aea5470b92c3eefcea8daae3b-private.pem.key",
  certPath:
    "./cert/1c0e76c62d58f716b82ae99a257860aa55b29e4aea5470b92c3eefcea8daae3b-certificate.pem.crt",
  caPath: "./cert/AmazonRootCA1.pem",
  clientId: `myNodeSubscriber-${Date.now()}`,
  host: "a2xhp106oe6s98-ats.iot.ap-southeast-2.amazonaws.com",
});

// MQTT connection handlers
device.on('connect', () => {
  console.log('Connected to AWS IoT MQTT');
  device.subscribe('robot/connect');
  console.log('Subscribed to robot/connect topic');
});

device.on('message', async (topic, payload) => {
  console.log('Received message:', topic);
  if (topic === 'robot/connect') {
    try {
      const { robotId, idToken, timestamp } = JSON.parse(payload.toString());
      
      if (connections.has(robotId)) {
        const ws = connections.get(robotId);
        
        try {
          // Process the idToken to get full authentication credentials
          const authData = await processIdToken(idToken);
          
          // Send the complete authentication data to the robot
          ws.send(JSON.stringify({
            type: 'connect',
            timestamp,
            ...authData // This includes message, user object with all credentials
          }));
          
          console.log(`Sent complete auth credentials to robot: ${robotId}`);
        } catch (authError) {
          console.error(`Authentication error for robot ${robotId}:`, authError);
          
          // Send error message to robot
          ws.send(JSON.stringify({
            type: 'connect_error',
            timestamp,
            error: 'Authentication failed',
            details: authError.message
          }));
        }
      } else {
        console.log(`No active connection for robot: ${robotId}`);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }
});

device.on('error', (error) => {
  console.error('AWS IoT connection error:', error);
});

device.on('offline', () => {
  console.log('AWS IoT connection offline');
});

device.on('reconnect', () => {
  console.log('AWS IoT reconnecting...');
});