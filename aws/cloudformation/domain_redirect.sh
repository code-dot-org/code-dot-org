#!/bin/bash

set -e
# verbose=0
# while getopts "v" opt
# do
#     case $opt in
#     (v) verbose=1 ;;
#     (*) printf "Illegal option '-%s'\n" "$opt" && exit 1 ;;
#     esac
# done

# Get the options
verbose=0
while getopts ":vd:t:" option; do
  case $option in
    v) # display Help
      verbose=1;;
    t) # Enter a target URL
      Target=$OPTARG;;
    d) #Enter a comma-separated list of domain names
      Domains=$OPTARG;;
    \?) # Invalid option
      echo "Error: Invalid option"
      exit;;
  esac
done

echo "Redirecting $Domains to $Target"

echo 🐝 Transforming...
# erb domains=csedcon.com,csedcon.net,csedcon.org redirect_to=https://cvent.me/7VYB42 -T - domain_redirect.yml.erb > domain_redirect.yml
erb domains=$Domains redirect_to=$Target -T - domain_redirect.yml.erb > domain_redirect.yml
(( verbose )) && cat domain_redirect.yml

echo 🐝 Linting...
cfn-lint domain_redirect.yml

echo 🐝 Validating...
aws cloudformation validate-template --template-body file://domain_redirect.yml --no-cli-pager

echo "🍯 Template generated! Use 'domain_redirect.yml' to manually create/update a stack in AWS Cloudformation. If you wish we did that for you, update this script!"

# echo 🐝 Generating Change Set...
# echo TODO

# echo 🐝 Executing Change Set...
# echo TODO

# echo 🐝 Cleaning Up...
# rm domain_redirect.yml

# echo 🐝 Done!
