import alien from '@cdo/static/tutor/stickers/alien.svg';
import backhandIndexPointingUp from '@cdo/static/tutor/stickers/backhand-index-pointing-up.svg';
import brain from '@cdo/static/tutor/stickers/brain.svg';
import bug from '@cdo/static/tutor/stickers/bug.svg';
import checkMarkButton from '@cdo/static/tutor/stickers/check-mark-button.svg';
import clappingHands from '@cdo/static/tutor/stickers/clapping-hands.svg';
import crossMark from '@cdo/static/tutor/stickers/cross-mark.svg';
import dogFace from '@cdo/static/tutor/stickers/dog-face.svg';
import doubleExclamationMark from '@cdo/static/tutor/stickers/double-exclamation-mark.svg';
import explodingHead from '@cdo/static/tutor/stickers/exploding-head.svg';
import eyes from '@cdo/static/tutor/stickers/eyes.svg';
import faceScreamingInFear from '@cdo/static/tutor/stickers/face-screaming-in-fear.svg';
import faceWithTearsOfJoy from '@cdo/static/tutor/stickers/face-with-tears-of-joy.svg';
import fire from '@cdo/static/tutor/stickers/fire.svg';
import gear from '@cdo/static/tutor/stickers/gear.svg';
import ghost from '@cdo/static/tutor/stickers/ghost.svg';
import goat from '@cdo/static/tutor/stickers/goat.svg';
import grinningCat from '@cdo/static/tutor/stickers/grinning-cat.svg';
import grinningFaceWithSmilingEyes from '@cdo/static/tutor/stickers/grinning-face-with-smiling-eyes.svg';
import hundredPoints from '@cdo/static/tutor/stickers/hundred-points.svg';
import laptop from '@cdo/static/tutor/stickers/laptop.svg';
import leftArrow from '@cdo/static/tutor/stickers/left-arrow.svg';
import lightBulb from '@cdo/static/tutor/stickers/light-bulb.svg';
import loudlyCryingFace from '@cdo/static/tutor/stickers/loudly-crying-face.svg';
import magnifyingGlassTiltedLeft from '@cdo/static/tutor/stickers/magnifying-glass-tilted-left.svg';
import nailPolish from '@cdo/static/tutor/stickers/nail-polish.svg';
import nerdFace from '@cdo/static/tutor/stickers/nerd-face.svg';
import partyPopper from '@cdo/static/tutor/stickers/party-popper.svg';
import partyingFace from '@cdo/static/tutor/stickers/partying-face.svg';
import pileOfPoo from '@cdo/static/tutor/stickers/pile-of-poo.svg';
import plus from '@cdo/static/tutor/stickers/plus.svg';
import puzzlePiece from '@cdo/static/tutor/stickers/puzzle-piece.svg';
import redExclamationMark from '@cdo/static/tutor/stickers/red-exclamation-mark.svg';
import redHeart from '@cdo/static/tutor/stickers/red-heart.svg';
import redQuestionMark from '@cdo/static/tutor/stickers/red-question-mark.svg';
import rightArrow from '@cdo/static/tutor/stickers/right-arrow.svg';
import robot from '@cdo/static/tutor/stickers/robot.svg';
import rocket from '@cdo/static/tutor/stickers/rocket.svg';
import skull from '@cdo/static/tutor/stickers/skull.svg';
import smilingFaceWithHeartEyes from '@cdo/static/tutor/stickers/smiling-face-with-heart-eyes.svg';
import smilingFaceWithSunglasses from '@cdo/static/tutor/stickers/smiling-face-with-sunglasses.svg';
import sparkles from '@cdo/static/tutor/stickers/sparkles.svg';
import starStruck from '@cdo/static/tutor/stickers/star-struck.svg';
import star from '@cdo/static/tutor/stickers/star.svg';
import tRex from '@cdo/static/tutor/stickers/t-rex.svg';
import thinkingFace from '@cdo/static/tutor/stickers/thinking-face.svg';
import thumbsUp from '@cdo/static/tutor/stickers/thumbs-up.svg';
import trophy from '@cdo/static/tutor/stickers/trophy.svg';
import twoHearts from '@cdo/static/tutor/stickers/two-hearts.svg';
import unicorn from '@cdo/static/tutor/stickers/unicorn.svg';
import videoGame from '@cdo/static/tutor/stickers/video-game.svg';

export interface Sticker {
  // Unicode name; also the accessible name
  name: string;
  src: string;
}

export interface StickerSection {
  title: string;
  stickers: Sticker[];
}

export const STICKER_SECTIONS: StickerSection[] = [
  {
    title: 'Reactions',
    stickers: [
      {
        name: 'Grinning face with smiling eyes',
        src: grinningFaceWithSmilingEyes,
      },
      {name: 'Face with tears of joy', src: faceWithTearsOfJoy},
      {name: 'Loudly crying face', src: loudlyCryingFace},
      {name: 'Smiling face with heart-eyes', src: smilingFaceWithHeartEyes},
      {name: 'Smiling face with sunglasses', src: smilingFaceWithSunglasses},
      {name: 'Thinking face', src: thinkingFace},
      {name: 'Exploding head', src: explodingHead},
      {name: 'Star-struck', src: starStruck},
      {name: 'Partying face', src: partyingFace},
      {name: 'Face screaming in fear', src: faceScreamingInFear},
    ],
  },
  {
    title: 'Celebrate',
    stickers: [
      {name: 'Fire', src: fire},
      {name: 'Party popper', src: partyPopper},
      {name: 'Trophy', src: trophy},
      {name: 'Star', src: star},
      {name: 'Sparkles', src: sparkles},
      {name: 'Hundred points', src: hundredPoints},
      {name: 'Thumbs up', src: thumbsUp},
      {name: 'Clapping hands', src: clappingHands},
      {name: 'Red heart', src: redHeart},
      {name: 'Two hearts', src: twoHearts},
    ],
  },
  {
    title: 'Tech',
    stickers: [
      {name: 'Robot', src: robot},
      {name: 'Laptop', src: laptop},
      {name: 'Brain', src: brain},
      {name: 'Light bulb', src: lightBulb},
      {name: 'Rocket', src: rocket},
      {name: 'Bug', src: bug},
      {name: 'Puzzle piece', src: puzzlePiece},
      {name: 'Video game', src: videoGame},
      {name: 'Gear', src: gear},
      {name: 'Magnifying glass tilted left', src: magnifyingGlassTiltedLeft},
    ],
  },
  {
    title: 'Point it out',
    stickers: [
      {name: 'Right arrow', src: rightArrow},
      {name: 'Left arrow', src: leftArrow},
      {name: 'Backhand index pointing up', src: backhandIndexPointingUp},
      {name: 'Eyes', src: eyes},
      {name: 'Red question mark', src: redQuestionMark},
      {name: 'Red exclamation mark', src: redExclamationMark},
      {name: 'Double exclamation mark', src: doubleExclamationMark},
      {name: 'Check mark button', src: checkMarkButton},
      {name: 'Cross mark', src: crossMark},
      {name: 'Plus', src: plus},
    ],
  },
  {
    title: 'Just for fun',
    stickers: [
      {name: 'Dog face', src: dogFace},
      {name: 'Grinning cat', src: grinningCat},
      {name: 'Pile of poo', src: pileOfPoo},
      {name: 'Skull', src: skull},
      {name: 'Nail polish', src: nailPolish},
      {name: 'Alien', src: alien},
      {name: 'Ghost', src: ghost},
      {name: 'Nerd face', src: nerdFace},
      {name: 'T-Rex', src: tRex},
      {name: 'Unicorn', src: unicorn},
      {name: 'Goat', src: goat},
    ],
  },
];
