const { db } = require('../firebase/firebaseConfig');

// POST /api/restaurant/:restaurantId/add-menu
exports.addMenuItem = async (req, res) => {
  const { name, category, Includings, price, imageUrl, restaurantId } = req.body;

  if (!name || !category || !Includings || !price || !imageUrl || !restaurantId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify the ID token
  try {
    await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error("ID token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Get the highest existing menuNumber for the restaurant
    const menuSnap = await db.collection("menu")
      .where("restaurantId", "==", restaurantId)
      .orderBy("menuNumber", "desc")
      .limit(1)
      .get();

    let nextMenuNumber = 1;

    if (!menuSnap.empty) {
      const highestMenuNumber = menuSnap.docs[0].data().menuNumber;
      nextMenuNumber = highestMenuNumber + 1;
    }

    // Add new menu item
    await db.collection("menu").add({
      name,
      category,
      Includings,
      price,
      imageUrl,
      restaurantId,
      menuNumber: nextMenuNumber,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Menu item added successfully", menuNumber: nextMenuNumber });
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ message: "Server error during adding menu item" });
  }
};
