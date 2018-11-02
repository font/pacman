var service_host = 'localhost'
var auth_details = ''
var mongo_database = 'pacman'
var mongo_port = '27017'
var use_ssl = false
var validate_ssl = true

if(process.env.MONGO_SERVICE_HOST) {
    service_host = process.env.MONGO_SERVICE_HOST
} else if(process.env.MONGO_NAMESPACE_SERVICE_HOST) {
    service_host = process.env.MONGO_NAMESPACE_SERVICE_HOST
}

if(process.env.MONGO_DATABASE) {
    mongo_database = process.env.MONGO_DATABASE
}

if(process.env.MONGO_PORT) {
    mongo_port = process.env.MONGO_PORT
}

if(process.env.MONGO_USE_SSL.toLowerCase() == "true") {
    use_ssl = true
}

if(process.env.MONGO_VALIDATE_SSL.toLowerCase() == "false") {
    validate_ssl = false
}

if(process.env.MONGO_AUTH_USER && process.env.MONGO_AUTH_PWD) {
    auth_details = `${process.env.MONGO_AUTH_USER}:${process.env.MONGO_AUTH_PWD}@`
}

var database = {
    url: `mongodb://${auth_details}${service_host}:${mongo_port}/${mongo_database}`,
    options: {
        readPreference: 'secondaryPreferred'
    }
};
if(process.env.MONGO_REPLICA_SET) {
    database.options.replicaSet = process.env.MONGO_REPLICA_SET
}

if(use_ssl) {
    database.options.ssl = use_ssl
    database.options.sslValidate = validate_ssl
}

exports.database = database;
