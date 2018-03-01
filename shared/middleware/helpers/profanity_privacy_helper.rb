require 'cdo/share_filtering'
require_relative './bucket_helper.rb'
require_relative './source_bucket.rb'

# The standard source filename used for blockly projects using channels.
# Check whether it is defined—helpers can be double-included during test running.
BLOCKLY_SOURCE_FILENAME = 'main.json'.freeze unless defined? BLOCKLY_SOURCE_FILENAME

def profanity_privacy_violation?(filename, body)
  return false unless filename == BLOCKLY_SOURCE_FILENAME

  body_string = body.string

  begin
    parsed_json = JSON.parse(body_string)
  rescue JSON::ParserError
    return false
  end

  blockly_source = parsed_json['source']
  return false unless blockly_source

  begin
    return !ShareFiltering.find_share_failure(blockly_source, request.locale).nil?
  rescue OpenURI::HTTPError, IO::EAGAINWaitReadable
    # If WebPurify or Geocoder are unavailable, default to viewable
    return false
  end
end

def channel_policy_violation?(channel_id)
  bucket = SourceBucket.new
  filename = 'main.json'
  result = bucket.get(channel_id, filename)
  return false unless result && result[:body]
  profanity_privacy_violation?(filename, result[:body])
end
