import UntypedCachedPalettes from '@cdo/static/dance/ai/model/cachedpalettemap.json';
import {PaletteMap} from './types';

const CachedPalettes: PaletteMap = UntypedCachedPalettes;
const palettes: string[] = [
  'cool',
  'black and white',
  'electronic',
  'ice cream',
  'light',
  'neon',
  'tropical',
  'vintage',
  'warm',
  'autumn',
  'dawn',
  'dusk',
  'grey',
  'ocean',
  'rainbow',
  'roses',
  'sky',
  'spring',
  'winter',
  'summer',
];

// Output: JSON containing {backgroundColor:string, backgroundEffect:string, foregroundEffect:string}
// ToDo: Break down into helper functions for each step rather than repeat code for each field
export default function cachedAi(input: string) {
  const inputWords: string[] = input.split(',');
  const trimmedInput: string[] = inputWords.map(value => value.trim());
  const individualPaletteMap: {[key: string]: any} = {};

  // Trim input json for emoji keywords
  trimmedInput.forEach(value => {
    if (Object.prototype.hasOwnProperty.call(CachedPalettes, value)) {
      individualPaletteMap[value] = CachedPalettes[value];
    }
  });

  // Sum word-association vectors of all input words
  const palettesLength = palettes.length;
  const paletteAssociation: number[] = new Array(palettesLength).fill(0);
  for (const key in individualPaletteMap) {
    if (Object.prototype.hasOwnProperty.call(individualPaletteMap, key)) {
      const vector: number[] = individualPaletteMap[key]['association'];
      for (let i = 0; i < vector.length; i++) {
        paletteAssociation[i] += vector[i];
      }
    }
  }

  // Return max value of map vector as the output parameter e.g. backgroundColor="neon"
  const finalColor: string =
    palettes[
      paletteAssociation.indexOf(Math.max.apply(null, paletteAssociation))
    ];
  const cachedAiResponse = {backgroundColor: finalColor};
  return JSON.stringify(cachedAiResponse);
}
