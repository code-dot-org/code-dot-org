#!/bin/bash

set -e

locales=$(ls ../locales | grep -v 'en-US' | grep -v 'source')

for locale in $locales; do

  js_locale=$(echo $locale | tr '[:upper:]' '[:lower:]' | tr '-' '_')

  ### Dashboard

  orig_dir=../../dashboard/config/locales
  loc_dir=../locales/$locale/dashboard
  en_dir=../locales/source/dashboard

  # Special case the un-prefixed Yaml file.
  ruby ./lib/merge-translation.rb "yml" $en_dir/base.yml $loc_dir/base.yml $orig_dir/$locale.yml
  perl -i ./lib/fix-ruby-yml.pl $orig_dir/$locale.yml

  # Merge in all the other Yaml files.
  for file in $(find $loc_dir -name '*.yml' -and -not -name 'base.yml'); do
    relname=${file#$loc_dir}
    ruby ./lib/merge-translation.rb "yml" $en_dir$relname $file $orig_dir${relname%.yml}.${locale}.yml
    perl -i ./lib/fix-ruby-yml.pl $orig_dir${relname%.yml}.${locale}.yml
  done


  ### Blockly Mooc

  orig_dir=../../apps/i18n
  loc_dir=../locales/$locale/blockly-mooc
  en_dir=../locales/source/blockly-mooc

  # Copy JSON files.
  for file in $(find $loc_dir -name '*.json'); do
    relname=${file#$loc_dir}
    ruby ./lib/merge-translation.rb "json" $en_dir$relname $file $orig_dir${relname%.json}/${js_locale}.json
  done


  ### Blockly Core
  orig_dir=../../blockly-core/i18n/locales/$locale
  loc_dir=../locales/$locale/blockly-core
  en_dir=../locales/source/blockly-core
  mkdir -p $orig_dir

  # Copy JSON files.
  for file in $(find $loc_dir -name '*.json'); do
    relname=${file#$loc_dir}
    ruby ./lib/merge-translation.rb "json" $en_dir$relname $file $orig_dir$relname
  done


  ### Pegasus
  orig_dir=../../pegasus/cache/i18n
  loc_dir=../locales/$locale/pegasus
  en_dir=../locales/source/pegasus

  # Merge YML file.
  ruby ./lib/merge-translation.rb "yml" $en_dir/mobile.yml $loc_dir/mobile.yml $orig_dir/$locale.yml
  perl -i ./lib/fix-ruby-yml.pl $orig_dir/$locale.yml


done

ruby ./lib/cleanup.rb