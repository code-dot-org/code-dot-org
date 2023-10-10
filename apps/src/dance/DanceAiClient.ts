import UntypedCachedPalettes from '@cdo/static/dance/ai/model/cachedpalettemap.json';
import UntypedCachedBackgrounds from '@cdo/static/dance/ai/model/cachedbackgroundmap.json';
import UntypedCachedForegrounds from '@cdo/static/dance/ai/model/cachedforegroundmap.json';

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
export default function cachedAi(input: string) {
  const inputWords: string[] = input.split(',');
  const trimmedInput: string[] = inputWords.map(value => value.trim());
  const inputPaletteVectors: {[key: string]: any} = {};
  const inputBackgroundVectors: {[key: string]: any} = {};
  const inputForegroundVectors: {[key: string]: any} = {};

  const {emojiAssociations: paletteAssociations, output: palettes} =
    CachedPalettes;
  const {emojiAssociations: backgroundAssociations, output: backgrounds} =
    CachedBackgrounds;
  const {emojiAssociations: foregroundAssociations, output: foregrounds} =
    CachedForegrounds;

  // Pull individual association vectors for each input emoji
  trimmedInput.forEach(value => {
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
    dancers: {
      type: 'frogs',
      count: Math.floor(Math.random() * 5),
      layout: 'circle',
    },
  };

  return JSON.stringify(cachedAiResponse);
}

function sumAssociationVectors(
  inputVectors: {[key: string]: any},
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
