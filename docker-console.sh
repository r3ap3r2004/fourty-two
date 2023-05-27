#!/bin/bash

set -e

# find the directory that this script is in
this_dir=$(dirname $0)

# source the docker-entrypoint.sh script in the same directory as this_dir
source $this_dir/docker-entrypoint.sh

# set the docker environment variables
docker_setup_env "$@"

 ./bin/rails console
