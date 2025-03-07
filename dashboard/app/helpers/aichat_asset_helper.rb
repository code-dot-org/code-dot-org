# Helps retrieve and encode assets for AI Chat uploads
module AichatAssetHelper
  ASSET_BUCKET = AssetBucket.new

  def self.get_asset_url(channel_id, filename)
    # TODO
  end

  # Returns a list of data URIs in base64 format for the given asset.
  def self.get_asset_data_uris(channel_id, filename)
    result = ASSET_BUCKET.get(channel_id, filename)

    # TODO - error cases
    return nil unless result[:status] == 'FOUND'

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
end
