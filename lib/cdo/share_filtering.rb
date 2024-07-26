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

  # Searches for a sharing failure given a program and locale.
  # Returns both the error type and the offending text snippet.
  #
  # May throw OpenURI::HTTPError, IO::EAGAINWaitReadable depending on
  # service availability.
  #
  # @param [String] program the student's program text
  # @param [String] locale a two-character ISO 639-1 language code
  def self.find_share_failure(program, locale, exceptions: false)
    return nil unless should_filter_program(program)

    xml_tag_regexp = /<[^>]*>/
    program_tags_removed = program.gsub(xml_tag_regexp, "\n")

    find_failure(program_tags_removed, locale, exceptions: exceptions)
  end

  def self.should_filter_program(program)
    Gatekeeper.allows('webpurify', default: true) &&
      program =~ /#{PLAYLAB_APP_INDICATOR}/o &&
      program =~ /(#{USER_ENTERED_TEXT_INDICATORS.join('|')})/
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
