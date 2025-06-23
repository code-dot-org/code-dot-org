# Helps retrieve and encode assets for AI Chat uploads
module AichatAssetHelper
  ASSET_BUCKET = AssetBucket.new

  # Note for PR (TODO - discuss and remove this note before PR merged):
  # -------------------------------------------------------------------
  # This function was added since gemini doesn't accept newlines
  # and takes the mime-type as a separate parameter rather (not
  # as a prefix in the data uri).  This is now a helper for
  # `get_asset_data_uri`
  # -------------------------------------------------------------------

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

  # Note for PR (TODO - discuss and remove this note before PR merged):
  # -------------------------------------------------------------------
  # This function is only used in this file (and its test). Previously it returned
  # a hash with a status and body to match AssetBucket.get. If the status was not
  # equal to 'FOUND' the caller threw an error stating "Error fetching asset..."

  # We previously threw an error in the caller based on the AssetBucket.get-like object
  # status which required mimicking and returning AssetBucket.get's response object here
  # (which didn't actually allow us to describe the various error cases we were catching).

  # IMHO it is cleaner to throw that error here as the error  relates to the error
  # fetching itself.  We can thus avoid passing an AssetBucket.get-like object when simply
  # passing the already 'read' asset body is sufficient.

  # Open Questions:
  # ---------------
  # I used `StandardError` because that was what was initially thrown. But see note in
  # `AichatOpenaiHelper` where we were not sufficiently dealing with errors related to
  # a failure to fetch a resource (from this module or in e.g. `Aws::S3`. Perhaps we
  # should create a new error class and ensure that all errors related to such a failure
  # are raised through it. Also see note in `aichat_asset_helper_test.rb` as to how
  # custom errors could improve test maintainability.
  # --------------------------------------------------------------------

  def self.fetch_asset(filename, source, channel_id, level_name)
    #call details to use when raising errors
    call_details = ({filename: filename,  source: source, channel_id: channel_id, level_name: level_name}).to_s

    if source == 'project'

      bucket_result = ASSET_BUCKET.get(channel_id, filename)
      bucket_status = bucket_result[:status]

      if bucket_status == 'FOUND'
        asset_body = bucket_result[:body]
      else
        raise StandardError.new(
          "Failed to fetch asset from project bucket with status = '#{bucket_status}' - #{call_details}"
        )

      end

    elsif source == 'level'

      level = Level.find_by(name: level_name)
      uuid_name = (level&.starter_assets || level&.project_template_level&.starter_assets || {})&.dig(filename)

      if uuid_name
        s3_object = LevelStarterAssetsHelper.get_object(uuid_name)
        if s3_object
          # note: this can raise its own errors for various reasons (e.g. from Aws::S3::Errors or Aws::Errors)
          asset_body = s3_object.get.body
        else
          raise StandardError.new(
            "Failed to fetch asset for level due to LevelStarterAssetsHelper.get_object('#{uuid_name}' not returning a bucket object. - #{call_details}"
          )
        end
      else
        raise StandardError.new(
          "Failed to fetch asset for level due to failure to retrieve 'uuid_name' - #{call_details}"
        )
      end

    else
      raise StandardError.new(
        "Failed to fetch asset due to unsupported source - #{call_details}"
      )
    end

    unless asset_body
      raise StandardError.new(
        "Failed to fetch asset for unknown reason. The variable 'asset_body' was not set - #{call_details}"
   )
    end

    #note: this can also result in other various errors
    asset_body.read
  end
end
