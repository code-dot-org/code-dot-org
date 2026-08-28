import {describe, expect, it} from 'vitest';

import type {BlocklySerialization} from '../../types';
import {getBlockElements, makeBlocksEditable} from '../index';

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

describe('makeBlocksEditable (Author Mode "Student start" editing, gap #6)', () => {
  it('forces deletable/movable true on a frozen top-level block', () => {
    const serialization: BlocklySerialization = {
      blocks: {
        blocks: [{type: 'when_run', deletable: false, movable: false}],
      },
    };
    const result = makeBlocksEditable(serialization);
    expect(result.blocks?.blocks?.[0]).toMatchObject({
      deletable: true,
      movable: true,
    });
  });

  it('unfreezes a pinned block nested in a next-chain (a real Bee level pins a maze_nectar block this way)', () => {
    const serialization: BlocklySerialization = {
      blocks: {
        blocks: [
          {
            type: 'when_run',
            deletable: false,
            movable: false,
            next: {
              block: {type: 'maze_nectar', deletable: false, movable: false},
            },
          },
        ],
      },
    };
    const result = makeBlocksEditable(serialization);
    const hat = result.blocks?.blocks?.[0];
    expect(hat).toMatchObject({deletable: true, movable: true});
    expect(hat?.next?.block).toMatchObject({
      deletable: true,
      movable: true,
      type: 'maze_nectar',
    });
  });

  it('unfreezes a block nested inside a statement input', () => {
    const serialization: BlocklySerialization = {
      blocks: {
        blocks: [
          {
            type: 'controls_repeat_dropdown',
            inputs: {
              DO: {
                block: {
                  type: 'maze_moveForward',
                  deletable: false,
                  movable: false,
                },
              },
            },
          },
        ],
      },
    };
    const result = makeBlocksEditable(serialization);
    expect(result.blocks?.blocks?.[0].inputs?.DO?.block).toMatchObject({
      deletable: true,
      movable: true,
    });
  });

  it('does not mutate the input serialization', () => {
    const serialization: BlocklySerialization = {
      blocks: {blocks: [{type: 'when_run', deletable: false}]},
    };
    makeBlocksEditable(serialization);
    expect(serialization.blocks?.blocks?.[0].deletable).toBe(false);
  });

  it('is a no-op when there are no blocks at all', () => {
    const serialization: BlocklySerialization = {};
    expect(makeBlocksEditable(serialization)).toEqual(serialization);
  });
});
