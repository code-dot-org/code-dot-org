import {describe, expect, it} from 'vitest';

import type {
  ToolboxDynamicCategory,
  ToolboxFlyout,
  ToolboxStaticCategory,
} from '../../toolbox/types';
import {
  convertBlocklyXmlToCategories,
  convertBlocklyXmlToJson,
  convertBlocklyXmlToToolbox,
} from '../index';

// jsdom supplies DOMParser; the production caller (BlocklyMarkdown) injects the
// same `new DOMParser()`, so the tests exercise the real parse path.
const parser = new DOMParser();
const toJson = (xml: string) => convertBlocklyXmlToJson(parser, xml);

// Unwrap the doubly-nested {blocks:{blocks:[...]}} envelope the callers consume.
const blocksOf = (xml: string) => toJson(xml).blocks?.blocks ?? [];
const firstBlock = (xml: string) => blocksOf(xml)[0];

describe('convertBlocklyXmlToJson', () => {
  it('parses a single top-level block', () => {
    expect(firstBlock('<xml><block type="text_print" id="b1"/></xml>')).toEqual(
      {type: 'text_print', id: 'b1'},
    );
  });

  it('collects multiple top-level blocks in order', () => {
    const blocks = blocksOf(
      '<xml><block type="a"/><block type="b"/><block type="c"/></xml>',
    );
    expect(blocks.map(b => b.type)).toEqual(['a', 'b', 'c']);
  });

  it('ignores non-block children of the root', () => {
    const blocks = blocksOf(
      '<xml><variables/><block type="a"/><comment/></xml>',
    );
    expect(blocks.map(b => b.type)).toEqual(['a']);
  });

  it('reads x/y only when both are present, as integers', () => {
    expect(
      firstBlock('<xml><block type="t" x="10" y="20"/></xml>'),
    ).toMatchObject({x: 10, y: 20});
    // a lone coordinate is not enough to position the block
    expect(
      firstBlock('<xml><block type="t" x="10"/></xml>'),
    ).not.toHaveProperty('x');
  });

  it('parses deletable/movable through value coercion', () => {
    expect(
      firstBlock(
        '<xml><block type="t" deletable="false" movable="true"/></xml>',
      ),
    ).toMatchObject({deletable: false, movable: true});
  });

  describe('fields', () => {
    it('maps <field name> by name and coerces the text value', () => {
      const block = firstBlock(
        '<xml><block type="math_number">' +
          '<field name="NUM">42</field>' +
          '<field name="LABEL">hello</field>' +
          '<field name="FLAG">true</field>' +
          '</block></xml>',
      );
      expect(block.fields).toEqual({NUM: 42, LABEL: 'hello', FLAG: true});
    });

    it('treats legacy <title> as a field', () => {
      const block = firstBlock(
        '<xml><block type="t"><title name="TEXT">hi</title></block></xml>',
      );
      expect(block.fields).toEqual({TEXT: 'hi'});
    });

    it('omits fields entirely when there are none', () => {
      expect(firstBlock('<xml><block type="t"/></xml>')).not.toHaveProperty(
        'fields',
      );
    });
  });

  describe('value coercion', () => {
    it.each([
      ['42', 42],
      ['3.14', 3.14],
      ['0', 0],
      ['-5', -5],
      ['true', true],
      ['false', false],
      ['', ''],
      ['hello', 'hello'],
      ['5px', '5px'],
    ])('coerces field text %j to %j', (raw, expected) => {
      const block = firstBlock(
        `<xml><block type="t"><field name="V">${raw}</field></block></xml>`,
      );
      expect(block.fields?.V).toBe(expected);
    });
  });

  describe('unknown attributes', () => {
    it('collects them into extraState with coercion', () => {
      const block = firstBlock(
        '<xml><block type="t" foo="bar" count="5" on="true"/></xml>',
      );
      expect(block.extraState).toEqual({foo: 'bar', count: 5, on: true});
    });

    it('does not add extraState when only known attributes are present', () => {
      expect(
        firstBlock('<xml><block type="t" id="x" x="1" y="2"/></xml>'),
      ).not.toHaveProperty('extraState');
    });
  });

  describe('nested structure', () => {
    it('parses value inputs into inputs[name].block', () => {
      const block = firstBlock(
        '<xml><block type="a">' +
          '<value name="X"><block type="b"/></value>' +
          '</block></xml>',
      );
      expect(block.inputs).toEqual({X: {block: {type: 'b'}}});
    });

    it('parses statement inputs into inputs[name].block', () => {
      const block = firstBlock(
        '<xml><block type="a">' +
          '<statement name="DO"><block type="b"/></statement>' +
          '</block></xml>',
      );
      expect(block.inputs).toEqual({DO: {block: {type: 'b'}}});
    });

    it('parses next into next.block', () => {
      const block = firstBlock(
        '<xml><block type="a"><next><block type="b"/></next></block></xml>',
      );
      expect(block.next).toEqual({block: {type: 'b'}});
    });

    it('recurses through chained next blocks', () => {
      const block = firstBlock(
        '<xml><block type="a"><next>' +
          '<block type="b"><next><block type="c"/></next></block>' +
          '</next></block></xml>',
      );
      expect(block.next?.block?.next?.block).toEqual({type: 'c'});
    });
  });

  // The input/next block is the direct-child <block> of the container, never a
  // <block> buried deeper in a preceding sibling such as a <shadow> default.
  describe('direct-child block selection', () => {
    it('selects the direct-child value block, skipping a shadow default', () => {
      const block = firstBlock(
        '<xml><block type="a"><value name="X">' +
          '<shadow type="math_number"><field name="NUM">1</field></shadow>' +
          '<block type="real"/>' +
          '</value></block></xml>',
      );
      expect(block.inputs).toEqual({X: {block: {type: 'real'}}});
    });

    it('ignores a block nested inside a preceding shadow', () => {
      // The shadow's own input holds a block; document order puts that nested
      // block before the real direct child, so a descendant search would wrongly
      // pick it. Direct-child selection takes the outer block.
      const block = firstBlock(
        '<xml><block type="a"><value name="X">' +
          '<shadow type="wrapper">' +
          '<value name="INNER"><block type="nested"/></value>' +
          '</shadow>' +
          '<block type="outer"/>' +
          '</value></block></xml>',
      );
      expect(block.inputs).toEqual({X: {block: {type: 'outer'}}});
    });

    it('leaves the input unset when the only block is nested in a shadow', () => {
      const block = firstBlock(
        '<xml><block type="a"><value name="X">' +
          '<shadow type="wrapper">' +
          '<value name="INNER"><block type="deep"/></value>' +
          '</shadow>' +
          '</value></block></xml>',
      );
      expect(block).not.toHaveProperty('inputs');
    });

    it('selects the direct-child next block, not one nested in a shadow', () => {
      const block = firstBlock(
        '<xml><block type="a"><next>' +
          '<shadow type="wrapper">' +
          '<value name="INNER"><block type="nested"/></value>' +
          '</shadow>' +
          '<block type="outer"/>' +
          '</next></block></xml>',
      );
      expect(block.next).toEqual({block: {type: 'outer'}});
    });
  });

  describe('mutation', () => {
    it('remaps controls_if mutation attrs to canonical extraState', () => {
      const block = firstBlock(
        '<xml><block type="controls_if">' +
          '<mutation elseif="2" else="1"/>' +
          '</block></xml>',
      );
      // elseif -> elseIfCount (a number), else -> hasElse (a boolean): the keys
      // and types controls_if's loadExtraState reads.
      expect(block.extraState).toEqual({elseIfCount: 2, hasElse: true});
      expect(typeof block.extraState.elseIfCount).toBe('number');
    });

    it('coerces generic mutation attribute values', () => {
      const block = firstBlock(
        '<xml><block type="custom_block">' +
          '<mutation count="3" enabled="true" mode="fast"/>' +
          '</block></xml>',
      );
      expect(block.extraState).toEqual({count: 3, enabled: true, mode: 'fast'});
    });

    it('collects procedure arg names into extraState.params', () => {
      const block = firstBlock(
        '<xml><block type="procedures_defnoreturn">' +
          '<mutation><arg name="x"/><arg name="y"/></mutation>' +
          '</block></xml>',
      );
      expect(block.extraState?.params).toEqual(['x', 'y']);
    });
  });
});

describe('convertBlocklyXmlToToolbox', () => {
  it('tags each block with kind and defaults the category name to flyout', () => {
    const flyout = convertBlocklyXmlToToolbox(
      parser,
      '<xml><block type="a"/><block type="b"/></xml>',
    ) as ToolboxFlyout;
    expect(flyout.name).toBe('flyout');
    expect(flyout.blocks).toEqual([
      {kind: 'block', type: 'a'},
      {kind: 'block', type: 'b'},
    ]);
  });

  it('uses the supplied category name', () => {
    const flyout = convertBlocklyXmlToToolbox(
      parser,
      '<xml><block type="a"/></xml>',
      'Loops',
    ) as ToolboxFlyout;
    expect(flyout.name).toBe('Loops');
  });

  it('delegates to categories when the root has a <category> child', () => {
    const categories = convertBlocklyXmlToToolbox(
      parser,
      '<xml><category name="Actions"><block type="a"/></category></xml>',
    ) as ToolboxStaticCategory[];
    expect(categories).toEqual([{name: 'Actions', blocks: [{kind: 'block', type: 'a'}]}]);
  });
});

describe('convertBlocklyXmlToCategories', () => {
  it('parses a real category-using level fixture (course3_bee_functions_challenge1)', () => {
    const categories = convertBlocklyXmlToCategories(
      parser,
      `<xml>
        <category name="Actions">
          <block type="maze_move"><title name="DIR">moveForward</title></block>
          <block type="maze_turn"><title name="DIR">turnRight</title></block>
          <block type="maze_turn"><title name="DIR">turnLeft</title></block>
          <block type="maze_nectar"/>
          <block type="maze_honey"/>
        </category>
        <category name="Loops">
          <block type="controls_repeat"><title name="TIMES">???</title></block>
        </category>
        <category name="Conditionals">
          <block type="bee_ifElseFlower"><title name="LOC">atFlower</title></block>
          <block type="bee_ifFlower"><title name="LOC">atFlower</title></block>
        </category>
        <category name="Functions" custom="PROCEDURE"/>
      </xml>`,
    );

    expect(categories).toHaveLength(4);
    expect((categories[0] as ToolboxStaticCategory).name).toBe('Actions');
    expect((categories[0] as ToolboxStaticCategory).blocks).toEqual([
      {kind: 'block', type: 'maze_move', fields: {DIR: 'moveForward'}},
      {kind: 'block', type: 'maze_turn', fields: {DIR: 'turnRight'}},
      {kind: 'block', type: 'maze_turn', fields: {DIR: 'turnLeft'}},
      {kind: 'block', type: 'maze_nectar'},
      {kind: 'block', type: 'maze_honey'},
    ]);

    const functions = categories[3] as ToolboxDynamicCategory;
    expect(functions.name).toBe('Functions');
    expect(functions.key).toBe('PROCEDURE');
    expect(functions.onLoad).toBeInstanceOf(Function);
  });

  it('preserves limit as extraState on a category block (course3_bee_functions_challenge3)', () => {
    const categories = convertBlocklyXmlToCategories(
      parser,
      `<xml>
        <category name="Default"/>
        <category name="Actions">
          <block type="maze_moveForward"/>
          <block type="maze_nectar" limit="2"/>
        </category>
      </xml>`,
    );

    expect(categories).toHaveLength(2);
    expect((categories[0] as ToolboxStaticCategory).blocks).toEqual([]);
    expect((categories[1] as ToolboxStaticCategory).blocks).toEqual([
      {kind: 'block', type: 'maze_moveForward'},
      {kind: 'block', type: 'maze_nectar', extraState: {limit: 2}},
    ]);
  });

  it('leaves an unrecognised custom category dynamic but loader-less', () => {
    const categories = convertBlocklyXmlToCategories(
      parser,
      '<xml><category name="Mystery" custom="SOMETHING_ELSE"/></xml>',
    );
    const category = categories[0] as ToolboxDynamicCategory;
    expect(category.key).toBe('SOMETHING_ELSE');
    expect(category.onLoad).toBeUndefined();
  });
});
