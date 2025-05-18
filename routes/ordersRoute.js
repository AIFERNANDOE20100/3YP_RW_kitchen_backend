const express = require("express");
const router = express.Router();
const orderService = require("../services/orderService");

router.get("/:restaurantId/all", async (req, res) => {
  try {
    const orders = await orderService.getAllOrders(req.params.restaurantId);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/:restaurantId/today", async (req, res) => {
  try {
    const orders = await orderService.getOrdersByRange("today", req.params.restaurantId);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching today orders:", error);
    res.status(500).json({ error: "Failed to fetch today’s orders" });
  }
});

router.get("/:restaurantId/week", async (req, res) => {
  try {
    const orders = await orderService.getOrdersByRange("week", req.params.restaurantId);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching week orders:", error);
    res.status(500).json({ error: "Failed to fetch this week’s orders" });
  }
});

router.get("/:restaurantId/month", async (req, res) => {
  try {
    const orders = await orderService.getOrdersByRange("month", req.params.restaurantId);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching month orders:", error);
    res.status(500).json({ error: "Failed to fetch this month’s orders" });
  }
});

router.get("/:restaurantId/active", async (req, res) => {
  try {
    const orders = await orderService.getActiveOrders(req.params.restaurantId);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching active orders:", error);
    res.status(500).json({ error: "Failed to fetch active orders" });
  }
});

module.exports = router;
