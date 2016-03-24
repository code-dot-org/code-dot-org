# !/bin/bash

# See cdo/i18n/README.md for instructions.
# Run this script to manually synchronize apps translations with Crowdin.
# Pulls in all of the applab EN files from apps/i18n into i18n/locales/source
# Makes a copy of the EN files for all locales (app lab is not translated)
# Exports the copies for all locales back to apps/i18n
# Commits updated locale files in apps/i18n and i18n/locales/source

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
        ruby ../bin/i18n-codeorg/lib/merge-all-locales.rb "json" $en_dir$relname $file $orig_dir${relname%.json}/${js_locale}.json
      done
    done
  fi

ruby ../i18n/code.org/copy-untranslated-apps.rb

done

git add --all i18n
git add --all ../i18n/locales/source
if [ -n "$(git status --porcelain i18n)" ]; then
  git commit --message="Updated apps strings"
  git push
fi
