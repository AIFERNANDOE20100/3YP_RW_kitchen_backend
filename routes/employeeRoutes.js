const express = require("express");
const { signupEmployee, getRestaurantList } = require("../controllers/employeeController");

const router = express.Router();

router.post("/signup", signupEmployee);
router.get("/restaurants", getRestaurantList); // For dropdown

module.exports = router;
