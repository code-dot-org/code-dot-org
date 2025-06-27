# Helps retrieve and encode assets for AI Chat uploads.
module AichatAssetHelper
  class AichatAssetFetchError < StandardError; end
  class AichatLevelAssetFetchError < AichatAssetFetchError; end
  class AichatProjectAssetFetchError < AichatAssetFetchError; end

  ASSET_BUCKET = AssetBucket.new

  # Returns a base64 string for the given asset.
  def self.get_asset_base64_string(filename, source, channel_id, level_name)
    asset = fetch_asset(filename, source, channel_id, level_name)
    Base64.strict_encode64(asset)
  end

  # Returns a data URI in base64 format for the given asset.
  def self.get_asset_data_uri(filename, source, channel_id, level_name)
    mime_type = Rack::Mime.mime_type(File.extname(filename))
    base64_data = get_asset_base64_string(filename, source, channel_id, level_name)

    "data:#{mime_type};base64,#{base64_data}"
  end

  def self.fetch_asset(filename, source, channel_id, level_name)
    # Call details to use when raising errors.
    call_details = ({filename: filename,  source: source, channel_id: channel_id, level_name: level_name}).to_s

    if source == 'project'

      bucket_result = ASSET_BUCKET.get(channel_id, filename)
      bucket_status = bucket_result[:status]

      if bucket_status == 'FOUND'
        asset_body = bucket_result[:body]
      else
        raise AichatProjectAssetFetchError.new(
          "Failed to fetch asset from project bucket with status = '#{bucket_status}' - #{call_details}"
        )

      end

    elsif source == 'level'

      level = Level.find_by(name: level_name)
      uuid_name = (level&.starter_assets || level&.project_template_level&.starter_assets || {})&.dig(filename)

      if uuid_name
        s3_object = LevelStarterAssetsHelper.get_object(uuid_name)
        if s3_object

          # The following call can result in various errors that currently are not derived
          # from AichatAssetFetchError (e.g. from Aws::S3::Errors or Aws::Errors).
          asset_body = s3_object.get.body
        else
          raise AichatLevelAssetFetchError.new(
            "Failed to fetch asset for level due to LevelStarterAssetsHelper.get_object('#{uuid_name}' not returning a bucket object. - #{call_details}"
          )
        end
      else
        raise AichatLevelAssetFetchError.new(
          "Failed to fetch asset for level due to failure to retrieve 'uuid_name' - #{call_details}"
        )
      end

    else
      raise AichatAssetFetchError.new(
        "Failed to fetch asset due to unsupported source - #{call_details}"
      )
    end

    unless asset_body
      raise AichatAssetFetchError.new(
        "Failed to fetch asset for unknown reason. The variable 'asset_body' was not set - #{call_details}"
   )
    end

    # Read the body.  This can result in various errors that
    # currently are not derived from AichatAssetFetchError.
    asset_body.read
  end
end
