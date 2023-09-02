#!/usr/bin/env bash
# 
# @Author: shuguet <sylvain@huguet.me>
# @Date: 2022-03-10 13:51:11 
# @Last Modified by:   shuguet <sylvain@huguet.me>
# @Last Modified time: 2022-03-26 13:51:11 
#
# Description: 
# Helper script to build the Pac-Man app (Node.js version with MongoDB backend)
#
# Required tools:
#   - docker
docker build . -t pacman