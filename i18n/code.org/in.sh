#!/bin/bash

set -e

function cp_in() {
  echo "$1 => $2"
  cp $1 $2
}

# make sure we're on staging
branch=$(git branch | sed -n '/\* /s///p')
if [ "$branch" != "staging" ]; then
  echo "Must run from staging branch"
  exit
fi

# Do a pull to make sure we're up to date
git pull

### Dashboard

orig_dir=../../dashboard/config/locales
loc_dir=../locales/en-US/dashboard
mkdir -p $loc_dir

# Special case the un-prefixed Yaml file.
cp_in $orig_dir/en.yml $loc_dir/base.yml

# Copy in all the other Yaml files.
for file in $(find $orig_dir -name '*.en.yml'); do
  relname=${file#$orig_dir}
  cp_in $file $loc_dir${relname%.en.yml}.yml
done


### Blockly Mooc

orig_dir=../../blockly/i18n
loc_dir=../locales/en-US/blockly-mooc
mkdir -p $loc_dir

# Copy JSON files.
for file in $(find $orig_dir -name 'en_us.json'); do
  relname=${file#$orig_dir}
  cp_in $file $loc_dir${relname%/en_us.json}.json
done


### Blockly Core

orig_dir=../../blockly-core/i18n/locales/en-US
loc_dir=../locales/en-US/blockly-core
mkdir -p $loc_dir

# Copy JSON files.
for file in $(find $orig_dir -name '*.json'); do
  relname=${file#$orig_dir}
  cp_in $file $loc_dir$relname
done


### Pegasus

orig_dir=../../pegasus/cache/i18n
loc_dir=../locales/en-US/pegasus
mkdir -p $loc_dir

perl -i ./lib/fix-ruby-yml.pl $orig_dir/en-US.yml
cp_in $orig_dir/en-US.yml $loc_dir/mobile.yml
