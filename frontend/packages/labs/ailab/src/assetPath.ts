(
  global as unknown as Record<string, unknown>
).__ml_playground_asset_public_path__ = './assets/';

export const setAssetPath = (path: string): void => {
  (
    global as unknown as Record<string, unknown>
  ).__ml_playground_asset_public_path__ = path;
};
