const admin = require("firebase-admin");
const db = admin.firestore();

// Helper to format orders
const formatOrder = (doc) => {
  const data = doc.data();
  return {
    orderId: doc.id,
    orderNumber: data.orderNumber || null,
    tableNo: data.tableNo || null,
    status: data.status || null,
    createdAt: data.createdAt?.toDate() || null,
    restaurantId: data.restaurantId || null,
    robotId: data.robotId || null,
    userId: data.userId || null,
    totalQuantity: data.totalQuantity || null,
    items: Array.isArray(data.items)
      ? data.items.map(item => ({
          menuNumber: item.menuNumber || null,
          name: item.name || null,
          quantity: item.quantity || null,
          extraDetails: item.extraDetails || null,
        }))
      : [],
  };
};

const getAllOrders = async (restaurantId) => {
  const snapshot = await db.collection("orders")
    .where("restaurantId", "==", restaurantId)
    .get();
  return snapshot.docs.map(formatOrder);
};

const getOrdersByRange = async (range, restaurantId) => {
  const now = new Date();
  let startDate, endDate;

  if (range === "today") {
    // Set start and end of today in UTC
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  } else if (range === "week") {
    const day = now.getUTCDay(); // 0 (Sun) to 6 (Sat)
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day));
    endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  } else if (range === "month") {
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  } else {
    throw new Error("Invalid range type");
  }

  let query = db.collection("orders")
    .where("restaurantId", "==", restaurantId)
    .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(startDate));
  if (endDate) {
    query = query.where("createdAt", "<", admin.firestore.Timestamp.fromDate(endDate));
  }
  const snapshot = await query.get();
  return snapshot.docs.map(formatOrder);
};

const getActiveOrders = async (restaurantId) => {
  const snapshot = await db
    .collection("orders")
    .where("restaurantId", "==", restaurantId)
    .where("status", "==", "active")
    .get();

  return snapshot.docs.map(formatOrder);
};

module.exports = {
  getAllOrders,
  getOrdersByRange,
  getActiveOrders,
};
