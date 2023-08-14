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
