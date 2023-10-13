import UntypedCachedPalettes from '@cdo/static/dance/ai/model/cached-spacy-palette-map.json';
import UntypedCachedBackgrounds from '@cdo/static/dance/ai/model/cached-spacy-background-map.json';
import UntypedCachedForegrounds from '@cdo/static/dance/ai/model/cached-spacy-foreground-map.json';

// Custom types for vector mapping JSONs to play nice with Typescript
type EmojiAssociation = {
  association: number[];
};

type CachedMapping = {
  emojiAssociations: {[key: string]: EmojiAssociation};
  output: string[];
};

const CachedPalettes: CachedMapping = UntypedCachedPalettes;
const CachedBackgrounds: CachedMapping = UntypedCachedBackgrounds;
const CachedForegrounds: CachedMapping = UntypedCachedForegrounds;

// Output: JSON containing {backgroundColor:string, backgroundEffect:string, foregroundEffect:string}
// ToDo: Break down into helper functions for each step rather than repeat code for each field

// Note: I discovered that cachedAi only returns the highest value of the vector associated with the
// second emoji. Every time, it will return a palette, background, and foreground that only
// consider the second emoji. The first and third emojis are ignored. See inline explanation.
export default function cachedAi(input: string) {
  // sample input: 'Generate a scene using this mood: romantic, party, silly.'
  const inputWords: string[] = input.split(',');
  const trimmedInput: string[] = inputWords.map(value => value.trim());
  // sample trimmedInput: ['Generate a scene using this mood: romantic', 'party', 'silly.']
  const inputPaletteVectors: {[key: string]: {[key: string]: number[]}} = {};
  const inputBackgroundVectors: {[key: string]: {[key: string]: number[]}} = {};
  const inputForegroundVectors: {[key: string]: {[key: string]: number[]}} = {};

  const {emojiAssociations: paletteAssociations, output: palettes} =
    CachedPalettes;
  const {emojiAssociations: backgroundAssociations, output: backgrounds} =
    CachedBackgrounds;
  const {emojiAssociations: foregroundAssociations, output: foregrounds} =
    CachedForegrounds;
  // Pull individual association vectors for each input emoji
  trimmedInput.forEach(value => {
    // first pass is skipped in all three cases because none of the json have a key with the format 'Generate a scene using this mood: romantic'
    // second pass works and inserts the values for 'party'
    // third pass is also skipped. I ran out of time to learn why, but I believe the second pass overwrites some value that is referenced by Object.prorotype.hasOwnProperty.call
    if (Object.prototype.hasOwnProperty.call(paletteAssociations, value)) {
      inputPaletteVectors[value] = paletteAssociations[value];
    }
    if (Object.prototype.hasOwnProperty.call(backgroundAssociations, value)) {
      inputBackgroundVectors[value] = backgroundAssociations[value];
    }
    if (Object.prototype.hasOwnProperty.call(foregroundAssociations, value)) {
      inputForegroundVectors[value] = foregroundAssociations[value];
    }
  });
  // at this point, each vector has only the second emoji's values in it.

  // Sum word-association vectors of all input words
  const sumPaletteAssociation: number[] = sumAssociationVectors(
    inputPaletteVectors,
    palettes.length
  );
  const sumBackgroundAssociation: number[] = sumAssociationVectors(
    inputBackgroundVectors,
    backgrounds.length
  );
  const sumForegroundAssociation: number[] = sumAssociationVectors(
    inputForegroundVectors,
    foregrounds.length
  );

  // Return max value of map vector as the output parameter e.g. backgroundColor="neon"
  const finalColor: string =
    palettes[
      sumPaletteAssociation.indexOf(Math.max.apply(null, sumPaletteAssociation))
    ];
  const finalBackground: string =
    backgrounds[
      sumBackgroundAssociation.indexOf(
        Math.max.apply(null, sumBackgroundAssociation)
      )
    ];
  const finalForeground: string =
    foregrounds[
      sumForegroundAssociation.indexOf(
        Math.max.apply(null, sumForegroundAssociation)
      )
    ];
  const cachedAiResponse = {
    backgroundEffect: finalBackground,
    backgroundColor: finalColor,
    foregroundEffect: finalForeground,
  };

  return JSON.stringify(cachedAiResponse);
}

function sumAssociationVectors(
  inputVectors: {[key: string]: {[key: string]: number[]}},
  outputLength: number
) {
  const summedOutput: number[] = new Array(outputLength).fill(0);
  for (const key in inputVectors) {
    const vector: number[] = inputVectors[key]['association'];
    for (let i = 0; i < vector.length; i++) {
      summedOutput[i] += vector[i];
    }
  }
  return summedOutput;
}
