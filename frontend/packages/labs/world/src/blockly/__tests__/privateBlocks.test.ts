// A `define block` with its eye shut: this kind's own work, in nobody else's
// toolbox.
//
// An actor's own declarations become vocabulary — `define property` mints a
// get and a set, `define block` mints a call site — and most of that is meant
// to be shared: `say ⟨…⟩` on a Speech Box is for anyone to use. Some of it is
// not. The Text Area says `keep the caret in view` at eight sites and means
// several hundred blocks of arithmetic behind it; a file that does not know
// what a caret is can mean nothing by that block, and offering it is offering
// a reader something they cannot use.
//
// `define property` has answered this since it had a setter and the picture is
// the same: the eye means VISIBLE (`fields/visibilityEye`).

import {describe, expect, it} from 'vitest';

import {parseActorOwnMeta} from '../ownProperties';
import {buildDomainPalette} from '../domainBlocks';

/** An `.actor` file declaring one block, with the eye as given. */
const actorFile = (access?: string) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          fields: {NAME: 'Field'},
          next: {
            block: {
              type: 'world_rule_block',
              fields: {
                RETURNS: 'none',
                DESCRIPTION: 'Put the window where the bar is.',
                ...(access ? {ACCESS: access} : {}),
              },
              extraState: {
                parts: [{kind: 'label', text: 'keep the caret in view'}],
              },
            },
          },
        },
      ],
    },
  });

const CALL = 'world_do_ActorsField_KeepTheCaretInViewAction';

/** The types a drawer offers, as seen from `from`. */
const offeredIn = (contents: string, from?: string): string[] => {
  const meta = parseActorOwnMeta('actors/field', contents)!;
  const palette = buildDomainPalette([], {
    ownProperties: [meta],
    ...(from ? {ownActorModule: from} : {}),
  });
  const drawer = (
    palette.toolbox as Array<{name?: string; blocks?: unknown[]}>
  ).find(one => one.name === 'Field');
  return (drawer?.blocks ?? []).map(one =>
    typeof one === 'string' ? one : (one as {type: string}).type,
  );
};

describe('a block with its eye shut', () => {
  it('is offered in the file that defines it', () => {
    // At home it is ordinary vocabulary: the whole point is that the eight
    // handlers in this file can say it.
    expect(offeredIn(actorFile('private'), 'actors/field')).toContain(CALL);
  });

  it('is offered NOWHERE else', () => {
    expect(offeredIn(actorFile('private'), 'actors/other')).not.toContain(CALL);
    expect(offeredIn(actorFile('private'))).not.toContain(CALL);
  });
});

describe('a block with its eye open', () => {
  it('is offered everywhere, which is what saying nothing means', () => {
    // Every `define block` written before the eye existed says nothing, and
    // has to go on being everybody's — `say ⟨…⟩` on a Speech Box is for any
    // file to use.
    for (const contents of [actorFile(), actorFile('shared')]) {
      expect(offeredIn(contents, 'actors/field')).toContain(CALL);
      expect(offeredIn(contents, 'actors/other')).toContain(CALL);
    }
  });
});
