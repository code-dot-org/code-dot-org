require 'geocoder'
require 'open-uri'
require 'json'

module RegexpUtils
  EMAIL_REGEXP = /([^@\s]+@(?:[-a-z0-9]+\.)+[a-z]{2,})/
  US_PHONE_NUMBER_REGEXP = /([\(]?[0-9]{3}[\)]?[-\s\.\_]?[0-9]{3}[-\s\.\_][0-9]{4})/

  def self.find_potential_email(text)
    addresses = text.scan EMAIL_REGEXP
    return addresses.empty? ? nil : addresses.first.first
  end

  def self.find_potential_phone_number(text)
    phone_numbers = text.scan US_PHONE_NUMBER_REGEXP
    return phone_numbers.empty? ? nil : phone_numbers.first.first
  end
end
