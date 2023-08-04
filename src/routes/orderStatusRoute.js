const express = require('express');
const route = express.Router();
const {readyToPickUp} = require('../controllers/sellerController')

route.put('/redayToPickup/:id',readyToPickUp)


module.exports = route