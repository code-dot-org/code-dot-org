# !/bin/bash

set -e

function cp_in() {
  echo "$1 => $2"
  cp $1 $2
}

# Bring in new strings to i18n/locales
orig_dir=../../apps/i18n
loc_dir=../locales/source/blockly-mooc
mkdir -p $loc_dir

# Copy JSON files.
for file in $(find $orig_dir -name 'en_us.json'); do
  relname=${file#$orig_dir}
  cp_in $file $loc_dir${relname%/en_us.json}.json
done

locales=$(ls ../locales | grep -v 'en-US' | grep -v 'source')

for locale in $locales; do

	js_locale=$(echo $locale | tr '[:upper:]' '[:lower:]' | tr '-' '_')

  orig_dir=../../apps/i18n
  loc_dir=../locales/$locale/blockly-mooc
  en_dir=../locales/source/blockly-mooc

  # Copy JSON files.
  for file in $(find $loc_dir -name '*.json'); do
    relname=${file#$loc_dir}
    ruby ./lib/merge-all-locales.rb "json" $en_dir$relname $file $orig_dir${relname%.json}/${js_locale}.json
  done

done

./../../blockly-core/i18n/codeorg-messages.sh
cp -rf ../../blockly-core/msg/js/. ../../apps/lib/blockly/