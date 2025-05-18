const axios = require("axios");
const apiKey = process.env.FIREBASE_API_KEY;

const signInWithEmailAndPassword = async (email, password) => {
  const response = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      email,
      password,
      returnSecureToken: true,
    }
  );
  return response.data;
};

module.exports = { signInWithEmailAndPassword };
