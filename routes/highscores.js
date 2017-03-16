var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

// create application/json parser
//var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now());
    next();
})

router.get('/list', urlencodedParser, function(req, res, next) {
    res.send('get highscore list');
    console.log(req.body);
});

router.post('/add', urlencodedParser, function(req, res, next) {
    console.log('post highscore add');
    console.log(req.body);
    console.log('host=%s user-agent=%s referer=%s',
                req.headers.host, req.headers['user-agent'],
                req.headers.referer);

    var userScore = parseInt(req.body.score, 10),
        userLevel = parseInt(req.body.level, 10);

    const db = req.app.locals.db;
    db.collection('highscore').insertOne({
            name: req.body.name,
            zone: req.body.zone,
            score: userScore,
            level: userLevel,
            date: (new Date()).toString(),
            referer: req.headers.referer,
            user_agent: req.headers['user-agent'],
            hostname: req.hostname,
            ip_addr: req.ip
        }, {
            w: 'majority',
            j: true,
            wtimeout: 10000
        }, function(err, result) {
            var returnStatus = '';

            if (err) {
                console.log(err);
                returnStatus = 'error';
            } else {
                console.log('Successfully inserted highscore');
                returnStatus = 'success';
            }

            res.json({
                name: req.body.name,
                zone: req.body.zone,
                score: userScore,
                level: userLevel,
                rs: returnStatus
            });
        });
});

module.exports = router;
