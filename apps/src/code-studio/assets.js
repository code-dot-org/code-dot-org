import listStore from './assets/assetListStore';
import unwrappedShowAssetManager from './assets/show';
// wrap showAssetManager, so that it can be stubbed in unit tests.
const showAssetManager = (...args) =>
  unwrappedShowAssetManager.showAssetManager(...args);
const hideAssetManager = (...args) =>
  unwrappedShowAssetManager.hideAssetManager(...args);
export {showAssetManager, listStore, hideAssetManager};
