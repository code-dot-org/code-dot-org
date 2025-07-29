require 'cdo/regexp'
require 'cdo/geocoder'
require 'cdo/profanity_filter'
require 'dynamic_config/gatekeeper'

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

  USER_ENTERED_TEXT_FIELDS = ['SPEECH', 'TEXT', 'TEXT1', 'TITLE'].freeze
  FILTERED_PROJECT_TYPES = ['spritelab', 'playlab', 'poetry', 'starwarsblocks'].freeze
  JSON_MAX_DEPTH = 999

  # Searches for a sharing failure given a program and locale.
  # Returns both the error type and the offending text snippet.
  #
  # May throw OpenURI::HTTPError, IO::EAGAINWaitReadable depending on
  # service availability.
  #
  # @param [String] program the student's program text
  # @param [String] locale a two-character ISO 639-1 language code
  # @param [String] project_type
  def self.find_share_failure(program, locale, project_type, exceptions: false)
    # Filter projects geared for young students that accept user-generated text.
    return nil unless should_filter_program(program, project_type)

    texts = extract_text_blockly(program)
    program_text = texts.join(" ")

    find_failure(program_text, locale, exceptions: exceptions)
  end

  # Parses a Blockly program (XML or JSON) and returns an array of text entries.
  # @param program [String] Blockly program (XML or JSON).
  # @return [Array<String>] Text values found in the program. If JSON depth overflow error occurs, returns an empty array.
  def self.extract_text_blockly(program)
    stripped = program.lstrip # Removes all leading whitespace.
    unless stripped.start_with?("{", "[")
      # XML, not JSON. These programs are from Play Lab activity levels.
      # Replace <...> tags with newlines,
      # convert to array of lines split at newline,
      # strip leading/trailing whitespace from each line,
      # drop any blank lines.
      return stripped.gsub(/<[^>]*>/, "\n").split("\n").map(&:strip).reject(&:empty?)
    end

    # Texts will include user-generated block text field values.
    texts = []
    begin
      json = JSON.parse(stripped, max_nesting: DCDO.get('share_filtering_blockly_json_max_depth', JSON_MAX_DEPTH))
    rescue JSON::NestingError
      CDO.log.warn "ShareFiltering.extract_text_blockly: JSON too deep after #{JSON_MAX_DEPTH} levels"
      return texts
    end

    # Traverse each block recursively extracting user-generated field string values via traverse_block.
    json.dig("blocks", "blocks")&.each do |block|
      traverse_block(block, texts)
    end

    # Return a list of all extracted text (no duplicates).
    texts.compact.uniq
  end

  # Clean string values from XML-wrapped field values.
  def self.clean_text_value(value)
    return nil unless value.is_a?(String)

    # Extracts text inside a <field> tag if present and removes all double quotes.
    # Removes double quotes if no field tag is found
    if value =~ /<field name=.*?>(.*?)<\/field>/m
      $1.delete('"')
    else
      value.delete('"')
    end
  end

  # This function recursively traverses a Blockly block, extracting any user-entered text,
  # 'cleans' the text value (strips XML tags & quotes), and then adds the text value
  # to the texts array.
  # For each block it:
  #   1. Iterates through block fields, cleaning and collecting user-generated strings.
  #   2. Recurses into both normal and shadow inputs.
  #   3. Handles sequenced blocks by following the 'next' chain of connections.
  def self.traverse_block(block, texts)
    return unless block.is_a?(Hash)

    fields = block["fields"] || {}
    inputs = block["inputs"] || {}

    fields.each do |key, value|
      if USER_ENTERED_TEXT_FIELDS.include?(key)
        cleaned = clean_text_value(value)
        texts << cleaned if cleaned && !cleaned.strip.empty?
      end
    end

    inputs.each_value do |input|
      traverse_block(input["block"], texts) if input["block"]
      traverse_block(input["shadow"], texts) if input["shadow"]
    end

    # Recurse into the 'next' chain.
    traverse_block(block.dig("next", "block"), texts)
  end

  def self.should_filter_program(program, project_type)
    # Return false early if filtering is disabled or project type not in filter list.
    return false unless Gatekeeper.allows('webpurify', default: true)
    return false unless FILTERED_PROJECT_TYPES.include?(project_type)

    # Only filter if program contains fields that accept user-entered strings.
    return program.match?(/(?:#{USER_ENTERED_TEXT_FIELDS.join('|')})/)
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
