require 'cdo/regexp'
require 'cdo/geocoder'
require 'cdo/profanity_filter'
require 'dynamic_config/gatekeeper'

USER_ENTERED_TEXT_INDICATORS = ['TITLE', 'TEXT', 'title name\=\"VAL\"'].freeze
PLAYLAB_APP_INDICATOR = 'studio_'.freeze

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
  def self.find_share_failure(program, locale)
    return nil unless should_filter_program(program)

    xml_tag_regexp = /<[^>]*>/
    program_tags_removed = program.gsub(xml_tag_regexp, "\n")

    find_failure(program_tags_removed, locale)
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
  def self.find_name_failure(program_name, locale)
    return nil unless Gatekeeper.allows('webpurify', default: true)

    find_failure(program_name, locale)
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
  def self.find_pii_failure(text)
    email = RegexpUtils.find_potential_email(text)
    return ShareFailure.new(FailureType::EMAIL, email) if email

    phone_number = RegexpUtils.find_potential_phone_number(text)
    return ShareFailure.new(FailureType::PHONE, phone_number) if phone_number

    street_address = Geocoder.find_potential_street_address(text)
    return ShareFailure.new(FailureType::ADDRESS, street_address) if street_address

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
  def self.find_failure(text, locale, profanity_filter_replace_text_list = {})
    # We only fail programs when the webpurity service is enabled
    return nil unless Gatekeeper.allows('webpurify', default: true)

    # First, check for PII issues
    pii_failure = find_pii_failure(text)
    return pii_failure unless pii_failure.nil?

    # Search for profanity
    expletive = ProfanityFilter.find_potential_profanity(text, locale, profanity_filter_replace_text_list)
    return ShareFailure.new(FailureType::PROFANITY, expletive) if expletive

    nil
  end
end
