const express = require('express');
const healthRoutes = require('./healthRoutes');
const linkRoutes = require('./linkRoutes');

const router = express.Router();

// Health check route
router.use(healthRoutes);

// API routes
router.use('/api', linkRoutes);

module.exports = router;