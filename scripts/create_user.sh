#!/bin/bash

set -e

# get the name of the container that is running the web app
container_name=$(docker container ls | grep ask-a-book | grep web | head -n 1 | cut -d " " -f 1)

# create the user
docker exec -it $container_name /var/www/r8/docker-create-user.sh
