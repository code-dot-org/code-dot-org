import * as Blockly from 'blockly/core';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';

import {
  arrayToMap,
  CdoFieldDropdown,
  EMPTY_OPTION,
  getUpdatedOptionsFromConfig,
  numberListToString,
  printerStyleNumberRangeToList,
} from '../index';

// Ported from apps' test/unit/blockly/utilsTest.js.
describe('printerStyleNumberRangeToList', () => {
  it('reads numbers and ranges', () => {
    expect(printerStyleNumberRangeToList('1,2,4-6')).toEqual([1, 2, 4, 5, 6]);
    expect(printerStyleNumberRangeToList('5-7, 12, 15')).toEqual([
      5, 6, 7, 12, 15,
    ]);
    expect(printerStyleNumberRangeToList('1,2,4,6')).toEqual([1, 2, 4, 6]);
    expect(printerStyleNumberRangeToList('1-3,5-7')).toEqual([
      1, 2, 3, 5, 6, 7,
    ]);
  });

  it('returns an empty list for a string with no numbers', () => {
    expect(
      printerStyleNumberRangeToList('&quot;CAT&quot;, &quot;SLOTH&quot;'),
    ).toEqual([]);
  });
});

describe('numberListToString', () => {
  it('joins numbers with commas', () => {
    expect(numberListToString([1, 2, 3, 4, 5])).toBe('1,2,3,4,5');
    expect(numberListToString([5])).toBe('5');
    expect(numberListToString([])).toBe('');
  });
});

// Ported from apps' test/unit/blockly/addons/cdoFieldDropdownTest.js.
describe('getUpdatedOptionsFromConfig', () => {
  const animals: [string, string][] = [
    ['cat', "'CAT'"],
    ['sloth', "'SLOTH'"],
    ['alien', "'ALIEN'"],
    ['bear', "'BEAR'"],
  ];

  it('reads a number range', () => {
    expect(getUpdatedOptionsFromConfig('6-8', {})).toEqual([
      ['6', '6'],
      ['7', '7'],
      ['8', '8'],
    ]);
  });

  it('reads numbers separated by commas', () => {
    expect(getUpdatedOptionsFromConfig('2, 5, 11', {})).toEqual([
      ['2', '2'],
      ['5', '5'],
      ['11', '11'],
    ]);
  });

  it('reads numbers and ranges together', () => {
    expect(getUpdatedOptionsFromConfig('2, 4, 16-18', {})).toEqual([
      ['2', '2'],
      ['4', '4'],
      ['16', '16'],
      ['17', '17'],
      ['18', '18'],
    ]);
  });

  it('narrows existing options, keeping their labels', () => {
    expect(
      getUpdatedOptionsFromConfig("'CAT', 'SLOTH'", arrayToMap(animals)),
    ).toEqual([
      ['cat', "'CAT'"],
      ['sloth', "'SLOTH'"],
    ]);
  });

  it('labels a value the field did not offer by unquoting and lowercasing', () => {
    expect(
      getUpdatedOptionsFromConfig(
        "'CAT', 'SLOTH', 'GIRAFFE'",
        arrayToMap(animals),
      ),
    ).toEqual([
      ['cat', "'CAT'"],
      ['sloth', "'SLOTH'"],
      ['giraffe', "'GIRAFFE'"],
    ]);
    expect(getUpdatedOptionsFromConfig('"GIRAFFE"', {})).toEqual([
      ['giraffe', '"GIRAFFE"'],
    ]);
  });

  it('keeps a label that differs from its value', () => {
    const options: [string, string][] = [
      ['size', "'scale'"],
      ['rotation', "'rotation'"],
      ['direction', "'direction'"],
    ];
    expect(
      getUpdatedOptionsFromConfig("'scale', 'rotation'", arrayToMap(options)),
    ).toEqual([
      ['size', "'scale'"],
      ['rotation', "'rotation'"],
    ]);
  });
});

describe('arrayToMap', () => {
  it('maps values to labels, and a generator function to nothing', () => {
    expect(arrayToMap([['first item', 'ITEM1']])).toEqual({
      ITEM1: 'first item',
    });
    expect(arrayToMap(() => [['a', 'A']])).toEqual({});
  });
});

describe('CdoFieldDropdown', () => {
  const TYPE = 'cdo_field_dropdown_test';
  let workspace: Blockly.Workspace;

  beforeAll(() => {
    Blockly.Blocks[TYPE] = {
      init(this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(new CdoFieldDropdown(), 'EMPTY')
          .appendField(
            new CdoFieldDropdown([
              ['cat', '"CAT"'],
              ['dog', '"DOG"'],
            ]),
            'ANIMAL',
          );
      },
    };
  });

  afterAll(() => {
    delete Blockly.Blocks[TYPE];
  });

  const newBlock = () => {
    workspace = new Blockly.Workspace();
    return workspace.newBlock(TYPE);
  };

  it('starts with an empty menu', () => {
    const field = new CdoFieldDropdown();
    expect(field.getOptions()).toEqual([['', '']]);
  });

  it('accepts ??? without offering it', () => {
    const block = newBlock();
    block.setFieldValue(EMPTY_OPTION, 'ANIMAL');
    expect(block.getFieldValue('ANIMAL')).toBe(EMPTY_OPTION);
    expect(block.getField('ANIMAL')?.getText()).toBe(EMPTY_OPTION);
    workspace.dispose();
  });

  it('accepts a value the options hold only in quotes', () => {
    const block = newBlock();
    block.setFieldValue('DOG', 'ANIMAL');
    expect(block.getFieldValue('ANIMAL')).toBe('"DOG"');
    workspace.dispose();
  });

  it('refuses a value it does not offer', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const block = newBlock();
    block.setFieldValue('"BEAR"', 'ANIMAL');
    expect(block.getFieldValue('ANIMAL')).toBe('"CAT"');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    workspace.dispose();
  });

  it('takes its options from a config attribute in XML', () => {
    workspace = new Blockly.Workspace();
    const block = Blockly.Xml.domToBlock(
      Blockly.utils.xml.textToDom(
        `<block xmlns="https://developers.google.com/blockly/xml" type="${TYPE}">` +
          '<field name="EMPTY" config="1-3,5">3</field>' +
          '<field name="ANIMAL" config="&quot;DOG&quot;,&quot;BEAR&quot;">"BEAR"</field>' +
          '</block>',
      ),
      workspace,
    );
    const empty = block.getField('EMPTY') as CdoFieldDropdown;
    expect(empty.getOptions()).toEqual([
      ['1', '1'],
      ['2', '2'],
      ['3', '3'],
      ['5', '5'],
    ]);
    expect(empty.getValue()).toBe('3');
    const animal = block.getField('ANIMAL') as CdoFieldDropdown;
    expect(animal.getOptions()).toEqual([
      ['dog', '"DOG"'],
      ['bear', '"BEAR"'],
    ]);
    expect(animal.getValue()).toBe('"BEAR"');

    const xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
    expect(xml).toContain('<field name="EMPTY" config="1-3,5">3</field>');
    workspace.dispose();
  });

  it('saves as its XML string and loads that back with its config', () => {
    workspace = new Blockly.Workspace();
    const block = Blockly.Xml.domToBlock(
      Blockly.utils.xml.textToDom(
        `<block xmlns="https://developers.google.com/blockly/xml" type="${TYPE}">` +
          '<field name="EMPTY" config="2-4">4</field>' +
          '</block>',
      ),
      workspace,
    );
    const state = Blockly.serialization.blocks.save(block);
    const saved = state?.fields?.EMPTY as string;
    expect(saved).toMatch(/<field .*config="2-4".*>4<\/field>/);

    const loaded = Blockly.serialization.blocks.append(
      state as Blockly.serialization.blocks.State,
      workspace,
    );
    expect(loaded.getFieldValue('EMPTY')).toBe('4');
    expect((loaded.getField('EMPTY') as CdoFieldDropdown).getOptions()).toEqual(
      [
        ['2', '2'],
        ['3', '3'],
        ['4', '4'],
      ],
    );
    workspace.dispose();
  });

  it('loads a plain JSON value', () => {
    workspace = new Blockly.Workspace();
    const loaded = Blockly.serialization.blocks.append(
      {type: TYPE, fields: {ANIMAL: '"DOG"'}},
      workspace,
    );
    expect(loaded.getFieldValue('ANIMAL')).toBe('"DOG"');
    workspace.dispose();
  });

  it('loads ??? from XML', () => {
    workspace = new Blockly.Workspace();
    const loaded = Blockly.serialization.blocks.append(
      {
        type: TYPE,
        fields: {
          EMPTY:
            '<field xmlns="https://developers.google.com/blockly/xml" name="EMPTY">???</field>',
        },
      },
      workspace,
    );
    expect(loaded.getFieldValue('EMPTY')).toBe(EMPTY_OPTION);
    workspace.dispose();
  });
});
