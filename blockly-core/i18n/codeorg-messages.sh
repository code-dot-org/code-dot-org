#!/bin/bash

set -e

locales_dir=blockly-core/i18n/locales
core_dir=blockly-core
apps_dir=apps

locales=$(ls $locales_dir)

for locale in $locales; do

  js_locale=$(echo $locale | tr '[:upper:]' '[:lower:]' | tr '-' '_')

  src=$locales_dir/$locale/core.json
  blockly_dest=$core_dir/msg/js/${js_locale}.js
  apps_dest=$apps_dir/lib/blockly/${js_locale}.js

  echo "$src => $blockly_dest, $apps_dest"
  $core_dir/i18n/codeorg-json-to-js.pl $js_locale < $src > $blockly_dest
  $core_dir/i18n/codeorg-json-to-js.pl $js_locale < $src > $apps_dest

done
