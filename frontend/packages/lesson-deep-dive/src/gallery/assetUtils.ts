import {ChallengeResponse, ChallengeResponseAsset} from '../types';

// The response's asset of the given type, if its bytes have been uploaded
// (an asset row without a download URL has no content to show).
export const assetWithUrl = (
  response: ChallengeResponse,
  assetType: ChallengeResponseAsset['asset_type'],
): ChallengeResponseAsset | null =>
  response.assets.find(
    asset => asset.asset_type === assetType && asset.download_url,
  ) || null;
