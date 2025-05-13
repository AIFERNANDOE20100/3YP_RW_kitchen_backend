const admin = require("firebase-admin");
const db = admin.firestore();

// Helper to format orders
const formatOrder = (doc) => {
  const data = doc.data();
  return {
    orderId: doc.id,
    orderNo: data.orderNo || null,
    menuItemNo: data.menuItemNo || null,
    itemName: data.itemName || null,
    specialInstructions: data.specialInstructions || null,
    tableNumber: data.tableNumber || null,
    status: data.status || null,
    createdAt: data.createdAt?.toDate() || null,
  };
};

const getAllOrders = async () => {
  const snapshot = await db.collection("orders").get();
  return snapshot.docs.map(formatOrder);
};

const getOrdersByRange = async (range) => {
  const now = new Date();
  let startDate;

  if (range === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === "week") {
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  } else if (range === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    throw new Error("Invalid range type");
  }

  const snapshot = await db
    .collection("orders")
    .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(startDate))
    .get();

  return snapshot.docs.map(formatOrder);
};

const getActiveOrders = async () => {
  const snapshot = await db
    .collection("orders")
    .where("status", "==", "active")
    .get();

  return snapshot.docs.map(formatOrder);
};

module.exports = {
  getAllOrders,
  getOrdersByRange,
  getActiveOrders,
};
