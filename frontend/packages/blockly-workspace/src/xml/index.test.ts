import {describe, expect, it} from 'vitest';

import {convertBlocklyXmlToJson, convertBlocklyXmlToToolbox} from './index';

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

  describe('mutation', () => {
    it('lifts mutation attributes into extraState, renaming elseif', () => {
      const block = firstBlock(
        '<xml><block type="controls_if">' +
          '<mutation elseif="2" else="1"/>' +
          '</block></xml>',
      );
      expect(block.extraState).toMatchObject({elseIfCount: '2', else: '1'});
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
    );
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
    );
    expect(flyout.name).toBe('Loops');
  });
});
