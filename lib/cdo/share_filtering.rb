require 'cdo/regexp'
require 'cdo/geocoder'
require 'cdo/web_purify'

USER_ENTERED_TEXT_INDICATORS = ['TITLE', 'TEXT', 'title name\=\"VAL\"']

# Utilities for finding personally-identifiable and profane content in user
# submitted programs.

module ShareFiltering
  module FailureType
    EMAIL = 'email'
    ADDRESS = 'address'
    PHONE = 'phone'
    PROFANITY = 'profanity'
  end

  # Searches for a sharing failure given a program and locale.
  # Returns both the error type and the offending text snippet.
  def self.find_share_failure(program, locale)
    return nil unless program =~ /(#{USER_ENTERED_TEXT_INDICATORS.join('|')})/

    xml_tag_regexp = /<[^>]*>/
    program_tags_removed = program.gsub(xml_tag_regexp, "\n")

    if email = RegexpUtils.find_potential_email(program_tags_removed)
      return FailureType::EMAIL, email, nil
    elsif street_address = Geocoder.find_potential_street_address(program_tags_removed)
      return FailureType::ADDRESS, street_address, nil
    elsif phone_number = RegexpUtils.find_potential_phone_number(program_tags_removed)
      return FailureType::PHONE, phone_number, nil
    elsif expletive = WebPurify.find_potential_profanity(program_tags_removed, ['en', locale])
      return FailureType::PROFANITY, expletive, nil
    end
    return nil, nil
  rescue OpenURI::HTTPError, IO::EAGAINWaitReadable => share_checking_error
    # If WebPurify fails, the program will be allowed
    return nil, nil, share_checking_error
  end
end
