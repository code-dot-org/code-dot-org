const baseAssetUrl = 'https://curriculum.code.org/media/musiclab/';

// Given information about a generated dancer, this returns the URL for the head image.
const getGeneratedDancerAssets = async (
  adlibOption: string,
  choices: string[] | undefined,
  variant: number
) => {
  const joinedChoices = choices?.join('-');
  const cacheFilePath = `${baseAssetUrl}generate/dancer/${adlibOption}-${joinedChoices}-${variant
    .toString()
    .padStart(2, '0')}.png`;

  return {head: cacheFilePath};
};

export {getGeneratedDancerAssets};
