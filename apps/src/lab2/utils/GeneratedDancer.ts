const baseAssetUrl = 'https://curriculum.code.org/media/musiclab/';

// Returns the URL for the head of a generated dancer.
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
