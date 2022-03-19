#!/usr/bin/env bash
# 
# @Author: shuguet <sylvain@huguet.me>
# @Date: 2022-03-10 13:51:11 
# @Last Modified by:   shuguet <sylvain@huguet.me>
# @Last Modified time: 2022-03-10 13:51:11 
#
# Description: 
# Helper script to develop/mainitain the Pacman app (Node.js version with MongoDB backend)
#
# Required tools:
#   - docker
# Required steps:
#   - build the 'pacman' docker image at least once (using `build.sh` in the same folder)
#
# User defined variable:
MONGO_AUTH_PWD='mongoadmin'
MONGO_AUTH_USER='secret'

#
# DO NOT EDIT ANYTHING PAST THIS LINE UNLESS YOU KNOW WHAT YOU'RE DOING
#
# Enable tracing:
set -x
# Enable exit on first error:
set -o errtrace
# Enable error on unset variables:
set -o nounset

# Variable definition
LOCAL_WORKDIR=$(pwd)
DOCKER_NETWORK_NAME='pacman-dev'
MONGO_CONTAINER_NAME='mongo'
MONGO_CONTAINER_IMAGE='mongo:latest'
MONGO_WORKDIR='/data/db'
PACMAN_CONTAINER_NAME='pacman'
PACMAN_CONTAINER_IMAGE='pacman'
PACMAN_WORKDIR='/usr/src/app'
PACMAN_LOCAL_PORT='8080'
PACMAN_CONTAINER_PORT='8080'

# Define a cleanup function
cleanup() {
    docker stop ${MONGO_CONTAINER_NAME}
    docker volume rm ${TMP_DOCKER_VOL}
    docker network rm ${DOCKER_NETWORK_NAME}
}
# Register our cleanup function as a trap
trap cleanup EXIT

## Create a temporary docker network
docker network create --driver bridge ${DOCKER_NETWORK_NAME}

## Background MongoDB container
TMP_DOCKER_VOL=$(docker volume create)
docker run --rm -d --name ${MONGO_CONTAINER_NAME} \
    --network ${DOCKER_NETWORK_NAME} \
    -e MONGO_INITDB_ROOT_USERNAME=${MONGO_AUTH_USER} \
    -e MONGO_INITDB_ROOT_PASSWORD=${MONGO_AUTH_PWD} \
    -v ${TMP_DOCKER_VOL}:${MONGO_WORKDIR} \
    ${MONGO_CONTAINER_IMAGE}

## Mongo shell container
# docker run --rm -it --name ${PACMAN_CONTAINER_NAME} \
#     --network ${DOCKER_NETWORK_NAME} \
#     -e MONGO_SERVICE_HOST=${MONGO_CONTAINER_NAME} \
#     -e MONGO_AUTH_USER=${MONGO_AUTH_USER} \
#     -e MONGO_AUTH_PWD=${MONGO_AUTH_PWD} \
#     -v ${LOCAL_WORKDIR}:${PACMAN_WORKDIR} \
#     -p ${PACMAN_LOCAL_PORT}:${PACMAN_CONTAINER_PORT} \
#     --entrypoint bash \
#     mongo -- mongo --host ${MONGO_SERVICE_HOST} -u ${MONGO_AUTH_USER} -p ${MONGO_AUTH_PWD} --authenticationDatabase admin pacman

docker run --rm -it --name ${PACMAN_CONTAINER_NAME} \
    --network ${DOCKER_NETWORK_NAME} \
    -e MONGO_SERVICE_HOST=${MONGO_CONTAINER_NAME} \
    -e MONGO_AUTH_USER=${MONGO_AUTH_USER} \
    -e MONGO_AUTH_PWD=${MONGO_AUTH_PWD} \
    -v ${LOCAL_WORKDIR}:${PACMAN_WORKDIR} \
    -p ${PACMAN_LOCAL_PORT}:${PACMAN_CONTAINER_PORT} \
    --entrypoint bash \
    ${PACMAN_CONTAINER_IMAGE}