require 'geocoder'
require 'open-uri'
require 'json'

module RegexpUtils
  EMAIL_REGEXP = /([^@\s]+@(?:[-a-z0-9]+\.)+[a-z]{2,})/

  # Matches obvious phone number formats, but ignores large numbers with no additional symbols.
  US_PHONE_NUMBER_REGEXP = /([\(]?[0-9]{3}[\)]?[-\s\.\_]?[0-9]{3}[-\s\.\_][0-9]{4})/

  # Matches a string that is a likely phone number, including a string of 10 digits
  US_PHONE_NUMBER_ONLY_REGEXP = /^[\(]?(\d{3})[\)]?[-\s\.\_]?(\d{3})[-\s\.\_]?(\d{4})$/

  # returns true if the entire text matches a US phone number
  def self.us_phone_number?(text)
    US_PHONE_NUMBER_ONLY_REGEXP === text
  end

  US_ZIP_CODE_REGEXP = /^\d{5}([\W-]?\d{4})?$/

  # @return true if the entire text matches the format of a US zip code
  # Note it does not verify that it's an actual zip code.
  def self.us_zip_code?(text)
    US_ZIP_CODE_REGEXP === text
  end

  # extracts the 10 digits in a US phone number and returns as a string (without formatting)
  def self.extract_us_phone_number_digits(text)
    match = US_PHONE_NUMBER_ONLY_REGEXP.match(text)
    raise "Not a US phone number: #{text}" unless match
    match.captures.join
  end

  def self.find_potential_email(text)
    addresses = text ? text.scan(EMAIL_REGEXP) : []
    return addresses.empty? ? nil : addresses.first.first
  end

  def self.find_potential_phone_number(text)
    match = US_PHONE_NUMBER_REGEXP.match(text)
    return match.nil? ? nil : match.to_s
  end
end
