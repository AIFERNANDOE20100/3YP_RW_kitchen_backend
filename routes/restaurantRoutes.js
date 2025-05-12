const express = require('express');
const { signupRestaurant, loginRestaurant, getRestaurantEntities, getRestaurantMenu, deleteMenuItem } = require('../controllers/restaurantController');

const router = express.Router();

router.post('/signup', signupRestaurant);
router.post('/login', loginRestaurant);
router.get("/:restaurantId/entities", getRestaurantEntities);
router.get('/:restaurantId/menu', getRestaurantMenu);
router.delete('/:restaurantId/menu/:itemId', deleteMenuItem);

module.exports = router;
