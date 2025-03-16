
const express = require('express');
const { getItemContact } = require('../controllers/contactController');

const router = express.Router();

// Public route
router.get('/:itemId', getItemContact);

module.exports = router;
