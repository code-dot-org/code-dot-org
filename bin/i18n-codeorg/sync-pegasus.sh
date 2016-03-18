#!/bin/bash

# Copies new pegasus strings from pegasus/cache/i18n/en-US.yml
# to all locales in pegasus/cache/i18n.

set -e

function cp_in() {
  echo "$1 => $2"
  cp $1 $2
}

  # Bring in new strings to i18n/locales
  orig_dir=pegasus/cache/i18n
  loc_dir=i18n/locales/source/pegasus
  mkdir -p $loc_dir

  perl -i ./bin/i18n-codeorg/lib/fix-ruby-yml.pl $orig_dir/en-US.yml
  cp_in $orig_dir/en-US.yml $loc_dir/mobile.yml

locales=$(ls i18n/locales | grep -v 'en-US' | grep -v 'source')

for locale in $locales; do

  # Export to pegasus/cache/i18n/locales
  orig_dir=pegasus/cache/i18n
  loc_dir=i18n/locales/$locale/pegasus
  en_dir=i18n/locales/source/pegasus

  # Merge YML file.
  ruby ./bin/i18n-codeorg/lib/merge-all-locales.rb "yml" $en_dir/mobile.yml $loc_dir/mobile.yml $orig_dir/$locale.yml
  perl -i ./bin/i18n-codeorg/lib/fix-ruby-yml.pl $orig_dir/$locale.yml

done
