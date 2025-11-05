import {AdlibsType} from '@cdo/apps/lab2/views/components/guide/Adlib';

const adlibOptions = {
  creature: [
    {id: 'axolotl', text: 'axolotl'},
    {id: 'cat', text: 'cat'},
    {id: 'dog', text: 'dog'},
    {id: 'flame', text: 'flame'},
    {id: 'fox', text: 'fox'},
    {id: 'frilled_lizard', text: 'frilled lizard'},
    {id: 'frog', text: 'frog'},
    {id: 'giraffe', text: 'giraffe'},
    {id: 'koala', text: 'koala'},
    {id: 'moose', text: 'moose'},
    {id: 'rabbit', text: 'rabbit'},
    {id: 'squirrel', text: 'squirrel'},
    {id: 'tiger', text: 'tiger'},
    {id: 'wolf', text: 'wolf'},
  ],
  attire: [
    {id: 'beanie', text: 'beanie'},
    {id: 'colorful_hair', text: 'colorful hair'},
    {id: 'crown', text: 'crown'},
    {id: 'headphones', text: 'headphones'},
    {id: 'headscarf', text: 'headscarf'},
    {id: 'sunglasses', text: 'sunglasses'},
    {id: 'no_accessories', text: 'no accessories'},
  ],
  mood: [
    {id: 'confused', text: 'confused'},
    {id: 'fierce', text: 'fierce'},
    {id: 'happy', text: 'happy'},
    {id: 'silly', text: 'silly'},
    {id: 'sleepy', text: 'sleepy'},
    {id: 'surprised', text: 'surprised'},
  ],
  style: [
    {id: 'classic', text: 'classic'},
    {id: 'fantasy', text: 'fantasy'},
    {id: 'kpop', text: 'K-pop'},
    {id: 'preppy', text: 'preppy'},
    {id: 'retro', text: 'retro'},
    {id: 'rock', text: 'rock'},
    {id: 'scifi', text: 'sci-fi'},
    {id: 'sporty', text: 'sporty'},
    {id: 'streetwear', text: 'streetwear'},
  ],
};

const adlibsDefault: AdlibsType = {
  'creature-05': {
    template: 'Design a {creature}.',
    options: {creature: adlibOptions.creature},
    variantCount: 7,
  },
  'creature-attire-05': {
    template: 'Design a {creature} wearing {attire}.',
    options: {
      creature: adlibOptions.creature,
      attire: adlibOptions.attire,
    },
    variantCount: 7,
  },
  'creature-attire-mood-style-05': {
    template:
      'Design a {creature} wearing {attire}, in a {mood} mood, with a {style} style.',
    options: {
      creature: adlibOptions.creature,
      attire: adlibOptions.attire,
      mood: adlibOptions.mood,
      style: adlibOptions.style,
    },
    variantCount: 7,
  },
};

export default adlibsDefault;
