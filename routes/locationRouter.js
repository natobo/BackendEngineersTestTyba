const express = require("express");
const locationController = require("./../controllers/locationController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/getRestaurants", locationController.getRestLatLng);
// Vigila que siga logueado
router.use(authController.protect);

module.exports = router;