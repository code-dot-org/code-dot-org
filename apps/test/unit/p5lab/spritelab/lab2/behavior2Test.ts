import {parse} from 'acorn';
import {Block, CodeGenerator} from 'blockly/core';

import {
  compileBehavior2Sources,
  sanitizeBehavior2Source,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/behavior2';
import {
  clearCurrentBehavior2Name,
  setCurrentBehavior2Name,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/behavior2Compile';
import behavior2Blocks from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/behavior2Blocks';
import {DEFAULT_BEHAVIOR2S} from '@cdo/apps/p5lab/spritelab/lab2/blockly/defaultBehavior2s';

// Like blockDefinitionsTest: the real module drags the image-picker UI into
// the suite; the definitions only need the field type names. (jest hoists
// these above the imports.)
jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields', () => ({
  FIELD_COSTUME_TYPE: 'field_spritelab2_costume',
  FIELD_BLOCK_IMAGE_TYPE: 'field_spritelab2_block_image',
}));
// setup.ts pulls the whole Sprite Lab block install; the compiler only calls
// compileWorkspaceSource, stubbed per test.
jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockly/setup', () => ({
  compileWorkspaceSource: jest.fn(() => 'compiledBody();\n'),
}));

const generatorFor = (type: string) => {
  const entry = behavior2Blocks.find(b => b.definition.type === type);
  if (!entry) {
    throw new Error(`no behavior2 block ${type}`);
  }
  return entry.generator;
};

const fakeBlock = (fields: {[name: string]: string}) =>
  ({
    getFieldValue: (name: string) => fields[name],
  } as unknown as Block);

const fakeGenerator = (values: {[input: string]: string} = {}) =>
  ({
    statementToCode: () => '  body();\n',
    valueToCode: (block: unknown, name: string) => values[name] ?? '',
  } as unknown as CodeGenerator);

describe('behavior2 codegen', () => {
  it('start-system resolves the option to the per-system number', () => {
    const code = generatorFor('spritelab2_startSystem')(
      fakeBlock({SYSTEM: 'platformer', TYPE: 'players', OPTION: 'medium'}),
      fakeGenerator()
    );
    expect(code).toBe('startBehavior2(\'players\', "platformer", -0.5);\n');
  });

  it('start-system resolves walk speeds independently', () => {
    const code = generatorFor('spritelab2_startSystem')(
      fakeBlock({SYSTEM: 'walk', TYPE: 'sprites', OPTION: 'high'}),
      fakeGenerator()
    );
    expect(code).toBe('startBehavior2(\'sprites\', "walk", 6);\n');
  });

  it('a system missing from the registry still generates, with strength meta', () => {
    const code = generatorFor('spritelab2_startSystem')(
      fakeBlock({SYSTEM: 'my wind', TYPE: 'sprites', OPTION: 'high'}),
      fakeGenerator()
    );
    expect(code).toBe('startBehavior2(\'sprites\', "my wind", 3);\n');
  });

  it('for-each wraps its body in the per-sprite callback', () => {
    const code = generatorFor('spritelab2_forEachSpriteOfType')(
      fakeBlock({}),
      fakeGenerator()
    );
    expect(code).toBe(
      'forEachSpriteOfType(__group, function (__current) {\n  body();\n});\n'
    );
  });

  it('state blocks read and write the same namespaced sprite prop', () => {
    // Outside a compile bracket the namespace is empty but still applied.
    const set = generatorFor('spritelab2_setStateForThisSprite')(
      fakeBlock({NAME: 'jump count'}),
      fakeGenerator({VALUE: '3'})
    );
    const get = generatorFor('spritelab2_getStateForThisSprite')(
      fakeBlock({NAME: 'jump count'}),
      fakeGenerator()
    ) as [string, number];
    expect(set).toBe("setProp(__current, '__b2__jump_count', 3);\n");
    expect(get[0]).toBe("(getProp(__current, '__b2__jump_count') || 0)");
  });

  it('report stamps the event with the system being compiled', () => {
    setCurrentBehavior2Name('platformer');
    try {
      const code = generatorFor('spritelab2_reportForThisSprite')(
        fakeBlock({EVENT: 'landed'}),
        fakeGenerator()
      );
      expect(code).toBe(
        'raiseSystemEvent("platformer", "landed", __current);\n'
      );
    } finally {
      clearCurrentBehavior2Name();
    }
  });

  it('when-reports wraps its body in an extraArgs callback', () => {
    const code = generatorFor('spritelab2_whenSystemReports')(
      fakeBlock({SYSTEM: 'platformer', EVENT: 'landed'}),
      fakeGenerator()
    );
    expect(code).toBe(
      'whenSystemReports("platformer", "landed", ' +
        'function (extraArgs) {\n  body();\n});\n'
    );
  });

  it('system names sanitize to word shape', () => {
    // Late require dodges the component-library imports at module scope.
    const {sanitizeSystemName} =
      require('@cdo/apps/p5lab/spritelab/lab2/views/Behavior2Selector') as {
        sanitizeSystemName: (raw: string) => string;
      };
    expect(sanitizeSystemName('  my  wind!! ')).toBe('my wind');
    expect(sanitizeSystemName('$$$')).toBe('');
  });

  it('the reported sprite resolves from extraArgs', () => {
    const result = generatorFor('spritelab2_reportedSprite')(
      fakeBlock({}),
      fakeGenerator()
    ) as [string, number];
    expect(result[0]).toBe('{id: extraArgs.subjectSprite}');
  });

  it('make-with-system tags the group with the system name and starts it once with the middle setting', () => {
    const code = generatorFor('spritelab2_makeSpritesWithSystem')(
      fakeBlock({
        ANIMATION_NAME: '"bee"',
        SYSTEM: 'platformer',
        GRID: [[1]] as unknown as string,
      }),
      fakeGenerator()
    );
    expect(code).toBe(
      'makeSpritesWithSystem("bee", "platformer", [[1]], -0.5);\n'
    );
  });

  it('typed-sprite maker tags the group', () => {
    const code = generatorFor('spritelab2_makeTypedSprites')(
      fakeBlock({
        ANIMATION_NAME: '"bunny"',
        TYPE: 'players',
        GRID: [[1]] as unknown as string,
      }),
      fakeGenerator()
    );
    expect(code).toBe('makeEnvironmentSprites("bunny", \'players\', [[1]]);\n');
  });
});

describe('compileBehavior2Sources', () => {
  it('registers each system under its name, as ES5', () => {
    const code = compileBehavior2Sources([
      {name: 'platformer'},
      {name: 'walk'},
    ]);
    expect(code).toContain('__behavior2s["platformer"] = function');
    expect(code).toContain('__behavior2s["walk"] = function');
    expect(() => parse(code, {ecmaVersion: 5})).not.toThrow();
  });

  it('is empty with no systems (flag-off composition stays byte-identical)', () => {
    expect(compileBehavior2Sources([])).toBe('');
  });
});

describe('sanitizeBehavior2Source', () => {
  // The disable-orphans listener wrote ORPHANED onto stored stacks before
  // the for-each block lost its statement connections; a disabled block
  // compiles to nothing, i.e. an empty system.
  it('strips ORPHANED disable flags, keeps deliberate ones', () => {
    const source = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'spritelab2_forEachSpriteOfType',
            id: 'loop',
            disabledReasons: ['ORPHANED'],
            inputs: {
              DO: {
                block: {
                  type: 'spritelab2_setThisSprite',
                  id: 'inner',
                  disabledReasons: ['ORPHANED', 'MANUALLY_DISABLED'],
                },
              },
            },
          },
        ],
      },
    } as never;
    const out = sanitizeBehavior2Source(source) as never as {
      blocks: {
        blocks: {
          disabledReasons?: string[];
          inputs: {DO: {block: {disabledReasons?: string[]}}};
        }[];
      };
    };
    const loop = out.blocks.blocks[0];
    expect(loop.disabledReasons).toBeUndefined();
    expect(loop.inputs.DO.block.disabledReasons).toEqual(['MANUALLY_DISABLED']);
  });

  it('passes undefined through', () => {
    expect(sanitizeBehavior2Source(undefined)).toBeUndefined();
  });
});

describe('default behavior2 sources', () => {
  // The defaults are hand-authored serializations; a typo'd block type would
  // otherwise surface as a load error in the browser.
  const knownTypes = new Set([
    ...behavior2Blocks.map(b => b.definition.type),
    'controls_if',
    'logic_compare',
    'math_number',
    'math_arithmetic',
  ]);

  interface Node {
    type: string;
    inputs?: {[name: string]: {block: Node}};
    next?: {block: Node};
  }

  const collectTypes = (node: Node, out: string[]) => {
    out.push(node.type);
    Object.values(node.inputs ?? {}).forEach(input =>
      collectTypes(input.block, out)
    );
    if (node.next) {
      collectTypes(node.next.block, out);
    }
  };

  DEFAULT_BEHAVIOR2S.forEach(({name, source}) => {
    it(`${name} references only registered block types`, () => {
      const tops = (source as unknown as {blocks: {blocks: Node[]}}).blocks
        .blocks;
      const used: string[] = [];
      tops.forEach(top => collectTypes(top, used));
      used.forEach(type => expect(knownTypes).toContain(type));
      // And it actually is a per-sprite system, not an empty workspace.
      expect(used).toContain('spritelab2_forEachSpriteOfType');
    });
  });

  it('the platformer reports landed (the composability demo)', () => {
    const platformer = DEFAULT_BEHAVIOR2S.find(b => b.name === 'platformer');
    expect(JSON.stringify(platformer?.source)).toContain(
      'spritelab2_reportForThisSprite'
    );
  });

  it('default ids are unique within each workspace', () => {
    DEFAULT_BEHAVIOR2S.forEach(({source}) => {
      const tops = (source as unknown as {blocks: {blocks: Node[]}}).blocks
        .blocks;
      const ids: string[] = [];
      const collectIds = (node: Node & {id?: string}) => {
        if (node.id) {
          ids.push(node.id);
        }
        Object.values(node.inputs ?? {}).forEach(input =>
          collectIds(input.block)
        );
        if (node.next) {
          collectIds(node.next.block);
        }
      };
      tops.forEach(collectIds);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
