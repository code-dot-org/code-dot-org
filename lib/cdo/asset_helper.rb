require 'singleton'

class AssetHelper
  include Singleton

  def webpack_manifest_path
    ''
  end

  def initialize
    @webpack_manifest = JSON.parse(File.read(webpack_manifest_path))
  end

  def webpack_asset_path(asset)
    path = @webpack_manifest[asset]
    raise "Invalid webpack asset name: '#{asset}'" unless path
    path
  end
end

def webpack_asset_path(asset)
  AssetHelper.instance.webpack_asset_path(asset)
end
