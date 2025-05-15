const express = require("express");
const {
  signupRobot,
  robotLogin,
  getRobotCredentials
} = require("../controllers/robotController");

const router = express.Router();

router.post("/signup", signupRobot);
router.post("/login", robotLogin);
router.get("/credentials", getRobotCredentials);

module.exports = router;
