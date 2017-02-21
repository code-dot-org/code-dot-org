require 'sprockets'

# Initializes the asset map from the dashboard assets directory.
def load_asset_map
  $asset_map = nil
  manifest_filename = Sprockets::ManifestUtils.find_directory_manifest(CDO.dashboard_assets_dir)
  return unless manifest_filename
  json = File.read(manifest_filename)
  $asset_map = JSON.parse(json)['assets']
end
load_asset_map

# Fetch the path to the minified, digested version of the specified asset
# if minification is enabled, otherwise fetch the unminifested, digested version.
def minifiable_asset_path(asset)
  asset.sub!(/\.js$/, '.min.js') unless CDO.pretty_js
  asset_path(asset)
end

# Fetch the path to the unminified, digested version of the specified asset.
def asset_path(asset)
  raise "Asset map not initialized" unless $asset_map
  asset_path = $asset_map[asset]
  raise "Asset not found in asset map: '#{asset}'" unless asset_path
  CDO.studio_url("/assets/#{asset_path}")
end
