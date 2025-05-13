// const authService = require("../services/authService");

// const signup = async (req, res) => {
//   const { email, password } = req.body;
//   console.log("Signup request received");

//   try {
//     await authService.getUserByEmail(email);
//     return res.status(400).json({ error: "Email already in use" });
//   } catch {
//     try {
//       const userRecord = await authService.createUser(email, password);
//       return res.status(200).json({ message: "Signup successful", user: userRecord });
//     } catch (error) {
//       console.error("Error creating user:", error);
//       return res.status(500).json({ error: "Failed to create user" });
//     }
//   }
// };

// const login = async (req, res) => {
//   const { email } = req.body;
//   console.log("Login request received");

//   try {
//     const user = await authService.getUserByEmail(email);
//     const token = await authService.generateCustomToken(user.uid);
//     return res.status(200).json({
//       message: "Login successful",
//       user: {
//         uid: user.uid,
//         email: user.email,
//         token,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return res.status(401).json({ error: "Invalid email" });
//   }
// };

// module.exports = {
//   signup,
//   login,
// };
