const express = require("express");
const { signupRobot, robotLogin } = require("../controllers/robotController");

const router = express.Router();

router.post("/signup", signupRobot);
router.post("/login", robotLogin);

module.exports = router;
