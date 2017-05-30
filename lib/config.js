var service_host = process.env.MONGO_SERVICE_HOST

var database = {
    url: `mongodb://${service_host}:27017/pacman`,
    options: {
        replicaSet: 'rs0',
        readPreference: 'secondaryPreferred'
    }
};

exports.database = database;
