import {getBlockDefinitionsForUpdatedLocale} from '@cdo/apps/blockly/utils/localization/locale';

jest.mock('@cdo/apps/localization', () => {
  const dictionary: {[source: string]: string} = {
    'move {DIR}': 'mover {DIR}',
    up: 'arriba',
    '[block] up': '[block] hacia arriba',
    'turn left': 'girar a la izquierda',
    // Translating a translation again would show this.
    'girar a la izquierda': 'translated twice',
    // Never wanted: options whose text is a value, not words.
    '5': 'cinco',
    '#ff0000': 'rojo',
  };
  return {
    __esModule: true,
    default: {
      // The real translate treats an object as a hash and rewrites its values.
      translate: jest.fn((text: unknown) => {
        if (typeof text !== 'string') {
          throw new Error('translate was given a non-string');
        }
        return dictionary[text] ?? text;
      }),
    },
  };
});

type Options = unknown[];

type Definition = {
  name: string;
  config: {blockText: string; args: {options?: Options}[]};
};

type TestBlockly = {
  SourceCustomBlocks: {
    blockDefinitionsByName: {[name: string]: Definition};
    blockTexts: {[name: string]: string};
    blockArgs: {[name: string]: unknown};
  };
};

function moveBlock(options: Options): Definition {
  return {
    name: 'gamelab_move',
    config: {
      blockText: 'move {DIR}',
      args: [{name: 'DIR', customInput: '', options} as {options: Options}],
    },
  };
}

function install(definition: Definition): TestBlockly {
  const blockly: TestBlockly = {
    SourceCustomBlocks: {
      blockDefinitionsByName: {gamelab_move: definition},
      blockTexts: {},
      blockArgs: {},
    },
  };
  (global as unknown as {Blockly: unknown}).Blockly = blockly;
  return blockly;
}

// Returns the options after one locale change, storing the result back the
// way installCustomBlocks does.
function changeLocale(blockly: TestBlockly): Options {
  const [result] = getBlockDefinitionsForUpdatedLocale(false);
  blockly.SourceCustomBlocks.blockDefinitionsByName.gamelab_move =
    result as unknown as Definition;
  return result.config.args[0].options as Options;
}

function optionsAfterTranslation(options: Options): Options {
  return changeLocale(install(moveBlock(options)));
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

describe('getBlockDefinitionsForUpdatedLocale', () => {
  afterEach(() => {
    delete (global as unknown as {Blockly?: unknown}).Blockly;
  });

  it('translates option text and keeps option values', () => {
    expect(optionsAfterTranslation([['turn left', 'left']])).toEqual([
      ['girar a la izquierda', 'left'],
    ]);
  });

  it('sends short option text with the [block] prefix', () => {
    expect(optionsAfterTranslation([['up', 'up']])).toEqual([
      ['hacia arriba', 'up'],
    ]);
  });

  it('leaves numbers and hex colours untranslated', () => {
    const options = [
      ['5', '5'],
      ['#ff0000', '#ff0000'],
    ];
    expect(optionsAfterTranslation(options)).toEqual(options);
  });

  it('leaves image options and plain-string options alone', () => {
    const image = [{src: 'up.png', width: 16, height: 16, alt: 'up'}, 'up'];
    expect(optionsAfterTranslation([image, 'down.png'])).toEqual([
      image,
      'down.png',
    ]);
  });

  it('translates from the English options on every locale change', () => {
    const blockly = install(moveBlock([['turn left', 'left']]));
    changeLocale(blockly);
    expect(changeLocale(blockly)).toEqual([['girar a la izquierda', 'left']]);
  });

  it('translates a frozen definition without changing it', () => {
    const definition = deepFreeze(moveBlock([['turn left', 'left']]));
    const blockly = install(definition);
    expect(changeLocale(blockly)).toEqual([['girar a la izquierda', 'left']]);
    expect(changeLocale(blockly)).toEqual([['girar a la izquierda', 'left']]);
    expect(definition.config.args[0].options).toEqual([['turn left', 'left']]);
  });
});
