# Helps retrieve and encode assets for AI Chat uploads
module AichatAssetHelper
  ASSET_BUCKET = AssetBucket.new

  # Returns a list of data URIs in base64 format for the given asset.
  def self.get_asset_data_uris(asset, channel_id, level_name)
    filename = asset["filename"]
    source = asset["source"]
    result = fetch_asset(filename, source, channel_id, level_name)

    # TODO - error cases
    return [] unless result && result[:status] == 'FOUND'

    ext = File.extname(filename)
    return pdf_to_images(result) if ext == '.pdf'

    data = Base64.encode64(result[:body].read)
    mime_type = Rack::Mime.mime_type(File.extname(filename))
    ["data:#{mime_type};base64,#{data}"]
  end

  # Converts PDF documents to images in base64 format
  def self.pdf_to_images(pdf_data)
    images = Magick::Image.from_blob(pdf_data[:body].read) do |options|
      # Tweak these options (and/or add more?) when assessing quality/size tradeoffs
      options.density = 150
      options.quality = 100
    end

    data_uris = []
    images.each_with_index do |image, _index|
      # Avoid transparency issues with background color
      image.alpha(Magick::RemoveAlphaChannel)
      image.format = 'jpg'
      # Optional for debugging - see converted image
      # image.write("#{filename}_#{_index}.jpg")
      data = Base64.encode64(image.to_blob)
      data_uris << "data:image/jpeg;base64,#{data}"
    end
    data_uris
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
