#!/bin/bash

set -e

# ask for the email and store it in the $email variable
echo -n "Email: "
read email

# make sure that the email is valid
if [[ ! "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  echo "Invalid email"
  exit 1
fi


# ask for a password and store it in the $password variable
echo -n "Password (min 6 characters): "
read -s password
echo

echo -n "Confirm password: "
read -s password2
echo

# ensure the password is at least 6 characters
if [ ${#password} -lt 6 ]; then
  echo "Password must be at least 6 characters"
  exit 1
fi

if [ "$password" != "$password2" ]; then
  echo "Passwords do not match"
  exit 1
fi

# create the user
docker exec -it ask-a-book-web-1 /var/www/r8/bin/rake users:create_user\[$email,$password\]
