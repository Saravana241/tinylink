const express = require('express');
const healthRoutes = require('./healthRoutes');
const { router: linkRoutes } = require('./linkRoutes');
const LinkController = require('../controllers/linkController');

const router = express.Router();

// Health check route
router.use(healthRoutes);

// API routes (prefixed with /api)
router.use('/api', linkRoutes);

// Redirect route - MUST BE THE LAST ROUTE
router.get('/:code', LinkController.redirectLink);

module.exports = router;