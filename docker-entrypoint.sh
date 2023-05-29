#!/bin/bash
set -e

# check to see if this file is being run or sourced from another script
_is_sourced() {
	# https://unix.stackexchange.com/a/215279
	[ "${#FUNCNAME[@]}" -ge 2 ] \
		&& [ "${FUNCNAME[0]}" = '_is_sourced' ] \
		&& [ "${FUNCNAME[1]}" = 'source' ]
}

# usage: file_env VAR [DEFAULT]
#    ie: file_env 'XYZ_DB_PASSWORD' 'example'
# (will allow for "$XYZ_DB_PASSWORD_FILE" to fill in the value of
#  "$XYZ_DB_PASSWORD" from a file, especially for Docker's secrets feature)
file_env() {
	local var="$1"
	local fileVar="${var}_FILE"
	local def="${2:-}"
	if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
		buffalo_error "Both $var and $fileVar are set (but are exclusive)"
	fi
	local val="$def"
	if [ "${!var:-}" ]; then
		val="${!var}"
	elif [ "${!fileVar:-}" ]; then
		echo "LOADING ${!fileVar:-}"
		val="$(< "${!fileVar}")"
	fi
	export "$var"="$val"
	unset "$fileVar"
}

# Loads various settings that are used elsewhere in the script
docker_setup_env() {
	# Initialize values that are stored in a file, but don't have internal support for it
  # this is used for Docker Swarm where environment variables are stored in secrets
    file_env 'RAILS_MASTER_KEY'
    file_env 'SECRET_KEY_BASE'
    file_env 'POSTGRES_USER'
    file_env 'POSTGRES_PASSWORD'
    file_env 'RESEMBLE_API_KEY'
    file_env 'RESEMBLE_PROJECT_UUID'
    file_env 'RESEMBLE_VOICE_UUID'
    file_env 'RESEMBLE_CALLBACK_HOST'
    file_env 'OPENAI_API_KEY'
    file_env 'AWS_ACCESS_KEY_ID'
    file_env 'AWS_SECRET_ACCESS_KEY'
    file_env 'AWS_REGION'
    file_env 'PRIVATE_S3_BUCKET_REGION'
    file_env 'PRIVATE_S3_BUCKET_NAME'
    file_env 'SIDEKIQ_USER'
    file_env 'SIDEKIQ_PASSWORD'
    file_env 'SMTP_USER'
    file_env 'SMTP_PASSWORD'
    file_env 'REDIS_URL'
    file_env 'ALLOWED_ORIGINS'
    file_env 'HOST'
    file_env 'OUTBOUND_EMAIL'
    file_env 'ADMIN_EMAIL'
}

_main() {
	# Load various environment variables
	docker_setup_env "$@"


  # if the environment variable SIDEKIQ is set to true, then start sidekiq otherwise start rails
  if [[ $WEBAPP == "true" ]]; then
    rm -f /var/www/r8/tmp/pids/server.pid
    ./bin/rails db:create
    ./bin/rails db:migrate
  fi

	exec "$@"
}

# If we are sourced from elsewhere, don't perform any further actions
if ! _is_sourced; then
	_main "$@"
fi
