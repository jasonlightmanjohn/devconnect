const express = require('express');
const router = express.Router();

// @router GET api/auth
// @desc Test route
// @access Public( no token needed )
router.get('/', (req, res) => res.send('Auth route'));

module.exports = router;
