#!/bin/bash
if [[ $1 == "debug" ]]; then
  echo "Building blockly core in debug mode"
  echo "Outputting to blockly_uncompressed.js"
  python closure-library-read-only/closure/bin/build/closurebuilder.py \
  --root=closure-library-read-only/ --root=core/ \
  --compiler_jar=compiler.jar --compiler_flags="--compilation_level=WHITESPACE_ONLY" \
  --compiler_flags="--formatting=PRETTY_PRINT" \
  --namespace="Blockly" --output_mode=compiled \
  > blockly_uncompressed.js
    echo "Done building blockly_uncompressed.js"

else
  python closure-library-read-only/closure/bin/build/closurebuilder.py \
  --root=closure-library-read-only/ --root=core/ \
  --compiler_jar=compiler.jar --namespace="Blockly" --output_mode=compiled \
  > blockly_compressed.js

  echo -e '// Do not edit this generated file\n"use strict";\n' > javascript_compressed.js
  java -jar compiler.jar --flagfile generators/bld_flags.txt \
  >> javascript_compressed.js
  sed -i.bak -e "s/var Blockly={Generator:{}};//g" javascript_compressed.js
  rm javascript_compressed.js.bak

  echo -e '// Do not edit this generated file\n"use strict";\n' > blocks_compressed.js
  java -jar compiler.jar --flagfile blocks/bld_flags.txt \
  >> blocks_compressed.js
  sed -i.bak -e "s/var Blockly={Blocks:{}};//g" blocks_compressed.js
  rm blocks_compressed.js.bak
  echo "Done building blockly_compressed.js, javascript_compressed.js and blocks_compressed.js"
fi
