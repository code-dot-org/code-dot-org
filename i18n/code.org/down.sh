#!/bin/bash

set -e

crowdin-cli download

# Fix-up Yaml files.
for yml in $(find locales -name '*.yml' | grep -v en-US); do
  perl -i ./lib/fix-yml.pl $yml
done
