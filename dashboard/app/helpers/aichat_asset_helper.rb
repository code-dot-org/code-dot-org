# Helps retrieve and encode assets for AI Chat uploads
module AichatAssetHelper
  ASSET_BUCKET = AssetBucket.new

  # Returns a data URI in base64 format for the given asset.
  def self.get_asset_data_uri(asset, channel_id, level_name)
    filename = asset["filename"]
    source = asset["source"]
    result = fetch_asset(filename, source, channel_id, level_name)

    # TODO - error cases
    return nil unless result && result[:status] == 'FOUND'

    data = Base64.encode64(result[:body].read)
    mime_type = Rack::Mime.mime_type(File.extname(filename))
    "data:#{mime_type};base64,#{data}"
  end

  def self.fetch_asset(filename, source, channel_id, level_name)
    return ASSET_BUCKET.get(channel_id, filename) if source == 'project'
    if source == 'level'
      level = Level.find_by(name: level_name)
      uuid_name = (level&.starter_assets || level&.project_template_level&.starter_assets || {})&.dig(filename)
      return nil if uuid_name.nil?
      s3_object = LevelStarterAssetsHelper.get_object(uuid_name)
      return {status: 'FOUND', body: s3_object.get.body} if s3_object
    end
  end
end
