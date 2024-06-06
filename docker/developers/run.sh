#!/bin/bash
set -e

# This script runs a command within the developer environment Docker container.

# This is useful to run arbitrary commands within the container while making
# use of the language environments such as rbenv and nvm within the container.

# This will also rewrite any arguments that appear to be file path references
# from being relative to the working directory outside of the container to
# ones that are absolutely pathed within the container. This way, you can
# tab complete arguments to a command in your host environment and have it
# get correctly referenced in the container.

# init rbenv
eval "$(rbenv init -)"

# init nvm
. ${HOME}/.nvm/nvm.sh

# Convert any path argument to a path absolute to the base /app/src path
find_absolute_path()
{
  item=${1}
  shift

  # Initial check. We look in the root and then step toward the host path
  HOST_PATH="${HOST_PWD}/."
  CHECK_ROOT=/app/src
  RESULT=${item}

  IFS='/'
  HOST_PATH=''
  for subpath in ${HOST_PWD}; do
    HOST_PATH="${subpath}/${HOST_PATH}"
  done
  HOST_PATH="./${HOST_PATH}"

  REL_PATH=''
  for subpath in ${HOST_PATH}; do
    CHECK="${CHECK_ROOT}/${subpath}/${REL_PATH}${item}"
    if [ -e "${CHECK}" ]; then
      RESULT=`realpath "${CHECK}"`
      return
    fi
    REL_PATH="${subpath}/${REL_PATH}"
  done
  unset IFS
}

cmd=""
for item in "${@}"; do
  if [[ ${item:0:1} =~ [[:alnum:]\.] ]]; then
    find_absolute_path ${item}
    cmd="${cmd}${RESULT} "
  else
    cmd="${cmd}${item} "
  fi
done

echo running \""${cmd}"\"
eval "${cmd[@]}"
