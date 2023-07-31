#!/bin/bash

# Pulls in all strings that need to be translated. Pulls source
# files from blockly, apps, pegasus, and dashboard and
# collects them to the single source folder i18n/locales/source.

set -e

function cp_in() {
  cp $1 $2
}

### Dashboard

orig_dir=dashboard/config/locales
loc_dir=i18n/locales/source/dashboard
mkdir -p $loc_dir

# Special case the un-prefixed Yaml file.
cp_in $orig_dir/en.yml $loc_dir/base.yml

# Copy in needed files from dashboard
cp_in $orig_dir/data.en.yml $loc_dir/data.yml
cp_in $orig_dir/devise.en.yml $loc_dir/devise.yml
cp_in $orig_dir/restricted.en.yml $loc_dir/restricted.yml
cp_in $orig_dir/slides.en.yml $loc_dir/slides.yml
cp_in $orig_dir/unplugged.en.yml $loc_dir/unplugged.yml

### Blockly Core

orig_dir=apps/node_modules/@code-dot-org/blockly/i18n/locales/en-US
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
