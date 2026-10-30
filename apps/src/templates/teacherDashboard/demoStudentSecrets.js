import alienThumb from '@cdo/static/skins/studio/alien_thumb.png';
import catThumb from '@cdo/static/skins/studio/cat_thumb.png';
import dinosaurThumb from '@cdo/static/skins/studio/dinosaur_thumb.png';
import dragonThumb from '@cdo/static/skins/studio/dragon_thumb.png';
import knightThumb from '@cdo/static/skins/studio/knight_thumb.png';
import robotThumb from '@cdo/static/skins/studio/robot_thumb.png';

// Demo students have nil secret_words and secret_picture_id on the backend
// (credentials are stripped when a user is flagged as a demo student). Pick a
// placeholder per student so a roster shows variety like a real classroom.
// Keyed by student id so a given demo student shows the same fake secret on
// both the manage-students roster and their login card on the login-info page.
export const DEMO_SECRET_WORDS = [
  'purple tiger',
  'happy dragon',
  'silver wolf',
  'golden bird',
  'brave knight',
  'tiny robot',
];

export const DEMO_SECRET_PICTURE_URLS = [
  catThumb,
  dragonThumb,
  alienThumb,
  dinosaurThumb,
  knightThumb,
  robotThumb,
];

// Parallel to DEMO_SECRET_PICTURE_URLS; used as image alt text on login cards.
export const DEMO_SECRET_PICTURE_NAMES = [
  'cat',
  'dragon',
  'alien',
  'dinosaur',
  'knight',
  'robot',
];

// Stable positive modulo so a negative studentId still maps into [0, length).
const demoIndex = (studentId, length) =>
  ((studentId % length) + length) % length;

export const demoSecretWordsFor = studentId =>
  DEMO_SECRET_WORDS[demoIndex(studentId, DEMO_SECRET_WORDS.length)];

export const demoSecretPictureUrlFor = studentId =>
  DEMO_SECRET_PICTURE_URLS[
    demoIndex(studentId, DEMO_SECRET_PICTURE_URLS.length)
  ];

export const demoSecretPictureNameFor = studentId =>
  DEMO_SECRET_PICTURE_NAMES[
    demoIndex(studentId, DEMO_SECRET_PICTURE_NAMES.length)
  ];
