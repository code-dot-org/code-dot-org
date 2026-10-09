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

import {MAX_BURST_COUNT} from '../bursts';
import {MAX_ZOOM, MIN_ZOOM} from '../camera';
import {PLATFORM_GRAVITY} from '../platformPhysics';

/**
 * What the help callout beside a toolbox block says: a `summary` sentence,
 * then the `body`, scrolled together if long. An `animation` (a looping
 * GIF of the block in action) sits to the left of the text. Content lives
 * here rather than in the level so it can carry pictures and code; a
 * level-authored source can replace this table later.
 */
export interface BlockHelp {
  title: string;
  summary: string;
  body?: React.ReactNode;
  animation?: {src: string; alt: string};
  /** A block worth drawing the eye to: its "New" stamp is bright where
      the others are quiet. */
  standout?: boolean;
}

const para = (...text: React.ReactNode[]) => <p>{text}</p>;
// Keyed: it sits among a paragraph's array of children.
const bold = (text: string) => <strong key={text}>{text}</strong>;

export const BLOCK_HELP: Record<string, BlockHelp> = {
  spritelab2_setPlatformGravity: {
    title: 'Set gravity',
    animation: {src: animSetGravity, alt: 'The set gravity block in action.'},
    standout: true,
    summary: 'Changes how hard everything falls.',
    body: (
      <>
        {para(
          bold(`${PLATFORM_GRAVITY}`),
          ' is normal. Smaller numbers float; bigger numbers drop fast.'
        )}
        {para(
          bold('0'),
          ' turns gravity off. A ',
          bold('negative number'),
          ' flips the world: you fall up and land on the ceiling.'
        )}
        {para('Change it inside an event to make a gravity-flipping game.')}
      </>
    ),
  },
  spritelab2_setCameraZoom: {
    title: 'Set zoom',
    animation: {src: animSetZoom, alt: 'The set zoom block in action.'},
    standout: true,
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
  spritelab2_thePlayer: {
    title: 'The player',
    animation: {src: animThePlayer, alt: 'The the player block in action.'},
    summary: 'Whichever sprite is the platform player right now.',
    body: para(
      'Drop it into any block that takes a sprite. It keeps pointing at the ' +
        'player even after the player is changed.'
    ),
  },
  spritelab2_playSound: {
    title: 'Play sound',
    animation: {src: animPlaySound, alt: 'The play sound block in action.'},
    summary: 'Plays one short sound, once.',
    body: (
      <>
        {para(
          'The first few in the list are made-up sounds; the rest are ' +
            'recordings. Pick one from the menu to hear it.'
        )}
        {para(
          'Put it under an event, such as a touch or a click, so the sound ' +
            'marks that moment.'
        )}
      </>
    ),
  },
  spritelab2_playMusic: {
    title: 'Play music',
    animation: {src: animPlayMusic, alt: 'The play music block in action.'},
    summary:
      'Plays one of your Music Lab songs, repeating, while the game plays.',
    body: para(
      'A song that is already playing keeps playing, so put this under ' +
        '"when run" in the scene where the music should start.'
    ),
  },
  spritelab2_setWeather: {
    title: 'Set weather',
    animation: {src: animSetWeather, alt: 'The set weather block in action.'},
    summary: 'Rain or snow falls across the whole scene.',
    body: para(
      bold('None'),
      ' clears the sky. The weather keeps going until another set weather ' +
        'block changes it.'
    ),
  },
  spritelab2_burst: {
    title: 'Burst',
    animation: {src: animBurst, alt: 'The burst block in action.'},
    summary: 'Flings sparks or confetti out from a sprite for a moment.',
    body: (
      <>
        {para(
          'The number is how many pieces, up to ',
          bold(`${MAX_BURST_COUNT}`),
          '. They fly out, fall, and fade.'
        )}
        {para(
          'Try it under "when touching" for a pickup, or under a click for ' +
            'a little celebration.'
        )}
      </>
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
      'Their scene and images load, then fade in. Their scenes appear in ' +
        'the list once they have shared a project.'
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
    body: (
      <>
        {para(
          bold('size'),
          ' is a percent: 100 is the picture as drawn, 50 is half. ',
          bold('rotation'),
          ' is in degrees.'
        )}
        {para(
          bold('x position'),
          ' and ',
          bold('y position'),
          ' move the sprite: x runs left to right, y runs top to bottom.'
        )}
      </>
    ),
  },
  gamelab_spriteClicked: {
    title: 'When clicked',
    animation: {src: animWhenClicked, alt: 'The when clicked block in action.'},
    summary: 'Runs the blocks below when a sprite is clicked or tapped.',
    body: para(
      bold('when'),
      ' runs them once per click. ',
      bold('while'),
      ' keeps running them as long as the button is held down.'
    ),
  },
};
