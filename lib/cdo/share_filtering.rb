require 'cdo/regexp'
require 'cdo/geocoder'
require 'cdo/web_purify'
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
  def self.find_share_failure(program, locale)
    return nil unless should_filter_program(program)

    xml_tag_regexp = /<[^>]*>/
    program_tags_removed = program.gsub(xml_tag_regexp, "\n")

    email = RegexpUtils.find_potential_email(program_tags_removed)
    return ShareFailure.new(FailureType::EMAIL, email) if email

    street_address = Geocoder.find_potential_street_address(program_tags_removed)
    return ShareFailure.new(FailureType::ADDRESS, street_address) if street_address

    phone_number = RegexpUtils.find_potential_phone_number(program_tags_removed)
    return ShareFailure.new(FailureType::PHONE, phone_number) if phone_number

    expletive = WebPurify.find_potential_profanity(program_tags_removed, ['en', locale])
    return ShareFailure.new(FailureType::PROFANITY, expletive) if expletive

    nil
  end

  def self.should_filter_program(program)
    Gatekeeper.allows('webpurify', default: true) &&
      program =~ /#{PLAYLAB_APP_INDICATOR}/ &&
          program =~ /(#{USER_ENTERED_TEXT_INDICATORS.join('|')})/
  end
end
