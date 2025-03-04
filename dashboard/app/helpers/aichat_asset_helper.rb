# Helps retrieve and encode assets for AI Chat uploads
module AichatAssetHelper
  ASSET_BUCKET = AssetBucket.new

  def self.get_asset_url(channel_id, filename)
    # TODO
  end

  # Returns a data URI in base64 format for the given asset.
  def self.get_asset_data_uri(channel_id, filename)
    result = ASSET_BUCKET.get(channel_id, filename)
    if result[:status] == 'FOUND'
      data = Base64.encode64(result[:body].read)
      mime_type = Rack::Mime.mime_type(File.extname(filename))
      "data:#{mime_type};base64,#{data}"
    end
    # TODO - error cases
  end
end
