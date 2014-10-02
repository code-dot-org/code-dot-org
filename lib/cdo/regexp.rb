require 'geocoder'
require 'open-uri'
require 'json'

TextViolation = Struct.new(:offending_text)
class EmailViolation < TextViolation; end
class StreetAddressViolation < TextViolation; end
class PhoneNumberViolation < TextViolation; end
class ProfanityViolation < TextViolation; end

module RegexpUtils
  EMAIL_REGEXP = /([^@\s]+@(?:[-a-z0-9]+\.)+[a-z]{2,})/
  US_PHONE_NUMBER_REGEXP = /([\(]?[0-9]{3}[\)]?[-\s\.\_]?[0-9]{3}[-\s\.\_][0-9]{4})/

  def self.find_first_text_violation(text, languages = ['en'])
    violation = self.find_potential_email(text)
    violation ||= self.find_potential_street_address(text)
    violation ||= self.find_potential_phone_number(text)
    violation ||= self.find_potential_profanity(text, languages)
    violation
  end

  def self.find_potential_email(text)
    addresses = text.scan EMAIL_REGEXP
    return addresses.empty? ? nil : addresses.first.first
  end

  def self.find_potential_phone_number(text)
    phone_numbers = text.scan US_PHONE_NUMBER_REGEXP
    return phone_numbers.empty? ? nil : phone_numbers.first.first
  end

  def self.find_potential_profanity(text, language_codes = ['en'])
    return nil unless CDO.webpurify_key
    # convert language codes to 2 character, comma separated
    language_codes = language_codes.map{|language_code| language_code[0..1]}.uniq.join(',')
    result = JSON.parse(open("http://api1.webpurify.com/services/rest/?api_key=#{CDO.webpurify_key}&method=webpurify.live.return&text=#{URI.encode(text)}&lang=#{language_codes}&format=json").read)
    if result['rsp'] && result['rsp']['expletive']
      expletive = result['rsp']['expletive']
      expletive = expletive.first if expletive.is_a? Array
      return expletive
    end
    nil
  end
end
