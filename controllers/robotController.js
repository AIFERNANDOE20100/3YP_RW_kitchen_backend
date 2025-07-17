const { db } = require("../firebase/firebaseConfig");

// Helper function to generate a random 4-character string
const generateRandomPart = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

exports.signupRobot = async (req, res) => {
  const { robotName, restaurantId } = req.body;

  if (!robotName || !restaurantId) {
    return res.status(400).json({ message: "Robot name and restaurant ID are required" });
  }

  try {
    // Step 1: Check if the restaurant exists
    const restaurantDoc = await db.collection("restaurants").doc(restaurantId).get();
    if (!restaurantDoc.exists) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Step 2: Check for duplicate robotName under the same restaurant
    const existingSnapshot = await db
      .collection("robots")
      .where("restaurantId", "==", restaurantId)
      .where("robotName", "==", robotName)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return res.status(409).json({ message: "A robot with this name already exists for this restaurant." });
    }

    // Step 3: Generate robotId and robotPassword
    const base = robotName.replace(/\s+/g, '').slice(0, 4).toUpperCase();
    const robotId = `${base}${generateRandomPart()}`;
    const robotPassword = `${base}${generateRandomPart()}`;

    // Step 4: Save the robot to Firestore
    await db.collection("robots").add({
      robotName,
      robotId,
      robotPassword,
      restaurantId,
      status: "offline", // Default status
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Robot registered successfully",
      robotId,
      robotPassword,
    });

  } catch (error) {
    console.error("Robot signup error:", error);
    res.status(500).json({ message: "Error occurred during robot signup" });
  }
};

exports.robotLogin = async (req, res) => {
  const { robotId, password } = req.body;

  // Validate input
  if (!robotId || !password) {
    return res.status(400).json({ message: "Robot ID and password are required" });
  }

  try {
    // Query robot by robotId
    const robotsRef = db.collection("robots");
    const querySnapshot = await robotsRef.where("robotId", "==", robotId).limit(1).get();

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "Robot not found" });
    }

    const robotDoc = querySnapshot.docs[0];
    const robotDocId = robotDoc.id;
    const robotData = robotDoc.data();

    // Check password match
    if (robotData.robotPassword !== password) {
      return res.status(401).json({ message: "Invalid robot password" });
    }
    console.log("Robot login successful:", robotDocId);
    // Successful login
    return res.status(200).json({
      message: "Login successful",
      robotId: robotDoc.id,
      restaurantId: robotData.restaurantId,
    });

  } catch (error) {
    console.error("Error during robot login:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// Get robot details by robot name and restaurantId
exports.getRobotCredentials = async (req, res) => {
  const { robotName, restaurantId } = req.query;

  if (!robotName || !restaurantId) {
    return res.status(400).json({ message: "Robot name and restaurant ID are required" });
  }

  try {
    const snapshot = await db
      .collection("robots")
      .where("robotName", "==", robotName)
      .where("restaurantId", "==", restaurantId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Robot not found" });
    }

    const robot = snapshot.docs[0].data();

    return res.status(200).json({
      robotId: robot.robotId,
      robotPassword: robot.robotPassword,
    });
  } catch (error) {
    console.error("Error fetching robot credentials:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// // Exported controller function
// exports.connectRobot = async (req, res) => {
//   const { robotId, restaurantId } = req.body;

//   // Extract Firebase ID token from Authorization header
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Missing or invalid Authorization header" });
//   }

//   const idToken = authHeader.split(" ")[1];

//   try {
//     // Set AWS region and temporary credentials using Cognito Identity Pool
//     AWS.config.region = process.env.AWS_REGION;
//     AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//       IdentityPoolId: process.env.AWS_IDENTITY_POOL_ID,
//       Logins: {
//         [`securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}`]: idToken,
//       },
//     });

//     console.log("AWS credentials configured for robot connection");

//     // Fetch AWS temporary credentials
//     await new Promise((resolve, reject) => {
//       AWS.config.credentials.get(function (err) {
//         if (err) {
//           console.error("Failed to get AWS credentials:", err);
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });

//     const identityId = AWS.config.credentials.identityId;
//     console.log("Fetched AWS Identity ID:", identityId);

//     // Ensure the IoT policy is attached
//     const iot = new AWS.Iot();
//     const policyName = process.env.AWS_IOT_POLICY_NAME;

//     const attachedPolicies = await iot
//       .listAttachedPolicies({ target: identityId })
//       .promise();

//     const alreadyAttached = attachedPolicies.policies.some(
//       (policy) => policy.policyName === policyName
//     );

//     if (!alreadyAttached) {
//       console.log(`Attaching IoT policy ${policyName} to identity ${identityId}`);
//       await iot
//         .attachPolicy({
//           policyName: policyName,
//           target: identityId,
//         })
//         .promise();
//       console.log("IoT policy attached successfully");
//     } else {
//       console.log("IoT policy already attached");
//     }

//     // Respond with the required robot connection details
//     return res.status(200).json({
//       message: "Robot connected successfully",
//       user: {
//         token: idToken,
//         awsAccessKey: AWS.config.credentials.accessKeyId,
//         awsSecretKey: AWS.config.credentials.secretAccessKey,
//         awsSessionToken: AWS.config.credentials.sessionToken,
//         awsRegion: process.env.AWS_REGION,
//         awsHost: process.env.AWS_IOT_ENDPOINT,
//         topic: `robot/${identityId}/control`,
//       },
//     });
//   } catch (err) {
//     console.error("Robot connection error:", err);
//     return res.status(500).json({ error: "Failed to connect robot" });
//   }
// };
