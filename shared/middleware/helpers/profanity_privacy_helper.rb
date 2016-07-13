require 'cdo/share_filtering'

# The standard source filename used for blockly projects using channels
BLOCKLY_SOURCE_FILENAME = 'main.json'

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
