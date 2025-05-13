const { auth, db } = require('../firebase/firebaseConfig');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.signupRestaurant = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password || !phone || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create Firebase Auth User
    const existingUser = await auth.getUserByEmail(email).catch(() => null);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
        
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Store additional info in Firestore
    await db.collection('restaurants').doc(userRecord.uid).set({
      name,
      email,
      phone,
      address,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ message: 'Restaurant registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: error.message || 'Signup failed' });
  }
};

exports.loginRestaurant = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await auth.getUserByEmail(email);
    const customToken = await auth.createCustomToken(user.uid);

    const snapshot = await db.collection("restaurants").where("email", "==", email).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const doc = snapshot.docs[0];
    const restaurantId = doc.id;

    // Create restaurantToken using JWT
    const restaurantToken = jwt.sign(
      { restaurantId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token: customToken,
      restaurantToken,
      uid: user.uid,
      email: user.email,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({ message: 'Invalid email or password' });
  }
};

// Get all employees and robots for a given restaurant
exports.getRestaurantEntities = async (req, res) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return res.status(400).json({ message: "Restaurant ID is required" });
  }

  try {
    // Fetch employees and map only names
    const employeeSnap = await db.collection("employees")
      .where("restaurantId", "==", restaurantId).get();
    const employees = employeeSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));

    // Fetch robots and map only names
    const robotSnap = await db.collection("robots")
      .where("restaurantId", "==", restaurantId).get();
    const robots = robotSnap.docs.map(doc => ({ id: doc.id, name: doc.data().robotName }));

    res.status(200).json({ employees, robots });
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getRestaurantMenu = async (req, res) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return res.status(400).json({ message: 'Restaurant ID is required' });
  }

  try {
    const menuSnap = await db.collection('menu')
      .where('restaurantId', '==', restaurantId)
      .get();

    const menuItems = menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ menu: menuItems });
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.status(500).json({ message: 'Failed to fetch menu' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    // Delete the menu item by UID (itemId)
    await db.collection('menu').doc(itemId).delete();
    res.status(200).json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete menu item' });
  }
};
