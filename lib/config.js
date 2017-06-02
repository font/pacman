var service_host = 'localhost'

if(process.env.MONGO_SERVICE_HOST) {
    service_host = process.env.MONGO_SERVICE_HOST
}

var database = {
    url: `mongodb://${service_host}:27017/pacman`,
    options: {
        readPreference: 'secondaryPreferred'
    }
};

if(process.env.MONGO_REPLICA_SET) {
    database.options.replicaSet = process.env.MONGO_REPLICA_SET
}

exports.database = database;
