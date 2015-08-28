# !/bin/bash

set -e

# Bring in new strings to i18n/locales
orig_dir=i18n
source_dir=../i18n/locales/source/blockly-mooc
mkdir -p $source_dir

locales=$(ls ../i18n/locales | grep -v 'en-US' | grep -v 'source')

# Copy files from apps to i18n/locales/source
for file in $(find $orig_dir -name 'en_us.json'); do
  relname=${file#$orig_dir}

  if [ $file -nt $source_dir${relname%/en_us.json}.json ]; then
    echo "$file => $source_dir${relname%/en_us.json}.json"
    cp $file $source_dir${relname%/en_us.json}.json

    app=${relname%/en_us.json}
    app=${app##*/}

    for locale in $locales; do
      js_locale=$(echo $locale | tr '[:upper:]' '[:lower:]' | tr '-' '_')

      loc_dir=../i18n/locales/$locale/blockly-mooc
      en_dir=../i18n/locales/source/blockly-mooc

      # Copy files from i18n/locales to apps
      for file in $(find $loc_dir -name $app'.json'); do
        relname=${file#$loc_dir}
        ruby ../i18n/code.org/lib/merge-all-locales.rb "json" $en_dir$relname $file $orig_dir${relname%.json}/${js_locale}.json
      done
    done
  fi

ruby ../i18n/code.org/lib/copy-untranslated-apps.rb

done

git add --all i18n
git add --all ../i18n/locales/source
git commit --message="Updated apps strings"
git push
