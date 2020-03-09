import unwrappedShowAssetManager from './assets/show';
import listStore from './assets/assetListStore';
// wrap showAssetManager, so that it can be stubbed in unit tests.
const showAssetManager = (...args) =>
  unwrappedShowAssetManager.showAssetManager(...args);
const hideAssetManager = (...args) =>
  unwrappedShowAssetManager.hideAssetManager(...args);
export {showAssetManager, listStore, hideAssetManager};
