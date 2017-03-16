var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now());
    next();
})

router.get('/get', function(req, res, next) {
    res.send('get zone');
});

module.exports = router;
