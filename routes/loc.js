var http = require('http');
var express = require('express');
var router = express.Router();
var os = require('os');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date());
    next();
})

router.get('/metadata/get', function(req, res, next) {
    console.log('[get location metadata]');
    var h = getHost();
    getCloudMetadata(function(c, z) {
        console.log(`CLOUD: ${c}`);
        console.log(`ZONE: ${z}`);
        console.log(`HOST: ${h}`);
        res.json({
            cloud: c,
            zone: z,
            host: h
        });
    });
});

function getCloudMetadata(callback) {
    console.log('getCloudMetadata');
    // Try GCP first
    getGCPCloudMetadata(function(err, c, z) {
        if (err) {
            // Try AWS next
            getAWSCloudMetadata(function(err, c, z) {
                if (err) {
                    // Try Azure next
                    getAzureCloudMetadata(function(err, c, z) {
                        // Return result regardless of error
                        callback(c, z); // Running in Azure or unknown
                    });
                } else {
                    callback(c, z); // Running in AWS
                }
            });
        } else {
            callback(c, z); // Running in GCP
        }
    });

}

function getGCPCloudMetadata(callback) {
    console.log('getGCPCloudMetadata');
    // Set options to retrieve GCE zone for instance
    var gcpOptions = {
        hostname: 'metadata.google.internal',
        port: 80,
        path: '/computeMetadata/v1/instance/zone',
        method: 'GET',
        timeout: 10000,
        headers: {
          'Metadata-Flavor': 'Google'
        }
    };

    var cloudName = 'unknown',
        zone = 'unknown';

    var req = http.request(gcpOptions, (zoneRes) => {
        let error;

        if (zoneRes.statusCode !== 200) {
            error = new Error(`Request Failed.\n` +
                              `Status Code: ${zoneRes.statusCode}`);
        }

        if (error) {
            console.log(error.message);
            // consume response data to free up memory
            zoneRes.resume();
            callback(error, cloudName, zone);
            return;
        }

        console.log(`STATUS: ${zoneRes.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(zoneRes.headers)}`);
        zoneRes.setEncoding('utf8');

        zoneRes.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
            zone = chunk;
        });

        zoneRes.on('end', () => {
            console.log('No more data in response.');
            cloudName = 'GCP'; // Request was successful

            // get the zone substring in uppercase
            var zoneSplit = zone.split('/');
            zone = zoneSplit[zoneSplit.length - 1].toLowerCase();
            console.log(`CLOUD: ${cloudName}`);
            console.log(`ZONE: ${zone}`);

            // return CLOUD and ZONE data
            callback(null, cloudName, zone);
        });

    });

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        // return CLOUD and ZONE data
        callback(e, cloudName, zone);
    });

    // End request
    req.end();
}

function getAWSCloudMetadata(callback) {
    console.log('getAWSCloudMetadata');
    // Set options to retrieve AWS zone for instance
    var awsOptions = {
        hostname: '169.254.169.254',
        port: 80,
        path: '/latest/meta-data/placement/availability-zone',
        method: 'GET',
        timeout: 10000,
    };

    var cloudName = 'unknown',
        zone = 'unknown';

    var req = http.request(awsOptions, (zoneRes) => {
        let error;

        if (zoneRes.statusCode !== 200) {
            error = new Error(`Request Failed.\n` +
                              `Status Code: ${zoneRes.statusCode}`);
        }

        if (error) {
            console.log(error.message);
            // consume response data to free up memory
            zoneRes.resume();
            callback(error, cloudName, zone);
            return;
        }

        console.log(`STATUS: ${zoneRes.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(zoneRes.headers)}`);
        zoneRes.setEncoding('utf8');

        zoneRes.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
            zone = chunk;
        });

        zoneRes.on('end', () => {
            console.log('No more data in response.');
            cloudName = 'AWS'; // Request was successful

            // get the zone substring in uppercase
            var zoneSplit = zone.split('/');
            zone = zoneSplit[zoneSplit.length - 1].toLowerCase();
            console.log(`CLOUD: ${cloudName}`);
            console.log(`ZONE: ${zone}`);

            // return CLOUD and ZONE data
            callback(null, cloudName, zone);
        });

    });

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        // return CLOUD and ZONE data
        callback(e, cloudName, zone);
    });

    // End request
    req.end();
}

function getAzureCloudMetadata(callback) {
    console.log('getAzureCloudMetadata');
    // Set options to retrieve Azure zone for instance
    var azureOptions = {
        hostname: '169.254.169.254',
        port: 80,
        path: '/metadata/latest/instance/compute/location',
        method: 'GET',
        timeout: 10000,
        headers: {
          'Metadata': 'true'
        }
    };

    var cloudName = 'unknown',
        zone = 'unknown';

    var req = http.request(azureOptions, (zoneRes) => {
        let error;

        if (zoneRes.statusCode !== 200) {
            error = new Error(`Request Failed.\n` +
                              `Status Code: ${zoneRes.statusCode}`);
        }

        if (error) {
            console.log(error.message);
            // consume response data to free up memory
            zoneRes.resume();
            callback(error, cloudName, zone);
            return;
        }

        console.log(`STATUS: ${zoneRes.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(zoneRes.headers)}`);
        zoneRes.setEncoding('utf8');

        zoneRes.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
            zone = chunk;
        });

        zoneRes.on('end', () => {
            console.log('No more data in response.');
            cloudName = 'Azure'; // Request was successful

            // get the zone substring in uppercase
            var zoneSplit = zone.split('/');
            zone = zoneSplit[zoneSplit.length - 1].toLowerCase();
            console.log(`CLOUD: ${cloudName}`);
            console.log(`ZONE: ${zone}`);

            // return CLOUD and ZONE data
            callback(null, cloudName, zone);
        });

    });

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        // return CLOUD and ZONE data
        callback(e, cloudName, zone);
    });

    // End request
    req.end();
}

function getHost() {
    console.log('[get host]');
    var host = os.hostname();
    console.log(`HOST: ${host}`);
    return host;
}

router.get('/cloudprovider/get', function(req, res, next) {
    console.log('[get cloudprovider]');
    var cloud = 'unknown';
    console.log(`CLOUD PROVIDER: ${cloud}`);
    res.json(cloud);
});

router.get('/host/get', function(req, res, next) {
    console.log('[get host]');
    var host = os.hostname();
    console.log(`HOST: ${host}`);
    res.json(host);
});

router.get('/zone/get', function(req, res, next) {
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

    var zone = 'unknown';

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
            zone = zoneSplit[zoneSplit.length - 1].toLowerCase();
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
