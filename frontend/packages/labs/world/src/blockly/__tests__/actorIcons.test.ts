// The symbol an actor elects to be shown by (specs/UI_ACTORS.md).
//
// The third of three tiers, and what these pin is that it IS a tier: an actor
// that says nothing keeps the picture, an actor that says something is shown
// its symbol on the one surface that can hold neither the picture nor a name,
// and the file is where the saying lives — because importing a stock actor
// copies the workspace and leaves the catalogue behind.

import {beforeEach, describe, expect, it} from 'vitest';

import {buttonActor} from '../../actors/stock/button';
import {labelActor} from '../../actors/stock/label';
import {projectActorIcons} from '../actorIconMeta';
import {ACTOR_ICON_OPTIONS, actorIconImage} from '../actorIcons';
import {setActorIcons, setActorThumbnails} from '../actorThumbnails';
import {buildDomainPalette} from '../domainBlocks';
import {actorFieldOptions, setProjectActors} from '../moduleOptions';

/** A one-pixel PNG, standing in for a thumbnail the sandbox rendered. */
const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/** An `.actor` file: a `define actor`, and whatever rows are chained under it. */
const actorFile = (name: string, rows: object[] = []) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          fields: {NAME: name},
          next: {
            block: rows.reduceRight<object | undefined>(
              (next, row) => ({...row, ...(next ? {next: {block: next}} : {})}),
              undefined,
            ),
          },
        },
      ],
    },
  });

const showAs = (icon: string) => ({
  type: 'world_show_as',
  fields: {ICON: icon},
});

beforeEach(() => {
  setActorIcons({});
  setActorThumbnails({});
  // The dropdown lists what the project holds; these cases are about what it
  // DRAWS each row with.
  setProjectActors([['Label', 'actors/label']]);
});

describe('electing an icon', () => {
  it('is read off the file, by the key a dropdown stores', () => {
    // An `.actor` IS one actor and its dropdown value is the module path.
    expect(
      projectActorIcons({
        'actors/label.actor': actorFile('Label', [showAs('text')]),
      }),
    ).toEqual({'actors/label': 'text'});
  });

  it('covers a world’s own actors too, by the key THEY are drawn with', () => {
    // One walk over `define actor` roots reaches both homes. A world's own are
    // looked up by an id derived from the name (`localActors.actorIdFromName`),
    // which is what `pictured` has in hand for them.
    expect(
      projectActorIcons({
        'worlds/main.world': actorFile('Score Board', [showAs('panel')]),
      }),
    ).toEqual({Score_Board: 'panel'});
  });

  it('says nothing for an actor that elected nothing', () => {
    expect(projectActorIcons({'actors/coin.actor': actorFile('Coin')})).toEqual(
      {},
    );
  });

  it('survives a file that does not parse', () => {
    // Mid-edit, as everywhere else that reads a workspace.
    expect(projectActorIcons({'actors/x.actor': '{not json'})).toEqual({});
  });
});

describe('what a dropdown draws', () => {
  const optionFor = (value: string) =>
    actorFieldOptions().find(([, v]) => v === value)?.[0];

  it('prefers the symbol over the picture', () => {
    // The whole point: a Label's picture is whatever this one says, and at 24
    // pixels that is a smudge with no name beside it.
    setActorThumbnails({'actors/label': PIXEL});
    setActorIcons({'actors/label': 'text'});

    expect(optionFor('actors/label')).toMatchObject({
      src: actorIconImage('text'),
      alt: 'Label',
    });
  });

  it('keeps the picture when nothing was elected', () => {
    setActorThumbnails({'actors/label': PIXEL});

    expect(optionFor('actors/label')).toMatchObject({src: PIXEL});
  });

  it('falls back to the name when there is neither', () => {
    expect(optionFor('actors/label')).toBe('Label');
  });

  it('ignores an icon name nothing draws', () => {
    // A file saved with a value this build has no drawing for. The picture is
    // still better than a broken image.
    setActorThumbnails({'actors/label': PIXEL});
    setActorIcons({'actors/label': 'sousaphone'});

    expect(optionFor('actors/label')).toMatchObject({src: PIXEL});
  });
});

describe('the icons themselves', () => {
  it('are self-contained SVG data URIs', () => {
    // An image, because Blockly's option is `{src, width, height, alt}` — and
    // SVG so it is crisp at any size with no font to load.
    for (const [, name] of ACTOR_ICON_OPTIONS) {
      const uri = actorIconImage(name)!;
      expect(uri.startsWith('data:image/svg+xml,')).toBe(true);
      const svg = decodeURIComponent(uri.slice('data:image/svg+xml,'.length));
      // A plate and a glyph: a bare glyph in one colour is a bet on the menu's
      // background, and this lab has themes.
      expect(svg).toContain('<rect');
      expect(svg).toMatch(/<path fill="#ffffff" d="[^"]+"/);
    }
  });
});

describe('the block', () => {
  const block = () =>
    buildDomainPalette([]).blocks.find(
      candidate => candidate.type === 'world_show_as',
    ) as {generator: {javascript: () => unknown}} | undefined;

  it('is offered beside the rows an actor already carries', () => {
    const actor = (
      buildDomainPalette([], {fileKind: 'actor'}).toolbox as Array<{
        name?: string;
        blocks?: unknown[];
      }>
    ).find(category => category.name === 'Actor');

    expect(actor?.blocks).toContain('world_show_as');
  });

  it('generates nothing, because a running game has no pickers', () => {
    expect(String(block()!.generator.javascript())).toBe('');
  });
});

describe('the stock interface actors', () => {
  it('elect one, because their pictures are their content', () => {
    expect(
      projectActorIcons({
        'actors/label.actor': labelActor,
        'actors/button.actor': buttonActor,
      }),
    ).toEqual({'actors/label': 'text', 'actors/button': 'button'});
  });

  it('name symbols this build actually draws', () => {
    for (const icon of Object.values(
      projectActorIcons({
        'actors/label.actor': labelActor,
        'actors/button.actor': buttonActor,
      }),
    )) {
      expect(actorIconImage(icon)).toBeDefined();
    }
  });
});
