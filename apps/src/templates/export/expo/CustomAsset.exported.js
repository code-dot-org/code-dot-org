import { NativeModules, PixelRatio, Platform } from 'react-native';
import AssetRegistry from 'AssetRegistry';
import AssetSourceResolver from 'AssetSourceResolver';

// On Android we pass the manifest in JSON form so this step is necessary
const { ExponentConstants } = NativeModules;

let manifest;
if (ExponentConstants) {
  manifest = ExponentConstants.manifest;
  if (typeof manifest === 'string') {
    manifest = JSON.parse(manifest);
  }
}

const Constants = {
  ...ExponentConstants,
  manifest,
};

const FS = NativeModules.ExponentFileSystem;

// Fast lookup check if assets are available in the local bundle.
const bundledAssets = new Set(FS.bundledAssets || []);

// Return { uri, hash } for an asset's file, picking the correct scale, based on its React Native
// metadata. If the asset isn't an image just picks the first file.
const pickScale = meta => {
  // This logic is based on that in AssetSourceResolver.js, we just do it with our own tweaks for
  // Expo

  const scale =
    meta.scales.length > 1 ? AssetSourceResolver.pickScale(meta.scales, PixelRatio.get()) : 1;
  const index = meta.scales.findIndex(s => s === scale);
  const hash = meta.fileHashes[index] || meta.fileHashes[0];

  const suffix =
    '/' +
    meta.name +
    (scale === 1 ? '' : '@' + scale + 'x') +
    '.' +
    meta.type +
    '?platform=' +
    Platform.OS +
    '&hash=' +
    meta.hash;

  // Allow asset processors to directly provide the URL that will be loaded
  if (meta.uri) {
    return {
      uri: meta.uri,
      hash,
    };
  }

  if (/^https?:/.test(meta.httpServerLocation)) {
    // This is a full URL, so we avoid prepending bundle URL/cloudfront
    // This usually means Asset is on a different server, and the URL is present in the bundle
    return {
      uri: meta.httpServerLocation + suffix,
      hash,
    };
  }

  if (Constants.manifest.xde) {
    // Development server URI is pieced together
    return {
      uri:
        Constants.manifest.bundleUrl.match(/^https?:\/\/.*?\//)[0] +
        meta.httpServerLocation.replace(/^\/?/, '') +
        suffix,
      hash,
    };
  }

  // CDN URI is based directly on the hash
  return {
    uri: 'https://d1wp6m56sqw74a.cloudfront.net/~assets/' + hash,
    hash,
  };
};

// Returns the uri of an asset from its hash and type or null if the asset is
// not included in the app bundle.
const getUriInBundle = (hash, type) => {
  const assetName = 'asset_' + hash + (type ? '.' + type : '');
  if (Constants.appOwnership !== 'standalone' || !bundledAssets.has(assetName)) {
    return null;
  }
  return `${FS.bundleDirectory}${assetName}`;
};

export default class CustomAsset {
  static byHash = {};

  constructor({ name, type, hash, uri, width, height }) {
    this.name = name;
    this.type = type;
    this.hash = hash;
    this.uri = uri;
    if (typeof width === 'number') {
      this.width = width;
    }
    if (typeof height === 'number') {
      this.height = height;
    }

    this.downloading = false;
    this.downloaded = false;
    this.downloadCallbacks = [];
  }

  static loadAsync(moduleId) {
    let moduleIds = typeof moduleId === 'number' ? [moduleId] : moduleId;
    return Promise.all(moduleIds.map(m => CustomAsset.fromModule(m).downloadAsync()));
  }

  static loadAsyncAssets(assets) {
    return Promise.all(assets.map(a => a.downloadAsync()));
  }

  static fromModule(moduleId, fileName) {
    const meta = AssetRegistry.getAssetByID(moduleId);
    const asset = CustomAsset.fromMetadata(meta);
    asset.name = fileName;
    return asset;
  }

  static fromMetadata(meta) {
    // The hash of the whole asset, not to confuse with the hash of a specific
    // file returned from `pickScale`.
    const metaHash = meta.hash;
    if (CustomAsset.byHash[metaHash]) {
      return CustomAsset.byHash[metaHash];
    }

    const { uri, hash } = pickScale(meta);

    const asset = new CustomAsset({
      name: meta.name,
      type: meta.type,
      hash,
      uri,
      width: meta.width,
      height: meta.height,
    });
    CustomAsset.byHash[metaHash] = asset;
    return asset;
  }

  async downloadAsync() {
    if (this.downloaded) {
      return;
    }
    if (this.downloading) {
      await new Promise((resolve, reject) => this.downloadCallbacks.push({ resolve, reject }));
      return;
    }
    this.downloading = true;
    try {
      const localUri = `${FS.cacheDirectory}${this.name}`;
      let exists, md5;
      ({ exists, md5 } = await FS.getInfoAsync(localUri, {
        cache: true,
        md5: true,
      }));
      if (!exists || md5 !== this.hash) {
        const dirName = localUri.substring(0, localUri.lastIndexOf('/'));
        if (`${dirName}/` !== FS.cacheDirectory) {
          try {
            await FS.makeDirectoryAsync(dirName, {
              intermediates: true,
            });
          } catch (e) {
            // Ignore this because it throws if the dir already exists on Android
          }
        }
        const bundleUri = getUriInBundle(this.hash, this.type);
        if (bundleUri) {
          await FS.copyAsync({
            from: bundleUri,
            to: localUri,
          });
          ({ md5 } = await FS.getInfoAsync(localUri, {
            cache: true,
            md5: true,
          }));
        }
        ({ md5 } = await FS.downloadAsync(this.uri, localUri, {
          cache: true,
          md5: true,
        }));
        if (md5 !== this.hash) {
          throw new Error(
            `Downloaded file for asset '${this.name} ` +
              `Located at ${this.uri} ` +
              `failed MD5 integrity check`
          );
        }
      }

      this.localUri = localUri;
      this.downloaded = true;
      this.downloadCallbacks.forEach(({ resolve }) => resolve());
    } catch (e) {
      this.downloadCallbacks.forEach(({ reject }) => reject(e));
      throw e;
    } finally {
      this.downloading = false;
      this.downloadCallbacks = [];
    }
  }
}
