import {parse} from 'acorn';
import {describe, expect, it, vi} from 'vitest';

// The real module drags the image-picker UI (and its store/scss imports)
// into the suite; the definitions only need the field plugins.
vi.mock('../../imagePickerFields', () => ({
  COSTUME_FIELD: {type: 'field', name: 'field_spritelab2_costume'},
  BLOCK_IMAGE_FIELD: {type: 'field', name: 'field_spritelab2_block_image'},
}));

import labBlockDefinitions from '..';

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
