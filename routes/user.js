var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var ObjectId = require('mongodb').ObjectId;

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date());
    next();
})

router.get('/id', function(req, res, next) {
    console.log('[get user id]');
    const db = req.app.locals.db;

    // Insert user ID and return back generated ObjectId
    var userId = 0;
    db.collection('userstats').insertOne({
        date: Date()
    }, {
       w: 'majority',
       j: true,
       wtimeout: 10000
    }, function(err, result) {
       if (err) {
           console.log('failed to insert new user ID err =', err);
       } else {
           userId = result.insertedId;
           console.log('Successfully inserted new user ID = ', userId);
       }

       res.json(userId);
    });

});

router.post('/stats', urlencodedParser, function(req, res, next) {
    console.log('[post stats add]\n',
                ' body =', req.body, '\n',
                ' host =', req.headers.host,
                ' user-agent =', req.headers['user-agent'],
                ' referer =', req.headers.referer);

    var userScore = parseInt(req.body.score, 10),
        userLevel = parseInt(req.body.level, 10),
        userLives = parseInt(req.body.lives, 10),
        userET = parseInt(req.body.elapsedTime, 10);

    const db = req.app.locals.db;
    db.collection('userstats').updateOne({
            _id: new ObjectId(req.body.userId),
        }, { $set: {
                zone: req.body.zone,
                score: userScore,
                level: userLevel,
                lives: userLives,
                elapsedTime: userET,
                date: Date(),
                referer: req.headers.referer,
                user_agent: req.headers['user-agent'],
                hostname: req.hostname,
                ip_addr: req.ip
           }, $inc: {
                updateCounter: 1
           }
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
                console.log('Successfully updated user stats');
                returnStatus = 'success';
            }

            res.json({
                rs: returnStatus
            });
        });
});

router.get('/stats', function(req, res, next) {
    console.log('[get userstats]');

    const db = req.app.locals.db;
    var col = db.collection('userstats');
    // Find all elements where the score field exists to avoid
    // undefined values
    col.find({ score: {$exists: true}}).sort([['_id', 1]]).toArray(function(err, docs) {
        var result = [];
        if (err) {
            console.log(err);
        }

        docs.forEach(function(item, index, array) {
            result.push({
                            zone: item['zone'],
                            score: item['score'],
                            level: item['level'],
                            lives: item['lives'],
                            et: item['elapsedTime'],
                            txncount: item['updateCounter']
            });
        });

        res.json(result);
    });
});


module.exports = router;
