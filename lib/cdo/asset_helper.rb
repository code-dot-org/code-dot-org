require 'singleton'

class AssetHelper
  include Singleton

  def webpack_manifest_path
    "#{CDO.root_dir}/dashboard/public/blockly/js/manifest.json"
  end

  def webpack_asset_url_prefix
    '/blockly'
  end

  def webpack_manifest
    @webpack_manifest ||= JSON.parse(File.read(webpack_manifest_path))
  end

  # Compatibility shim for manifests generated before webpack assets moved from
  # `/assets/js` to `/blockly/js`.
  #
  # Fresh `yarn build:dist` output already writes `/blockly/js/...` entries to
  # `manifest.json`, but older local builds and prebuilt apps packages may
  # still point at `/assets/js/...`. Normalize those legacy entries here so
  # they continue to work during the transition away from the Rails asset
  # pipeline for webpack assets.
  #
  # Remove this once we no longer need to support manifests produced before the
  # `/blockly/js` publicPath change.
  def normalize_webpack_asset_path(path)
    path.sub(%r{\A/assets/js/}, '/blockly/js/')
  end

  #
  # Returns a url to the specified asset, such as 'js/cookieBanner.js'.
  #
  # When using an apps package containing optimized webpack assets, the manifest
  # must be used to locate the asset. The result may look like this:
  #
  #   '/blockly/js/cookieBannerwp0123456789aabbccddee.min.js'
  #
  # Prebuilt apps packages only contain optimized webpack assets, so if we are
  # using a prebuilt apps package then we must use the manifest.
  #
  # When building and using unoptimized assets in development, the manifest
  # lookup is skipped and the result is a valid url to an unminified, unhashed
  # asset like this:
  #
  #   '/blockly/js/cookieBanner.js'
  #
  # Unit tests must not assume the presence of a webpack manifest. Therefore,
  # unit tests which need this method to return a value without raising must
  # stub the CDO object in order to ensure that the webpack manifest is skipped.
  #
  def webpack_asset_path(asset)
    using_prebuilt_apps = !CDO.use_my_apps
    use_manifest = CDO.optimize_webpack_assets || using_prebuilt_apps
    return "#{webpack_asset_url_prefix}/#{asset}" unless use_manifest
    path = webpack_manifest[asset]
    raise "Invalid webpack asset name: '#{asset}'" unless path
    normalize_webpack_asset_path(path)
  end
end

def webpack_asset_path(asset)
  AssetHelper.instance.webpack_asset_path(asset)
end
