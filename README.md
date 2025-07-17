# Kitchen Backend - Order API

## Overview
This module provides RESTful API endpoints to fetch order details for restaurants. It supports retrieving all orders, as well as filtering orders by specific time ranges (today, week, month) and active status.

## Features
- Retrieve all orders for a given restaurant
- Retrieve orders placed today, this week, or this month
- Retrieve active orders currently being processed
- Returns responses in JSON format for easy integration
- Includes proper error handling with appropriate status codes

## API Endpoints

### Get All Orders
- Method: `GET`
- Path: `/:restaurantId/all`
- Description: Returns all orders for the specified restaurant.
- Parameters:
  - `restaurantId` (string) — Unique identifier of the restaurant.
- Response: JSON array of order objects.

### Get Today's Orders
- Method: `GET`
- Path: `/:restaurantId/today`
- Description: Returns orders placed today for the specified restaurant.
- Parameters:
  - `restaurantId` (string)
- Response: JSON array of order objects.

### Get This Week's Orders
- Method: `GET`
- Path: `/:restaurantId/week`
- Description: Returns orders placed within the current week.
- Parameters:
  - `restaurantId` (string)
- Response: JSON array of order objects.

### Get This Month's Orders
- Method: `GET`
- Path: `/:restaurantId/month`
- Description: Returns orders placed within the current month.
- Parameters:
  - `restaurantId` (string)
- Response: JSON array of order objects.

### Get Active Orders
- Method: `GET`
- Path: `/:restaurantId/active`
- Description: Returns active orders currently being processed.
- Parameters:
  - `restaurantId` (string)
- Response: JSON array of order objects.

## Error Handling
- In case of any server-side error, responses will return an HTTP status code `500` along with a JSON object containing an error message relevant to the requested endpoint.

## Setup & Usage
1. Implement the `orderService` module with the following methods:
   - `getAllOrders(restaurantId)`
   - `getOrdersByRange(range, restaurantId)` — where `range` is `"today"`, `"week"`, or `"month"`
   - `getActiveOrders(restaurantId)`
2. Import and use the router in your Express application:
   ```js
   const ordersRouter = require('./routes/orders');
   app.use('/api/orders', ordersRouter);
