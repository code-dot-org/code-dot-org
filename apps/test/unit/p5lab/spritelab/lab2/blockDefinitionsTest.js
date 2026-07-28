import {parse} from 'acorn';

// The real module drags the image-picker UI (and its store/scss imports)
// into the suite; the definitions only need the field type names.
jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields', () => ({
  FIELD_COSTUME_TYPE: 'field_spritelab2_costume',
  FIELD_BLOCK_IMAGE_TYPE: 'field_spritelab2_block_image',
}));

import labBlockDefinitions from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions';

describe('SpriteLab2 lab block definitions', () => {
  labBlockDefinitions.forEach(({definition, generator, helperCode}) => {
    describe(definition.type, () => {
      it('has a definition type and generator', () => {
        expect(typeof definition.type).toBe('string');
        expect(typeof generator).toBe('function');
      });

      if (helperCode) {
        // The helpers run in the JSInterpreter, which parses ES5 only.
        it('helperCode parses as ES5', () => {
          expect(() => parse(helperCode, {ecmaVersion: 5})).not.toThrow();
        });

        it('helperCode defines a function', () => {
          const ast = parse(helperCode, {ecmaVersion: 5});
          const fns = ast.body.filter(n => n.type === 'FunctionDeclaration');
          expect(fns.length).toBeGreaterThan(0);
        });
      }
    });
  });
});
