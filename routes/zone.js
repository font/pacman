var http = require('http');
var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date());
    next();
})

router.get('/get', function(req, res, next) {
    console.log('[get zone]');

    // Set options to retrieve GCE zone for instance
    var options = {
        hostname: 'metadata.google.internal',
        port: 80,
        path: '/computeMetadata/v1/instance/zone',
        method: 'GET',
        timeout: 10000,
        headers: {
          'Metadata-Flavor': 'Google'
        }
    };

    var zone = 'UNKNOWN';

    var req = http.request(options, (zoneRes) => {
        console.log(`STATUS: ${zoneRes.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(zoneRes.headers)}`);
        zoneRes.setEncoding('utf8');
        zoneRes.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
            zone = chunk;
        });
        zoneRes.on('end', () => {
            console.log('No more data in response.');
            // get the zone substring in uppercase
            var zoneSplit = zone.split('/');
            zone = zoneSplit[zoneSplit.length - 1].toUpperCase();
            // respond with ZONE json data
            console.log(`ZONE: ${zone}`);
            res.json(zone);
        });
    });

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        // respond with ZONE json data
        console.log(`ZONE: ${zone}`);
        res.json(zone);
    });

    // End request
    req.end();
});

module.exports = router;
