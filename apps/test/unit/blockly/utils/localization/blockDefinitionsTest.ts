import * as BlocklyCore from 'blockly/core';

import {BlockJson} from '@cdo/apps/blockly/types';
import {
  localizeJsonBlockDefinition,
  translateBlockMessage,
} from '@cdo/apps/blockly/utils/localization/blockDefinitions';
import localization from '@cdo/apps/localization';

const SPANISH: {[source: string]: string} = {
  'make new %1 sprite at %2': 'crear un sprite %1 nuevo en %2',
  'set weather to %1': 'cambiar el clima',
  left: 'izquierda',
  center: 'centro',
  'Makes a sprite.': 'Crea un sprite.',
};

const MAKE_SPRITE: BlockJson = {
  type: 'spritelab2_makeSpriteAtPosition',
  message0: 'make new %1 sprite at %2',
  args0: [
    {type: 'field_costume', name: 'ANIMATION_NAME'},
    {
      type: 'field_dropdown',
      name: 'POSITION',
      options: [
        ['left', 'left'],
        ['center', 'center'],
        ['7', '7'],
      ],
    },
  ],
  tooltip: 'Makes a sprite.',
};

let locale = 'es-MX';
let translate: jest.SpyInstance;

beforeEach(() => {
  locale = 'es-MX';
  jest.spyOn(localization, 'locale', 'get').mockImplementation(() => locale);
  translate = jest
    .spyOn(localization, 'translate')
    .mockImplementation(
      (text: unknown) => (SPANISH[text as string] ?? text) as never
    );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('translateBlockMessage', () => {
  it('sends the message as a string, %N and all', () => {
    expect(translateBlockMessage('make new %1 sprite at %2')).toBe(
      'crear un sprite %1 nuevo en %2'
    );
    expect(translate).toHaveBeenCalledWith('make new %1 sprite at %2', [
      'blockly-block',
    ]);
  });

  it('keeps the English message when the translation drops an argument', () => {
    expect(translateBlockMessage('set weather to %1')).toBe(
      'set weather to %1'
    );
  });
});

describe('localizeJsonBlockDefinition', () => {
  it('translates the message, option text and tooltip', () => {
    const localized = localizeJsonBlockDefinition(MAKE_SPRITE);
    expect(localized.message0).toBe('crear un sprite %1 nuevo en %2');
    expect(
      (localized.args0[1] as unknown as {options: string[][]}).options
    ).toEqual([
      ['izquierda', 'left'],
      ['centro', 'center'],
      ['7', '7'],
    ]);
    expect(localized.tooltip).toBe('Crea un sprite.');
  });

  it('leaves the definition it was given unchanged', () => {
    localizeJsonBlockDefinition(MAKE_SPRITE);
    expect(MAKE_SPRITE.message0).toBe('make new %1 sprite at %2');
  });

  it('returns the definition itself in English', () => {
    locale = 'en-US';
    expect(localizeJsonBlockDefinition(MAKE_SPRITE)).toBe(MAKE_SPRITE);
    expect(translate).not.toHaveBeenCalled();
  });
});

describe('a translated JSON block', () => {
  it('builds in Blockly with its fields in the translated order', () => {
    const definition: BlockJson = {
      ...MAKE_SPRITE,
      type: 'test_localized_make_sprite',
      args0: [
        {type: 'field_input', name: 'ANIMATION_NAME', text: 'cat'},
        MAKE_SPRITE.args0[1],
      ] as BlockJson['args0'],
    };
    BlocklyCore.Blocks[definition.type] = {
      init(this: BlocklyCore.Block) {
        this.jsonInit(localizeJsonBlockDefinition(definition));
      },
    };
    const workspace = new BlocklyCore.Workspace();
    const block = workspace.newBlock(definition.type);
    const row = block.inputList[0].fieldRow.map(f => f.name || f.getText());
    expect(row).toEqual([
      'crear un sprite',
      'ANIMATION_NAME',
      'nuevo en',
      'POSITION',
    ]);
    expect(block.getFieldValue('POSITION')).toBe('left');
    workspace.dispose();
    delete BlocklyCore.Blocks[definition.type];
  });
});
