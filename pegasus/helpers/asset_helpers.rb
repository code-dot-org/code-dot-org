require 'singleton'
require 'sprockets'

class AssetMap
  include Singleton

  # Initializes the asset map from the dashboard assets directory.
  def initialize
    @asset_map = nil
    manifest_filename = Sprockets::ManifestUtils.find_directory_manifest(CDO.dashboard_assets_dir)
    return unless manifest_filename && File.exist?(manifest_filename)
    json = File.read(manifest_filename)
    @asset_map = JSON.parse(json)['assets']
  end

  def minifiable_asset_path(asset)
    asset = asset.sub(/\.js$/, '.min.js') unless CDO.pretty_js
    asset_path(asset)
  end

  def asset_path(asset)
    # Don't require developers or unit tests to precompile assets.
    return "/assets/#{asset}" if CDO.pretty_js
    raise "Asset map not initialized" unless @asset_map
    asset_path = @asset_map[asset]
    raise "Asset not found in asset map: '#{asset}'" unless asset_path
    "/assets/#{asset_path}"
  end
end

# Fetch the path to the minified, digested version of the specified asset
# if minification is enabled, otherwise fetch the unminified, digested version.
def minifiable_asset_path(asset)
  AssetMap.instance.minifiable_asset_path(asset)
end

# Fetch the path to the unminified, digested version of the specified asset.
def asset_path(asset)
  AssetMap.instance.asset_path(asset)
end
