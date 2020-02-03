import {assert} from '../../util/deprecatedChai';
import {blocks as applabBlocks} from '@cdo/apps/applab/dropletConfig';
import {getExportedGlobals} from '@cdo/apps/applab/export';
import {dropletGlobalConfigBlocks} from '@cdo/apps/dropletUtils';

describe('the export module', () => {
  describe('the getExportedGlobals function', () => {
    let globals;
    before(() => {
      globals = Object.keys(getExportedGlobals());
    });

    function testIncludesBlocks(blocks) {
      blocks.forEach(block => {
        if (block.blockPrefix || block.block) {
          // we don't care about functions defined on objects other than window
          // for example: Array.indexOf. We also don't care about this with blocks,
          // like declareAssign_str_hello_world, which is just:
          //
          //   var str = "Hello World";
          return;
        }
        it(`exposes a ${block.func} function`, () => {
          if (globals.indexOf(block.func) < 0) {
            // eslint-disable-next-line no-eval
            if (!eval(`window.${block.func}`)) {
              assert(
                false,
                `expected exported globals to include ${block.func}`
              );
            }
          }
        });
      });
    }

    testIncludesBlocks(applabBlocks);
    testIncludesBlocks(dropletGlobalConfigBlocks);
  });
});
