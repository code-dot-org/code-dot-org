// The real module drags the image-picker UI (and its store/scss imports)
// into the suite; the definitions only need the field type names.
jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields', () => ({
  FIELD_COSTUME_TYPE: 'field_spritelab2_costume',
  FIELD_BLOCK_IMAGE_TYPE: 'field_spritelab2_block_image',
}));

import predict from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/predict';
import setImageTo from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/setImageTo';
import whenSpriteDropped from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/whenSpriteDropped';

// Just enough of a block and generator for the generators under test.
const fakeBlock = (
  fields: Record<string, string> = {},
  extra: Record<string, unknown> = {}
) =>
  ({
    getFieldValue: (name: string) => fields[name],
    getNextBlock: () => null,
    ...extra,
  } as never);

const fakeGenerator = (values: Record<string, string> = {}) =>
  ({
    valueToCode: (_block: unknown, name: string) => values[name] || '',
    blockToCode: () => 'say();\n',
    prefixLines: (text: string, prefix: string) =>
      text.replace(/^(?=.)/gm, prefix),
  } as never);

describe('SpriteLab2 AI model blocks', () => {
  it('predict reads as an empty string until it has a model shape', () => {
    expect(predict.generator(fakeBlock(), fakeGenerator())).toEqual([
      '""',
      expect.any(Number),
    ]);
  });

  it('predict asks the model with one entry per feature', () => {
    const block = fakeBlock(
      {},
      {
        modelShape: {
          id: 'qst6',
          name: 'dogmood',
          features: [
            {id: 'food', yesNo: true},
            {id: 'bone', yesNo: true},
          ],
        },
      }
    );
    const [code] = predict.generator(
      block,
      fakeGenerator({FEATURE_food: 'isTouchingSprite(a, b)'})
    ) as [string, number];
    expect(code).toBe(
      'predictWith("qst6", {"food": isTouchingSprite(a, b), "bone": null})'
    );
  });

  it('set image names the sprite by costume and takes the image as a value', () => {
    const code = setImageTo.generator(
      fakeBlock({ANIMATION_NAME: '"dog"'}),
      fakeGenerator({IMAGE: 'predictWith("m", {})'})
    );
    expect(code).toBe('setImage({costume: "dog"}, predictWith("m", {}));\n');
  });

  it('when dropped wraps the blocks below it as the handler', () => {
    const code = whenSpriteDropped.generator(
      fakeBlock({}, {getNextBlock: () => ({})}),
      fakeGenerator()
    );
    expect(code).toBe('whenSpriteDropped(function () {\n  say();\n});\n');
  });

  it('when dropped with nothing below it registers an empty handler', () => {
    expect(whenSpriteDropped.generator(fakeBlock(), fakeGenerator())).toBe(
      'whenSpriteDropped(function () {\n});\n'
    );
  });
});
