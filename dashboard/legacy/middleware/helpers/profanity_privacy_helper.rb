require 'cdo/share_filtering'
require_relative './bucket_helper'
require_relative './source_bucket'
require 'cdo/firehose'

class ProfanityPrivacyError < StandardError
  def initialize(flagged_text)
    @flagged_text = flagged_text
    super
  end

  attr_reader :flagged_text
end

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

def title_profanity_privacy_violation(name, locale)
  share_failure = begin
    ShareFiltering.find_name_failure(name, locale)
  rescue OpenURI::HTTPError, IO::EAGAINWaitReadable => exception
    # If WebPurify or Geocoder are unavailable, default to viewable, but log error
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'share_filtering',
        study_group: 'v0',
        event: 'share_filtering_error',
        data_string: "#{exception.class.name}: #{exception}",
        data_json: {
          name: name,
          locale: locale
        }.to_json
      }
    )
    return false
  end
  share_failure
end

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

  # This probably means the filter only works on blockly-based labs
  # as e.g. Java Lab stores an object in the `main.json` source field like:
  # blockly_source = {"MyClass.java"=>{"text"=>"my source code for MyClass.java here", "isVisible"=>true, "tabOrder"=>0}}
  #
  # See: https://github.com/code-dot-org/code-dot-org/pull/60329#issuecomment-2282270302
  return false unless blockly_source.is_a? String

  begin
    ShareFiltering.find_share_failure(blockly_source, locale)
  rescue WebPurify::TextTooLongError, OpenURI::HTTPError, IO::EAGAINWaitReadable
    # If WebPurify or Geocoder are unavailable, default to viewable
    return false
  end
end
