import api from './apiJavascript.js';

export const blocks = [
  {func: 'moveForward', parent: api, category: 'Artist', params: ['100']},
  {func: 'turnRight', parent: api, category: 'Artist', params: ['90']},
  {func: 'penColour', parent: api, category: 'Artist', params: ["'#ff0000'"]},
  {func: 'penWidth', parent: api, category: 'Artist', params: ['1']},
];

export const categories = {
  Artist: {
    color: 'red',
    blocks: [],
  },
};
