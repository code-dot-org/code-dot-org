import whenSpriteDropped from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/whenSpriteDropped';

import {fakeBlock, fakeGenerator} from '../blockDefinitionFakes';

describe('spritelab2_whenSpriteDropped', () => {
  it('wraps the blocks below it as the handler', () => {
    const code = whenSpriteDropped.generator(
      fakeBlock({}, {getNextBlock: () => ({})}),
      fakeGenerator()
    );
    expect(code).toBe('whenSpriteDropped(function () {\n  say();\n});\n');
  });

  it('registers an empty handler with nothing below it', () => {
    expect(whenSpriteDropped.generator(fakeBlock(), fakeGenerator())).toBe(
      'whenSpriteDropped(function () {\n});\n'
    );
  });
});
