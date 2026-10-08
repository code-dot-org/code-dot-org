import React from 'react';

import animAddBehavior from '@cdo/static/spritelab_lab2/block-help/add-behavior.gif';
import animAtTime from '@cdo/static/spritelab_lab2/block-help/at-time.gif';
import animBurst from '@cdo/static/spritelab_lab2/block-help/burst.gif';
import animGoToExternalScene from '@cdo/static/spritelab_lab2/block-help/go-to-external-scene.gif';
import animGoToScene from '@cdo/static/spritelab_lab2/block-help/go-to-scene.gif';
import animMakePlatformBlocks from '@cdo/static/spritelab_lab2/block-help/make-platform-blocks.gif';
import animMakePlatformPlayer from '@cdo/static/spritelab_lab2/block-help/make-platform-player.gif';
import animMakeSpriteAtGridLocation from '@cdo/static/spritelab_lab2/block-help/make-sprite-at-grid-location.gif';
import animMakeSpriteAtPosition from '@cdo/static/spritelab_lab2/block-help/make-sprite-at-position.gif';
import animMovingLeft from '@cdo/static/spritelab_lab2/block-help/moving-left.gif';
import animMovingWithArrowKeys from '@cdo/static/spritelab_lab2/block-help/moving-with-arrow-keys.gif';
import animPatrollingLeftAndRight from '@cdo/static/spritelab_lab2/block-help/patrolling-left-and-right.gif';
import animPatrollingOnBlocks from '@cdo/static/spritelab_lab2/block-help/patrolling-on-blocks.gif';
import animPlayMusic from '@cdo/static/spritelab_lab2/block-help/play-music.gif';
import animPlaySound from '@cdo/static/spritelab_lab2/block-help/play-sound.gif';
import animRestartScene from '@cdo/static/spritelab_lab2/block-help/restart-scene.gif';
import animSay from '@cdo/static/spritelab_lab2/block-help/say.gif';
import animSetASpriteProperty from '@cdo/static/spritelab_lab2/block-help/set-a-sprite-property.gif';
import animSetAsPlayer from '@cdo/static/spritelab_lab2/block-help/set-as-player.gif';
import animSetBackground from '@cdo/static/spritelab_lab2/block-help/set-background.gif';
import animSetGravity from '@cdo/static/spritelab_lab2/block-help/set-gravity.gif';
import animSetWeather from '@cdo/static/spritelab_lab2/block-help/set-weather.gif';
import animSetZoom from '@cdo/static/spritelab_lab2/block-help/set-zoom.gif';
import animThePlayer from '@cdo/static/spritelab_lab2/block-help/the-player.gif';
import animWhenClicked from '@cdo/static/spritelab_lab2/block-help/when-clicked.gif';
import animWhenTouching from '@cdo/static/spritelab_lab2/block-help/when-touching.gif';

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
  spritelab2_makePlatformPlayer: {
    title: 'Make platform player',
    animation: {
      src: animMakePlatformPlayer,
      alt: 'The make platform player block in action.',
    },
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
    animation: {
      src: animMakePlatformBlocks,
      alt: 'The make platform blocks block in action.',
    },
    summary: 'Fills the chosen grid squares with solid blocks to stand on.',
    body: para(
      'Pick a block image, then paint the squares in the grid. The player ' +
        'lands on top of them and is stopped by their sides.'
    ),
  },
  spritelab2_setAsPlatformPlayer: {
    title: 'Set as player',
    animation: {
      src: animSetAsPlayer,
      alt: 'The set as player block in action.',
    },
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
    animation: {src: animThePlayer, alt: 'The the player block in action.'},
    summary: 'Whichever sprite is the platform player right now.',
    body: para(
      'Drop it into any block that takes a sprite. It keeps pointing at the ' +
        'player even after the player is changed.'
    ),
  },
  spritelab2_movingWithArrowKeys: {
    title: 'Moving with arrow keys',
    animation: {
      src: animMovingWithArrowKeys,
      alt: 'The moving with arrow keys block in action.',
    },
    summary: 'A behavior: the sprite moves wherever the arrow keys point.',
    body: para(
      'Give it to a sprite with a "begins" block and it keeps going every ' +
        'frame until the behavior stops.'
    ),
  },
  spritelab2_movingLeft: {
    title: 'Moving left',
    animation: {src: animMovingLeft, alt: 'The moving left block in action.'},
    summary: 'A behavior: the sprite drifts steadily to the left.',
    body: para(
      'Good for clouds, cars and anything that should cross the scene. Pair ' +
        'it with an edge event to bring the sprite back around.'
    ),
  },
  spritelab2_patrollingLeftRight: {
    title: 'Patrolling left and right',
    animation: {
      src: animPatrollingLeftAndRight,
      alt: 'The patrolling left and right block in action.',
    },
    summary: 'A behavior: the sprite walks back and forth across the scene.',
    body: para('It turns around at the edges of the scene.'),
  },
  spritelab2_patrollingOnBlocks: {
    title: 'Patrolling on blocks',
    animation: {
      src: animPatrollingOnBlocks,
      alt: 'The patrolling on blocks block in action.',
    },
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
    animation: {
      src: animMakeSpriteAtGridLocation,
      alt: 'The make sprite at grid location block in action.',
    },
    summary: 'Makes a new sprite on the grid square you pick.',
    body: para(
      'The grid matches the World tab, so a square here is the same square ' +
        'there.'
    ),
  },
  spritelab2_makeSpriteAtPosition: {
    title: 'Make sprite at position',
    animation: {
      src: animMakeSpriteAtPosition,
      alt: 'The make sprite at position block in action.',
    },
    summary: 'Makes a new sprite in a named spot in a story scene.',
    body: para(
      'The spots are sized so two characters share the scene, and a ' +
        'character on the right faces its partner.'
    ),
  },
  spritelab2_goToScene: {
    title: 'Go to scene',
    animation: {src: animGoToScene, alt: 'The go to scene block in action.'},
    summary: 'Stops this scene and starts the one you choose.',
    body: para(
      'The new scene fades in from black and its "when run" code runs. Use ' +
        'it to move between levels, or to a win or lose screen.'
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
  spritelab2_restartScene: {
    title: 'Restart scene',
    animation: {
      src: animRestartScene,
      alt: 'The restart scene block in action.',
    },
    summary: 'Starts this scene over from the beginning.',
    body: para(
      'Everything returns to where it began, after a quick fade from black. ' +
        'Handy when the player falls off the world.'
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
  gamelab_setBackgroundImageAs: {
    title: 'Set background',
    animation: {
      src: animSetBackground,
      alt: 'The set background block in action.',
    },
    summary: 'Puts one of your backgrounds behind everything in the scene.',
    body: para(
      'Pick a picture from the menu. A later set background block swaps it, ' +
        'so a scene can change its look partway through.'
    ),
  },
  gamelab_checkTouching: {
    title: 'When touching',
    animation: {
      src: animWhenTouching,
      alt: 'The when touching block in action.',
    },
    summary: 'Runs the blocks below when two sprites touch.',
    body: para(
      bold('when'),
      ' runs them once, as the sprites start touching. ',
      bold('while'),
      ' keeps running them as long as they stay touching.'
    ),
  },
  gamelab_spriteSay: {
    title: 'Say',
    animation: {src: animSay, alt: 'The say block in action.'},
    summary: 'Shows words in a speech bubble over a sprite.',
    body: para(
      'The bubble stays until the sprite says something else. Say nothing, ' +
        'an empty box, to clear it.'
    ),
  },
  gamelab_atTime: {
    title: 'At time',
    animation: {src: animAtTime, alt: 'The at time block in action.'},
    summary: 'Runs the blocks below once, that many seconds after Play.',
    body: para(
      'Stack a few at different times to tell a story that unfolds on its own.'
    ),
  },
  gamelab_addBehaviorSimple: {
    title: 'Add behavior',
    animation: {src: animAddBehavior, alt: 'The add behavior block in action.'},
    summary: 'Gives a sprite a way of moving that keeps going on its own.',
    body: para(
      'Drop a behavior, such as moving left or patrolling, into the slot. ' +
        'The sprite keeps doing it until the scene ends.'
    ),
  },
};
