import * as Blockly from 'blockly/core';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';

import {
  arrayToMap,
  CdoFieldDropdown,
  plugin as cdoFieldDropdownPlugin,
  EMPTY_OPTION,
  getUpdatedOptionsFromConfig,
  numberListToString,
  printerStyleNumberRangeToList,
} from '../index';

// Ported from apps' test/unit/blockly/utilsTest.js.
describe('fields.md: printerStyleNumberRangeToList', () => {
  it('FLD-8: reads numbers and ranges', () => {
    expect(printerStyleNumberRangeToList('1,2,4-6')).toEqual([1, 2, 4, 5, 6]);
    expect(printerStyleNumberRangeToList('5-7, 12, 15')).toEqual([
      5, 6, 7, 12, 15,
    ]);
    expect(printerStyleNumberRangeToList('1,2,4,6')).toEqual([1, 2, 4, 6]);
    expect(printerStyleNumberRangeToList('1-3,5-7')).toEqual([
      1, 2, 3, 5, 6, 7,
    ]);
  });

  it('FLD-8: returns an empty list for a string with no numbers', () => {
    expect(
      printerStyleNumberRangeToList('&quot;CAT&quot;, &quot;SLOTH&quot;'),
    ).toEqual([]);
  });
});

describe('fields.md: numberListToString', () => {
  it('FLD-8: joins numbers with commas', () => {
    expect(numberListToString([1, 2, 3, 4, 5])).toBe('1,2,3,4,5');
    expect(numberListToString([5])).toBe('5');
    expect(numberListToString([])).toBe('');
  });
});

// Ported from apps' test/unit/blockly/addons/cdoFieldDropdownTest.js.
describe('fields.md: getUpdatedOptionsFromConfig', () => {
  const animals: [string, string][] = [
    ['cat', "'CAT'"],
    ['sloth', "'SLOTH'"],
    ['alien', "'ALIEN'"],
    ['bear', "'BEAR'"],
  ];

  it('FLD-7: reads a number range', () => {
    expect(getUpdatedOptionsFromConfig('6-8', {})).toEqual([
      ['6', '6'],
      ['7', '7'],
      ['8', '8'],
    ]);
  });

  it('FLD-7: reads numbers separated by commas', () => {
    expect(getUpdatedOptionsFromConfig('2, 5, 11', {})).toEqual([
      ['2', '2'],
      ['5', '5'],
      ['11', '11'],
    ]);
  });

  it('FLD-7: reads numbers and ranges together', () => {
    expect(getUpdatedOptionsFromConfig('2, 4, 16-18', {})).toEqual([
      ['2', '2'],
      ['4', '4'],
      ['16', '16'],
      ['17', '17'],
      ['18', '18'],
    ]);
  });

  it('FLD-7: narrows existing options, keeping their labels', () => {
    expect(
      getUpdatedOptionsFromConfig("'CAT', 'SLOTH'", arrayToMap(animals)),
    ).toEqual([
      ['cat', "'CAT'"],
      ['sloth', "'SLOTH'"],
    ]);
  });

  it('FLD-7: labels a value the field did not offer by unquoting and lowercasing', () => {
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

  it('FLD-7: keeps a label that differs from its value', () => {
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

describe('fields.md: arrayToMap', () => {
  it('FLD-7: maps values to labels, and a generator function to nothing', () => {
    expect(arrayToMap([['first item', 'ITEM1']])).toEqual({
      ITEM1: 'first item',
    });
    expect(arrayToMap(() => [['a', 'A']])).toEqual({});
  });
});

describe('fields.md: CdoFieldDropdown', () => {
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

  it('FLD-1: starts with an empty menu', () => {
    const field = new CdoFieldDropdown();
    expect(field.getOptions()).toEqual([['', '']]);
  });

  it('FLD-2: accepts ??? without offering it', () => {
    const block = newBlock();
    block.setFieldValue(EMPTY_OPTION, 'ANIMAL');
    expect(block.getFieldValue('ANIMAL')).toBe(EMPTY_OPTION);
    expect(block.getField('ANIMAL')?.getText()).toBe(EMPTY_OPTION);
    workspace.dispose();
  });

  it('FLD-3: accepts a value the options hold only in quotes', () => {
    const block = newBlock();
    block.setFieldValue('DOG', 'ANIMAL');
    expect(block.getFieldValue('ANIMAL')).toBe('"DOG"');
    workspace.dispose();
  });

  it('FLD-4: refuses a value it does not offer', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const block = newBlock();
    block.setFieldValue('"BEAR"', 'ANIMAL');
    expect(block.getFieldValue('ANIMAL')).toBe('"CAT"');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    workspace.dispose();
  });

  it('FLD-5: takes its options from a config attribute in XML', () => {
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

  it('FLD-5, FLD-6: saves as its XML string and loads that back with its config', () => {
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

  it('FLD-6: loads a plain JSON value', () => {
    workspace = new Blockly.Workspace();
    const loaded = Blockly.serialization.blocks.append(
      {type: TYPE, fields: {ANIMAL: '"DOG"'}},
      workspace,
    );
    expect(loaded.getFieldValue('ANIMAL')).toBe('"DOG"');
    workspace.dispose();
  });

  it('FLD-2, FLD-6: loads ??? from XML', () => {
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

describe('fields.md: the dropdown, worked examples', () => {
  it('FLD-8: ignores spaces and items that name no numbers', () => {
    expect(printerStyleNumberRangeToList('1, 2,4-6, x')).toEqual([
      1, 2, 4, 5, 6,
    ]);
  });

  it('FLD-1: is registered as field_cdo_dropdown', () => {
    expect(cdoFieldDropdownPlugin).toMatchObject({
      type: 'field',
      name: 'field_cdo_dropdown',
      field: CdoFieldDropdown,
    });
  });
});

describe('fields.md: right-to-left text', () => {
  it('FLD-9: a right-to-left block shows the text between override and pop marks', () => {
    const rtl = new Blockly.Workspace(
      new Blockly.Options({rtl: true} as Blockly.BlocklyOptions),
    );
    const ltr = new Blockly.Workspace();
    Blockly.Blocks.cdo_field_dropdown_rtl = {
      init(this: Blockly.Block) {
        this.appendDummyInput().appendField(
          new CdoFieldDropdown([['big cat', '"CAT"']]),
          'ANIMAL',
        );
      },
    };
    const shown = (workspace: Blockly.Workspace) => {
      const block = workspace.newBlock('cdo_field_dropdown_rtl');
      const field = block.getField('ANIMAL') as unknown as {
        getDisplayText_(): string;
      };
      return field.getDisplayText_();
    };
    try {
      // Blockly's non-breaking space is kept.
      expect(shown(rtl)).toBe('\u202Ebig\u00A0cat\u202C');
      expect(shown(ltr)).toBe('big\u00A0cat');
    } finally {
      rtl.dispose();
      ltr.dispose();
      delete Blockly.Blocks.cdo_field_dropdown_rtl;
    }
  });
});
