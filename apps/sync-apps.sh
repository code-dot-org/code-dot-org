# !/bin/bash

set -e

# Bring in new strings to i18n/locales
orig_dir=i18n
loc_dir=../i18n/locales/source/blockly-mooc
mkdir -p $loc_dir

# Copy JSON files.
for file in $(find $orig_dir -name 'en_us.json'); do
  relname=${file#$orig_dir}
  echo "$file => $loc_dir${relname%/en_us.json}.json"
  cp $file $loc_dir${relname%/en_us.json}.json
done

locales=$(ls ../i18n/locales | grep -v 'en-US' | grep -v 'source')

for locale in $locales; do

	js_locale=$(echo $locale | tr '[:upper:]' '[:lower:]' | tr '-' '_')

  orig_dir=i18n
  loc_dir=../i18n/locales/$locale/blockly-mooc
  en_dir=../i18n/locales/source/blockly-mooc

  # Copy JSON files.
  for file in $(find $loc_dir -name '*.json'); do
    relname=${file#$loc_dir}
    ruby ../i18n/code.org/lib/merge-all-locales.rb "json" $en_dir$relname $file $orig_dir${relname%.json}/${js_locale}.json
  done

  ruby ../i18n/code.org/lib/copy-untranslated-apps.rb

done