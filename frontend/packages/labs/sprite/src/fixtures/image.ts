import type {LabFixture} from '@code-dot-org/core/api/mocks';

import simple from './simple';

// An image level: the image pane is the whole lab, and the guide moves on
// once the student has made a character.
const image: LabFixture = {
  ...simple,
  levelProperties: {
    '1': {
      ...simple.levelProperties?.['1'],
      levelMode: {kind: 'image', imageType: 'sprite'},
      guideSteps: [
        {text: 'Make a character for your game.'},
        {
          text: 'Your character is ready. Continue to put it in a scene.',
          showContinue: true,
          after: {spriteImages: 1},
        },
      ],
    },
  } as LabFixture['levelProperties'],
};

export default image;
