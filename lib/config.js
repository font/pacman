var database = {
    url: 'mongodb://localhost:27017/pacman',
    options: {
        replicaSet: 'rs0',
        readPreference: 'secondaryPreferred'
    }
};

exports.database = database;
