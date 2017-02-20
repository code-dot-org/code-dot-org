require 'sprockets'

ASSETS_DIR = "#{CDO.root_dir}/dashboard/public/assets"

def load_asset_map
  manifest_filename = Sprockets::ManifestUtils.find_directory_manifest(ASSETS_DIR)
  raise "Manifest file not found in #{assets_dir}" unless manifest_filename
  json = File.read(manifest_filename)
  JSON.parse(json)['assets']
end
ASSET_MAP = load_asset_map

def minifiable_asset_path(asset)
  asset.sub!(/\.js$/, '.min.js') unless CDO.pretty_js
  asset_path(asset)
end

def asset_path(asset)
  asset_path = ASSET_MAP[asset]
  raise "Asset not found in asset map: '#{asset}'" unless asset_path
  CDO.studio_url("/assets/#{asset_path}")
end
