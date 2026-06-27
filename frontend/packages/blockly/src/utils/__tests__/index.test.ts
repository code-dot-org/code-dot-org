import {describe, expect, it} from 'vitest';

import {getBlockElements} from '../index';

/*
 * getBlockElements is a pure DOM query (the direct <block> children of <xml>),
 * so it needs only jsdom's DOMParser, no workspace.
 */

const xmlRoot = (xml: string) =>
  new DOMParser().parseFromString(xml, 'text/xml').documentElement;

describe('getBlockElements', () => {
  it('returns the direct block children of <xml>', () => {
    const els = getBlockElements(
      xmlRoot('<xml><block type="a"/><block type="b"/></xml>'),
    );
    expect(els.map(e => e.getAttribute('type'))).toEqual(['a', 'b']);
  });

  it('ignores blocks nested inside inputs', () => {
    const els = getBlockElements(
      xmlRoot(
        '<xml><block type="a">' +
          '<value name="X"><block type="inner"/></value>' +
          '</block></xml>',
      ),
    );
    expect(els.map(e => e.getAttribute('type'))).toEqual(['a']);
  });

  it('returns an empty array when there are no blocks', () => {
    expect(getBlockElements(xmlRoot('<xml/>'))).toEqual([]);
  });
});
