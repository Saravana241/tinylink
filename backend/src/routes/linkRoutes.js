const express = require('express');
const LinkController = require('../controllers/linkController');
const { validateCreateLink } = require('../middleware/validation');

const router = express.Router();

// API routes
router.post('/links', validateCreateLink, LinkController.createLink);
router.get('/links', LinkController.getAllLinks);
router.get('/links/:code', LinkController.getLinkStats);
router.delete('/links/:code', LinkController.deleteLink);

// Redirect route (keep this at the end to avoid conflicts)
router.get('/:code', LinkController.redirectLink);

module.exports = router;