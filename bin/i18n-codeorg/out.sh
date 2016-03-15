#!/bin/bash

# Distribute downloaded translations from i18n/locales
# back to blockly-core, apps, pegasus, and dashboard.

set -e

locales=$(ls i18n/locales | grep -v 'en-US' | grep -v 'source')

for locale in $locales; do

  js_locale=$(echo $locale | tr '[:upper:]' '[:lower:]' | tr '-' '_')

  ### Dashboard

  orig_dir=dashboard/config/locales
  loc_dir=i18n/locales/$locale/dashboard
  en_dir=i18n/locales/source/dashboard

  # Special case the un-prefixed Yaml file.
  ruby ./bin/i18n-codeorg/lib/merge-translation.rb "yml" $en_dir/base.yml $loc_dir/base.yml $orig_dir/$locale.yml
  perl -i ./bin/i18n-codeorg/lib/fix-ruby-yml.pl $orig_dir/$locale.yml

  # Merge in all the other Yaml files.
  for file in $(find $loc_dir -name '*.yml' -and -not -name 'base.yml'); do
    relname=${file#$loc_dir}
    ruby ./bin/i18n-codeorg/lib/merge-translation.rb "yml" $en_dir$relname $file $orig_dir${relname%.yml}.${locale}.yml
    perl -i ./bin/i18n-codeorg/lib/fix-ruby-yml.pl $orig_dir${relname%.yml}.${locale}.yml
  done


  ### Apps

  orig_dir=apps/i18n
  loc_dir=i18n/locales/$locale/blockly-mooc
  en_dir=i18n/locales/source/blockly-mooc

  # Copy JSON files.
  for file in $(find $loc_dir -name '*.json'); do
    relname=${file#$loc_dir}
    ruby ./bin/i18n-codeorg/lib/merge-translation.rb "json" $en_dir$relname $file $orig_dir${relname%.json}/${js_locale}.json
  done


  ### Blockly Core
  orig_dir=blockly-core/i18n/locales/$locale
  loc_dir=i18n/locales/$locale/blockly-core
  en_dir=i18n/locales/source/blockly-core
  mkdir -p $orig_dir

  # Copy JSON files.
  for file in $(find $loc_dir -name '*.json'); do
    relname=${file#$loc_dir}
    ruby ./bin/i18n-codeorg/lib/merge-translation.rb "json" $en_dir$relname $file $orig_dir$relname
  done


  ### Pegasus
  orig_dir=pegasus/cache/i18n
  loc_dir=i18n/locales/$locale/pegasus
  en_dir=i18n/locales/source/pegasus

  # Merge YML file.
  ruby ./bin/i18n-codeorg/lib/merge-translation.rb "yml" $en_dir/mobile.yml $loc_dir/mobile.yml $orig_dir/$locale.yml
  perl -i ./bin/i18n-codeorg/lib/fix-ruby-yml.pl $orig_dir/$locale.yml


done
