#!/bin/bash

set -e

locales=$(ls ../locales | grep -v 'en-US')

for locale in $locales; do

  ### Pegasus
  orig_dir=../../pegasus/cache/i18n
  loc_dir=../locales/$locale/pegasus
  en_dir=../locales/en-US/pegasus

  # Merge YML file.
  ruby ./lib/merge-translation.rb "yml" $en_dir/mobile.yml $loc_dir/mobile.yml $orig_dir/$locale.yml
  perl -i ./lib/fix-ruby-yml.pl $orig_dir/$locale.yml

done