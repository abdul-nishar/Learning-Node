const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);
// This route is for rendering the base pug template
router.get('/', viewController.getOverview);

router.get('/tours/:slug', viewController.getTour);

router.get('/login', viewController.getLoginForm);

module.exports = router;
