#!/bin/sh
# Phase 4 payload, run inside a client container on the compose network:
# CSRF token from the header-only /get_token, Devise sign-in, then the API
# read with the session cookie. Prints the /api/v1/users/current body;
# verify.sh asserts on it.
set -e
JAR=/tmp/cookies.txt
TOKEN=$(curl -s -D - -o /dev/null -c $JAR http://web:3000/get_token \
  | grep -i "^csrf-token:" | tr -d "\r" | cut -d" " -f2)
[ -n "$TOKEN" ] || { echo NO-TOKEN >&2; exit 1; }
code=$(curl -s -b $JAR -c $JAR -o /dev/null -w "%{http_code}" \
  --data-urlencode "authenticity_token=$TOKEN" \
  --data-urlencode "user[login]=verify@example.com" \
  --data-urlencode "user[password]=Verify-Passw0rd!" \
  http://web:3000/users/sign_in)
[ "$code" = 302 ] || { echo "SIGN-IN-$code" >&2; exit 1; }
curl -s -b $JAR http://web:3000/api/v1/users/current
