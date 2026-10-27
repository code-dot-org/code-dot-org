// @vitest-environment node
//
// The camera list's reader, as arithmetic over block JSON.

import {describe, expect, it} from 'vitest';

import {placementCameras} from '../worldCameras';

/** `define camera ⟨name⟩ for ⟨owner⟩`, with the traits its mouth elects. */
const camera = (
  id: string,
  name: string,
  owner: object | undefined,
  traits: string[] = [],
) => ({
  type: 'world_define_camera',
  id,
  fields: {NAME: name},
  inputs: {
    ...(owner ? {OWNER: {block: owner}} : {}),
    ...(traits.length
      ? {
          DO: {
            block: traits
              .map(trait => ({type: 'world_use_trait', fields: {TRAIT: trait}}))
              .reduceRight<
                object | undefined
              >((next, row) => ({...row, ...(next ? {next: {block: next}} : {})}), undefined),
          },
        }
      : {}),
  },
});
const workspace = (roots: object[]) => ({
  blocks: {languageVersion: 0, blocks: roots},
});

describe('the cameras a placement’s script declares', () => {
  const inCreate = (row: object) => ({
    type: 'world_on_Space_CreatedEvent',
    inputs: {DO: {block: row}},
  });

  it('finds `for ⟨this actor⟩` inside a hat’s mouth', () => {
    const blocks = workspace([
      inCreate(
        camera('c1', 'Chase', {type: 'world_this_actor'}, [
          'Camera Follow#Follows',
          'Camera Ease#Eases',
        ]),
      ),
    ]);
    expect(placementCameras(blocks as never)).toEqual([
      {
        id: 'c1',
        name: 'Chase',
        traits: ['Camera Follow#Follows', 'Camera Ease#Eases'],
      },
    ]);
  });

  it('leaves out one declared for a different Viewport, or the world’s', () => {
    const blocks = workspace([
      inCreate(
        camera('c1', 'Theirs', {
          type: 'world_actor_kind',
          fields: {ACTOR: 'actors/viewport'},
        }),
      ),
      inCreate(camera('c2', 'Worlds', undefined)),
    ]);
    expect(placementCameras(blocks as never)).toEqual([]);
  });

  it('answers nothing for a placement with no script', () => {
    expect(placementCameras(undefined)).toEqual([]);
  });
});
