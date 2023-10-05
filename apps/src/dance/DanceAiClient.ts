// Output: JSON containing {backgroundColor:string, backgroundEffect:string, foregroundEffect:string}
// ToDo: Break down into helper functions for each step rather than repeat code for each field
const cachedAi = async (input: string) => {
  const cachedPalettes: {[key: string]: any} = (
    await fetch('cdo-ai/hoc2023/cachedpalettemap.json')
  ).json();
  const inputWords: string[] = input.split(',');
  const trimmedInput: string[] = inputWords.map(value => value.trim());
  const individualPaletteMap: {[key: string]: any} = {};

  // Trim input json for emoji keywords
  trimmedInput.forEach(value => {
    if (Object.prototype.hasOwnProperty.call(cachedPalettes, value)) {
      individualPaletteMap[value] = cachedPalettes[value];
    }
  });

  // Sum word-association vectors of all input words
  const palettesLength = cachedPalettes['palettemap'].length;
  const paletteAssociation: number[] = new Array(palettesLength).fill(0);
  for (const key in individualPaletteMap) {
    if (Object.prototype.hasOwnProperty.call(individualPaletteMap, key)) {
      const vector: number[] = individualPaletteMap[key]['palettemap'];
      for (let i = 0; i < vector.length; i++) {
        paletteAssociation[i] += vector[i];
      }
    }
  }

  // Return max value of map vector as the output parameter e.g. backgroundColor="neon"
  const finalColor: string =
    cachedPalettes['palettemap'][
      paletteAssociation.indexOf(Math.max.apply(null, paletteAssociation))
    ];
  const cachedAiResponse = {backgroundColor: finalColor};
  return JSON.stringify(cachedAiResponse);
};

interface Item {
  id: string;
  name: string;
}

interface ReturnedItem {
  id: string;
  name: string;
  url: string;
}
