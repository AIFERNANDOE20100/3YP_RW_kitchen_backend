const { auth, db } = require("../firebase/firebaseConfig");

// GET /employee/restaurants
exports.getRestaurantList = async (req, res) => {
  try {
    const snapshot = await db.collection("restaurants").get();
    const restaurants = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
    res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    res.status(500).json({ message: "Failed to load restaurants" });
  }
};

// POST /employee/signup
exports.signupEmployee = async (req, res) => {
  const { name, email, password, restaurantId } = req.body;

  if (!name || !email || !password || !restaurantId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const restaurantDoc = await db.collection("restaurants").doc(restaurantId).get();
    if (!restaurantDoc.exists) {
      return res.status(400).json({ message: "Invalid restaurant selected" });
    }

    const existingUser = await auth.getUserByEmail(email).catch(() => null);
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const userRecord = await auth.createUser({ email, password, displayName: name });

    await db.collection("employees").doc(userRecord.uid).set({
      name,
      email,
      restaurantId,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Employee registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: error.message || "Signup failed" });
  }
};
