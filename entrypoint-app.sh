#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /var/www/r8/tmp/pids/server.pid
./bin/rails db:create
./bin/rails db:migrate

./bin/rails s -b  0.0.0.0

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"
