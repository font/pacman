var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
})

router.get('/list', function(req, res, next) {
    res.send('get highscore list');
});

router.post('/add', function(req, res, next) {
    res.send('post highscore add');
});

module.exports = router;
