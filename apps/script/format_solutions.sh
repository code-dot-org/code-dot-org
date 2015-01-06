#!/bin/bash

for xml in $(find test/solutions -name '*.xml'); do
  xmllint --format $xml | sed '1d' > $xml.tmp
  mv $xml.tmp $xml
done
