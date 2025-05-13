const express = require("express");
const router = express.Router();
const orderService = require("../services/orderService");

router.get("/", async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/today", async (req, res) => {
  try {
    const orders = await orderService.getOrdersByRange("today");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching today orders:", error);
    res.status(500).json({ error: "Failed to fetch today’s orders" });
  }
});

router.get("/week", async (req, res) => {
  try {
    const orders = await orderService.getOrdersByRange("week");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching week orders:", error);
    res.status(500).json({ error: "Failed to fetch this week’s orders" });
  }
});

router.get("/month", async (req, res) => {
  try {
    const orders = await orderService.getOrdersByRange("month");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching month orders:", error);
    res.status(500).json({ error: "Failed to fetch this month’s orders" });
  }
});

router.get("/active", async (req, res) => {
  try {
    const orders = await orderService.getActiveOrders();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching active orders:", error);
    res.status(500).json({ error: "Failed to fetch active orders" });
  }
});

module.exports = router;
