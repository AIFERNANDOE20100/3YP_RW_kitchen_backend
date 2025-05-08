const express = require('express');
const { signupRestaurant, loginRestaurant, getRestaurantEntities, getRestaurantMenu } = require('../controllers/restaurantController');

const router = express.Router();

router.post('/signup', signupRestaurant);
router.post('/login', loginRestaurant);
router.get("/:restaurantId/entities", getRestaurantEntities);
router.get('/:restaurantId/menu', getRestaurantMenu);

module.exports = router;
