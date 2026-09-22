import React from 'react';

import {MAX_ZOOM, MIN_ZOOM} from '../camera';
import {PLATFORM_GRAVITY} from '../platformPhysics';

/**
 * What the help callout beside a toolbox block says: a `summary` sentence,
 * then the `body`, scrolled together if long; an `image` renders above the
 * text. Content lives here rather than in the level so it can carry
 * pictures and code; a level-authored source can replace this table later.
 */
export interface BlockHelp {
  title: string;
  summary: string;
  body?: React.ReactNode;
  image?: {src: string; alt: string};
}

const para = (...text: React.ReactNode[]) => <p>{text}</p>;
// Keyed: it sits among a paragraph's array of children.
const bold = (text: string) => <strong key={text}>{text}</strong>;

export const BLOCK_HELP: Record<string, BlockHelp> = {
  spritelab2_setCameraZoom: {
    title: 'Set zoom',
    summary:
      'Zooms the camera in on the player in a platformer scene, so the ' +
      'world scrolls as the player moves.',
    body: (
      <>
        {para(
          bold(`${MIN_ZOOM}`),
          ' shows the whole world. Bigger numbers get closer, up to ',
          bold(`${MAX_ZOOM}`),
          '. The zoom eases in over a moment instead of jumping.'
        )}
        {para(
          'Try ',
          bold('2'),
          ' under "when run", then walk the player to an edge and watch the ' +
            'view follow.'
        )}
      </>
    ),
  },
  spritelab2_setPlatformGravity: {
    title: 'Set gravity',
    summary:
      'Changes how hard the platformer pulls everything down: the player, ' +
      'and every other character that stands on blocks.',
    body: (
      <>
        {para(
          bold(`${PLATFORM_GRAVITY}`),
          ' is normal. Smaller numbers make jumps float and falls drift; ' +
            'bigger numbers snap everything to the ground and cut jumps short.'
        )}
        {para(
          bold('0'),
          ' turns gravity off. Nothing falls, so a jump keeps going until ' +
            'it hits something, and a patrolling character walks straight ' +
            'off the end of its blocks into the air.'
        )}
        {para(
          bold('A negative number'),
          ' flips the world. The player falls up, lands on the undersides ' +
            'of blocks and the top of the screen, and jumps downward. ' +
            'Patrollers flip with it: they land on the blocks above them ' +
            'and patrol along those instead.'
        )}
        {para(
          bold('Try a gravity-switching game.'),
          ' Put this block inside an event, such as a key press or a click, ' +
            'and switch gravity at the right moments: each flip drops the ' +
            'patrollers onto different blocks, so the same level rearranges ' +
            'itself, and the trick is to end with everyone where you want ' +
            'them.'
        )}
      </>
    ),
  },
  spritelab2_makePlatformPlayer: {
    title: 'Make platform player',
    summary:
      'Puts the player into the scene at a grid square, ready to run and ' +
      'jump with the arrow keys.',
    body: para(
      'Pick the image the player wears and the square it starts on. Other ' +
        'blocks can talk about it as "the player".'
    ),
  },
  spritelab2_makePlatformBlocks: {
    title: 'Make platform blocks',
    summary: 'Fills the chosen grid squares with solid blocks to stand on.',
    body: para(
      'Pick a block image, then paint the squares in the grid. The player ' +
        'lands on top of them and is stopped by their sides.'
    ),
  },
  spritelab2_setAsPlatformPlayer: {
    title: 'Set as player',
    summary:
      'Turns sprites you already made, such as ones placed in the World ' +
      'tab, into the player.',
    body: para(
      'Every sprite wearing that image gets gravity, lands on blocks, and ' +
        'moves with the arrow keys.'
    ),
  },
  spritelab2_thePlayer: {
    title: 'The player',
    summary: 'Whichever sprite is the platform player right now.',
    body: para(
      'Drop it into any block that takes a sprite. It keeps pointing at the ' +
        'player even after a costume change.'
    ),
  },
  spritelab2_movingWithArrowKeys: {
    title: 'Moving with arrow keys',
    summary: 'A behavior: the sprite moves wherever the arrow keys point.',
    body: para(
      'Give it to a sprite with a "begins" block and it keeps going every ' +
        'frame until the behavior stops.'
    ),
  },
  spritelab2_movingLeft: {
    title: 'Moving left',
    summary: 'A behavior: the sprite drifts steadily to the left.',
    body: para(
      'Good for clouds, cars and anything that should cross the scene. Pair ' +
        'it with an edge event to bring the sprite back around.'
    ),
  },
  spritelab2_patrollingLeftRight: {
    title: 'Patrolling left and right',
    summary: 'A behavior: the sprite walks back and forth across the scene.',
    body: para('It turns around at the edges of the scene.'),
  },
  spritelab2_patrollingOnBlocks: {
    title: 'Patrolling on blocks',
    summary:
      'A behavior: the sprite walks back and forth along the platform ' +
      'blocks it stands on.',
    body: para(
      'It turns around before it would walk off the end of the blocks, so ' +
        'it never falls.'
    ),
  },
  spritelab2_makeSpriteAtGrid: {
    title: 'Make sprite at grid location',
    summary: 'Makes a new sprite on the grid square you pick.',
    body: para(
      'The grid matches the World tab, so a square here is the same square ' +
        'there.'
    ),
  },
  spritelab2_makeSpriteAtPosition: {
    title: 'Make sprite at position',
    summary: 'Makes a new sprite in a named spot in a story scene.',
    body: para(
      'The spots are sized so two characters share the scene, and a ' +
        'character on the right faces its partner.'
    ),
  },
  spritelab2_goToScene: {
    title: 'Go to scene',
    summary: 'Stops this scene and starts the one you choose.',
    body: para(
      'The new scene fades in from black and its "when run" code runs. Use ' +
        'it to move between levels, or to a win or lose screen.'
    ),
  },
  spritelab2_goToExternalScene: {
    title: 'Go to external scene',
    summary: 'Jumps into a scene from a classmate’s project.',
    body: para(
      'Their scene and images load, then fade in. Their scenes appear in ' +
        'the list once they have shared a project.'
    ),
  },
  spritelab2_restartScene: {
    title: 'Restart scene',
    summary: 'Starts this scene over from the beginning.',
    body: para(
      'Everything returns to where it began, after a quick fade from black. ' +
        'Handy when the player falls off the world.'
    ),
  },
  spritelab2_playMusic: {
    title: 'Play music',
    summary:
      'Plays one of your Music Lab songs, repeating, while the game plays.',
    body: para(
      'A song that is already playing keeps playing, so put this under ' +
        '"when run" in the scene where the music should start.'
    ),
  },
};
