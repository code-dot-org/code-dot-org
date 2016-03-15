#!/bin/bash

# Pulls in all strings that need to be translated. Pulls source
# files from blockly-core, apps, pegasus, and dashboard and
# collects them to the single source folder i18n/locales/source.

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

orig_dir=dashboard/config/locales
loc_dir=i18n/locales/source/dashboard
mkdir -p $loc_dir

# Special case the un-prefixed Yaml file.
cp_in $orig_dir/en.yml $loc_dir/base.yml

# Copy in all the other Yaml files.
for file in $(find $orig_dir -name '*.en.yml'); do
  relname=${file#$orig_dir}
  cp_in $file $loc_dir${relname%.en.yml}.yml
done

### Apps

orig_dir=apps/i18n
loc_dir=i18n/locales/source/blockly-mooc
mkdir -p $loc_dir

# Copy JSON files.
for file in $(find $orig_dir -name 'en_us.json'); do
  relname=${file#$orig_dir}
  cp_in $file $loc_dir${relname%/en_us.json}.json
done


### Blockly Core

orig_dir=blockly-core/i18n/locales/en-US
loc_dir=i18n/locales/source/blockly-core
mkdir -p $loc_dir

# Copy JSON files.
for file in $(find $orig_dir -name '*.json'); do
  relname=${file#$orig_dir}
  cp_in $file $loc_dir$relname
done


### Pegasus

orig_dir=pegasus/cache/i18n
loc_dir=i18n/locales/source/pegasus
mkdir -p $loc_dir

perl -i ./bin/i18n-codeorg/lib/fix-ruby-yml.pl $orig_dir/en-US.yml
cp_in $orig_dir/en-US.yml $loc_dir/mobile.yml
