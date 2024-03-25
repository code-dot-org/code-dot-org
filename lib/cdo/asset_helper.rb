require 'singleton'

class AssetHelper
  include Singleton

  def webpack_manifest_path
    "#{CDO.root_dir}/dashboard/public/blockly/js/manifest.json"
  end

  def webpack_manifest
    @webpack_manifest ||= JSON.parse(File.read(webpack_manifest_path))
  end

  #
  # Returns a url to the specified asset, such as 'js/cookieBanner.js'.
  #
  # When using an apps package containing optimized webpack assets, the manifest
  # must be used to locate the asset. The result may look like this:
  #
  #   '/assets/js/cookieBannerwp0123456789aabbccddee.min.js'
  #
  # Prebuilt apps packages only contain optimized webpack assets, so if we are
  # using a prebuilt apps package then we must use the manifest.
  #
  # When building and using unoptimized assets in development, the manifest
  # lookup is skipped and the result is a valid url to an unminified, unhashed
  # asset like this:
  #
  #   '/assets/js/cookieBanner.js'
  #
  # Unit tests must not assume the presence of a webpack manifest. Therefore,
  # unit tests which need this method to return a value without raising must
  # stub the CDO object in order to ensure that the webpack manifest is skipped.
  #
  def webpack_asset_path(asset)
    using_prebuilt_apps = !CDO.use_my_apps
    use_manifest = CDO.optimize_webpack_assets || using_prebuilt_apps
    return "/assets/#{asset}" unless use_manifest
    path = webpack_manifest[asset]
    raise "Invalid webpack asset name: '#{asset}'" unless path
    path
  end
end

def webpack_asset_path(asset)
  AssetHelper.instance.webpack_asset_path(asset)
end
