import React from 'react';

import animBurst from '@cdo/static/spritelab_lab2/block-help/burst.gif';
import animGoToExternalScene from '@cdo/static/spritelab_lab2/block-help/go-to-external-scene.gif';
import animPlayMusic from '@cdo/static/spritelab_lab2/block-help/play-music.gif';
import animPlaySound from '@cdo/static/spritelab_lab2/block-help/play-sound.gif';
import animSetASpriteProperty from '@cdo/static/spritelab_lab2/block-help/set-a-sprite-property.gif';
import animSetGravity from '@cdo/static/spritelab_lab2/block-help/set-gravity.gif';
import animSetWeather from '@cdo/static/spritelab_lab2/block-help/set-weather.gif';
import animSetZoom from '@cdo/static/spritelab_lab2/block-help/set-zoom.gif';
import animThePlayer from '@cdo/static/spritelab_lab2/block-help/the-player.gif';
import animWhenClicked from '@cdo/static/spritelab_lab2/block-help/when-clicked.gif';

import {MAX_ZOOM, MIN_ZOOM} from '../camera';
import {PLATFORM_GRAVITY} from '../platformPhysics';

/**
 * What the new-block catalog says about a block: a `summary` sentence,
 * then the `body`, one more sentence at most, beside an `animation` (a
 * looping GIF of the block in action). Content lives here rather than in the level so it can carry
 * pictures and code; a level-authored source can replace this table later.
 */
export interface BlockHelp {
  title: string;
  summary: string;
  body?: React.ReactNode;
  animation?: {src: string; alt: string};
}

const para = (...text: React.ReactNode[]) => <p>{text}</p>;
// Keyed: it sits among a paragraph's array of children.
const bold = (text: string) => <strong key={text}>{text}</strong>;

export const BLOCK_HELP: Record<string, BlockHelp> = {
  spritelab2_setPlatformGravity: {
    title: 'Set gravity',
    animation: {src: animSetGravity, alt: 'The set gravity block in action.'},
    summary: 'Changes how hard everything falls.',
    body: para(
      bold(`${PLATFORM_GRAVITY}`),
      ' is normal; smaller numbers float, and a negative number flips the ' +
        'world upside down.'
    ),
  },
  spritelab2_setCameraZoom: {
    title: 'Set zoom',
    animation: {src: animSetZoom, alt: 'The set zoom block in action.'},
    summary:
      'Zooms the camera in on the player, so the world scrolls as they move.',
    body: para(
      bold(`${MIN_ZOOM}`),
      ' shows the whole world; bigger numbers get closer, up to ',
      bold(`${MAX_ZOOM}`),
      '.'
    ),
  },
  spritelab2_thePlayer: {
    title: 'The player',
    animation: {src: animThePlayer, alt: 'The the player block in action.'},
    summary: 'Whichever sprite is the platform player right now.',
    body: para('Drop it into any block that takes a sprite.'),
  },
  spritelab2_playSound: {
    title: 'Play sound',
    animation: {src: animPlaySound, alt: 'The play sound block in action.'},
    summary: 'Plays one short sound, once.',
    body: para('Put it under an event, such as a touch or a click.'),
  },
  spritelab2_playMusic: {
    title: 'Play music',
    animation: {src: animPlayMusic, alt: 'The play music block in action.'},
    summary:
      'Plays one of your Music Lab songs, repeating, while the game plays.',
    body: para(
      'Put it under "when run" in the scene where the music should start.'
    ),
  },
  spritelab2_setWeather: {
    title: 'Set weather',
    animation: {src: animSetWeather, alt: 'The set weather block in action.'},
    summary: 'Rain or snow falls across the whole scene.',
    body: para(bold('None'), ' clears the sky.'),
  },
  spritelab2_burst: {
    title: 'Burst',
    animation: {src: animBurst, alt: 'The burst block in action.'},
    summary: 'Flings sparks or confetti out from a sprite for a moment.',
    body: para(
      'Try it under "when touching" for a pickup, or under a click to ' +
        'celebrate.'
    ),
  },
  spritelab2_goToExternalScene: {
    title: 'Go to external scene',
    animation: {
      src: animGoToExternalScene,
      alt: 'The go to external scene block in action.',
    },
    summary: 'Jumps into a scene from a classmate’s project.',
    body: para(
      'Their scenes appear in the list once they have shared a project.'
    ),
  },
  gamelab_setProp: {
    title: 'Set a sprite property',
    animation: {
      src: animSetASpriteProperty,
      alt: 'The set a sprite property block in action.',
    },
    summary:
      'Changes one thing about a sprite: its size, rotation, position, direction or speed.',
    body: para(
      bold('size'),
      ' is a percent, and ',
      bold('rotation'),
      ' is in degrees.'
    ),
  },
  gamelab_spriteClicked: {
    title: 'When clicked',
    animation: {src: animWhenClicked, alt: 'The when clicked block in action.'},
    summary: 'Runs the blocks below when a sprite is clicked or tapped.',
    body: para(
      bold('while'),
      ' keeps them running as long as the button is held down.'
    ),
  },
};
