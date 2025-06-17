require 'cdo/regexp'
require 'cdo/geocoder'
require 'cdo/profanity_filter'
require 'dynamic_config/gatekeeper'

USER_ENTERED_TEXT_INDICATORS = ['TITLE', 'TEXT', 'title name\=\"VAL\"'].freeze
PLAYLAB_APP_INDICATOR = 'studio_'.freeze

# This is raised if there is any violation and you query with exceptions
# enabled.
class ShareFilterException < StandardError
  attr_reader :share_failure

  def initialize(msg, share_failure)
    raise TypeError unless share_failure.is_a?(ShareFailure)
    @share_failure = share_failure
    super(msg)
  end
end

# This is raised if there is a PII violation and you query with exceptions
# enabled.
class PIIFilterException < ShareFilterException
end

# This is raised if there is a profanity violation and you query with exceptions
# enabled.
class ProfanityFilterException < ShareFilterException
end

# This keeps track of the type and the actual offending content of a share
# violation.
ShareFailure = Struct.new(:type, :content)

# Utilities for finding personally-identifiable and profane content in user
# submitted programs.
module ShareFiltering
  module FailureType
    EMAIL = 'email'.freeze
    ADDRESS = 'address'.freeze
    PHONE = 'phone'.freeze
    PROFANITY = 'profanity'.freeze
  end

  FILTERED_PROJECT_TYPES = ['spritelab', 'playlab', 'poetry'].freeze

  # Searches for a sharing failure given a program and locale.
  # Returns both the error type and the offending text snippet.
  #
  # May throw OpenURI::HTTPError, IO::EAGAINWaitReadable depending on
  # service availability.
  #
  # @param [String] program the student's program text
  # @param [String] locale a two-character ISO 639-1 language code
  def self.find_share_failure(program, locale, project_type, exceptions: false)
    return nil unless should_filter_program(program, project_type)

    # Extract program text including variable names, field values, text values in block inputs and comments.
    texts = extract_user_text_blockly(program)
    program_text = texts.join(" ")
    puts "program_text #{program_text}"

    find_failure(program_text, locale, exceptions: exceptions)
  end

  def self.extract_user_text_blockly(program_json)
    json = JSON.parse(program_json)
    texts = []

    # Extract variable names.
    if json["variables"].is_a?(Array)
      json["variables"].each do |variable|
        name = variable["name"]
        texts << name if name.is_a?(String) && !name.strip.empty?
      end
    end

    # Traverse each block recursively.
    json.dig("blocks", "blocks")&.each do |block|
      traverse_block(block, texts)
    end

    texts.compact.uniq
  end

  # Clean string values from XML-wrapped field values.
  def self.clean_text_value(value)
    return nil unless value.is_a?(String)

    # Extracts text inside a <field> tag if present and removes all double quotes.
    # Removes double quotes if no field tag is found
    if value =~ /<field name=.*?>(.*?)<\/field>/m
      $1.delete('"', '')
    else
      value.delete('"', '')
    end
  end

  # Recursively traverse through the block tree.
  def self.traverse_block(block, texts)
    return unless block.is_a?(Hash)

    type = block["type"]
    fields = block["fields"] || {}
    inputs = block["inputs"] || {}

    # Extract from known user-content blocks
    if type == "gamelab_comment"
      comment = clean_text_value(fields["COMMENT"])
      texts << comment if comment && !comment.strip.empty?
    end

    # Extract from general string fields
    fields.each_value do |value|
      cleaned = clean_text_value(value)
      texts << cleaned if cleaned && !cleaned.strip.empty?
    end

    # Recurse into input blocks (normal and shadow).
    inputs.each_value do |input|
      traverse_block(input["block"], texts) if input["block"]
      traverse_block(input["shadow"], texts) if input["shadow"]
    end

    # Recurse into the 'next' chain.
    traverse_block(block.dig("next", "block"), texts)
  end

  def self.should_filter_program(program, project_type)
    return FILTERED_PROJECT_TYPES.include?(project_type)
  end

  # Searches for a sharing failure given a program name and locale.
  # Returns both the error type and the offending text snippet.
  #
  # May throw OpenURI::HTTPError, IO::EAGAINWaitReadable depending on
  # service availability.
  #
  # @param [String] program_name the student's program's name
  # @param [String] locale a two-character ISO 639-1 language code
  def self.find_name_failure(program_name, locale, exceptions: false)
    return nil unless Gatekeeper.allows('webpurify', default: true)

    find_failure(program_name, locale, {}, exceptions: exceptions)
  end

  # Searches for simple sources of PII (personal identifiable information)
  # Returns both the error type and the offending text snippet.
  #
  # If the check is successful, and there were no offenses, the function
  # will return `nil`.
  #
  # This will check for several things:
  #
  # * Emails
  # * Phone Numbers
  # * Street Addresses
  #
  # @param [String] text The text to search through.
  # @return [ShareFailure, nil]
  def self.find_pii_failure(text, exceptions: false)
    email = RegexpUtils.find_potential_email(text)
    share_failure = ShareFailure.new(FailureType::EMAIL, email) if email
    raise PIIFilterException.new("Email PII Filter Violation", share_failure) if share_failure && exceptions
    return share_failure if share_failure

    phone_number = RegexpUtils.find_potential_phone_number(text)
    share_failure = ShareFailure.new(FailureType::PHONE, phone_number) if phone_number
    raise PIIFilterException.new("Phone Number PII Filter Violation", share_failure) if share_failure && exceptions
    return share_failure if share_failure

    street_address = Geocoder.find_potential_street_address(text)
    share_failure = ShareFailure.new(FailureType::ADDRESS, street_address) if street_address
    raise PIIFilterException.new("Address PII Filter Violation", share_failure) if share_failure && exceptions
    return share_failure if share_failure

    nil
  end

  # Searches for profanity in text.
  # Returns both the error type and the offending text snippet.
  #
  # If the check is successful and there were no offenses, the function
  # will return `nil`.
  #
  # @param [String] text The text to search through.
  # @param [String] locale a two-character ISO 639-1 language code
  # @param [Hash] A set of text to replace before performing a profanity check.
  # @return [ShareFailure, nil]
  def self.find_profanity_failure(text, locale, profanity_filter_replace_text_list = {}, exceptions: false)
    expletive = ProfanityFilter.find_potential_profanity(text, locale, profanity_filter_replace_text_list)
    share_failure = ShareFailure.new(FailureType::PROFANITY, expletive) if expletive
    raise ProfanityFilterException.new("Profanity Filter Violation", share_failure) if share_failure && exceptions
    return share_failure if share_failure

    nil
  end

  # Searches for all sources of offenses in text that might be worth flagging.
  # Returns both the error type and the offending text snippet.
  #
  # If the check is successful, and there were no offenses, the function
  # will return `nil`.
  #
  # This will check for several things:
  #
  # * Emails
  # * Phone Numbers
  # * Street Addresses
  # * Profanity
  #
  # @param [String] text The text to search through.
  # @param [String] locale a two-character ISO 639-1 language code
  # @param [Hash] A set of text to replace before performing a profanity check.
  # @return [ShareFailure, nil]
  def self.find_failure(text, locale, profanity_filter_replace_text_list = {}, exceptions: false)
    # We only fail programs when the webpurity service is enabled
    return nil unless Gatekeeper.allows('webpurify', default: true)

    # First, check for PII issues
    pii_failure = find_pii_failure(text, exceptions: exceptions)
    return pii_failure if pii_failure

    # Search for profanity
    profanity_failure = find_profanity_failure(text, locale, profanity_filter_replace_text_list, exceptions: exceptions)
    return profanity_failure if profanity_failure

    nil
  end
end
