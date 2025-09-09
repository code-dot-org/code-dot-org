const baseAssetUrl = 'https://curriculum.code.org/media/musiclab/';

// Given information about a generated dancer, this returns the URL for the head image.
const getGeneratedDancerAssets = async (
  adlibOption: string,
  joinedChoicesText: string,
  variant: number
) => {
  const cacheFilePath = `${baseAssetUrl}generate/dancer/${adlibOption}-${joinedChoicesText}-${variant
    .toString()
    .padStart(2, '0')}.png`;

  return {head: cacheFilePath};
};

export {getGeneratedDancerAssets};
