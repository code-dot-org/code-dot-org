require 'cdo/share_filtering'
require_relative './bucket_helper.rb'
require_relative './source_bucket.rb'

# The standard source filename used for blockly projects using channels.
# Check whether it is defined—helpers can be double-included during test running.
BLOCKLY_SOURCE_FILENAME = 'main.json'.freeze unless defined? BLOCKLY_SOURCE_FILENAME

def profanity_privacy_violation?(filename, body)
  return false unless filename == BLOCKLY_SOURCE_FILENAME
  share_failure = share_failure_from_body body, request.locale
  !!share_failure
end

def channel_policy_violation?(channel_id)
  body = channel_main_json_body channel_id
  return false unless body
  profanity_privacy_violation?(BLOCKLY_SOURCE_FILENAME, body)
end

#
# This method is designed to be an easy way for support staff or a dev to
# figure out why sharing was automatically blocked for a particular project.
# It's designed for use from dashboard-console, which is why it has no usages
# within our repo.
#
# @example
#   explain_share_failure 'kkbjvA8CUoWEAJ0inKpzTQ'
#
# @param [String] channel_id - the encrypted channel ID, as found in the
#   project's share URL.
# @param [String] locale - optionally specify a custom locale string
#   (two-character code) to check profanity in a different language.
# @returns [ShareFailure|false] if the project is blocked, this method should
#   return a ShareFailure struct that reveals exactly which content caused the
#   block and why.  If not, this method returns false.
#
def explain_share_failure(channel_id, locale = 'en')
  body = channel_main_json_body channel_id
  share_failure_from_body body, locale
end

# Effectively private
def channel_main_json_body(channel_id)
  bucket = SourceBucket.new
  filename = BLOCKLY_SOURCE_FILENAME
  result = bucket.get(channel_id, filename)
  (result && result[:body]) || false
end

# Effectively private
def share_failure_from_body(body, locale)
  return false unless body
  body_string = body.string

  begin
    parsed_json = JSON.parse(body_string)
  rescue JSON::ParserError
    return false
  end

  blockly_source = parsed_json['source']
  return false unless blockly_source

  begin
    ShareFiltering.find_share_failure(blockly_source, locale)
  rescue OpenURI::HTTPError, IO::EAGAINWaitReadable
    # If WebPurify or Geocoder are unavailable, default to viewable
    return false
  end
end
