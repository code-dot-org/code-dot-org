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
      program =~ /#{PLAYLAB_APP_INDICATOR}/ &&
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

  def self.find_failure(text, locale)
    return nil unless Gatekeeper.allows('webpurify', default: true)

    email = RegexpUtils.find_potential_email(text)
    return ShareFailure.new(FailureType::EMAIL, email) if email

    phone_number = RegexpUtils.find_potential_phone_number(text)
    return ShareFailure.new(FailureType::PHONE, phone_number) if phone_number

    expletive = ProfanityFilter.find_potential_profanity(text, locale)
    return ShareFailure.new(FailureType::PROFANITY, expletive) if expletive

    street_address = Geocoder.find_potential_street_address(text)
    return ShareFailure.new(FailureType::ADDRESS, street_address) if street_address

    nil
  end
end
