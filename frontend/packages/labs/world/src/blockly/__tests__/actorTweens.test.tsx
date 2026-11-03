// An actor's tweens, compiled from its data (specs/TWEENS_AS_DATA_PLAN.md).

import {render} from '@testing-library/react';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import type {ActorData} from '../../actors/actorData';
import {renameReferences} from '../../files/renameThing';
import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../BlocklyGenerator';
import {refreshProjectDropdowns} from '../projectDropdowns';
import {tweenExport} from '../tweens';

const number = (value: number) => ({
  shadow: {type: 'math_number', fields: {NUM: value}},
});

const fading: ActorData = {
  type: 'actor',
  name: 'Pad',
  tweens: [
    {
      id: 'fade-out',
      name: 'fade out',
      seconds: number(0.5),
      curve: 'ease-out',
      body: {
        type: 'world_set_Appearance_OpacityProperty',
        inputs: {ACTOR: {block: {type: 'world_this_actor'}}, VALUE: number(0)},
      },
    },
    {id: 'still', name: 'still', seconds: number(1), curve: 'linear'},
  ],
};

const generate = async (
  data: ActorData,
  path = 'actors/pad.actor',
): Promise<string> => {
  const ref = createRef<BlocklyGeneratorHandle>();
  render(<BlocklyGenerator ref={ref} />);
  await new Promise(resolve => setTimeout(resolve, 50));
  return ref.current!.generate(JSON.stringify(data), path);
};

/** An actor that plays the tween named by `value` on itself when made. */
const playing = (name: string, value: string): ActorData => ({
  type: 'actor',
  name,
  blocks: {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'world_on_Space_CreatedEvent',
          next: {
            block: {
              type: 'world_play_tween',
              fields: {TWEEN: value},
              inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
            },
          },
        },
      ],
    },
  },
});

describe('an actor’s tweens, as data', () => {
  it('are named for export by their id, which a rename keeps', () => {
    expect(tweenExport('fade-out')).toBe('FadeOutTween');
    expect(tweenExport('give way 2')).toBe('GiveWay2Tween');
  });

  it('compile to an exported function of the actor, its sets destinations', async () => {
    const js = await generate(fading);

    expect(js).toContain(
      'export const FadeOutTween = (actor) => ({id: "fade out", ' +
        'duration: 0.5, curve: "ease-out", steps: [\n',
    );
    expect(js).toMatch(
      /steps: \[\n\s*\{property: WorldLab\.OpacityProperty, to: 0\},\n\]\}\);/,
    );
    expect(js).toContain(
      'export const StillTween = (actor) => ({id: "still", duration: 1, ' +
        'curve: "linear", steps: [\n]});',
    );
  });

  describe('played', () => {
    const files = (hero: ActorData) => ({
      'actors/pad.actor': JSON.stringify(fading),
      'actors/hero.actor': JSON.stringify(hero),
    });

    it('from another actor’s file, imports it from that actor', async () => {
      const hero = playing('Hero', 'actors/pad#fade-out');
      refreshProjectDropdowns(files(hero), [], {}, []);
      const js = await generate(hero, 'actors/hero.actor');

      expect(js).toContain(
        'import {FadeOutTween as ActorsPad_FadeOutTween} from "actors/pad";',
      );
      expect(js).toContain(
        'WorldLab.beginTween(ActorsPad_FadeOutTween(actor), actor)',
      );
    });

    it('from its own file, by its own name', async () => {
      const pad = {
        ...fading,
        blocks: playing('Pad', 'actors/pad#fade-out').blocks,
      };
      refreshProjectDropdowns(
        {'actors/pad.actor': JSON.stringify(pad)},
        [],
        {},
        [],
      );
      const js = await generate(pad);

      expect(js).not.toContain('import {FadeOutTween');
      expect(js).toContain('WorldLab.beginTween(FadeOutTween(actor), actor)');
    });

    it('as nothing, when the tween is gone', async () => {
      const hero = playing('Hero', 'actors/pad#gone');
      refreshProjectDropdowns(files(hero), [], {}, []);
      expect(await generate(hero, 'actors/hero.actor')).not.toContain(
        'startTween',
      );
    });
  });

  it('are followed when their actor’s file is renamed', () => {
    const hero = playing('Hero', 'actors/pad#fade-out');
    const source = {
      folders: {},
      openFiles: [],
      files: {
        h: {
          id: 'h',
          name: 'hero.actor',
          language: 'actor',
          folderId: 'actors',
          contents: JSON.stringify(hero),
        },
      },
    };
    const renamed = renameReferences(source as never, {
      from: 'actors/pad',
      to: 'actors/plate',
    });
    expect(renamed.files.h.contents).toContain('"actors/plate#fade-out"');
  });
});
