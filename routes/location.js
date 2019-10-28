var http = require('http');
var https = require('https');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var os = require('os');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date());
    next();
})

router.get('/metadata', function(req, res, next) {
    console.log('[GET /loc/metadata]');
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
    // Query k8s node api
    getK8sCloudMetadata(function(err, c, z) {
        if (err) {
            // Try AWS next
            getAWSCloudMetadata(function(err, c, z) {
                if (err) {
                    // Try Azure next
                    getAzureCloudMetadata(function(err, c, z) {
                        if (err) {
                            // Try GCP next
                            getGCPCloudMetadata(function(err, c, z) {
                                if (err) {
                                    // Try Openstack next
                                    getOpenStackCloudMetadata(function(err, c, z) {
                                        // Return result regardless of error
                                        callback(c, z); // Running in OpenStack or unknown
                                    });
                                } else {
                                    callback(c, z); // Running in GCP
                                }
                            });
                        } else {
                            callback(c, z); // Running in Azure
                        }
                    });
                } else {
                    callback(c, z); // Running in AWS
                }
            });
        } else {
            callback(c, z); // Running against k8s api
        }
    });
}

function getOpenStackCloudMetadata(callback) {
    console.log('getOpenStackCloudMetadata');
    // Set options to retrieve OpenStack zone for instance
    var osOptions = {
        hostname: '169.254.169.254',
        port: 80,
        path: '/openstack/latest/meta_data.json',
        method: 'GET',
        timeout: 10000,
    };

    var cloudName = 'unknown',
        zone = 'unknown';

    var req = http.request(osOptions, (metadataRes) => {
        let error;

        if (metadataRes.statusCode !== 200) {
            error = new Error(`Request Failed.\n` +
                `Status Code: ${metadataRes.statusCode}`);
        }

        if (error) {
            console.log(error.message);
            // consume response data to free up memory
            metadataRes.resume();
            callback(error, cloudName, zone);
            return;
        }

        console.log(`STATUS: ${metadataRes.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(metadataRes.headers)}`);
        metadataRes.setEncoding('utf8');

        var metaData;

        metadataRes.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
            metaData = JSON.parse(chunk);
        });

        metadataRes.on('end', () => {
            console.log('No more data in response.');
            cloudName = 'OpenStack'; // Request was successful
            zone = metaData.availability_zone;

            // use extra metadata to identify the cloud if available
            if (metaData.meta) {
                clusterId = metaData.meta.clusterid;
                if (clusterId) {
                    cloudName += ' - ' + clusterId.split('.')[0];
                }
            }

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
        path: '/metadata/instance/compute/location?api-version=2017-04-02&format=text',
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

function getK8sCloudMetadata(callback) {
    console.log('getK8sCloudMetadata');
    // Set options to retrieve k8s api information
    var node_name = process.env.MY_NODE_NAME;
    console.log('Querying ' + node_name + ' for cloud data');

    try {
        var sa_token = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token');
        var ca_file = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt');
    } catch (err) {
        console.log(err)
    }

    var headers = {
        'Authorization': `Bearer ${sa_token}`
    };

    var genericOptions = {
        host: 'kubernetes.default.svc',
        port: 443,
        path: `/api/v1/nodes/${node_name}`,
        timeout: 10000,
        ca: ca_file,
        headers: headers,
    };

    var cloudName = 'unknown',
        zone = 'unknown';

    var req = https.request(genericOptions, (zoneRes) => {
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

        var body = [];

        zoneRes.on('data', (chunk) => {
            body.push(chunk);
        });
        zoneRes.on('end', () => {
            var metaData = JSON.parse(body.join(''));
            console.log(`RESULT: ${metaData}`);
            console.log('No more data in response.');

            if (metaData.spec.providerID) {
                var provider = metaData.spec.providerID;
                cloudName = String(provider.split(":", 1)); // Split on providerID if request was successful
            }

            // use the annotation  to identify the zone if available
            if (metaData.metadata.labels['failure-domain.beta.kubernetes.io/zone']) {
                zone = metaData.metadata.labels['failure-domain.beta.kubernetes.io/zone'].toLowerCase();

            }
            // return CLOUD and ZONE data
            if (cloudName == "unknown") {
                error = new Error(`CloudName not found on node Spec`);
                console.log(error);
                callback(error, cloudName, zone);
            }
            else {
                console.log(`CLOUD: ${cloudName}`);
                console.log(`ZONE: ${zone}`);
                callback(null, cloudName, zone);
            }
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
    console.log('[getHost]');
    var host = os.hostname();
    console.log(`HOST: ${host}`);
    return host;
}

module.exports = router;
