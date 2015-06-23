#!/bin/bash
if [[ $1 == "debug" ]]; then
  echo "Building blockly core in debug mode"
  echo "Outputting to build-output/blockly_uncompressed.js, build-output/javascript_uncompressed.js and build-output/blocks_uncompressed.js"
  python closure-library-read-only/closure/bin/build/closurebuilder.py \
  --root=closure-library-read-only/ --root=core/ \
  --compiler_jar=compiler.jar --compiler_flags="--compilation_level=WHITESPACE_ONLY" \
  --compiler_flags="--formatting=PRETTY_PRINT" \
  --namespace="Blockly" --output_mode=compiled \
  > build-output/blockly_uncompressed.js

  echo -e '// Do not edit this generated file\n"use strict";\n' > build-output/javascript_uncompressed.js
  java -jar compiler.jar \
  --formatting=PRETTY_PRINT --flagfile generators/bld_flags.txt \
  >> build-output/javascript_uncompressed.js
  sed -i.bak -e "s/var Blockly = {Generator:{}};//g" build-output/javascript_uncompressed.js
  rm build-output/javascript_uncompressed.js.bak

  echo -e '// Do not edit this generated file\n"use strict";\n' > build-output/blocks_uncompressed.js
  java -jar compiler.jar \
  --formatting=PRETTY_PRINT --flagfile blocks/bld_flags.txt \
  >> build-output/blocks_uncompressed.js
  sed -i.bak -e "s/var Blockly = {Blocks:{}};//g" build-output/blocks_uncompressed.js
  rm build-output/blocks_uncompressed.js.bak
  echo "Done building build-output/blockly_uncompressed.js, build-output/javascript_uncompressed.js and build-output/blocks_uncompressed.js"

else
  python closure-library-read-only/closure/bin/build/closurebuilder.py \
  --root=closure-library-read-only/ --root=core/ \
  --compiler_jar=compiler.jar --namespace="Blockly" --output_mode=compiled \
  > build-output/blockly_compressed.js

  echo -e '// Do not edit this generated file\n"use strict";\n' > build-output/javascript_compressed.js
  java -jar compiler.jar --flagfile generators/bld_flags.txt \
  >> build-output/javascript_compressed.js
  sed -i.bak -e "s/var Blockly={Generator:{}};//g" build-output/javascript_compressed.js
  rm build-output/javascript_compressed.js.bak

  echo -e '// Do not edit this generated file\n"use strict";\n' > build-output/blocks_compressed.js
  java -jar compiler.jar --flagfile blocks/bld_flags.txt \
  >> build-output/blocks_compressed.js
  sed -i.bak -e "s/var Blockly={Blocks:{}};//g" build-output/blocks_compressed.js
  rm build-output/blocks_compressed.js.bak
  echo "Done building build-output/blockly_compressed.js, build-output/javascript_compressed.js and build-output/blocks_compressed.js"

  # Run blockly-core tests with every release build
  ./test.sh
fi
