const express = require('express');
const { signupRestaurant, loginRestaurant, getRestaurantEntities, getRestaurantMenu, getRestaurantMenuRobot, deleteMenuItem } = require('../controllers/restaurantController');

const router = express.Router();

router.post('/signup', signupRestaurant);
router.post('/login', loginRestaurant);
router.get("/:restaurantId/entities", getRestaurantEntities);
router.get('/:restaurantId/menu', getRestaurantMenu);
router.get('/:restaurantId/menuRobot', getRestaurantMenuRobot);
router.delete('/:restaurantId/menu/:itemId', deleteMenuItem);

module.exports = router;
