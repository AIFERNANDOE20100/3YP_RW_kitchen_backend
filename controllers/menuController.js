const { db } = require('../firebase/firebaseConfig');

exports.addMenuItem = async (req, res) => {
  const { category, name, Ingredients, imageUrl, restaurantId } = req.body;

  if (!category || !name || !Ingredients || !imageUrl || !restaurantId) {
    return res.status(400).json({ message: "All fields are required including restaurantId" });
  }

  try {
    const newItem = {
      category,
      name,
      Ingredients,
      imageUrl,
      restaurantId,
      createdAt: new Date()
    };

    const docRef = await db.collection('menuItems').add(newItem);

    res.status(201).json({ message: 'Menu item added successfully', id: docRef.id });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ message: 'Failed to add menu item' });
  }
};
