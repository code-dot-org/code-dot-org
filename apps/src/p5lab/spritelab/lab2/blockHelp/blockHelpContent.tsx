import animBurst from '@cdo/static/spritelab_lab2/block-help/burst.gif';
import animPlaySound from '@cdo/static/spritelab_lab2/block-help/play-sound.gif';
import animSetGravity from '@cdo/static/spritelab_lab2/block-help/set-gravity.gif';
import animSetWeather from '@cdo/static/spritelab_lab2/block-help/set-weather.gif';
import animSetZoom from '@cdo/static/spritelab_lab2/block-help/set-zoom.gif';
import animThePlayer from '@cdo/static/spritelab_lab2/block-help/the-player.gif';

import {MAX_ZOOM, MIN_ZOOM} from '../camera';

/**
 * What the new-block catalog says about a block: a `summary` sentence, then
 * the `body` in markdown (one more sentence at most), beside an `animation`:
 * a looping GIF of the block in action, or a still picture where one says
 * enough. An entry without one shows an empty outline until its picture is
 * made. The content lives here rather than in the level so it can carry
 * pictures and the lab's own numbers; a level-authored source can replace
 * this table later.
 */
export interface BlockHelp {
  title: string;
  summary: string;
  body?: string;
  animation?: {src: string; alt: string};
}

export const BLOCK_HELP: Record<string, BlockHelp> = {
  spritelab2_setPlatformJumpHeight: {
    title: 'Set jump height',
    summary: 'Changes how many squares the player can jump.',
    body: 'The number is how high the player jumps in squares.',
  },
  spritelab2_setPlatformGravityDirection: {
    title: 'Set gravity direction',
    animation: {
      src: animSetGravity,
      alt: 'The set gravity direction block in action.',
    },
    summary: 'Changes which way everything falls.',
    body: 'Choose **↓** to fall toward the bottom, **↑** to fall toward the top, or **none** to move in four directions.',
  },
  spritelab2_setCameraZoom: {
    title: 'Set zoom',
    animation: {src: animSetZoom, alt: 'The set zoom block in action.'},
    summary:
      'Zooms the camera in on the player, so the world scrolls as they move.',
    body:
      `**${MIN_ZOOM}** shows the whole world; bigger numbers get closer, ` +
      `up to **${MAX_ZOOM}**.`,
  },
  spritelab2_thePlayer: {
    title: 'The player',
    animation: {src: animThePlayer, alt: 'The “the player” block in action.'},
    summary: 'Whichever sprite is the platform player right now.',
    body: 'Drop it into any block that takes a sprite.',
  },
  spritelab2_setAsPlatformPlayer2: {
    title: 'Set as player 2',
    summary: 'Makes a sprite a second player, moved with W, A, S and D.',
    body:
      'Lets you and a classmate play your game on one keyboard. The first ' +
      'player uses the arrow keys, and the second player uses W, A, S, and D.',
  },
  spritelab2_thePlayer2: {
    title: 'Player 2',
    summary: 'Whichever sprite is player 2 right now.',
    body: 'Drop it into any block that takes a sprite.',
  },
  spritelab2_askAI: {
    title: 'Ask AI',
    summary: 'Asks the AI a question and puts its answer in a variable.',
    body:
      'The answer takes a moment to arrive, so the variable stays empty ' +
      'until it does. Use **when ... answered** to do something with it.',
  },
  spritelab2_askAIWithChoices: {
    title: 'Ask AI with answer choices',
    summary:
      'Asks the AI a question and puts the choice it picks in a variable.',
    body:
      'Empty choices are left out, and with no choices at all the AI ' +
      'answers in its own words. Use **when ... answered** to do ' +
      'something with the answer once it arrives.',
  },
  spritelab2_setSystemPrompt: {
    title: 'Set system prompt',
    summary: 'Tells the AI how to answer every question after it.',
    body:
      'Try a personality, like **Talk like a pirate.** Put it before any ' +
      '**ask AI** blocks.',
  },
  spritelab2_playSound: {
    title: 'Play sound',
    animation: {src: animPlaySound, alt: 'The play sound block in action.'},
    summary: 'Plays one short sound, once.',
    body: 'Put it under an event, such as a touch or a click.',
  },
  spritelab2_setWeather: {
    title: 'Set weather',
    animation: {src: animSetWeather, alt: 'The set weather block in action.'},
    summary: 'Rain or snow falls across the whole scene.',
    body: '**None** clears the sky.',
  },
  spritelab2_burst: {
    title: 'Burst',
    animation: {src: animBurst, alt: 'The burst block in action.'},
    summary: 'Flings sparks or confetti out from a sprite for a moment.',
    body:
      'Try it under "when touching" for a pickup, or under a click to ' +
      'celebrate.',
  },
  spritelab2_showTitle: {
    title: 'Show title',
    summary: 'Big text across the middle of the game for a moment.',
    body: 'Put it under a touch to announce a win.',
  },
  gamelab_spriteSay: {
    title: 'Say',
    summary: 'Shows words in a speech bubble over a sprite.',
    body: 'Put it under an event, so the words come at the right moment.',
  },
  gamelab_destroy: {
    title: 'Remove',
    summary: 'Takes sprites out of the scene.',
    body:
      'Try it with **the touched sprite** under "when player touches coin", ' +
      'so only that coin disappears.',
  },
  spritelab2_touchedSprite: {
    title: 'The touched sprite',
    summary: 'Picks the sprite that was just touched, under "when touching".',
    body: 'Anywhere else it picks no sprite at all.',
  },
  spritelab2_clickedSprite: {
    title: 'The clicked sprite',
    summary: 'Picks the sprite that was just clicked, under "when clicked".',
    body: 'Anywhere else it picks no sprite at all.',
  },
  spritelab2_restartScene: {
    title: 'Restart scene',
    summary: 'Starts the scene over from the beginning.',
    body:
      'Try it under "when touching" a foe, so a touch sends the player back ' +
      'to the start.',
  },
  gamelab_everyInterval: {
    title: 'Repeat every',
    summary: 'Runs the blocks below each time this much time passes.',
    body: 'Pick **frames** to count frames instead of seconds.',
  },
  spritelab2_whenPlayer: {
    title: 'When player',
    summary:
      'Runs the blocks below each time the player walks, jumps, lands or ' +
      'bumps into something.',
    body: 'Pick the moment from the dropdown.',
  },
};
