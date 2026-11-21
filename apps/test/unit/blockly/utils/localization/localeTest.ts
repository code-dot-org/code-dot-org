import {getBlockDefinitionsForUpdatedLocale} from '@cdo/apps/blockly/utils/localization/locale';

jest.mock('@cdo/apps/localization', () => {
  const dictionary: {[source: string]: string} = {
    'move {DIR}': 'mover {DIR}',
    up: 'arriba',
    '[block] up': '[block] hacia arriba',
    'turn left': 'girar a la izquierda',
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

function optionsAfterTranslation(options: Options): Options {
  const definition = {
    name: 'gamelab_move',
    config: {
      blockText: 'move {DIR}',
      args: [{name: 'DIR', customInput: '', options}],
    },
  };
  (global as unknown as {Blockly: unknown}).Blockly = {
    SourceCustomBlocks: {
      blockDefinitionsByName: {gamelab_move: definition},
      blockTexts: {},
    },
  };
  const [result] = getBlockDefinitionsForUpdatedLocale(false);
  return result.config.args[0].options as Options;
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
    optionsAfterTranslation([['turn left', 'left']]);
    const definition = (
      global as unknown as {
        Blockly: {
          SourceCustomBlocks: {
            blockDefinitionsByName: {
              gamelab_move: {config: {sourceArgs: {options: Options}[]}};
            };
          };
        };
      }
    ).Blockly.SourceCustomBlocks.blockDefinitionsByName.gamelab_move;
    expect(definition.config.sourceArgs[0].options).toEqual([
      ['turn left', 'left'],
    ]);
  });
});
