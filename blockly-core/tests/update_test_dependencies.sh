# Writes out a dependency listing suitable for inclusion on
# playground.html and blockly_test.html
# This allows for no-build updating of these pages

#!/bin/bash
../closure-library-read-only/closure/bin/build/depswriter.py \
  --root_with_prefix="../closure-library-read-only ../../../closure-library-read-only" \
  --root_with_prefix="../core ../../../core" \
  --root_with_prefix="../blocks ../../../blocks" \
  --root_with_prefix="../generators/javascript ../../../generators/javascript" \
  --root_with_prefix="../msg ../../../msg" \
  --path_with_depspath="../generators/javascript.js ../../../generators/javascript.js" \
  --path_with_depspath="./test_requires_and_utils.js ../../../tests/test_requires_and_utils.js" \
  --path_with_depspath="./playground_requires.js ../../../tests/playground_requires.js" \
   > test_dependency_map.js
