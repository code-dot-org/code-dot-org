import {BodyVariantCounts} from '@cdo/apps/lab2/views/components/guide/Adlib';

// A manually maintained mapping of body style to number of variants available.
// This should be kept in sync with the assets in S3 at
// s3://cdo-curriculum/media/musiclab/generate/dancer/bodies/
const bodyVariantCounts: BodyVariantCounts = {
  classic: 8,
  fantasy: 6,
  kpop: 6,
  preppy: 10,
  retro: 5,
  rock: 5,
  scifi: 5,
  sporty: 5,
  streetwear: 5,
};

export default bodyVariantCounts;
