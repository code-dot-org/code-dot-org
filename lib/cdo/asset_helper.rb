require 'singleton'

class AssetHelper
  include Singleton

  def webpack_manifest_path
    "#{CDO.root_dir}/dashboard/public/blockly/js/manifest.json"
  end

  def webpack_manifest
    @webpack_manifest ||= JSON.parse(File.read(webpack_manifest_path))
  end

  def webpack_asset_path(asset)
    # Skip manifest lookup in certain environments where the manifest may not be
    # available. In development, where the webpack bundle has been built in
    # development mode, this produces valid url to an unminified, undigested
    # asset. In unit tests, this often just needs to return a stub value without
    # raising an exception.
    return "/blockly/#{asset}" if CDO.pretty_js
    path = webpack_manifest[asset]
    raise "Invalid webpack asset name: '#{asset}'" unless path
    path
  end
end

def webpack_asset_path(asset)
  AssetHelper.instance.webpack_asset_path(asset)
end
