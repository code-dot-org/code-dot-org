#!/bin/bash

set -e

# Get the options
verbose=0
while getopts :vhd:t: option; do
  case $option in
    h) # Help
      echo "Generate a cloudformation template for a redirected domain(s)."
      echo ""
      echo "Options:"
      echo "  -v           Verbose"
      echo "  -t TARGET    The target URL, like 'https://example.com/path'"
      echo "  -d DOMAINS   Comma-separated list of domains, like 'test.org,test.net"
      echo "  -h           This help text"
      exit;;
    v) # Display verbose logging (cat the generated template)
      verbose=1;;
    t) # Enter a target URL
      Target=$OPTARG;;
    d) #Enter a comma-separated list of domain names
      Domains=$OPTARG;;
    \?) # Invalid option
      echo "Error: Invalid option. Use '-h' for help."  >&2
      exit 1;;
  esac
done

if [ -z "$Domains" ] || [ -z "$Target" ]; then
        echo "Missing -d or -t. Use '-h' for help." >&2
        exit 1
fi

echo "Redirecting $Domains to $Target"

echo 🐝 Transforming...
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
