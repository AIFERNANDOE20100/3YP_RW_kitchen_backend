const { db } = require("../firebase/firebaseConfig");

exports.signupRobot = async (req, res) => {
  const { robotId, restaurantId } = req.body;

  if (!robotId || !restaurantId) {
    return res.status(400).json({ message: "Robot ID and Restaurant ID are required" });
  }

  try {
    // Check if robot already exists
    const robotSnapshot = await db.collection("robots").where("robotId", "==", robotId).get();
    if (!robotSnapshot.empty) {
      return res.status(400).json({ message: "Robot ID already exists" });
    }

    // Optional: Get restaurant name using the restaurantId
    const restaurantDoc = await db.collection("restaurants").doc(restaurantId).get();
    if (!restaurantDoc.exists) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Create robot entry
    await db.collection("robots").add({
      robotId,
      restaurantId, // Save restaurantId for future lookups
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Robot registered successfully" });
  } catch (error) {
    console.error("Robot signup error:", error);
    res.status(500).json({ message: "Error occurred during robot signup" });
  }
};

// Controller function for handling robot login
exports.robotLogin = async (req, res) => {
    const { robotId } = req.body;

    // Check if robotId is provided
    if (!robotId) {
        return res.status(400).json({ message: "Robot ID is required" });
    }

    try {
        // Check if the robotId exists in Firestore
        const robotsRef = db.collection("robots");
        const querySnapshot = await robotsRef.where('robotId', '==', robotId).limit(1).get();

        if (querySnapshot.empty) {
          return res.status(404).json({ message: "Robot ID not found" });
        }
    
        const robotData = querySnapshot.docs[0].data();
        return res.status(200).json({ message: "Login successful", robot: robotData });

    } catch (error) {
        console.error("Error during robot login:", error);
        return res.status(500).json({ message: "Server error during login" });
    }
};
