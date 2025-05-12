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
    // Validate restaurant exists
    const restaurantDoc = await db.collection("restaurants").doc(restaurantId).get();
    if (!restaurantDoc.exists) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Generate robotId and password
    const base = robotName.replace(/\s+/g, '').slice(0, 4).toUpperCase(); // Trim and use up to 4 chars
    const robotId = `${base}${generateRandomPart()}`;        // e.g. ROBOX8Y2
    const robotPassword = `${base}${generateRandomPart()}`;  // e.g. ROBOA2LQ

    // Save robot document
    await db.collection("robots").add({
      robotName,
      robotId,
      robotPassword,
      restaurantId,
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
    const robotData = robotDoc.data();

    // Check password match
    if (robotData.robotPassword !== password) {
      return res.status(401).json({ message: "Invalid robot password" });
    }

    // Successful login
    return res.status(200).json({
      message: "Login successful",
      robotId: robotData.robotId,
      restaurantId: robotData.restaurantId,
    });

  } catch (error) {
    console.error("Error during robot login:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};
