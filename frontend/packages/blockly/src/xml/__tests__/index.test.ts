import {describe, expect, it} from 'vitest';

import {convertBlocklyXmlToJson, convertBlocklyXmlToToolbox} from '../index';

// jsdom supplies DOMParser; the production caller (BlocklyMarkdown) injects the
// same `new DOMParser()`, so the tests exercise the real parse path.
const parser = new DOMParser();
const toJson = (xml: string) => convertBlocklyXmlToJson(parser, xml);

// Unwrap the doubly-nested {blocks:{blocks:[...]}} envelope the callers consume.
const blocksOf = (xml: string) => toJson(xml).blocks?.blocks ?? [];
const firstBlock = (xml: string) => blocksOf(xml)[0];

describe('xml-toolbox.md: convertBlocklyXmlToJson', () => {
  it('XML-1: parses a single top-level block', () => {
    expect(firstBlock('<xml><block type="text_print" id="b1"/></xml>')).toEqual(
      {type: 'text_print', id: 'b1'},
    );
  });

  it('XML-1: collects multiple top-level blocks in order', () => {
    const blocks = blocksOf(
      '<xml><block type="a"/><block type="b"/><block type="c"/></xml>',
    );
    expect(blocks.map(b => b.type)).toEqual(['a', 'b', 'c']);
  });

  it('XML-1: ignores non-block children of the root', () => {
    const blocks = blocksOf(
      '<xml><variables/><block type="a"/><comment/></xml>',
    );
    expect(blocks.map(b => b.type)).toEqual(['a']);
  });

  it('XML-2: reads x/y only when both are present, as integers', () => {
    expect(
      firstBlock('<xml><block type="t" x="10" y="20"/></xml>'),
    ).toMatchObject({x: 10, y: 20});
    // a lone coordinate is not enough to position the block
    expect(
      firstBlock('<xml><block type="t" x="10"/></xml>'),
    ).not.toHaveProperty('x');
  });

  it('XML-2: parses deletable/movable through value coercion', () => {
    expect(
      firstBlock(
        '<xml><block type="t" deletable="false" movable="true"/></xml>',
      ),
    ).toMatchObject({deletable: false, movable: true});
  });

  describe('fields', () => {
    it('XML-5, XML-V5: maps <field name> by name and keeps its text', () => {
      const block = firstBlock(
        '<xml><block type="math_number">' +
          '<field name="NUM">42</field>' +
          '<field name="LABEL">hello</field>' +
          '<field name="FLAG">true</field>' +
          '<field name="CODE">007</field>' +
          '</block></xml>',
      );
      expect(block.fields).toEqual({
        NUM: '42',
        LABEL: 'hello',
        FLAG: 'true',
        CODE: '007',
      });
    });

    it('XML-5: treats legacy <title> as a field', () => {
      const block = firstBlock(
        '<xml><block type="t"><title name="TEXT">hi</title></block></xml>',
      );
      expect(block.fields).toEqual({TEXT: 'hi'});
    });

    it('XML-5: omits fields entirely when there are none', () => {
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
    ])('XML-4: coerces attribute text %j to %j', (raw, expected) => {
      const block = firstBlock(`<xml><block type="t" v="${raw}"/></xml>`);
      expect(block.extraState?.v).toBe(expected);
    });
  });

  describe("Blockly's own attributes", () => {
    it('XML-3, XML-V6: maps disabled, inline, collapsed and editable', () => {
      const block = firstBlock(
        '<xml><block type="t" disabled="true" inline="false"' +
          ' collapsed="true" editable="false"/></xml>',
      );
      expect(block).toMatchObject({
        disabledReasons: ['MANUALLY_DISABLED'],
        inline: false,
        collapsed: true,
        editable: false,
      });
      expect(block).not.toHaveProperty('extraState');
    });
  });

  describe('unknown attributes', () => {
    it('XML-3: collects them into extraState with coercion', () => {
      const block = firstBlock(
        '<xml><block type="t" foo="bar" count="5" on="true"/></xml>',
      );
      expect(block.extraState).toEqual({foo: 'bar', count: 5, on: true});
    });

    it('XML-3: does not add extraState when only known attributes are present', () => {
      expect(
        firstBlock('<xml><block type="t" id="x" x="1" y="2"/></xml>'),
      ).not.toHaveProperty('extraState');
    });
  });

  describe('nested structure', () => {
    it('XML-6: parses value inputs into inputs[name].block', () => {
      const block = firstBlock(
        '<xml><block type="a">' +
          '<value name="X"><block type="b"/></value>' +
          '</block></xml>',
      );
      expect(block.inputs).toEqual({X: {block: {type: 'b'}}});
    });

    it('XML-6: parses statement inputs into inputs[name].block', () => {
      const block = firstBlock(
        '<xml><block type="a">' +
          '<statement name="DO"><block type="b"/></statement>' +
          '</block></xml>',
      );
      expect(block.inputs).toEqual({DO: {block: {type: 'b'}}});
    });

    it('XML-6: parses next into next.block', () => {
      const block = firstBlock(
        '<xml><block type="a"><next><block type="b"/></next></block></xml>',
      );
      expect(block.next).toEqual({block: {type: 'b'}});
    });

    it('XML-6: recurses through chained next blocks', () => {
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
    it('XML-6: selects the direct-child value block, skipping a shadow default', () => {
      const block = firstBlock(
        '<xml><block type="a"><value name="X">' +
          '<shadow type="math_number"><field name="NUM">1</field></shadow>' +
          '<block type="real"/>' +
          '</value></block></xml>',
      );
      expect(block.inputs).toEqual({
        X: {
          block: {type: 'real'},
          shadow: {type: 'math_number', fields: {NUM: '1'}},
        },
      });
    });

    it('XML-6: ignores a block nested inside a preceding shadow', () => {
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
      expect(block.inputs?.X.block).toEqual({type: 'outer'});
    });

    it("XML-6, XML-V2: keeps a shadow that is the input's only content", () => {
      const block = firstBlock(
        '<xml><block type="a"><value name="X">' +
          '<shadow type="wrapper">' +
          '<value name="INNER"><block type="deep"/></value>' +
          '</shadow>' +
          '</value></block></xml>',
      );
      expect(block.inputs).toEqual({
        X: {
          shadow: {
            type: 'wrapper',
            inputs: {INNER: {block: {type: 'deep'}}},
          },
        },
      });
    });

    it('XML-6: selects the direct-child next block, not one nested in a shadow', () => {
      const block = firstBlock(
        '<xml><block type="a"><next>' +
          '<shadow type="wrapper">' +
          '<value name="INNER"><block type="nested"/></value>' +
          '</shadow>' +
          '<block type="outer"/>' +
          '</next></block></xml>',
      );
      expect(block.next?.block).toEqual({type: 'outer'});
    });
  });

  describe('mutation', () => {
    it('XML-7: remaps controls_if mutation attrs to canonical extraState', () => {
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

    it('XML-7: coerces generic mutation attribute values', () => {
      const block = firstBlock(
        '<xml><block type="custom_block">' +
          '<mutation count="3" enabled="true" mode="fast"/>' +
          '</block></xml>',
      );
      expect(block.extraState).toEqual({count: 3, enabled: true, mode: 'fast'});
    });

    it("XML-7: collects a definition's args as named objects", () => {
      const block = firstBlock(
        '<xml><block type="procedures_defnoreturn">' +
          '<mutation><arg name="x" varid="vx"/><arg name="y"/></mutation>' +
          '</block></xml>',
      );
      expect(block.extraState?.params).toEqual([
        {name: 'x', id: 'vx'},
        {name: 'y'},
      ]);
    });

    it("XML-7: collects a call's args as names", () => {
      const block = firstBlock(
        '<xml><block type="procedures_callnoreturn">' +
          '<mutation name="f"><arg name="x"/></mutation>' +
          '</block></xml>',
      );
      expect(block.extraState).toEqual({name: 'f', params: ['x']});
    });
  });
});

describe('xml-toolbox.md: convertBlocklyXmlToToolbox', () => {
  it('XML-8: tags each block with kind and defaults the category name to flyout', () => {
    const flyout = convertBlocklyXmlToToolbox(
      parser,
      '<xml><block type="a"/><block type="b"/></xml>',
    );
    expect(flyout.name).toBe('flyout');
    expect(flyout.blocks).toEqual([
      {kind: 'block', type: 'a'},
      {kind: 'block', type: 'b'},
    ]);
  });

  it('XML-8: uses the supplied category name', () => {
    const flyout = convertBlocklyXmlToToolbox(
      parser,
      '<xml><block type="a"/></xml>',
      'Loops',
    );
    expect(flyout.name).toBe('Loops');
  });
});
